/* Backoffice-safe fork of ../../js/billing.js. Why forked instead of shared:
   the root file's billingList embeds real patient names directly in its
   render logic. Only the `name` field is changed here (real name -> a
   same-format placeholder Patient ID, since billing's own "id" column is a
   shared placeholder MRN, not a per-patient identifier reused from
   patientList); the eligibility-code cells, billing-status cells, and the
   Schedule Billing Report modal are all administrative/aggregate and are
   otherwise unchanged from the root file. */

const warnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272E"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const billingList = [
  { patientId: "ABC-1301", id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "ready", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1302", id: "857 125 968", enrolled: "05.14.2023", time: "40 Min", status: "ready", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { patientId: "ABC-1303", id: "857 125 968", enrolled: "05.14.2023", time: "25 Min", status: "ready", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1304", id: "857 125 968", enrolled: "05.14.2023", time: "43 Min", status: "ready", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { patientId: "ABC-1305", id: "857 125 968", enrolled: "05.14.2023", time: "20 Min", status: "not", period: "2026-01",
    codes: [ {t:"pending"}, {t:"not", sub:"Complete on 01.01.2026", warn:true}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1306", id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "not", period: "2026-01",
    codes: [ {t:"na"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1307", id: "857 125 968", enrolled: "05.14.2023", time: "12 Min", status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1222", id: "857 125 968", enrolled: "05.14.2023", time: "15 Min", status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1308", id: "857 125 968", enrolled: "05.14.2023", time: "16 Min", status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1309", id: "857 125 968", enrolled: "05.14.2023", time: "8 Min",  status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1310", id: "857 125 968", enrolled: "05.14.2023", time: "11 Min", status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { patientId: "ABC-1311", id: "857 125 968", enrolled: "05.14.2023", time: "9 Min",  status: "not", period: "2026-01",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
];

const ELIGIBILITY_OPTIONS = [
  { key: "eligible", label: "Eligible" },
  { key: "not", label: "Not Eligible" },
  { key: "pending", label: "Pending" },
  { key: "na", label: "N/A" },
];
const BILLING_STATUS_OPTIONS = [
  { key: "ready", label: "Ready for billing" },
  { key: "not", label: "Not eligible" },
];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const selectedEligibilityCodes = new Set();
const selectedBillingStatuses = new Set();
let selectedBillingMonth = "2026-01";

function codeCell(c) {
  if (c.t === "eligible") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-eligible">Eligible</span><span class="elig-sub">${c.sub}</span></div>`;
  }
  if (c.t === "not") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-not">${c.warn ? warnIcon + " " : ""}Not Eligible</span><span class="elig-sub">${c.sub}</span></div>`;
  }
  if (c.t === "pending") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-pending">Pending</span></div>`;
  }
  return `<div class="bill-elig-cell"><span class="elig-label elig-na">N/A</span></div>`;
}

function statusCell(status) {
  return status === "ready"
    ? `<span class="bill-status bill-status-ready">Ready for billing</span>`
    : `<span class="bill-status bill-status-not">Not eligible</span>`;
}

function filteredBillingList() {
  const search = document.getElementById("searchInput").value.trim().toLowerCase();
  return billingList.filter(
    (b) =>
      (!search || b.patientId.toLowerCase().includes(search)) &&
      (!selectedEligibilityCodes.size || b.codes.some((c) => selectedEligibilityCodes.has(c.t))) &&
      (!selectedBillingStatuses.size || selectedBillingStatuses.has(b.status)) &&
      (!selectedBillingMonth || b.period === selectedBillingMonth)
  );
}

const rowsEl = document.getElementById("billingRows");

function renderBillingRows() {
  rowsEl.innerHTML = filteredBillingList()
    .map(
      (b) => `
    <tr data-patient="${b.patientId}">
      <td><span class="bill-checkbox row-check${b.codes[0].t === "pending" ? " disabled" : ""}"></span></td>
      <td><span class="lt-name active-name">${b.patientId}</span></td>
      <td>${b.id}</td>
      <td>${b.enrolled}</td>
      <td>${codeCell(b.codes[0])}</td>
      <td>${codeCell(b.codes[1])}</td>
      <td>${codeCell(b.codes[2])}</td>
      <td>${codeCell(b.codes[3])}</td>
      <td>${b.time}</td>
      <td>${statusCell(b.status)}</td>
      <td>
        <div class="action-cell">
          <button class="action-icon" aria-label="Edit">${pencilIcon}</button>
          <button class="action-icon kebab row-menu-trigger" aria-label="More" data-patient="${b.patientId}">${kebabIcon}</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
  updateExportBtnState();
}

const exportReportBtn = document.getElementById("exportReportBtn");
const exportFormatPopover = document.getElementById("exportFormatPopover");

function updateExportBtnState() {
  const anySelected = document.querySelectorAll(".row-check.checked").length > 0;
  exportReportBtn.disabled = !anySelected;
  exportReportBtn.title = anySelected ? "Export Report" : "Select at least one row to export";
  if (!anySelected) exportFormatPopover.classList.remove("open");
}

function goToTimeLog(patientId) {
  window.location.href = `time-log.html?patient=${encodeURIComponent(patientId)}`;
}

rowsEl.addEventListener("click", (e) => {
  const checkbox = e.target.closest(".bill-checkbox");
  if (checkbox) {
    if (!checkbox.classList.contains("disabled")) checkbox.classList.toggle("checked");
    updateExportBtnState();
    return;
  }

  const trigger = e.target.closest(".row-menu-trigger");
  if (trigger) {
    e.stopPropagation();
    openBillingRowMenuFor(trigger.dataset.patient, trigger);
    return;
  }

  if (e.target.closest(".action-cell")) return;

  const tr = e.target.closest("tr[data-patient]");
  if (tr) goToTimeLog(tr.dataset.patient);
});

document.getElementById("selectAllBox").addEventListener("click", function () {
  const checked = this.classList.contains("checked");
  document.querySelectorAll(".row-check:not(.disabled)").forEach((box) => box.classList.toggle("checked", checked));
  updateExportBtnState();
});

wireTopbarToggle("exportReportBtn", "exportFormatPopover");

exportFormatPopover.querySelectorAll(".more-menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    exportFormatPopover.classList.remove("open");
  });
});

document.getElementById("searchInput").addEventListener("input", renderBillingRows);

/* ---------------- Checkbox filter menus (Eligibility Code / Billing Status) ---------------- */
const portaledFilterMenus = new Map();

function positionFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = "0px";
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";

  const margin = 12;
  const menuWidth = menu.offsetWidth;
  let left = rect.left;
  if (left + menuWidth + margin > window.innerWidth) {
    left = Math.max(margin, rect.right - menuWidth);
  }
  menu.style.left = `${left}px`;
}

function openFilterMenu(wrapEl, menuEl) {
  if (!portaledFilterMenus.has(menuEl)) {
    portaledFilterMenus.set(menuEl, { parent: menuEl.parentNode, next: menuEl.nextSibling });
  }
  document.body.appendChild(menuEl);
  menuEl.classList.add("checkbox-filter-menu-portaled");
  positionFilterMenu(wrapEl.querySelector(".filter-btn"), menuEl);
}

function closeFilterMenu(menuEl) {
  const original = portaledFilterMenus.get(menuEl);
  if (original && menuEl.parentNode === document.body) {
    if (original.next && original.next.parentNode === original.parent) {
      original.parent.insertBefore(menuEl, original.next);
    } else {
      original.parent.appendChild(menuEl);
    }
  }
  menuEl.classList.remove("checkbox-filter-menu-portaled");
  menuEl.style.position = "";
  menuEl.style.left = "";
  menuEl.style.top = "";
  menuEl.style.bottom = "";
  menuEl.style.minWidth = "";
}

function wireCheckboxFilter(wrapEl, menuEl, selectedSet, onChange) {
  const trigger = wrapEl.querySelector(".filter-btn");
  const label = wrapEl.querySelector(".checkbox-filter-label");
  const baseLabel = label.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrapEl.classList.contains("open");
    closeAllFilterPopovers();
    wrapEl.classList.toggle("open", willOpen);
    if (willOpen) openFilterMenu(wrapEl, menuEl);
  });

  menuEl.addEventListener("click", (e) => e.stopPropagation());

  menuEl.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selectedSet.add(checkbox.value);
    else selectedSet.delete(checkbox.value);

    label.textContent = selectedSet.size ? `${baseLabel} (${selectedSet.size})` : baseLabel;
    onChange();
  });
}

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeFilterMenu(menuEl));
}

document.addEventListener("click", closeAllFilterPopovers);

const eligibilityCodeMenu = document.getElementById("eligibilityCodeMenu");
eligibilityCodeMenu.innerHTML = ELIGIBILITY_OPTIONS.map((o) => `<label class="checkbox-filter-option"><input type="checkbox" value="${o.key}" />${o.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="eligibilityCode"]'), eligibilityCodeMenu, selectedEligibilityCodes, renderBillingRows);

const billingStatusMenu = document.getElementById("billingStatusMenu");
billingStatusMenu.innerHTML = BILLING_STATUS_OPTIONS.map((o) => `<label class="checkbox-filter-option"><input type="checkbox" value="${o.key}" />${o.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="billingStatus"]'), billingStatusMenu, selectedBillingStatuses, renderBillingRows);

/* ---------------- Month/year filter ---------------- */
function pad2(n) { return String(n).padStart(2, "0"); }

const monthWrap = document.querySelector('.checkbox-filter[data-name="month"]');
const monthMenu = document.getElementById("monthMenu");
const monthFilterLabel = document.getElementById("monthFilterLabel");
let monthViewYear = 2026;

function renderMonthMenu() {
  const [selYear, selMonth] = selectedBillingMonth ? selectedBillingMonth.split("-").map(Number) : [null, null];
  monthMenu.innerHTML = `
    <div class="calendar-head">
      <span class="calendar-month-label">${monthViewYear}</span>
      <div class="calendar-nav">
        <button type="button" class="calendar-nav-btn" data-nav="-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        <button type="button" class="calendar-nav-btn" data-nav="1"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      </div>
    </div>
    <div class="month-grid">
      ${MONTH_LABELS.map((label, i) => {
        const isSelected = selYear === monthViewYear && selMonth === i + 1;
        return `<div class="month-cell${isSelected ? " selected" : ""}" data-month="${i + 1}">${label}</div>`;
      }).join("")}
    </div>
    <div class="calendar-footer">
      <button type="button" class="calendar-footer-btn" data-action="clear">Clear</button>
    </div>
  `;
}

monthWrap.querySelector(".filter-btn").addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !monthWrap.classList.contains("open");
  closeAllFilterPopovers();
  monthWrap.classList.toggle("open", willOpen);
  if (willOpen) {
    renderMonthMenu();
    openFilterMenu(monthWrap, monthMenu);
  }
});

monthMenu.addEventListener("click", (e) => {
  e.stopPropagation();

  const navBtn = e.target.closest(".calendar-nav-btn");
  if (navBtn) {
    monthViewYear += Number(navBtn.dataset.nav);
    renderMonthMenu();
    positionFilterMenu(monthWrap.querySelector(".filter-btn"), monthMenu);
    return;
  }

  const monthCell = e.target.closest(".month-cell");
  if (monthCell) {
    selectedBillingMonth = `${monthViewYear}-${pad2(Number(monthCell.dataset.month))}`;
    monthFilterLabel.textContent = `${MONTH_LABELS[Number(monthCell.dataset.month) - 1]}. ${monthViewYear}`;
    monthWrap.classList.remove("open");
    closeFilterMenu(monthMenu);
    renderBillingRows();
    return;
  }

  const clearBtn = e.target.closest('[data-action="clear"]');
  if (clearBtn) {
    selectedBillingMonth = null;
    monthFilterLabel.textContent = "Month";
    monthWrap.classList.remove("open");
    closeFilterMenu(monthMenu);
    renderBillingRows();
  }
});

/* ---------------- Clear all filters ---------------- */
document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";

  [
    { menu: eligibilityCodeMenu, set: selectedEligibilityCodes, wrap: document.querySelector('.checkbox-filter[data-name="eligibilityCode"]'), label: "Eligibility Code" },
    { menu: billingStatusMenu, set: selectedBillingStatuses, wrap: document.querySelector('.checkbox-filter[data-name="billingStatus"]'), label: "Billing Status" },
  ].forEach(({ menu, set, wrap, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    wrap.querySelector(".checkbox-filter-label").textContent = label;
  });

  selectedBillingMonth = null;
  monthFilterLabel.textContent = "Month";

  renderBillingRows();
});

renderBillingRows();

/* ---------------- Custom dropdowns (same pattern as Registration) ---------------- */
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
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

document.addEventListener("click", closeAllCustomSelects);
document.addEventListener("scroll", closeAllCustomSelects, true);
window.addEventListener("resize", closeAllCustomSelects);

initCustomSelects();

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

/* ---------------- Schedule Billing Report modal ---------------- */
const scheduleBillingReportOverlay = document.getElementById("scheduleBillingReportOverlay");
const scheduleBillingReportForm = document.getElementById("scheduleBillingReportForm");
const saveScheduleBillingReport = document.getElementById("saveScheduleBillingReport");
const scheduleBillingReportRequired = ["reportType", "reportPeriod", "scheduleFrequency"];

function validateScheduleBillingReportForm() {
  const valid = scheduleBillingReportRequired.every((name) => scheduleBillingReportForm[name].value.trim() !== "");
  saveScheduleBillingReport.disabled = !valid;
  saveScheduleBillingReport.classList.toggle("enabled", valid);
}

scheduleBillingReportForm.addEventListener("input", validateScheduleBillingReportForm);
scheduleBillingReportForm.addEventListener("change", validateScheduleBillingReportForm);

function openScheduleBillingReportModal() {
  scheduleBillingReportForm.reset();
  resetCustomSelectsIn(scheduleBillingReportForm);
  validateScheduleBillingReportForm();
  scheduleBillingReportOverlay.classList.add("open");
}

function closeScheduleBillingReportModal() {
  scheduleBillingReportOverlay.classList.remove("open");
}

document.getElementById("scheduleBillingReportBtn").addEventListener("click", openScheduleBillingReportModal);
document.getElementById("cancelScheduleBillingReport").addEventListener("click", closeScheduleBillingReportModal);
scheduleBillingReportOverlay.addEventListener("click", (e) => { if (e.target === scheduleBillingReportOverlay) closeScheduleBillingReportModal(); });

scheduleBillingReportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveScheduleBillingReport.disabled) return;
  closeScheduleBillingReportModal();
});

/* ---------------- Row action dropdown ---------------- */
const billingRowMenu = document.getElementById("billingRowMenu");
let activeRowPatientId = null;

function openBillingRowMenuFor(patientId, trigger) {
  activeRowPatientId = patientId;
  const rect = trigger.getBoundingClientRect();
  billingRowMenu.style.top = `${rect.bottom + 6}px`;
  billingRowMenu.style.left = `${rect.right - 190}px`;
  billingRowMenu.classList.add("open");
}

document.addEventListener("click", (e) => {
  if (!billingRowMenu.contains(e.target)) billingRowMenu.classList.remove("open");
});

billingRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item || activeRowPatientId === null) return;
  billingRowMenu.classList.remove("open");

  if (item.dataset.action === "initialTraining") openInitialTrainingModal();
  else if (item.dataset.action === "timeLog") goToTimeLog(activeRowPatientId);
});

/* ---------------- Initial Training Confirmation modal ---------------- */
const initialTrainingOverlay = document.getElementById("initialTrainingOverlay");
const initialTrainingCheckbox = document.getElementById("initialTrainingConfirmCheckbox");
const trainingProviderSelect = document.getElementById("trainingProviderSelect");
const trainingProviderInput = trainingProviderSelect.querySelector('input[type=hidden]');
const saveInitialTraining = document.getElementById("saveInitialTraining");

function validateInitialTrainingForm() {
  const valid = initialTrainingCheckbox.checked && trainingProviderInput.value !== "";
  saveInitialTraining.disabled = !valid;
  saveInitialTraining.classList.toggle("enabled", valid);
}

initialTrainingCheckbox.addEventListener("change", validateInitialTrainingForm);
trainingProviderInput.addEventListener("change", validateInitialTrainingForm);

function openInitialTrainingModal() {
  initialTrainingCheckbox.checked = false;
  setCustomSelectValue(trainingProviderSelect, "", { silent: true });
  validateInitialTrainingForm();
  initialTrainingOverlay.classList.add("open");
}

function closeInitialTrainingModal() {
  initialTrainingOverlay.classList.remove("open");
}

document.getElementById("cancelInitialTraining").addEventListener("click", closeInitialTrainingModal);
initialTrainingOverlay.addEventListener("click", (e) => { if (e.target === initialTrainingOverlay) closeInitialTrainingModal(); });

saveInitialTraining.addEventListener("click", () => {
  if (saveInitialTraining.disabled) return;
  closeInitialTrainingModal();
});
