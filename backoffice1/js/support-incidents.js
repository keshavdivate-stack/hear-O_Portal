/* ---------------- Support > Incidents tab ----------------
   System-generated incidents live in their own tab, separate from manually
   raised Tickets (Support > Tickets) and detection/escalation config
   (Support > Rules). Incidents are never converted into Tickets -- the
   Support Team works them via lightweight Support Tasks instead. */

/* ---------------- Filter option lists ---------------- */
document.getElementById("incStatusFilterMenu").innerHTML = buildFilterSelectOptions(INC_STATUSES, "All statuses");
document.getElementById("incPriorityFilterMenu").innerHTML = buildFilterSelectOptionsLabeled(INC_PRIORITIES, INC_PRIORITIES.map((s) => INC_PRIORITY_LABEL[s]), "All severities");
document.getElementById("incSourceFilterMenu").innerHTML = buildFilterSelectOptions(INC_SOURCES, "All sources");
document.getElementById("incCategoryFilterMenu").innerHTML = buildFilterSelectOptions(INC_CATEGORIES, "All categories");
document.getElementById("incOwnerFilterMenu").innerHTML = buildFilterSelectOptions(SUPPORT_TEAM, "All owners");

/* ---------------- Filter state ---------------- */
let incStatusValue = "";
let incPriorityValue = "";
let incSourceValue = "";
let incCategoryValue = "";
let incOwnerValue = "";
let incDateValue = "";
let incSearchTerm = "";

/* Date input yields YYYY-MM-DD; detectedAt is stored as MM/DD/YYYY, hh:mm AM. */
function incDateToDisplay(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? `${m[2]}/${m[3]}/${m[1]}` : value;
}

function incMatchesFilters(incident) {
  if (incStatusValue && incident.status !== incStatusValue) return false;
  if (incPriorityValue && incident.priority !== incPriorityValue) return false;
  if (incSourceValue && incident.source !== incSourceValue) return false;
  if (incCategoryValue && incident.category !== incCategoryValue) return false;
  if (incOwnerValue && incident.owner !== incOwnerValue) return false;
  if (incDateValue && incident.detectedAt.indexOf(incDateToDisplay(incDateValue)) === -1) return false;
  if (incSearchTerm) {
    const haystack = `${incident.id} ${incident.title} ${incident.orgs.join(" ")} ${incident.patients.join(" ")}`.toLowerCase();
    if (!haystack.includes(incSearchTerm)) return false;
  }
  return true;
}

function filteredIncidents() {
  return incidents.filter(incMatchesFilters);
}

/* ---------------- Table ---------------- */
const INC_PAGE_SIZE = 10;

function incidentRowHtml(incident) {
  return `
    <tr data-id="${incident.id}">
      <td><a class="bo-incident-id-link" href="incident-detail.html?id=${encodeURIComponent(incident.id)}">${incident.id}</a></td>
      <td><span class="bo-incident-title">${incident.title}</span></td>
      <td><span class="bo-incident-category-tag">${incident.category}</span></td>
      <td>${incPriorityPill(incident.priority)}</td>
      <td>${incStatusPill(incident.status)}${incRelatedTicketLink(incident)}</td>
      <td><button type="button" class="bo-impact-link" data-impact-trigger data-id="${incident.id}">${incImpactLabel(incident)}</button></td>
      <td>${incident.detectedAt}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon row-menu-trigger" data-id="${incident.id}" aria-label="Row actions">${incKebabIcon}</button>
        </div>
      </td>
    </tr>`;
}

const incidentPager = boCreatePager(
  "incidentRows",
  () => filteredIncidents(),
  incidentRowHtml,
  { pageSize: INC_PAGE_SIZE, emptyColspan: 8, emptyText: "No incidents match these filters." }
);
incidentPager();

function refreshIncidentTable() {
  incidentPager.resetPage();
  incidentPager();
}

document.getElementById("incStatusFilter").addEventListener("change", (e) => { incStatusValue = e.target.value; });
document.getElementById("incPriorityFilter").addEventListener("change", (e) => { incPriorityValue = e.target.value; });
document.getElementById("incSourceFilter").addEventListener("change", (e) => { incSourceValue = e.target.value; });
document.getElementById("incCategoryFilter").addEventListener("change", (e) => { incCategoryValue = e.target.value; });
document.getElementById("incOwnerFilter").addEventListener("change", (e) => { incOwnerValue = e.target.value; });
document.getElementById("incDateFilter").addEventListener("change", (e) => { incDateValue = e.target.value; });
document.getElementById("incSearchInput").addEventListener("input", (e) => { incSearchTerm = e.target.value.trim().toLowerCase(); });

document.getElementById("incApplyBtn").addEventListener("click", () => {
  refreshIncidentTable();
});

document.getElementById("incClearFiltersBtn").addEventListener("click", () => {
  incStatusValue = "";
  incPriorityValue = "";
  incSourceValue = "";
  incCategoryValue = "";
  incOwnerValue = "";
  incDateValue = "";
  incSearchTerm = "";

  resetBoSelect(document.querySelector('.bo-select[data-name="incStatus"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="incPriority"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="incSource"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="incCategory"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="incOwner"]'));
  const incDateEl = document.getElementById("incDateFilter");
  incDateEl.value = "";
  incDateEl.type = "text";
  document.getElementById("incSearchInput").value = "";

  refreshIncidentTable();
});

/* ---------------- Impact popover trigger (Impact column) ---------------- */
document.getElementById("incidentRows").addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-impact-trigger]");
  if (!trigger) return;
  e.stopPropagation();
  const incident = incidents.find((i) => i.id === trigger.dataset.id);
  if (incident) incImpactPopover.open(trigger, incident);
});

function findIncident(id) { return incidents.find((i) => i.id === id); }

/* ---------------- Row action menu: Create Task / View Task ---------------- */
const incidentRowMenu = document.getElementById("incidentRowMenu");
const incidentRowMenuViewTicketBtn = document.getElementById("incidentRowMenuViewTicketBtn");
let activeIncidentId = null;

document.getElementById("incidentRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeIncidentId = trigger.dataset.id;
  const incident = findIncident(activeIncidentId);
  incidentRowMenuViewTicketBtn.hidden = !incident || !(incident.relatedTickets && incident.relatedTickets.length);
  const rect = trigger.getBoundingClientRect();
  incidentRowMenu.style.top = `${rect.bottom + 6}px`;
  incidentRowMenu.style.left = `${rect.right - 190}px`;
  incidentRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!incidentRowMenu.contains(e.target)) incidentRowMenu.classList.remove("open");
});

incidentRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || !activeIncidentId) return;
  const incident = findIncident(activeIncidentId);
  if (!incident) return;
  const action = item.dataset.action;
  e.stopPropagation();
  incidentRowMenu.classList.remove("open");

  if (action === "createTask") openAddTaskDrawer(incident);
  if (action === "viewTicket" && incident.relatedTickets && incident.relatedTickets.length) location.href = incTicketHref(incident.relatedTickets[0]);
});

/* ---------------- Create Support Task drawer ---------------- */
const addTaskOverlay = document.getElementById("addTaskOverlay");
const addTaskForm = document.getElementById("addTaskForm");
const saveAddTaskBtn = document.getElementById("saveAddTask");
let addTaskTargetIncident = null;

document.querySelector('#addTaskOverlay .bo-select[data-name="taskTeam"] .bo-select-menu').innerHTML = buildSelectOptions(["Clinical Team", "Support Team"]);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskLevel"] .bo-select-menu').innerHTML = buildSelectOptions(["Level 1", "Level 2", "Level 3"]);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskAssignee"] .bo-select-menu').innerHTML = buildSelectOptions(SUPPORT_TEAM);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskPriority"] .bo-select-menu').innerHTML = buildSelectOptions(Object.values(INC_PRIORITY_LABEL));

/* Level defaults from the incident's own priority instead of always
   starting blank -- a Critical incident should escalate straight to
   Level 3, not make the support agent re-derive that manually every time. */
const INC_PRIORITY_TO_LEVEL = { "SEV-1": "Level 3", "SEV-2": "Level 2", "SEV-3": "Level 2", "SEV-4": "Level 1" };

function validateAddTaskForm() {
  const titleFilled = addTaskForm.taskTitle.value.trim() !== "";
  const teamFilled = addTaskOverlay.querySelector('.bo-select[data-name="taskTeam"] input[type=hidden]').value !== "";
  const assigneeFilled = addTaskOverlay.querySelector('.bo-select[data-name="taskAssignee"] input[type=hidden]').value !== "";
  saveAddTaskBtn.disabled = !(titleFilled && teamFilled && assigneeFilled);
}

const taskAttachmentInput = document.getElementById("taskAttachmentInput");
const taskAttachmentName = document.getElementById("taskAttachmentName");
taskAttachmentInput.addEventListener("change", () => {
  taskAttachmentName.textContent = taskAttachmentInput.files.length ? taskAttachmentInput.files[0].name : "Click to attach a file";
});

function openAddTaskDrawer(incident) {
  addTaskTargetIncident = incident;
  addTaskForm.reset();
  document.querySelector('#addTaskOverlay .bo-select[data-name="taskOrg"] .bo-select-menu').innerHTML = buildFilterSelectOptions(incident.orgs, "Optional");
  document.querySelector('#addTaskOverlay .bo-select[data-name="taskPatient"] .bo-select-menu').innerHTML = buildFilterSelectOptions(incident.patients, "Optional");
  addTaskOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  setBoSelectValue(addTaskOverlay.querySelector('.bo-select[data-name="taskLevel"]'), INC_PRIORITY_TO_LEVEL[incident.priority] || "Level 1", { silent: true });
  setBoSelectValue(addTaskOverlay.querySelector('.bo-select[data-name="taskPriority"]'), INC_PRIORITY_LABEL[incident.priority] || "", { silent: true });
  taskAttachmentName.textContent = "Click to attach a file";
  document.getElementById("addTaskIncidentTag").textContent = `Incident: ${incident.id}`;
  validateAddTaskForm();
  addTaskOverlay.classList.add("open");
}
function closeAddTaskDrawer() { addTaskOverlay.classList.remove("open"); addTaskTargetIncident = null; }

document.getElementById("closeAddTaskX").addEventListener("click", closeAddTaskDrawer);
document.getElementById("cancelAddTask").addEventListener("click", closeAddTaskDrawer);
addTaskOverlay.addEventListener("click", (e) => { if (e.target === addTaskOverlay) closeAddTaskDrawer(); });
addTaskForm.addEventListener("input", validateAddTaskForm);
addTaskForm.addEventListener("change", validateAddTaskForm);

addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddTaskBtn.disabled || !addTaskTargetIncident) return;

  const team = addTaskOverlay.querySelector('.bo-select[data-name="taskTeam"] input[type=hidden]').value;
  const level = addTaskOverlay.querySelector('.bo-select[data-name="taskLevel"] input[type=hidden]').value;
  const assignee = addTaskOverlay.querySelector('.bo-select[data-name="taskAssignee"] input[type=hidden]').value;
  const isFirstTask = addTaskTargetIncident.tasks.length === 0;
  const nextId = addTaskTargetIncident.tasks.length ? Math.max(...addTaskTargetIncident.tasks.map((t) => t.id)) + 1 : 1;
  addTaskTargetIncident.tasks.push({ id: nextId, title: addTaskForm.taskTitle.value.trim(), team, level, assignee, status: "Open" });
  addTaskTargetIncident.timeline.push({ time: "Just now", text: `Ticket "${addTaskForm.taskTitle.value.trim()}" assigned to ${assignee}` });

  /* Incident Owner (overall responsibility) is distinct from a task's
     Owner/Assignee (responsibility for that one task) -- but when nobody
     owns the incident yet, the first task's assignee steps into that role
     rather than leaving the incident unowned. */
  const hasNoOwner = !addTaskTargetIncident.owner || addTaskTargetIncident.owner === "Unassigned";
  if (isFirstTask && hasNoOwner) {
    addTaskTargetIncident.owner = assignee;
    addTaskTargetIncident.timeline.push({ time: "Just now", text: `${assignee} became Incident Owner (first ticket assigned)` });
  }

  closeAddTaskDrawer();
  refreshIncidentTable();
});

/* ---------------- Deep link: support.html?tab=incidents&priority=<Critical|High|Medium|Low>&status=<...>&q=<search text>
   Lets other screens (e.g. the Overview dashboard's System Health Trend /
   Issues panels) land here on the Incidents tab with the relevant
   filter/search already applied. `priority` arrives as the human label
   used elsewhere (Critical/High/Medium/Low) rather than the raw SEV-1..4
   key incidents are stored under, so it's translated via INC_PRIORITY_LABEL. */
(function openIncidentsTabFromUrl() {
  const params = new URLSearchParams(location.search);
  if (params.get("tab") !== "incidents") return;

  const priorityLabel = params.get("priority");
  const status = params.get("status");
  const q = params.get("q");

  if (priorityLabel) {
    const priKey = INC_PRIORITIES.find((key) => INC_PRIORITY_LABEL[key] === priorityLabel);
    if (priKey) {
      incPriorityValue = priKey;
      setBoSelectValue(document.querySelector('.bo-select[data-name="incPriority"]'), priKey, { silent: true });
    }
  }
  if (status && INC_STATUSES.includes(status)) {
    incStatusValue = status;
    setBoSelectValue(document.querySelector('.bo-select[data-name="incStatus"]'), status, { silent: true });
  }
  if (q) {
    incSearchTerm = q.trim().toLowerCase();
    document.getElementById("incSearchInput").value = q;
  }
  refreshIncidentTable();

  const tabBtn = document.querySelector('#supportTabs .bo-tab[data-tab="incidents"]');
  if (tabBtn) tabBtn.click();
})();
