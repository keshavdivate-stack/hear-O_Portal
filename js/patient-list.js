const heartIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const flagIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#F16C6C" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#F16C6C" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const infoIconBlue = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const infoIconGray = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C9CFD6"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const patientList = [
  { name: "Alexander White", username: "ABC-1254", mrn: "857452365", phone: "054-857 15423", account: "Enabled", status: "priority", flag: true, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92, gender: "M", careStatus: "in_progress", careTitle: "Review Carvedilol titration", careAssignee: "Amanda Lee, RN", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell", "Amanda Lee, RN", "Ayelet Er, NP"] },
  { name: "Dan Volex",        username: "ABC-1252", mrn: "854745856", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68, gender: "M", action: { type: "contacted", date: "", note: "" }, careStatus: "completed", team: "Remote Monitoring Team", teamMember: "Amanda Lee, RN", ehrOrg: true, careTeam: ["Amanda Lee, RN", "Dr. James Carter"] },
  { name: "Mike Brown",       username: "ABC-1251", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", monSince: "Since: 1d | 01.09.2028", compliance: 34, gender: "M", team: "Heart Failure Team", teamMember: "Dr. James Carter", chartView: "nurse", careTeam: ["Dr. James Carter"] },
  { name: "Ariel Fox",        username: "ABC-1238", mrn: "854123658", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81, gender: "F", action: { type: "invite", date: "", note: "" }, careStatus: "recommended", careTitle: "Increase Furosemide dose", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Sandy Kohl, RN", "Dr. Michael Reyes"] },
  { name: "Jeff Frank",       username: "ABC-1242", mrn: "854123658", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 4d | 01.06.2028", monitoring: "monitored", compliance: 57, gender: "M", team: "Remote Monitoring Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Amanda Lee, RN"] },
  { name: "Aric Snow",        username: "ABC-1283", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76, gender: "M", careStatus: "in_progress", careTitle: "Review Metoprolol tolerance", careAssignee: "Ayelet Er, NP", team: "Heart Failure Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Dr. Sarah Mitchell", "Sandy Kohl, RN", "Emily Carter"] },
  { name: "Abe Lol",          username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88, gender: "M", careStatus: "completed", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter"] },
  { name: "Annie Zaplin",     username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45, gender: "F", team: "Remote Monitoring Team", teamMember: "Sandy Kohl, RN", careTeam: ["Sandy Kohl, RN", "Dr. Emily Chen"] },
  { name: "Nathan Norash",    username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Paused", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63, gender: "M", careStatus: "recommended", careTitle: "Confirm Lisinopril adherence", team: "Heart Failure Team", teamMember: "Dr. Michael Reyes", careTeam: ["Dr. Michael Reyes"] },
  { name: "Henry Fisher",     username: "ABC-1220", mrn: "965412589", phone: "054-857 15423", account: "Enabled", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12, gender: "M", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Ayelet Er, NP"] },
  { name: "Josh Ericson",     username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Discontinued", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", monInfo: true, compliance: 79, gender: "Other", careStatus: "completed", team: "Remote Monitoring Team", teamMember: "Dr. Emily Chen", careTeam: ["Dr. Emily Chen", "Amanda Lee, RN", "Sandy Kohl, RN"] },
  { name: "Jack Harris",      username: "ABC-1221", mrn: "854125698", phone: "054-857 15423", account: "Discontinued", status: "none", monitoring: "unmonitored", monSince: "Since: 5d | 01.05.2028", compliance: 24, gender: "M", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell"] },
];

/* Current logged-in clinician (matches the "EC" topbar avatar), used by the
   All Patients / My Patients scope toggle. */
const CURRENT_TEAM_MEMBER = "Emily Carter";

const complianceRanges = [
  { key: "76-100", label: "76-100%", min: 76, max: 100 },
  { key: "51-75", label: "51-75%", min: 51, max: 75 },
  { key: "26-50", label: "26-50%", min: 26, max: 50 },
  { key: "0-25", label: "0-25%", min: 0, max: 25 },
];

const genderOptions = [
  { key: "M", label: "Male (M)" },
  { key: "F", label: "Female (F)" },
  { key: "Other", label: "Other" },
];

const accountOptions = [
  { key: "Enabled", label: "Enabled" },
  { key: "Paused", label: "Paused" },
  { key: "Discontinued", label: "Discontinued" },
];

const statusOptions = [
  { key: "registered", label: "Registered" },
  { key: "baseline", label: "Baseline" },
  { key: "active", label: "Active" },
  { key: "priority", label: "Priority" },
];

const monitoringOptions = [
  { key: "monitored", label: "Monitored" },
  { key: "unmonitored", label: "Unmonitored" },
];

/* Care Team = the individual clinician assigned to the patient -- same
   roster used by the Register Patient "Care Team" field. */
const teamMemberOptions = [
  { key: "Emily Carter", label: "Emily Carter" },
  { key: "Dr. Sarah Mitchell", label: "Dr. Sarah Mitchell" },
  { key: "Dr. James Carter", label: "Dr. James Carter" },
  { key: "Dr. Emily Chen", label: "Dr. Emily Chen" },
  { key: "Dr. Michael Reyes", label: "Dr. Michael Reyes" },
  { key: "Amanda Lee, RN", label: "Amanda Lee, RN" },
  { key: "Ayelet Er, NP", label: "Ayelet Er, NP" },
  { key: "Sandy Kohl, RN", label: "Sandy Kohl, RN" },
];

const selectedComplianceRanges = new Set();
const selectedGenders = new Set();
const selectedAccounts = new Set();
const selectedStatuses = new Set();
const selectedMonitorings = new Set();
const selectedCareTeams = new Set();
let patientScope = "all";

function statusCell(p) {
  if (p.status === "priority") {
    return `
      <div class="status-cell">
        <span class="status-line status-priority">${heartIcon} Priority ${p.flag ? flagIcon : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9AA5B1" stroke-width="1.8"/><path d="M12 8V13" stroke="#9AA5B1" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#9AA5B1"/></svg>`}</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "active") {
    return `
      <div class="status-cell">
        <span class="status-line status-active">Active</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "registered") {
    return `
      <div class="status-cell">
        <span class="status-line status-muted">Registered</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "baseline") {
    return `
      <div class="status-cell">
        <span class="status-line status-muted">Baseline</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  return `
    <div class="status-cell">
      <span class="status-line status-muted">None ${infoIconGray}</span>
    </div>`;
}

function monitoringCell(p) {
  if (p.monitoring === "monitored") {
    return `
      <div class="mon-cell">
        <span class="mon-line mon-monitored">Monitored ${p.monInfo ? infoIconBlue : ""}</span>
      </div>`;
  }
  if (p.monitoring === "unmonitored") {
    return `
      <div class="mon-cell">
        <span class="mon-line mon-unmonitored">${infoIconBlue} Unmonitored</span>
        <span class="status-since">${p.monSince || ""}</span>
      </div>`;
  }
  return `<div class="mon-cell"><span class="mon-line mon-none">None</span></div>`;
}

const actionTypeLabels = {
  contacted: "Contacted",
  invite: "Invite to clinic",
  hospital: "Send to hospital",
  other: "Other",
};

function actionCell(p) {
  const label = p.action ? actionTypeLabels[p.action.type] || "" : "";
  const pencilTitle = label || "Add action";
  return `
    <div class="action-cell">
      <div class="action-icon-group">
        <button class="action-icon" aria-label="${pencilTitle}" title="${pencilTitle}" data-id="${p.id}" data-act="addAction">${pencilIcon}</button>
        <button class="action-icon kebab row-menu-trigger" aria-label="More" data-id="${p.id}">${kebabIcon}</button>
      </div>
    </div>`;
}

patientList.forEach((p, i) => (p.id = i));

function complianceCell(p) {
  const cls = p.compliance >= 76 ? "status-active" : p.compliance >= 51 ? "mon-unmonitored" : "status-priority";
  return `<div class="mon-cell"><span class="mon-line ${cls}">${p.compliance}%</span></div>`;
}

const careStatusLabels = {
  recommended: { text: "Recommended", cls: "mon-unmonitored" },
  in_progress: { text: "In Progress", cls: "mon-progress" },
  completed: { text: "Completed", cls: "status-active" },
};

function careCell(p) {
  const care = p.careStatus && careStatusLabels[p.careStatus];
  if (!care) return `<div class="mon-cell"><span class="mon-line mon-none">—</span></div>`;
  return `
    <button type="button" class="care-indicator-trigger" data-id="${p.id}">
      <span class="mon-line ${care.cls}">${care.text}</span>
    </button>`;
}

function careIndicatorPopoverHtml(p) {
  return `
    <div class="care-indicator-popover-title">Care Recommendations</div>
    <div class="care-indicator-popover-item">
      <span class="mon-line ${careStatusLabels[p.careStatus].cls}">${careStatusLabels[p.careStatus].text}</span>
      <div class="care-indicator-popover-rec">${p.careTitle || ""}</div>
      ${p.careAssignee ? `<div class="care-indicator-popover-assignee">${p.careAssignee}</div>` : ""}
    </div>
    <a class="care-indicator-popover-link" href="${patientChartHref(p)}">View patient chart &rarr;</a>`;
}

function patientCareTeam(p) {
  return p.careTeam && p.careTeam.length ? p.careTeam : p.teamMember ? [p.teamMember] : [];
}

function careTeamCell(p) {
  const team = patientCareTeam(p);
  if (!team.length) return `<div class="mon-cell"><span class="mon-line mon-none">—</span></div>`;
  const extra = team.length - 1;
  return `
    <div class="care-team-list-cell">
      <span class="care-team-list-name">${team[0]}</span>
      ${extra > 0 ? `<button type="button" class="care-team-list-more" data-id="${p.id}">+${extra}</button>` : ""}
    </div>`;
}

function careTeamListPopoverHtml(p) {
  const team = patientCareTeam(p);
  return `
    <div class="care-indicator-popover-title">Care Team</div>
    ${team.map((name) => `<div class="care-team-popover-item"><span class="care-team-popover-name">${name}</span></div>`).join("")}`;
}

function complianceInRange(value) {
  if (!selectedComplianceRanges.size) return true;
  return [...selectedComplianceRanges].some((key) => {
    const range = complianceRanges.find((r) => r.key === key);
    return range && value >= range.min && value <= range.max;
  });
}

function genderLabel(gender) {
  return gender === "M" ? "(M)" : gender === "F" ? "(F)" : "(Other)";
}

/* Patients from an EHR-connected organization open the EHR patient chart
   (ehr-integration/patient-data.html); patients flagged chartView: "nurse"
   open the nurse view; everyone else opens the standard patient chart.
   Kept as separate pages/portals -- see ehr-integration/. */
function patientChartHref(p) {
  if (p.chartView === "nurse") return "nurse-view.html";
  return p.ehrOrg ? "ehr-integration/patient-data.html" : "patient-data.html";
}

function filteredPatientList() {
  return patientList.filter(
    (p) =>
      complianceInRange(p.compliance) &&
      (!selectedGenders.size || selectedGenders.has(p.gender)) &&
      (!selectedAccounts.size || selectedAccounts.has(p.account)) &&
      (!selectedStatuses.size || selectedStatuses.has(p.status)) &&
      (!selectedMonitorings.size || selectedMonitorings.has(p.monitoring)) &&
      (!selectedCareTeams.size || patientCareTeam(p).some((name) => selectedCareTeams.has(name))) &&
      (patientScope === "all" || p.teamMember === CURRENT_TEAM_MEMBER)
  );
}

const rows = document.getElementById("patientListRows");

function renderPatientList() {
  rows.innerHTML = filteredPatientList()
    .map(
      (p) => `
      <tr>
        <td><a class="lt-name ${p.status === "priority" ? "priority" : "active-name"}" href="${patientChartHref(p)}">${p.name} ${genderLabel(p.gender)}</a></td>
        <td>${p.username}</td>
        <td>${p.mrn}</td>
        <td>${p.phone}</td>
        <td>${p.account}</td>
        <td>${statusCell(p)}</td>
        <td>${monitoringCell(p)}</td>
        <td>${complianceCell(p)}</td>
        <td>${careCell(p)}</td>
        <td>${careTeamCell(p)}</td>
        <td>${actionCell(p)}</td>
      </tr>`
    )
    .join("");
}

renderPatientList();

/* ---------------- Compliance filter ---------------- */
const complianceMenu = document.getElementById("complianceMenu");
complianceMenu.innerHTML = complianceRanges
  .map(
    (r) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${r.key}" />
      ${r.label}
    </label>`
  )
  .join("");

/* Filter menus live inside .filters-bar, which needs overflow-x:auto for narrow
   viewports. That forces overflow-y to compute as auto too (CSS spec), clipping any
   dropdown that pops out below it. Portal the open menu to <body> with fixed
   positioning so it escapes that clipping. */
const portaledFilterMenus = new Map();

function positionFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
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

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="compliance"]'),
  complianceMenu,
  selectedComplianceRanges,
  renderPatientList
);

/* ---------------- Gender filter ---------------- */
const genderMenu = document.getElementById("genderMenu");
genderMenu.innerHTML = genderOptions
  .map(
    (g) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${g.key}" />
      ${g.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="gender"]'),
  genderMenu,
  selectedGenders,
  renderPatientList
);

/* ---------------- Account filter ---------------- */
const accountMenu = document.getElementById("accountMenu");
accountMenu.innerHTML = accountOptions
  .map(
    (a) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${a.key}" />
      ${a.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="account"]'),
  accountMenu,
  selectedAccounts,
  renderPatientList
);

/* ---------------- Status filter ---------------- */
const statusMenu = document.getElementById("statusMenu");
statusMenu.innerHTML = statusOptions
  .map(
    (s) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${s.key}" />
      ${s.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="status"]'),
  statusMenu,
  selectedStatuses,
  renderPatientList
);

/* ---------------- Monitoring filter ---------------- */
const monitoringMenu = document.getElementById("monitoringMenu");
monitoringMenu.innerHTML = monitoringOptions
  .map(
    (m) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${m.key}" />
      ${m.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="monitoring"]'),
  monitoringMenu,
  selectedMonitorings,
  renderPatientList
);

/* ---------------- Care Team filter ---------------- */
const careTeamFilterMenu = document.getElementById("careTeamFilterMenu");
careTeamFilterMenu.innerHTML = teamMemberOptions
  .map(
    (m) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${m.key}" />
      ${m.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="careTeam"]'),
  careTeamFilterMenu,
  selectedCareTeams,
  renderPatientList
);

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeFilterMenu(menuEl));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- All Patients / My Patients scope (segmented tabs) ---------------- */
const scopeTabs = document.getElementById("scopeTabs");

scopeTabs.addEventListener("click", (e) => {
  const tab = e.target.closest("[data-scope]");
  if (!tab) return;
  patientScope = tab.dataset.scope;
  scopeTabs.querySelectorAll("[data-scope]").forEach((el) => el.classList.toggle("active", el === tab));
  renderPatientList();
});

const clearableFilters = [
  { name: "account", menu: accountMenu, set: selectedAccounts, label: "Account" },
  { name: "status", menu: statusMenu, set: selectedStatuses, label: "Status" },
  { name: "monitoring", menu: monitoringMenu, set: selectedMonitorings, label: "Monitoring" },
  { name: "compliance", menu: complianceMenu, set: selectedComplianceRanges, label: "Compliance" },
  { name: "gender", menu: genderMenu, set: selectedGenders, label: "Gender" },
  { name: "careTeam", menu: careTeamFilterMenu, set: selectedCareTeams, label: "Care Team" },
];

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  clearableFilters.forEach(({ name, menu, set, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.querySelector(`.checkbox-filter[data-name="${name}"] .checkbox-filter-label`).textContent = label;
  });
  patientScope = "all";
  scopeTabs.querySelectorAll("[data-scope]").forEach((el) => el.classList.toggle("active", el.dataset.scope === "all"));
  renderPatientList();
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

document.addEventListener("click", closeAllCustomSelects);
document.addEventListener("scroll", closeAllCustomSelects, true);
window.addEventListener("resize", closeAllCustomSelects);

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

initCustomSelects();

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

/* ---------------- Add Patient menu ----------------
   Lives inside .filters-bar, whose overflow-x:auto clips this dropdown (forces
   overflow-y:auto too, per spec). Portal it to <body> with fixed positioning
   when open -- same fix already used for the checkbox filter menus above. */
const addPatientBtn = document.getElementById("openAddPatientBtn");
const addPatientMenuEl = document.getElementById("addPatientMenu");
const addPatientMenuHome = { parent: addPatientMenuEl.parentNode, next: addPatientMenuEl.nextSibling };

function positionAddPatientMenu() {
  const rect = addPatientBtn.getBoundingClientRect();
  addPatientMenuEl.style.position = "fixed";
  addPatientMenuEl.style.top = `${rect.bottom + 6}px`;
  addPatientMenuEl.style.right = `${window.innerWidth - rect.right}px`;
  addPatientMenuEl.style.left = "auto";
}

function closeAddPatientMenu() {
  addPatientMenuEl.classList.remove("open");
  addPatientMenuEl.style.position = "";
  addPatientMenuEl.style.top = "";
  addPatientMenuEl.style.right = "";
  addPatientMenuEl.style.left = "";
  if (addPatientMenuEl.parentNode === document.body) {
    if (addPatientMenuHome.next && addPatientMenuHome.next.parentNode === addPatientMenuHome.parent) {
      addPatientMenuHome.parent.insertBefore(addPatientMenuEl, addPatientMenuHome.next);
    } else {
      addPatientMenuHome.parent.appendChild(addPatientMenuEl);
    }
  }
}

addPatientBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !addPatientMenuEl.classList.contains("open");
  closeAllTopbarPopovers();
  if (willOpen) {
    document.body.appendChild(addPatientMenuEl);
    positionAddPatientMenu();
    addPatientMenuEl.classList.add("open");
  } else {
    closeAddPatientMenu();
  }
});

addPatientMenuEl.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => {
  if (addPatientMenuEl.classList.contains("open")) closeAddPatientMenu();
});
window.addEventListener("resize", () => {
  if (addPatientMenuEl.classList.contains("open")) positionAddPatientMenu();
});

document.getElementById("openRegisterManualBtn").addEventListener("click", () => {
  closeAddPatientMenu();
  openRegisterManualModal();
});

document.getElementById("openImportPatientBtn").addEventListener("click", () => {
  closeAddPatientMenu();
  openImportPatientModal();
});

/* ---------------- Register Manually modal ---------------- */
const registerManualOverlay = document.getElementById("registerManualOverlay");
const registerManualForm = document.getElementById("registerManualForm");
const registerManualFormWrap = document.getElementById("registerManualFormWrap");
const registerManualSuccessWrap = document.getElementById("registerManualSuccessWrap");
const saveRegisterManual = document.getElementById("saveRegisterManual");
const registerManualRequired = ["firstName", "lastName", "email", "emailLanguage"];

function validateRegisterManualForm() {
  const valid = registerManualRequired.every((name) => registerManualForm[name].value.trim() !== "");
  saveRegisterManual.disabled = !valid;
  saveRegisterManual.classList.toggle("enabled", valid);
}

registerManualForm.addEventListener("input", validateRegisterManualForm);
registerManualForm.addEventListener("change", validateRegisterManualForm);

/* ---------------- Care Team multiselect (Register Patient) ---------------- */
const careTeamField = registerManualForm.querySelector('.care-team-field[data-name="careTeam"]');
const careTeamTrigger = careTeamField.querySelector(".care-team-trigger");
const careTeamValueEl = careTeamField.querySelector(".care-team-trigger-value");
const careTeamMenu = careTeamField.querySelector(".care-team-menu");
const careTeamHidden = careTeamField.querySelector('input[name="careTeam"]');
const careTeamPlaceholder = careTeamValueEl.textContent.trim();
const selectedCareTeam = new Set();

careTeamTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !careTeamField.classList.contains("open");
  document.querySelectorAll(".checkbox-filter.open, .custom-select.open").forEach((el) => el.classList.remove("open"));
  careTeamField.classList.toggle("open", willOpen);
});

careTeamMenu.addEventListener("click", (e) => e.stopPropagation());

careTeamMenu.addEventListener("change", (e) => {
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  if (checkbox.checked) selectedCareTeam.add(checkbox.value);
  else selectedCareTeam.delete(checkbox.value);

  careTeamHidden.value = [...selectedCareTeam].join(", ");
  careTeamValueEl.textContent = selectedCareTeam.size ? `${selectedCareTeam.size} selected` : careTeamPlaceholder;
  careTeamValueEl.classList.toggle("placeholder", !selectedCareTeam.size);
});

document.addEventListener("click", () => careTeamField.classList.remove("open"));

function resetCareTeamSelect() {
  selectedCareTeam.clear();
  careTeamMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  careTeamHidden.value = "";
  careTeamValueEl.textContent = careTeamPlaceholder;
  careTeamValueEl.classList.add("placeholder");
}

const addInitialVitalsModalBtn = document.getElementById("addInitialVitalsModal");
addInitialVitalsModalBtn.addEventListener("click", () => {
  if (document.getElementById("vitalsGridModal")) return;

  const vitalsGrid = document.createElement("div");
  vitalsGrid.id = "vitalsGridModal";
  vitalsGrid.className = "form-grid";
  vitalsGrid.style.marginBottom = "18px";
  vitalsGrid.innerHTML = `
    <div class="form-field">
      <label>Weight (kg)</label>
      <input type="number" name="weight" placeholder="Weight" />
    </div>
    <div class="form-field">
      <label>Heart rate (bpm)</label>
      <input type="number" name="heartRate" placeholder="Heart rate" />
    </div>
    <div class="form-field">
      <label>Blood pressure</label>
      <input type="text" name="bloodPressure" placeholder="e.g. 120/80" />
    </div>`;

  addInitialVitalsModalBtn.insertAdjacentElement("afterend", vitalsGrid);
  addInitialVitalsModalBtn.style.display = "none";
});

function openRegisterManualModal() {
  registerManualForm.reset();
  resetCustomSelectsIn(registerManualForm);
  resetCareTeamSelect();
  validateRegisterManualForm();
  document.getElementById("vitalsGridModal")?.remove();
  addInitialVitalsModalBtn.style.display = "";
  registerManualFormWrap.style.display = "block";
  registerManualSuccessWrap.style.display = "none";
  registerManualOverlay.classList.add("open");
}

function closeRegisterManualModal() {
  registerManualOverlay.classList.remove("open");
}

document.getElementById("cancelRegisterManual").addEventListener("click", closeRegisterManualModal);
registerManualOverlay.addEventListener("click", (e) => { if (e.target === registerManualOverlay) closeRegisterManualModal(); });

registerManualForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveRegisterManual.disabled) return;
  registerManualFormWrap.style.display = "none";
  registerManualSuccessWrap.style.display = "block";
});

document.getElementById("closeRegisterManualSuccess").addEventListener("click", closeRegisterManualModal);

/* ---------------- Import Patient modal ---------------- */
const importPatientOverlay = document.getElementById("importPatientOverlay");
const importPatientFormWrap = document.getElementById("importPatientFormWrap");
const importPatientSuccessWrap = document.getElementById("importPatientSuccessWrap");
const importSearchBtn = document.getElementById("importSearchBtn");
const importResultsEmpty = document.getElementById("importResultsEmpty");
const importResultsWrap = document.getElementById("importResultsWrap");
const importResultsList = document.getElementById("importResultsList");
const importSelectAll = document.getElementById("importSelectAll");
const importSelectedCount = document.getElementById("importSelectedCount");
const importPatientBtn = document.getElementById("importPatientBtn");

const IMPORT_EHR_RESULTS = [
  { name: "Sarah White", firstName: "Sarah", lastName: "White", mrn: "ECW-88213", dob: "04/12/1958" },
  { name: "Ben Carter", firstName: "Ben", lastName: "Carter", mrn: "ECW-40217", dob: "11/02/1946" },
  { name: "John Doe", firstName: "John", lastName: "Doe", mrn: "ECW-40165", dob: "01/06/1957" },
];

function matchingImportResults() {
  const mrn = document.getElementById("importMrn").value.trim().toLowerCase();
  const firstName = document.getElementById("importFirstName").value.trim().toLowerCase();
  const lastName = document.getElementById("importLastName").value.trim().toLowerCase();
  const dobRaw = document.getElementById("importDob").value.trim();
  const dob = dobRaw ? new Date(dobRaw).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "";

  if (!mrn && !firstName && !lastName && !dob) return IMPORT_EHR_RESULTS;

  return IMPORT_EHR_RESULTS.filter((patient) => {
    if (mrn && !patient.mrn.toLowerCase().includes(mrn)) return false;
    if (firstName && !patient.firstName.toLowerCase().includes(firstName)) return false;
    if (lastName && !patient.lastName.toLowerCase().includes(lastName)) return false;
    if (dob && patient.dob !== dob) return false;
    return true;
  });
}

function updateImportSelection() {
  const rowChecks = importResultsList.querySelectorAll(".bill-checkbox");
  const checkedCount = importResultsList.querySelectorAll(".bill-checkbox.checked").length;

  importSelectedCount.textContent = `${checkedCount} selected`;
  importSelectAll.classList.toggle("checked", rowChecks.length > 0 && checkedCount === rowChecks.length);

  importPatientBtn.disabled = checkedCount === 0;
  importPatientBtn.classList.toggle("enabled", checkedCount > 0);
}

function resetImportPatientForm() {
  document.getElementById("importFirstName").value = "";
  document.getElementById("importLastName").value = "";
  document.getElementById("importMrn").value = "";
  document.getElementById("importDob").value = "";
  resetCustomSelectsIn(importPatientFormWrap);
  importResultsList.innerHTML = "";
  importResultsWrap.style.display = "none";
  importResultsEmpty.style.display = "block";
  importPatientBtn.disabled = true;
  importPatientBtn.classList.remove("enabled");
}

function openImportPatientModal() {
  resetImportPatientForm();
  importPatientFormWrap.style.display = "block";
  importPatientSuccessWrap.style.display = "none";
  importPatientOverlay.classList.add("open");
}

function closeImportPatientModal() {
  importPatientOverlay.classList.remove("open");
}

document.getElementById("cancelImportPatient").addEventListener("click", closeImportPatientModal);
importPatientOverlay.addEventListener("click", (e) => { if (e.target === importPatientOverlay) closeImportPatientModal(); });

importSearchBtn.addEventListener("click", () => {
  importResultsList.innerHTML = "";
  const matches = matchingImportResults();

  if (matches.length === 0) {
    importResultsWrap.style.display = "none";
    importResultsEmpty.textContent = "No matching patient found in the connected EHR.";
    importResultsEmpty.style.display = "flex";
    updateImportSelection();
    return;
  }

  matches.forEach((patient) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><span class="bill-checkbox"></span></td>
      <td><span class="lt-name active-name">${patient.name}</span></td>
      <td>${patient.mrn}</td>
      <td>${patient.dob}</td>`;
    row.addEventListener("click", () => {
      row.querySelector(".bill-checkbox").classList.toggle("checked");
      updateImportSelection();
    });
    importResultsList.appendChild(row);
  });

  importResultsEmpty.style.display = "none";
  importResultsWrap.style.display = "block";
  updateImportSelection();
});

importSelectAll.addEventListener("click", () => {
  const willCheck = !importSelectAll.classList.contains("checked");
  importResultsList.querySelectorAll(".bill-checkbox").forEach((box) => box.classList.toggle("checked", willCheck));
  updateImportSelection();
});

importPatientBtn.addEventListener("click", () => {
  if (importPatientBtn.disabled) return;
  importPatientFormWrap.style.display = "none";
  importPatientSuccessWrap.style.display = "block";
});

document.getElementById("closeImportPatientSuccess").addEventListener("click", closeImportPatientModal);

/* ---------------- Row action dropdown (Edit / Update account / Reset password) ---------------- */
const patientRowMenu = document.getElementById("patientRowMenu");
let activeRowPatientId = null;

function openRowMenuFor(id, trigger) {
  activeRowPatientId = id;
  const rect = trigger.getBoundingClientRect();
  patientRowMenu.style.top = `${rect.bottom + 6}px`;
  patientRowMenu.style.left = `${rect.right - 190}px`;
  patientRowMenu.classList.add("open");
}

/* ---------------- Care indicator popover ---------------- */
const careIndicatorPopover = document.getElementById("careIndicatorPopover");

function openCareIndicatorFor(id, trigger) {
  const patient = patientList.find((p) => p.id === id);
  if (!patient || !patient.careStatus) return;
  careIndicatorPopover.innerHTML = careIndicatorPopoverHtml(patient);
  const rect = trigger.getBoundingClientRect();
  careIndicatorPopover.style.top = `${rect.bottom + 6}px`;
  careIndicatorPopover.style.left = `${rect.left}px`;
  careIndicatorPopover.classList.add("open");
}

/* ---------------- Care Team list popover ---------------- */
const careTeamListPopover = document.getElementById("careTeamListPopover");

function openCareTeamListFor(id, trigger) {
  const patient = patientList.find((p) => p.id === id);
  if (!patient) return;
  careTeamListPopover.innerHTML = careTeamListPopoverHtml(patient);
  const rect = trigger.getBoundingClientRect();
  careTeamListPopover.style.top = `${rect.bottom + 6}px`;
  careTeamListPopover.style.left = `${rect.left}px`;
  careTeamListPopover.classList.add("open");
}

rows.addEventListener("click", (e) => {
  const addActionBtn = e.target.closest('.action-icon[data-act="addAction"]');
  if (addActionBtn) {
    const patient = patientList.find((p) => p.id === Number(addActionBtn.dataset.id));
    if (patient) openAddActionModal(patient);
    return;
  }

  const careTrigger = e.target.closest(".care-indicator-trigger");
  if (careTrigger) {
    e.stopPropagation();
    patientRowMenu.classList.remove("open");
    careTeamListPopover.classList.remove("open");
    openCareIndicatorFor(Number(careTrigger.dataset.id), careTrigger);
    return;
  }

  const careTeamMoreBtn = e.target.closest(".care-team-list-more");
  if (careTeamMoreBtn) {
    e.stopPropagation();
    patientRowMenu.classList.remove("open");
    careIndicatorPopover.classList.remove("open");
    openCareTeamListFor(Number(careTeamMoreBtn.dataset.id), careTeamMoreBtn);
    return;
  }

  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  careIndicatorPopover.classList.remove("open");
  careTeamListPopover.classList.remove("open");
  openRowMenuFor(Number(trigger.dataset.id), trigger);
});

document.addEventListener("click", (e) => {
  if (!patientRowMenu.contains(e.target)) patientRowMenu.classList.remove("open");
  if (!careIndicatorPopover.contains(e.target) && !e.target.closest(".care-indicator-trigger")) {
    careIndicatorPopover.classList.remove("open");
  }
  if (!careTeamListPopover.contains(e.target) && !e.target.closest(".care-team-list-more")) {
    careTeamListPopover.classList.remove("open");
  }
});

patientRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item || activeRowPatientId === null) return;
  patientRowMenu.classList.remove("open");

  const patient = patientList.find((p) => p.id === activeRowPatientId);
  if (!patient) return;

  if (item.dataset.action === "edit") openEditPatientModal(patient);
  else if (item.dataset.action === "account") openUpdateAccountModal(patient);
  else if (item.dataset.action === "reset") openResetPasswordModal(patient);
});

/* ---------------- Edit Patient modal ---------------- */
const editPatientOverlay = document.getElementById("editPatientOverlay");
const editPatientForm = document.getElementById("editPatientForm");
const saveEditPatient = document.getElementById("saveEditPatient");
const editPatientRequired = ["firstName", "lastName", "mrn", "email"];

function validateEditPatientForm() {
  const valid = editPatientRequired.every((name) => editPatientForm[name].value.trim() !== "");
  saveEditPatient.disabled = !valid;
  saveEditPatient.classList.toggle("enabled", valid);
}

editPatientForm.addEventListener("input", validateEditPatientForm);
editPatientForm.addEventListener("change", validateEditPatientForm);

function openEditPatientModal(patient) {
  editPatientForm.reset();
  resetCustomSelectsIn(editPatientForm);

  const [firstName, ...rest] = patient.name.split(" ");
  editPatientForm.firstName.value = firstName || "";
  editPatientForm.lastName.value = rest.join(" ");
  editPatientForm.mrn.value = patient.mrn || "";
  editPatientForm.mobile.value = (patient.phone || "").replace(/^\d+-/, "");

  validateEditPatientForm();
  editPatientOverlay.classList.add("open");
}

function closeEditPatientModal() {
  editPatientOverlay.classList.remove("open");
}

document.getElementById("cancelEditPatient").addEventListener("click", closeEditPatientModal);
editPatientOverlay.addEventListener("click", (e) => { if (e.target === editPatientOverlay) closeEditPatientModal(); });

editPatientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveEditPatient.disabled) return;
  closeEditPatientModal();
});

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

function openUpdateAccountModal(patient) {
  updateAccountSubtitle.textContent = `${patient.name} (${patient.username})`;
  accountActionRadios.forEach((radio) => (radio.checked = false));
  discontinueReasonField.style.display = "none";
  discontinueReasonOtherField.style.display = "none";
  setCustomSelectValue(discontinueReasonSelect, "", { silent: true });
  discontinueReasonOther.value = "";
  validateUpdateAccountForm();
  updateAccountOverlay.classList.add("open");
}

function closeUpdateAccountModal() {
  updateAccountOverlay.classList.remove("open");
}

document.getElementById("cancelUpdateAccount").addEventListener("click", closeUpdateAccountModal);
updateAccountOverlay.addEventListener("click", (e) => { if (e.target === updateAccountOverlay) closeUpdateAccountModal(); });

saveUpdateAccount.addEventListener("click", () => {
  if (saveUpdateAccount.disabled) return;

  const selected = document.querySelector('input[name="accountAction"]:checked');
  if (selected) {
    const today = new Date();
    const dateLabel = `${String(today.getMonth() + 1).padStart(2, "0")}.${String(today.getDate()).padStart(2, "0")}.${today.getFullYear()}`;
    const dotColor = selected.value === "Discontinued" ? "dot-black" : "dot-slate";

    let note = `Changed by ${CURRENT_TEAM_MEMBER}`;
    if (selected.value === "Discontinued") {
      const reason = discontinueReasonInput.value === "Other" ? discontinueReasonOther.value.trim() : discontinueReasonInput.value;
      if (reason) note += ` · Reason: ${reason}`;
    }

    const entry = { category: "account", color: dotColor, label: `Account changed to ${selected.value}`, date: dateLabel, note };

    const stored = JSON.parse(localStorage.getItem("hearoAccountHistory") || "[]");
    stored.unshift(entry);
    localStorage.setItem("hearoAccountHistory", JSON.stringify(stored));
  }

  closeUpdateAccountModal();
});

/* ---------------- Reset Password modal ---------------- */
const resetPasswordOverlay = document.getElementById("resetPasswordOverlay");
const resetPasswordName = document.getElementById("resetPasswordName");

function openResetPasswordModal(patient) {
  resetPasswordName.textContent = patient.name;
  resetPasswordOverlay.classList.add("open");
}

function closeResetPasswordModal() {
  resetPasswordOverlay.classList.remove("open");
}

document.getElementById("cancelResetPassword").addEventListener("click", closeResetPasswordModal);
resetPasswordOverlay.addEventListener("click", (e) => { if (e.target === resetPasswordOverlay) closeResetPasswordModal(); });
document.getElementById("confirmResetPassword").addEventListener("click", closeResetPasswordModal);

/* ---------------- Add Action modal ---------------- */
const addActionOverlay = document.getElementById("addActionOverlay");
const addActionForm = document.getElementById("addActionForm");
let activeActionPatientId = null;

function openAddActionModal(patient) {
  activeActionPatientId = patient.id;
  addActionForm.reset();
  if (patient.action) {
    addActionForm.actionType.value = patient.action.type;
    addActionForm.actionDate.value = patient.action.date || "";
    addActionForm.actionNote.value = patient.action.note || "";
  }
  addActionOverlay.classList.add("open");
}

function closeAddActionModal() {
  addActionOverlay.classList.remove("open");
  activeActionPatientId = null;
}

document.getElementById("cancelAddAction").addEventListener("click", closeAddActionModal);
addActionOverlay.addEventListener("click", (e) => { if (e.target === addActionOverlay) closeAddActionModal(); });

addActionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const patient = patientList.find((p) => p.id === activeActionPatientId);
  if (!patient) return;
  const type = addActionForm.actionType.value;
  if (type) {
    patient.action = {
      type,
      date: addActionForm.actionDate.value,
      note: addActionForm.actionNote.value,
    };
  }
  closeAddActionModal();
  renderPatientList();
});
