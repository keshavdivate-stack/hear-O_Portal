/* ---------------- Incident Detail page ----------------
   Deep dive for a single system-generated Incident: Overview -> Impact ->
   Timeline -> Root Cause -> Resolution. Reached from the Incidents tab's
   Incident ID link (?id=INC-2026-0042). Severity/Status/Owner are changed
   from the Incidents list page's row menu, not from this page -- this page
   is read-only except for creating Support Tasks. */
initBoSelects();

const params = new URLSearchParams(location.search);
const requestedId = params.get("id");
let currentIncident = incidents.find((i) => i.id === requestedId) || incidents[0];

function fmtBool(v) { return v ? "Yes" : "No"; }

function renderIncidentHeader() {
  document.getElementById("incDetailId").textContent = currentIncident.id;
  document.title = `HearO Backoffice | ${currentIncident.id}`;
}

function renderIncidentSummary() {
  document.getElementById("incDetailSummaryText").textContent = currentIncident.summary;
  document.getElementById("incDetailDetected").textContent = currentIncident.detectedAt;
  document.getElementById("incDetailSeverityKv").innerHTML = incSeverityPill(currentIncident.severity);
  document.getElementById("incDetailStatusKv").innerHTML = incStatusPill(currentIncident.status);
  document.getElementById("incDetailSource").textContent = currentIncident.source;
  document.getElementById("incDetailOwnerKv").textContent = currentIncident.owner;
  document.getElementById("incDetailDuration").textContent = currentIncident.duration;
  document.getElementById("incDetailRelatedTicket").innerHTML = (currentIncident.relatedTickets && currentIncident.relatedTickets.length)
    ? currentIncident.relatedTickets.map((t) => `<a class="bo-name-link" href="${incTicketHref(t)}">${t.ticketNo}</a>`).join("")
    : "—";
}

function renderIncidentImpact() {
  document.getElementById("incDetailOrgCount").textContent = currentIncident.orgs.length;
  document.getElementById("incDetailPatientCount").textContent = currentIncident.patients.length;
  document.getElementById("incDetailRunsCount").textContent = currentIncident.scheduledRunsAffected;
}

function renderIncidentTimeline() {
  document.getElementById("incDetailTimeline").innerHTML = currentIncident.timeline
    .map((t) => `<div class="bo-ticket-history-item"><span class="text">${t.text}</span><span class="meta">${t.time}</span></div>`)
    .join("");
}

function renderIncidentResolution() {
  const section = document.getElementById("resolution");
  if (currentIncident.status !== "Resolved" || !currentIncident.resolution) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  const r = currentIncident.resolution;
  document.getElementById("incDetailResolutionSummary").textContent = r.summary;
  document.getElementById("incDetailResolvedBy").textContent = r.resolvedBy;
  document.getElementById("incDetailResolvedAt").textContent = r.resolvedAt;
  document.getElementById("incDetailFixDeployed").textContent = fmtBool(r.fixDeployed);
  document.getElementById("incDetailVerification").textContent = fmtBool(r.verificationCompleted);
}

function renderAll() {
  renderIncidentHeader();
  renderIncidentSummary();
  renderIncidentImpact();
  renderIncidentTimeline();
  renderIncidentResolution();
}
renderAll();

/* Deep link into a specific section, e.g. incident-detail.html?id=...#timeline */
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

/* ---------------- Impact popover triggers ---------------- */
document.getElementById("incDetailViewOrgsBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  incImpactPopover.open(e.currentTarget, currentIncident, "orgs");
});
document.getElementById("incDetailViewPatientsBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  incImpactPopover.open(e.currentTarget, currentIncident, "patients");
});

/* ---------------- Create Support Task drawer ---------------- */
const addTaskOverlay = document.getElementById("addTaskOverlay");
const addTaskForm = document.getElementById("addTaskForm");
const saveAddTaskBtn = document.getElementById("saveAddTask");

document.querySelector('#addTaskOverlay .bo-select[data-name="taskTeam"] .bo-select-menu').innerHTML = buildSelectOptions(["Clinical Team", "Support Team"]);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskLevel"] .bo-select-menu').innerHTML = buildSelectOptions(["Level 1", "Level 2", "Level 3"]);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskAssignee"] .bo-select-menu').innerHTML = buildSelectOptions(SUPPORT_TEAM);
document.querySelector('#addTaskOverlay .bo-select[data-name="taskPriority"] .bo-select-menu').innerHTML = buildSelectOptions(Object.values(INC_SEVERITY_LABEL));

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

function openAddTaskDrawer() {
  addTaskForm.reset();
  document.querySelector('#addTaskOverlay .bo-select[data-name="taskOrg"] .bo-select-menu').innerHTML = buildFilterSelectOptions(currentIncident.orgs, "Optional");
  document.querySelector('#addTaskOverlay .bo-select[data-name="taskPatient"] .bo-select-menu').innerHTML = buildFilterSelectOptions(currentIncident.patients, "Optional");
  addTaskOverlay.querySelectorAll(".bo-select").forEach(resetBoSelect);
  taskAttachmentName.textContent = "Click to attach a file";
  document.getElementById("addTaskIncidentTag").textContent = `Incident: ${currentIncident.id}`;
  validateAddTaskForm();
  addTaskOverlay.classList.add("open");
}
function closeAddTaskDrawer() { addTaskOverlay.classList.remove("open"); }

document.getElementById("incDetailCreateTaskBtn").addEventListener("click", openAddTaskDrawer);
document.getElementById("closeAddTaskX").addEventListener("click", closeAddTaskDrawer);
document.getElementById("cancelAddTask").addEventListener("click", closeAddTaskDrawer);
addTaskOverlay.addEventListener("click", (e) => { if (e.target === addTaskOverlay) closeAddTaskDrawer(); });
addTaskForm.addEventListener("input", validateAddTaskForm);
addTaskForm.addEventListener("change", validateAddTaskForm);

addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddTaskBtn.disabled) return;

  const team = addTaskOverlay.querySelector('.bo-select[data-name="taskTeam"] input[type=hidden]').value;
  const level = addTaskOverlay.querySelector('.bo-select[data-name="taskLevel"] input[type=hidden]').value;
  const assignee = addTaskOverlay.querySelector('.bo-select[data-name="taskAssignee"] input[type=hidden]').value;
  const isFirstTask = currentIncident.tasks.length === 0;
  const nextId = currentIncident.tasks.length ? Math.max(...currentIncident.tasks.map((t) => t.id)) + 1 : 1;
  currentIncident.tasks.push({ id: nextId, title: addTaskForm.taskTitle.value.trim(), team, level, assignee, status: "Open" });
  currentIncident.timeline.push({ time: "Just now", text: `Ticket "${addTaskForm.taskTitle.value.trim()}" assigned to ${assignee}` });

  /* Incident Owner (overall responsibility) is distinct from a task's
     Owner/Assignee (responsibility for that one task) -- but when nobody
     owns the incident yet, the first task's assignee steps into that role
     rather than leaving the incident unowned. */
  const hasNoOwner = !currentIncident.owner || currentIncident.owner === "Unassigned";
  if (isFirstTask && hasNoOwner) {
    currentIncident.owner = assignee;
    currentIncident.timeline.push({ time: "Just now", text: `${assignee} became Incident Owner (first ticket assigned)` });
  }

  closeAddTaskDrawer();
  renderIncidentTimeline();
  renderIncidentSummary();
});
