/* ---------------- State ---------------- */
const AUDIT_PAGE_SIZE = 25;
let auditCurrentPage = 1;
let auditSearchTerm = "";
let auditFromDate = null; // Date or null
let auditToDate = null; // Date or null
let auditRelatedType = "Patient"; // "Patient" | "User"
const auditActionTypes = new Set();
const auditMadeBySet = new Set();

const auditActionTypeOptions = [
  "Register Patient",
  "Enter Initial Vitals",
  "Edit Patient Details",
  "Update Account Status",
  "Reset Patient Password",
  "Care Recommendation",
  "Action added",
  "Update Action",
  "Add History Event",
  "Update History Event",
  "Send Chat Message",
  "User Login",
  "User Logout",
  "Forgot Password",
  "Create User",
  "Reset User Password",
  "Manage users",
  "Delete User",
  "View New Priority Patient",
  "View New Unmonitored Patient",
  "Flag Priority Patient",
  "Unflag Priority Patient",
  "Changed Password",
  "Mark Priority Patient as Unread",
  "Mark Unmonitored Patient as Unread",
];

/* ---------------- Checkbox filter menus (Action Type / Made By) ---------------- */
function renderCheckboxMenu(menuEl, options, selectedSet) {
  menuEl.innerHTML = options
    .map(
      (opt) => `
      <label class="checkbox-filter-option">
        <input type="checkbox" value="${opt}" ${selectedSet.has(opt) ? "checked" : ""} />
        ${opt}
      </label>`
    )
    .join("");
}

const actionTypeMenu = document.getElementById("actionTypeMenu");
const madeByMenu = document.getElementById("madeByMenu");
const madeByOptions = [...new Set(auditTrail.map((a) => a.madeBy))].sort();

renderCheckboxMenu(actionTypeMenu, auditActionTypeOptions, auditActionTypes);
renderCheckboxMenu(madeByMenu, madeByOptions, auditMadeBySet);

function wireCheckboxFilter(wrapEl, menuEl, selectedSet) {
  const trigger = wrapEl.querySelector(".filter-btn");
  const label = wrapEl.querySelector(".checkbox-filter-label");
  const baseLabel = label.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrapEl.classList.contains("open");
    closeAllFilterPopovers();
    wrapEl.classList.toggle("open", willOpen);
  });

  menuEl.addEventListener("click", (e) => e.stopPropagation());

  menuEl.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selectedSet.add(checkbox.value);
    else selectedSet.delete(checkbox.value);

    label.textContent = selectedSet.size ? `${baseLabel} (${selectedSet.size})` : baseLabel;
    auditCurrentPage = 1;
    renderAudit();
  });
}

wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="actionType"]'), actionTypeMenu, auditActionTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="madeBy"]'), madeByMenu, auditMadeBySet);

/* ---------------- Related To tabs (All / Patients / Users) ---------------- */
const auditTypeTabs = document.getElementById("auditTypeTabs");

auditTypeTabs.addEventListener("click", (e) => {
  const tab = e.target.closest(".filter-tab");
  if (!tab) return;
  auditTypeTabs.querySelectorAll(".filter-tab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  auditRelatedType = tab.dataset.type;
  auditCurrentPage = 1;

  renderAudit();
});

/* ---------------- Calendar popovers (From Date / To Date) ---------------- */
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
  let selectedDate = today; // shown filled by default until the user picks a real value
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

const fromDateFilter = setupDateFilter("fromDateWrap", "fromCalendarPopover", "fromDateLabel", "From Date", {
  getMax: () => auditToDate,
  onChange: (date) => {
    auditFromDate = date;
    auditCurrentPage = 1;
    renderAudit();
  },
  onPicked: () => {
    if (!auditToDate) openDateFilter("toDateWrap");
  },
});

const toDateFilter = setupDateFilter("toDateWrap", "toCalendarPopover", "toDateLabel", "To Date", {
  getMin: () => auditFromDate,
  onChange: (date) => {
    auditToDate = date;
    auditCurrentPage = 1;
    renderAudit();
  },
});

function openDateFilter(wrapId) {
  document.getElementById(wrapId).querySelector(".filter-btn").click();
}

function closeAllFilterPopovers() {
  document.querySelectorAll(".date-filter-btn.open, .checkbox-filter.open").forEach((el) => el.classList.remove("open"));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- Filtering ---------------- */
function filteredAudit() {
  return auditTrail.filter((a) => {
    if (a.relatedType !== auditRelatedType) return false;
    if (auditSearchTerm && !a.madeBy.toLowerCase().includes(auditSearchTerm) && !a.relatedName.toLowerCase().includes(auditSearchTerm)) return false;
    if (auditActionTypes.size && !auditActionTypes.has(a.actionType)) return false;
    if (auditMadeBySet.size && !auditMadeBySet.has(a.madeBy)) return false;
    if (auditFromDate) {
      const from = new Date(auditFromDate.getFullYear(), auditFromDate.getMonth(), auditFromDate.getDate(), 0, 0, 0);
      if (a.timestamp < from) return false;
    }
    if (auditToDate) {
      const to = new Date(auditToDate.getFullYear(), auditToDate.getMonth(), auditToDate.getDate(), 23, 59, 59);
      if (a.timestamp > to) return false;
    }
    return true;
  });
}

/* ---------------- Render ---------------- */
function renderAudit() {
  const list = filteredAudit();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));
  auditCurrentPage = Math.min(auditCurrentPage, totalPages);

  const start = (auditCurrentPage - 1) * AUDIT_PAGE_SIZE;
  const pageItems = list.slice(start, start + AUDIT_PAGE_SIZE);

  document.getElementById("auditRows").innerHTML = pageItems
    .map(
      (a) => `
      <tr>
        <td>${a.actionType}</td>
        <td>${a.description}</td>
        <td>${a.relatedTo}</td>
        <td>${a.timestampLabel}</td>
        <td>${a.madeBy}</td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + AUDIT_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("auditPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("auditFirstPage").disabled = auditCurrentPage === 1;
  document.getElementById("auditPrevPage").disabled = auditCurrentPage === 1;
  document.getElementById("auditNextPage").disabled = auditCurrentPage === totalPages;
  document.getElementById("auditLastPage").disabled = auditCurrentPage === totalPages;
}

renderAudit();

/* ---------------- Search ---------------- */
document.getElementById("auditSearchInput").addEventListener("input", (e) => {
  auditSearchTerm = e.target.value.trim().toLowerCase();
  auditCurrentPage = 1;
  renderAudit();
});

/* ---------------- Clear all filters ---------------- */
document.getElementById("clearFilters").addEventListener("click", () => {
  auditSearchTerm = "";
  auditFromDate = null;
  auditToDate = null;
  auditRelatedType = "Patient";
  auditActionTypes.clear();
  auditMadeBySet.clear();
  auditCurrentPage = 1;

  document.getElementById("auditSearchInput").value = "";
  fromDateFilter.reset();
  toDateFilter.reset();
  auditTypeTabs.querySelectorAll(".filter-tab").forEach((t) => t.classList.toggle("active", t.dataset.type === "Patient"));

  document.querySelector('.checkbox-filter[data-name="actionType"] .checkbox-filter-label').textContent = "Action Type";
  document.querySelector('.checkbox-filter[data-name="madeBy"] .checkbox-filter-label').textContent = "Made By";
  renderCheckboxMenu(actionTypeMenu, auditActionTypeOptions, auditActionTypes);
  renderCheckboxMenu(madeByMenu, madeByOptions, auditMadeBySet);

  renderAudit();
});

/* ---------------- Export ---------------- */
function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

document.getElementById("exportAuditBtn").addEventListener("click", () => {
  const rows = filteredAudit();
  const header = ["Action Type", "Description", "Related To", "Timestamp", "Made By"];
  const lines = [header.join(",")].concat(
    rows.map((a) => [a.actionType, a.description, a.relatedTo, a.timestampLabel, a.madeBy].map(csvEscape).join(","))
  );

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-trail-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

/* ---------------- Pagination ---------------- */
document.getElementById("auditFirstPage").addEventListener("click", () => { auditCurrentPage = 1; renderAudit(); });
document.getElementById("auditPrevPage").addEventListener("click", () => { auditCurrentPage -= 1; renderAudit(); });
document.getElementById("auditNextPage").addEventListener("click", () => { auditCurrentPage += 1; renderAudit(); });
document.getElementById("auditLastPage").addEventListener("click", () => {
  auditCurrentPage = Math.ceil(filteredAudit().length / AUDIT_PAGE_SIZE);
  renderAudit();
});
