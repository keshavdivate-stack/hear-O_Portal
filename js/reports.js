const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Shared row-selection + pagination controller ----------------
   Used by all three report tables (Patient / Staffing / Outcomes) so each gets
   the same checkbox-select + bulk export + pager behavior without repeating it. */
function checkboxCell(id) {
  return `<td><span class="bill-checkbox row-check" data-id="${id}"></span></td>`;
}

function createReportTable({ pageSize, tbodyId, rangeId, prevId, nextId, selectAllId, emptyText, getFilteredRows, renderRow, onChange }) {
  let page = 1;
  const selected = new Set();

  function pageInfo() {
    const all = getFilteredRows();
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    page = Math.min(Math.max(1, page), totalPages);
    const start = (page - 1) * pageSize;
    return { all, pageItems: all.slice(start, start + pageSize), totalPages, start };
  }

  function render() {
    const { all, pageItems, totalPages, start } = pageInfo();

    document.getElementById(tbodyId).innerHTML = pageItems.length
      ? pageItems.map(renderRow).join("")
      : `<tr><td colspan="20" style="text-align:center; color:var(--gray-text); padding:28px;">${emptyText || "No records found."}</td></tr>`;

    const total = all.length;
    document.getElementById(rangeId).textContent = `${total === 0 ? 0 : start + 1}-${Math.min(start + pageSize, total)} of ${total}`;
    document.getElementById(prevId).disabled = page === 1;
    document.getElementById(nextId).disabled = page === totalPages;

    document.querySelectorAll(`#${tbodyId} .row-check`).forEach((box) => {
      box.classList.toggle("checked", selected.has(box.dataset.id));
    });

    const selectAllBox = document.getElementById(selectAllId);
    selectAllBox.classList.toggle("checked", all.length > 0 && all.every((r) => selected.has(String(r.id))));

    if (onChange) onChange(selected.size);
  }

  document.getElementById(prevId).addEventListener("click", () => { page -= 1; render(); });
  document.getElementById(nextId).addEventListener("click", () => { page += 1; render(); });

  document.getElementById(tbodyId).addEventListener("click", (e) => {
    const box = e.target.closest(".row-check");
    if (!box) return;
    const id = box.dataset.id;
    if (selected.has(id)) selected.delete(id); else selected.add(id);
    render();
  });

  document.getElementById(selectAllId).addEventListener("click", () => {
    const { all } = pageInfo();
    const allSelected = all.length > 0 && all.every((r) => selected.has(String(r.id)));
    all.forEach((r) => (allSelected ? selected.delete(String(r.id)) : selected.add(String(r.id))));
    render();
  });

  return {
    render,
    resetPage() { page = 1; },
    clearSelection() { selected.clear(); render(); },
    getSelectedIds() { return selected; },
  };
}

/* Only show the Organisation filter when the logged-in manager has access to
   more than one clinic (this app's org-switcher already implies that). */
const CLINIC_MANAGER_MULTI_ORG = true;

/* ---------------- Data (mirrors the real Patient List dataset) ---------------- */
const DOCTOR_NAMES = ["Dr. Sarah Mitchell", "Dr. James Carter", "Dr. Emily Chen", "Dr. Michael Reyes"];
const ORG_CODES = ["B01", "101", "104", "B03", "105"];
const ACCOUNT_VARIANTS = ["Enabled", "Enabled", "Enabled", "Paused", "Enabled", "Enabled", "Enabled", "Enabled", "Discontinued", "Enabled", "Enabled", "Enabled"];
const LAST_RECORDINGS = ["Today, 8:15 AM", "Yesterday, 7:50 AM", "2 days ago", "Today, 9:02 AM", "3 days ago", "Yesterday, 6:40 AM", "Today, 7:30 AM", "4 days ago", "1 week ago", "Today, 8:55 AM", "Yesterday, 9:10 AM", "5 days ago"];
const LAST_ACTIONS = ["Care Recommendation", "Update Account Status", "Reset Patient Password", "Flag Priority Patient", "Enter Initial Vitals", "Edit Patient Details", "Care Recommendation", "Add History Event", "Update Account Status", "Register Patient", "Update History Event", "Unflag Priority Patient"];
const COMPLIANCE_VALUES = [92, 88, 76, 95, 81, 90, 85, 60, 45, 97, 72, 55];

const REPORT_PATIENTS = [
  { name: "Alexander White", username: "ABC-1254", mrn: "857452365", status: "priority", flag: true, since: "Since: 2d | 01.08.2028", monitoring: "monitored" },
  { name: "Dan Volex", username: "ABC-1252", mrn: "854745856", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "monitored" },
  { name: "Mike Brown", username: "ABC-1251", mrn: "854125632", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", monSince: "Since: 1d | 01.09.2028" },
  { name: "Ariel Fox", username: "ABC-1238", mrn: "854123658", status: "priority", flag: false, since: "Since: 3d | 01.07.2028", monitoring: "monitored" },
  { name: "Jeff Frank", username: "ABC-1242", mrn: "854123658", status: "priority", flag: false, since: "Since: 4d | 01.06.2028", monitoring: "monitored" },
  { name: "Aric Snow", username: "ABC-1283", mrn: "854125632", status: "priority", flag: false, since: "Since: 8d | 01.02.2028", monitoring: "monitored" },
  { name: "Abe Lol", username: "ABC-1222", mrn: "854125632", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored" },
  { name: "Annie Zaplin", username: "ABC-1222", mrn: "854125632", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored" },
  { name: "Nathan Norash", username: "ABC-1222", mrn: "854125632", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored" },
  { name: "Henry Fisher", username: "ABC-1220", mrn: "965412589", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none" },
  { name: "Josh Ericson", username: "ABC-1222", mrn: "854125632", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", monInfo: true },
  { name: "Jack Harris", username: "ABC-1221", mrn: "854125698", status: "none", monitoring: "unmonitored", monSince: "Since: 5d | 01.05.2028" },
];

function parseSinceDate(str) {
  if (!str) return null;
  const m = str.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!m) return null;
  return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
}

REPORT_PATIENTS.forEach((p, i) => {
  p.id = i;
  p.doctor = DOCTOR_NAMES[i % DOCTOR_NAMES.length];
  p.org = ORG_CODES[i % ORG_CODES.length];
  p.account = ACCOUNT_VARIANTS[i];
  p.lastRecording = LAST_RECORDINGS[i];
  p.lastAction = LAST_ACTIONS[i];
  p.compliance = COMPLIANCE_VALUES[i];
  const priorityMatch = p.status === "priority" && p.since ? p.since.match(/(\d+)d/) : null;
  p.priorityDays = priorityMatch ? Number(priorityMatch[1]) : null;
  p.eventDate = parseSinceDate(p.since) || parseSinceDate(p.monSince);
});

if (!CLINIC_MANAGER_MULTI_ORG) {
  document.getElementById("orgFilterWrap").style.display = "none";
}

/* ---------------- Custom dropdowns (same pattern used across the portal) ---------------- */
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
  const menuHeight = Math.min(menu.scrollHeight, 260) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${Math.max(rect.width, 200)}px`;
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

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

initCustomSelects();

/* ---------------- Calendar date-range filters (same pattern as Audit Trail) ---------------- */
const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfDay(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }

function renderCalendar(popoverEl, viewYear, viewMonth, selectedDate, { minDate, maxDate, onPick, onToday, onClear }) {
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = startOfDay(new Date());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(`<span class="calendar-day muted"></span>`);
  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(viewYear, viewMonth, d);
    const isSelected = sameDay(selectedDate, cellDate);
    const isToday = sameDay(today, cellDate);
    const outOfRange = (minDate && cellDate < minDate) || (maxDate && cellDate > maxDate);
    const cls = ["calendar-day"];
    if (isSelected) cls.push("selected");
    if (isToday && !isSelected) cls.push("today");
    if (outOfRange) cls.push("disabled");
    cells.push(`<span class="${cls.join(" ")}" ${outOfRange ? "" : `data-day="${d}"`}>${d}</span>`);
  }

  popoverEl.innerHTML = `
    <div class="calendar-head">
      <span class="calendar-month-label">${MONTH_NAMES[viewMonth]} ${viewYear}</span>
      <div class="calendar-nav">
        <button type="button" class="calendar-nav-btn" data-nav="-1" aria-label="Previous month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button type="button" class="calendar-nav-btn" data-nav="1" aria-label="Next month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
    <div class="calendar-weekdays">${WEEKDAY_LABELS.map((w) => `<span>${w}</span>`).join("")}</div>
    <div class="calendar-days">${cells.join("")}</div>
    <div class="calendar-footer">
      <button type="button" class="calendar-footer-btn" data-action="today">Today</button>
      <button type="button" class="calendar-footer-btn" data-action="clear">Clear</button>
    </div>
  `;

  popoverEl.querySelectorAll(".calendar-nav-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const delta = Number(btn.dataset.nav);
      let m = viewMonth + delta;
      let y = viewYear;
      if (m < 0) { m = 11; y -= 1; }
      if (m > 11) { m = 0; y += 1; }
      renderCalendar(popoverEl, y, m, selectedDate, { minDate, maxDate, onPick, onToday, onClear });
    });
  });

  popoverEl.querySelectorAll(".calendar-day[data-day]").forEach((cell) => {
    cell.addEventListener("click", (e) => {
      e.stopPropagation();
      onPick(new Date(viewYear, viewMonth, Number(cell.dataset.day)));
    });
  });

  popoverEl.querySelector('[data-action="today"]').addEventListener("click", (e) => { e.stopPropagation(); onToday(); });
  popoverEl.querySelector('[data-action="clear"]').addEventListener("click", (e) => { e.stopPropagation(); onClear(); });
}

function setupDateFilter(wrapId, popoverId, labelId, baseLabel, { getMin, getMax, onChange, onPicked } = {}) {
  const wrap = document.getElementById(wrapId);
  const popover = document.getElementById(popoverId);
  const trigger = wrap.querySelector(".filter-btn");
  const label = document.getElementById(labelId);
  const today = startOfDay(new Date());
  let selectedDate = today;
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  const setLabel = (date) => {
    label.textContent = date ? `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}` : baseLabel;
  };

  const draw = () => renderCalendar(popover, viewYear, viewMonth, selectedDate, {
    minDate: getMin ? getMin() : null,
    maxDate: getMax ? getMax() : null,
    onPick: (date) => {
      selectedDate = date;
      viewYear = date.getFullYear();
      viewMonth = date.getMonth();
      setLabel(date);
      onChange(date);
      wrap.classList.remove("open");
      if (onPicked) onPicked();
      draw();
    },
    onToday: () => {
      selectedDate = today;
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      setLabel(today);
      onChange(today);
      wrap.classList.remove("open");
      if (onPicked) onPicked();
      draw();
    },
    onClear: () => {
      selectedDate = today;
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      setLabel(null);
      onChange(null);
      wrap.classList.remove("open");
      draw();
    },
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrap.classList.contains("open");
    closeAllFilterPopovers();
    wrap.classList.toggle("open", willOpen);
    if (willOpen) draw();
  });

  popover.addEventListener("click", (e) => e.stopPropagation());

  return {
    reset() {
      selectedDate = today;
      viewYear = today.getFullYear();
      viewMonth = today.getMonth();
      setLabel(null);
      draw();
    },
  };
}

function openDateFilter(wrapId) {
  document.getElementById(wrapId).querySelector(".filter-btn").click();
}

function closeAllFilterPopovers() {
  document.querySelectorAll(".date-filter-btn.open").forEach((el) => el.classList.remove("open"));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- Patient Reports ---------------- */
const patientFilters = { search: "", acct: "", clin: "", mon: "", org: "", from: null, to: null };

function filteredPatients() {
  return REPORT_PATIENTS.filter((p) => {
    if (patientFilters.search) {
      const s = patientFilters.search;
      if (!(p.name.toLowerCase().includes(s) || p.username.toLowerCase().includes(s) || p.mrn.toLowerCase().includes(s))) return false;
    }
    if (patientFilters.acct && p.account !== patientFilters.acct) return false;
    if (patientFilters.clin && p.status !== patientFilters.clin) return false;
    if (patientFilters.mon) {
      const bucket = p.monitoring === "monitored" ? "monitored" : "unmonitored";
      if (bucket !== patientFilters.mon) return false;
    }
    if (patientFilters.org && p.org !== patientFilters.org) return false;
    if (patientFilters.from && p.eventDate && p.eventDate < patientFilters.from) return false;
    if (patientFilters.to && p.eventDate && p.eventDate > patientFilters.to) return false;
    return true;
  });
}

function complianceClass(v) {
  if (v >= 85) return "compliance-good";
  if (v >= 65) return "compliance-fair";
  return "compliance-poor";
}

function clinicalBadge(p) {
  const map = {
    priority: ["Priority", "status-priority"],
    active: ["Active", "status-active"],
    baseline: ["Baseline", "status-muted"],
    registered: ["Registered", "status-muted"],
    none: ["None", "status-muted"],
  };
  const [label, cls] = map[p.status] || ["—", "status-muted"];
  return `<span class="status-line ${cls}">${label}</span>`;
}

function monitoringBadge(p) {
  if (p.monitoring === "monitored") return `<span class="mon-line mon-monitored">Monitored</span>`;
  if (p.monitoring === "unmonitored") return `<span class="mon-line mon-unmonitored">Unmonitored</span>`;
  return `<span class="mon-line mon-none">None</span>`;
}

function renderPatientRow(p) {
  return `
    <tr>
      ${checkboxCell(p.id)}
      <td><a class="lt-name ${p.status === "priority" ? "priority" : "active-name"}" href="patient-data.html">${p.name}</a></td>
      <td>${p.username} / ${p.mrn}</td>
      <td>${p.account}</td>
      <td>${clinicalBadge(p)}</td>
      <td>${monitoringBadge(p)}</td>
      <td><span class="compliance-value ${complianceClass(p.compliance)}">${p.compliance}%</span></td>
      <td>${p.priorityDays !== null ? p.priorityDays + "d" : "—"}</td>
      <td>${p.lastRecording}</td>
      <td>${p.lastAction}</td>
      <td>${p.doctor}</td>
      <td>
        <div class="action-cell">
          <button class="action-icon kebab row-menu-trigger" aria-label="More" data-id="${p.id}">${kebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const patientTable = createReportTable({
  pageSize: 5,
  tbodyId: "patientReportRows",
  rangeId: "patientPageRangeLabel",
  prevId: "patientPrevBtn",
  nextId: "patientNextBtn",
  selectAllId: "selectAllPatients",
  emptyText: "No patients match your filters.",
  getFilteredRows: filteredPatients,
  renderRow: renderPatientRow,
  onChange: (count) => updateExportButtonState("patient", count),
});

function renderPatientTable() {
  const list = filteredPatients();

  const tableCard = document.getElementById("patientReportTableCard");
  const emptyState = document.getElementById("patientEmptyState");

  if (list.length === 0) {
    tableCard.style.display = "none";
    emptyState.style.display = "flex";
    return;
  }
  tableCard.style.display = "flex";
  emptyState.style.display = "none";

  patientTable.resetPage();
  patientTable.render();
}

document.querySelectorAll("#section-patient .custom-select[data-name]").forEach((select) => {
  const name = select.dataset.name;
  const hidden = select.querySelector("input[type=hidden]");
  hidden.addEventListener("change", () => {
    const val = hidden.value;
    if (name === "acctStatus") patientFilters.acct = val;
    if (name === "clinStatus") patientFilters.clin = val;
    if (name === "monStatus") patientFilters.mon = val;
    if (name === "orgFilter") patientFilters.org = val;
    renderPatientTable();
  });
});

document.getElementById("reportSearchInput").addEventListener("input", (e) => {
  patientFilters.search = e.target.value.trim().toLowerCase();
  renderPatientTable();
});

const patFromDateFilter = setupDateFilter("patFromDateWrap", "patFromCalendarPopover", "patFromDateLabel", "From Date", {
  getMax: () => patientFilters.to,
  onChange: (date) => { patientFilters.from = date; renderPatientTable(); },
  onPicked: () => { if (!patientFilters.to) openDateFilter("patToDateWrap"); },
});
const patToDateFilter = setupDateFilter("patToDateWrap", "patToCalendarPopover", "patToDateLabel", "To Date", {
  getMin: () => patientFilters.from,
  onChange: (date) => { patientFilters.to = date; renderPatientTable(); },
});

function clearPatientFilters() {
  patientFilters.search = "";
  patientFilters.acct = "";
  patientFilters.clin = "";
  patientFilters.mon = "";
  patientFilters.org = "";
  patientFilters.from = null;
  patientFilters.to = null;
  document.getElementById("reportSearchInput").value = "";
  resetCustomSelectsIn(document.getElementById("section-patient"));
  patFromDateFilter.reset();
  patToDateFilter.reset();
  renderPatientTable();
}

document.getElementById("clearPatientFilters").addEventListener("click", clearPatientFilters);
document.getElementById("clearPatientFiltersEmpty").addEventListener("click", clearPatientFilters);

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fmtDate(d) { return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`; }

function describePatientFilters() {
  const parts = [];
  if (patientFilters.acct) parts.push(`Account Status = ${patientFilters.acct}`);
  if (patientFilters.clin) parts.push(`Clinical Status = ${cap(patientFilters.clin)}`);
  if (patientFilters.mon) parts.push(`Monitoring = ${patientFilters.mon === "monitored" ? "Monitoring" : "Unmonitored"}`);
  if (patientFilters.org) parts.push(`Organisation = ${patientFilters.org}`);
  if (patientFilters.search) parts.push(`Search = "${patientFilters.search}"`);
  if (patientFilters.from) parts.push(`From ${fmtDate(patientFilters.from)}`);
  if (patientFilters.to) parts.push(`To ${fmtDate(patientFilters.to)}`);
  return parts.length ? parts.join(", ") : "None";
}

/* Row menu: View Patient / Export Patient Report */
const patientReportRowMenu = document.getElementById("patientReportRowMenu");
let activeReportPatientId = null;

document.getElementById("patientReportRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeReportPatientId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  patientReportRowMenu.style.top = `${rect.bottom + 6}px`;
  patientReportRowMenu.style.left = `${rect.right - 190}px`;
  patientReportRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!patientReportRowMenu.contains(e.target)) patientReportRowMenu.classList.remove("open");
});

const PATIENT_EXPORT_COLUMNS = [
  { label: "Patient", value: (p) => p.name },
  { label: "Username", value: (p) => p.username },
  { label: "MRN", value: (p) => p.mrn },
  { label: "Account Status", value: (p) => p.account },
  { label: "Clinical Status", value: (p) => p.status },
  { label: "Monitoring Status", value: (p) => p.monitoring },
  { label: "Compliance %", value: (p) => p.compliance },
  { label: "Priority Days", value: (p) => (p.priorityDays ?? "") },
  { label: "Last Recording", value: (p) => p.lastRecording },
  { label: "Last Action", value: (p) => p.lastAction },
  { label: "Care Team", value: (p) => p.doctor },
];

patientReportRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item || activeReportPatientId === null) return;
  patientReportRowMenu.classList.remove("open");
  const patient = REPORT_PATIENTS.find((p) => p.id === activeReportPatientId);
  if (!patient) return;
  if (item.dataset.action === "view") {
    window.location.href = "patient-data.html";
  } else {
    openExportModal({
      reportLabel: "Patient Report",
      filtersLabel: `Patient = ${patient.name}`,
      count: 1,
      countLabel: "Patients",
      rows: [patient],
      columns: PATIENT_EXPORT_COLUMNS,
      filenamePrefix: `patient-report-${patient.username.toLowerCase()}`,
    });
  }
});

document.getElementById("exportPatientReportBtn").addEventListener("click", () => {
  const selectedIds = patientTable.getSelectedIds();
  const list = selectedIds.size > 0
    ? REPORT_PATIENTS.filter((p) => selectedIds.has(String(p.id)))
    : filteredPatients();
  openExportModal({
    reportLabel: "Patient Report",
    filtersLabel: selectedIds.size > 0 ? `${selectedIds.size} selected patient(s)` : describePatientFilters(),
    count: list.length,
    countLabel: "Patients",
    rows: list,
    columns: PATIENT_EXPORT_COLUMNS,
    filenamePrefix: "patient-report",
  });
});

/* ---------------- Export Report modal ---------------- */
const exportReportOverlay = document.getElementById("exportReportOverlay");
let pendingExport = null;

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(prefix, columns, rows) {
  const header = columns.map((c) => c.label);
  const lines = [header.join(",")].concat(rows.map((r) => columns.map((c) => csvEscape(c.value(r))).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function openExportModal(context) {
  pendingExport = context;
  document.getElementById("exportSummaryBox").innerHTML = `
    <div><b>Report:</b> ${context.reportLabel}</div>
    <div><b>Filters:</b> ${context.filtersLabel}</div>
    <div><b>${context.countLabel || "Records"}:</b> ${context.count}</div>
  `;
  exportReportOverlay.classList.add("open");
}

document.getElementById("cancelExportReport").addEventListener("click", () => exportReportOverlay.classList.remove("open"));
exportReportOverlay.addEventListener("click", (e) => { if (e.target === exportReportOverlay) exportReportOverlay.classList.remove("open"); });

document.getElementById("confirmExportReport").addEventListener("click", () => {
  if (!pendingExport) return;
  const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "CSV";
  if (format === "CSV") {
    downloadCsv(pendingExport.filenamePrefix || "report", pendingExport.columns, pendingExport.rows);
  } else {
    alert(`${format} export is coming soon — please use CSV for now.`);
    return;
  }
  exportReportOverlay.classList.remove("open");
});

/* ---------------- Reports tabs ---------------- */
const REPORTS_EXPORT_BTN_IDS = { patient: "exportPatientReportBtn", staffing: "exportStaffingReportBtn", outcomes: "exportOutcomesReportBtn" };

/* Selecting rows via the checkbox column turns the tab's Export button into a
   bulk-export-selected action; with nothing checked it falls back to exporting
   everything currently in view (matching the filters). */
function updateExportButtonState(tab, count) {
  const btn = document.getElementById(REPORTS_EXPORT_BTN_IDS[tab]);
  btn.querySelector(".export-btn-label").textContent = count > 0 ? `Export Selected (${count})` : "Export Report";
}

document.getElementById("reportsTabGroup").addEventListener("click", (e) => {
  const tab = e.target.closest(".filter-tab");
  if (!tab) return;
  document.querySelectorAll("#reportsTabGroup .filter-tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  document.querySelectorAll(".data-tab-panel").forEach((p) => p.classList.remove("open"));
  document.getElementById(`section-${tab.dataset.tab}`).classList.add("open");
  Object.entries(REPORTS_EXPORT_BTN_IDS).forEach(([key, id]) => {
    document.getElementById(id).style.display = key === tab.dataset.tab ? "inline-flex" : "none";
  });
  const staffingSearchWrap = document.getElementById("staffingSearchWrap");
  const outcomesSearchWrap = document.getElementById("outcomesSearchWrap");
  staffingSearchWrap.style.display = tab.dataset.tab === "staffing" ? "flex" : "none";
  outcomesSearchWrap.style.display = tab.dataset.tab === "outcomes" ? "flex" : "none";
});

/* ---------------- Staffing / workload visibility ----------------
   Derived from the same REPORT_PATIENTS dataset as the Patient tab
   (grouped by assigned care-team doctor), so it reflects real patient
   load rather than a separate made-up dataset. */
const STAFFING_ROWS = DOCTOR_NAMES.map((doctor, i) => {
  const patients = REPORT_PATIENTS.filter((p) => p.doctor === doctor);
  const priorityCount = patients.filter((p) => p.status === "priority").length;
  const avgCompliance = Math.round(patients.reduce((sum, p) => sum + p.compliance, 0) / patients.length);
  const orgs = [...new Set(patients.map((p) => p.org))].join(", ");
  return { id: i, doctor, total: patients.length, priorityCount, avgCompliance, orgs };
});

function renderStaffingRow(r) {
  return `
    <tr>
      ${checkboxCell(r.id)}
      <td><b>${r.doctor}</b></td>
      <td>${r.total}</td>
      <td>${r.priorityCount}</td>
      <td><span class="compliance-value ${complianceClass(r.avgCompliance)}">${r.avgCompliance}%</span></td>
      <td>${r.orgs}</td>
    </tr>`;
}

let staffingSearch = "";

function filteredStaffingRows() {
  if (!staffingSearch) return STAFFING_ROWS;
  return STAFFING_ROWS.filter((r) => r.doctor.toLowerCase().includes(staffingSearch));
}

const staffingTable = createReportTable({
  pageSize: 10,
  tbodyId: "staffingReportRows",
  rangeId: "staffingPageRangeLabel",
  prevId: "staffingPrevBtn",
  nextId: "staffingNextBtn",
  selectAllId: "selectAllStaffing",
  emptyText: "No care team members match your search.",
  getFilteredRows: filteredStaffingRows,
  renderRow: renderStaffingRow,
  onChange: (count) => updateExportButtonState("staffing", count),
});

function renderStaffingTable() { staffingTable.render(); }

document.getElementById("staffingSearchInput").addEventListener("input", (e) => {
  staffingSearch = e.target.value.trim().toLowerCase();
  staffingTable.resetPage();
  staffingTable.render();
});

const STAFFING_EXPORT_COLUMNS = [
  { label: "Care Team Member", value: (r) => r.doctor },
  { label: "Total Patients", value: (r) => r.total },
  { label: "Priority Patients", value: (r) => r.priorityCount },
  { label: "Avg Compliance %", value: (r) => r.avgCompliance },
  { label: "Organization(s)", value: (r) => r.orgs },
];

document.getElementById("exportStaffingReportBtn").addEventListener("click", () => {
  const selectedIds = staffingTable.getSelectedIds();
  const rows = selectedIds.size > 0 ? STAFFING_ROWS.filter((r) => selectedIds.has(String(r.id))) : filteredStaffingRows();
  openExportModal({
    reportLabel: "Staffing Report",
    filtersLabel: selectedIds.size > 0 ? `${selectedIds.size} selected care team member(s)` : (staffingSearch ? `Search = "${staffingSearch}"` : "None"),
    count: rows.length,
    countLabel: "Care Team Members",
    rows,
    columns: STAFFING_EXPORT_COLUMNS,
    filenamePrefix: "staffing-report",
  });
});

/* ---------------- Program-level outcomes reporting ----------------
   Also derived from REPORT_PATIENTS (grouped by organization). Hospitalization
   reduction and ROI have no underlying source data in this system yet, so
   they're modeled as a function of average compliance — higher-compliance
   organizations show better outcomes, which is the real clinical narrative
   these two metrics are meant to capture. */
const OUTCOMES_ROWS = ORG_CODES.map((org) => {
  const patients = REPORT_PATIENTS.filter((p) => p.org === org);
  if (patients.length === 0) return null;
  const priorityRate = Math.round((patients.filter((p) => p.status === "priority").length / patients.length) * 100);
  const avgCompliance = Math.round(patients.reduce((sum, p) => sum + p.compliance, 0) / patients.length);
  const hospReduction = Math.round(avgCompliance * 0.3);
  const estRoi = hospReduction * patients.length * 1400;
  return { id: org, org, enrolled: patients.length, priorityRate, avgCompliance, hospReduction, estRoi };
}).filter(Boolean);

function fmtCurrency(n) { return `$${n.toLocaleString("en-US")}`; }

function renderOutcomesRow(r) {
  return `
    <tr>
      ${checkboxCell(r.id)}
      <td><b>${r.org}</b></td>
      <td>${r.enrolled}</td>
      <td>${r.priorityRate}%</td>
      <td><span class="compliance-value ${complianceClass(r.avgCompliance)}">${r.avgCompliance}%</span></td>
      <td>${r.hospReduction}%</td>
      <td>${fmtCurrency(r.estRoi)}</td>
    </tr>`;
}

let outcomesSearch = "";

function filteredOutcomesRows() {
  if (!outcomesSearch) return OUTCOMES_ROWS;
  return OUTCOMES_ROWS.filter((r) => r.org.toLowerCase().includes(outcomesSearch));
}

const outcomesTable = createReportTable({
  pageSize: 10,
  tbodyId: "outcomesReportRows",
  rangeId: "outcomesPageRangeLabel",
  prevId: "outcomesPrevBtn",
  nextId: "outcomesNextBtn",
  selectAllId: "selectAllOutcomes",
  emptyText: "No organizations match your search.",
  getFilteredRows: filteredOutcomesRows,
  renderRow: renderOutcomesRow,
  onChange: (count) => updateExportButtonState("outcomes", count),
});

function renderOutcomesTable() { outcomesTable.render(); }

document.getElementById("outcomesSearchInput").addEventListener("input", (e) => {
  outcomesSearch = e.target.value.trim().toLowerCase();
  outcomesTable.resetPage();
  outcomesTable.render();
});

const OUTCOMES_EXPORT_COLUMNS = [
  { label: "Organization", value: (r) => r.org },
  { label: "Enrolled Patients", value: (r) => r.enrolled },
  { label: "Priority Rate %", value: (r) => r.priorityRate },
  { label: "Avg Compliance %", value: (r) => r.avgCompliance },
  { label: "Hospitalization Reduction %", value: (r) => r.hospReduction },
  { label: "Est. ROI", value: (r) => r.estRoi },
];

document.getElementById("exportOutcomesReportBtn").addEventListener("click", () => {
  const selectedIds = outcomesTable.getSelectedIds();
  const rows = selectedIds.size > 0 ? OUTCOMES_ROWS.filter((r) => selectedIds.has(String(r.id))) : filteredOutcomesRows();
  openExportModal({
    reportLabel: "Program Outcomes Report",
    filtersLabel: selectedIds.size > 0 ? `${selectedIds.size} selected organization(s)` : (outcomesSearch ? `Search = "${outcomesSearch}"` : "None"),
    count: rows.length,
    countLabel: "Organizations",
    rows,
    columns: OUTCOMES_EXPORT_COLUMNS,
    filenamePrefix: "outcomes-report",
  });
});

/* ---------------- Initial render ---------------- */
renderPatientTable();
renderStaffingTable();
renderOutcomesTable();
