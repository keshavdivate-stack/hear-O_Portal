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

/* Deep link: ?tab=<tickets|incidents|rules> -- lets the Support Dashboard's
   "View All Tickets"/"View All Incidents" links land here on the right tab
   instead of always defaulting to Tickets. */
(function applyIncomingTab() {
  const tab = new URLSearchParams(location.search).get("tab");
  if (!tab) return;
  const tabBtn = document.querySelector(`#supportTabs .bo-tab[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.click();
})();

/* ---------------- Filters ----------------
   Same filters, values and behavior as the developed Tickets tab: every
   list is a multi-select; Issue Type unlocks once a Category is picked
   (listing only those categories' issue types) and Assigned To once a Level
   is picked (listing only that level's agents); nothing applies until
   "Apply". The list opens on Open + In Progress tickets. */
const TICKET_FILTER_LEVELS = ["Level 1", "Level 2"];
const TICKET_DEFAULT_STATUSES = ["Open", "In Progress"];

document.getElementById("ticketOrganizationFilterMenu").innerHTML = buildFilterSelectOptions(SUPPORT_ORG_CODES, "All Organizations");
addBoSelectSearch(document.querySelector('.bo-select[data-name="ticketOrganization"]'), "Search organizations");

const ticketTypeFilter = wireSupportMultiFilter("ticketTypeFilter", { options: asFilterOptions(["Patient", "Clinic", "System"]) });
const ticketPriorityFilter = wireSupportMultiFilter("ticketPriorityFilter", { options: asFilterOptions(PRIORITIES) });
const ticketCategoryFilter = wireSupportMultiFilter("ticketCategoryFilter", { options: asFilterOptions(CATEGORIES) });
const ticketIssueFilter = wireSupportMultiFilter("ticketIssueFilter", { disabledPlaceholder: "Select a category first", searchPlaceholder: "Search issue types" });
const ticketOriginFilter = wireSupportMultiFilter("ticketOriginFilter", { options: asFilterOptions(["Patient", "Clinic", "Backoffice", "System"], originLabel) });
const ticketStatusFilter = wireSupportMultiFilter("ticketStatusFilter", { options: asFilterOptions(STATUSES), selected: TICKET_DEFAULT_STATUSES });
const ticketLevelFilter = wireSupportMultiFilter("ticketLevelFilter", { options: asFilterOptions(TICKET_FILTER_LEVELS) });
const ticketAssignedToFilter = wireSupportMultiFilter("ticketAssignedToFilter", { disabledPlaceholder: "Select a level first" });

const syncTicketIssueFilter = linkIssueTypeToCategory("ticketCategoryFilter", ticketCategoryFilter, ticketIssueFilter);

function syncTicketAssignedToFilter() {
  const levels = ticketLevelFilter.getSelected();
  ticketAssignedToFilter.setOptions(asFilterOptions(levels.flatMap((level) => TIER_AGENTS[level] || [])));
  ticketAssignedToFilter.setDisabled(!levels.length);
}
document.getElementById("ticketLevelFilter").addEventListener("change", syncTicketAssignedToFilter);
syncTicketAssignedToFilter();

/* ---------------- Combine patient + clinic tickets into one list ----------------
   Tags each ticket in place (rather than spreading into copies) so this
   merged view stays in sync with the underlying patientTickets/clinicTickets
   arrays that ticket-detail.html also reads from. */
/* System-raised tickets are their own Type (Patient / Clinic / System), as in
   the developed Tickets list. */
patientTickets.forEach((t) => { t.source = "patient"; t.type = t.origin === "System" ? "System" : "Patient"; t.who = t.patientId; });
clinicTickets.forEach((t) => { t.source = "clinic"; t.type = t.origin === "System" ? "System" : "Clinic"; t.who = t.raisedBy; });
const allTickets = [...patientTickets, ...clinicTickets];

/* ---------------- Tickets KPI row ---------------- */
function renderTicketKpis() {
  document.getElementById("ticketKpiTotal").textContent = allTickets.length;
  document.getElementById("ticketKpiOpen").textContent = allTickets.filter((t) => t.status === "Open").length;
  document.getElementById("ticketKpiInProgress").textContent = allTickets.filter((t) => t.status === "In Progress").length;
  document.getElementById("ticketKpiResolved").textContent = allTickets.filter((t) => t.status === "Resolved").length;
}
renderTicketKpis();

const ticketKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Filter state ----------------
   What's picked in the filter row is only staged; ticketFilters holds what
   was last applied (on load, by Apply, or by Clear filters). */
function readTicketFilters() {
  return {
    search: document.getElementById("ticketSearchInput").value.trim().toLowerCase(),
    organization: document.getElementById("ticketOrganizationFilter").value,
    types: ticketTypeFilter.getSelected(),
    priorities: ticketPriorityFilter.getSelected(),
    categories: ticketCategoryFilter.getSelected(),
    issueTypes: ticketIssueFilter.getSelected(),
    origins: ticketOriginFilter.getSelected(),
    statuses: ticketStatusFilter.getSelected(),
    levels: ticketLevelFilter.getSelected(),
    assignedTo: ticketAssignedToFilter.getSelected(),
  };
}

/* Deep link: ?issueType=<Issue Type>&category=<Category>&status=<Status>&priority=<Priority>&origin=<Origin>&type=<Type>&assignedTo=<Agent Name>&q=<ticket ID>
   Lets other screens (e.g. the Overview dashboard's panels, or a support
   agent's own Support Dashboard) land here with those filters already
   applied, instead of dropping the user on an unfiltered list. */
(function applyIncomingTicketFilters() {
  const params = new URLSearchParams(location.search);
  const issueType = params.get("issueType");
  const status = params.get("status");
  const priority = params.get("priority");
  const category = params.get("category") || (issueType && ISSUE_TYPE_CATEGORY[issueType]);
  const origin = params.get("origin");
  const type = params.get("type");
  const assignedTo = params.get("assignedTo");
  const q = params.get("q");

  if (status && STATUSES.includes(status)) ticketStatusFilter.setSelected([status]);
  if (status === "all") ticketStatusFilter.setSelected([]);
  if (priority && PRIORITIES.includes(priority)) ticketPriorityFilter.setSelected([priority]);
  if (origin && ORIGINS.includes(origin)) ticketOriginFilter.setSelected([origin]);
  if (type) ticketTypeFilter.setSelected([type]);
  if (category && CATEGORIES.includes(category)) {
    ticketCategoryFilter.setSelected([category]);
    syncTicketIssueFilter();
    if (issueType) ticketIssueFilter.setSelected([`${category}|${issueType}`]);
  }
  /* Filters by the person only -- not their Level too, since a ticket's
     Level isn't always the assignee's own level, and the Support
     Dashboard's counts are per person. Assigned To is unlocked with just
     that person; picking a Level afterwards lists that level's agents. */
  if (assignedTo && SUPPORT_AGENTS.includes(assignedTo)) {
    ticketAssignedToFilter.setOptions(asFilterOptions([assignedTo]));
    ticketAssignedToFilter.setDisabled(false);
    ticketAssignedToFilter.setSelected([assignedTo]);
  }
  if (q) document.getElementById("ticketSearchInput").value = q;
})();

let ticketFilters = readTicketFilters();

/* An empty list means that filter isn't narrowing anything. Search matches
   the Ticket ID, like the developed "Search Ticket ID" field. */
function matchesFilters(t) {
  const f = ticketFilters;
  if (f.search && !t.ticketNo.toLowerCase().includes(f.search)) return false;
  if (f.organization && t.organization !== f.organization) return false;
  if (!inFilterList(f.types, t.type)) return false;
  if (!inFilterList(f.priorities, t.priority)) return false;
  if (!inFilterList(f.categories, ticketCategory(t))) return false;
  if (!inFilterList(f.issueTypes, `${ticketCategory(t)}|${t.issueType}`)) return false;
  if (!inFilterList(f.origins, t.origin)) return false;
  if (!inFilterList(f.statuses, t.status)) return false;
  if (!inFilterList(f.levels, t.tier)) return false;
  if (!inFilterList(f.assignedTo, t.assignedTo)) return false;
  return true;
}

/* ---------------- Tickets table ---------------- */
const PAGE_SIZE = 10;

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
   every Patient ticket appearing before any Clinic ticket in the list.
   Tickets created in this session (New Ticket / Escalate) stay on top. */
function filteredTickets() {
  return allTickets.filter(matchesFilters).sort((a, b) => (b.justCreated ? 1 : 0) - (a.justCreated ? 1 : 0) || parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate));
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
      <td>${priorityPill(t.priority)}</td>
      <td>${statusPill(t.status)}</td>
      <td>${t.assignedTo || "&mdash;"}</td>
      <td>${formatTicketCreated(t.createdDate)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-source="${t.source}" data-id="${t.id}" aria-label="Row actions">${ticketKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: PAGE_SIZE, emptyColspan: 13, emptyText: "No tickets found" }
);
ticketPager();

function refreshTicketTables() {
  ticketPager.resetPage();
  ticketPager();
  renderTicketKpis();
}

document.getElementById("ticketApplyBtn").addEventListener("click", () => {
  ticketFilters = readTicketFilters();
  refreshTicketTables();
});

/* Clears every filter -- Status included, so all tickets show -- and
   applies straight away, like the developed "Clear filters". */
document.getElementById("ticketClearFiltersBtn").addEventListener("click", () => {
  document.getElementById("ticketSearchInput").value = "";
  resetBoSelect(document.querySelector('.bo-select[data-name="ticketOrganization"]'));
  [ticketTypeFilter, ticketPriorityFilter, ticketCategoryFilter, ticketOriginFilter, ticketStatusFilter, ticketLevelFilter].forEach((f) => f.setSelected([]));
  syncTicketIssueFilter();
  syncTicketAssignedToFilter();
  ticketFilters = readTicketFilters();
  refreshTicketTables();
});

/* ---------------- Custom selects (used inside the ticket drawers) ----------------
   Plumbing (setBoSelectValue/buildSelectOptions/initBoSelects/etc.) lives in
   support-tickets-common.js, shared with ticket-detail.html. */
initBoSelects();

/* ---------------- New Ticket fields ----------------
   Same fields as the developed "New Ticket" dialog: Type (Patient / Clinic),
   Organization, Create For (a patient of that organization -- Patient tickets
   only), then Category -> Issue Type, Priority, Level -> Assigned To and a
   Description. Every field but Assigned To is required. */
const newTicketField = (name) => document.querySelector(`#newTicketOverlay .bo-select[data-name="${name}"]`);
const newTicketValue = (name) => newTicketField(name).querySelector("input[type=hidden]").value;

newTicketField("source").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(["Patient", "Clinic"]);
newTicketField("ticketOrg").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(SUPPORT_ORG_CODES);
addBoSelectSearch(newTicketField("ticketOrg"), "Search organizations");
newTicketField("category").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(CATEGORIES);
newTicketField("ticketPriority").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(PRIORITIES);
newTicketField("ticketLevel").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(TICKET_FILTER_LEVELS);

/* A dependent dropdown (Create For / Issue Type / Assigned To): new
   options, cleared value, and a placeholder that says what it's waiting
   on while it's locked. */
function setNewTicketDependent(name, options, { enabled, placeholder, lockedPlaceholder, search }) {
  const select = newTicketField(name);
  const valueEl = select.querySelector(".bo-select-value");
  select.querySelector(".bo-select-menu").innerHTML = buildSelectOptions(options);
  if (search) addBoSelectSearch(select, search);
  valueEl.dataset.placeholder = enabled ? placeholder : lockedPlaceholder;
  resetBoSelect(select);
  select.querySelector(".bo-select-trigger").disabled = !enabled;
}

const NEW_TICKET_PATIENT_IDS = Array.from(new Set(patientTickets.map((t) => t.patientId))).sort();

function renderNewTicketWhoOptions() {
  const org = newTicketValue("ticketOrg");
  document.getElementById("newTicketWhoField").hidden = newTicketValue("source") === "Clinic";
  setNewTicketDependent("ticketWho", NEW_TICKET_PATIENT_IDS.filter((id) => id.startsWith(`${org}-`)), {
    enabled: !!org, placeholder: "Select Patient", lockedPlaceholder: "Select an organization first", search: "Search patients",
  });
}

function renderNewTicketIssueOptions() {
  const category = newTicketValue("category");
  setNewTicketDependent("issueType", ISSUE_TYPES_BY_CATEGORY[category] || [], {
    enabled: !!category, placeholder: "Select issue type", lockedPlaceholder: "Select a category first",
  });
}

function renderNewTicketAssigneeOptions() {
  const level = newTicketValue("ticketLevel");
  setNewTicketDependent("ticketAssignee", TIER_AGENTS[level] || [], {
    enabled: !!level, placeholder: "Select user", lockedPlaceholder: "Select a level first",
  });
}

/* ---------------- Row action dropdown (view ticket) ----------------
   Clicking the row, or "View Ticket" in the kebab menu, opens the full-page
   ticket-detail.html (mirrors how Incidents open incident-detail.html)
   instead of a drawer -- that page also renders the Patient Log content
   that used to live in a separate modal here. */
const ticketRowMenu = document.getElementById("ticketRowMenu");
let activeTicketSource = null;
let activeTicketId = null;

function goToTicketDetail(source, id) {
  location.href = `ticket-detail.html?source=${source}&id=${id}`;
}

function wireTicketRowMenu(rowsId) {
  const rowsEl = document.getElementById(rowsId);

  rowsEl.addEventListener("click", (e) => {
    const trigger = e.target.closest(".row-menu-trigger");
    if (!trigger) return;
    e.stopPropagation();
    activeTicketSource = trigger.dataset.source;
    activeTicketId = Number(trigger.dataset.id);
    const rect = trigger.getBoundingClientRect();
    ticketRowMenu.style.top = `${rect.bottom + 6}px`;
    ticketRowMenu.style.left = `${rect.right - 190}px`;
    ticketRowMenu.classList.add("open");
  });

  /* Clicking anywhere else in the row opens the ticket detail page
     directly, so the kebab menu is only needed as a secondary entry point. */
  rowsEl.addEventListener("click", (e) => {
    if (e.target.closest(".row-menu-trigger")) return;
    const row = e.target.closest("tr[data-source][data-id]");
    if (!row) return;
    goToTicketDetail(row.dataset.source, Number(row.dataset.id));
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
  if (item.dataset.action === "view") goToTicketDetail(activeTicketSource, activeTicketId);
});

/* ---------------- New ticket drawer ---------------- */
const newTicketOverlay = document.getElementById("newTicketOverlay");
const newTicketForm = document.getElementById("newTicketForm");
const createTicketBtn = document.getElementById("createTicketBtn");

function validateNewTicketForm() {
  const isClinic = newTicketValue("source") === "Clinic";
  createTicketBtn.disabled = !(
    newTicketValue("source") &&
    newTicketValue("ticketOrg") &&
    (isClinic || newTicketValue("ticketWho")) &&
    newTicketValue("category") &&
    newTicketValue("issueType") &&
    newTicketValue("ticketPriority") &&
    newTicketValue("ticketLevel") &&
    newTicketForm.description.value.trim()
  );
}

function openNewTicketDrawer() {
  newTicketForm.reset();
  newTicketOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  setBoSelectValue(newTicketField("source"), "Patient", { silent: true });
  renderNewTicketWhoOptions();
  renderNewTicketIssueOptions();
  renderNewTicketAssigneeOptions();
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

newTicketField("source").querySelector("input[type=hidden]").addEventListener("change", renderNewTicketWhoOptions);
newTicketField("ticketOrg").querySelector("input[type=hidden]").addEventListener("change", renderNewTicketWhoOptions);
newTicketField("category").querySelector("input[type=hidden]").addEventListener("change", renderNewTicketIssueOptions);
newTicketField("ticketLevel").querySelector("input[type=hidden]").addEventListener("change", renderNewTicketAssigneeOptions);

/* Hidden-input changes bubble as "change" to the form, so every pick
   re-checks the Create Ticket button. */
newTicketForm.addEventListener("input", validateNewTicketForm);
newTicketForm.addEventListener("change", validateNewTicketForm);

newTicketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (createTicketBtn.disabled) return;

  const isClinic = newTicketValue("source") === "Clinic";
  const organization = newTicketValue("ticketOrg");
  const issueType = newTicketValue("issueType");
  const now = new Date();
  const createdDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const list = isClinic ? clinicTickets : patientTickets;
  const nextId = list.length ? Math.max(...list.map((t) => t.id)) + 1 : 0;
  /* Raised here in the Backoffice, so its Origin is Back Office. A Clinic
     ticket is for the organization itself, so it has no Create For. */
  const newTicket = {
    id: nextId,
    ticketNo: `TCK-${3000 + nextId}`,
    organization,
    category: newTicketValue("category"),
    issueType,
    scope: isClinic ? "Organization" : ISSUE_TYPE_SCOPE[issueType] || "Patient",
    tier: newTicketValue("ticketLevel"),
    priority: newTicketValue("ticketPriority"),
    origin: "Backoffice",
    status: "Open",
    justCreated: true,
    assignedTo: newTicketValue("ticketAssignee"),
    createdDate,
    description: newTicketForm.description.value.trim(),
    source: isClinic ? "clinic" : "patient",
    type: isClinic ? "Clinic" : "Patient",
    who: isClinic ? organization : newTicketValue("ticketWho"),
  };
  if (isClinic) newTicket.raisedBy = organization;
  else newTicket.patientId = newTicket.who;
  list.unshift(newTicket);
  allTickets.unshift(newTicket);

  closeNewTicketDrawer();
  refreshTicketTables();
});

/* ---------------- Rules table ---------------- */
const channelPillLabel = { "Notification": "In App", "Email": "Email", "SMS": "SMS" };
const channelPills = (channels) => channels.map((c) => channelPillLabel[c] || c).join(", ");

const ruleSla = (r) => (r.slaResponse || r.slaResolve ? `${r.slaResponse || "—"} / ${r.slaResolve || "—"}` : "&mdash;");

document.getElementById("ruleCategoryFilterMenu").innerHTML = buildSelectOptions(CATEGORIES);
document.getElementById("ruleStatusFilterMenu").innerHTML = buildSelectOptions(["Enabled", "Disabled"]);

/* Staged, not live -- the filter-row's Apply button commits
   ruleCategoryValue/ruleStatusValue from whatever the two filters
   currently show, same as Tickets/Incidents' Apply buttons. Status
   defaults to "Enabled", matching the developed table showing active
   rules first. */
let ruleCategoryValue = "";
let ruleStatusValue = "Enabled";
setBoSelectValue(document.querySelector('.bo-select[data-name="ruleStatus"]'), "Enabled", { silent: true });

function matchesRuleFilters(r) {
  if (ruleCategoryValue && ticketCategory(r) !== ruleCategoryValue) return false;
  if (ruleStatusValue === "Enabled" && r.enabled === false) return false;
  if (ruleStatusValue === "Disabled" && r.enabled !== false) return false;
  return true;
}

const renderRules = boCreatePager(
  "ruleRows",
  () => alertRules.filter(matchesRuleFilters),
  (r) => `
      <tr${r.enabled === false ? ' class="bo-rule-row-disabled"' : ""}>
        <td><span class="bo-rule-truncate" title="${r.name}">${r.name}</span></td>
        <td>${categoryPill(r)}</td>
        <td><span class="bo-rule-truncate bo-rule-truncate--wide" title="${r.condition}">${r.condition}</span></td>
        <td>${priorityPill(r.priority)}</td>
        <td>${tierPill(r.tier)}</td>
        <td>${ruleSla(r)}</td>
        <td>${channelPills(r.channels)}</td>
        <td>${r.appliesTo}</td>
        <td class="bo-rule-status-cell">
          <label class="bo-switch" title="${r.enabled === false ? "Enable rule" : "Disable rule"}">
            <input type="checkbox" class="rule-status-toggle" data-id="${r.id}" aria-label="${r.enabled === false ? "Enable" : "Disable"} ${r.name}"${r.enabled === false ? "" : " checked"} />
            <span class="bo-switch-track"></span>
          </label>
        </td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${r.id}" aria-label="Row actions">${ticketKebabIcon}</button>
          </div>
        </td>
      </tr>`,
  { pageSize: 10, emptyColspan: 10, emptyText: "No rules match these filters." }
);
renderRules();

function refreshRuleTable() {
  renderRules.resetPage();
  renderRules();
}

document.getElementById("ruleApplyBtn").addEventListener("click", () => {
  ruleCategoryValue = document.getElementById("ruleCategoryFilter").value;
  ruleStatusValue = document.getElementById("ruleStatusFilter").value;
  refreshRuleTable();
});

document.getElementById("ruleClearFiltersBtn").addEventListener("click", () => {
  resetBoSelect(document.querySelector('.bo-select[data-name="ruleCategory"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="ruleStatus"]'));
  ruleCategoryValue = "";
  ruleStatusValue = "";
  refreshRuleTable();
});

document.querySelector('#ruleDrawerOverlay .bo-select[data-name="rulePriority"] .bo-select-menu').innerHTML = buildSelectOptions(PRIORITIES);
document.querySelector('#ruleDrawerOverlay .bo-select[data-name="ruleTier"] .bo-select-menu').innerHTML = buildSelectOptions(TICKET_FILTER_LEVELS);

/* Edit Rule only exposes Priority, Routed level, Applies to, the threshold
   Operator and Auto-create ticket -- matching the developed Edit Rule form. */
const RULE_EDIT_APPLIES_TO = ["All organizations", "All Commercial orgs", "Per organization", "System-wide"];
const RULE_OPERATORS = ["None", "Less than", "Greater than", "Less than or equal to", "Greater than or equal to", "Equal to"];
document.querySelector('#ruleDrawerOverlay .bo-select[data-name="ruleAppliesTo"] .bo-select-menu').innerHTML = buildSelectOptions(RULE_EDIT_APPLIES_TO);
document.querySelector('#ruleDrawerOverlay .bo-select[data-name="ruleOperator"] .bo-select-menu').innerHTML = buildSelectOptions(RULE_OPERATORS);

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
  document.getElementById("ruleAutoCreateInput").checked = rule.autoCreateTicket;

  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="rulePriority"]'), rule.priority, { silent: true });
  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleTier"]'), rule.tier, { silent: true });
  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleAppliesTo"]'), rule.appliesTo, { silent: true });
  setBoSelectValue(ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleOperator"]'), rule.operator || "None", { silent: true });
  document.getElementById("ruleThresholdValue").value = rule.thresholdValue || "";
  document.getElementById("ruleThresholdWindow").value = rule.thresholdWindow || "";
  syncRuleThresholdFields();

  ruleDrawerOverlay.classList.add("open");
}

/* Threshold value and window only apply once an Operator is chosen. */
function syncRuleThresholdFields() {
  const operator = ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleOperator"] input[type=hidden]').value;
  const show = !!operator && operator !== "None";
  document.getElementById("ruleThresholdValueField").hidden = !show;
  document.getElementById("ruleThresholdWindowField").hidden = !show;
}
ruleDrawerOverlay.querySelector('.bo-select[data-name="ruleOperator"] input[type=hidden]').addEventListener("change", syncRuleThresholdFields);

function closeRuleDrawer() {
  ruleDrawerOverlay.classList.remove("open");
  editingRule = null;
}

ruleRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeRuleId === null) return;
  ruleRowMenu.classList.remove("open");
  const rule = alertRules.find((r) => r.id === activeRuleId);
  if (!rule) return;
  if (item.dataset.action === "edit") openRuleDrawer(rule);
});

/* ---------------- Status toggle -> Enable / Disable confirmation ----------------
   Flipping a rule's Status switch asks first, like the developed app; the
   switch only changes once the change is confirmed. */
const ruleToggleOverlay = document.getElementById("ruleToggleOverlay");
let ruleToggleTarget = null;

function closeRuleToggle() {
  ruleToggleOverlay.classList.remove("open");
  ruleToggleTarget = null;
}

document.getElementById("ruleRows").addEventListener("click", (e) => {
  const toggle = e.target.closest(".rule-status-toggle");
  if (!toggle) return;
  e.preventDefault();
  const rule = alertRules.find((r) => r.id === Number(toggle.dataset.id));
  if (!rule) return;
  ruleToggleTarget = rule;
  const disabling = rule.enabled !== false;
  document.getElementById("ruleToggleTitle").textContent = disabling ? "Disable rule" : "Enable rule";
  document.getElementById("ruleToggleText").textContent = disabling
    ? `Are you sure you want to disable the rule "${rule.name}"? It will stop opening new incidents until re-enabled.`
    : `Are you sure you want to enable the rule "${rule.name}"? It will start opening new incidents again.`;
  const confirmBtn = document.getElementById("confirmRuleToggle");
  confirmBtn.textContent = disabling ? "Disable" : "Enable";
  confirmBtn.classList.toggle("bo-btn-danger", disabling);
  ruleToggleOverlay.classList.add("open");
});

document.getElementById("confirmRuleToggle").addEventListener("click", () => {
  if (ruleToggleTarget) ruleToggleTarget.enabled = ruleToggleTarget.enabled === false;
  closeRuleToggle();
  renderRules();
});
document.getElementById("cancelRuleToggle").addEventListener("click", closeRuleToggle);
document.getElementById("closeRuleToggleX").addEventListener("click", closeRuleToggle);
ruleToggleOverlay.addEventListener("click", (e) => { if (e.target === ruleToggleOverlay) closeRuleToggle(); });

document.getElementById("closeRuleDrawerX").addEventListener("click", closeRuleDrawer);
document.getElementById("cancelRuleDrawer").addEventListener("click", closeRuleDrawer);
ruleDrawerOverlay.addEventListener("click", (e) => { if (e.target === ruleDrawerOverlay) closeRuleDrawer(); });

ruleDrawerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!editingRule) return;

  const ruleSelectValue = (name) => ruleDrawerOverlay.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value;
  editingRule.autoCreateTicket = document.getElementById("ruleAutoCreateInput").checked;
  editingRule.priority = ruleSelectValue("rulePriority") || editingRule.priority;
  editingRule.tier = ruleSelectValue("ruleTier") || editingRule.tier;
  editingRule.appliesTo = ruleSelectValue("ruleAppliesTo") || editingRule.appliesTo;
  editingRule.operator = ruleSelectValue("ruleOperator") || "None";
  const hasOperator = editingRule.operator !== "None";
  editingRule.thresholdValue = hasOperator ? document.getElementById("ruleThresholdValue").value.trim() : "";
  editingRule.thresholdWindow = hasOperator ? document.getElementById("ruleThresholdWindow").value.trim() : "";

  closeRuleDrawer();
  renderRules();
});

/* ---------------- New Rule drawer ---------------- */
const RULE_APPLIES_TO = ["All organizations", "All Commercial orgs", "Per organization", "System-wide"];
/* Notification channel: which channels a matching rule notifies through.
   Stored/checkbox value stays "Notification" (matches the Edit Rule drawer's
   Channels checkboxes) while the field itself shows the friendlier "In App"
   label. */
const NOTIFICATION_CHANNEL_OPTIONS = ["In App", "SMS", "Email"];
const NOTIFICATION_CHANNEL_VALUE = { "In App": "Notification", SMS: "SMS", Email: "Email" };
/* New rules don't collect SLA targets directly (the form keeps them out to stay
   short) -- default from priority using the same response/resolve pairing the
   hand-authored rules already follow. */
const PRIORITY_DEFAULT_SLA = {
  Critical: { response: "30m", resolve: "4h" },
  High: { response: "2h", resolve: "24h" },
  Medium: { response: "8h", resolve: "3d" },
  Low: { response: "24h", resolve: "5d" },
};

document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleCategory"] .bo-select-menu').innerHTML = buildSelectOptions(CATEGORIES);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRulePriority"] .bo-select-menu').innerHTML = buildSelectOptions(PRIORITIES);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleTier"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('#newRuleDrawerOverlay .bo-select[data-name="newRuleAppliesTo"] .bo-select-menu').innerHTML = buildSelectOptions(RULE_APPLIES_TO);

/* Checkbox multiselect for form fields (as opposed to wireMultiSelect's filter-bar
   variant, this one starts empty -- picking nothing should mean "not set yet",
   not "everything", since these are form inputs rather than list filters). */
const boFormMultiselectCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Positions the dropdown with `position: fixed` at computed screen
   coordinates, same as positionBoSelectMenu -- this field lives inside
   .bo-drawer-body, which scrolls, so a plain `position: absolute` menu
   would get clipped instead of floating above the drawer's other fields. */
function positionBoMultiselectMenu(container) {
  const trigger = container.querySelector(".bo-multiselect-trigger");
  const menu = container.querySelector(".bo-multiselect-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 260) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function wireFormMultiSelect(containerId, values) {
  const container = document.getElementById(containerId);
  const trigger = container.querySelector(".bo-multiselect-trigger");
  const valueEl = container.querySelector(".bo-multiselect-value");
  const menu = container.querySelector(".bo-multiselect-menu");
  const placeholderText = valueEl.textContent.trim();
  const selected = new Set();

  function renderMenu() {
    menu.innerHTML = values
      .map(
        (v) => `<label class="bo-multiselect-option${selected.has(v) ? " checked" : ""}" data-value="${v}">
          <span class="bo-multiselect-checkbox">${boFormMultiselectCheckIcon}</span> ${v}
        </label>`
      )
      .join("");
  }

  function renderTrigger() {
    if (selected.size === 0) {
      valueEl.textContent = placeholderText;
      valueEl.classList.add("placeholder");
    } else {
      valueEl.textContent = values.filter((v) => selected.has(v)).join(", ");
      valueEl.classList.remove("placeholder");
    }
  }

  renderMenu();
  renderTrigger();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !container.classList.contains("open");
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
    if (willOpen) {
      positionBoMultiselectMenu(container);
      container.classList.add("open");
    }
  });

  menu.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-multiselect-option");
    if (!option) return;
    e.stopPropagation();
    const v = option.dataset.value;
    if (selected.has(v)) selected.delete(v);
    else selected.add(v);
    renderMenu();
    renderTrigger();
    positionBoMultiselectMenu(container);
    container.dispatchEvent(new Event("change", { bubbles: true }));
  });

  return {
    getSelected: () => Array.from(selected),
    clear: () => { selected.clear(); renderMenu(); renderTrigger(); },
  };
}

function closeAllBoMultiselects() {
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
}
document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) closeAllBoMultiselects();
});
document.addEventListener("scroll", (e) => {
  if (e.target instanceof Element && e.target.closest(".bo-multiselect-menu")) return;
  closeAllBoMultiselects();
}, true);

const newRuleSendByMultiSelect = wireFormMultiSelect("newRuleSendBySelect", NOTIFICATION_CHANNEL_OPTIONS);
const newRuleOrgsMultiSelect = wireFormMultiSelect("newRuleOrgsSelect", SUPPORT_ORG_CODES);

const newRuleDrawerOverlay = document.getElementById("newRuleDrawerOverlay");
const newRuleForm = document.getElementById("newRuleForm");
const saveNewRuleBtn = document.getElementById("saveNewRuleDrawer");
const newRuleOrgsFieldWrap = document.getElementById("newRuleOrgsFieldWrap");

/* Organizations only makes sense when the rule is scoped to specific orgs --
   for "System-wide"/"All organizations"/"All Commercial orgs" it's implied. */
function updateNewRuleOrgsVisibility() {
  const appliesTo = newRuleDrawerOverlay.querySelector('.bo-select[data-name="newRuleAppliesTo"] input[type=hidden]').value;
  const showOrgs = appliesTo === "Per organization";
  newRuleOrgsFieldWrap.hidden = !showOrgs;
  if (!showOrgs) newRuleOrgsMultiSelect.clear();
}
newRuleDrawerOverlay.querySelector('.bo-select[data-name="newRuleAppliesTo"] input[type=hidden]').addEventListener("change", () => {
  updateNewRuleOrgsVisibility();
  validateNewRuleForm();
});

function validateNewRuleForm() {
  const nameFilled = document.getElementById("newRuleNameInput").value.trim() !== "";
  const conditionFilled = document.getElementById("newRuleConditionInput").value.trim() !== "";
  const responseTimeFilled = document.getElementById("newRuleResponseTimeInput").value.trim() !== "";
  const resolveTimeFilled = document.getElementById("newRuleResolveTimeInput").value.trim() !== "";
  const selectFilled = (name) => newRuleDrawerOverlay.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value !== "";
  const appliesTo = newRuleDrawerOverlay.querySelector('.bo-select[data-name="newRuleAppliesTo"] input[type=hidden]').value;
  const orgsFilled = appliesTo !== "Per organization" || newRuleOrgsMultiSelect.getSelected().length > 0;
  saveNewRuleBtn.disabled = !(
    nameFilled &&
    conditionFilled &&
    responseTimeFilled &&
    resolveTimeFilled &&
    selectFilled("newRuleCategory") &&
    selectFilled("newRulePriority") &&
    selectFilled("newRuleTier") &&
    selectFilled("newRuleAppliesTo") &&
    orgsFilled &&
    newRuleSendByMultiSelect.getSelected().length > 0
  );
}

/* Picking a priority prefills the standard SLA times for that priority --
   left editable in case this rule needs a different SLA than the default. */
newRuleDrawerOverlay.querySelector('.bo-select[data-name="newRulePriority"] input[type=hidden]').addEventListener("change", (e) => {
  const sla = PRIORITY_DEFAULT_SLA[e.target.value];
  if (sla) {
    document.getElementById("newRuleResponseTimeInput").value = sla.response;
    document.getElementById("newRuleResolveTimeInput").value = sla.resolve;
  }
});

function openNewRuleDrawer() {
  newRuleForm.reset();
  newRuleDrawerOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  newRuleSendByMultiSelect.clear();
  newRuleOrgsMultiSelect.clear();
  updateNewRuleOrgsVisibility();
  validateNewRuleForm();
  newRuleDrawerOverlay.classList.add("open");
}

function closeNewRuleDrawer() {
  newRuleDrawerOverlay.classList.remove("open");
}

document.getElementById("openNewRuleBtn")?.addEventListener("click", openNewRuleDrawer);
document.getElementById("closeNewRuleDrawerX").addEventListener("click", closeNewRuleDrawer);
document.getElementById("cancelNewRuleDrawer").addEventListener("click", closeNewRuleDrawer);
newRuleDrawerOverlay.addEventListener("click", (e) => { if (e.target === newRuleDrawerOverlay) closeNewRuleDrawer(); });

newRuleForm.addEventListener("input", validateNewRuleForm);
newRuleForm.addEventListener("change", validateNewRuleForm);

newRuleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveNewRuleBtn.disabled) return;

  const selectValue = (name) => newRuleDrawerOverlay.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value;
  const priority = selectValue("newRulePriority");
  const appliesTo = selectValue("newRuleAppliesTo");

  const nextId = alertRules.length ? Math.max(...alertRules.map((r) => r.id)) + 1 : 0;
  alertRules.unshift({
    id: nextId,
    name: document.getElementById("newRuleNameInput").value.trim(),
    category: selectValue("newRuleCategory"),
    condition: document.getElementById("newRuleConditionInput").value.trim(),
    priority,
    tier: selectValue("newRuleTier"),
    slaResponse: document.getElementById("newRuleResponseTimeInput").value.trim(),
    slaResolve: document.getElementById("newRuleResolveTimeInput").value.trim(),
    channels: newRuleSendByMultiSelect.getSelected().map((label) => NOTIFICATION_CHANNEL_VALUE[label]),
    autoCreateTicket: false,
    appliesTo,
    organizations: appliesTo === "Per organization" ? newRuleOrgsMultiSelect.getSelected() : [],
  });

  closeNewRuleDrawer();
  renderRules();
});
