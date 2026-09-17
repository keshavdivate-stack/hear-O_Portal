/* Time Log: reached from a Billing row (js/billing.js sets ?patient=<name>
   when navigating here). Shows per-visit time entries behind that patient's
   logged minutes. */

const trashIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

const params = new URLSearchParams(window.location.search);
const currentPatientId = params.get("patient") || "Sara White";
document.getElementById("tlPatientLabel").textContent = `${currentPatientId} | Time Log`;

const LOG_NAME_OPTIONS = ["Patient Data Review", "Care Coordination", "Chart Review", "Patient Outreach", "Other"];
const LOGGED_BY_OPTIONS = ["pranalii tanpure", "Emily Carter", "Dr. Sarah Mitchell", "Dr. James Carter", "Amanda Lee, RN", "Ayelet Er, NP"];
const LOG_TYPE_OPTIONS = ["Automatic", "Manual"];
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let timeLogList = [
  { id: "TRQ2X4PR9P", name: "Patient Data Review", monthKey: "2026-09", timestamp: "09/01/2026, 03:11 PM", loggedBy: "pranalii tanpure", duration: "00:00:01", durationSeconds: 1, start: "09/01/2026, 03:08:47 PM", end: "09/01/2026, 03:08:58 PM", type: "Automatic", notes: "Reviewing Patient Data" },
  { id: "TDGU83DMB3", name: "Patient Data Review", monthKey: "2026-09", timestamp: "09/01/2026, 01:57 PM", loggedBy: "pranalii tanpure", duration: "00:00:01", durationSeconds: 1, start: "09/01/2026, 01:55:14 PM", end: "09/01/2026, 01:55:15 PM", type: "Automatic", notes: "Reviewing Patient Data" },
];

const selectedLogNames = new Set();
const selectedLoggedBy = new Set();
const selectedLogTypes = new Set();
let selectedMonth = "2026-09";
let currentPage = 1;
const pageSize = 25;

function pad2(n) { return String(n).padStart(2, "0"); }

function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function filteredTimeLogList() {
  return timeLogList.filter(
    (t) =>
      (!selectedLogNames.size || selectedLogNames.has(t.name)) &&
      (!selectedLoggedBy.size || selectedLoggedBy.has(t.loggedBy)) &&
      (!selectedLogTypes.size || selectedLogTypes.has(t.type)) &&
      (!selectedMonth || t.monthKey === selectedMonth)
  );
}

const rows = document.getElementById("timeLogRows");
const pageRangeLabel = document.getElementById("tlPageRangeLabel");
const totalTimeEl = document.getElementById("tlTotalTime");

function renderTimeLog() {
  const list = filteredTimeLogList();

  const totalSeconds = list.reduce((sum, t) => sum + t.durationSeconds, 0);
  totalTimeEl.textContent = formatDuration(totalSeconds);

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  rows.innerHTML = pageItems
    .map(
      (t) => `
      <tr data-id="${t.id}">
        <td>${t.id}</td>
        <td>${t.name}</td>
        <td>${t.timestamp}</td>
        <td>${t.loggedBy}</td>
        <td>${t.duration}</td>
        <td><span class="tl-cell-trunc" title="${t.start}">${t.start}</span></td>
        <td><span class="tl-cell-trunc" title="${t.end}">${t.end}</span></td>
        <td>${t.type}</td>
        <td><span class="tl-cell-trunc" title="${t.notes}">${t.notes}</span></td>
        <td><button class="action-icon tl-delete-btn" aria-label="Delete" data-id="${t.id}">${trashIcon}</button></td>
      </tr>`
    )
    .join("");

  const rangeEnd = list.length === 0 ? 0 : Math.min(start + pageSize, list.length);
  const rangeStart = list.length === 0 ? 0 : start + 1;
  pageRangeLabel.textContent = `${rangeStart} – ${rangeEnd} of ${list.length}`;

  document.getElementById("tlFirstPage").disabled = currentPage <= 1;
  document.getElementById("tlPrevPage").disabled = currentPage <= 1;
  document.getElementById("tlNextPage").disabled = currentPage >= totalPages;
  document.getElementById("tlLastPage").disabled = currentPage >= totalPages;
}

document.getElementById("tlFirstPage").addEventListener("click", () => { currentPage = 1; renderTimeLog(); });
document.getElementById("tlPrevPage").addEventListener("click", () => { currentPage = Math.max(1, currentPage - 1); renderTimeLog(); });
document.getElementById("tlNextPage").addEventListener("click", () => { currentPage += 1; renderTimeLog(); });
document.getElementById("tlLastPage").addEventListener("click", () => { currentPage = Math.max(1, Math.ceil(filteredTimeLogList().length / pageSize)); renderTimeLog(); });

/* ---------------- Delete row ---------------- */
const deleteLogOverlay = document.getElementById("deleteLogOverlay");
const deleteLogIdEl = document.getElementById("deleteLogId");
let pendingDeleteId = null;

function openDeleteLogModal(id) {
  pendingDeleteId = id;
  deleteLogIdEl.textContent = `#${id}`;
  deleteLogOverlay.classList.add("open");
}

function closeDeleteLogModal() {
  deleteLogOverlay.classList.remove("open");
  pendingDeleteId = null;
}

document.getElementById("cancelDeleteLog").addEventListener("click", closeDeleteLogModal);
deleteLogOverlay.addEventListener("click", (e) => { if (e.target === deleteLogOverlay) closeDeleteLogModal(); });

document.getElementById("confirmDeleteLog").addEventListener("click", () => {
  if (!pendingDeleteId) return;
  timeLogList = timeLogList.filter((t) => t.id !== pendingDeleteId);
  closeDeleteLogModal();
  renderTimeLog();
});

rows.addEventListener("click", (e) => {
  const delBtn = e.target.closest(".tl-delete-btn");
  if (!delBtn) return;
  openDeleteLogModal(delBtn.dataset.id);
});

renderTimeLog();

/* ---------------- Checkbox filter menus (Log Name / Logged By / Log Type) ---------------- */
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

function resetFilterOnPageChange() {
  currentPage = 1;
  renderTimeLog();
}

const logNameMenu = document.getElementById("logNameMenu");
logNameMenu.innerHTML = LOG_NAME_OPTIONS.map((v) => `<label class="checkbox-filter-option"><input type="checkbox" value="${v}" />${v}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="logName"]'), logNameMenu, selectedLogNames, resetFilterOnPageChange);

const loggedByMenu = document.getElementById("loggedByMenu");
loggedByMenu.innerHTML = LOGGED_BY_OPTIONS.map((v) => `<label class="checkbox-filter-option"><input type="checkbox" value="${v}" />${v}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="loggedBy"]'), loggedByMenu, selectedLoggedBy, resetFilterOnPageChange);

const logTypeMenu = document.getElementById("logTypeMenu");
logTypeMenu.innerHTML = LOG_TYPE_OPTIONS.map((v) => `<label class="checkbox-filter-option"><input type="checkbox" value="${v}" />${v}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="logType"]'), logTypeMenu, selectedLogTypes, resetFilterOnPageChange);

/* ---------------- Month/year filter ---------------- */
const monthWrap = document.querySelector('.checkbox-filter[data-name="month"]');
const monthMenu = document.getElementById("monthMenu");
const monthFilterLabel = document.getElementById("monthFilterLabel");
let monthViewYear = 2026;

function renderMonthMenu() {
  const [selYear, selMonth] = selectedMonth ? selectedMonth.split("-").map(Number) : [null, null];
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
    selectedMonth = `${monthViewYear}-${pad2(Number(monthCell.dataset.month))}`;
    monthFilterLabel.textContent = `${MONTH_LABELS[Number(monthCell.dataset.month) - 1]} ${monthViewYear}`;
    monthWrap.classList.remove("open");
    closeFilterMenu(monthMenu);
    resetFilterOnPageChange();
    return;
  }

  const clearBtn = e.target.closest('[data-action="clear"]');
  if (clearBtn) {
    selectedMonth = null;
    monthFilterLabel.textContent = "Month";
    monthWrap.classList.remove("open");
    closeFilterMenu(monthMenu);
    resetFilterOnPageChange();
  }
});

/* ---------------- Clear all filters ---------------- */
const clearableFilters = [
  { menu: logNameMenu, set: selectedLogNames, wrap: document.querySelector('.checkbox-filter[data-name="logName"]'), label: "Log Name" },
  { menu: loggedByMenu, set: selectedLoggedBy, wrap: document.querySelector('.checkbox-filter[data-name="loggedBy"]'), label: "Logged By" },
  { menu: logTypeMenu, set: selectedLogTypes, wrap: document.querySelector('.checkbox-filter[data-name="logType"]'), label: "Log Type" },
];

document.getElementById("clearFilters").addEventListener("click", () => {
  clearableFilters.forEach(({ menu, set, wrap, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    wrap.querySelector(".checkbox-filter-label").textContent = label;
  });
  selectedMonth = null;
  monthFilterLabel.textContent = "Month";
  resetFilterOnPageChange();
});

/* ---------------- Export popover (same pattern as Billing) ---------------- */
wireTopbarToggle("exportReportBtn", "exportFormatPopover");
document.querySelectorAll("#exportFormatPopover .more-menu-item").forEach((item) => {
  item.addEventListener("click", () => document.getElementById("exportFormatPopover").classList.remove("open"));
});

/* ---------------- Custom dropdowns (same pattern as Billing / Patient List) ---------------- */
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

document.querySelectorAll(".custom-select").forEach(wireCustomSelect);

document.addEventListener("click", () => document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open")));
document.addEventListener("scroll", () => document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open")), true);
window.addEventListener("resize", () => document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open")));

/* ---------------- Add Time Log modal ---------------- */
const addTimeLogOverlay = document.getElementById("addTimeLogOverlay");
const addTimeLogForm = document.getElementById("addTimeLogForm");
const saveAddTimeLog = document.getElementById("saveAddTimeLog");
const tlDateInput = document.getElementById("tlDateInput");
const tlComputedDuration = document.getElementById("tlComputedDuration");
const logNameSelect = document.getElementById("tlLogNameSelect");
const loggedBySelect = document.getElementById("tlLoggedBySelect");

document.querySelectorAll(".ampm-toggle").forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    const btn = e.target.closest(".ampm-btn");
    if (!btn) return;
    toggle.querySelectorAll(".ampm-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    updateComputedDuration();
  });
});

function clampTimeInput(input, max) {
  input.addEventListener("input", () => {
    let v = parseInt(input.value, 10);
    if (isNaN(v)) v = 0;
    v = Math.max(0, Math.min(max, v));
    input.value = pad2(v);
    updateComputedDuration();
  });
}

clampTimeInput(addTimeLogForm.startH, 23);
clampTimeInput(addTimeLogForm.startM, 59);
clampTimeInput(addTimeLogForm.startS, 59);
clampTimeInput(addTimeLogForm.endH, 23);
clampTimeInput(addTimeLogForm.endM, 59);
clampTimeInput(addTimeLogForm.endS, 59);

function to24Hour(h12, period) {
  let h = h12 % 12;
  if (period === "PM") h += 12;
  return h;
}

function computeDurationSeconds() {
  const startPeriod = startTimeGroup.querySelector(".ampm-btn.active").dataset.value;
  const endPeriod = endTimeGroup.querySelector(".ampm-btn.active").dataset.value;
  const startTotal = to24Hour(Number(addTimeLogForm.startH.value), startPeriod) * 3600 + Number(addTimeLogForm.startM.value) * 60 + Number(addTimeLogForm.startS.value);
  const endTotal = to24Hour(Number(addTimeLogForm.endH.value), endPeriod) * 3600 + Number(addTimeLogForm.endM.value) * 60 + Number(addTimeLogForm.endS.value);
  return Math.max(0, endTotal - startTotal);
}

const startTimeGroup = document.getElementById("startTimeGroup");
const endTimeGroup = document.getElementById("endTimeGroup");

function updateComputedDuration() {
  tlComputedDuration.textContent = formatDuration(computeDurationSeconds());
  validateAddTimeLogForm();
}

function validateAddTimeLogForm() {
  const valid = tlDateInput.value.trim() !== "" && addTimeLogForm.logName.value !== "" && addTimeLogForm.loggedBy.value !== "";
  saveAddTimeLog.disabled = !valid;
  saveAddTimeLog.classList.toggle("enabled", valid);
}

addTimeLogForm.addEventListener("input", validateAddTimeLogForm);
addTimeLogForm.addEventListener("change", validateAddTimeLogForm);

document.getElementById("tlDateClear").addEventListener("click", () => {
  tlDateInput.value = "";
  tlDateInput.type = "text";
  validateAddTimeLogForm();
});

function resetAddTimeLogForm() {
  addTimeLogForm.reset();
  tlDateInput.type = "text";
  const today = new Date();
  tlDateInput.value = `${pad2(today.getMonth() + 1)}/${pad2(today.getDate())}/${today.getFullYear()}`;

  ["startH", "startM", "startS", "endH", "endM", "endS"].forEach((name) => (addTimeLogForm[name].value = "00"));
  document.querySelectorAll(".ampm-toggle").forEach((toggle) => {
    toggle.querySelectorAll(".ampm-btn").forEach((b, i) => b.classList.toggle("active", i === 0));
  });

  setCustomSelectValue(logNameSelect, "", { silent: true });
  setCustomSelectValue(loggedBySelect, "", { silent: true });
  tlComputedDuration.textContent = "00:00:00";
  validateAddTimeLogForm();
}

function openAddTimeLogModal() {
  resetAddTimeLogForm();
  addTimeLogOverlay.classList.add("open");
}

function closeAddTimeLogModal() {
  addTimeLogOverlay.classList.remove("open");
}

document.getElementById("addTimeLogBtn").addEventListener("click", openAddTimeLogModal);
document.getElementById("cancelAddTimeLog").addEventListener("click", closeAddTimeLogModal);
addTimeLogOverlay.addEventListener("click", (e) => { if (e.target === addTimeLogOverlay) closeAddTimeLogModal(); });

function generateLogId() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function formatClock(h24, m, s) {
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return { text: `${pad2(h12)}:${pad2(m)}:${pad2(s)} ${period}`, h12String: `${pad2(h12)}:${pad2(m)} ${period}` };
}

addTimeLogForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddTimeLog.disabled) return;

  const dateValue = tlDateInput.value;
  let dateLabel = dateValue;
  let monthKey = selectedMonth || "2026-09";
  if (tlDateInput.type === "date" && dateValue) {
    const [y, m, d] = dateValue.split("-");
    dateLabel = `${m}/${d}/${y}`;
    monthKey = `${y}-${m}`;
  } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
    const [m, , y] = dateValue.split("/");
    monthKey = `${y}-${m}`;
  }

  const startPeriod = startTimeGroup.querySelector(".ampm-btn.active").dataset.value;
  const endPeriod = endTimeGroup.querySelector(".ampm-btn.active").dataset.value;
  const startH24 = to24Hour(Number(addTimeLogForm.startH.value), startPeriod);
  const endH24 = to24Hour(Number(addTimeLogForm.endH.value), endPeriod);
  const startClock = formatClock(startH24, Number(addTimeLogForm.startM.value), Number(addTimeLogForm.startS.value));
  const endClock = formatClock(endH24, Number(addTimeLogForm.endM.value), Number(addTimeLogForm.endS.value));
  const durationSeconds = computeDurationSeconds();

  timeLogList.unshift({
    id: generateLogId(),
    name: addTimeLogForm.logName.value,
    monthKey,
    timestamp: `${dateLabel}, ${endClock.h12String}`,
    loggedBy: addTimeLogForm.loggedBy.value,
    duration: formatDuration(durationSeconds),
    durationSeconds,
    start: `${dateLabel}, ${startClock.text}`,
    end: `${dateLabel}, ${endClock.text}`,
    type: "Manual",
    notes: addTimeLogForm.notes.value.trim() || "—",
  });

  closeAddTimeLogModal();
  currentPage = 1;
  renderTimeLog();
});
