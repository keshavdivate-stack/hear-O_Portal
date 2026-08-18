const warnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272E"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const billingList = [
  { name: "Sara White",    id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Dan Vax",       id: "857 125 968", enrolled: "05.14.2023", time: "40 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { name: "Marik Shmil",   id: "857 125 968", enrolled: "05.14.2023", time: "25 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Alex Martin",   id: "857 125 968", enrolled: "05.14.2023", time: "43 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { name: "Jonathan Flux", id: "857 125 968", enrolled: "05.14.2023", time: "20 Min", status: "not",
    codes: [ {t:"pending"}, {t:"not", sub:"Complete on 01.01.2026", warn:true}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Igor Moris",    id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "not",
    codes: [ {t:"na"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sara Apple",    id: "857 125 968", enrolled: "05.14.2023", time: "12 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Abe Lol",       id: "857 125 968", enrolled: "05.14.2023", time: "15 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Annie Jow",     id: "857 125 968", enrolled: "05.14.2023", time: "16 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sandra Sade",   id: "857 125 968", enrolled: "05.14.2023", time: "8 Min",  status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "John Dillan",   id: "857 125 968", enrolled: "05.14.2023", time: "11 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sara Prker",    id: "857 125 968", enrolled: "05.14.2023", time: "9 Min",  status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
];

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
  return `<div class="bill-elig-cell"><span class="elig-label elig-pending">N/A</span></div>`;
}

function statusCell(status) {
  return status === "ready"
    ? `<span class="bill-status bill-status-ready">Ready for billing</span>`
    : `<span class="bill-status bill-status-not">Not eligible</span>`;
}

const rowsEl = document.getElementById("billingRows");
rowsEl.innerHTML = billingList
  .map(
    (b) => `
    <tr>
      <td><span class="bill-checkbox row-check"></span></td>
      <td><span class="lt-name active-name">${b.name}</span></td>
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
          <button class="action-icon kebab" aria-label="More">${kebabIcon}</button>
        </div>
      </td>
    </tr>`
  )
  .join("");

const exportReportBtn = document.getElementById("exportReportBtn");
const exportFormatPopover = document.getElementById("exportFormatPopover");

function updateExportBtnState() {
  const anySelected = document.querySelectorAll(".row-check.checked").length > 0;
  exportReportBtn.disabled = !anySelected;
  exportReportBtn.title = anySelected ? "Export Report" : "Select at least one row to export";
  if (!anySelected) exportFormatPopover.classList.remove("open");
}

document.querySelectorAll(".bill-checkbox").forEach((box) => {
  box.addEventListener("click", () => {
    box.classList.toggle("checked");
    updateExportBtnState();
  });
});

document.getElementById("selectAllBox").addEventListener("click", function () {
  const checked = this.classList.contains("checked");
  document.querySelectorAll(".row-check").forEach((box) => box.classList.toggle("checked", checked));
  updateExportBtnState();
});

wireTopbarToggle("exportReportBtn", "exportFormatPopover");

exportFormatPopover.querySelectorAll(".more-menu-item").forEach((item) => {
  item.addEventListener("click", () => {
    exportFormatPopover.classList.remove("open");
  });
});

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
});

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
