/* ---------------- Custom dropdowns (same pattern as Manage Users) ---------------- */
function setCustomSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".custom-select-value");
  const option = select.querySelector(`.custom-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionCustomSelectMenu(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function wireCustomSelect(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const valueEl = select.querySelector(".custom-select-value");
  const hiddenInput = select.querySelector("input[type=hidden]");

  valueEl.dataset.placeholder = valueEl.textContent.trim();
  hiddenInput.dataset.default = hiddenInput.value;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
    if (willOpen) positionCustomSelectMenu(select);
    select.classList.toggle("open", willOpen);
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-select-option");
    if (!option) return;
    setCustomSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
}

function initCustomSelects(root = document) {
  root.querySelectorAll(".custom-select").forEach(wireCustomSelect);

  document.addEventListener("click", closeAllCustomSelects);
  document.addEventListener("scroll", closeAllCustomSelects, true);
  window.addEventListener("resize", closeAllCustomSelects);
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

initCustomSelects();

/* ---------------- Form validation ---------------- */
const form = document.getElementById("registrationForm");
const submitBtn = document.getElementById("registerPatientBtn");
const required = ["firstName", "lastName", "mrn", "email", "emailLanguage"];

function validateForm() {
  const valid = required.every((name) => form[name].value.trim() !== "");
  submitBtn.disabled = !valid;
  submitBtn.classList.toggle("enabled", valid);
}

form.addEventListener("input", validateForm);
form.addEventListener("change", validateForm);
validateForm();

const regFormWrap = document.getElementById("regFormWrap");
const regSuccessPanel = document.getElementById("regSuccessPanel");
const registerAnotherBtn = document.getElementById("registerAnotherBtn");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;
  regFormWrap.style.display = "none";
  regSuccessPanel.style.display = "block";
});

registerAnotherBtn.addEventListener("click", () => {
  form.reset();
  document.getElementById("vitalsGrid")?.remove();
  addVitalsBtn.style.display = "";
  form.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
  validateForm();
  regSuccessPanel.style.display = "none";
  regFormWrap.style.display = "";
});

/* ---------------- Add initial vitals ---------------- */
const addVitalsBtn = document.getElementById("addInitialVitals");
addVitalsBtn.addEventListener("click", () => {
  if (document.getElementById("vitalsGrid")) return;

  const vitalsGrid = document.createElement("div");
  vitalsGrid.id = "vitalsGrid";
  vitalsGrid.className = "reg-grid";
  vitalsGrid.innerHTML = `
    <div class="reg-field">
      <label>Weight (kg)</label>
      <input type="number" name="weight" placeholder="Weight" />
    </div>
    <div class="reg-field">
      <label>Heart rate (bpm)</label>
      <input type="number" name="heartRate" placeholder="Heart rate" />
    </div>
    <div class="reg-field">
      <label>Blood pressure</label>
      <input type="text" name="bloodPressure" placeholder="e.g. 120/80" />
    </div>`;

  addVitalsBtn.insertAdjacentElement("afterend", vitalsGrid);
  addVitalsBtn.style.display = "none";
});

/* ---------------- Manual Entry / Import from EHR toggle ---------------- */
const manualModeBtn = document.getElementById("manualModeBtn");
const ehrModeBtn = document.getElementById("ehrModeBtn");
const ehrImportPanel = document.getElementById("ehrImportPanel");

manualModeBtn.addEventListener("click", () => {
  manualModeBtn.classList.add("active");
  ehrModeBtn.classList.remove("active");
  form.style.display = "block";
  ehrImportPanel.style.display = "none";
});

ehrModeBtn.addEventListener("click", () => {
  ehrModeBtn.classList.add("active");
  manualModeBtn.classList.remove("active");
  form.style.display = "none";
  ehrImportPanel.style.display = "block";
});

/* ---------------- Import from EHR: search + select + import ---------------- */
const EHR_RESULTS = [
  { name: "Sarah White", mrn: "ECW-88213", dob: "04/12/1958" },
  { name: "Ben Carter", mrn: "ECW-40217", dob: "11/02/1946" },
  { name: "John Doe", mrn: "ECW-40165", dob: "01/06/1957" }
];

const ehrSearchBtn = document.getElementById("ehrSearchBtn");
const ehrResultsEmpty = document.getElementById("ehrResultsEmpty");
const ehrResultsWrap = document.getElementById("ehrResultsWrap");
const ehrResultsList = document.getElementById("ehrResultsList");
const ehrSelectAll = document.getElementById("ehrSelectAll");
const ehrSelectedCount = document.getElementById("ehrSelectedCount");
const ehrImportBtn = document.getElementById("ehrImportBtn");

function updateEhrSelection() {
  const rowChecks = ehrResultsList.querySelectorAll(".bill-checkbox");
  const checkedCount = ehrResultsList.querySelectorAll(".bill-checkbox.checked").length;

  ehrSelectedCount.textContent = `${checkedCount} selected`;
  ehrSelectAll.classList.toggle("checked", rowChecks.length > 0 && checkedCount === rowChecks.length);

  ehrImportBtn.disabled = checkedCount === 0;
  ehrImportBtn.classList.toggle("enabled", checkedCount > 0);
}

ehrSearchBtn.addEventListener("click", () => {
  ehrResultsList.innerHTML = "";
  EHR_RESULTS.forEach((patient) => {
    const row = document.createElement("label");
    row.className = "ehr-result-row";
    row.innerHTML = `
      <span class="bill-checkbox"></span>
      <span class="ehr-result-info">
        <span class="lt-name active-name">${patient.name}</span>
        <span class="status-since">MRN ${patient.mrn} &middot; DOB ${patient.dob}</span>
      </span>`;
    row.addEventListener("click", () => {
      row.querySelector(".bill-checkbox").classList.toggle("checked");
      updateEhrSelection();
    });
    ehrResultsList.appendChild(row);
  });

  ehrResultsEmpty.style.display = "none";
  ehrResultsWrap.style.display = "block";
  updateEhrSelection();
});

ehrSelectAll.addEventListener("click", () => {
  const willCheck = !ehrSelectAll.classList.contains("checked");
  ehrResultsList.querySelectorAll(".bill-checkbox").forEach((box) => box.classList.toggle("checked", willCheck));
  updateEhrSelection();
});

ehrImportBtn.addEventListener("click", () => {
  if (ehrImportBtn.disabled) return;
  ehrImportBtn.textContent = "Patient Imported";
});

