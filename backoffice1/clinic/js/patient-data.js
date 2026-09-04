/* Backoffice-safe fork of ../../js/patient-data.js (the root Patient Data chart).
   Why forked instead of shared: the root file mixes patient PHI (real name,
   contact info, vitals, medication, care-recommendation, questionnaire-answer,
   and chat content) together with its render logic for every tab, so it
   cannot be reused unmodified. This fork:
   - Shows Patient ID instead of name (there is no separate name to redact --
     the header markup in patient-data.html already only carries the ID).
   - Keeps: discontinued-account banner, Care Team / App & Device Info popovers
     (staff identity + operational device info, not patient PHI), the Overview
     status-timeline chart (Active/Priority/Baseline status only, not clinical
     values), the Recordings presence/absence row + aggregate Compliance
     numbers, and an administrative-only History Events list.
   - Drops entirely (their HTML isn't present on this page, so there is
     nothing to wire up): Health Data vitals charts, Clinical tab (Medication
     + Care Recommendations), Questionnaire answers, Patient Information
     (Contact/Emergency Contact), and the Chat panel.
   - History Events data below is the same demo entries as the root file with
     the Medication category dropped entirely and any note text that named a
     person or described clinical specifics stripped, per the redaction
     policy -- Status/Monitoring/Account entries are administrative and are
     kept as-is (including staff names, which are not patient PHI). */

/* ---------------- Discontinued account banner ---------------- */
(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("discontinued") !== "1") return;
  document.getElementById("discontinuedBannerDate").textContent = params.get("discontinuedDate") || "an earlier date";

  const reason = params.get("discontinuedReason");
  if (reason) {
    document.getElementById("discontinuedBannerReasonText").textContent = reason;
    document.getElementById("discontinuedBannerReason").style.display = "inline";
  }

  document.getElementById("discontinuedBanner").style.display = "flex";
  document.querySelector(".patient-card").classList.add("is-discontinued");
  document.body.classList.add("patient-discontinued");
})();

/* ---------------- Care Team / App & Device Info popovers (static, staff-only content) ---------------- */
wireTopbarToggle("careTeamTrigger", "careTeamPopover");
wireTopbarToggle("appDeviceTrigger", "appDevicePopover");

/* ---------------- Shared day axis (31 days, gap = 21-23 Dec) ---------------- */
const chartDays = [
  { label: "11", month: "Dec", status: "baseline" },
  { label: "12", month: "Dec", status: "baseline" },
  { label: "13", month: "Dec", status: "baseline" },
  { label: "14", month: "Dec", status: "baseline" },
  { label: "15", month: "Dec", status: "active" },
  { label: "16", month: "Dec", status: "active" },
  { label: "17", month: "Dec", status: "active" },
  { label: "18", month: "Dec", status: "active" },
  { label: "19", month: "Dec", status: "active" },
  { label: "20", month: "Dec", status: "active" },
  { label: "21", month: "Dec", status: "active", gap: true },
  { label: "22", month: "Dec", status: "active", gap: true },
  { label: "23", month: "Dec", status: "active", gap: true },
  { label: "24", month: "Dec", status: "active" },
  { label: "25", month: "Dec", status: "active" },
  { label: "26", month: "Dec", status: "active" },
  { label: "27", month: "Dec", status: "active" },
  { label: "28", month: "Dec", status: "active" },
  { label: "29", month: "Dec", status: "active" },
  { label: "30", month: "Dec", status: "active" },
  { label: "31", month: "Dec", status: "active" },
  { label: "01", month: "Jan", status: "active" },
  { label: "02", month: "Jan", status: "active" },
  { label: "03", month: "Jan", status: "active" },
  { label: "04", month: "Jan", status: "active" },
  { label: "05", month: "Jan", status: "active" },
  { label: "06", month: "Jan", status: "active" },
  { label: "07", month: "Jan", status: "priority", heart: true },
  { label: "08", month: "Jan", status: "priority" },
  { label: "09", month: "Jan", status: "priority" },
  { label: "10", month: "Jan", status: "priority", today: true },
];

function gapIndicesOf(days) {
  return days.reduce((acc, d, i) => (d.gap ? [...acc, i] : acc), []);
}

const GAP_IDX = gapIndicesOf(chartDays);

function buildDayScale(containerId, days = chartDays) {
  document.getElementById(containerId).innerHTML = days
    .map((d) => `<span>${d.today ? `<span class="today">${d.label}</span>` : d.label}</span>`)
    .join("");
}

/* ---------------- Week / Month range toggle (Recordings) ---------------- */
let rangeMode = "month";

function visibleDays() {
  return rangeMode === "week" ? chartDays.slice(-7) : chartDays;
}

function sliceForRange(arr) {
  return rangeMode === "week" ? arr.slice(-7) : arr;
}

function monthRowHtml(days) {
  const months = [];
  days.forEach((d) => { if (!months.includes(d.month)) months.push(d.month); });
  return months.map((m) => `<span>${m}</span>`).join("");
}

function setMonthRow(id, days) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = monthRowHtml(days);
}

/* ---------------- Overview chart (status timeline -- not clinical values) ---------------- */
const FALLBACK_COL_W = 40;
const PAD = 30;
const CHART_H = 150;
const Y = { baseline: 118, active: 71, priority: 62 };

let COL_W = FALLBACK_COL_W;
let CHART_W = PAD * 2 + (chartDays.length - 1) * COL_W;

function xAt(i) { return PAD + i * COL_W; }
function yAt(d) { return Y[d.status]; }

function buildOverviewChart() {
  const wrapEl = document.getElementById("overviewChartWrap");
  const available = wrapEl.clientWidth || 0;
  CHART_W = Math.max(400, available);
  COL_W = (CHART_W - PAD * 2) / (chartDays.length - 1);

  const pts = chartDays.map((d, i) => ({ x: xAt(i), y: yAt(d), d }));

  const baselineIdx = chartDays.findIndex((d) => d.status !== "baseline");
  const priorityIdx = chartDays.findIndex((d) => d.status === "priority");

  const baselinePts = pts.slice(0, baselineIdx);
  const activePts = pts.slice(baselineIdx - 1, priorityIdx);
  const priorityPts = pts.slice(priorityIdx - 1);

  const toPoly = (arr) => arr.map((p) => `${p.x},${p.y}`).join(" ");

  const hatchX = xAt(GAP_IDX[0]) - COL_W / 2;
  const hatchW = xAt(GAP_IDX[GAP_IDX.length - 1]) - xAt(GAP_IDX[0]) + COL_W;

  let markers = "";
  pts.forEach((p) => {
    if (p.d.gap) return;
    if (p.d.status === "baseline") {
      markers += `<rect x="${p.x - 4}" y="${p.y - 4}" width="8" height="8" rx="2" fill="#C9CFD6" />`;
    } else if (p.d.status === "active") {
      markers += `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#fff" stroke="#3FBE84" stroke-width="2" />`;
    } else if (p.d.status === "priority") {
      markers += `<circle cx="${p.x}" cy="${p.y}" r="5.5" fill="#F16C6C" />`;
    }
    if (p.d.heart) {
      markers += `<path transform="translate(${p.x - 9}, ${p.y - 40})" d="M9 16C9 16 1 10.9 1 5.7C1 3 3.1 1.2 5.4 1.2C6.6 1.2 7.5 1.7 9 2.9C10.5 1.7 11.4 1.2 12.6 1.2C14.9 1.2 17 3 17 5.7C17 10.9 9 16 9 16Z" fill="#F16C6C"/>`;
    }
  });

  const svg = `
    <svg class="chart-svg" viewBox="0 0 ${CHART_W} ${CHART_H}" width="${CHART_W}" height="${CHART_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
        </pattern>
      </defs>
      <rect x="${hatchX}" y="6" width="${hatchW}" height="${CHART_H - 24}" fill="url(#hatch)" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />
      <polyline points="${toPoly(baselinePts)}" fill="none" stroke="#C9CFD6" stroke-width="2.5" />
      <polyline points="${toPoly(activePts)}" fill="none" stroke="#3FBE84" stroke-width="2.5" />
      <polyline points="${toPoly(priorityPts)}" fill="none" stroke="#F16C6C" stroke-width="2.5" />
      ${markers}
    </svg>`;

  document.getElementById("overviewChartWrap").innerHTML = svg;
  buildDayScale("chartDayScale");
}

buildOverviewChart();

let overviewResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(overviewResizeTimer);
  overviewResizeTimer = setTimeout(buildOverviewChart, 150);
});

/* ---------------- Recordings: presence/absence only, never content ---------------- */
const recordingStatus = [
  "valid", "valid", "valid", "none", "valid", "valid", "none", "none", "none", "low",
  "none", "none", "valid",
  "valid", "valid", "valid", "valid", "none", "valid", "valid", "valid",
  "valid", "none", "valid", "valid", "valid", "none", "low", "low", "valid", "valid",
];

function buildRecordings() {
  const days = visibleDays();
  const status = sliceForRange(recordingStatus);
  const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.getElementById("recordingsRow").innerHTML = days
    .map((d, i) => {
      const s = status[i];
      let icon = "";
      let cls = "rec-none";
      if (s === "valid") { cls = "rec-valid"; icon = checkIcon; }
      else if (s === "low") { cls = "rec-low"; icon = "!"; }
      return `
        <div class="rec-day">
          <div class="rec-icon ${cls}">${icon}</div>
          <span class="rec-day-label">${d.label}</span>
        </div>`;
    })
    .join("");
  setMonthRow("recMonthRow", days);
}

buildRecordings();

document.querySelectorAll(".range-toggle span").forEach((r) => {
  r.addEventListener("click", () => {
    document.querySelectorAll(".range-toggle span").forEach((s) => s.classList.remove("active"));
    r.classList.add("active");
    rangeMode = r.dataset.range || "month";
    buildRecordings();
  });
});

/* ---------------- History events (administrative categories only) ---------------- */
const pendingAccountHistory = JSON.parse(localStorage.getItem("hearoAccountHistory") || "[]");
localStorage.removeItem("hearoAccountHistory");

let history = [
  ...pendingAccountHistory,

  // Status -- administrative, no PHI
  { category: "status", color: "dot-red", label: "Status changed to Priority", date: "01.09.2026" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.24.2025" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.16.2025" },
  { category: "status", color: "dot-gray", label: "Status changed to Baseline", date: "12.01.2025" },
  { category: "status", color: "dot-darkgray", label: "Status changed to Registered", date: "12.01.2025" },

  // Monitoring -- administrative; notes here describe operational status, not clinical findings
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "01.03.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "01.01.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "12.30.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.23.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.21.2025", note: "Patient forgot to record" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Missed recording", date: "12.20.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.16.2025" },
  { category: "monitoring", color: "dot-teal", label: "Baseline phase monitoring", date: "12.01.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.01.2025" },

  // Medication category dropped entirely (clinical PHI) -- see root js/patient-data.js
  // for the Medication events this demo dataset otherwise includes.

  // Other -- dropped: care-recommendation entries (medication names) and chat
  // "Message sent to patient" entries (Chat is removed entirely). Kept only
  // the operational ones, with clinical narrative stripped from notes.
  { category: "other", color: "dot-blue", label: "Action taken: Contacted", date: "12.20.2025", note: "Patient forgot to record; reminder sent" },
  { category: "other", color: "dot-blue", label: "Operational difficulty", date: "12.10.2025", note: "Patient reported transportation issues and is unable to attend clinic visits" },

  // Account -- administrative; staff names in notes are not patient PHI
  { category: "account", color: "dot-blue", label: "Account changed to Enabled", date: "12.28.2025", note: "Changed by Dr. Sarah Mitchell" },
  { category: "account", color: "dot-slate", label: "Account changed to Paused", date: "12.20.2025", note: "Changed by Dr. Sarah Mitchell" },
  { category: "account", color: "dot-blue", label: "Account is Enabled", date: "08.28.2025" },
];

function parseHistoryDate(str) {
  const [m, d, y] = str.split(".").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const HISTORY_PAGE_SIZE = 12;
let activeHistoryTab = "all";
let historyVisibleCount = HISTORY_PAGE_SIZE;

function filteredHistory() {
  const items = activeHistoryTab === "all" ? history : history.filter((h) => h.category === activeHistoryTab);
  return [...items].sort((a, b) => parseHistoryDate(b.date) - parseHistoryDate(a.date));
}

function renderHistory() {
  const items = filteredHistory();
  const visible = items.slice(0, historyVisibleCount);

  document.getElementById("historyRows").innerHTML = visible
    .map(
      (h) => `
    <tr>
      <td><span class="event-dot"><span class="dot ${h.color}"></span>${h.label}</span></td>
      <td>${h.date}</td>
      <td>${
        h.note
          ? h.note
          : `<button type="button" class="add-note-link" data-index="${history.indexOf(h)}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Add Note</button>`
      }</td>
    </tr>`
    )
    .join("");

  const loadMoreRow = document.getElementById("historyLoadMoreRow");
  loadMoreRow.style.display = items.length > historyVisibleCount ? "flex" : "none";

  fitTableToRows(".history-table-scroll", 6);
}

renderHistory();

document.querySelectorAll(".history-tabs span").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".history-tabs span").forEach((s) => s.classList.remove("active"));
    t.classList.add("active");
    activeHistoryTab = t.dataset.tab;
    historyVisibleCount = HISTORY_PAGE_SIZE;
    renderHistory();
  });
});

document.getElementById("historyLoadMoreBtn").addEventListener("click", () => {
  historyVisibleCount += HISTORY_PAGE_SIZE;
  renderHistory();
});

/* ---------------- Shared custom-select plumbing (used by Add Event / Update Account) ---------------- */
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

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

document.querySelectorAll(".custom-select").forEach(wireCustomSelect);
document.addEventListener("click", closeAllCustomSelects);
document.addEventListener("scroll", closeAllCustomSelects, true);
window.addEventListener("resize", closeAllCustomSelects);

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

/* ---------------- Add Event modal ---------------- */
const addEventOverlay = document.getElementById("addEventOverlay");
const addEventForm = document.getElementById("addEventForm");
const saveAddEvent = document.getElementById("saveAddEvent");

const CATEGORY_DOT = { account: "dot-blue", status: "dot-green", monitoring: "dot-teal", other: "dot-blue" };

function formatTimeLabel(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function validateAddEventForm() {
  const valid = addEventForm.category.value !== "" && addEventForm.label.value.trim() !== "" && addEventForm.date.value !== "";
  saveAddEvent.disabled = !valid;
  saveAddEvent.classList.toggle("enabled", valid);
}

addEventForm.addEventListener("input", validateAddEventForm);
addEventForm.addEventListener("change", validateAddEventForm);

document.getElementById("openAddEventBtn").addEventListener("click", () => {
  addEventForm.reset();
  resetCustomSelectsIn(addEventForm);
  validateAddEventForm();
  addEventOverlay.classList.add("open");
});

function closeAddEventModal() { addEventOverlay.classList.remove("open"); }
document.getElementById("cancelAddEvent").addEventListener("click", closeAddEventModal);
addEventOverlay.addEventListener("click", (e) => { if (e.target === addEventOverlay) closeAddEventModal(); });

addEventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddEvent.disabled) return;

  const [y, m, d] = addEventForm.date.value.split("-");
  const note = addEventForm.note.value.trim();
  const timeNote = addEventForm.time.value ? `Acknowledged at ${formatTimeLabel(addEventForm.time.value)}` : "";

  history.unshift({
    category: addEventForm.category.value,
    color: CATEGORY_DOT[addEventForm.category.value],
    label: addEventForm.label.value.trim(),
    date: `${m}.${d}.${y}`,
    note: [timeNote, note].filter(Boolean).join(" — ") || undefined,
  });

  closeAddEventModal();
  renderHistory();
});

/* ---------------- Add Note modal ---------------- */
const addNoteOverlay = document.getElementById("addNoteOverlay");
const addNoteForm = document.getElementById("addNoteForm");
const saveAddNote = document.getElementById("saveAddNote");
let addNoteTargetIndex = null;

function validateAddNoteForm() {
  const valid = addNoteForm.note.value.trim() !== "";
  saveAddNote.disabled = !valid;
  saveAddNote.classList.toggle("enabled", valid);
}

addNoteForm.addEventListener("input", validateAddNoteForm);

function closeAddNoteModal() { addNoteOverlay.classList.remove("open"); }
document.getElementById("cancelAddNote").addEventListener("click", closeAddNoteModal);
addNoteOverlay.addEventListener("click", (e) => { if (e.target === addNoteOverlay) closeAddNoteModal(); });

document.getElementById("historyRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-note-link");
  if (!btn) return;
  addNoteTargetIndex = Number(btn.dataset.index);
  addNoteForm.reset();
  validateAddNoteForm();
  document.getElementById("addNoteEventLabel").textContent = history[addNoteTargetIndex].label;
  addNoteOverlay.classList.add("open");
});

addNoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddNote.disabled || addNoteTargetIndex === null) return;
  history[addNoteTargetIndex].note = addNoteForm.note.value.trim();
  closeAddNoteModal();
  renderHistory();
});

/* ---------------- Patient header kebab: Update account / Reset password ----------------
   (Edit patient is intentionally not offered here -- see patient-data.html.) */
const patientHeaderKebab = document.getElementById("patientHeaderKebab");
const patientHeaderMenu = document.getElementById("patientHeaderMenu");

if (patientHeaderKebab && patientHeaderMenu) {
  patientHeaderKebab.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !patientHeaderMenu.classList.contains("open");
    patientHeaderMenu.classList.remove("open");
    if (willOpen) {
      const rect = patientHeaderKebab.getBoundingClientRect();
      patientHeaderMenu.style.top = `${rect.bottom + 6}px`;
      patientHeaderMenu.style.left = `${rect.right - 190}px`;
      patientHeaderMenu.classList.add("open");
    }
  });

  document.addEventListener("click", (e) => {
    if (!patientHeaderMenu.contains(e.target) && e.target !== patientHeaderKebab) {
      patientHeaderMenu.classList.remove("open");
    }
  });

  patientHeaderMenu.addEventListener("click", (e) => {
    const item = e.target.closest(".row-menu-item");
    if (!item) return;
    patientHeaderMenu.classList.remove("open");
    if (item.dataset.action === "account") openUpdateAccountModal();
    else if (item.dataset.action === "reset") openResetPasswordModal();
  });
}

/* ---------------- Update Account modal ---------------- */
const updateAccountOverlay = document.getElementById("updateAccountOverlay");
const updateAccountSubtitle = document.getElementById("updateAccountSubtitle");
const discontinueReasonField = document.getElementById("discontinueReasonField");
const discontinueReasonSelect = document.getElementById("discontinueReasonSelect");
const discontinueReasonInput = discontinueReasonSelect.querySelector('input[type=hidden]');
const discontinueReasonOtherField = document.getElementById("discontinueReasonOtherField");
const discontinueReasonOther = document.getElementById("discontinueReasonOther");
const saveUpdateAccount = document.getElementById("saveUpdateAccount");
const accountActionRadios = document.querySelectorAll('input[name="accountAction"]');

function validateUpdateAccountForm() {
  const selected = document.querySelector('input[name="accountAction"]:checked');
  let valid = !!selected;
  if (selected && selected.value === "Discontinued") {
    valid = discontinueReasonInput.value !== "" &&
      (discontinueReasonInput.value !== "Other" || discontinueReasonOther.value.trim() !== "");
  }
  saveUpdateAccount.disabled = !valid;
  saveUpdateAccount.classList.toggle("enabled", valid);
}

accountActionRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) discontinueReasonField.style.display = radio.value === "Discontinued" ? "block" : "none";
    if (radio.checked && radio.value !== "Discontinued") {
      discontinueReasonOtherField.style.display = "none";
    }
    validateUpdateAccountForm();
  });
});

discontinueReasonInput.addEventListener("change", () => {
  discontinueReasonOtherField.style.display = discontinueReasonInput.value === "Other" ? "block" : "none";
  validateUpdateAccountForm();
});

discontinueReasonOther.addEventListener("input", validateUpdateAccountForm);

function openUpdateAccountModal() {
  updateAccountSubtitle.textContent = document.getElementById("patientIdHeading").textContent;
  accountActionRadios.forEach((radio) => (radio.checked = false));
  discontinueReasonField.style.display = "none";
  discontinueReasonOtherField.style.display = "none";
  setCustomSelectValue(discontinueReasonSelect, "", { silent: true });
  discontinueReasonOther.value = "";
  validateUpdateAccountForm();
  updateAccountOverlay.classList.add("open");
}

function closeUpdateAccountModal() { updateAccountOverlay.classList.remove("open"); }
document.getElementById("cancelUpdateAccount").addEventListener("click", closeUpdateAccountModal);
updateAccountOverlay.addEventListener("click", (e) => { if (e.target === updateAccountOverlay) closeUpdateAccountModal(); });
saveUpdateAccount.addEventListener("click", () => { if (!saveUpdateAccount.disabled) closeUpdateAccountModal(); });

/* ---------------- Reset Password modal ---------------- */
const resetPasswordOverlay = document.getElementById("resetPasswordOverlay");

function openResetPasswordModal() { resetPasswordOverlay.classList.add("open"); }
function closeResetPasswordModal() { resetPasswordOverlay.classList.remove("open"); }

document.getElementById("cancelResetPassword").addEventListener("click", closeResetPasswordModal);
resetPasswordOverlay.addEventListener("click", (e) => { if (e.target === resetPasswordOverlay) closeResetPasswordModal(); });
document.getElementById("confirmResetPassword").addEventListener("click", closeResetPasswordModal);
