/* Backoffice-safe fork of ../../js/patient-list.js (the root Patient List).
   Why forked instead of shared: the root file mixes patient PHI (names, MRN,
   phone numbers, free-text action notes, care-recommendation titles that name
   medications) together with its render/filter logic, so it cannot be reused
   unmodified. Changes from the root file:
   - Patient name/MRN/phone dropped; only each patient's Patient ID (the
     existing `username` field, e.g. "ABC-1251") is shown, reused as-is from
     the root file's data -- no new IDs invented.
   - The CARE RECOMMENDATION column/popover is removed entirely (Care
     Recommendation content -- including medication names in careTitle -- is
     out of scope per the redaction policy; it's phase 2's own page anyway).
   - The Action column keeps only the administrative type + date; the
     free-text note (which can contain clinical narrative, e.g. "Called
     patient to confirm symptoms improving") is dropped.
   - Register Manually / Import Patient / Edit Patient flows are dropped
     entirely (their HTML isn't in this page) -- Register/Import handle or
     display real patient identity, and Edit Patient pre-fills real name/
     mobile/gender into a form; all three are display/collection of exactly
     the PHI this view must avoid.
   - patientChartHref() always links to this folder's own patient-data.html
     (the root version can route to nurse-view.html or ehr-integration/, which
     don't exist in this backoffice redacted copy). */

const flagIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#F16C6C" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#F16C6C" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const heartIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const infoIconBlue = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const infoIconGray = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C9CFD6"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

/* Same demo patients as js/patient-list.js, PHI stripped: no name/mrn/phone,
   no careTitle (medication names), no free-text action note. */
const patientList = [
  { username: "ABC-1254", account: "Enabled", enrolledDate: "01.08.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: true, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92, gender: "M", careStatus: "in_progress", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell", "Amanda Lee, RN", "Ayelet Er, NP"] },
  { username: "ABC-1252", account: "Enabled", enrolledDate: "28.07.2028", ehrSystem: "Epic", source: "EHR Imported", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68, gender: "M", action: { type: "contacted", date: "08/14/2026" }, careStatus: "completed", team: "Remote Monitoring Team", teamMember: "Amanda Lee, RN", careTeam: ["Amanda Lee, RN", "Dr. James Carter"] },
  { username: "ABC-1251", account: "Enabled", enrolledDate: "28.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", monSince: "Since: 1d | 01.09.2028", compliance: 34, gender: "M", team: "Heart Failure Team", teamMember: "Dr. James Carter", careTeam: ["Dr. James Carter"] },
  { username: "ABC-1238", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81, gender: "F", action: { type: "invite", date: "" }, careStatus: "recommended", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Sandy Kohl, RN", "Dr. Michael Reyes"] },
  { username: "ABC-1242", account: "Enabled", enrolledDate: "26.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, since: "Since: 4d | 01.06.2028", monitoring: "monitored", compliance: 57, gender: "M", team: "Remote Monitoring Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Amanda Lee, RN"] },
  { username: "ABC-1283", account: "Enabled", enrolledDate: "22.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76, gender: "M", careStatus: "in_progress", team: "Heart Failure Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Dr. Sarah Mitchell", "Sandy Kohl, RN", "Emily Carter"] },
  { username: "ABC-1222a", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: "Athena", source: "EHR Imported", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88, gender: "M", careStatus: "completed", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter"] },
  { username: "ABC-1222b", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45, gender: "F", team: "Remote Monitoring Team", teamMember: "Sandy Kohl, RN", careTeam: ["Sandy Kohl, RN", "Dr. Emily Chen"] },
  { username: "ABC-1222c", account: "Paused", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63, gender: "M", careStatus: "recommended", team: "Heart Failure Team", teamMember: "Dr. Michael Reyes", careTeam: ["Dr. Michael Reyes"] },
  { username: "ABC-1220", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: "ECW", source: "EHR Imported", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12, gender: "M", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Ayelet Er, NP"] },
  { username: "ABC-1222d", account: "Discontinued", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", discontinuedDate: "01.05.2028", discontinuedReason: "Transferred to another provider", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", monInfo: true, compliance: 79, gender: "Other", careStatus: "completed", team: "Remote Monitoring Team", teamMember: "Dr. Emily Chen", careTeam: ["Dr. Emily Chen", "Amanda Lee, RN", "Sandy Kohl, RN"] },
  { username: "ABC-1221", account: "Discontinued", enrolledDate: "20.11.2027", ehrSystem: null, source: "Manually Added", discontinuedDate: "12.29.2027", discontinuedReason: "Patient request", status: "none", monitoring: "unmonitored", monSince: "Since: 5d | 01.05.2028", compliance: 24, gender: "M", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell"] },
];

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
  const tooltip = p.action && p.action.date ? `<div class="action-tooltip">${p.action.date}</div>` : "";
  return `
    <div class="action-cell">
      <div class="action-icon-group">
        <div class="action-icon-wrap">
          <button class="action-icon action-icon-with-label" aria-label="${pencilTitle}" ${tooltip ? "" : `title="${pencilTitle}"`} data-id="${p.id}" data-act="addAction">
            ${pencilIcon}${label ? `<span class="action-icon-label">${label}</span>` : ""}
          </button>
          ${tooltip}
        </div>
        <button class="action-icon kebab row-menu-trigger" aria-label="More" data-id="${p.id}">${kebabIcon}</button>
      </div>
    </div>`;
}

patientList.forEach((p, i) => (p.id = i));

function complianceCell(p) {
  const cls = p.compliance >= 76 ? "status-active" : p.compliance >= 51 ? "mon-unmonitored" : "status-priority";
  return `<div class="mon-cell"><span class="mon-line ${cls}">${p.compliance}%</span></div>`;
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

/* Every patient chart link stays inside this backoffice redacted copy --
   never nurse-view.html or ehr-integration/, which aren't built here. */
function patientChartHref(p) {
  const params = new URLSearchParams();
  if (p.account === "Discontinued") {
    params.set("discontinued", "1");
    params.set("discontinuedDate", p.discontinuedDate || "");
    params.set("discontinuedReason", p.discontinuedReason || "");
  }
  const query = params.toString();
  return query ? `patient-data.html?${query}` : "patient-data.html";
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
        <td><a class="lt-name ${p.status === "priority" ? "priority" : "active-name"}" href="${patientChartHref(p)}">${p.username}</a></td>
        <td>${p.account}</td>
        <td>${p.enrolledDate || "—"}</td>
        <td>${p.ehrSystem ? `<span class="ehr-connected-pill">${p.ehrSystem}</span>` : "—"}</td>
        <td>${p.source === "EHR Imported" ? `<span class="source-outline-badge">EHR</span>` : `<span class="source-outline-badge">Manual</span>`}</td>
        <td>${statusCell(p)}</td>
        <td>${monitoringCell(p)}</td>
        <td>${complianceCell(p)}</td>
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
  .map((r) => `<label class="checkbox-filter-option"><input type="checkbox" value="${r.key}" />${r.label}</label>`)
  .join("");

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

wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="compliance"]'), complianceMenu, selectedComplianceRanges, renderPatientList);

/* ---------------- Gender filter ---------------- */
const genderMenu = document.getElementById("genderMenu");
genderMenu.innerHTML = genderOptions.map((g) => `<label class="checkbox-filter-option"><input type="checkbox" value="${g.key}" />${g.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="gender"]'), genderMenu, selectedGenders, renderPatientList);

/* ---------------- Account filter ---------------- */
const accountMenu = document.getElementById("accountMenu");
accountMenu.innerHTML = accountOptions.map((a) => `<label class="checkbox-filter-option"><input type="checkbox" value="${a.key}" />${a.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="account"]'), accountMenu, selectedAccounts, renderPatientList);

["Enabled", "Paused"].forEach((value) => {
  selectedAccounts.add(value);
  const checkbox = accountMenu.querySelector(`input[value="${value}"]`);
  if (checkbox) checkbox.checked = true;
});
const accountFilterLabel = document.querySelector('.checkbox-filter[data-name="account"] .checkbox-filter-label');
accountFilterLabel.textContent = `${accountFilterLabel.textContent.trim()} (${selectedAccounts.size})`;
renderPatientList();

/* ---------------- Status filter ---------------- */
const statusMenu = document.getElementById("statusMenu");
statusMenu.innerHTML = statusOptions.map((s) => `<label class="checkbox-filter-option"><input type="checkbox" value="${s.key}" />${s.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="status"]'), statusMenu, selectedStatuses, renderPatientList);

/* ---------------- Monitoring filter ---------------- */
const monitoringMenu = document.getElementById("monitoringMenu");
monitoringMenu.innerHTML = monitoringOptions.map((m) => `<label class="checkbox-filter-option"><input type="checkbox" value="${m.key}" />${m.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="monitoring"]'), monitoringMenu, selectedMonitorings, renderPatientList);

/* ---------------- Care Team filter ---------------- */
const careTeamFilterMenu = document.getElementById("careTeamFilterMenu");
careTeamFilterMenu.innerHTML = teamMemberOptions.map((m) => `<label class="checkbox-filter-option"><input type="checkbox" value="${m.key}" />${m.label}</label>`).join("");
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="careTeam"]'), careTeamFilterMenu, selectedCareTeams, renderPatientList);

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeFilterMenu(menuEl));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- All Patients / My Patients scope ---------------- */
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

/* ---------------- Custom dropdowns ---------------- */
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

/* ---------------- Row action dropdown (Update account / Send reset link) ---------------- */
const patientRowMenu = document.getElementById("patientRowMenu");
let activeRowPatientId = null;

function openRowMenuFor(id, trigger) {
  activeRowPatientId = id;
  const rect = trigger.getBoundingClientRect();
  patientRowMenu.style.top = `${rect.bottom + 6}px`;
  patientRowMenu.style.left = `${rect.right - 190}px`;
  patientRowMenu.classList.add("open");
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

  const careTeamMoreBtn = e.target.closest(".care-team-list-more");
  if (careTeamMoreBtn) {
    e.stopPropagation();
    patientRowMenu.classList.remove("open");
    openCareTeamListFor(Number(careTeamMoreBtn.dataset.id), careTeamMoreBtn);
    return;
  }

  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  careTeamListPopover.classList.remove("open");
  openRowMenuFor(Number(trigger.dataset.id), trigger);
});

document.addEventListener("click", (e) => {
  if (!patientRowMenu.contains(e.target)) patientRowMenu.classList.remove("open");
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

  if (item.dataset.action === "account") openUpdateAccountModal(patient);
  else if (item.dataset.action === "reset") openResetPasswordModal(patient);
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
  updateAccountSubtitle.textContent = patient.username;
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
  closeUpdateAccountModal();
});

/* ---------------- Send Reset Link modal ---------------- */
const resetPasswordOverlay = document.getElementById("resetPasswordOverlay");
const resetPasswordName = document.getElementById("resetPasswordName");

function openResetPasswordModal(patient) {
  resetPasswordName.textContent = patient.username;
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
const actionTypeSelect = document.getElementById("actionTypeSelect");
let activeActionPatientId = null;

function openAddActionModal(patient) {
  activeActionPatientId = patient.id;
  addActionForm.reset();
  resetCustomSelectsIn(addActionForm);
  if (patient.action) {
    setCustomSelectValue(actionTypeSelect, patient.action.type);
    addActionForm.actionDate.value = patient.action.date || "";
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
    patient.action = { type, date: addActionForm.actionDate.value };
  }
  closeAddActionModal();
  renderPatientList();
});
