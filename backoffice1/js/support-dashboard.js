/* ---------------- Color lookups ---------------- */
const priorityColor = { Critical: "var(--maroon)", High: "var(--orange)", Medium: "var(--yellow)", Low: "var(--gray)" };

/* "Tickets by Origin" counts who/what opened each ticket -- the patient's
   mobile app, a clinic, a Back Office agent or the system -- which is a
   different cut than the Patient/Clinic/System Type filter on the Tickets
   list. Listed in the developed order: Mobile, Clinic, Back Office, System. */
const SUP_DASH_ORIGINS = ["Patient", "Clinic", "Backoffice", "System"];

/* ---------------- Combine patient + clinic tickets ----------------
   source/who match the lowercase convention support.js and ticket-detail.html
   already use (?source=patient|clinic) so every link built below opens the
   right ticket. */
const supDashAllTickets = [
  ...patientTickets.map((t) => ({ ...t, source: "patient", who: t.patientId })),
  ...clinicTickets.map((t) => ({ ...t, source: "clinic", who: t.raisedBy })),
];

/* ---------------- Current Support Staff user ----------------
   This dashboard is scoped to a single signed-in agent's own queue -- in
   production that agent is whoever is logged in. The switcher below stands
   in for that (this mock has no real auth/session layer) so any of the five
   staff members' personal view can be previewed here. */
let currentAgent = SUPPORT_AGENTS[0];

/* Start/End date filter on each ticket's created date; values are the
   date inputs' YYYY-MM-DD strings, "" when unset. */
let supDashStartDate = "";
let supDashEndDate = "";

function myTickets() {
  const start = supDashStartDate ? new Date(`${supDashStartDate}T00:00:00`).getTime() : null;
  const end = supDashEndDate ? new Date(`${supDashEndDate}T23:59:59`).getTime() : null;
  return supDashAllTickets.filter((t) => {
    if (t.assignedTo !== currentAgent) return false;
    if (start === null && end === null) return true;
    const created = parseTicketDate(t.createdDate);
    return (start === null || created >= start) && (end === null || created <= end);
  });
}

/* createdDate is "DD/MM/YYYY HH:mm" -- parse to an actual timestamp so
   sorting is chronological rather than a lexicographic string compare. */
function parseTicketDate(s) {
  const [datePart, timePart] = s.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute] = (timePart || "0:0").split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime();
}

function ticketHref(t) {
  return `ticket-detail.html?source=${t.source}&id=${t.id}`;
}

function myTicketsHref(extraParams) {
  const params = new URLSearchParams({ assignedTo: currentAgent, ...extraParams });
  return `support.html?${params.toString()}`;
}

/* ---------------- KPI row ----------------
   Every count here is scoped to tickets assigned to the current agent --
   this card row answers "what do I personally need to work on", not "how is
   the support module doing overall". In Progress/Resolved map to a single
   status value so those two cards deep-link straight into the filtered
   ticket list; the others mix statuses/priorities that support.html's
   single-value filters can't express in one URL, so they stay plain cards. */
function renderKpis(mine) {
  /* Same four KPIs as the developed Support Dashboard: Total, Open,
     In Progress and Resolved -- the last three add up to the total. */
  const openTickets = mine.filter((t) => t.status === "Open");
  const inProgressTickets = mine.filter((t) => t.status === "In Progress");
  const resolvedTickets = mine.filter((t) => t.status === "Resolved");

  const cards = [
    { num: mine.length, label: "Total Tickets", color: "var(--blue)", icon: `<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8"/><path d="M12 16v4"/>`, href: myTicketsHref({ status: "all" }) },
    { num: openTickets.length, label: "Open Tickets", color: "var(--orange)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>`, href: myTicketsHref({ status: "Open" }) },
    { num: inProgressTickets.length, label: "In Progress Tickets", color: "var(--navy)", icon: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>`, href: myTicketsHref({ status: "In Progress" }) },
    { num: resolvedTickets.length, label: "Tickets Resolved", color: "var(--green)", icon: `<path d="M4 12L9 17L20 6"/>`, href: myTicketsHref({ status: "Resolved" }) },
  ];

  document.getElementById("supDashHealthGrid").innerHTML = cards
    .map((s) => {
      const tag = s.href ? "a" : "div";
      const hrefAttr = s.href ? ` href="${s.href}"` : "";
      return `
    <${tag} class="bo-health-card"${hrefAttr}>
      <span class="bo-health-icon" style="background:${s.color};">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </span>
      <span>
        <span class="bo-health-num">${s.num}</span>
        <span class="bo-health-label">${s.label}</span>
      </span>
    </${tag}>`;
    })
    .join("");
}

/* ---------------- Recent Tickets ----------------
   Every ticket assigned to the agent that isn't Resolved yet, ranked so the
   most urgent shows first: Critical, then High, with newest-created breaking
   ties. */
function queueWeight(t) {
  if (t.priority === "Critical") return 3;
  if (t.priority === "High") return 2;
  return 1;
}

function renderQueue(mine) {
  const items = mine
    .filter((t) => t.status !== "Resolved")
    .sort((a, b) => queueWeight(b) - queueWeight(a) || parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate))
    .slice(0, 20);

  document.getElementById("supDashQueueList").innerHTML = items.length
    ? items.map((t) => supDashTicketRow(t, `${t.status} &middot; ${formatTicketCreated(t.createdDate)}`)).join("")
    : `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">You're all caught up &mdash; nothing needs attention right now.</div>`;
}

/* Rows read like the developed Support Dashboard: "TCK-410 · Issue Type",
   one meta line underneath, and the priority pill on the right. */
function supDashTicketRow(t, meta) {
  return `
      <a class="bo-crit-issue-row bo-crit-issue-row--plain" href="${ticketHref(t)}">
        <span class="bo-crit-issue-body">
          <span class="bo-crit-issue-title">${t.ticketNo} &middot; ${t.issueType}</span>
          <span class="bo-crit-issue-meta">${meta}</span>
        </span>
        <span class="bo-crit-issue-right">
          <span class="bo-severity-pill ${(t.priority || "").toLowerCase()}">${t.priority}</span>
        </span>
      </a>`;
}

/* ---------------- Recently Resolved ----------------
   "Who resolved it · Resolved · when", newest first. Tickets carry no
   resolved timestamp, so one is derived (a few hours after creation,
   seeded by the ticket so it never changes), and the resolver is the
   agent the ticket is assigned to. */
function resolvedAtFor(t) {
  const created = new Date(parseTicketDate(t.createdDate));
  created.setHours(created.getHours() + 1 + (t.id % 47));
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(created.getDate())}/${pad(created.getMonth() + 1)}/${created.getFullYear()} ${pad(created.getHours())}:${pad(created.getMinutes())}`;
}

function renderResolved(mine) {
  const items = mine
    .filter((t) => t.status === "Resolved")
    .map((t) => ({ t, resolvedAt: resolvedAtFor(t) }))
    .sort((a, b) => parseTicketDate(b.resolvedAt) - parseTicketDate(a.resolvedAt))
    .slice(0, 20);

  document.getElementById("supDashResolvedList").innerHTML = items.length
    ? items.map(({ t, resolvedAt }) => supDashTicketRow(t, `${t.assignedTo} &middot; Resolved &middot; ${formatTicketCreated(resolvedAt)}`)).join("")
    : `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">Nothing resolved yet &mdash; closed tickets will show up here.</div>`;
}

/* ---------------- Donuts (Status / Priority) ---------------- */
function renderDonut(donutId, totalId, legendId, entries) {
  const total = entries.reduce((s, e) => s + e.count, 0);
  if (!total) {
    document.getElementById(donutId).style.background = "var(--bg)";
    document.getElementById(totalId).textContent = "0";
    document.getElementById(legendId).innerHTML = `<div class="bo-empty-state" style="color:var(--gray-text); font-size:13px;">No data.</div>`;
    return;
  }
  let acc = 0;
  const stops = entries
    .map((e) => {
      const from = (acc / total) * 360;
      acc += e.count;
      const to = (acc / total) * 360;
      return `${e.color} ${from}deg ${to}deg`;
    })
    .join(", ");
  document.getElementById(donutId).style.background = `conic-gradient(${stops})`;
  document.getElementById(totalId).textContent = total;
  document.getElementById(legendId).innerHTML = entries
    .map((e) => {
      const pct = Math.round((e.count / total) * 100);
      return `
      <a class="bo-donut-legend-row" href="${e.href}">
        <span class="dot" style="background:${e.color};"></span>
        <span class="name">${e.label}</span>
        <span class="val">${e.count} (${pct}%)</span>
      </a>`;
    })
    .join("");
}

/* ---------------- Category / Type breakdown (horizontal bars) ---------------- */

function renderHbarList(containerId, entries) {
  const max = Math.max(1, ...entries.map((e) => e.count));
  document.getElementById(containerId).innerHTML = entries
    .map(
      (e) => `
    <a class="bo-hbar-row" href="${e.href}" style="text-decoration:none; color:inherit;">
      <span class="bo-hbar-label">${e.label}</span>
      <span class="bo-hbar-track"><span class="bo-hbar-fill" style="width:${(e.count / max) * 100}%; background:${e.color};"></span></span>
      <span class="bo-hbar-count">${e.count}</span>
    </a>`
    )
    .join("");
}

/* ---------------- Full re-render for the current agent ---------------- */
function renderDashboard() {
  const mine = myTickets();

  renderKpis(mine);
  renderQueue(mine);
  renderResolved(mine);

  renderDonut(
    "supDashPriorityDonut",
    "supDashPriorityDonutTotal",
    "supDashPriorityDonutLegend",
    PRIORITIES.map((sev) => ({
      label: sev,
      count: mine.filter((t) => t.priority === sev).length,
      color: priorityColor[sev],
      href: myTicketsHref({ priority: sev, status: "all" }),
    }))
  );

  /* Tickets by Category / Origin: one blue for every bar and a fixed row
     order (the categories' own order; Mobile, Clinic, Back Office, System),
     as in the developed dashboard. Every status counts here, so each row
     opens the agent's tickets of every status. */
  renderHbarList(
    "supDashCategoryBars",
    CATEGORIES.map((category) => ({
      label: category,
      count: mine.filter((t) => ticketCategory(t) === category).length,
      color: "var(--blue)",
      href: myTicketsHref({ category, status: "all" }),
    }))
  );

  renderHbarList(
    "supDashTypeBars",
    SUP_DASH_ORIGINS.map((origin) => ({
      label: originLabel[origin] || origin,
      count: mine.filter((t) => t.origin === origin).length,
      color: "var(--blue)",
      href: myTicketsHref({ origin, status: "all" }),
    }))
  );
}

/* ---------------- Agent switcher ----------------
   Stands in for "the logged-in user" -- picking a name re-scopes every
   section above to that agent's own tickets. */
const supDashAgentSelect = document.querySelector('.bo-select[data-name="supDashAgent"]');
const supDashLevelSelect = document.querySelector('.bo-select[data-name="supDashLevel"]');

function agentsForLevel(level) {
  return level ? TIER_AGENTS[level] || [] : SUPPORT_AGENTS;
}

document.getElementById("supDashLevelMenu").innerHTML = buildFilterSelectOptions(TIERS, "All levels");
document.getElementById("supDashAgentMenu").innerHTML = buildAgentSelectOptions(SUPPORT_AGENTS);
initBoSelects();
setBoSelectValue(supDashLevelSelect, AGENT_LEVEL[currentAgent] || "", { silent: true });
document.getElementById("supDashAgentMenu").innerHTML = buildAgentSelectOptions(agentsForLevel(AGENT_LEVEL[currentAgent]));
setBoSelectValue(supDashAgentSelect, currentAgent, { silent: true });

/* Picking a level narrows the agent list to that tier's team; if the agent
   currently being viewed isn't on it, switch to the tier's first agent. */
document.getElementById("supDashLevelFilter").addEventListener("change", (e) => {
  const agents = agentsForLevel(e.target.value);
  document.getElementById("supDashAgentMenu").innerHTML = buildAgentSelectOptions(agents);
  if (!agents.includes(currentAgent)) currentAgent = agents[0];
  setBoSelectValue(supDashAgentSelect, currentAgent, { silent: true });
  renderDashboard();
});

document.getElementById("supDashAgentFilter").addEventListener("change", (e) => {
  currentAgent = e.target.value || agentsForLevel(document.getElementById("supDashLevelFilter").value)[0];
  renderDashboard();
});

const supDashStartInput = document.getElementById("supDashStartDate");
const supDashEndInput = document.getElementById("supDashEndDate");
supDashStartInput.addEventListener("change", (e) => {
  supDashStartDate = e.target.value;
  supDashEndInput.min = supDashStartDate;
  renderDashboard();
});
supDashEndInput.addEventListener("change", (e) => {
  supDashEndDate = e.target.value;
  supDashStartInput.max = supDashEndDate;
  renderDashboard();
});

renderDashboard();
