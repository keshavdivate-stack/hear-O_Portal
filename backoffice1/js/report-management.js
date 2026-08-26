/* ==========================================================
   Report Management — redesigned per the UX/UI revamp brief.

   Design notes (why the structure is what it is):
   - Report, Schedule, and Delivery are kept as three separate concepts.
     A Report (e.g. "Missed Recordings") is just content. A Schedule is an
     automated delivery config for a report — it's the thing an admin
     actually manages day to day (editable, pausable, deletable, has its
     own recipients/next-run). A Delivery is a record that a report was
     actually generated and sent, whether by schedule or by Send Report.
   - Scheduled Reports is a flat table: ONE ROW = ONE SCHEDULE. No
     accordion — status and next run must be visible without expanding
     anything, so schedules that belong to the same report are just
     separate rows that happen to share a Report label.
   - Report History is a separate tab/table from Scheduled Reports so
     "what's configured to run" and "what actually got sent" are never
     mixed together.
   - Clicking a schedule row opens a read-only details drawer (not an
     inline expansion) with Edit/Pause/Delete actions; the row's kebab
     menu offers the same actions for users who don't want to open the
     drawer first.
   - "Create New" -> "+ Schedule Report" and "Manual" -> "Send Report",
     because the old labels didn't say what the action actually does.
   - Schedule Report and Send Report are both single-screen drawers (no
     wizard), keeping to the same fields the old system had. Send Report
     carries an explicit "this is immediate, not a schedule" note, since
     it's meant to feel lighter-weight than creating a recurring delivery.
   ========================================================== */

const rmKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;
const rmPeopleIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`;

const rmStatusPillClass = { Active: "bo-pill-active", Paused: "bo-pill-paused" };
const rmDeliveryPillClass = { Delivered: "bo-pill-delivered", Failed: "bo-pill-failed", Processing: "bo-pill-processing" };
const rmStatusPill = (s) => `<span class="bo-pill ${rmStatusPillClass[s] || ""}">${s}</span>`;
const rmDeliveryPill = (s) => `<span class="bo-pill ${rmDeliveryPillClass[s] || ""}">${s}</span>`;
const rmRecipientsChip = (count) => `<span class="bo-recipients-chip">${rmPeopleIcon}${count} ${count === 1 ? "person" : "people"}</span>`;

function rmEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }
function rmParseRecipients(str) { return String(str || "").split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean); }

/* ---------------- Tabs ---------------- */
document.querySelectorAll("#rmTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#rmTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Shared bo-select machinery ---------------- */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const option = select.querySelector(`.bo-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".bo-select-option").forEach((o) => o.classList.remove("selected"));

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

function resetBoSelect(select) {
  setBoSelectValue(select, "", { silent: true });
}

function positionBoSelectMenu(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const menu = select.querySelector(".bo-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 240) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function wireBoSelect(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const valueEl = select.querySelector(".bo-select-value");
  valueEl.dataset.placeholder = valueEl.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    closeAllBoSelects();
    if (willOpen) {
      select.classList.add("open");
      positionBoSelectMenu(select);
    }
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-select-option");
    if (!option) return;
    setBoSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
}

document.querySelectorAll(".bo-select").forEach(wireBoSelect);
document.addEventListener("click", closeAllBoSelects);
document.addEventListener("scroll", closeAllBoSelects, true);
window.addEventListener("resize", closeAllBoSelects);

function buildSelectOptions(values) {
  return values
    .map(
      (v) => `
      <div class="bo-select-option" data-value="${rmEsc(v)}">${rmEsc(v)}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}

function buildFilterSelectOptions(values, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  return clearOption + buildSelectOptions(values);
}

/* ---------------- Scheduled Reports ---------------- */
let rmScheduleSearch = "";
let rmScheduleTypeFilter = "";
let rmScheduleOrgFilter = "";
let rmScheduleStatusFilter = "";
let rmScheduleFrequencyFilter = "";

document.getElementById("rmReportTypeFilterMenu").innerHTML = buildFilterSelectOptions(RM_REPORTS.map((r) => r.label), "All report types");
document.getElementById("rmOrgFilterMenu").innerHTML = buildFilterSelectOptions(RM_ORGS, "All organisations");
document.getElementById("rmStatusFilterMenu").innerHTML = buildFilterSelectOptions(RM_STATUSES, "All statuses");
document.getElementById("rmFrequencyFilterMenu").innerHTML = buildFilterSelectOptions(RM_FREQUENCIES, "All frequencies");

function rmFilteredSchedules() {
  return rmSchedules.filter((s) => {
    if (rmScheduleTypeFilter && rmReportLabel(s.reportKey) !== rmScheduleTypeFilter) return false;
    if (rmScheduleOrgFilter && s.org !== rmScheduleOrgFilter) return false;
    if (rmScheduleStatusFilter && s.status !== rmScheduleStatusFilter) return false;
    if (rmScheduleFrequencyFilter && s.frequency !== rmScheduleFrequencyFilter) return false;
    if (rmScheduleSearch) {
      const haystack = `${rmReportLabel(s.reportKey)} ${s.name} ${s.org}`.toLowerCase();
      if (!haystack.includes(rmScheduleSearch)) return false;
    }
    return true;
  });
}

function rmRenderScheduleRow(s) {
  return `
    <tr data-id="${s.id}">
      <td>
        <div class="bo-cell-primary">${rmEsc(rmReportLabel(s.reportKey))}</div>
        <div class="bo-cell-secondary">${rmEsc(s.name)}</div>
      </td>
      <td>${rmEsc(s.org)}</td>
      <td>${rmRecipientsChip(s.recipients.length)}</td>
      <td>
        <div class="bo-cell-primary">${s.frequency}</div>
        <div class="bo-cell-secondary">${s.time} ${s.timezone}</div>
      </td>
      <td>${s.nextRun}</td>
      <td>${rmStatusPill(s.status)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-id="${s.id}" aria-label="Row actions">${rmKebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const rmScheduleEmptyHtml = `
  <tr><td colspan="7">
    <div class="bo-empty-state">
      <svg class="bo-empty-state-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9H21"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
      <p class="bo-empty-state-title" id="rmScheduleEmptyTitle">No scheduled reports yet</p>
      <p class="bo-empty-state-sub" id="rmScheduleEmptySub">Set up an automated delivery so reports reach the right people on time.</p>
    </div>
  </td></tr>`;

const rmSchedulePager = boCreatePager("rmScheduleRows", () => rmFilteredSchedules(), rmRenderScheduleRow, { pageSize: 8, emptyHtml: rmScheduleEmptyHtml });

function rmScheduleFiltersActive() {
  return !!(rmScheduleSearch || rmScheduleTypeFilter || rmScheduleOrgFilter || rmScheduleStatusFilter || rmScheduleFrequencyFilter);
}

function rmRefreshScheduleEmptyState() {
  const titleEl = document.getElementById("rmScheduleEmptyTitle");
  const subEl = document.getElementById("rmScheduleEmptySub");
  if (!titleEl) return;
  if (rmScheduleFiltersActive()) {
    titleEl.textContent = "No reports match your filters";
    subEl.innerHTML = 'Try a different search, or <button type="button" class="bo-btn-text" id="rmClearScheduleFiltersInline" style="padding:0; font-size:inherit;">clear filters</button>.';
    document.getElementById("rmClearScheduleFiltersInline").addEventListener("click", rmClearScheduleFilters);
  } else {
    titleEl.textContent = "No scheduled reports yet";
    subEl.textContent = "Set up an automated delivery so reports reach the right people on time.";
  }
}

function rmRenderSchedules() {
  rmSchedulePager();
  rmRefreshScheduleEmptyState();
}
rmRenderSchedules();

document.getElementById("rmSearchInput").addEventListener("input", (e) => {
  rmScheduleSearch = e.target.value.trim().toLowerCase();
  rmSchedulePager.resetPage();
  rmRenderSchedules();
});
document.getElementById("rmReportTypeFilter").addEventListener("change", (e) => { rmScheduleTypeFilter = e.target.value; rmSchedulePager.resetPage(); rmRenderSchedules(); });
document.getElementById("rmOrgFilter").addEventListener("change", (e) => { rmScheduleOrgFilter = e.target.value; rmSchedulePager.resetPage(); rmRenderSchedules(); });
document.getElementById("rmStatusFilter").addEventListener("change", (e) => { rmScheduleStatusFilter = e.target.value; rmSchedulePager.resetPage(); rmRenderSchedules(); });
document.getElementById("rmFrequencyFilter").addEventListener("change", (e) => { rmScheduleFrequencyFilter = e.target.value; rmSchedulePager.resetPage(); rmRenderSchedules(); });

function rmClearScheduleFilters() {
  rmScheduleSearch = "";
  rmScheduleTypeFilter = "";
  rmScheduleOrgFilter = "";
  rmScheduleStatusFilter = "";
  rmScheduleFrequencyFilter = "";
  document.getElementById("rmSearchInput").value = "";
  document.querySelectorAll('#tab-scheduled .bo-select').forEach(resetBoSelect);
  rmSchedulePager.resetPage();
  rmRenderSchedules();
}
document.getElementById("rmClearScheduleFiltersBtn").addEventListener("click", rmClearScheduleFilters);

/* ---------------- Report History ---------------- */
let rmHistReportFilter = "";
let rmHistOrgFilter = "";
let rmHistStatusFilter = "";

document.getElementById("rmHistReportFilterMenu").innerHTML = buildFilterSelectOptions(RM_REPORTS.map((r) => r.label), "All reports");
document.getElementById("rmHistOrgFilterMenu").innerHTML = buildFilterSelectOptions(RM_ORGS, "All organisations");
document.getElementById("rmHistStatusFilterMenu").innerHTML = buildFilterSelectOptions(RM_DELIVERY_STATUSES, "All delivery statuses");

function rmFilteredHistory() {
  return rmHistory.filter((h) => {
    if (rmHistReportFilter && rmReportLabel(h.reportKey) !== rmHistReportFilter) return false;
    if (rmHistOrgFilter && h.org !== rmHistOrgFilter) return false;
    if (rmHistStatusFilter && h.status !== rmHistStatusFilter) return false;
    return true;
  });
}

function rmRenderHistoryRow(h) {
  return `
    <tr data-id="${h.id}">
      <td>${rmEsc(rmReportLabel(h.reportKey))}</td>
      <td>${rmEsc(h.org)}</td>
      <td>${h.sentOn}</td>
      <td>${rmRecipientsChip(h.recipients)}</td>
      <td>${rmDeliveryPill(h.status)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-id="${h.id}" aria-label="Row actions">${rmKebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const rmHistoryEmptyHtml = `
  <tr><td colspan="6">
    <div class="bo-empty-state">
      <svg class="bo-empty-state-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
      <p class="bo-empty-state-title" id="rmHistoryEmptyTitle">No deliveries yet</p>
      <p class="bo-empty-state-sub" id="rmHistoryEmptySub">Reports that are sent — scheduled or manual — will show up here.</p>
    </div>
  </td></tr>`;

const rmHistoryPager = boCreatePager("rmHistoryRows", () => rmFilteredHistory(), rmRenderHistoryRow, { pageSize: 8, emptyHtml: rmHistoryEmptyHtml });

function rmHistoryFiltersActive() {
  return !!(rmHistReportFilter || rmHistOrgFilter || rmHistStatusFilter);
}

function rmRefreshHistoryEmptyState() {
  const titleEl = document.getElementById("rmHistoryEmptyTitle");
  const subEl = document.getElementById("rmHistoryEmptySub");
  if (!titleEl) return;
  if (rmHistoryFiltersActive()) {
    titleEl.textContent = "No reports match your filters";
    subEl.innerHTML = 'Try different filters, or <button type="button" class="bo-btn-text" id="rmClearHistoryFiltersInline" style="padding:0; font-size:inherit;">clear filters</button>.';
    document.getElementById("rmClearHistoryFiltersInline").addEventListener("click", rmClearHistoryFilters);
  } else {
    titleEl.textContent = "No deliveries yet";
    subEl.textContent = "Reports that are sent — scheduled or manual — will show up here.";
  }
}

function rmRenderHistory() {
  rmHistoryPager();
  rmRefreshHistoryEmptyState();
}
rmRenderHistory();

document.getElementById("rmHistReportFilter").addEventListener("change", (e) => { rmHistReportFilter = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistOrgFilter").addEventListener("change", (e) => { rmHistOrgFilter = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistStatusFilter").addEventListener("change", (e) => { rmHistStatusFilter = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });

function rmClearHistoryFilters() {
  rmHistReportFilter = "";
  rmHistOrgFilter = "";
  rmHistStatusFilter = "";
  document.querySelectorAll('#tab-history .bo-select').forEach(resetBoSelect);
  rmHistoryPager.resetPage();
  rmRenderHistory();
}
document.getElementById("rmClearHistoryFiltersBtn").addEventListener("click", rmClearHistoryFilters);

const rmHistoryRowMenu = document.getElementById("rmHistoryRowMenu");
let activeHistoryId = null;

document.getElementById("rmHistoryRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  const row = e.target.closest("tr[data-id]");
  if (!row) return;
  const id = Number(row.dataset.id);

  if (trigger) {
    e.stopPropagation();
    activeHistoryId = id;
    const rect = trigger.getBoundingClientRect();
    rmHistoryRowMenu.style.top = `${rect.bottom + 6}px`;
    rmHistoryRowMenu.style.left = `${rect.right - 200}px`;
    rmHistoryRowMenu.classList.add("open");
    return;
  }

  openHistoryDetails(id);
});

document.addEventListener("click", (e) => {
  if (!rmHistoryRowMenu.contains(e.target)) rmHistoryRowMenu.classList.remove("open");
});

rmHistoryRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeHistoryId === null) return;
  rmHistoryRowMenu.classList.remove("open");
  if (item.dataset.action === "view") openHistoryDetails(activeHistoryId);
});

/* ---------------- History delivery details drawer ---------------- */
const rmHistDetailsOverlay = document.getElementById("rmHistDetailsDrawerOverlay");

function openHistoryDetails(id) {
  const h = rmHistory.find((x) => x.id === id);
  if (!h) return;
  document.getElementById("rmHistDetailReport").textContent = rmReportLabel(h.reportKey);
  document.getElementById("rmHistDetailOrg").textContent = h.org;
  document.getElementById("rmHistDetailSentOn").textContent = h.sentOn;
  document.getElementById("rmHistDetailStatus").innerHTML = rmDeliveryPill(h.status);

  const failureSection = document.getElementById("rmHistDetailFailureSection");
  if (h.failureReason) {
    failureSection.hidden = false;
    document.getElementById("rmHistDetailFailureReason").textContent = h.failureReason;
  } else {
    failureSection.hidden = true;
  }

  rmHistDetailsOverlay.classList.add("open");
}

function closeHistoryDetails() { rmHistDetailsOverlay.classList.remove("open"); }
document.getElementById("rmCloseHistDetailsX").addEventListener("click", closeHistoryDetails);
document.getElementById("rmCloseHistDetailsBtn").addEventListener("click", closeHistoryDetails);
rmHistDetailsOverlay.addEventListener("click", (e) => { if (e.target === rmHistDetailsOverlay) closeHistoryDetails(); });

/* ---------------- Schedule row menu + details drawer ---------------- */
const rmScheduleRowMenu = document.getElementById("rmScheduleRowMenu");
let activeScheduleId = null;

document.getElementById("rmScheduleRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  const row = e.target.closest("tr[data-id]");
  if (!row) return;
  const id = Number(row.dataset.id);

  if (trigger) {
    e.stopPropagation();
    activeScheduleId = id;
    refreshScheduleRowMenuLabel();
    const rect = trigger.getBoundingClientRect();
    rmScheduleRowMenu.style.top = `${rect.bottom + 6}px`;
    rmScheduleRowMenu.style.left = `${rect.right - 190}px`;
    rmScheduleRowMenu.classList.add("open");
    return;
  }

  openScheduleDetails(id);
});

function refreshScheduleRowMenuLabel() {
  const s = rmSchedules.find((x) => x.id === activeScheduleId);
  const toggleItem = rmScheduleRowMenu.querySelector('[data-action="toggle"]');
  if (s && toggleItem) toggleItem.textContent = s.status === "Active" ? "Pause Schedule" : "Resume Schedule";
}

document.addEventListener("click", (e) => {
  if (!rmScheduleRowMenu.contains(e.target)) rmScheduleRowMenu.classList.remove("open");
});

function rmToggleScheduleStatus(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  s.status = s.status === "Active" ? "Paused" : "Active";
  s.nextRun = s.status === "Active" ? "Pending next cycle" : "—";
  rmRenderSchedules();
}

function rmDeleteSchedule(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  if (!confirm(`Delete "${s.name}"? This does not delete the underlying report — only this schedule.`)) return;
  rmSchedules.splice(rmSchedules.indexOf(s), 1);
  rmRenderSchedules();
}

rmScheduleRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeScheduleId === null) return;
  rmScheduleRowMenu.classList.remove("open");
  const id = activeScheduleId;

  if (item.dataset.action === "view") openScheduleDetails(id);
  else if (item.dataset.action === "edit") openWizardForEdit(id);
  else if (item.dataset.action === "toggle") rmToggleScheduleStatus(id);
  else if (item.dataset.action === "delete") rmDeleteSchedule(id);
});

const rmDetailsOverlay = document.getElementById("rmDetailsDrawerOverlay");
let rmDetailsScheduleId = null;

function openScheduleDetails(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  rmDetailsScheduleId = id;

  document.getElementById("rmDetailReport").textContent = rmReportLabel(s.reportKey);
  document.getElementById("rmDetailName").textContent = s.name;
  document.getElementById("rmDetailOrg").textContent = s.org;
  document.getElementById("rmDetailTags").textContent = s.tags.join(", ") || "—";
  document.getElementById("rmDetailFrequency").textContent = s.frequency;
  document.getElementById("rmDetailTime").textContent = `${s.time} ${s.timezone}`;
  document.getElementById("rmDetailStatus").innerHTML = rmStatusPill(s.status);
  document.getElementById("rmDetailRecipients").textContent = s.recipients.join(", ");
  document.getElementById("rmDetailLastSent").textContent = s.lastSent;
  document.getElementById("rmDetailLastDeliveryStatus").innerHTML = rmDeliveryPill(s.lastDeliveryStatus);
  document.getElementById("rmDetailNextRun").textContent = s.nextRun;

  document.getElementById("rmDetailToggleBtn").textContent = s.status === "Active" ? "Pause Schedule" : "Resume Schedule";

  rmDetailsOverlay.classList.add("open");
}

function closeScheduleDetails() { rmDetailsOverlay.classList.remove("open"); rmDetailsScheduleId = null; }
document.getElementById("rmCloseDetailsX").addEventListener("click", closeScheduleDetails);
rmDetailsOverlay.addEventListener("click", (e) => { if (e.target === rmDetailsOverlay) closeScheduleDetails(); });

document.getElementById("rmDetailToggleBtn").addEventListener("click", () => {
  if (rmDetailsScheduleId === null) return;
  rmToggleScheduleStatus(rmDetailsScheduleId);
  openScheduleDetails(rmDetailsScheduleId);
});

document.getElementById("rmDetailDeleteBtn").addEventListener("click", () => {
  if (rmDetailsScheduleId === null) return;
  const id = rmDetailsScheduleId;
  closeScheduleDetails();
  rmDeleteSchedule(id);
});

document.getElementById("rmDetailEditBtn").addEventListener("click", () => {
  if (rmDetailsScheduleId === null) return;
  const id = rmDetailsScheduleId;
  closeScheduleDetails();
  openWizardForEdit(id);
});

/* ---------------- Schedule Report (also used for Edit Schedule) ---------------- */
const rmWizardOverlay = document.getElementById("rmScheduleWizardOverlay");
const rmWizardForm = document.getElementById("rmWizardForm");
const rmWizardSaveBtn = document.getElementById("rmWizardSave");
let rmWizardEditingId = null;
let rmWizardSelectedTags = new Set();

document.getElementById("rmWizardReportMenu").innerHTML = RM_REPORTS.map(
  (r) => `<div class="bo-select-option" data-value="${r.key}">${r.label}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
).join("");
document.getElementById("rmWizardOrgMenu").innerHTML = buildSelectOptions(RM_ORGS);
document.getElementById("rmWizardFrequencyMenu").innerHTML = buildSelectOptions(RM_FREQUENCIES);
document.getElementById("rmWizardUsersMenu").innerHTML = buildSelectOptions(RM_DIRECTORY);

function renderWizardTags() {
  document.getElementById("rmWizardTags").innerHTML = RM_TAGS.map(
    (t) => `<label class="bo-checkbox-item"><input type="checkbox" data-wiz-tag="${t}" ${rmWizardSelectedTags.has(t) ? "checked" : ""} /> ${t}</label>`
  ).join("");
}

document.getElementById("rmWizardTags").addEventListener("change", (e) => {
  const box = e.target.closest("[data-wiz-tag]");
  if (!box) return;
  if (box.checked) rmWizardSelectedTags.add(box.dataset.wizTag);
  else rmWizardSelectedTags.delete(box.dataset.wizTag);
});

function computeNextRun(frequency) {
  if (frequency === "Daily") return "Tomorrow";
  if (frequency === "Weekly") return "Next week";
  if (frequency === "Monthly") return "Next month";
  return "—";
}

function validateWizardForm() {
  const reportOk = !!rmWizardForm.reportKey.value;
  const configOk = rmWizardForm.name.value.trim() !== "" && !!rmWizardForm.org.value;
  const scheduleOk = !!rmWizardForm.frequency.value;
  const recipientsOk = rmWizardForm.recipients.value.trim() !== "";
  rmWizardSaveBtn.disabled = !(reportOk && configOk && scheduleOk && recipientsOk);
}

rmWizardForm.addEventListener("input", validateWizardForm);
rmWizardForm.addEventListener("change", validateWizardForm);

function openWizardForCreate() {
  rmWizardEditingId = null;
  rmWizardSelectedTags = new Set();
  document.getElementById("rmWizardTitle").textContent = "Schedule Report";
  rmWizardSaveBtn.textContent = "Schedule Report";
  rmWizardForm.reset();
  rmWizardForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  renderWizardTags();
  validateWizardForm();
  rmWizardOverlay.classList.add("open");
}

function openWizardForEdit(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  rmWizardEditingId = id;
  rmWizardSelectedTags = new Set(s.tags);

  document.getElementById("rmWizardTitle").textContent = `Edit Schedule — ${s.name}`;
  rmWizardSaveBtn.textContent = "Save Changes";
  rmWizardForm.reset();

  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizReport"]'), s.reportKey, { silent: true });
  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizOrg"]'), s.org, { silent: true });
  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizUsers"]'), s.usersFilter || "", { silent: true });
  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizFrequency"]'), s.frequency, { silent: true });
  rmWizardForm.name.value = s.name;
  rmWizardForm.title.value = s.title || "";
  rmWizardForm.dateFrom.value = s.dateFrom || "";
  rmWizardForm.dateTo.value = s.dateTo || "";
  rmWizardForm.recipients.value = (s.recipients || []).join(", ");
  const [hh, mm] = s.time.replace(/\s*[AP]M/i, "").split(":");
  rmWizardForm.hh.value = hh || "9";
  rmWizardForm.mm.value = mm || "0";

  renderWizardTags();
  validateWizardForm();
  rmWizardOverlay.classList.add("open");
}

function closeWizard() { rmWizardOverlay.classList.remove("open"); }

document.getElementById("rmScheduleReportBtn").addEventListener("click", openWizardForCreate);
document.getElementById("rmCancelWizard").addEventListener("click", closeWizard);
document.getElementById("rmCloseWizardX").addEventListener("click", closeWizard);
rmWizardOverlay.addEventListener("click", (e) => { if (e.target === rmWizardOverlay) closeWizard(); });

rmWizardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rmWizardSaveBtn.disabled) return;

  const reportKey = rmWizardForm.reportKey.value;
  const title = rmWizardForm.title.value.trim();
  const org = rmWizardForm.org.value;
  const usersFilter = rmWizardForm.usersFilter.value;
  const frequency = rmWizardForm.frequency.value;
  const timezone = "GMT";
  const hh = String(rmWizardForm.hh.value || "0").padStart(2, "0");
  const mm = String(rmWizardForm.mm.value || "0").padStart(2, "0");
  const time = `${hh}:${mm}`;
  const tags = Array.from(rmWizardSelectedTags);
  const recipients = rmParseRecipients(rmWizardForm.recipients.value);
  const nextRun = `${computeNextRun(frequency)}, ${time} ${timezone}`;
  const dateFrom = rmWizardForm.dateFrom.value;
  const dateTo = rmWizardForm.dateTo.value;

  if (rmWizardEditingId === null) {
    const nextId = rmSchedules.length ? Math.max(...rmSchedules.map((s) => s.id)) + 1 : 0;
    rmSchedules.unshift({
      id: nextId,
      reportKey,
      name: rmWizardForm.name.value.trim(),
      title,
      org,
      usersFilter,
      tags,
      frequency,
      time,
      timezone,
      dateFrom,
      dateTo,
      recipients,
      status: "Active",
      lastSent: "—",
      lastDeliveryStatus: "Processing",
      nextRun,
    });
  } else {
    const s = rmSchedules.find((x) => x.id === rmWizardEditingId);
    if (s) Object.assign(s, { reportKey, name: rmWizardForm.name.value.trim(), title, org, usersFilter, tags, frequency, time, timezone, dateFrom, dateTo, recipients, nextRun });
  }

  closeWizard();
  rmRenderSchedules();
});

/* ---------------- Send Report — immediate, one-time delivery ---------------- */
const rmSendOverlay = document.getElementById("rmSendReportOverlay");
const rmSendForm = document.getElementById("rmSendForm");
const rmSendBtn = document.getElementById("rmSendBtn");
let rmSendSelectedTags = new Set();

document.getElementById("rmSendReportMenu").innerHTML = RM_REPORTS.map(
  (r) => `<div class="bo-select-option" data-value="${r.key}">${r.label}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
).join("");
document.getElementById("rmSendOrgMenu").innerHTML = buildSelectOptions(RM_ORGS);

function renderSendTags() {
  document.getElementById("rmSendTags").innerHTML = RM_TAGS.map(
    (t) => `<label class="bo-checkbox-item"><input type="checkbox" data-send-tag="${t}" ${rmSendSelectedTags.has(t) ? "checked" : ""} /> ${t}</label>`
  ).join("");
}

document.getElementById("rmSendTags").addEventListener("change", (e) => {
  const box = e.target.closest("[data-send-tag]");
  if (!box) return;
  if (box.checked) rmSendSelectedTags.add(box.dataset.sendTag);
  else rmSendSelectedTags.delete(box.dataset.sendTag);
});

function validateSendForm() {
  const ok = !!rmSendForm.reportKey.value && !!rmSendForm.org.value && rmSendForm.recipients.value.trim() !== "";
  rmSendBtn.disabled = !ok;
}
rmSendForm.addEventListener("input", validateSendForm);
rmSendForm.addEventListener("change", validateSendForm);

function openSendReport() {
  rmSendSelectedTags = new Set();
  rmSendForm.reset();
  rmSendForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  renderSendTags();
  validateSendForm();
  rmSendOverlay.classList.add("open");
}
function closeSendReport() { rmSendOverlay.classList.remove("open"); }

document.getElementById("rmSendReportBtn").addEventListener("click", openSendReport);
document.getElementById("rmCancelSend").addEventListener("click", closeSendReport);
document.getElementById("rmCloseSendX").addEventListener("click", closeSendReport);
rmSendOverlay.addEventListener("click", (e) => { if (e.target === rmSendOverlay) closeSendReport(); });

rmSendForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rmSendBtn.disabled) return;

  const reportKey = rmSendForm.reportKey.value;
  const org = rmSendForm.org.value;
  const title = rmSendForm.title.value.trim();
  const email = rmSendForm.email.value.trim();
  const fromDate = rmSendForm.fromDate.value;
  const toDate = rmSendForm.toDate.value;
  const recipients = rmParseRecipients(rmSendForm.recipients.value);
  const now = new Date();
  const sentOn = `Today, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const nextId = rmHistory.length ? Math.max(...rmHistory.map((h) => h.id)) + 1 : 0;
  rmHistory.unshift({ id: nextId, reportKey, org, title, email, fromDate, toDate, sentOn, recipients: recipients.length, status: "Processing" });

  closeSendReport();
  rmRenderHistory();

  const tab = document.querySelector('#rmTabs .bo-tab[data-tab="history"]');
  if (tab) tab.click();
});
