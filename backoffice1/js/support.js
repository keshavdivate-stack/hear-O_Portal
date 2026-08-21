/* ---------------- Tabs ---------------- */
document.querySelectorAll("#supportTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#supportTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll("[data-tab-btn]").forEach((b) => { b.hidden = b.dataset.tabBtn !== tab.dataset.tab; });
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Filter option lists ---------------- */
function buildFilterSelectOptions(values, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  return clearOption + buildSelectOptions(values);
}
document.getElementById("ticketStatusFilterMenu").innerHTML = buildFilterSelectOptions(STATUSES, "All statuses");
document.getElementById("ticketSeverityFilterMenu").innerHTML = buildFilterSelectOptions(SEVERITIES, "All severities");
document.getElementById("ticketCategoryFilterMenu").innerHTML = buildFilterSelectOptions(CATEGORIES, "All categories");
document.getElementById("ticketIssueFilterMenu").innerHTML = buildFilterSelectOptions(ISSUE_TYPES, "All issue types");
document.getElementById("ticketOriginFilterMenu").innerHTML = buildFilterSelectOptions(ORIGINS, "All origins");
document.getElementById("ticketTypeFilterMenu").innerHTML = buildFilterSelectOptions(TICKET_TYPES, "All types");

/* ---------------- Badges ---------------- */
const statusPillClass = { "Open": "bo-pill-status-open", "In Progress": "bo-pill-status-inprogress", "Escalated": "bo-pill-status-escalated", "Resolved": "bo-pill-status-resolved" };
const severityPillClass = { "Low": "bo-pill-severity-low", "Medium": "bo-pill-severity-medium", "High": "bo-pill-severity-high", "Critical": "bo-pill-severity-critical" };
const originPillClass = { "System Generated": "bo-pill-origin-system", "User Created": "bo-pill-origin-user" };
const typePillClass = { "Patient": "bo-pill-type-patient", "Clinic": "bo-pill-type-clinic" };

const statusPill = (s) => `<span class="bo-pill ${statusPillClass[s] || ""}">${s}</span>`;
const severityPill = (p) => `<span class="bo-pill ${severityPillClass[p] || ""}">${p}</span>`;
const tierPill = (t) => `<span class="bo-pill bo-pill-tier">${t}</span>`;
const originPill = (o) => `<span class="bo-pill ${originPillClass[o] || ""}">${o}</span>`;
const typePill = (s) => `<span class="bo-pill ${typePillClass[s] || ""}">${s}</span>`;
/* Category is a classification/routing field, not an urgency indicator --
   rendered as a neutral tag so it doesn't visually compete with the
   severity/status color coding in the same row. Tickets created via the
   New Ticket form can carry an explicit category (user picked it, or it
   defaulted from Issue Type); older/generated tickets fall back to the
   Issue Type -> category lookup. */
const ticketCategory = (t) => t.category || ISSUE_TYPE_CATEGORY[t.issueType];
const categoryPill = (t) => `<span class="bo-pill bo-pill-tag">${ticketCategory(t) || "—"}</span>`;

/* ---------------- Combine patient + clinic tickets into one list ----------------
   Tags each ticket in place (rather than spreading into copies) so edits made
   through the detail drawer stay in sync between this merged view and the
   underlying patientTickets/clinicTickets arrays. */
patientTickets.forEach((t) => { t.source = "patient"; t.type = "Patient"; t.who = t.patientId; });
clinicTickets.forEach((t) => { t.source = "clinic"; t.type = "Clinic"; t.who = t.raisedBy; });
const allTickets = [...patientTickets, ...clinicTickets];

/* ---------------- Tickets KPI row ---------------- */
function renderTicketKpis() {
  document.getElementById("ticketKpiOpen").textContent = allTickets.filter((t) => t.status === "Open" || t.status === "In Progress").length;
  document.getElementById("ticketKpiEscalated").textContent = allTickets.filter((t) => t.status === "Escalated").length;
  document.getElementById("ticketKpiCritical").textContent = allTickets.filter((t) => t.severity === "Critical").length;
  document.getElementById("ticketKpiResolved").textContent = allTickets.filter((t) => t.status === "Resolved").length;
}
renderTicketKpis();

const ticketKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Filter state (shared by both tabs) ---------------- */
let ticketStatusValue = "";
let ticketSeverityValue = "";
let ticketCategoryValue = "";
let ticketIssueValue = "";
let ticketOriginValue = "";
let ticketTypeValue = "";
let ticketSearchTerm = "";

/* Deep link: ?issueType=<Issue Type>&category=<Category>&type=<Type>&q=<search text>
   Lets other screens (e.g. the Overview dashboard's Issues by Category and
   Critical Issues panels) land here with the relevant filter/search already
   applied, instead of dropping the user on an unfiltered list. */
(function applyIncomingTicketFilters() {
  const params = new URLSearchParams(location.search);
  const issueType = params.get("issueType");
  const status = params.get("status");
  const severity = params.get("severity");
  const category = params.get("category");
  const origin = params.get("origin");
  const type = params.get("type");
  const q = params.get("q");

  if (issueType && ISSUE_TYPES.includes(issueType)) {
    ticketIssueValue = issueType;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketIssue"]'), issueType, { silent: true });
  }
  if (status && STATUSES.includes(status)) {
    ticketStatusValue = status;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketStatus"]'), status, { silent: true });
  }
  if (severity && SEVERITIES.includes(severity)) {
    ticketSeverityValue = severity;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketSeverity"]'), severity, { silent: true });
  }
  if (category && CATEGORIES.includes(category)) {
    ticketCategoryValue = category;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketCategory"]'), category, { silent: true });
  }
  if (origin && ORIGINS.includes(origin)) {
    ticketOriginValue = origin;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketOrigin"]'), origin, { silent: true });
  }
  if (type && TICKET_TYPES.includes(type)) {
    ticketTypeValue = type;
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketType"]'), type, { silent: true });
  }
  if (q) {
    ticketSearchTerm = q.trim().toLowerCase();
    document.getElementById("ticketSearchInput").value = q;
  }
})();

function matchesFilters(t, extraSearchable) {
  if (ticketStatusValue && t.status !== ticketStatusValue) return false;
  if (ticketSeverityValue && t.severity !== ticketSeverityValue) return false;
  if (ticketCategoryValue && ticketCategory(t) !== ticketCategoryValue) return false;
  if (ticketIssueValue && t.issueType !== ticketIssueValue) return false;
  if (ticketOriginValue && t.origin !== ticketOriginValue) return false;
  if (ticketTypeValue && t.type !== ticketTypeValue) return false;
  if (ticketSearchTerm) {
    const haystack = `${t.ticketNo} ${t.organization} ${extraSearchable}`.toLowerCase();
    if (!haystack.includes(ticketSearchTerm)) return false;
  }
  return true;
}

/* ---------------- Tickets table ---------------- */
const PAGE_SIZE = 8;

/* createdDate is "DD/MM/YYYY HH:mm" -- parse to an actual timestamp so
   sorting is chronological rather than a lexicographic string compare
   (which breaks across month/year boundaries). */
function parseTicketDate(s) {
  const [datePart, timePart] = s.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = (timePart || "0:0").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

/* Sorted newest-first so Patient and Clinic tickets -- concatenated in
   allTickets as two separate blocks -- interleave by recency instead of
   every Patient ticket appearing before any Clinic ticket in the list. */
function filteredTickets() {
  return allTickets.filter((t) => matchesFilters(t, t.who)).sort((a, b) => parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate));
}

const ticketPager = boCreatePager(
  "ticketRows",
  () => filteredTickets(),
  (t) => `
    <tr data-source="${t.source}" data-id="${t.id}">
      <td class="bo-ticket-id">${t.ticketNo}</td>
      <td>${t.organization}</td>
      <td>${typePill(t.type)}</td>
      <td>${t.who}</td>
      <td>${categoryPill(t)}</td>
      <td>${t.issueType}</td>
      <td>${originPill(t.origin)}</td>
      <td>${tierPill(t.tier)}</td>
      <td>${severityPill(t.severity)}</td>
      <td>${statusPill(t.status)}</td>
      <td>${t.assignedTo || "&mdash;"}</td>
      <td>${t.createdDate}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-source="${t.source}" data-id="${t.id}" aria-label="Row actions">${ticketKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: PAGE_SIZE, emptyColspan: 13, emptyText: "No tickets match these filters." }
);
ticketPager();

function refreshTicketTables() {
  ticketPager.resetPage();
  ticketPager();
  renderTicketKpis();
}

document.getElementById("ticketStatusFilter").addEventListener("change", (e) => {
  ticketStatusValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketSeverityFilter").addEventListener("change", (e) => {
  ticketSeverityValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketCategoryFilter").addEventListener("change", (e) => {
  ticketCategoryValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketIssueFilter").addEventListener("change", (e) => {
  ticketIssueValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketOriginFilter").addEventListener("change", (e) => {
  ticketOriginValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketTypeFilter").addEventListener("change", (e) => {
  ticketTypeValue = e.target.value;
  refreshTicketTables();
});
document.getElementById("ticketSearchInput").addEventListener("input", (e) => {
  ticketSearchTerm = e.target.value.trim().toLowerCase();
  refreshTicketTables();
});

/* ---------------- Custom selects (used inside the ticket drawers) ---------------- */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const options = Array.from(select.querySelectorAll(".bo-select-option"));
  /* Compare dataset.value directly rather than building a
     [data-value="..."] CSS selector -- many values here (statuses like "In
     Progress", levels like "Level 1", categories like "Patient (Mobile/Web)",
     issue types with colons/slashes) contain characters CSS.escape would
     encode, which never matches the plain, unescaped attribute actually
     rendered in the DOM. That silently left the dropdown showing its
     placeholder instead of the selected value, even though the underlying
     filter was applied correctly. */
  const option = options.find((o) => o.dataset.value === value);

  options.forEach((o) => o.classList.remove("selected"));

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

function positionBoSelectMenu(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const menu = select.querySelector(".bo-select-menu");
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

function resetBoSelect(select) {
  setBoSelectValue(select, "", { silent: true });
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function initBoSelects() {
  document.querySelectorAll(".bo-select").forEach((select) => {
    const trigger = select.querySelector(".bo-select-trigger");
    const valueEl = select.querySelector(".bo-select-value");

    valueEl.dataset.placeholder = valueEl.textContent.trim();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !select.classList.contains("open");
      closeAllBoSelects();
      if (willOpen) positionBoSelectMenu(select);
      select.classList.toggle("open", willOpen);
    });

    select.addEventListener("click", (e) => {
      const option = e.target.closest(".bo-select-option");
      if (!option) return;
      setBoSelectValue(select, option.dataset.value);
      select.classList.remove("open");
    });
  });

  document.addEventListener("click", closeAllBoSelects);
  document.addEventListener("scroll", closeAllBoSelects, true);
  window.addEventListener("resize", closeAllBoSelects);
}

initBoSelects();

function buildSelectOptions(values) {
  return values
    .map(
      (v) => `
      <div class="bo-select-option" data-value="${v}">${v}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}
document.querySelector('#ticketDetailOverlay .bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="ticketSeverityHandling"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="ticketStatus"] .bo-select-menu').innerHTML = buildSelectOptions(STATUSES);
document.querySelector('#newTicketOverlay .bo-select[data-name="source"] .bo-select-menu').innerHTML = buildSelectOptions(["Patient", "Clinic"]);
document.querySelector('#newTicketOverlay .bo-select[data-name="issueType"] .bo-select-menu').innerHTML = buildSelectOptions(ISSUE_TYPES);
document.querySelector('#newTicketOverlay .bo-select[data-name="category"] .bo-select-menu').innerHTML = buildSelectOptions(CATEGORIES);
document.querySelector('#newTicketOverlay .bo-select[data-name="ticketOrg"] .bo-select-menu').innerHTML = buildSelectOptions(SUPPORT_ORG_CODES);
document.querySelector('#newTicketOverlay .bo-select[data-name="ticketSeverity"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#newTicketOverlay .bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);

/* Severity and Level depend on knowing what the ticket actually is, so they
   stay locked until both Category and Issue Type are set (Issue Type alone
   is usually enough, since picking it auto-fills Category below). */
function updateNewTicketSeverityLevelState() {
  const categoryValue = newTicketOverlay.querySelector('.bo-select[data-name="category"] input[type=hidden]').value;
  const issueTypeValue = newTicketOverlay.querySelector('.bo-select[data-name="issueType"] input[type=hidden]').value;
  const ready = !!categoryValue && !!issueTypeValue;

  [
    { select: newTicketOverlay.querySelector('.bo-select[data-name="ticketSeverity"]'), placeholder: "Select severity" },
    { select: newTicketOverlay.querySelector('.bo-select[data-name="ticketLevel"]'), placeholder: "Select level" },
  ].forEach(({ select, placeholder }) => {
    const trigger = select.querySelector(".bo-select-trigger");
    const valueEl = select.querySelector(".bo-select-value");
    trigger.disabled = !ready;
    if (!valueEl.classList.contains("placeholder")) return;
    valueEl.dataset.placeholder = placeholder;
    valueEl.textContent = placeholder;
  });
}

/* The "who" dropdown lists patient IDs when raising on behalf of a patient,
   or clinic staff names when raising on behalf of a clinic -- same toggle
   the label already follows. Patient IDs are the org's actual patients when
   an org is selected, otherwise the full known patient list. */
const NEW_TICKET_PATIENT_IDS = Array.from(new Set(patientTickets.map((t) => t.patientId))).sort();

function renderNewTicketWhoOptions() {
  const sourceValue = newTicketOverlay.querySelector('.bo-select[data-name="source"] input[type=hidden]').value || "Patient";
  const orgValue = newTicketForm.organization.value;
  const menu = newTicketOverlay.querySelector('.bo-select[data-name="ticketWho"] .bo-select-menu');
  if (sourceValue === "Clinic") {
    menu.innerHTML = buildSelectOptions(SUPPORT_CLINIC_STAFF);
  } else {
    const ids = orgValue ? NEW_TICKET_PATIENT_IDS.filter((id) => id.startsWith(`${orgValue}-`)) : NEW_TICKET_PATIENT_IDS;
    menu.innerHTML = buildSelectOptions(ids);
  }
}

/* Picking an Issue Type defaults Category to that issue's category (same
   pairing shown in the ticket detail drawer), but Category stays a normal
   dropdown the user can still override before submitting. */
document.querySelector('#newTicketOverlay .bo-select[data-name="issueType"] input[type=hidden]').addEventListener("change", (e) => {
  const category = ISSUE_TYPE_CATEGORY[e.target.value];
  if (category) setBoSelectValue(newTicketOverlay.querySelector('.bo-select[data-name="category"]'), category, { silent: true });
  updateNewTicketSeverityLevelState();
});

document.querySelector('#newTicketOverlay .bo-select[data-name="category"] input[type=hidden]').addEventListener("change", updateNewTicketSeverityLevelState);

/* ---------------- Ticket detail drawer ---------------- */
const ticketDetailOverlay = document.getElementById("ticketDetailOverlay");
let activeTicket = null;

/* Tickets are seeded without a history log -- back-fill a single "Created"
   entry the first time a ticket is opened, so every ticket shows at least
   its origin instead of an empty timeline. */
function ensureTicketHistory(ticket) {
  if (!ticket.history) {
    ticket.history = [{ text: `Ticket created (${ticket.origin})`, date: ticket.createdDate }];
  }
  return ticket.history;
}

function renderTicketHistory(ticket) {
  const entries = ensureTicketHistory(ticket);
  document.getElementById("ticketDetailHistory").innerHTML = entries
    .slice()
    .reverse()
    .map((h) => `<div class="bo-ticket-history-item"><span class="text">${h.text}</span><span class="meta">${h.date}</span></div>`)
    .join("");
}

function setActiveTicket(source, id) {
  const list = source === "patient" ? patientTickets : clinicTickets;
  const ticket = list.find((t) => t.id === id);
  if (!ticket) return null;
  activeTicket = { source, ticket };
  return ticket;
}

/* Assignee choices narrow to whichever tier is currently selected in the
   Level field, so a ticket always lands on someone who actually works
   that tier. */
function populateTicketDetailAssignees(tier) {
  const menu = document.querySelector('#ticketDetailOverlay .bo-select[data-name="ticketAssignedTo"] .bo-select-menu');
  menu.innerHTML = buildSelectOptions(TIER_AGENTS[tier] || SUPPORT_AGENTS);
}

/* Resolved tickets no longer need routing info -- hide Level/Severity/
   Assigned To rather than asking for values that don't matter anymore. */
function applyTicketDetailStatusVisibility(status) {
  const resolved = status === "Resolved";
  document.getElementById("ticketDetailLevelField").hidden = resolved;
  document.getElementById("ticketDetailSeverityField").hidden = resolved;
  document.getElementById("ticketDetailAssignedToField").hidden = resolved;
}

function validateTicketDetailForm() {
  const status = ticketDetailOverlay.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value;
  applyTicketDetailStatusVisibility(status);
  const assigneeFilled = status === "Resolved" || ticketDetailOverlay.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').value !== "";
  document.getElementById("saveTicketDetail").disabled = !assigneeFilled;
}

function openTicketDetail(source, id) {
  const ticket = setActiveTicket(source, id);
  if (!ticket) return;

  document.getElementById("ticketDetailTitle").textContent = ticket.ticketNo;
  document.getElementById("ticketDetailSource").textContent = source === "patient" ? "Patient" : "Clinic";
  document.getElementById("ticketDetailWhoLabel").textContent = source === "patient" ? "Patient ID" : "Raised By";
  document.getElementById("ticketDetailWho").textContent = source === "patient" ? ticket.patientId : ticket.raisedBy;
  document.getElementById("ticketDetailOrg").textContent = ticket.organization;
  document.getElementById("ticketDetailOrigin").textContent = ticket.origin;
  document.getElementById("ticketDetailScope").textContent = ticket.scope;
  document.getElementById("ticketDetailCreated").textContent = ticket.createdDate;
  document.getElementById("ticketDetailIssueType").textContent = ticket.issueType;
  document.getElementById("ticketDetailCategory").textContent = ticketCategory(ticket) || "—";
  document.getElementById("ticketDetailDescription").textContent = ticket.description;

  document.getElementById("ticketDetailRootCause").value = ticket.rootCause || "";
  setBoSelectValue(ticketDetailOverlay.querySelector('.bo-select[data-name="ticketStatus"]'), ticket.status, { silent: true });
  setBoSelectValue(ticketDetailOverlay.querySelector('.bo-select[data-name="ticketLevel"]'), ticket.tier, { silent: true });
  setBoSelectValue(ticketDetailOverlay.querySelector('.bo-select[data-name="ticketSeverityHandling"]'), ticket.severity, { silent: true });
  populateTicketDetailAssignees(ticket.tier);
  setBoSelectValue(ticketDetailOverlay.querySelector('.bo-select[data-name="ticketAssignedTo"]'), ticket.assignedTo || "", { silent: true });
  validateTicketDetailForm();

  renderTicketHistory(ticket);

  ticketDetailOverlay.classList.add("open");
}

function closeTicketDetail() {
  ticketDetailOverlay.classList.remove("open");
  activeTicket = null;
}

/* ---------------- Row action dropdown (view ticket) ---------------- */
const ticketRowMenu = document.getElementById("ticketRowMenu");
let activeTicketSource = null;
let activeTicketId = null;

function wireTicketRowMenu(rowsId) {
  const rowsEl = document.getElementById(rowsId);

  rowsEl.addEventListener("click", (e) => {
    const trigger = e.target.closest(".row-menu-trigger");
    if (!trigger) return;
    e.stopPropagation();
    activeTicketSource = trigger.dataset.source;
    activeTicketId = Number(trigger.dataset.id);
    /* Device/app log data only exists for tickets raised on behalf of a
       patient (clinic-staff tickets have no device to report on), so the
       option is hidden rather than shown disabled. */
    document.getElementById("viewLogMenuItem").hidden = activeTicketSource !== "patient";
    const rect = trigger.getBoundingClientRect();
    ticketRowMenu.style.top = `${rect.bottom + 6}px`;
    ticketRowMenu.style.left = `${rect.right - 190}px`;
    ticketRowMenu.classList.add("open");
  });

  /* Clicking anywhere else in the row opens the ticket detail drawer
     directly, so the kebab menu is only needed as a secondary entry point. */
  rowsEl.addEventListener("click", (e) => {
    if (e.target.closest(".row-menu-trigger")) return;
    const row = e.target.closest("tr[data-source][data-id]");
    if (!row) return;
    openTicketDetail(row.dataset.source, Number(row.dataset.id));
  });
}
wireTicketRowMenu("ticketRows");

document.addEventListener("click", (e) => {
  if (!ticketRowMenu.contains(e.target)) ticketRowMenu.classList.remove("open");
});

ticketRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeTicketId === null) return;
  ticketRowMenu.classList.remove("open");
  if (item.dataset.action === "view") openTicketDetail(activeTicketSource, activeTicketId);
  if (item.dataset.action === "viewLog") openPatientLogModal(activeTicketSource, activeTicketId);
});

/* ---------------- Patient log modal (app version / device / permissions) ----------------
   Field set mirrors what the mobile app's own device log actually reports
   (see a raw log export: `[DeviceID]: iPhone17-5`, `VersionUpdateManager:
   Current App version: 3.2.0`, `Available device capacity usage MB: ...`,
   `HealthKit: Permission requesting - success`, `reading Blood Pressure -
   permissions denied`, etc.) -- so this only surfaces fields the app log
   really emits, not invented telemetry (no battery %, network type, etc.
   which the log never records). The seeded ticket data has no device
   telemetry attached to it, so the log is derived deterministically from
   the patient ID -- same ticket always shows the same "captured" log
   instead of re-rolling on every open. */
const patientLogOverlay = document.getElementById("patientLogOverlay");
let activePatientLog = null;

function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return hash / 4294967296;
  };
}

function pickFrom(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const LOG_DEVICES = [
  { deviceId: "iPhone17-5", os: "iOS 26.5", platform: "iOS" },
  { deviceId: "iPhone16-2", os: "iOS 18.4", platform: "iOS" },
  { deviceId: "iPhone14-7", os: "iOS 17.6", platform: "iOS" },
  { deviceId: "SM-G991B", os: "Android 14", platform: "Android" },
  { deviceId: "Pixel-7", os: "Android 14", platform: "Android" },
];
const LOG_APP_VERSIONS = ["3.1.5", "3.2.0", "3.2.7", "3.3.0", "3.4.1"];

/* Raw event lines the mobile app's device log actually emits, sampled from a
   real log export -- used to fabricate a plausible "Log History" list. */
const LOG_HISTORY_TEMPLATES = [
  "AudioEngineManager: Initalize session configuration - success",
  "AudioEngineManager: Set preferred sample rate - success",
  "AudioEngineManager: Activate session - success",
  "AudioEngineManager: Starting mic",
  "AudioRecorder: Mixer attach - success",
  "AudioRecorder: Mixer Input - success",
  "AudioRecorder: Engine Start - success",
  "AudioEngineManager: Model successfully initialized for language 'en'",
  "CordioNetworkManager: POST /api/Auth/saveFCMToken",
  "CordioNetworkManager: Response Status Code: 200",
  "CordioNetworkManager: POST /api/comm/chatmessage/GetForPatient",
  "FCM Token Sync: Successfully sent token to server",
  "Lexicon: Getting new version url - success",
  "Lexicon: Download - started chunk #0. Chunk size is 20MB",
  "Lexicon: Found model for language 'en' with version '0.0'",
  "FileUploader: get pending files list - failed: folder \"recordings\" doesn't exist",
  "Notification Manager: reminder mode updated from new config",
  "VoskModel: Found model path for language 'en'",
  "reset the app Badge",
  "Available device capacity usage MB: 110286 MB",
  "NoSessionLog: skipped - gap 0d < required 3d",
];

function buildLogHistory(rand, ticket) {
  const count = 18 + Math.floor(rand() * 10);
  let h = 8 + Math.floor(rand() * 10);
  let m = Math.floor(rand() * 60);
  let s = Math.floor(rand() * 60);
  const day = (ticket.createdDate || "").split(" ")[0] || "";
  const lines = [];
  for (let i = 0; i < count; i++) {
    s += 1 + Math.floor(rand() * 4);
    if (s >= 60) { s -= 60; m += 1; }
    if (m >= 60) { m -= 60; h += 1; }
    const ts = `${day} ${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    lines.push({ ts, msg: pickFrom(rand, LOG_HISTORY_TEMPLATES) });
  }
  return lines;
}

function buildPatientLog(ticket) {
  const rand = seededRandom(ticket.patientId || String(ticket.id));
  const device = pickFrom(rand, LOG_DEVICES);
  const appVersion = pickFrom(rand, LOG_APP_VERSIONS);
  const buildNumber = 80 + Math.floor(rand() * 20);
  const storageMb = 40000 + Math.floor(rand() * 90000);

  return {
    appVersion: [
      { label: "App Version", value: appVersion },
      { label: "Build Number", value: String(buildNumber) },
      { label: "Platform", value: device.platform },
      { label: "Last Updated", value: ticket.createdDate.split(" ")[0] },
    ],
    deviceInfo: [
      { label: "Device ID", value: device.deviceId },
      { label: "OS Version", value: device.os },
      { label: "Available Storage", value: `${(storageMb / 1024).toFixed(1)} GB` },
    ],
    permissions: [
      { label: "Microphone", value: "Granted" },
      { label: "Notifications", value: "Granted" },
      { label: "Health Data Access", value: "Granted" },
      { label: "Blood Pressure Data", value: rand() > 0.5 ? "Denied" : "Granted" },
    ],
    logHistory: buildLogHistory(rand, ticket),
  };
}

function renderPatientLogSection(elId, rows) {
  document.getElementById(elId).innerHTML = rows
    .map((r) => `<div class="patient-log-chip"><span class="label">${r.label}</span><span class="value">${r.value}</span></div>`)
    .join("");
}

function renderPatientLogHistory(elId, lines) {
  document.getElementById(elId).innerHTML = lines
    .map((l) => `<div class="patient-log-line"><span class="ts">${l.ts}</span><span class="msg">${l.msg}</span></div>`)
    .join("");
}

function openPatientLogModal(source, id) {
  const ticket = setActiveTicket(source, id);
  if (!ticket) return;
  const log = buildPatientLog(ticket);
  activePatientLog = { ticket, log };

  document.getElementById("patientLogTicketNo").textContent = `— ${ticket.ticketNo} (${ticket.patientId})`;
  renderPatientLogSection("patientLogAppVersion", log.appVersion);
  renderPatientLogSection("patientLogDeviceInfo", log.deviceInfo);
  renderPatientLogSection("patientLogPermissions", log.permissions);
  renderPatientLogHistory("patientLogHistory", log.logHistory);

  patientLogOverlay.classList.add("open");
}

function closePatientLogModal() {
  patientLogOverlay.classList.remove("open");
  activePatientLog = null;
}

function downloadPatientLog() {
  if (!activePatientLog) return;
  const { ticket, log } = activePatientLog;
  const section = (title, rows) => `${title}\n${rows.map((r) => `  ${r.label}: ${r.value}`).join("\n")}\n`;
  const historySection = `Log History\n${log.logHistory.map((l) => `  ${l.ts}: ${l.msg}`).join("\n")}\n`;
  const text = [
    `Patient Log - ${ticket.ticketNo} (${ticket.patientId})`,
    "",
    section("App Version", log.appVersion),
    section("Device Info", log.deviceInfo),
    section("Permissions Info", log.permissions),
    historySection,
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${ticket.ticketNo}-patient-log.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.getElementById("closePatientLogModal").addEventListener("click", closePatientLogModal);
document.getElementById("downloadPatientLogBtn").addEventListener("click", downloadPatientLog);
patientLogOverlay.addEventListener("click", (e) => { if (e.target === patientLogOverlay) closePatientLogModal(); });

document.getElementById("closeTicketDetailX").addEventListener("click", closeTicketDetail);
document.getElementById("cancelTicketDetail").addEventListener("click", closeTicketDetail);
ticketDetailOverlay.addEventListener("click", (e) => { if (e.target === ticketDetailOverlay) closeTicketDetail(); });
document.getElementById("ticketDetailForm").addEventListener("input", validateTicketDetailForm);
document.getElementById("ticketDetailForm").addEventListener("change", validateTicketDetailForm);

document.querySelector('#ticketDetailOverlay .bo-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
  populateTicketDetailAssignees(e.target.value);
  resetBoSelect(ticketDetailOverlay.querySelector('.bo-select[data-name="ticketAssignedTo"]'));
  validateTicketDetailForm();
});

function formatChangeDate() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

document.getElementById("ticketDetailForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeTicket || document.getElementById("saveTicketDetail").disabled) return;
  const ticket = activeTicket.ticket;
  const history = ensureTicketHistory(ticket);
  const changeDate = formatChangeDate();

  const rootCause = document.getElementById("ticketDetailRootCause").value.trim();
  const nextAssignee = ticketDetailOverlay.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').value;
  const nextTier = ticketDetailOverlay.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').value || ticket.tier;
  const nextSeverity = ticketDetailOverlay.querySelector('.bo-select[data-name="ticketSeverityHandling"] input[type=hidden]').value || ticket.severity;
  const nextStatus = ticketDetailOverlay.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value || ticket.status;

  if (rootCause !== (ticket.rootCause || "")) history.push({ text: `Root cause recorded: ${rootCause}`, date: changeDate });
  if (nextAssignee !== (ticket.assignedTo || "")) history.push({ text: `Reassigned from ${ticket.assignedTo || "Unassigned"} to ${nextAssignee}`, date: changeDate });
  if (nextTier !== ticket.tier) history.push({ text: `Level changed from ${ticket.tier} to ${nextTier}`, date: changeDate });
  if (nextSeverity !== ticket.severity) history.push({ text: `Severity changed from ${ticket.severity} to ${nextSeverity}`, date: changeDate });
  if (nextStatus !== ticket.status) history.push({ text: `Status changed from ${ticket.status} to ${nextStatus}`, date: changeDate });

  ticket.rootCause = rootCause;
  ticket.assignedTo = nextAssignee;
  ticket.tier = nextTier;
  ticket.severity = nextSeverity;
  ticket.status = nextStatus;

  closeTicketDetail();
  refreshTicketTables();
});

/* ---------------- New ticket drawer ---------------- */
const newTicketOverlay = document.getElementById("newTicketOverlay");
const newTicketForm = document.getElementById("newTicketForm");
const createTicketBtn = document.getElementById("createTicketBtn");

function validateNewTicketForm() {
  const orgFilled = newTicketForm.organization.value.trim() !== "";
  const whoFilled = newTicketForm.who.value.trim() !== "";
  const issueSelect = newTicketOverlay.querySelector('.bo-select[data-name="issueType"] input[type=hidden]');
  const categorySelect = newTicketOverlay.querySelector('.bo-select[data-name="category"] input[type=hidden]');
  createTicketBtn.disabled = !(orgFilled && whoFilled && issueSelect.value && categorySelect.value);
}

function openNewTicketDrawer() {
  newTicketForm.reset();
  newTicketOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  setBoSelectValue(newTicketOverlay.querySelector('.bo-select[data-name="source"]'), "Patient", { silent: true });
  document.getElementById("newTicketWhoLabel").textContent = "Patient ID";
  renderNewTicketWhoOptions();
  updateNewTicketSeverityLevelState();
  validateNewTicketForm();
  newTicketOverlay.classList.add("open");
}

function closeNewTicketDrawer() {
  newTicketOverlay.classList.remove("open");
}

document.getElementById("openNewTicketBtn").addEventListener("click", openNewTicketDrawer);
document.getElementById("closeNewTicketX").addEventListener("click", closeNewTicketDrawer);
document.getElementById("cancelNewTicket").addEventListener("click", closeNewTicketDrawer);
newTicketOverlay.addEventListener("click", (e) => { if (e.target === newTicketOverlay) closeNewTicketDrawer(); });

newTicketOverlay.querySelector('.bo-select[data-name="source"] input[type=hidden]').addEventListener("change", (e) => {
  document.getElementById("newTicketWhoLabel").textContent = e.target.value === "Clinic" ? "Raised By" : "Patient ID";
  resetBoSelect(newTicketOverlay.querySelector('.bo-select[data-name="ticketWho"]'));
  renderNewTicketWhoOptions();
});

newTicketOverlay.querySelector('.bo-select[data-name="ticketOrg"] input[type=hidden]').addEventListener("change", () => {
  resetBoSelect(newTicketOverlay.querySelector('.bo-select[data-name="ticketWho"]'));
  renderNewTicketWhoOptions();
});

newTicketForm.addEventListener("input", validateNewTicketForm);
newTicketForm.addEventListener("change", validateNewTicketForm);

newTicketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (createTicketBtn.disabled) return;

  const sourceValue = newTicketOverlay.querySelector('.bo-select[data-name="source"] input[type=hidden]').value || "Patient";
  const issueType = newTicketOverlay.querySelector('.bo-select[data-name="issueType"] input[type=hidden]').value;
  const severity = newTicketForm.severity.value || "Medium";
  const tier = newTicketForm.level.value || "Level 1";
  const category = newTicketOverlay.querySelector('.bo-select[data-name="category"] input[type=hidden]').value || ISSUE_TYPE_CATEGORY[issueType];
  const now = new Date();
  const createdDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (sourceValue === "Clinic") {
    const nextId = clinicTickets.length ? Math.max(...clinicTickets.map((t) => t.id)) + 1 : 0;
    const newTicket = {
      id: nextId,
      ticketNo: `TCK-${3000 + nextId}`,
      raisedBy: newTicketForm.who.value.trim(),
      organization: newTicketForm.organization.value.trim(),
      issueType,
      category,
      scope: ISSUE_TYPE_SCOPE[issueType] || "Patient",
      tier,
      severity,
      origin: "User Created",
      status: "Open",
      createdDate,
      description: newTicketForm.description.value.trim(),
      source: "clinic",
      type: "Clinic",
      who: newTicketForm.who.value.trim(),
    };
    clinicTickets.unshift(newTicket);
    allTickets.unshift(newTicket);
  } else {
    const nextId = patientTickets.length ? Math.max(...patientTickets.map((t) => t.id)) + 1 : 0;
    const newTicket = {
      id: nextId,
      ticketNo: `TCK-${3000 + nextId}`,
      patientId: newTicketForm.who.value.trim(),
      organization: newTicketForm.organization.value.trim(),
      issueType,
      category,
      scope: ISSUE_TYPE_SCOPE[issueType] || "Patient",
      tier,
      severity,
      origin: "User Created",
      status: "Open",
      createdDate,
      description: newTicketForm.description.value.trim(),
      source: "patient",
      type: "Patient",
      who: newTicketForm.who.value.trim(),
    };
    patientTickets.unshift(newTicket);
    allTickets.unshift(newTicket);
  }

  closeNewTicketDrawer();
  refreshTicketTables();
});

/* ---------------- Deep link: ?ticket=TCK-xxxx&source=patient|clinic ----------------
   Lets other screens (e.g. Support Dashboard's Critical & Escalated Tickets list)
   link straight into a specific ticket instead of just the tickets page. */
(function openTicketFromUrl() {
  const params = new URLSearchParams(location.search);
  const ticketNo = params.get("ticket");
  if (!ticketNo) return;

  const sourceParam = params.get("source");
  let source = sourceParam === "clinic" ? "clinic" : sourceParam === "patient" ? "patient" : null;
  let match = null;

  if (source) {
    match = (source === "patient" ? patientTickets : clinicTickets).find((t) => t.ticketNo === ticketNo);
  }
  if (!match) {
    match = patientTickets.find((t) => t.ticketNo === ticketNo);
    if (match) source = "patient";
  }
  if (!match) {
    match = clinicTickets.find((t) => t.ticketNo === ticketNo);
    if (match) source = "clinic";
  }
  if (!match) return;

  openTicketDetail(source, match.id);
})();

/* ---------------- Rules table ---------------- */
const channelPillClass = { "Notification": "bo-pill-channel-notification", "Email": "bo-pill-channel-email", "SMS": "bo-pill-channel-sms" };
const channelPills = (channels) => channels.map((c) => `<span class="bo-pill ${channelPillClass[c] || ""}">${c}</span>`).join(" ");

function renderRules() {
  document.getElementById("ruleRows").innerHTML = alertRules
    .map(
      (r) => `
      <tr>
        <td><b>${r.name}</b></td>
        <td>${r.condition}</td>
        <td>${severityPill(r.severity)}</td>
        <td>${tierPill(r.tier)}</td>
        <td>${r.slaResponse} / ${r.slaResolve}</td>
        <td>${channelPills(r.channels)}</td>
        <td>${r.appliesTo}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${r.id}" aria-label="Row actions">${ticketKebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}
renderRules();

document.querySelector('#ruleDrawerOverlay .bo-select[data-name="ruleSeverity"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#ruleDrawerOverlay .bo-select[data-name="ruleTier"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);

const ruleRowMenu = document.getElementById("ruleRowMenu");
let activeRuleId = null;

document.getElementById("ruleRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeRuleId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  ruleRowMenu.style.top = `${rect.bottom + 6}px`;
  ruleRowMenu.style.left = `${rect.right - 190}px`;
  ruleRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!ruleRowMenu.contains(e.target)) ruleRowMenu.classList.remove("open");
});

const ruleDrawerOverlay = document.getElementById("ruleDrawerOverlay");
const ruleDrawerForm = document.getElementById("ruleDrawerForm");
let editingRule = null;

function openRuleDrawer(rule) {
  editingRule = rule;
  document.getElementById("ruleDrawerTitle").textContent = `Edit Rule — ${rule.name}`;
  document.getElementById("ruleConditionInput").value = rule.condition;
  document.getElementById("ruleSlaResponseInput").value = rule.slaResponse;
  document.getElementById("ruleSlaResolveInput").value = rule.slaResolve;
  document.getElementById("ruleAppliesToInput").value = rule.appliesTo;
  document.getElementById("ruleAutoCreateInput").checked = rule.autoCreateTicket;

  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleSeverity"]'), rule.severity, { silent: true });
  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleTier"]'), rule.tier, { silent: true });

  ruleDrawerForm.querySelectorAll('input[name="ruleChannel"]').forEach((box) => {
    box.checked = rule.channels.includes(box.value);
  });

  ruleDrawerOverlay.classList.add("open");
}

function closeRuleDrawer() {
  ruleDrawerOverlay.classList.remove("open");
  editingRule = null;
}

ruleRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeRuleId === null) return;
  ruleRowMenu.classList.remove("open");
  if (item.dataset.action === "edit") {
    const rule = alertRules.find((r) => r.id === activeRuleId);
    if (rule) openRuleDrawer(rule);
  }
});

document.getElementById("closeRuleDrawerX").addEventListener("click", closeRuleDrawer);
document.getElementById("cancelRuleDrawer").addEventListener("click", closeRuleDrawer);
ruleDrawerOverlay.addEventListener("click", (e) => { if (e.target === ruleDrawerOverlay) closeRuleDrawer(); });

ruleDrawerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editingRule) return;

  editingRule.condition = document.getElementById("ruleConditionInput").value.trim();
  editingRule.slaResponse = document.getElementById("ruleSlaResponseInput").value.trim();
  editingRule.slaResolve = document.getElementById("ruleSlaResolveInput").value.trim();
  editingRule.appliesTo = document.getElementById("ruleAppliesToInput").value.trim();
  editingRule.autoCreateTicket = document.getElementById("ruleAutoCreateInput").checked;
  editingRule.severity = ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleSeverity"] input[type=hidden]').value || editingRule.severity;
  editingRule.tier = ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleTier"] input[type=hidden]').value || editingRule.tier;
  editingRule.channels = Array.from(ruleDrawerForm.querySelectorAll('input[name="ruleChannel"]:checked')).map((b) => b.value);

  closeRuleDrawer();
  renderRules();
});

/* ---------------- New Rule drawer ---------------- */
const RULE_APPLIES_TO = ["All organisations", "All Commercial orgs", "Per organisation", "System-wide"];
const SEND_BY_OPTIONS = ["In-app only", "In-app + Email", "In-app + SMS", "All channels"];
const SEND_BY_CHANNELS = {
  "In-app only": ["Notification"],
  "In-app + Email": ["Notification", "Email"],
  "In-app + SMS": ["Notification", "SMS"],
  "All channels": ["Notification", "Email", "SMS"],
};
/* New rules don't collect SLA targets directly (the form keeps them out to stay
   short) -- default from severity using the same response/resolve pairing the
   hand-authored rules already follow. */
const SEVERITY_DEFAULT_SLA = {
  Critical: { response: "30m", resolve: "4h" },
  High: { response: "2h", resolve: "24h" },
  Medium: { response: "8h", resolve: "3d" },
  Low: { response: "24h", resolve: "5d" },
};

document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleCategory"] .bo-select-menu').innerHTML = buildSelectOptions(CATEGORIES);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleSeverity"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleTier"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleAppliesTo"] .bo-select-menu').innerHTML = buildSelectOptions(RULE_APPLIES_TO);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleSendBy"] .bo-select-menu').innerHTML = buildSelectOptions(SEND_BY_OPTIONS);

const newRuleDrawerOverlay = document.getElementById("newRuleDrawerOverlay");
const newRuleForm = document.getElementById("newRuleForm");
const saveNewRuleBtn = document.getElementById("saveNewRuleDrawer");

function validateNewRuleForm() {
  const nameFilled = document.getElementById("newRuleNameInput").value.trim() !== "";
  const conditionFilled = document.getElementById("newRuleConditionInput").value.trim() !== "";
  const selectFilled = (name) => newRuleDrawerOverlay.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value !== "";
  saveNewRuleBtn.disabled = !(
    nameFilled &&
    conditionFilled &&
    selectFilled("newRuleCategory") &&
    selectFilled("newRuleSeverity") &&
    selectFilled("newRuleTier") &&
    selectFilled("newRuleAppliesTo") &&
    selectFilled("newRuleSendBy")
  );
}

function openNewRuleDrawer() {
  newRuleForm.reset();
  newRuleDrawerOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  validateNewRuleForm();
  newRuleDrawerOverlay.classList.add("open");
}

function closeNewRuleDrawer() {
  newRuleDrawerOverlay.classList.remove("open");
}

document.getElementById("openNewRuleBtn").addEventListener("click", openNewRuleDrawer);
document.getElementById("closeNewRuleDrawerX").addEventListener("click", closeNewRuleDrawer);
document.getElementById("cancelNewRuleDrawer").addEventListener("click", closeNewRuleDrawer);
newRuleDrawerOverlay.addEventListener("click", (e) => { if (e.target === newRuleDrawerOverlay) closeNewRuleDrawer(); });

newRuleForm.addEventListener("input", validateNewRuleForm);
newRuleForm.addEventListener("change", validateNewRuleForm);

newRuleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveNewRuleBtn.disabled) return;

  const selectValue = (name) => newRuleDrawerOverlay.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value;
  const severity = selectValue("newRuleSeverity");
  const sendBy = selectValue("newRuleSendBy");
  const sla = SEVERITY_DEFAULT_SLA[severity] || { response: "—", resolve: "—" };

  const nextId = alertRules.length ? Math.max(...alertRules.map((r) => r.id)) + 1 : 0;
  alertRules.unshift({
    id: nextId,
    name: document.getElementById("newRuleNameInput").value.trim(),
    category: selectValue("newRuleCategory"),
    condition: document.getElementById("newRuleConditionInput").value.trim(),
    severity,
    tier: selectValue("newRuleTier"),
    slaResponse: sla.response,
    slaResolve: sla.resolve,
    channels: SEND_BY_CHANNELS[sendBy] || [],
    autoCreateTicket: false,
    appliesTo: selectValue("newRuleAppliesTo"),
  });

  closeNewRuleDrawer();
  renderRules();
});
