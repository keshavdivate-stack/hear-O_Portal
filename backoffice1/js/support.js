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
      <td>${typePill(t.type)}</td>
      <td>${t.who}</td>
      <td>${t.organization}</td>
      <td>${t.issueType}</td>
      <td>${categoryPill(t)}</td>
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
     Progress", tiers like "Tier 1", categories like "Patient (Mobile/Web)",
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
document.querySelector('#ticketDetailOverlay .bo-select[data-name="tier"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="severity"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="status"] .bo-select-menu').innerHTML = buildSelectOptions(STATUSES);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="assignedTo"] .bo-select-menu').innerHTML = buildSelectOptions(SUPPORT_AGENTS);
document.querySelector('#newTicketOverlay .bo-select[data-name="source"] .bo-select-menu').innerHTML = buildSelectOptions(["Patient", "Clinic"]);
document.querySelector('#newTicketOverlay .bo-select[data-name="issueType"] .bo-select-menu').innerHTML = buildSelectOptions(ISSUE_TYPES);
document.querySelector('#newTicketOverlay .bo-select[data-name="severity"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('#newTicketOverlay .bo-select[data-name="tier"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('#newTicketOverlay .bo-select[data-name="category"] .bo-select-menu').innerHTML = buildSelectOptions(CATEGORIES);

/* Picking an Issue Type defaults Category to that issue's category (same
   pairing shown in the ticket detail drawer), but Category stays a normal
   dropdown the user can still override before submitting. */
document.querySelector('#newTicketOverlay .bo-select[data-name="issueType"] input[type=hidden]').addEventListener("change", (e) => {
  const category = ISSUE_TYPE_CATEGORY[e.target.value];
  if (category) setBoSelectValue(newTicketOverlay.querySelector('.bo-select[data-name="category"]'), category, { silent: true });
});

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

function openTicketDetail(source, id) {
  const list = source === "patient" ? patientTickets : clinicTickets;
  const ticket = list.find((t) => t.id === id);
  if (!ticket) return;
  activeTicket = { source, ticket };

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

  const drawer = ticketDetailOverlay.querySelector(".bo-drawer");
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="tier"]'), ticket.tier, { silent: true });
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="severity"]'), ticket.severity, { silent: true });
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="status"]'), ticket.status, { silent: true });
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="assignedTo"]'), ticket.assignedTo || "", { silent: true });

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
});

document.getElementById("closeTicketDetailX").addEventListener("click", closeTicketDetail);
document.getElementById("cancelTicketDetail").addEventListener("click", closeTicketDetail);
ticketDetailOverlay.addEventListener("click", (e) => { if (e.target === ticketDetailOverlay) closeTicketDetail(); });

document.getElementById("ticketDetailForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!activeTicket) return;
  const ticket = activeTicket.ticket;
  const drawer = ticketDetailOverlay.querySelector(".bo-drawer");
  const history = ensureTicketHistory(ticket);
  const now = new Date();
  const changeDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const nextTier = drawer.querySelector('.bo-select[data-name="tier"] input[type=hidden]').value || ticket.tier;
  const nextSeverity = drawer.querySelector('.bo-select[data-name="severity"] input[type=hidden]').value || ticket.severity;
  const nextStatus = drawer.querySelector('.bo-select[data-name="status"] input[type=hidden]').value || ticket.status;
  const nextAssignedTo = drawer.querySelector('.bo-select[data-name="assignedTo"] input[type=hidden]').value || "";

  if (nextTier !== ticket.tier) history.push({ text: `Tier changed from ${ticket.tier} to ${nextTier}`, date: changeDate });
  if (nextSeverity !== ticket.severity) history.push({ text: `Severity changed from ${ticket.severity} to ${nextSeverity}`, date: changeDate });
  if (nextStatus !== ticket.status) history.push({ text: `Status changed from ${ticket.status} to ${nextStatus}`, date: changeDate });
  if (nextAssignedTo !== (ticket.assignedTo || "")) {
    history.push({
      text: ticket.assignedTo ? `Reassigned from ${ticket.assignedTo} to ${nextAssignedTo || "Unassigned"}` : `Assigned to ${nextAssignedTo || "Unassigned"}`,
      date: changeDate,
    });
  }

  ticket.tier = nextTier;
  ticket.severity = nextSeverity;
  ticket.status = nextStatus;
  ticket.assignedTo = nextAssignedTo;

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
  createTicketBtn.disabled = !(orgFilled && whoFilled && issueSelect.value);
}

function openNewTicketDrawer() {
  newTicketForm.reset();
  newTicketOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  setBoSelectValue(newTicketOverlay.querySelector('.bo-select[data-name="source"]'), "Patient", { silent: true });
  document.getElementById("newTicketWhoLabel").textContent = "Patient ID";
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
});

newTicketForm.addEventListener("input", validateNewTicketForm);
newTicketForm.addEventListener("change", validateNewTicketForm);

newTicketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (createTicketBtn.disabled) return;

  const sourceValue = newTicketOverlay.querySelector('.bo-select[data-name="source"] input[type=hidden]').value || "Patient";
  const issueType = newTicketOverlay.querySelector('.bo-select[data-name="issueType"] input[type=hidden]').value;
  const severity = newTicketOverlay.querySelector('.bo-select[data-name="severity"] input[type=hidden]').value || "Medium";
  const tier = newTicketOverlay.querySelector('.bo-select[data-name="tier"] input[type=hidden]').value || "Tier 1";
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
        <td>
          <span class="bo-switch">
            <input type="checkbox" class="rule-auto-create-toggle" data-id="${r.id}" ${r.autoCreateTicket ? "checked" : ""} />
            <span class="bo-switch-track"></span>
          </span>
        </td>
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

document.getElementById("ruleRows").addEventListener("change", (e) => {
  const toggle = e.target.closest(".rule-auto-create-toggle");
  if (!toggle) return;
  const rule = alertRules.find((r) => r.id === Number(toggle.dataset.id));
  if (rule) rule.autoCreateTicket = toggle.checked;
});

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
