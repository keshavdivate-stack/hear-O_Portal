/* ---------------- Tabs ---------------- */
document.querySelectorAll("#supportTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#supportTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Filter option lists ---------------- */
function fillOptions(selectId, values, placeholder) {
  const select = document.getElementById(selectId);
  select.innerHTML = `<option value="">${placeholder}</option>` + values.map((v) => `<option value="${v}">${v}</option>`).join("");
}
fillOptions("ticketStatusFilter", STATUSES, "Status");
fillOptions("ticketPriorityFilter", PRIORITIES, "Priority");
fillOptions("ticketIssueFilter", ISSUE_TYPES, "Issue type");

/* ---------------- Badges ---------------- */
const statusPillClass = { "Open": "bo-pill-status-open", "In Progress": "bo-pill-status-inprogress", "Escalated": "bo-pill-status-escalated", "Resolved": "bo-pill-status-resolved" };
const priorityPillClass = { "Low": "bo-pill-priority-low", "Medium": "bo-pill-priority-medium", "High": "bo-pill-priority-high", "Urgent": "bo-pill-priority-urgent" };

const statusPill = (s) => `<span class="bo-pill ${statusPillClass[s] || ""}">${s}</span>`;
const priorityPill = (p) => `<span class="bo-pill ${priorityPillClass[p] || ""}">${p}</span>`;
const tierPill = (t) => `<span class="bo-pill bo-pill-tier">${t}</span>`;

const ticketKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Filter state (shared by both tabs) ---------------- */
let ticketStatusValue = "";
let ticketPriorityValue = "";
let ticketIssueValue = "";
let ticketSearchTerm = "";

/* Deep link: ?issueType=<Issue Type>&q=<search text>
   Lets other screens (e.g. the Overview dashboard's Issues by Category and
   Critical Issues panels) land here with the relevant filter/search already
   applied, instead of dropping the user on an unfiltered list. */
(function applyIncomingTicketFilters() {
  const params = new URLSearchParams(location.search);
  const issueType = params.get("issueType");
  const status = params.get("status");
  const q = params.get("q");

  if (issueType && ISSUE_TYPES.includes(issueType)) {
    ticketIssueValue = issueType;
    const select = document.getElementById("ticketIssueFilter");
    select.value = issueType;
    select.classList.add("has-value");
  }
  if (status && STATUSES.includes(status)) {
    ticketStatusValue = status;
    const select = document.getElementById("ticketStatusFilter");
    select.value = status;
    select.classList.add("has-value");
  }
  if (q) {
    ticketSearchTerm = q.trim().toLowerCase();
    document.getElementById("ticketSearchInput").value = q;
  }
})();

function matchesFilters(t, extraSearchable) {
  if (ticketStatusValue && t.status !== ticketStatusValue) return false;
  if (ticketPriorityValue && t.priority !== ticketPriorityValue) return false;
  if (ticketIssueValue && t.issueType !== ticketIssueValue) return false;
  if (ticketSearchTerm) {
    const haystack = `${t.ticketNo} ${t.organization} ${extraSearchable}`.toLowerCase();
    if (!haystack.includes(ticketSearchTerm)) return false;
  }
  return true;
}

/* ---------------- Patient tickets table ---------------- */
const PAGE_SIZE = 8;

function filteredPatientTickets() {
  return patientTickets.filter((t) => matchesFilters(t, t.patientId));
}

const patientPager = boCreatePager(
  "patientTicketRows",
  () => filteredPatientTickets(),
  (t) => `
    <tr data-source="patient" data-id="${t.id}">
      <td class="bo-ticket-id">${t.ticketNo}</td>
      <td>${t.patientId}</td>
      <td>${t.organization}</td>
      <td>${t.issueType}</td>
      <td>${tierPill(t.tier)}</td>
      <td>${priorityPill(t.priority)}</td>
      <td>${statusPill(t.status)}</td>
      <td>${t.createdDate}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-source="patient" data-id="${t.id}" aria-label="Row actions">${ticketKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: PAGE_SIZE, emptyColspan: 9, emptyText: "No patient tickets match these filters." }
);
patientPager();

/* ---------------- Clinic tickets table ---------------- */
function filteredClinicTickets() {
  return clinicTickets.filter((t) => matchesFilters(t, t.raisedBy));
}

const clinicPager = boCreatePager(
  "clinicTicketRows",
  () => filteredClinicTickets(),
  (t) => `
    <tr data-source="clinic" data-id="${t.id}">
      <td class="bo-ticket-id">${t.ticketNo}</td>
      <td>${t.organization}</td>
      <td>${t.raisedBy}</td>
      <td>${t.issueType}</td>
      <td>${tierPill(t.tier)}</td>
      <td>${priorityPill(t.priority)}</td>
      <td>${statusPill(t.status)}</td>
      <td>${t.createdDate}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-source="clinic" data-id="${t.id}" aria-label="Row actions">${ticketKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: PAGE_SIZE, emptyColspan: 9, emptyText: "No clinic tickets match these filters." }
);
clinicPager();

function refreshTicketTables() {
  patientPager.resetPage();
  clinicPager.resetPage();
  patientPager();
  clinicPager();
}

document.getElementById("ticketStatusFilter").addEventListener("change", (e) => {
  ticketStatusValue = e.target.value;
  e.target.classList.toggle("has-value", e.target.value !== "");
  refreshTicketTables();
});
document.getElementById("ticketPriorityFilter").addEventListener("change", (e) => {
  ticketPriorityValue = e.target.value;
  e.target.classList.toggle("has-value", e.target.value !== "");
  refreshTicketTables();
});
document.getElementById("ticketIssueFilter").addEventListener("change", (e) => {
  ticketIssueValue = e.target.value;
  e.target.classList.toggle("has-value", e.target.value !== "");
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
document.querySelector('#ticketDetailOverlay .bo-select[data-name="priority"] .bo-select-menu').innerHTML = buildSelectOptions(PRIORITIES);
document.querySelector('#ticketDetailOverlay .bo-select[data-name="status"] .bo-select-menu').innerHTML = buildSelectOptions(STATUSES);
document.querySelector('#newTicketOverlay .bo-select[data-name="source"] .bo-select-menu').innerHTML = buildSelectOptions(["Patient", "Clinic"]);
document.querySelector('#newTicketOverlay .bo-select[data-name="issueType"] .bo-select-menu').innerHTML = buildSelectOptions(ISSUE_TYPES);
document.querySelector('#newTicketOverlay .bo-select[data-name="priority"] .bo-select-menu').innerHTML = buildSelectOptions(PRIORITIES);

/* ---------------- Ticket detail drawer ---------------- */
const ticketDetailOverlay = document.getElementById("ticketDetailOverlay");
let activeTicket = null;

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
  document.getElementById("ticketDetailCreated").textContent = ticket.createdDate;
  document.getElementById("ticketDetailIssueType").textContent = ticket.issueType;
  document.getElementById("ticketDetailDescription").textContent = ticket.description;

  const drawer = ticketDetailOverlay.querySelector(".bo-drawer");
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="tier"]'), ticket.tier, { silent: true });
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="priority"]'), ticket.priority, { silent: true });
  setBoSelectValue(drawer.querySelector('.bo-select[data-name="status"]'), ticket.status, { silent: true });

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
  document.getElementById(rowsId).addEventListener("click", (e) => {
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
}
wireTicketRowMenu("patientTicketRows");
wireTicketRowMenu("clinicTicketRows");

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
  const drawer = ticketDetailOverlay.querySelector(".bo-drawer");
  activeTicket.ticket.tier = drawer.querySelector('.bo-select[data-name="tier"] input[type=hidden]').value || activeTicket.ticket.tier;
  activeTicket.ticket.priority = drawer.querySelector('.bo-select[data-name="priority"] input[type=hidden]').value || activeTicket.ticket.priority;
  activeTicket.ticket.status = drawer.querySelector('.bo-select[data-name="status"] input[type=hidden]').value || activeTicket.ticket.status;
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
  const priority = newTicketOverlay.querySelector('.bo-select[data-name="priority"] input[type=hidden]').value || "Medium";
  const now = new Date();
  const createdDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (sourceValue === "Clinic") {
    const nextId = clinicTickets.length ? Math.max(...clinicTickets.map((t) => t.id)) + 1 : 0;
    clinicTickets.unshift({
      id: nextId,
      ticketNo: `TCK-${3000 + nextId}`,
      raisedBy: newTicketForm.who.value.trim(),
      organization: newTicketForm.organization.value.trim(),
      issueType,
      tier: "Tier 1",
      priority,
      status: "Open",
      createdDate,
      description: newTicketForm.description.value.trim(),
    });
  } else {
    const nextId = patientTickets.length ? Math.max(...patientTickets.map((t) => t.id)) + 1 : 0;
    patientTickets.unshift({
      id: nextId,
      ticketNo: `TCK-${3000 + nextId}`,
      patientId: newTicketForm.who.value.trim(),
      organization: newTicketForm.organization.value.trim(),
      issueType,
      tier: "Tier 1",
      priority,
      status: "Open",
      createdDate,
      description: newTicketForm.description.value.trim(),
    });
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

  const tab = document.querySelector(`#supportTabs .bo-tab[data-tab="${source}"]`);
  if (tab) tab.click();

  openTicketDetail(source, match.id);
})();
