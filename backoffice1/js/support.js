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
document.getElementById("ticketStatusFilterMenu").innerHTML = buildFilterSelectOptions(STATUSES, "All statuses");
document.getElementById("ticketSeverityFilterMenu").innerHTML = buildFilterSelectOptions(SEVERITIES, "All severities");
document.getElementById("ticketCategoryFilterMenu").innerHTML = buildFilterSelectOptions(CATEGORIES, "All categories");
document.getElementById("ticketIssueFilterMenu").innerHTML = buildFilterSelectOptions(ISSUE_TYPES, "All issue types");
document.getElementById("ticketOriginFilterMenu").innerHTML = buildFilterSelectOptions(ORIGINS, "All origins");
document.getElementById("ticketTypeFilterMenu").innerHTML = buildFilterSelectOptions(TICKET_TYPES, "All types");

/* ---------------- Combine patient + clinic tickets into one list ----------------
   Tags each ticket in place (rather than spreading into copies) so this
   merged view stays in sync with the underlying patientTickets/clinicTickets
   arrays that ticket-detail.html also reads from. */
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

/* ---------------- Custom selects (used inside the ticket drawers) ----------------
   Plumbing (setBoSelectValue/buildSelectOptions/initBoSelects/etc.) lives in
   support-tickets-common.js, shared with ticket-detail.html. */
initBoSelects();

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
