/* ---------------- Severity color lookups ---------------- */
const severityColor = { Critical: "var(--red)", High: "var(--orange)", Medium: "var(--yellow)", Low: "var(--blue)" };
const incSeverityColor = { "SEV-1": "var(--red)", "SEV-2": "var(--orange)", "SEV-3": "var(--yellow)", "SEV-4": "var(--blue)" };

/* ---------------- Combine patient + clinic tickets ---------------- */
const supDashTickets = [
  ...patientTickets.map((t) => ({ ...t, source: "Patient", raisedBy: t.patientId })),
  ...clinicTickets.map((t) => ({ ...t, source: "Clinic" })),
];

const openTickets = supDashTickets.filter((t) => t.status === "Open");
const criticalTickets = supDashTickets.filter((t) => t.severity === "Critical");
const escalatedTickets = supDashTickets.filter((t) => t.status === "Escalated");
const resolvedTickets = supDashTickets.filter((t) => t.status === "Resolved");

/* ---------------- Incidents ---------------- */
const activeIncidents = incidents.filter((i) => i.status === "Active");
const escalatedIncidents = incidents.filter((i) => i.status === "Escalated");

/* "Organizations Impacted" counts unique orgs across incidents that are
   still open (Active/Escalated) -- a Resolved incident's orgs aren't
   currently impacted by anything. */
const impactedOrgs = new Set([...activeIncidents, ...escalatedIncidents].flatMap((i) => i.orgs));

/* ---------------- KPI row (Tickets + Incidents, one combined row) ---------------- */
const supDashStats = [
  { num: openTickets.length, label: "Open Tickets", color: "var(--blue)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>` },
  { num: criticalTickets.length, label: "Critical Tickets", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` },
  { num: activeIncidents.length, label: "Active Incidents", color: "var(--orange)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>` },
  { num: escalatedIncidents.length, label: "Escalated Incidents", color: "var(--navy)", icon: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>` },
  { num: impactedOrgs.size, label: "Organizations Impacted", color: "var(--purple)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>` },
  { num: resolvedTickets.length, label: "Resolved Tickets (7d)", color: "var(--green)", icon: `<path d="M4 12L9 17L20 6"/>` },
];

document.getElementById("supDashHealthGrid").innerHTML = supDashStats
  .map(
    (s) => `
    <div class="bo-health-card">
      <span class="bo-health-icon" style="background:${s.color};">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </span>
      <span>
        <span class="bo-health-num">${s.num}</span>
        <span class="bo-health-label">${s.label}</span>
      </span>
    </div>`
  )
  .join("");

/* ---------------- Volume Trend ----------------
   Two small bar sparklines (Tickets / Incidents) sharing one panel rather
   than a single shared-axis line chart -- ticket volume runs in the
   hundreds while incident volume runs in the tens, so one shared y-axis
   would make the incidents line unreadable. Each bar's height is relative
   to that series' own weekly max. Weekly shape is representative (this
   demo's records don't carry a reliable day-by-day timestamp to bucket
   from), the KPI cards above are the real, live-computed counts. */
const supDashTicketTrend = [38, 44, 41, 52, 47, 60, 55, 63];
const supDashIncidentTrend = [2, 4, 3, 5, 2, 6, 4, 3];
const supDashTrendWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

/* Bars are capped at 82% of the plot height (with a 6% floor so even the
   smallest week still shows a sliver) so the tallest bar leaves headroom
   under the gridlines instead of slamming into the top edge. */
function renderMiniBarChart(containerId, values, color) {
  const max = Math.max(...values);
  document.getElementById(containerId).innerHTML = values
    .map((v, i) => {
      const h = Math.max(6, Math.round((v / max) * 82));
      return `
      <div class="bo-mini-bar-item" title="${supDashTrendWeeks[i]}: ${v}">
        <div class="bo-mini-bar-fill" style="height:${h}%; background:${color};"></div>
      </div>`;
    })
    .join("");
}

const supDashXAxis = supDashTrendWeeks.map((w) => `<span>${w}</span>`).join("");

document.getElementById("supDashTrendChart").innerHTML = `
  <div class="bo-mini-bar-group">
    <div class="bo-mini-bar-col">
      <div class="bo-mini-bar-head"><span class="dot" style="background:var(--blue);"></span>Tickets <b>${supDashTicketTrend.reduce((a, b) => a + b, 0)}</b></div>
      <div class="bo-mini-bar-plot">
        <div class="bo-mini-bar-row" id="supDashTicketBars"></div>
        <div class="bo-mini-bar-xaxis">${supDashXAxis}</div>
      </div>
    </div>
    <div class="bo-mini-bar-col">
      <div class="bo-mini-bar-head"><span class="dot" style="background:var(--orange);"></span>Incidents <b>${supDashIncidentTrend.reduce((a, b) => a + b, 0)}</b></div>
      <div class="bo-mini-bar-plot">
        <div class="bo-mini-bar-row" id="supDashIncidentBars"></div>
        <div class="bo-mini-bar-xaxis">${supDashXAxis}</div>
      </div>
    </div>
  </div>`;
renderMiniBarChart("supDashTicketBars", supDashTicketTrend, "var(--blue)");
renderMiniBarChart("supDashIncidentBars", supDashIncidentTrend, "var(--orange)");
document.getElementById("supDashTrendLegend").innerHTML = `<span style="color:var(--gray-text); font-weight:500;">Last 8 weeks</span>`;

/* ---------------- Needs Attention ----------------
   One merged, priority-sorted queue instead of two separate full tables --
   Critical/Escalated tickets and Active/Escalated incidents ranked
   together so the most urgent item across both shows up first regardless
   of which one it is. */
const supDashAttentionItems = [
  ...criticalTickets.concat(escalatedTickets.filter((t) => t.severity !== "Critical")).map((t) => ({
    kind: "Ticket",
    title: t.ticketNo,
    desc: t.issueType,
    meta: `${t.organization} &middot; ${t.raisedBy}`,
    severity: t.severity,
    status: t.status,
    href: `ticket-detail.html?ticket=${encodeURIComponent(t.ticketNo)}&source=${t.source.toLowerCase()}`,
    weight: t.severity === "Critical" ? 3 : t.status === "Escalated" ? 2 : 1,
  })),
  ...[...activeIncidents, ...escalatedIncidents].map((i) => ({
    kind: "Incident",
    title: i.id,
    desc: i.title,
    meta: `${incImpactLabel(i)}`,
    severity: INC_SEVERITY_LABEL[i.severity] || i.severity,
    status: i.status,
    href: `incident-detail.html?id=${i.id}`,
    weight: i.status === "Escalated" ? 3 : i.severity === "SEV-1" ? 3 : 2,
  })),
]
  .sort((a, b) => b.weight - a.weight)
  .slice(0, 7);

const supDashAttentionIcon = { Ticket: `<path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7a9 9 0 0 1 18 0v7h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>`, Incident: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>` };

document.getElementById("supDashAttentionList").innerHTML = supDashAttentionItems.length
  ? supDashAttentionItems
      .map(
        (item) => `
      <a class="bo-crit-issue-row" href="${item.href}">
        <span class="bo-crit-issue-icon" style="background:${severityColor[item.severity] || "var(--gray)"};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${supDashAttentionIcon[item.kind]}</svg>
        </span>
        <span class="bo-crit-issue-body">
          <span class="bo-crit-issue-title">${item.kind} &middot; ${item.title}</span>
          <span class="bo-crit-issue-desc">${item.desc}</span>
          <span class="bo-crit-issue-meta">${item.meta} &middot; ${item.status}</span>
        </span>
        <span class="bo-crit-issue-right">
          <span class="bo-severity-pill ${(item.severity || "").toLowerCase()}">${item.severity}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        </span>
      </a>`
      )
      .join("")
  : `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">Nothing needs attention right now.</div>`;

/* ---------------- Tickets by Severity (donut) ---------------- */
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

renderDonut(
  "supDashTicketDonut",
  "supDashTicketDonutTotal",
  "supDashTicketDonutLegend",
  SEVERITIES.map((sev) => ({
    label: sev,
    count: openTickets.filter((t) => t.severity === sev).length,
    color: severityColor[sev],
    href: `support.html?severity=${encodeURIComponent(sev)}&status=Open`,
  }))
);

renderDonut(
  "supDashIncidentDonut",
  "supDashIncidentDonutTotal",
  "supDashIncidentDonutLegend",
  INC_SEVERITIES.map((sev) => ({
    label: INC_SEVERITY_LABEL[sev] || sev,
    count: [...activeIncidents, ...escalatedIncidents].filter((i) => i.severity === sev).length,
    color: incSeverityColor[sev],
    href: "support.html?tab=incidents",
  }))
);

/* ---------------- Tickets by Category / Incidents by Source (horizontal bars) ---------------- */
const supDashCategoryColors = {
  Compliance: "var(--purple)",
  "Voice Engine": "var(--orange)",
  Sensors: "var(--yellow)",
  "Patient (Mobile/Web)": "var(--blue)",
  "Clinic Users (Security)": "var(--navy)",
  "System Schedule Engine": "var(--gray)",
};
const supDashIncidentSourceColors = {
  "System Scheduler": "var(--gray)",
  "Voice Engine": "var(--orange)",
  Sensors: "var(--yellow)",
  "EHR Integration": "var(--purple)",
  "Patient Monitoring": "var(--blue)",
  "System Health": "var(--navy)",
  Other: "var(--red)",
};

function renderHbarList(containerId, entries) {
  const max = Math.max(1, ...entries.map((e) => e.count));
  document.getElementById(containerId).innerHTML = entries
    .map(
      (e) => `
    <div class="bo-hbar-row">
      <span class="bo-hbar-label">${e.label}</span>
      <span class="bo-hbar-track"><span class="bo-hbar-fill" style="width:${(e.count / max) * 100}%; background:${e.color};"></span></span>
      <span class="bo-hbar-count">${e.count}</span>
    </div>`
    )
    .join("");
}

renderHbarList(
  "supDashCategoryBars",
  CATEGORIES.map((category) => ({
    label: category,
    count: supDashTickets.filter((t) => (t.category || ISSUE_TYPE_CATEGORY[t.issueType]) === category).length,
    color: supDashCategoryColors[category] || "var(--gray)",
  })).sort((a, b) => b.count - a.count)
);

renderHbarList(
  "supDashSourceBars",
  INC_SOURCES.map((source) => ({
    label: source,
    count: incidents.filter((i) => i.source === source).length,
    color: supDashIncidentSourceColors[source] || "var(--gray)",
  })).sort((a, b) => b.count - a.count)
);

/* ---------------- Time range toggle (visual only for now) ---------------- */
document.getElementById("supDashTimeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.querySelectorAll("#supDashTimeToggle .bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});
