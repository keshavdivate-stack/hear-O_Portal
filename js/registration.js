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

function initCustomSelects() {
  document.querySelectorAll(".custom-select").forEach((select) => {
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
  });

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

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;
  submitBtn.textContent = "Patient Registered";
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
