/* ---------------- Incident Detail page ----------------
   Deep dive for a single system-generated Incident: Overview -> Impact ->
   Timeline -> Root Cause -> Resolution. Reached from the Incidents tab's
   Incident ID link (?id=INC-000140). Priority/Status/Owner are changed
   from the Incidents list page's row menu, not from this page -- this page
   is read-only except for creating Support Tasks. */
initBoSelects();

const params = new URLSearchParams(location.search);
const requestedId = params.get("id");
let currentIncident = incidents.find((i) => i.id === requestedId) || incidents[0];

function fmtBool(v) { return v ? "Yes" : "No"; }

function renderIncidentHeader() {
  document.getElementById("incDetailId").textContent = currentIncident.id;
  /* Already escalated or resolved: nothing left to escalate. */
  document.getElementById("incDetailCreateTaskBtn").hidden = currentIncident.status !== "Active";
  document.title = `HearO Backoffice | ${currentIncident.id}`;
}

function renderIncidentSummary() {
  document.getElementById("incDetailSummaryText").textContent = currentIncident.summary;
  document.getElementById("incDetailDetected").textContent = currentIncident.detectedAt;
  document.getElementById("incDetailPriorityKv").innerHTML = incPriorityPill(currentIncident.priority);
  document.getElementById("incDetailStatusKv").innerHTML = incStatusPill(currentIncident.status);
  document.getElementById("incDetailCategory").textContent = currentIncident.category;
  document.getElementById("incDetailIssueType").textContent = incIssueType(currentIncident);
}

function renderIncidentImpact() {
  const orgs = currentIncident.orgs;
  const list = document.getElementById("incDetailOrgList");
  list.replaceChildren(...orgs.map((name) => Object.assign(document.createElement("span"), { className: "bo-impact-chip", textContent: name })));
  if (!orgs.length) list.textContent = "None";
}

/* Timeline entries read like the developed screen: what happened (with who
   did it), a detail line, the full date and time, and -- for an escalation --
   a link to the ticket it created. Seeded entries only carry a clock time or
   a step name, so the date comes from when the incident was detected (or
   resolved). */
function incTimelineDate(incident, time) {
  const detectedDay = incident.detectedAt.split(", ")[0];
  if (/^\d{1,2}:\d{2} [AP]M$/.test(time)) return `${detectedDay}, ${time}`;
  if (time === "Resolved" && incident.resolution) return incident.resolution.resolvedAt;
  if (time === "Detected" || time === "Acknowledged" || time === "Resolved") return incident.detectedAt;
  return time;
}

function renderIncidentTimeline() {
  const incident = currentIncident;
  document.getElementById("incDetailTimeline").innerHTML = incident.timeline
    .map((t) => {
      const detail = t.detail || (t.text === "Incident detected automatically" ? incident.summary : "");
      const ticketNo = t.ticketNo || (/escalated incident|moved to Escalated/i.test(t.text) && incident.relatedTickets && incident.relatedTickets.length ? incident.relatedTickets[incident.relatedTickets.length - 1].ticketNo : "");
      const ticket = ticketNo && (incident.relatedTickets || []).find((r) => r.ticketNo === ticketNo);
      return `<div class="bo-ticket-history-item">
        <span class="bo-history-title">${t.text}</span>
        ${detail ? `<div class="bo-history-detail">${detail}</div>` : ""}
        ${ticket ? `<a class="bo-history-link" href="${incTicketHref(ticket)}">Ticket ${ticketNo}</a>` : ""}
        <span class="bo-history-date">${incTimelineDate(incident, t.time)}</span>
      </div>`;
    })
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

/* ---------------- Timeline / Resolution tabs ----------------
   Resolution only exists for resolved incidents (renderIncidentResolution
   hides its panel otherwise), so its tab follows that panel's visibility. */
function selectDetailTab(name) {
  document.querySelectorAll(".td-tab").forEach((t) => t.classList.toggle("active", t.dataset.tdTab === name));
  document.querySelectorAll(".td-tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.tdPanel === name));
}
document.querySelectorAll(".td-tab").forEach((tab) => tab.addEventListener("click", () => selectDetailTab(tab.dataset.tdTab)));

function renderAll() {
  renderIncidentHeader();
  renderIncidentSummary();
  renderIncidentImpact();
  renderIncidentTimeline();
  renderIncidentResolution();
  document.querySelector('.td-tab[data-td-tab="resolution"]').hidden = document.getElementById("resolution").hidden;
}
renderAll();

/* Deep link into a specific section, e.g. incident-detail.html?id=...#timeline;
   tabbed sections open their tab first. */
if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target && target.dataset.tdPanel && !target.hidden) selectDetailTab(target.dataset.tdPanel);
  if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

/* ---------------- Escalate & Create Ticket drawer ----------------
   Fields and behavior live in support-incidents-common.js (shared with the
   Incidents list's row menu). */
const openEscalateDrawer = wireEscalateDrawer(() => currentIncident, renderAll);
document.getElementById("incDetailCreateTaskBtn").addEventListener("click", () => openEscalateDrawer(currentIncident));
