/* ---------------- Shared custom-select helpers ----------------
   Equivalent to the ones support.js already defines/calls for support.html
   (Tickets/Rules) -- duplicated here (rather than shared as a single file)
   so incident-detail.html, which never loads support.js, still gets working
   dropdowns. On support.html this file only *redefines* the functions
   (identical behavior) and never calls initBoSelects() again, so the
   Tickets/Rules selects support.js already wired don't get double-bound. */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const options = Array.from(select.querySelectorAll(".bo-select-option"));
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

function buildFilterSelectOptions(values, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  return clearOption + buildSelectOptions(values);
}

/* Like buildFilterSelectOptions, but the option's displayed text (labels[i])
   can differ from the value it filters on (values[i]) -- used for the
   priority filter, whose underlying values are SEV-1..4. */
function buildFilterSelectOptionsLabeled(values, labels, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  const options = values
    .map(
      (v, i) => `
      <div class="bo-select-option" data-value="${v}">${labels[i]}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
  return clearOption + options;
}

/* Named distinctly from support.js's ticketKebabIcon -- both this file and
   support.js load together on support.html, and redeclaring the same
   `const` name across separate <script> tags throws a SyntaxError. */
const incKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Shared render helpers (used by both the Incidents tab
   inside support.html and the standalone incident-detail.html page) ---------------- */
function incPriorityPill(sev) {
  return `<span class="bo-pill ${INC_PRIORITY_CLASS[sev] || ""}">${INC_PRIORITY_LABEL[sev] || sev}</span>`;
}
function incStatusPill(status) {
  return `<span class="bo-pill ${INC_STATUS_CLASS[status] || ""}">${status}</span>`;
}
/* Affected organizations by name, not a count (team decision): the first
   three codes, then "+N more" with the full list in the tooltip. */
function incOrgNamesHtml(orgs, max = 3) {
  if (!orgs.length) return "No organizations";
  const shown = orgs.slice(0, max).join(", ");
  const more = orgs.length > max ? ` +${orgs.length - max} more` : "";
  return `<span title="${orgs.join(", ")}">${shown}${more}</span>`;
}
function incImpactLabel(incident) {
  return `${incOrgNamesHtml(incident.orgs)} · ${incident.patients.length} patients`;
}

/* Escalated incidents get a Ticket created via "Escalate & Create Ticket";
   once that link exists we surface it everywhere the incident is shown so
   support staff can jump straight to the related ticket. */
function incTicketHref(relatedTicket) {
  return `ticket-detail.html?ticket=${encodeURIComponent(relatedTicket.ticketNo)}&source=${encodeURIComponent(relatedTicket.source)}`;
}
/* Icon-only (not a text label) so it sits next to the status pill without
   fighting it for width in the compact STATUS column -- it's a plain link
   to the related ticket, not a hover-info affordance, so the tooltip just
   names the action rather than dumping the ticket number(s). */
function incRelatedTicketLink(incident) {
  const tickets = incident.relatedTickets || [];
  if (!tickets.length) return "";
  return `<a class="bo-related-ticket-link" href="${incTicketHref(tickets[0])}" title="View ticket" aria-label="View ticket">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>
  </a>`;
}


/* ---------------- Escalate & Create Ticket (Incidents list + incident detail) ----------------
   Same fields as the developed dialog: Priority and Routed level start from
   the incident's own priority, Assigned to lists that level's agents, and
   Description is optional. Escalating marks the incident Escalated and
   raises a System ticket linked to it. */
const INC_ESCALATE_LEVELS = ["Level 1", "Level 2"];
const INC_PRIORITY_TO_LEVEL = { "SEV-1": "Level 2", "SEV-2": "Level 2", "SEV-3": "Level 1", "SEV-4": "Level 1" };

function wireEscalateDrawer(getIncident, onEscalated) {
  const overlay = document.getElementById("addTaskOverlay");
  const form = document.getElementById("addTaskForm");
  const field = (name) => overlay.querySelector(`.bo-select[data-name="${name}"]`);
  const value = (name) => field(name).querySelector("input[type=hidden]").value;

  field("taskPriority").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(["Low", "Medium", "High", "Critical"]);
  field("taskLevel").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(INC_ESCALATE_LEVELS);

  function renderAssignees() {
    field("taskAssignee").querySelector(".bo-select-menu").innerHTML = buildSelectOptions(TIER_AGENTS[value("taskLevel")] || []);
    resetBoSelect(field("taskAssignee"));
  }
  field("taskLevel").querySelector("input[type=hidden]").addEventListener("change", renderAssignees);

  const close = () => overlay.classList.remove("open");
  document.getElementById("closeAddTaskX").addEventListener("click", close);
  document.getElementById("cancelAddTask").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const incident = getIncident();
    if (!incident) return;
    escalateIncident(incident, {
      priority: value("taskPriority") || INC_PRIORITY_LABEL[incident.priority],
      level: value("taskLevel") || INC_PRIORITY_TO_LEVEL[incident.priority],
      assignee: value("taskAssignee"),
      description: form.taskDescription.value.trim(),
    });
    close();
    onEscalated(incident);
  });

  return function open(incident) {
    form.reset();
    overlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
    setBoSelectValue(field("taskPriority"), INC_PRIORITY_LABEL[incident.priority] || "", { silent: true });
    setBoSelectValue(field("taskLevel"), INC_PRIORITY_TO_LEVEL[incident.priority] || "Level 1", { silent: true });
    renderAssignees();
    overlay.classList.add("open");
  };
}

function escalateIncident(incident, { priority, level, assignee, description }) {
  const tickets = typeof clinicTickets !== "undefined" ? clinicTickets : [];
  const nextId = tickets.length ? Math.max(...tickets.map((t) => t.id)) + 1 : 0;
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const ticket = {
    id: nextId,
    ticketNo: `TCK-${3000 + nextId}`,
    raisedBy: "System",
    organization: incident.orgs.length === 1 ? incident.orgs[0] : "—",
    category: incident.category,
    issueType: incIssueType(incident),
    scope: incident.orgs.length ? "Organization" : "Patient",
    tier: level,
    priority,
    origin: "System",
    status: "Open",
    justCreated: true,
    assignedTo: assignee || "",
    createdDate: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    description: description || incident.summary,
    source: "clinic",
    type: "System",
    who: `${incident.orgs.length} Organizations`,
  };
  tickets.unshift(ticket);
  if (typeof allTickets !== "undefined") allTickets.unshift(ticket);

  incident.status = "Escalated";
  incident.relatedTickets = [{ ticketNo: ticket.ticketNo, source: "clinic" }, ...(incident.relatedTickets || [])];
  incident.timeline.push({ time: "Just now", text: "Emily Carter escalated incident", detail: `Routed to ${level}${assignee ? `, assigned to ${assignee}` : ""}${description ? `. ${description}` : ""}`, ticketNo: ticket.ticketNo });
  return ticket;
}
