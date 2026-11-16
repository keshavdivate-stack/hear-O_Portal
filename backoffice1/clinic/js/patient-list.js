/* Backoffice-safe fork of ../../js/patient-list.js (the root Patient List).
   Why forked instead of shared: the root file mixes patient PHI (names, MRN,
   phone numbers, free-text action notes, care-recommendation titles that name
   medications) together with its render/filter logic, so it cannot be reused
   unmodified. Re-synced with the current root file; changes from it:
   - Patients are never shown by name. NAME + USERNAME collapse into a single
     USER NO. column showing each patient's user number (the root data's
     `username` field, e.g. "ABC-1251"). MRN/ID and PHONE NO. columns are gone,
     and the data below carries no name/mrn/phone at all. The four root rows
     that share "ABC-1222" get distinct numbers (ABC-1222 / 1225 / 1231 / 1233,
     the same ones js/ctm-data.js uses) so each row stays distinguishable and
     opens the right patient chart (?patient=<user no.>).
   - Update Account / Send Reset Link / export show and write the user number
     only; the Patient/MRN/Phone export columns are dropped.
   - Care Recommendation content (careTitle names medications, plus the
     indicator popover and the hideMedDetails/noCareRec chart params) is not
     carried over.
   - The Action column keeps the administrative type + date; the seeded
     free-text notes (clinical narrative) are dropped from the data.
   - Add Patient (Register Manually / Import from EHR) and Edit Patient are
     dropped entirely (their HTML isn't on this page): they collect, display
     or pre-fill real patient identity.
   - patientChartHref() stays inside this folder: patient-data.html, or
     nurse-view.html (a redirect to patient-data.html here). The root's
     ehr-integration/ chart doesn't exist in this redacted copy. */

const heartIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const flagIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#9F1C3B" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#9F1C3B" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const flagIconOff = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#9AA5B1" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#9AA5B1" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const pendingAckIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>`;
const infoIconBlue = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const infoIconGray = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C9CFD6"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* Same demo patients as js/patient-list.js, PHI stripped: no name/mrn/phone,
   no careTitle/careAssignee (medication names), no free-text action note. */
const patientList = [
  { username: "ABC-1254", account: "Enabled", enrolledDate: "01.08.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: true, acked: false, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92, gender: "M", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell", "Amanda Lee, RN", "Ayelet Er, NP"] },
  { username: "ABC-1252", account: "Enabled", enrolledDate: "28.07.2028", ehrSystem: "Epic", source: "EHR Imported", status: "priority", flag: false, acked: true, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68, gender: "M", action: { type: "contacted", date: "08/14/2026", note: "" }, team: "Remote Monitoring Team", teamMember: "Amanda Lee, RN", careTeam: ["Amanda Lee, RN", "Dr. James Carter"] },
  { username: "ABC-1251", account: "Enabled", enrolledDate: "28.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, acked: true, since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", monSince: "Since: 1d | 01.09.2028", compliance: 34, gender: "M", team: "Heart Failure Team", teamMember: "Dr. James Carter", chartView: "nurse", careTeam: ["Dr. James Carter"] },
  { username: "ABC-1238", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, acked: true, since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81, gender: "F", action: { type: "invite", date: "", note: "" }, team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Sandy Kohl, RN", "Dr. Michael Reyes"] },
  { username: "ABC-1242", account: "Enabled", enrolledDate: "26.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, acked: false, since: "Since: 4d | 01.06.2028", monitoring: "nearly-unmonitored", monSince: "Since: 2d | 01.06.2028", compliance: 57, gender: "M", team: "Remote Monitoring Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Amanda Lee, RN"] },
  { username: "ABC-1283", account: "Enabled", enrolledDate: "22.07.2028", ehrSystem: null, source: "Manually Added", status: "priority", flag: false, acked: true, since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76, gender: "M", team: "Heart Failure Team", teamMember: "Ayelet Er, NP", careTeam: ["Ayelet Er, NP", "Dr. Sarah Mitchell", "Sandy Kohl, RN", "Emily Carter"] },
  { username: "ABC-1222", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: "Athena", source: "EHR Imported", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88, gender: "M", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter"] },
  { username: "ABC-1225", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45, gender: "F", team: "Remote Monitoring Team", teamMember: "Sandy Kohl, RN", careTeam: ["Sandy Kohl, RN", "Dr. Emily Chen"] },
  { username: "ABC-1231", account: "Paused", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63, gender: "M", team: "Heart Failure Team", teamMember: "Dr. Michael Reyes", careTeam: ["Dr. Michael Reyes"] },
  { username: "ABC-1220", account: "Enabled", enrolledDate: "27.07.2028", ehrSystem: "ECW", source: "EHR Imported", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12, gender: "M", team: "Post-Discharge Team", teamMember: "Emily Carter", careTeam: ["Emily Carter", "Ayelet Er, NP"] },
  { username: "ABC-1233", account: "Discontinued", enrolledDate: "27.07.2028", ehrSystem: null, source: "Manually Added", discontinuedDate: "01.05.2028", discontinuedReason: "Transferred to another provider", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", monInfo: true, compliance: 79, gender: "Other", team: "Remote Monitoring Team", teamMember: "Dr. Emily Chen", careTeam: ["Dr. Emily Chen", "Amanda Lee, RN", "Sandy Kohl, RN"] },
  { username: "ABC-1221", account: "Discontinued", enrolledDate: "20.11.2027", ehrSystem: null, source: "Manually Added", discontinuedDate: "12.29.2027", discontinuedReason: "Patient request", status: "none", monitoring: "unmonitored", monSince: "Since: 5d | 01.05.2028", compliance: 24, gender: "M", team: "Heart Failure Team", teamMember: "Dr. Sarah Mitchell", careTeam: ["Dr. Sarah Mitchell"] },
];

/* Current logged-in clinician (matches the "EC" topbar avatar), used by the
   All Patients / My Patients scope toggle. */
const CURRENT_TEAM_MEMBER = "Emily Carter";

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
  { key: "nearly-unmonitored", label: "Low Compliance" },
  { key: "unmonitored", label: "Unmonitored" },
];

/* Care Team = the individual clinicians (staff) assigned to the patient. */
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

const selectedGenders = new Set();
const selectedAccounts = new Set();
const selectedStatuses = new Set();
const selectedMonitorings = new Set();
const selectedCareTeams = new Set();
let patientScope = "all";

/* Initials of a care-team member (staff) -- used only for the "acknowledged
   by" avatar, never for patients. */
function initialsOf(name) {
  return (name || "")
    .replace(/^Dr\.\s*/i, "")
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function statusCell(p) {
  if (p.status === "priority") {
    /* The flag is a separate highlight mechanism and does not indicate
       acknowledgment -- a flagged priority can still be unacknowledged, so
       both render side by side rather than one replacing the other.
       The toggle button itself stays in the DOM at all times (so it's
       reachable by keyboard) but is only visually revealed on row hover,
       unless the patient is already flagged, in which case it stays visible. */
    const flagMark = `
        <button type="button" class="status-flag-btn ${p.flag ? "flagged" : ""}" data-id="${p.id}" aria-pressed="${p.flag}" aria-label="${p.flag ? "Remove flag" : "Flag patient"}">
          ${p.flag ? flagIcon : flagIconOff}
        </button>`;
    const ackMark = p.acked
      ? `
        <span class="action-icon-wrap status-ack-wrap">
          <span class="status-ack-avatar">${initialsOf(p.ackBy || p.teamMember)}</span>
          <span class="action-tooltip">Acknowledged by ${p.ackBy || p.teamMember || "—"}</span>
        </span>`
      : `
        <span class="action-icon-wrap status-ack-wrap">
          <span class="status-ack-pending">${pendingAckIcon}</span>
          <span class="action-tooltip">Not yet acknowledged</span>
        </span>`;
    return `
      <div class="status-cell">
        <span class="status-line status-priority">${heartIcon} Priority ${flagMark}${ackMark}</span>
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
        <span class="status-line status-registered">Registered</span>
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
  if (p.monitoring === "nearly-unmonitored") {
    return `
      <div class="mon-cell">
        <span class="mon-line mon-nearly-unmonitored">${infoIconBlue} Low Compliance</span>
        <span class="status-since">${p.monSince || ""}</span>
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
  const hasNote = p.action && (p.action.date || p.action.note);
  const tooltip = hasNote
    ? `<div class="action-tooltip">${p.action.date ? `${p.action.date}, ` : ""}${p.action.note || ""}</div>`
    : "";
  return `
    <div class="action-cell">
      <div class="action-icon-group">
        <div class="action-icon-wrap">
          <button class="action-icon" aria-label="${pencilTitle}" ${hasNote ? "" : `title="${pencilTitle}"`} data-id="${p.id}" data-act="addAction">
            ${pencilIcon}
          </button>
          ${label ? `<button class="action-icon-label" aria-label="Edit ${label}" data-id="${p.id}" data-act="editAction">${label}</button>` : ""}
          ${tooltip}
        </div>
        <button class="action-icon kebab row-menu-trigger" aria-label="More" data-id="${p.id}">${kebabIcon}</button>
      </div>
    </div>`;
}

patientList.forEach((p, i) => (p.id = i));

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

function genderLabel(gender) {
  return gender === "M" ? "(M)" : gender === "F" ? "(F)" : "(Other)";
}

/* Every patient chart link stays inside this backoffice redacted copy:
   chartView "nurse" -> nurse-view.html (redirects to patient-data.html here),
   everyone else -> patient-data.html. The root's ehr-integration/ chart and
   its Care Recommendation params (hideMedDetails / noCareRec) aren't carried
   over. */
function patientChartHref(p) {
  const base = p.chartView === "nurse" ? "nurse-view.html" : "patient-data.html";
  const params = new URLSearchParams();
  params.set("patient", p.username);
  if (p.account === "Discontinued") {
    params.set("discontinued", "1");
    params.set("discontinuedDate", p.discontinuedDate || "");
    params.set("discontinuedReason", p.discontinuedReason || "");
  }
  return `${base}?${params.toString()}`;
}

function filteredPatientList() {
  return patientList.filter(
    (p) =>
      (!selectedGenders.size || selectedGenders.has(p.gender)) &&
      (!selectedAccounts.size || selectedAccounts.has(p.account)) &&
      (!selectedStatuses.size || selectedStatuses.has(p.status)) &&
      (!selectedMonitorings.size || selectedMonitorings.has(p.monitoring)) &&
      (!selectedCareTeams.size || patientCareTeam(p).some((name) => selectedCareTeams.has(name))) &&
      (patientScope === "all" || p.teamMember === CURRENT_TEAM_MEMBER)
  );
}

const rows = document.getElementById("patientListRows");

/* ---------------- Columns visibility ----------------
   Display preference, not a data filter -- User No. and Action stay pinned
   (no checkbox), everything else defaults to visible/checked and survives
   "Clear all filters" since it's not filtering rows. Defined before
   renderPatientList (which calls applyColumnVisibility on every render)
   so there's no temporal-dead-zone gap between the two. */
const columnOptions = [
  { key: "account", label: "Account" },
  { key: "enrolledDate", label: "Enrolled Date" },
  { key: "connectedEhr", label: "Connected EHR" },
  { key: "source", label: "Source" },
  { key: "status", label: "Status" },
  { key: "monitoring", label: "Monitoring" },
  { key: "careTeam", label: "Care Team" },
];
const hiddenColumns = new Set();

function applyColumnVisibility() {
  columnOptions.forEach((c) => {
    const hide = hiddenColumns.has(c.key);
    document.querySelectorAll(`.list-table [data-col="${c.key}"]`).forEach((el) => {
      el.style.display = hide ? "none" : "";
    });
  });
}

function renderPatientList() {
  rows.innerHTML = filteredPatientList()
    .map(
      (p) => `
      <tr>
        <td data-col="userNo"><a class="lt-name ${p.status === "priority" ? "priority" : "active-name"}" href="${patientChartHref(p)}">${p.username} ${genderLabel(p.gender)}</a></td>
        <td data-col="account">${p.account}</td>
        <td data-col="enrolledDate">${p.enrolledDate || "—"}</td>
        <td data-col="connectedEhr">${p.ehrSystem ? `<span class="ehr-connected-pill">${p.ehrSystem}</span>` : "—"}</td>
        <td data-col="source">${p.source === "EHR Imported" ? `<span class="source-outline-badge">EHR</span>` : `<span class="source-outline-badge">Manual</span>`}</td>
        <td data-col="status">${statusCell(p)}</td>
        <td data-col="monitoring">${monitoringCell(p)}</td>
        <td data-col="careTeam">${careTeamCell(p)}</td>
        <td data-col="action">${actionCell(p)}</td>
      </tr>`
    )
    .join("");
  applyColumnVisibility();
}

renderPatientList();

/* Filter menus live inside .filters-bar, which needs overflow-x:auto for narrow
   viewports. That forces overflow-y to compute as auto too (CSS spec), clipping any
   dropdown that pops out below it. Portal the open menu to <body> with fixed
   positioning so it escapes that clipping. */
const portaledFilterMenus = new Map();

function positionFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const margin = 12;
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + margin;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const openUpward = spaceBelow < menuHeight && spaceAbove > spaceBelow;

  menu.style.position = "fixed";
  menu.style.left = "0px";
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";

  // Anchor left edge to the trigger, then pull the menu back inside the
  // viewport if its natural width (e.g. the Columns picker) would run off
  // the right edge of the screen.
  const menuWidth = menu.offsetWidth;
  let left = rect.left;
  if (left + menuWidth + margin > window.innerWidth) {
    left = Math.max(margin, rect.right - menuWidth);
  }
  menu.style.left = `${left}px`;
  // Cap height to whichever side it opens toward so a long list scrolls
  // internally instead of running off the viewport.
  const available = (openUpward ? spaceAbove : spaceBelow) - margin - 6;
  menu.style.maxHeight = `${Math.max(120, Math.min(280, available))}px`;
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
  menuEl.style.maxHeight = "";
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

function checkboxOptionsHtml(options) {
  return options
    .map(
      (o) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${o.key}" />
      ${o.label}
    </label>`
    )
    .join("");
}

/* ---------------- Gender filter ---------------- */
const genderMenu = document.getElementById("genderMenu");
genderMenu.innerHTML = checkboxOptionsHtml(genderOptions);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="gender"]'), genderMenu, selectedGenders, renderPatientList);

/* ---------------- Account filter ---------------- */
const accountMenu = document.getElementById("accountMenu");
accountMenu.innerHTML = checkboxOptionsHtml(accountOptions);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="account"]'), accountMenu, selectedAccounts, renderPatientList);

/* Default the Account filter to Enabled + Paused so Discontinued patients
   are hidden until someone explicitly asks to see them. */
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
statusMenu.innerHTML = checkboxOptionsHtml(statusOptions);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="status"]'), statusMenu, selectedStatuses, renderPatientList);

/* ---------------- Monitoring filter ---------------- */
const monitoringMenu = document.getElementById("monitoringMenu");
monitoringMenu.innerHTML = checkboxOptionsHtml(monitoringOptions);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="monitoring"]'), monitoringMenu, selectedMonitorings, renderPatientList);

/* ---------------- Care Team filter ---------------- */
const careTeamFilterMenu = document.getElementById("careTeamFilterMenu");
careTeamFilterMenu.innerHTML = checkboxOptionsHtml(teamMemberOptions);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="careTeam"]'), careTeamFilterMenu, selectedCareTeams, renderPatientList);

/* ---------------- Columns visibility menu (wiring) ----------------
   Two modes: Default View (all columns shown, no picker) and Custom
   View (reveals a checkbox per column so the user can choose which to
   show). Switching back to Default View clears any hidden columns. */
let columnsViewMode = "default";
const columnsMenu = document.getElementById("columnsMenu");

function renderColumnsMenu() {
  columnsMenu.innerHTML = `
    <label class="checkbox-filter-option">
      <input type="radio" name="columnsViewMode" value="default" ${columnsViewMode === "default" ? "checked" : ""} />
      Default View
    </label>
    <label class="checkbox-filter-option">
      <input type="radio" name="columnsViewMode" value="custom" ${columnsViewMode === "custom" ? "checked" : ""} />
      Custom View
    </label>
    ${
      columnsViewMode === "custom"
        ? `<div class="columns-custom-list">${columnOptions
            .map(
              (c) => `
          <label class="checkbox-filter-option">
            <input type="checkbox" value="${c.key}" ${hiddenColumns.has(c.key) ? "" : "checked"} />
            ${c.label}
          </label>`
            )
            .join("")}</div>`
        : ""
    }
  `;
}

renderColumnsMenu();

const columnsFilterWrap = document.querySelector('.checkbox-filter[data-name="columns"]');
const columnsTrigger = columnsFilterWrap.querySelector(".filter-btn");
const columnsLabel = columnsFilterWrap.querySelector(".checkbox-filter-label");

columnsTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !columnsFilterWrap.classList.contains("open");
  closeAllFilterPopovers();
  columnsFilterWrap.classList.toggle("open", willOpen);
  if (willOpen) openFilterMenu(columnsFilterWrap, columnsMenu);
});

columnsMenu.addEventListener("click", (e) => e.stopPropagation());

columnsMenu.addEventListener("change", (e) => {
  const radio = e.target.closest('input[type="radio"][name="columnsViewMode"]');
  if (radio) {
    columnsViewMode = radio.value;
    if (columnsViewMode === "default") {
      hiddenColumns.clear();
      columnsLabel.textContent = "Columns";
      applyColumnVisibility();
    }
    renderColumnsMenu();
    positionFilterMenu(columnsTrigger, columnsMenu);
    return;
  }

  const checkbox = e.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  if (checkbox.checked) hiddenColumns.delete(checkbox.value);
  else hiddenColumns.add(checkbox.value);

  columnsLabel.textContent = hiddenColumns.size ? `Columns (${hiddenColumns.size} hidden)` : "Columns";
  applyColumnVisibility();
});

/* Deep link: ?careTeam=<Care Team Member name> -- lets the Care Team
   Members page's row click land here with that member's patients already
   filtered, instead of dropping the user on the unfiltered list. */
(function applyIncomingCareTeamFilter() {
  const careTeam = new URLSearchParams(location.search).get("careTeam");
  if (!careTeam || !teamMemberOptions.some((m) => m.key === careTeam)) return;

  selectedCareTeams.add(careTeam);
  const checkbox = careTeamFilterMenu.querySelector(`input[value="${CSS.escape(careTeam)}"]`);
  if (checkbox) checkbox.checked = true;

  const label = document.querySelector('.checkbox-filter[data-name="careTeam"] .checkbox-filter-label');
  label.textContent = `Care Team (${selectedCareTeams.size})`;

  renderPatientList();
})();

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

/* ---------------- Row action dropdown (Acknowledge / Update account / Send reset link) ---------------- */
const patientRowMenu = document.getElementById("patientRowMenu");
let activeRowPatientId = null;

function openRowMenuFor(id, trigger) {
  activeRowPatientId = id;
  /* Acknowledge is offered only on a Priority patient no one has acknowledged yet. */
  const patient = patientList.find((p) => p.id === id);
  patientRowMenu.querySelector('[data-action="acknowledge"]').hidden = !(patient && patient.status === "priority" && !patient.acked);
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
  const flagBtn = e.target.closest(".status-flag-btn");
  if (flagBtn) {
    e.preventDefault();
    e.stopPropagation();
    const patient = patientList.find((p) => p.id === Number(flagBtn.dataset.id));
    if (patient) {
      patient.flag = !patient.flag;
      renderPatientList();
    }
    return;
  }

  const addActionBtn = e.target.closest('.action-icon[data-act="addAction"]');
  if (addActionBtn) {
    const patient = patientList.find((p) => p.id === Number(addActionBtn.dataset.id));
    if (patient) openAddActionModal(patient);
    return;
  }

  const editActionBtn = e.target.closest('.action-icon-label[data-act="editAction"]');
  if (editActionBtn) {
    const patient = patientList.find((p) => p.id === Number(editActionBtn.dataset.id));
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

  if (item.dataset.action === "acknowledge") {
    patient.acked = true;
    patient.ackBy = CURRENT_TEAM_MEMBER;
    renderPatientList();
  }
  else if (item.dataset.action === "account") openUpdateAccountModal(patient);
  else if (item.dataset.action === "reset") openResetPasswordModal(patient);
});

/* ---------------- Export Report ----------------
   Same columns as the root export minus Patient (name), MRN and Phone;
   patients are identified by user number only. */
const PATIENT_LIST_EXPORT_COLUMNS = [
  { label: "User No.", value: (p) => p.username },
  { label: "Account Status", value: (p) => p.account },
  { label: "Enrolled Date", value: (p) => p.enrolledDate || "" },
  { label: "EHR System", value: (p) => p.ehrSystem || "" },
  { label: "Source", value: (p) => p.source },
  { label: "Clinical Status", value: (p) => p.status },
  { label: "Monitoring Status", value: (p) => p.monitoring },
  { label: "Compliance %", value: (p) => p.compliance },
  { label: "Care Team", value: (p) => patientCareTeam(p).join("; ") },
];

function describePatientListFilters() {
  const parts = [];
  if (patientScope === "mine") parts.push("My Patients");
  if (selectedAccounts.size) parts.push(`Account = ${[...selectedAccounts].join(", ")}`);
  if (selectedStatuses.size) {
    parts.push(`Status = ${[...selectedStatuses].map((k) => statusOptions.find((o) => o.key === k)?.label || k).join(", ")}`);
  }
  if (selectedMonitorings.size) {
    parts.push(`Monitoring = ${[...selectedMonitorings].map((k) => monitoringOptions.find((o) => o.key === k)?.label || k).join(", ")}`);
  }
  if (selectedGenders.size) {
    parts.push(`Gender = ${[...selectedGenders].map((k) => genderOptions.find((o) => o.key === k)?.label || k).join(", ")}`);
  }
  if (selectedCareTeams.size) parts.push(`Care Team = ${[...selectedCareTeams].join(", ")}`);
  return parts.length ? parts.join(", ") : "None";
}

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(prefix, columns, rowsData) {
  const header = columns.map((c) => c.label);
  const lines = [header.join(",")].concat(rowsData.map((r) => columns.map((c) => csvEscape(c.value(r))).join(",")));
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

const exportReportOverlay = document.getElementById("exportReportOverlay");
let pendingPatientListExport = null;

function openExportReportModal(context) {
  pendingPatientListExport = context;
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
  if (!pendingPatientListExport) return;
  const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "CSV";
  if (format === "CSV") {
    downloadCsv(pendingPatientListExport.filenamePrefix || "report", pendingPatientListExport.columns, pendingPatientListExport.rows);
  } else {
    alert(`${format} export is coming soon — please use CSV for now.`);
    return;
  }
  exportReportOverlay.classList.remove("open");
});

document.getElementById("exportPatientListBtn").addEventListener("click", () => {
  const list = filteredPatientList();
  openExportReportModal({
    reportLabel: "Patient List",
    filtersLabel: describePatientListFilters(),
    count: list.length,
    countLabel: "Patients",
    rows: list,
    columns: PATIENT_LIST_EXPORT_COLUMNS,
    filenamePrefix: "patient-list",
  });
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

  /* Same account-history hand-off as the root page: the clinic patient chart
     (js/patient-data.js) picks this up. The entry carries no patient identity
     -- only the new account state, the staff member and the reason. */
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

    try {
      const stored = JSON.parse(localStorage.getItem("hearoAccountHistory") || "[]");
      stored.unshift(entry);
      localStorage.setItem("hearoAccountHistory", JSON.stringify(stored));
    } catch (err) {}
  }

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
