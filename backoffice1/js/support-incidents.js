/* ---------------- Support > Incidents tab ----------------
   System-generated incidents live in their own tab, separate from manually
   raised Tickets (Support > Tickets) and detection/escalation config
   (Support > Rules). Incidents are never converted into Tickets -- the
   Support Team works them via lightweight Support Tasks instead. */

/* ---------------- Filters ----------------
   Same filters, values and behavior as the developed Incidents tab: Search
   Incident ID, then Priority / Status / Category / Issue Type multi-selects
   (Issue Type unlocks once a Category is picked) and a From-To detected date
   range. Nothing applies until "Apply"; the list opens on Active +
   Escalated incidents. */
const INC_DEFAULT_STATUSES = ["Active", "Escalated"];

/* Priority is listed Low -> Critical like the developed filter, but filters
   on the SEV-1..4 key incidents are stored under. */
const incPriorityFilter = wireSupportMultiFilter("incPriorityFilter", {
  options: INC_PRIORITIES.slice().reverse().map((sev) => ({ value: sev, label: INC_PRIORITY_LABEL[sev] })),
});
const incStatusFilter = wireSupportMultiFilter("incStatusFilter", { options: asFilterOptions(INC_STATUSES), selected: INC_DEFAULT_STATUSES });
const incCategoryFilter = wireSupportMultiFilter("incCategoryFilter", { options: asFilterOptions(INC_CATEGORIES) });
const incIssueFilter = wireSupportMultiFilter("incIssueFilter", { disabledPlaceholder: "Select a category first", searchPlaceholder: "Search issue types" });
const syncIncIssueFilter = linkIssueTypeToCategory("incCategoryFilter", incCategoryFilter, incIssueFilter);

/* No future dates, and To can't be earlier than From. */
const incDateFromInput = document.getElementById("incDateFromFilter");
const incDateToInput = document.getElementById("incDateToFilter");
function syncIncDateLimits() {
  const today = new Date();
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  incDateFromInput.max = incDateToInput.value || todayIso;
  incDateToInput.max = todayIso;
  incDateToInput.min = incDateFromInput.value || "";
}
incDateFromInput.addEventListener("change", syncIncDateLimits);
incDateToInput.addEventListener("change", syncIncDateLimits);
syncIncDateLimits();

/* What's picked in the filter row is only staged; incFilters holds what was
   last applied (on load, by Apply, or by Clear filters). */
function readIncidentFilters() {
  return {
    search: document.getElementById("incSearchInput").value.trim().toLowerCase(),
    priorities: incPriorityFilter.getSelected(),
    statuses: incStatusFilter.getSelected(),
    categories: incCategoryFilter.getSelected(),
    issueTypes: incIssueFilter.getSelected(),
    from: incDateFromInput.value,
    to: incDateToInput.value,
  };
}
let incFilters = readIncidentFilters();

/* detectedAt is stored as "MM/DD/YYYY, hh:mm AM" -- pull just the calendar
   day out of it so a From/To range can compare against it. */
function incDetectedDateOnly(incident) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(incident.detectedAt);
  return m ? new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2])) : null;
}

/* Date inputs yield YYYY-MM-DD; parsed as local-midnight (not via `new
   Date(str)`, which reads it as UTC) so it compares cleanly against the
   local-midnight date above with no timezone-offset surprises. */
function incParseFilterDate(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null;
}

/* An empty list means that filter isn't narrowing anything. Search matches
   the Incident ID, like the developed "Search Incident ID" field. */
function incMatchesFilters(incident) {
  const f = incFilters;
  if (f.search && !incident.id.toLowerCase().includes(f.search)) return false;
  if (!inFilterList(f.priorities, incident.priority)) return false;
  if (!inFilterList(f.statuses, incident.status)) return false;
  if (!inFilterList(f.categories, incident.category)) return false;
  if (!inFilterList(f.issueTypes, `${incident.category}|${incIssueType(incident)}`)) return false;
  if (f.from || f.to) {
    const detected = incDetectedDateOnly(incident);
    if (!detected) return false;
    const from = incParseFilterDate(f.from);
    const to = incParseFilterDate(f.to);
    if (from && detected < from) return false;
    if (to && detected > to) return false;
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
      <td>${incident.category}</td>
      <td>${incPriorityPill(incident.priority)}</td>
      <td>${incStatusPill(incident.status)}${incRelatedTicketLink(incident)}</td>
      <td>${incImpactLabel(incident)}</td>
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
  { pageSize: INC_PAGE_SIZE, emptyColspan: 8, emptyText: "No incidents found" }
);
incidentPager();

function refreshIncidentTable() {
  incidentPager.resetPage();
  incidentPager();
}

document.getElementById("incApplyBtn").addEventListener("click", () => {
  incFilters = readIncidentFilters();
  refreshIncidentTable();
});

/* Clears every filter -- Status included, so resolved incidents show too --
   and applies straight away, like the developed "Clear filters". */
document.getElementById("incClearFiltersBtn").addEventListener("click", () => {
  document.getElementById("incSearchInput").value = "";
  [incPriorityFilter, incStatusFilter, incCategoryFilter].forEach((f) => f.setSelected([]));
  syncIncIssueFilter();
  [incDateFromInput, incDateToInput].forEach((el) => {
    el.value = "";
    el.type = "text";
  });
  syncIncDateLimits();
  incFilters = readIncidentFilters();
  refreshIncidentTable();
});

function findIncident(id) { return incidents.find((i) => i.id === id); }

/* ---------------- Row action menu: Create Task / View Task ---------------- */
const incidentRowMenu = document.getElementById("incidentRowMenu");
const incidentRowMenuEscalateBtn = document.getElementById("incidentRowMenuEscalateBtn");
const incidentRowMenuViewTicketBtn = document.getElementById("incidentRowMenuViewTicketBtn");
let activeIncidentId = null;

document.getElementById("incidentRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeIncidentId = trigger.dataset.id;
  const incident = findIncident(activeIncidentId);
  /* Already escalated or resolved: nothing left to escalate (matches the
     same rule on the Incident Detail page's header button). */
  incidentRowMenuEscalateBtn.hidden = !incident || incident.status !== "Active";
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

/* ---------------- Escalate & Create Ticket drawer ----------------
   Fields and behavior live in support-incidents-common.js (shared with the
   incident detail page). Escalating also adds the new ticket to Tickets. */
let escalateTarget = null;
const openEscalateDrawer = wireEscalateDrawer(() => escalateTarget, () => {
  refreshIncidentTable();
  refreshTicketTables();
});
function openAddTaskDrawer(incident) {
  escalateTarget = incident;
  openEscalateDrawer(incident);
}

/* ---------------- Deep link ----------------
   support.html?tab=incidents&statuses=<Active,Escalated|Resolved>&priority=<Critical|High|Medium|Low>&category=<Category>&from=<YYYY-MM-DD>&to=<YYYY-MM-DD>&q=<incident ID>
   Lets other screens (e.g. the System Health Overview's trend totals and
   Incidents legend) land here on the Incidents tab with those filters
   applied, the same way the developed dashboard opens Support. `status`
   (one status) and `severity` (= priority) are still accepted. Priority
   arrives as the human label (Critical/High/Medium/Low) rather than the raw
   SEV-1..4 key incidents are stored under, so it's translated via
   INC_PRIORITY_LABEL. */
(function openIncidentsTabFromUrl() {
  const params = new URLSearchParams(location.search);
  if (params.get("tab") !== "incidents") return;

  const list = (name) => (params.get(name) || "").split(",").map((v) => v.trim()).filter(Boolean);
  const statuses = [...list("statuses"), ...list("status")].filter((s) => INC_STATUSES.includes(s));
  const priorities = [...list("priority"), ...list("severity")]
    .map((label) => INC_PRIORITIES.find((key) => INC_PRIORITY_LABEL[key] === label))
    .filter(Boolean);
  const categories = list("category").filter((c) => INC_CATEGORIES.includes(c));
  const isoDate = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || "") ? v : "");
  const q = params.get("q");

  if (statuses.length) incStatusFilter.setSelected(statuses);
  if (priorities.length) incPriorityFilter.setSelected(priorities);
  if (categories.length) {
    incCategoryFilter.setSelected(categories);
    syncIncIssueFilter();
  }
  [[incDateFromInput, isoDate(params.get("from"))], [incDateToInput, isoDate(params.get("to"))]].forEach(([input, value]) => {
    if (!value) return;
    input.type = "date";
    input.value = value;
  });
  syncIncDateLimits();
  if (q) document.getElementById("incSearchInput").value = q;
  incFilters = readIncidentFilters();
  refreshIncidentTable();

  const tabBtn = document.querySelector('#supportTabs .bo-tab[data-tab="incidents"]');
  if (tabBtn) tabBtn.click();
})();
