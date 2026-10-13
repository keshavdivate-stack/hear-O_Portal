/* ---------------- Page data ----------------
   The shared directory (patients-directory.js) carries the legacy patients the
   Patient Dashboard also reads. These extra, page-only patients are seeded so
   every filter value in the developed screen has rows behind it -- Baseline /
   Priority statuses, Paused / Discontinued accounts, None monitoring, and last
   sessions both inside and older than the past week. Dates are stored
   DD/MM/YYYY like the shared directory and shown as MM/DD/YYYY. */
const PM_EXTRA_PATIENTS = [
  { username: "120-2008", algo: true, lang: "EN", tag: "CUR", creationDate: "03/08/2026", startDate: "04/08/2026", baselineCompletedDate: "18/08/2026", followUpDate: "19/08/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Active", statusStart: "18/08/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "SMA346E", lastSession: "12/10/2026", lastSignIn: "12/10/2026", complianceOverTime: 94.08, currentCompliance: 96.43, active: true },
  { username: "120-2009", algo: true, lang: "HE", tag: "CUR", creationDate: "10/08/2026", startDate: "11/08/2026", baselineCompletedDate: "25/08/2026", followUpDate: "26/08/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Priority", statusStart: "28/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "SMN985F", lastSession: "02/10/2026", lastSignIn: "05/10/2026", complianceOverTime: 81.37, currentCompliance: 42.86, active: true },
  { username: "120-2010", algo: true, lang: "RU", tag: "NEW", creationDate: "21/09/2026", startDate: "22/09/2026", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Baseline", statusStart: "22/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "Redmi8", lastSession: "12/10/2026", lastSignIn: "12/10/2026", complianceOverTime: 90.48, currentCompliance: 100, active: true },
  { username: "120-2011", algo: false, lang: "EN", tag: "NEW", creationDate: "07/10/2026", startDate: "", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "None", status: "Registered", statusStart: "07/10/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "Pixel7", lastSession: "", lastSignIn: "08/10/2026", complianceOverTime: null, currentCompliance: null, active: true },
  { username: "120-2012", algo: true, lang: "HE", tag: "CUR", creationDate: "14/06/2026", startDate: "15/06/2026", baselineCompletedDate: "29/06/2026", followUpDate: "30/06/2026", leavingDate: "", account: "Paused", monitoring: "Unmonitored", status: "Active", statusStart: "30/06/2026", lastAppVersion: "3.1.5.0", lastPhoneModel: "SMA525F", lastSession: "14/09/2026", lastSignIn: "14/09/2026", complianceOverTime: 76.19, currentCompliance: 0, active: false },
  { username: "120-2013", algo: true, lang: "AR", tag: "CUR", creationDate: "02/05/2026", startDate: "03/05/2026", baselineCompletedDate: "17/05/2026", followUpDate: "18/05/2026", leavingDate: "30/09/2026", account: "Discontinued", monitoring: "None", status: "Active", statusStart: "18/05/2026", lastAppVersion: "3.1.5.0", lastPhoneModel: "SMA720F", lastSession: "29/09/2026", lastSignIn: "30/09/2026", complianceOverTime: 68.42, currentCompliance: 0, active: false },
  { username: "120-2014", algo: true, lang: "EN", tag: "CUR", creationDate: "20/07/2026", startDate: "21/07/2026", baselineCompletedDate: "04/08/2026", followUpDate: "05/08/2026", leavingDate: "", account: "Enabled", monitoring: "Unmonitored", status: "Active", statusStart: "05/08/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "iPhone 14", lastSession: "11/10/2026", lastSignIn: "11/10/2026", complianceOverTime: 88.95, currentCompliance: 85.71, active: true },
  { username: "121-2003", algo: true, lang: "AR", tag: "CUR", creationDate: "01/07/2026", startDate: "02/07/2026", baselineCompletedDate: "16/07/2026", followUpDate: "17/07/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Priority", statusStart: "06/10/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "Galaxy S22", lastSession: "11/10/2026", lastSignIn: "12/10/2026", complianceOverTime: 79.66, currentCompliance: 57.14, active: true },
  { username: "121-2004", algo: true, lang: "EN", tag: "CUR", creationDate: "15/06/2026", startDate: "16/06/2026", baselineCompletedDate: "30/06/2026", followUpDate: "01/07/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Priority", statusStart: "25/09/2026", lastAppVersion: "3.1.5.0", lastPhoneModel: "iPhone 13", lastSession: "22/09/2026", lastSignIn: "24/09/2026", complianceOverTime: 72.31, currentCompliance: 28.57, active: true },
  { username: "121-2005", algo: false, lang: "RU", tag: "NEW", creationDate: "28/09/2026", startDate: "29/09/2026", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "Unmonitored", status: "Baseline", statusStart: "29/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "SMA346E", lastSession: "08/10/2026", lastSignIn: "08/10/2026", complianceOverTime: 83.33, currentCompliance: 71.43, active: true },
  { username: "121-2006", algo: true, lang: "HE", tag: "NEW", creationDate: "09/10/2026", startDate: "", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "None", status: "Registered", statusStart: "09/10/2026", lastAppVersion: "", lastPhoneModel: "", lastSession: "", lastSignIn: "", complianceOverTime: null, currentCompliance: null, active: false },
  { username: "121-2007", algo: true, lang: "AR", tag: "CUR", creationDate: "11/05/2026", startDate: "12/05/2026", baselineCompletedDate: "26/05/2026", followUpDate: "27/05/2026", leavingDate: "", account: "Paused", monitoring: "None", status: "Priority", statusStart: "01/09/2026", lastAppVersion: "3.1.5.0", lastPhoneModel: "Redmi8", lastSession: "28/08/2026", lastSignIn: "03/09/2026", complianceOverTime: 61.9, currentCompliance: 0, active: false },
  { username: "121-2008", algo: true, lang: "EN", tag: "CUR", creationDate: "18/08/2026", startDate: "19/08/2026", baselineCompletedDate: "02/09/2026", followUpDate: "03/09/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Active", statusStart: "03/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "Pixel 7", lastSession: "13/10/2026", lastSignIn: "13/10/2026", complianceOverTime: 97.56, currentCompliance: 100, active: true },
  { username: "122-2002", algo: true, lang: "EN", tag: "CUR", creationDate: "05/09/2026", startDate: "06/09/2026", baselineCompletedDate: "20/09/2026", followUpDate: "21/09/2026", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Priority", statusStart: "08/10/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "SMN985F", lastSession: "09/10/2026", lastSignIn: "10/10/2026", complianceOverTime: 85, currentCompliance: 50, active: true },
  { username: "122-2003", algo: false, lang: "HE", tag: "CUR", creationDate: "12/09/2026", startDate: "13/09/2026", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "Monitored", status: "Baseline", statusStart: "13/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "iPhone 15", lastSession: "30/09/2026", lastSignIn: "01/10/2026", complianceOverTime: 64.71, currentCompliance: 14.29, active: true },
  { username: "122-2004", algo: true, lang: "RU", tag: "CUR", creationDate: "03/03/2026", startDate: "04/03/2026", baselineCompletedDate: "18/03/2026", followUpDate: "19/03/2026", leavingDate: "15/08/2026", account: "Discontinued", monitoring: "None", status: "Active", statusStart: "19/03/2026", lastAppVersion: "3.1.4.0", lastPhoneModel: "SMA525F", lastSession: "14/08/2026", lastSignIn: "15/08/2026", complianceOverTime: 74.12, currentCompliance: 0, active: false },
  { username: "122-2005", algo: true, lang: "EN", tag: "NEW", creationDate: "30/09/2026", startDate: "", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Enabled", monitoring: "None", status: "Registered", statusStart: "30/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "Galaxy S23", lastSession: "", lastSignIn: "01/10/2026", complianceOverTime: null, currentCompliance: null, active: true },
  { username: "122-2006", algo: true, lang: "AR", tag: "CUR", creationDate: "25/07/2026", startDate: "26/07/2026", baselineCompletedDate: "09/08/2026", followUpDate: "10/08/2026", leavingDate: "", account: "Enabled", monitoring: "Unmonitored", status: "Priority", statusStart: "30/09/2026", lastAppVersion: "3.2.0.0", lastPhoneModel: "SMA720F", lastSession: "05/10/2026", lastSignIn: "06/10/2026", complianceOverTime: 70.59, currentCompliance: 35.71, active: true },
  { username: "122-2007", algo: true, lang: "HE", tag: "CUR", creationDate: "01/06/2026", startDate: "02/06/2026", baselineCompletedDate: "", followUpDate: "", leavingDate: "", account: "Paused", monitoring: "None", status: "Baseline", statusStart: "02/06/2026", lastAppVersion: "3.1.5.0", lastPhoneModel: "SMA346E", lastSession: "20/06/2026", lastSignIn: "21/06/2026", complianceOverTime: 45, currentCompliance: 0, active: false },
];
PM_EXTRA_PATIENTS.forEach((p, i) => (p.id = patients.length + i));
const pmPatients = patients.concat(PM_EXTRA_PATIENTS);

const PATIENT_STATUSES = ["Registered", "Active", "Priority", "Baseline"];
const PATIENT_ACCOUNTS = ["Enabled", "Paused", "Discontinued"];
const PATIENT_MONITORING = ["Monitored", "Unmonitored", "None"];

/* ---------------- State ---------------- */
const PATIENT_PAGE_SIZE = 20;
let patientCurrentPage = 1;
let patientSortDir = "asc";
let patientSearchTerm = "";
let patientStatusFilter = [];
let patientAccountFilter = [];
let patientMonitoringFilter = [];
let patientSiteFilter = "";
let patientTagFilter = "";
let patientLanguageFilter = "";
let patientActiveFilter = "";
let patientAppVersionFilter = "";
let patientPhoneModelFilter = "";
let patientLastSessionUpTo = "";
/* Study / Commercial / R&D toggles -- multiple can be on at once (e.g. Study
   + Commercial together); none checked means no org-type filter is applied
   at all, same "off = unfiltered" behavior the old scope toggles had. */
const patientOrgTypeToggles = new Set();

/* ---------------- Filter options ----------------
   Clinical site / Patient tag / Language / Active are single-selects whose
   first row is "All" (the developed screen's default); picking it shows the
   field's placeholder again, same as an untouched filter. Status / Account /
   Monitoring are checkbox multi-selects with their own "All" row. */
const siteCodes = [...new Set(pmPatients.map((p) => p.username.split("-")[0]))];
document.getElementById("clinicalSiteFilterMenu").innerHTML = buildBoFilterSelectOptions(siteCodes, "All");
document.getElementById("tagFilterMenu").innerHTML = buildBoFilterSelectOptions(PATIENT_TAGS, "All");
document.getElementById("languageFilterMenu").innerHTML = buildBoFilterSelectOptions(PATIENT_LANGUAGES, "All");
document.getElementById("activeFilterMenu").innerHTML = buildBoFilterSelectOptions(["Active", "Inactive"], "All");

const patientStatusSelect = wireSupportMultiFilter("statusFilter", { options: asFilterOptions(PATIENT_STATUSES) });
const patientAccountSelect = wireSupportMultiFilter("accountFilter", { options: asFilterOptions(PATIENT_ACCOUNTS) });
const patientMonitoringSelect = wireSupportMultiFilter("monitoringFilter", { options: asFilterOptions(PATIENT_MONITORING) });

function showPatientSelectPlaceholder(select) {
  const valueEl = select.querySelector(".bo-select-value");
  valueEl.textContent = valueEl.dataset.placeholder;
  valueEl.classList.add("placeholder");
}

function dmyToIso(s) {
  const [d, m, y] = s.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

/* Stored DD/MM/YYYY -> shown MM/DD/YYYY, matching the developed screen. */
function dmyToMdy(s) {
  if (!s) return "—";
  const [d, m, y] = s.split("/");
  return `${m.padStart(2, "0")}/${d.padStart(2, "0")}/${y}`;
}

function filteredPatients() {
  return pmPatients.filter((p) => {
    if (patientOrgTypeToggles.size && !patientOrgTypeToggles.has(patientOrgType(p))) return false;
    if (patientSiteFilter && !p.username.startsWith(patientSiteFilter)) return false;
    if (patientTagFilter && p.tag !== patientTagFilter) return false;
    if (patientLanguageFilter && p.lang !== patientLanguageFilter) return false;
    if (!inFilterList(patientStatusFilter, p.status)) return false;
    if (!inFilterList(patientAccountFilter, p.account)) return false;
    if (!inFilterList(patientMonitoringFilter, p.monitoring)) return false;
    if (patientActiveFilter && (p.active ? "Active" : "Inactive") !== patientActiveFilter) return false;
    if (patientAppVersionFilter && !(p.lastAppVersion || "").toLowerCase().includes(patientAppVersionFilter)) return false;
    if (patientPhoneModelFilter && !(p.lastPhoneModel || "").toLowerCase().includes(patientPhoneModelFilter)) return false;
    /* "Up to" date: keeps patients who haven't recorded since that day --
       a patient with no session yet has nothing after it either, so stays. */
    if (patientLastSessionUpTo && p.lastSession && dmyToIso(p.lastSession) > patientLastSessionUpTo) return false;
    if (patientSearchTerm && !p.username.toLowerCase().includes(patientSearchTerm)) return false;
    return true;
  });
}

function sortedPatients() {
  const list = [...filteredPatients()];
  list.sort((a, b) => (patientSortDir === "asc" ? a.username.localeCompare(b.username, undefined, { numeric: true }) : b.username.localeCompare(a.username, undefined, { numeric: true })));
  return list;
}

/* ---------------- Render ---------------- */
const pct = (v) => (v === null || v === undefined ? "—" : `${Number(v).toFixed(2)}%`);
const patientKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function statusClass(status) {
  return status.toLowerCase();
}

function renderPatients() {
  const list = sortedPatients();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PATIENT_PAGE_SIZE));
  patientCurrentPage = Math.min(patientCurrentPage, totalPages);

  const start = (patientCurrentPage - 1) * PATIENT_PAGE_SIZE;
  const pageItems = list.slice(start, start + PATIENT_PAGE_SIZE);

  document.getElementById("patientRows").innerHTML = pageItems
    .map(
      (p) => `
      <tr>
        <td data-col="username"><a class="bo-name-link" href="patient-health-dashboard.html?patient=${p.username}">${p.username}</a></td>
        <td data-col="algo"><input type="checkbox" class="bo-table-checkbox" ${p.algo ? "checked" : ""} disabled aria-label="Algo enabled" /></td>
        <td data-col="lang">${p.lang}</td>
        <td data-col="tag">${p.tag}</td>
        <td data-col="creationDate">${dmyToMdy(p.creationDate)}</td>
        <td data-col="startDate">${dmyToMdy(p.startDate)}</td>
        <td data-col="baselineCompletedDate">${dmyToMdy(p.baselineCompletedDate)}</td>
        <td data-col="followUpDate">${dmyToMdy(p.followUpDate)}</td>
        <td data-col="leavingDate">${dmyToMdy(p.leavingDate)}</td>
        <td data-col="account"><span class="bo-status-pill ${statusClass(p.account)}">${p.account}</span></td>
        <td data-col="status"><span class="bo-status-pill ${statusClass(p.status)}">${p.status}</span></td>
        <td data-col="monitoring"><span class="bo-status-pill ${statusClass(p.monitoring)}">${p.monitoring}</span></td>
        <td data-col="statusStart">${dmyToMdy(p.statusStart)}</td>
        <td data-col="lastAppVersion">${p.lastAppVersion || "—"}</td>
        <td data-col="lastPhoneModel">${p.lastPhoneModel || "—"}</td>
        <td data-col="lastSession">${dmyToMdy(p.lastSession)}</td>
        <td data-col="lastSignIn">${dmyToMdy(p.lastSignIn)}</td>
        <td data-col="complianceOverTime">${pct(p.complianceOverTime)}</td>
        <td data-col="currentCompliance">${pct(p.currentCompliance)}</td>
        <td data-col="actions">
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${p.id}" aria-label="Row actions">${patientKebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + PATIENT_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("patientPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("patientFirstPage").disabled = patientCurrentPage === 1;
  document.getElementById("patientPrevPage").disabled = patientCurrentPage === 1;
  document.getElementById("patientNextPage").disabled = patientCurrentPage === totalPages;
  document.getElementById("patientLastPage").disabled = patientCurrentPage === totalPages;
}

/* ---------------- URL parameters ----------------
   Dashboards link here pre-filtered, e.g. ?status=Priority&account=Enabled
   &lastSessionDate=2026-10-09. status / account / monitoring take a comma
   list; lastSessionDate is YYYY-MM-DD and keeps patients whose last session
   is on or before it. Values are matched case-insensitively and anything
   unknown is ignored. The matching controls are filled in so the applied
   filters are visible, and Clear filters drops them like any other. */
function patientUrlList(params, key, allowed) {
  const raw = params.get(key);
  if (!raw) return [];
  const byLower = new Map(allowed.map((v) => [v.toLowerCase(), v]));
  return [...new Set(raw.split(",").map((v) => byLower.get(v.trim().toLowerCase())).filter(Boolean))];
}

function patientUrlDate(params, key) {
  const raw = (params.get(key) || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return "";
  const d = new Date(`${raw}T00:00:00Z`);
  return !isNaN(d) && d.toISOString().slice(0, 10) === raw ? raw : "";
}

(function applyPatientUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  patientStatusFilter = patientUrlList(params, "status", PATIENT_STATUSES);
  patientAccountFilter = patientUrlList(params, "account", PATIENT_ACCOUNTS);
  patientMonitoringFilter = patientUrlList(params, "monitoring", PATIENT_MONITORING);
  patientLastSessionUpTo = patientUrlDate(params, "lastSessionDate");

  patientStatusSelect.setSelected(patientStatusFilter);
  patientAccountSelect.setSelected(patientAccountFilter);
  patientMonitoringSelect.setSelected(patientMonitoringFilter);
  if (patientLastSessionUpTo) {
    const lastSessionEl = document.getElementById("lastSessionUpToFilter");
    lastSessionEl.type = "date";
    lastSessionEl.value = patientLastSessionUpTo;
  }
})();

renderPatients();

/* ---------------- Filters (staged; applied when the Apply button is clicked) ---------------- */
[
  ["clinicalSite", "clinicalSiteFilter", (v) => { patientSiteFilter = v; }],
  ["tag", "tagFilter", (v) => { patientTagFilter = v; }],
  ["language", "languageFilter", (v) => { patientLanguageFilter = v; }],
  ["active", "activeFilter", (v) => { patientActiveFilter = v; }],
].forEach(([name, inputId, stage]) => {
  const select = document.querySelector(`.bo-select[data-name="${name}"]`);
  document.getElementById(inputId).addEventListener("change", (e) => {
    stage(e.target.value);
    if (!e.target.value) showPatientSelectPlaceholder(select);
  });
});
document.getElementById("statusFilter").addEventListener("change", () => { patientStatusFilter = patientStatusSelect.getSelected(); });
document.getElementById("accountFilter").addEventListener("change", () => { patientAccountFilter = patientAccountSelect.getSelected(); });
document.getElementById("monitoringFilter").addEventListener("change", () => { patientMonitoringFilter = patientMonitoringSelect.getSelected(); });
document.getElementById("appVersionFilter").addEventListener("input", (e) => { patientAppVersionFilter = e.target.value.trim().toLowerCase(); });
document.getElementById("phoneModelFilter").addEventListener("input", (e) => { patientPhoneModelFilter = e.target.value.trim().toLowerCase(); });
document.getElementById("lastSessionUpToFilter").addEventListener("change", (e) => { patientLastSessionUpTo = e.target.value; });
document.getElementById("patientSearchInput").addEventListener("input", (e) => { patientSearchTerm = e.target.value.trim().toLowerCase(); });

document.getElementById("patientApplyBtn").addEventListener("click", () => {
  patientCurrentPage = 1;
  renderPatients();
});

document.getElementById("patientClearFiltersBtn").addEventListener("click", () => {
  patientSiteFilter = "";
  patientTagFilter = "";
  patientLanguageFilter = "";
  patientStatusFilter = [];
  patientAccountFilter = [];
  patientMonitoringFilter = [];
  patientActiveFilter = "";
  patientAppVersionFilter = "";
  patientPhoneModelFilter = "";
  patientLastSessionUpTo = "";
  patientSearchTerm = "";
  patientOrgTypeToggles.clear();

  ["clinicalSite", "tag", "language", "active"].forEach((name) => {
    const select = document.querySelector(`.bo-select[data-name="${name}"]`);
    resetBoSelect(select);
    showPatientSelectPlaceholder(select);
  });
  patientStatusSelect.setSelected([]);
  patientAccountSelect.setSelected([]);
  patientMonitoringSelect.setSelected([]);
  document.getElementById("appVersionFilter").value = "";
  document.getElementById("phoneModelFilter").value = "";
  document.getElementById("patientSearchInput").value = "";
  const lastSessionEl = document.getElementById("lastSessionUpToFilter");
  lastSessionEl.value = "";
  lastSessionEl.type = "text";
  document.querySelectorAll("[data-org-type]").forEach((toggle) => { toggle.checked = false; });

  /* Drop any dashboard-supplied query string so a reload starts clean too. */
  if (window.location.search) {
    try { history.replaceState(null, "", window.location.pathname); } catch (err) { /* file:// may refuse */ }
  }

  patientCurrentPage = 1;
  renderPatients();
});

/* ---------------- Organization type toggles (apply immediately) ---------------- */
document.querySelectorAll("[data-org-type]").forEach((toggle) => {
  toggle.addEventListener("change", (e) => {
    if (e.target.checked) patientOrgTypeToggles.add(toggle.dataset.orgType);
    else patientOrgTypeToggles.delete(toggle.dataset.orgType);
    patientCurrentPage = 1;
    renderPatients();
  });
});

/* ---------------- Sort ---------------- */
document.querySelector("#patientTable th.sortable").addEventListener("click", () => {
  patientSortDir = patientSortDir === "asc" ? "desc" : "asc";
  renderPatients();
});

/* ---------------- Pagination ---------------- */
document.getElementById("patientFirstPage").addEventListener("click", () => { patientCurrentPage = 1; renderPatients(); });
document.getElementById("patientPrevPage").addEventListener("click", () => { patientCurrentPage -= 1; renderPatients(); });
document.getElementById("patientNextPage").addEventListener("click", () => { patientCurrentPage += 1; renderPatients(); });
document.getElementById("patientLastPage").addEventListener("click", () => {
  patientCurrentPage = Math.ceil(filteredPatients().length / PATIENT_PAGE_SIZE);
  renderPatients();
});

/* ---------------- Row action dropdown (notify / edit) ---------------- */
const patientRowMenu = document.getElementById("patientRowMenu");
let activePatientRowId = null;

document.getElementById("patientRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activePatientRowId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  patientRowMenu.style.top = `${rect.bottom + 6}px`;
  patientRowMenu.style.left = `${rect.right - 190}px`;
  patientRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!patientRowMenu.contains(e.target)) patientRowMenu.classList.remove("open");
});

patientRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activePatientRowId === null) return;
  patientRowMenu.classList.remove("open");
  const patient = pmPatients.find((p) => p.id === activePatientRowId);
  if (!patient) return;
  if (item.dataset.action === "notify") openReminderModal(patient);
  else if (item.dataset.action === "edit") openEditPatientModal(patient);
});

/* ---------------- Edit Reminder modal ----------------
   Mirrors the developed screen: a Reminder toggle that reveals a second
   "Reminder set" toggle once on -- off shows a read-only auto-calculated
   time ("Auto time - Calculate"), on swaps it for an editable time field
   ("Manual reminder time"). Patients aren't seeded with reminder data, so
   each one defaults to Reminder on / auto time 11:00:00 the first time its
   modal opens, same as a freshly-created patient would in the developed
   screen. */
const patientReminderOverlay = document.getElementById("patientReminderOverlay");
const patientReminderForm = document.getElementById("patientReminderForm");
const patientReminderEnabled = document.getElementById("patientReminderEnabled");
const patientReminderManual = document.getElementById("patientReminderManual");
const patientReminderDetails = document.getElementById("patientReminderDetails");
const patientReminderModeLabel = document.getElementById("patientReminderModeLabel");
const patientReminderAutoTime = document.getElementById("patientReminderAutoTime");
const patientReminderManualTime = document.getElementById("patientReminderManualTime");
const patientReminderSave = document.getElementById("patientReminderSave");
let activeReminderPatient = null;

function updateReminderFormVisibility() {
  const on = patientReminderEnabled.checked;
  patientReminderDetails.hidden = !on;
  if (!on) return;
  const manual = patientReminderManual.checked;
  patientReminderModeLabel.textContent = manual ? "Manual reminder time" : "Auto time - Calculate";
  patientReminderAutoTime.hidden = manual;
  patientReminderManualTime.hidden = !manual;
}

function openReminderModal(patient) {
  activeReminderPatient = patient;
  document.getElementById("patientReminderUsername").textContent = patient.username;
  patientReminderEnabled.checked = patient.reminderEnabled !== false;
  patientReminderManual.checked = !!patient.reminderManual;
  patientReminderManualTime.value = patient.reminderTime || "11:00";
  updateReminderFormVisibility();
  patientReminderSave.disabled = true;
  patientReminderOverlay.classList.add("open");
}

function closeReminderModal() {
  patientReminderOverlay.classList.remove("open");
  activeReminderPatient = null;
}

patientReminderEnabled.addEventListener("change", () => { updateReminderFormVisibility(); patientReminderSave.disabled = false; });
patientReminderManual.addEventListener("change", () => { updateReminderFormVisibility(); patientReminderSave.disabled = false; });
patientReminderManualTime.addEventListener("input", () => { patientReminderSave.disabled = false; });
document.getElementById("patientReminderCancel").addEventListener("click", closeReminderModal);
patientReminderOverlay.addEventListener("click", (e) => { if (e.target === patientReminderOverlay) closeReminderModal(); });

patientReminderForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeReminderPatient) return;
  activeReminderPatient.reminderEnabled = patientReminderEnabled.checked;
  activeReminderPatient.reminderManual = patientReminderManual.checked;
  activeReminderPatient.reminderTime = patientReminderManualTime.value || "11:00";
  closeReminderModal();
});

/* ---------------- Edit Patient modal ----------------
   Matches the developed screen: Username is shown read-only (editing a
   patient's username isn't supported there either), so Save stays
   disabled -- the modal exists for the patient's record to be reviewed,
   not changed, from this entry point. */
const patientEditOverlay = document.getElementById("patientEditOverlay");

function openEditPatientModal(patient) {
  document.getElementById("patientEditUsername").value = patient.username;
  patientEditOverlay.classList.add("open");
}

function closeEditPatientModal() {
  patientEditOverlay.classList.remove("open");
}

document.getElementById("patientEditCancel").addEventListener("click", closeEditPatientModal);
patientEditOverlay.addEventListener("click", (e) => { if (e.target === patientEditOverlay) closeEditPatientModal(); });
