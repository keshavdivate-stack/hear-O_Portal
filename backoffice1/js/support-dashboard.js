/* ---------------- Color lookups ---------------- */
const severityColor = { Critical: "var(--red)", High: "var(--orange)", Medium: "var(--yellow)", Low: "var(--blue)" };
const statusColor = { Open: "var(--blue)", "In Progress": "var(--orange)", Escalated: "var(--red)", Resolved: "var(--green)" };
const typeColor = { Patient: "var(--cyan)", Clinic: "var(--purple)" };

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

function myTickets() {
  return supDashAllTickets.filter((t) => t.assignedTo === currentAgent);
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
   the support module doing overall". Escalated/Resolved map to a single
   status value so those two cards deep-link straight into the filtered
   ticket list; the others mix statuses/severities that support.html's
   single-value filters can't express in one URL, so they stay plain cards. */
function renderKpis(mine) {
  const openTickets = mine.filter((t) => t.status === "Open" || t.status === "In Progress");
  const priorityTickets = mine.filter((t) => (t.severity === "Critical" || t.severity === "High") && t.status !== "Resolved");
  const escalatedTickets = mine.filter((t) => t.status === "Escalated");
  const resolvedTickets = mine.filter((t) => t.status === "Resolved");

  const cards = [
    { num: openTickets.length, label: "My Open Tickets", color: "var(--blue)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>` },
    { num: priorityTickets.length, label: "Critical / High Priority", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` },
    { num: escalatedTickets.length, label: "Escalated to Me", color: "var(--navy)", icon: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>`, href: myTicketsHref({ status: "Escalated" }) },
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

/* ---------------- My Queue ----------------
   Every ticket assigned to the agent that isn't Resolved yet, ranked so the
   most urgent shows first: an Escalated ticket outranks any severity, then
   Critical, then High, with newest-created breaking ties. */
function queueWeight(t) {
  if (t.status === "Escalated") return 4;
  if (t.severity === "Critical") return 3;
  if (t.severity === "High") return 2;
  return 1;
}

function renderQueue(mine) {
  const items = mine
    .filter((t) => t.status !== "Resolved")
    .sort((a, b) => queueWeight(b) - queueWeight(a) || parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate))
    .slice(0, 8);

  const ticketIcon = `<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7a9 9 0 0 1 18 0v7h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>`;

  document.getElementById("supDashQueueList").innerHTML = items.length
    ? items
        .map(
          (t) => `
      <a class="bo-crit-issue-row" href="${ticketHref(t)}">
        <span class="bo-crit-issue-icon" style="background:${severityColor[t.severity] || "var(--gray)"};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ticketIcon}</svg>
        </span>
        <span class="bo-crit-issue-body">
          <span class="bo-crit-issue-title">${t.ticketNo} &middot; ${t.issueType}</span>
          <span class="bo-crit-issue-desc">${t.organization} &middot; ${t.who}</span>
          <span class="bo-crit-issue-meta">${t.status} &middot; ${t.createdDate}</span>
        </span>
        <span class="bo-crit-issue-right">
          <span class="bo-severity-pill ${(t.severity || "").toLowerCase()}">${t.severity}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </a>`
        )
        .join("")
    : `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">You're all caught up &mdash; nothing needs attention right now.</div>`;
}

/* ---------------- Recently Resolved ----------------
   Tickets carry no separate "resolved on" timestamp, so this reads as
   "most recently created among what's now Resolved" -- still a useful,
   honestly-labeled trace of the agent's own recent closures. */
function renderResolved(mine) {
  const items = mine
    .filter((t) => t.status === "Resolved")
    .sort((a, b) => parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate))
    .slice(0, 8);

  const checkIcon = `<path d="M4 12L9 17L20 6"/>`;

  document.getElementById("supDashResolvedList").innerHTML = items.length
    ? items
        .map(
          (t) => `
      <a class="bo-crit-issue-row" href="${ticketHref(t)}">
        <span class="bo-crit-issue-icon" style="background:var(--green);">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${checkIcon}</svg>
        </span>
        <span class="bo-crit-issue-body">
          <span class="bo-crit-issue-title">${t.ticketNo} &middot; ${t.issueType}</span>
          <span class="bo-crit-issue-desc">${t.organization} &middot; ${t.who}</span>
          <span class="bo-crit-issue-meta">Resolved &middot; ${t.createdDate}</span>
        </span>
        <span class="bo-crit-issue-right">
          <span class="bo-severity-pill ${(t.severity || "").toLowerCase()}">${t.severity}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </a>`
        )
        .join("")
    : `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">Nothing resolved yet &mdash; closed tickets will show up here.</div>`;
}

/* ---------------- Donuts (Status / Severity) ---------------- */
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
const supDashCategoryColors = {
  Compliance: "var(--purple)",
  "Voice Engine": "var(--orange)",
  Sensors: "var(--yellow)",
  "Patient (Mobile/Web)": "var(--blue)",
  "Clinic Users (Security)": "var(--navy)",
  "System Schedule Engine": "var(--gray)",
};

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

  document.getElementById("supDashMyTicketsBtn").href = myTicketsHref({});

  renderKpis(mine);
  renderQueue(mine);
  renderResolved(mine);

  renderDonut(
    "supDashStatusDonut",
    "supDashStatusDonutTotal",
    "supDashStatusDonutLegend",
    STATUSES.map((status) => ({
      label: status,
      count: mine.filter((t) => t.status === status).length,
      color: statusColor[status],
      href: myTicketsHref({ status }),
    }))
  );

  renderDonut(
    "supDashSeverityDonut",
    "supDashSeverityDonutTotal",
    "supDashSeverityDonutLegend",
    SEVERITIES.map((sev) => ({
      label: sev,
      count: mine.filter((t) => t.severity === sev).length,
      color: severityColor[sev],
      href: myTicketsHref({ severity: sev }),
    }))
  );

  renderHbarList(
    "supDashCategoryBars",
    CATEGORIES.map((category) => ({
      label: category,
      count: mine.filter((t) => ticketCategory(t) === category).length,
      color: supDashCategoryColors[category] || "var(--gray)",
      href: myTicketsHref({ category }),
    })).sort((a, b) => b.count - a.count)
  );

  renderHbarList(
    "supDashTypeBars",
    TICKET_TYPES.map((type) => ({
      label: type,
      count: mine.filter((t) => (type === "Patient" ? t.source === "patient" : t.source === "clinic")).length,
      color: typeColor[type],
      href: myTicketsHref({ type }),
    }))
  );
}

/* ---------------- Agent switcher ----------------
   Stands in for "the logged-in user" -- picking a name re-scopes every
   section above to that agent's own tickets. */
document.getElementById("supDashAgentMenu").innerHTML = buildAgentSelectOptions(SUPPORT_AGENTS);
initBoSelects();
setBoSelectValue(document.querySelector('.bo-select[data-name="supDashAgent"]'), currentAgent, { silent: true });
document.getElementById("supDashAgentFilter").addEventListener("change", (e) => {
  currentAgent = e.target.value || SUPPORT_AGENTS[0];
  renderDashboard();
});

renderDashboard();
