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

/* Matches the old system's Scheduled Reports table: Schedule type / Days of
   week / Report Time (GMT), plain values -- no relative "Tomorrow"/"Mon"
   phrasing, since Days of week + Report Time already say when it runs. */
const RM_DAY_ABBR = { Sunday: "SUN", Monday: "MON", Tuesday: "TUE", Wednesday: "WED", Thursday: "THU", Friday: "FRI", Saturday: "SAT" };
function rmDaysOfWeekLabel(s) {
  if (s.frequency === "Daily") return "All days";
  if (s.frequency === "Weekly") return s.days && s.days.length ? s.days.map((d) => RM_DAY_ABBR[d] || d).join(", ") : "—";
  return "—";
}
const rmReportTimeLabel = (s) => `${s.time} (${s.timezone})`;

const rmStatusPillClass = { Active: "bo-pill-active", Paused: "bo-pill-paused" };
const rmDeliveryPillClass = { Delivered: "bo-pill-delivered", Failed: "bo-pill-failed", Partial: "bo-pill-partial", Processing: "bo-pill-processing" };
const rmStatusPill = (s) => `<span class="bo-pill ${rmStatusPillClass[s] || ""}">${s}</span>`;
const rmDeliveryPill = (s) => `<span class="bo-pill ${rmDeliveryPillClass[s] || ""}">${s}</span>`;
/* "N people"/"1 person" is just a plain label -- no hover tooltip. */
function rmRecipientsChip(namesOrCount) {
  const names = Array.isArray(namesOrCount) ? namesOrCount : null;
  const count = names ? names.length : namesOrCount;
  return `<span class="bo-recipients-chip">${rmPeopleIcon}${count} ${count === 1 ? "person" : "people"}</span>`;
}

function rmEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }
const rmScheduleIdLabel = (id) => `RPT-${String(id + 1).padStart(4, "0")}`;
function rmParseRecipients(str) { return String(str || "").split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean); }

/* ---------------- Tabs ---------------- */
/* Download Report only makes sense against a delivery that's already
   happened, so it only shows on Report History -- Scheduled Reports and
   Archived Reports don't have anything to download yet. */
document.querySelectorAll("#rmTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#rmTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    document.getElementById("rmDownloadReportBtn").hidden = tab.dataset.tab !== "history";
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

/* Only offer report types that actually appear in the given rows, rather than
   every report type that has ever existed, so the filter can't list options
   with nothing to show. */
function rmReportTypeLabelsInUse(rows) {
  const keysInUse = new Set(rows.map((r) => r.reportKey));
  return RM_REPORTS.filter((r) => keysInUse.has(r.key)).map((r) => r.label);
}

/* ---------------- Scheduled Reports ---------------- */
let rmScheduleSearch = "";
let rmScheduleTypeFilter = "";
let rmScheduleOrgFilter = "";
let rmScheduleStatusFilter = "";
let rmScheduleFrequencyFilter = "";

document.getElementById("rmReportTypeFilterMenu").innerHTML = buildFilterSelectOptions(rmReportTypeLabelsInUse(rmSchedules.filter((s) => !s.archived)), "All report types");
document.getElementById("rmOrgFilterMenu").innerHTML = buildFilterSelectOptions(RM_ORGS, "All organisations");
document.getElementById("rmStatusFilterMenu").innerHTML = buildFilterSelectOptions(RM_STATUSES, "All statuses");
document.getElementById("rmFrequencyFilterMenu").innerHTML = buildFilterSelectOptions(RM_FREQUENCIES, "All frequencies");

function rmFilteredSchedules() {
  return rmSchedules.filter((s) => {
    if (s.archived) return false;
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
      <td class="mono">${rmScheduleIdLabel(s.id)}</td>
      <td>
        <div class="bo-cell-primary">${rmEsc(rmReportLabel(s.reportKey))}</div>
      </td>
      <td>${rmEsc(s.name)}</td>
      <td>${s.tags.length ? `<div class="bo-ehr-tags">${s.tags.map((t) => `<span class="bo-ehr-tag">${rmEsc(t)}</span>`).join("")}</div>` : `<span class="bo-ehr-none">—</span>`}</td>
      <td>${rmEsc(s.org)}</td>
      <td>${rmRecipientsChip(s.recipients)}</td>
      <td>${s.frequency}</td>
      <td>${rmDaysOfWeekLabel(s)}</td>
      <td>${rmReportTimeLabel(s)}</td>
      <td>${s.archived ? `<span class="bo-pill bo-pill-archived">Archived</span>` : rmStatusPill(s.status)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-id="${s.id}" aria-label="Row actions">${rmKebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const rmScheduleEmptyHtml = `
  <tr><td colspan="11">
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

/* ---------------- Archived Reports ----------------
   Archiving a schedule (row menu / details drawer) doesn't delete it -- it
   sets s.archived and the row moves off Scheduled Reports into this tab,
   where the same row menu offers Unarchive Schedule to bring it back. */
let rmArchivedSearch = "";
let rmArchivedTypeFilter = "";
let rmArchivedOrgFilter = "";
let rmArchivedStatusFilter = "";
let rmArchivedFrequencyFilter = "";

document.getElementById("rmArchivedReportTypeFilterMenu").innerHTML = buildFilterSelectOptions(rmReportTypeLabelsInUse(rmSchedules.filter((s) => s.archived)), "All report types");
document.getElementById("rmArchivedOrgFilterMenu").innerHTML = buildFilterSelectOptions(RM_ORGS, "All organisations");
document.getElementById("rmArchivedStatusFilterMenu").innerHTML = buildFilterSelectOptions(RM_STATUSES, "All statuses");
document.getElementById("rmArchivedFrequencyFilterMenu").innerHTML = buildFilterSelectOptions(RM_FREQUENCIES, "All frequencies");

function rmFilteredArchived() {
  return rmSchedules.filter((s) => {
    if (!s.archived) return false;
    if (rmArchivedTypeFilter && rmReportLabel(s.reportKey) !== rmArchivedTypeFilter) return false;
    if (rmArchivedOrgFilter && s.org !== rmArchivedOrgFilter) return false;
    if (rmArchivedStatusFilter && s.status !== rmArchivedStatusFilter) return false;
    if (rmArchivedFrequencyFilter && s.frequency !== rmArchivedFrequencyFilter) return false;
    if (rmArchivedSearch) {
      const haystack = `${rmReportLabel(s.reportKey)} ${s.name} ${s.org}`.toLowerCase();
      if (!haystack.includes(rmArchivedSearch)) return false;
    }
    return true;
  });
}

const rmArchivedEmptyHtml = `
  <tr><td colspan="11">
    <div class="bo-empty-state">
      <svg class="bo-empty-state-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9H21"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
      <p class="bo-empty-state-title" id="rmArchivedEmptyTitle">No archived reports</p>
      <p class="bo-empty-state-sub" id="rmArchivedEmptySub">Schedules you archive will show up here, and can be unarchived any time.</p>
    </div>
  </td></tr>`;

const rmArchivedPager = boCreatePager("rmArchivedRows", () => rmFilteredArchived(), rmRenderScheduleRow, { pageSize: 8, emptyHtml: rmArchivedEmptyHtml });

function rmArchivedFiltersActive() {
  return !!(rmArchivedSearch || rmArchivedTypeFilter || rmArchivedOrgFilter || rmArchivedStatusFilter || rmArchivedFrequencyFilter);
}

function rmRefreshArchivedEmptyState() {
  const titleEl = document.getElementById("rmArchivedEmptyTitle");
  const subEl = document.getElementById("rmArchivedEmptySub");
  if (!titleEl) return;
  if (rmArchivedFiltersActive()) {
    titleEl.textContent = "No archived reports match your filters";
    subEl.innerHTML = 'Try different filters, or <button type="button" class="bo-btn-text" id="rmClearArchivedFiltersInline" style="padding:0; font-size:inherit;">clear filters</button>.';
    document.getElementById("rmClearArchivedFiltersInline").addEventListener("click", rmClearArchivedFilters);
  } else {
    titleEl.textContent = "No archived reports";
    subEl.textContent = "Schedules you archive will show up here, and can be unarchived any time.";
  }
}

function rmRenderArchived() {
  rmArchivedPager();
  rmRefreshArchivedEmptyState();
}
rmRenderArchived();

document.getElementById("rmArchivedSearchInput").addEventListener("input", (e) => {
  rmArchivedSearch = e.target.value.trim().toLowerCase();
  rmArchivedPager.resetPage();
  rmRenderArchived();
});
document.getElementById("rmArchivedReportTypeFilter").addEventListener("change", (e) => { rmArchivedTypeFilter = e.target.value; rmArchivedPager.resetPage(); rmRenderArchived(); });
document.getElementById("rmArchivedOrgFilter").addEventListener("change", (e) => { rmArchivedOrgFilter = e.target.value; rmArchivedPager.resetPage(); rmRenderArchived(); });
document.getElementById("rmArchivedStatusFilter").addEventListener("change", (e) => { rmArchivedStatusFilter = e.target.value; rmArchivedPager.resetPage(); rmRenderArchived(); });
document.getElementById("rmArchivedFrequencyFilter").addEventListener("change", (e) => { rmArchivedFrequencyFilter = e.target.value; rmArchivedPager.resetPage(); rmRenderArchived(); });

function rmClearArchivedFilters() {
  rmArchivedSearch = "";
  rmArchivedTypeFilter = "";
  rmArchivedOrgFilter = "";
  rmArchivedStatusFilter = "";
  rmArchivedFrequencyFilter = "";
  document.getElementById("rmArchivedSearchInput").value = "";
  document.querySelectorAll("#tab-archived .bo-select").forEach(resetBoSelect);
  rmArchivedPager.resetPage();
  rmRenderArchived();
}
document.getElementById("rmClearArchivedFiltersBtn").addEventListener("click", rmClearArchivedFilters);

/* ---------------- Report History ---------------- */
let rmHistReportFilter = "";
let rmHistReportNameFilter = "";
let rmHistOrgFilter = "";

/* From/To date range -- both blank = no date filtering. `daysAgo` is the only
   date info each history record carries (sentOn is a display-only string, see
   below), so a record's actual calendar date is derived from it relative to
   today, then compared against the picked range. */
let rmHistFromDate = "";
let rmHistToDate = "";
let rmHistStatusFilter = "";

/* Processing is a transient in-flight state, not a result -- there's nothing
   useful to filter for once a delivery has actually finished, so the Status
   filter only offers the three terminal outcomes. */
const RM_HISTORY_STATUS_OPTIONS = ["Delivered", "Failed", "Partial"];

document.getElementById("rmHistReportFilterMenu").innerHTML = buildFilterSelectOptions(RM_REPORTS.map((r) => r.label), "All reports");
document.getElementById("rmHistOrgFilterMenu").innerHTML = buildFilterSelectOptions(RM_ORGS, "All organisations");
document.getElementById("rmHistStatusFilterMenu").innerHTML = buildFilterSelectOptions(RM_HISTORY_STATUS_OPTIONS, "All statuses");

function rmHistRecordDate(h) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - h.daysAgo);
  return d;
}

function rmFilteredHistory() {
  return rmHistory.filter((h) => {
    if (rmHistReportFilter && rmReportLabel(h.reportKey) !== rmHistReportFilter) return false;
    if (rmHistReportNameFilter && !h.name.toLowerCase().includes(rmHistReportNameFilter.toLowerCase())) return false;
    if (rmHistOrgFilter && h.org !== rmHistOrgFilter) return false;
    if (rmHistStatusFilter && h.status !== rmHistStatusFilter) return false;
    if (rmHistFromDate || rmHistToDate) {
      const recordDate = rmHistRecordDate(h);
      if (rmHistFromDate && recordDate < new Date(rmHistFromDate)) return false;
      if (rmHistToDate && recordDate > new Date(rmHistToDate)) return false;
    }
    return true;
  });
}

const rmHistoryIdLabel = (id) => `DLV-${String(id + 1).padStart(4, "0")}`;

function rmRenderHistoryRow(h) {
  return `
    <tr data-id="${h.id}">
      <td class="mono">${rmHistoryIdLabel(h.id)}</td>
      <td>${rmEsc(rmReportLabel(h.reportKey))}</td>
      <td>${rmEsc(h.name)}</td>
      <td>${rmEsc(h.org)}</td>
      <td>${rmRecipientsChip(h.recipients)}</td>
      <td>${h.sentOn}</td>
      <td>${rmDeliveryPill(h.status)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-id="${h.id}" aria-label="Row actions">${rmKebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const rmHistoryEmptyHtml = `
  <tr><td colspan="8">
    <div class="bo-empty-state">
      <svg class="bo-empty-state-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
      <p class="bo-empty-state-title" id="rmHistoryEmptyTitle">No deliveries yet</p>
      <p class="bo-empty-state-sub" id="rmHistoryEmptySub">Reports that are sent — scheduled or manual — will show up here.</p>
    </div>
  </td></tr>`;

const rmHistoryPager = boCreatePager("rmHistoryRows", () => rmFilteredHistory(), rmRenderHistoryRow, { pageSize: 8, emptyHtml: rmHistoryEmptyHtml });

function rmHistoryFiltersActive() {
  return !!(rmHistReportFilter || rmHistReportNameFilter || rmHistOrgFilter || rmHistStatusFilter || rmHistFromDate || rmHistToDate);
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
document.getElementById("rmHistReportNameFilter").addEventListener("input", (e) => { rmHistReportNameFilter = e.target.value.trim(); rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistOrgFilter").addEventListener("change", (e) => { rmHistOrgFilter = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistStatusFilter").addEventListener("change", (e) => { rmHistStatusFilter = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistFromDate").addEventListener("change", (e) => { rmHistFromDate = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });
document.getElementById("rmHistToDate").addEventListener("change", (e) => { rmHistToDate = e.target.value; rmHistoryPager.resetPage(); rmRenderHistory(); });

function rmClearHistoryFilters() {
  rmHistReportFilter = "";
  rmHistReportNameFilter = "";
  rmHistOrgFilter = "";
  rmHistStatusFilter = "";
  rmHistFromDate = "";
  rmHistToDate = "";
  document.querySelectorAll("#tab-history .bo-select").forEach(resetBoSelect);
  document.getElementById("rmHistReportNameFilter").value = "";
  const fromDateEl = document.getElementById("rmHistFromDate");
  const toDateEl = document.getElementById("rmHistToDate");
  fromDateEl.value = "";
  fromDateEl.type = "text";
  toDateEl.value = "";
  toDateEl.type = "text";
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
  document.getElementById("rmHistDetailRecipients").innerHTML = h.recipients.length
    ? h.recipients.map((r) => `<div>${rmEsc(r)}</div>`).join("")
    : "—";

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

/* Shared by both Scheduled Reports and Archived Reports rows -- same row
   shape (tr[data-id] + .row-menu-trigger), same kebab menu, same details
   drawer, so one listener per table is all that's needed. */
function wireScheduleRowMenu(containerId) {
  document.getElementById(containerId).addEventListener("click", (e) => {
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
}
wireScheduleRowMenu("rmScheduleRows");
wireScheduleRowMenu("rmArchivedRows");

function refreshScheduleRowMenuLabel() {
  const s = rmSchedules.find((x) => x.id === activeScheduleId);
  const toggleItem = rmScheduleRowMenu.querySelector('[data-action="toggle"]');
  if (s && toggleItem) toggleItem.textContent = s.status === "Active" ? "Pause Schedule" : "Resume Schedule";

  const archiveBtn = document.getElementById("rmScheduleRowMenuArchiveBtn");
  if (s && archiveBtn) {
    const isArchived = !!s.archived;
    archiveBtn.textContent = isArchived ? "Unarchive Schedule" : "Archive Schedule";
    archiveBtn.dataset.action = isArchived ? "unarchive" : "archive";
    archiveBtn.classList.toggle("danger", !isArchived);
  }
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

function rmArchiveSchedule(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  if (!confirm(`Archive "${s.name}"? It will stop sending and move to the Archived Reports tab — you can unarchive it any time.`)) return;
  s.archived = true;
  rmRenderSchedules();
  rmRenderArchived();
}

function rmUnarchiveSchedule(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  s.archived = false;
  rmRenderSchedules();
  rmRenderArchived();
}

rmScheduleRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeScheduleId === null) return;
  rmScheduleRowMenu.classList.remove("open");
  const id = activeScheduleId;

  if (item.dataset.action === "view") openScheduleDetails(id);
  else if (item.dataset.action === "edit") openWizardForEdit(id);
  else if (item.dataset.action === "toggle") rmToggleScheduleStatus(id);
  else if (item.dataset.action === "archive") rmArchiveSchedule(id);
  else if (item.dataset.action === "unarchive") rmUnarchiveSchedule(id);
});

/* ---------------- Download Report ---------------- */
const rmExportOverlay = document.getElementById("rmExportOverlay");
const rmExportForm = document.getElementById("rmExportForm");
const rmExportBtn = document.getElementById("rmExportBtn");
const rmExportReportSelect = document.getElementById("rmExportReportSelect");
let rmExportScheduleId = null;

/* Reused for both entry points: a row's kebab "Download Report" (pre-selects
   that row's report, dropdown still shown but locked in) and the page-level
   "Download Report" button (opens with nothing selected so the admin picks
   which scheduled report to export). */
function rmExportOptionLabel(s) {
  return `${rmReportLabel(s.reportKey)} — ${s.org} (${s.name})`;
}

function openExportReport(id) {
  rmExportForm.reset();
  document.getElementById("rmExportReportMenu").innerHTML = rmSchedules
    .map((s) => `
      <div class="bo-select-option" data-value="${s.id}">${rmEsc(rmExportOptionLabel(s))}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`)
    .join("");

  const s = rmSchedules.find((x) => x.id === id);
  rmExportScheduleId = s ? id : null;
  setBoSelectValue(rmExportReportSelect, s ? String(id) : "", { silent: true });

  rmExportBtn.disabled = true;
  rmExportOverlay.classList.add("open");
}

function closeExportReport() {
  rmExportOverlay.classList.remove("open");
  rmExportScheduleId = null;
}

function validateExportForm() {
  const reportChosen = rmExportReportSelect.querySelector("input[type=hidden]").value !== "";
  rmExportBtn.disabled = !(reportChosen && rmExportForm.fromDate.value && rmExportForm.toDate.value);
}

rmExportReportSelect.querySelector("input[type=hidden]").addEventListener("change", (e) => {
  rmExportScheduleId = e.target.value ? Number(e.target.value) : null;
  validateExportForm();
});
rmExportForm.addEventListener("input", validateExportForm);
rmExportForm.addEventListener("change", validateExportForm);
document.getElementById("rmCancelExport").addEventListener("click", closeExportReport);
rmExportOverlay.addEventListener("click", (e) => { if (e.target === rmExportOverlay) closeExportReport(); });
document.getElementById("rmDownloadReportBtn").addEventListener("click", () => openExportReport(null));

rmExportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rmExportBtn.disabled || rmExportScheduleId === null) return;
  closeExportReport();
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
  document.getElementById("rmDetailStatus").innerHTML = s.archived ? `<span class="bo-pill bo-pill-archived">Archived</span>` : rmStatusPill(s.status);
  document.getElementById("rmDetailRecipients").innerHTML = s.recipients.length
    ? s.recipients.map((r) => `<div>${rmEsc(r)}</div>`).join("")
    : "—";
  document.getElementById("rmDetailLastSent").textContent = s.lastSent;
  document.getElementById("rmDetailLastDeliveryStatus").innerHTML = rmDeliveryPill(s.lastDeliveryStatus);
  document.getElementById("rmDetailNextRun").textContent = s.archived ? "—" : s.nextRun;

  document.getElementById("rmDetailToggleBtn").textContent = s.status === "Active" ? "Pause Schedule" : "Resume Schedule";

  const detailArchiveBtn = document.getElementById("rmDetailDeleteBtn");
  detailArchiveBtn.textContent = s.archived ? "Unarchive Schedule" : "Archive Schedule";
  detailArchiveBtn.classList.toggle("danger", !s.archived);

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
  const s = rmSchedules.find((x) => x.id === id);
  closeScheduleDetails();
  if (s && s.archived) rmUnarchiveSchedule(id);
  else rmArchiveSchedule(id);
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

/* ---------------- Users (multi-select) ----------------
   A schedule can go to more than one person, so this is a checkbox
   multi-select (same component as Schedule Days below) instead of the
   single-select it used to be. */
const rmMultiCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let rmWizardSelectedUsers = new Set();

const rmUsersSelectEl = document.getElementById("rmWizardUsersSelect");
const rmUsersTrigger = rmUsersSelectEl.querySelector(".bo-multiselect-trigger");
const rmUsersValueEl = rmUsersSelectEl.querySelector(".bo-multiselect-value");
const rmUsersMenu = rmUsersSelectEl.querySelector(".bo-multiselect-menu");
const rmUsersPlaceholder = rmUsersValueEl.textContent.trim();

function renderUsersMenu() {
  const allChecked = rmWizardSelectedUsers.size === RM_DIRECTORY.length;
  rmUsersMenu.innerHTML =
    `<label class="bo-multiselect-option all${allChecked ? " checked" : ""}" data-all="1">
      <span class="bo-multiselect-checkbox">${rmMultiCheckIcon}</span> All users
    </label>` +
    RM_DIRECTORY.map(
      (u) => `<label class="bo-multiselect-option${rmWizardSelectedUsers.has(u) ? " checked" : ""}" data-value="${u}">
        <span class="bo-multiselect-checkbox">${rmMultiCheckIcon}</span> ${u}
      </label>`
    ).join("");
}

function renderUsersTrigger() {
  if (rmWizardSelectedUsers.size === 0) {
    rmUsersValueEl.textContent = rmUsersPlaceholder;
    rmUsersValueEl.classList.add("placeholder");
  } else {
    rmUsersValueEl.textContent = RM_DIRECTORY.filter((u) => rmWizardSelectedUsers.has(u)).join(", ");
    rmUsersValueEl.classList.remove("placeholder");
  }
}

rmUsersTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !rmUsersSelectEl.classList.contains("open");
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
  if (willOpen) rmUsersSelectEl.classList.add("open");
});

rmUsersMenu.addEventListener("click", (e) => {
  const option = e.target.closest(".bo-multiselect-option");
  if (!option) return;
  e.stopPropagation();

  if (option.dataset.all) {
    if (rmWizardSelectedUsers.size === RM_DIRECTORY.length) rmWizardSelectedUsers.clear();
    else RM_DIRECTORY.forEach((u) => rmWizardSelectedUsers.add(u));
  } else {
    const u = option.dataset.value;
    if (rmWizardSelectedUsers.has(u)) rmWizardSelectedUsers.delete(u);
    else rmWizardSelectedUsers.add(u);
  }

  renderUsersMenu();
  renderUsersTrigger();
});

/* ---------------- Schedule Days (Weekly only) ----------------
   A single multi-select field instead of a grid of standalone checkboxes --
   unchecking a day in the dropdown is how it gets removed. */
const RM_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const rmDaysCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
let rmWizardSelectedDays = new Set();

const rmDaysSelectEl = document.getElementById("rmWizardDaysSelect");
const rmDaysTrigger = rmDaysSelectEl.querySelector(".bo-multiselect-trigger");
const rmDaysValueEl = rmDaysSelectEl.querySelector(".bo-multiselect-value");
const rmDaysMenu = rmDaysSelectEl.querySelector(".bo-multiselect-menu");
const rmDaysPlaceholder = rmDaysValueEl.textContent.trim();

function renderDaysMenu() {
  const allChecked = rmWizardSelectedDays.size === RM_DAYS.length;
  rmDaysMenu.innerHTML =
    `<label class="bo-multiselect-option all${allChecked ? " checked" : ""}" data-all="1">
      <span class="bo-multiselect-checkbox">${rmDaysCheckIcon}</span> All days
    </label>` +
    RM_DAYS.map(
      (d) => `<label class="bo-multiselect-option${rmWizardSelectedDays.has(d) ? " checked" : ""}" data-value="${d}">
        <span class="bo-multiselect-checkbox">${rmDaysCheckIcon}</span> ${d}
      </label>`
    ).join("");
}

function renderDaysTrigger() {
  if (rmWizardSelectedDays.size === 0) {
    rmDaysValueEl.textContent = rmDaysPlaceholder;
    rmDaysValueEl.classList.add("placeholder");
  } else {
    rmDaysValueEl.textContent = RM_DAYS.filter((d) => rmWizardSelectedDays.has(d)).join(", ");
    rmDaysValueEl.classList.remove("placeholder");
  }
}

rmDaysTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !rmDaysSelectEl.classList.contains("open");
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
  if (willOpen) rmDaysSelectEl.classList.add("open");
});

rmDaysMenu.addEventListener("click", (e) => {
  const option = e.target.closest(".bo-multiselect-option");
  if (!option) return;
  e.stopPropagation();

  if (option.dataset.all) {
    if (rmWizardSelectedDays.size === RM_DAYS.length) rmWizardSelectedDays.clear();
    else RM_DAYS.forEach((d) => rmWizardSelectedDays.add(d));
  } else {
    const d = option.dataset.value;
    if (rmWizardSelectedDays.has(d)) rmWizardSelectedDays.delete(d);
    else rmWizardSelectedDays.add(d);
  }

  renderDaysMenu();
  renderDaysTrigger();
  validateWizardForm();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) {
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
  }
});

function updateDaysFieldVisibility() {
  const isWeekly = rmWizardForm.frequency.value === "Weekly";
  document.getElementById("rmWizardDaysField").hidden = !isWeekly;
}

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
  const frequency = rmWizardForm.frequency.value;
  const daysOk = frequency !== "Weekly" || rmWizardSelectedDays.size > 0;
  const scheduleOk = !!frequency && daysOk;
  rmWizardSaveBtn.disabled = !(reportOk && configOk && scheduleOk);
}

rmWizardForm.addEventListener("input", validateWizardForm);
rmWizardForm.addEventListener("change", (e) => {
  if (e.target.name === "frequency") updateDaysFieldVisibility();
  validateWizardForm();
});

function openWizardForCreate() {
  rmWizardEditingId = null;
  rmWizardSelectedTags = new Set();
  rmWizardSelectedDays = new Set();
  rmWizardSelectedUsers = new Set();
  document.getElementById("rmWizardTitle").textContent = "Schedule Report";
  rmWizardSaveBtn.textContent = "Schedule Report";
  rmWizardForm.reset();
  rmWizardForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  renderWizardTags();
  renderUsersMenu();
  renderUsersTrigger();
  renderDaysMenu();
  renderDaysTrigger();
  updateDaysFieldVisibility();
  validateWizardForm();
  rmWizardOverlay.classList.add("open");
}

function openWizardForEdit(id) {
  const s = rmSchedules.find((x) => x.id === id);
  if (!s) return;
  rmWizardEditingId = id;
  rmWizardSelectedTags = new Set(s.tags);
  rmWizardSelectedDays = new Set(s.days || []);
  rmWizardSelectedUsers = new Set(
    (s.usersFilter || "")
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
  );

  document.getElementById("rmWizardTitle").textContent = `Edit Schedule — ${s.name}`;
  rmWizardSaveBtn.textContent = "Save Changes";
  rmWizardForm.reset();

  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizReport"]'), s.reportKey, { silent: true });
  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizOrg"]'), s.org, { silent: true });
  setBoSelectValue(rmWizardForm.querySelector('.bo-select[data-name="wizFrequency"]'), s.frequency, { silent: true });
  rmWizardForm.name.value = s.name;
  rmWizardForm.title.value = s.title || "";
  const [hh, mm] = s.time.replace(/\s*[AP]M/i, "").split(":");
  rmWizardForm.hh.value = hh || "9";
  rmWizardForm.mm.value = mm || "0";

  renderWizardTags();
  renderUsersMenu();
  renderUsersTrigger();
  renderDaysMenu();
  renderDaysTrigger();
  updateDaysFieldVisibility();
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
  const usersFilter = Array.from(rmWizardSelectedUsers).join(", ");
  const frequency = rmWizardForm.frequency.value;
  const timezone = "GMT";
  const hh = String(rmWizardForm.hh.value || "0").padStart(2, "0");
  const mm = String(rmWizardForm.mm.value || "0").padStart(2, "0");
  const time = `${hh}:${mm}`;
  const tags = Array.from(rmWizardSelectedTags);
  const days = frequency === "Weekly" ? Array.from(rmWizardSelectedDays) : [];
  const existingSchedule = rmSchedules.find((s) => s.id === rmWizardEditingId);
  const recipients = existingSchedule ? existingSchedule.recipients || [] : [];
  const nextRun = `${computeNextRun(frequency)}, ${time} ${timezone}`;

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
      days,
      time,
      timezone,
      recipients,
      status: "Active",
      lastSent: "—",
      lastDeliveryStatus: "Processing",
      nextRun,
    });
  } else {
    const s = existingSchedule;
    if (s) Object.assign(s, { reportKey, name: rmWizardForm.name.value.trim(), title, org, usersFilter, tags, frequency, days, time, timezone, recipients, nextRun });
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
  const ok = !!rmSendForm.reportKey.value && !!rmSendForm.org.value;
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
  const now = new Date();
  const sentOn = `Today, ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const nextId = rmHistory.length ? Math.max(...rmHistory.map((h) => h.id)) + 1 : 0;
  rmHistory.unshift({ id: nextId, reportKey, org, title, email, fromDate, toDate, sentOn, recipients: 0, status: "Processing" });

  closeSendReport();
  rmRenderHistory();

  const tab = document.querySelector('#rmTabs .bo-tab[data-tab="history"]');
  if (tab) tab.click();
});
