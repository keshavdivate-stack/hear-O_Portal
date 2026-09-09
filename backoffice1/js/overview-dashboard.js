/* ---------------- Organization scope (All Organizations vs single org) ---------------- */
let ovSelectedOrgId = "all";

/* ---------------- Incidents by Category: Category/Severity/Status filters ---------------- */
let ovDonutCategoryFilter = "all";
let ovDonutSeverityFilter = "all";
let ovDonutStatusFilter = "all";

/* ---------------- Incidents Over Time: Category/Severity/Status filters ---------------- */
let ovTrendCategoryFilter = "all";
let ovTrendSeverityFilter = "all";
let ovTrendStatusFilter = "all";

/* ---------------- KPI row (System Health Summary) ---------------- */
/* "Organizations Affected" is derived from orgHealthData (orgs with at least one
   open issue) so it always agrees with the Affected Organizations list below
   instead of drifting out of sync as a separately hand-maintained number. */
const ovAffectedOrgCount = Object.values(orgHealthData).filter((o) => o.openIssues > 0).length;

/* "Patients Affected" and "Open Incidents Requiring Action" are summed from the
   same per-organization data (orgHealthData) that backs the Affected
   Organizations list and every org's own drill-down page -- so the
   all-organizations KPI row always agrees with what a viewer sees when they
   add up the org list themselves, instead of being separately hand-tuned
   numbers that drift out of sync. */
const ovPatientsAffectedCount = Object.values(orgHealthData).reduce((sum, o) => sum + o.patientsAffected.length, 0);
const ovOpenIssuesCount = Object.values(orgHealthData).reduce((sum, o) => sum + o.openIssues, 0);

const ovAllOrgsHealthStats = [
  { num: Object.keys(orgHealthData).length, label: "Total Organizations", color: "var(--navy)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/><path d="M10 21v-3a2 2 0 0 1 4 0v3"/>`, delta: 0, deltaDir: "flat" },
  { num: ovAffectedOrgCount, label: "Organizations Affected", color: "var(--blue)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>`, delta: 1, deltaDir: "up" },
  { num: ovPatientsAffectedCount, label: "Patients Affected", color: "var(--purple)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, delta: 23, deltaDir: "up" },
  { num: ovOpenIssuesCount, label: "Open Incidents Requiring Action", color: "var(--orange)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>`, delta: 2, deltaDir: "down" },
];

const ovDeltaArrow = { up: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>`, down: `<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>`, flat: `<path d="M5 12h14"/>` };
const ovDeltaText = (s) => (s.deltaDir === "flat" ? "No change" : `${s.delta} vs yesterday`);
const ovDeltaColor = (s) => (s.deltaDir === "flat" ? "var(--gray-text)" : s.deltaDir === "up" ? "var(--red)" : "var(--green)");

function ovHealthStatsFor(orgId) {
  if (orgId === "all") return ovAllOrgsHealthStats;
  const o = orgHealthData[orgId];
  return [
    { num: 1, label: "Organization", color: "var(--navy)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/><path d="M10 21v-3a2 2 0 0 1 4 0v3"/>`, delta: 0, deltaDir: "flat" },
    { num: o.providers, label: "Providers", color: "var(--blue)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>`, delta: 0, deltaDir: "flat" },
    { num: o.patientsAffected.length, label: "Patients Affected", color: "var(--purple)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, delta: 0, deltaDir: "flat" },
    { num: o.openIssues, label: "Open Incidents Requiring Action", color: "var(--orange)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>`, delta: 0, deltaDir: "flat" },
  ];
}

function renderOvHealthGrid(orgId) {
  document.getElementById("ovHealthGrid").innerHTML = ovHealthStatsFor(orgId)
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
}

/* ---------------- System Health Trend (layered area chart) ---------------- */
/* The trend chart now redraws for whichever range is chosen in the page's
   "Last 24 hours" selector at the top, instead of always showing a fixed
   24-hour window regardless of that control -- so the two stay in sync. */
/* Chart plots the same 4-level severity used for issues/tickets everywhere
   else on the app (Critical/High/Medium/Low) -- "Information" stays dropped
   since it was never defined anywhere on the dashboard. Series are drawn
   low-to-high so Critical renders on top, the level that matters most. */
const ovTrendSeriesMeta = [
  { key: "low", label: "Low", color: "var(--gray)" },
  { key: "medium", label: "Medium", color: "var(--yellow)" },
  { key: "high", label: "High", color: "var(--orange)" },
  { key: "critical", label: "Critical", color: "var(--red)" },
];

const ovTrendDatasets = {
  "24h": {
    labels: ["12:00 PM", "4:00 PM", "8:00 PM", "12:00 AM", "4:00 AM", "8:00 AM", "12:00 PM"],
    series: { low: [4, 5, 5, 4, 6, 9, 8], medium: [7, 8, 7, 6, 9, 13, 12], high: [11, 13, 12, 10, 15, 22, 20], critical: [8, 12, 10, 6, 14, 24, 20] },
    resolved: 68,
  },
  "7d": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    series: { low: [7, 8, 6, 7, 9, 5, 4], medium: [10, 11, 9, 11, 13, 8, 6], high: [17, 19, 15, 18, 22, 13, 10], critical: [14, 18, 12, 16, 22, 10, 8] },
    resolved: 210,
  },
  "30d": {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
    series: { low: [6, 8, 6, 8, 8], medium: [10, 12, 9, 13, 11], high: [16, 20, 15, 21, 19], critical: [12, 16, 10, 20, 18] },
    resolved: 640,
  },
  "4mo": {
    labels: ["May", "Jun", "Jul", "Aug"],
    series: { low: [8, 7, 9, 8], medium: [11, 10, 13, 12], high: [19, 17, 22, 20], critical: [16, 14, 20, 18] },
    resolved: 1840,
  },
  "1y": {
    labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    series: {
      low: [5, 6, 6, 6, 7, 6, 7, 8, 8, 7, 9, 8],
      medium: [8, 8, 10, 9, 10, 8, 11, 12, 11, 10, 13, 12],
      high: [13, 14, 16, 15, 17, 14, 18, 20, 19, 17, 22, 20],
      critical: [10, 12, 14, 12, 16, 12, 18, 20, 18, 16, 20, 18],
    },
    resolved: 5400,
  },
};

let ovTrendRangeKey = "7d";

document.getElementById("ovTrendLegend").innerHTML = ovTrendSeriesMeta
  .slice()
  .reverse()
  .map((s) => `<span><span class="dot" style="background:${s.color}"></span>${s.label}</span>`)
  .join("");

function renderOvTrendChart() {
  const dataset = ovTrendDatasets[ovTrendRangeKey];
  const labels = dataset.labels;
  const series = ovTrendSeriesMeta.map((meta) => ({ ...meta, values: dataset.series[meta.key] }));

  const container = document.getElementById("ovTrendChart");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 220;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMax = 30;
  const gridStep = 10;

  const xAt = (i) => padL + (plotW * i) / (labels.length - 1);
  const yAt = (v) => padT + plotH - (v / yMax) * plotH;

  const gridLines = [];
  for (let v = 0; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = labels
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 5}" text-anchor="middle" font-size="9.5" fill="#9AA5B1">${m}</text>`)
    .join("");

  const buildArea = (s) => {
    const line = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    return `
      <path d="M ${xAt(0)},${yAt(s.values[0])} L ${line}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${s.values
        .map(
          (v, i) =>
            `<circle class="bo-trend-dot" cx="${xAt(i)}" cy="${yAt(v)}" r="2.6" fill="${s.color}" data-label="${s.label}" data-value="${v}" data-x="${labels[i]}" data-color="${s.color}"/>`
        )
        .join("")}`;
  };

  document.getElementById("ovTrendChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      ${series.map(buildArea).join("")}
      ${xLabels}
    </svg>
    <div class="bo-trend-tooltip" id="ovTrendTooltip"></div>`;

  wireOvTrendTooltips();
}

/* Hover a dot to see its exact severity/value/time -- the area fills were
   removed since overlapping semi-transparent fills across 4 series made the
   chart harder to read than the lines alone. */
function wireOvTrendTooltips() {
  const container = document.getElementById("ovTrendChart");
  const tooltip = document.getElementById("ovTrendTooltip");

  container.querySelectorAll(".bo-trend-dot").forEach((dot) => {
    dot.addEventListener("mouseenter", () => {
      const { label, value, x, color } = dot.dataset;
      tooltip.innerHTML = `<span class="dot" style="background:${color};"></span>${label}: <b>${value}</b> &middot; ${x}`;
      tooltip.style.left = `${dot.getAttribute("cx")}px`;
      tooltip.style.top = `${dot.getAttribute("cy")}px`;
      tooltip.style.display = "block";
      dot.setAttribute("r", "4.5");
    });
    dot.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
      dot.setAttribute("r", "2.6");
    });
  });
}
renderOvTrendChart();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderOvTrendChart);
window.addEventListener("load", renderOvTrendChart);
window.addEventListener("resize", renderOvTrendChart);

/* Footer counts are summed from the same dataset backing the chart above (so a
   5-week "Last 30 days" view reports 5 weeks of totals, not a leftover 24h
   number), and each cell links through to the filtered ticket list as a
   lightweight drill-down. */
function renderOvTrendFooter() {
  const dataset = ovTrendDatasets[ovTrendRangeKey];
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const isSingleDay = ovTrendRangeKey === "24h";

  /* badWhen: the arrow direction that's an unwelcome trend for this metric --
     more Critical/High/Medium/Low is bad news (badWhen "up"), more Resolved
     is good news (badWhen "down"), so the delta color reflects what the
     number *means*, not just which way the arrow points. */
  const footer = [
    { num: sum(dataset.series.critical), label: "Critical", color: "var(--red-text)", delta: 8, dir: "up", badWhen: "up", param: "severity=Critical" },
    { num: sum(dataset.series.high), label: "High", color: "var(--orange-text)", delta: 6, dir: "up", badWhen: "up", param: "severity=High" },
    { num: sum(dataset.series.medium), label: "Medium", color: "var(--yellow-text)", delta: 3, dir: "down", badWhen: "up", param: "severity=Medium" },
    { num: sum(dataset.series.low), label: "Low", color: "var(--gray-text)", delta: 2, dir: "down", badWhen: "up", param: "severity=Low" },
    { num: dataset.resolved, label: "Resolved", color: "var(--green-text)", delta: 15, dir: "up", badWhen: "down", param: "status=Resolved" },
  ];

  document.getElementById("ovTrendFooter").innerHTML = footer
    .map(
      (f) => `
    <a class="bo-mini-stat-cell" href="support.html?tab=incidents&${f.param}">
      <span class="num" style="color:${f.color};">${f.num}</span>
      <span class="lbl">${f.label}</span>
      ${
        isSingleDay
          ? `<span class="delta ${f.dir === f.badWhen ? "bad" : "good"}">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ovDeltaArrow[f.dir]}</svg>
        ${f.delta} vs yesterday
      </span>`
          : ""
      }
    </a>`
    )
    .join("");
}
renderOvTrendFooter();

/* ---------------- Critical Issues (Top 5) ---------------- */
/* Severity uses the same 4-level scale as everywhere else issues/tickets
   appear (Critical/High/Medium/Low), with colors matching the ticket
   severity pills: red/orange/yellow/blue.

   One entry per category in orgHealthData (the same source the donut below
   aggregates), so this list, the donut, and the "Open Issues Requiring
   Action" KPI all describe the same underlying set of issues instead of
   three disconnected numbers. Org/patient counts and "started" times are
   read from the real per-org records rather than invented separately. */
const ovCritIssues = [
  { title: "Compliance drops", desc: "Active-patient compliance falling below threshold", severity: "Critical", started: "2 hrs ago", orgs: 1, patients: 3, color: "var(--red)", category: "Compliance", incidentId: "INC-2026-0044" },
  { title: "Voice engine errors", desc: "High error rate in voice processing", severity: "Critical", started: "20 min ago", orgs: 1, patients: 2, color: "var(--red)", category: "Voice Engine", incidentId: "INC-2026-0043" },
  { title: "Missing run: Billing Calc", desc: "The Billing Calc job did not run yesterday", severity: "High", started: "3 hrs ago", orgs: 2, patients: 3, color: "var(--orange)", category: "System Schedule Engine", incidentId: "INC-2026-0046" },
  { title: "Sensor data delays", desc: "Sensor data delayed or missing", severity: "Medium", started: "6 hrs ago", orgs: 3, patients: 3, color: "var(--yellow)", category: "Sensors", incidentId: "INC-2026-0041" },
  { title: "Patients stuck in Registered", desc: "Patients have been stuck in Registered status longer than expected", severity: "Low", started: "1 day ago", orgs: 1, patients: 1, color: "var(--blue)", category: "Patient (Mobile/Web)", incidentId: "INC-2026-0045" },
];

const ovSeverityPillClass = { Critical: "critical", High: "high", Medium: "medium", Low: "low" };

/* Shows the incident's own title (same field the Incidents list and
   incident-detail.html use) instead of a separately-worded blurb, so the
   row reads as the exact same incident you land on after clicking it. */
function ovIncidentTitle(i) {
  const incident = incidents.find((x) => x.id === i.incidentId);
  return incident ? incident.title : i.title;
}

function renderOvCritIssues(orgId) {
  const listEl = document.getElementById("ovCritIssueList");

  const viewAllLink = document.getElementById("ovCritViewAllLink");
  if (viewAllLink) {
    viewAllLink.href = orgId === "all" ? "support.html?tab=incidents" : `support.html?tab=incidents&q=${encodeURIComponent(orgHealthData[orgId].name)}`;
  }

  const issues =
    orgId === "all"
      ? ovCritIssues
      : ovCritIssues.filter((i) => {
          const cat = orgHealthData[orgId].categories.find((c) => c.label === i.category);
          return cat && cat.count > 0;
        });

  if (!issues.length) {
    listEl.innerHTML = `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">No open issues for this organization.</div>`;
    return;
  }

  listEl.innerHTML = issues
    .map((i) => {
      /* Clicking a Recent Incident row goes straight to that incident's own
         detail page, not the org drill-down -- an incident is a system
         event with its own timeline/impact/resolution, and the org context
         it happened in is one click away from there if needed. */
      const href = `incident-detail.html?id=${encodeURIComponent(i.incidentId)}`;
      return `
    <a class="bo-crit-issue-row" href="${href}">
      <span class="bo-crit-issue-icon" style="background:${i.color};">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${OV_CATEGORY_ICONS[i.category] || OV_CATEGORY_ICONS["System Schedule Engine"]}</svg>
      </span>
      <span class="bo-crit-issue-body">
        <span class="bo-crit-issue-title">${ovIncidentTitle(i)}</span>
        <span class="bo-crit-issue-desc">${i.desc}</span>
        <span class="bo-crit-issue-meta">Started ${i.started} &middot; ${i.orgs} Organization${i.orgs === 1 ? "" : "s"} &middot; ${i.patients} Patients</span>
      </span>
      <span class="bo-crit-issue-right">
        <span class="bo-severity-pill ${ovSeverityPillClass[i.severity]}">${i.severity}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
      </span>
    </a>`;
    })
    .join("");
}

/* ---------------- Incidents by Category (donut) ---------------- */
/* Aggregated from orgHealthData's per-org category breakdowns -- the same
   source ovOpenIssuesCount sums for the KPI row above -- so the donut's
   total always equals "Open Incidents Requiring Action" instead of being a
   separately maintained figure that can drift apart from it. */
/* Mirrors the palette used for the same category names in js/support-dashboard.js
   (supDashCategoryColors) and js/org-health-data.js so a category reads as
   the same color everywhere it appears. */
const OV_CATEGORY_COLORS = {
  Compliance: "var(--purple)",
  "Voice Engine": "var(--orange)",
  Sensors: "var(--yellow)",
  "Patient (Mobile/Web)": "var(--blue)",
  "Clinic Users (Security)": "var(--navy)",
  "System Schedule Engine": "var(--gray)",
};

/* One icon per category, shared everywhere a category shows an icon (Recent
   Incidents rows here, and anywhere else that reads from this map) so the
   same issue type always reads the same glyph instead of an incident-by-
   incident pick. Chosen for what each category actually is, not its
   severity: a clipboard-check for compliance tracking, a mic for the voice
   pipeline, an activity pulse for sensor telemetry, a phone for the
   patient mobile/web app, a shield for clinic-user security, and a
   calendar for the scheduling engine. */
const OV_CATEGORY_ICONS = {
  Compliance: `<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><path d="m9 14 2 2 4-4"/>`,
  "Voice Engine": `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/>`,
  Sensors: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>`,
  "Patient (Mobile/Web)": `<rect x="6" y="2" width="12" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>`,
  "Clinic Users (Security)": `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>`,
  "System Schedule Engine": `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>`,
};

/* Seeded from every category name up front (not just whatever happens to
   appear in orgHealthData) so a category with no open issues right now --
   e.g. Clinic Users (Security), which has no named alarms defined yet --
   still shows up in the donut/legend at 0 instead of silently vanishing. */
const ovCategories = (() => {
  const totals = {};
  Object.keys(OV_CATEGORY_COLORS).forEach((label) => {
    totals[label] = 0;
  });
  Object.values(orgHealthData).forEach((o) => {
    o.categories.forEach((c) => {
      totals[c.label] = (totals[c.label] || 0) + c.count;
    });
  });
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, color: OV_CATEGORY_COLORS[label] || "var(--gray)" }));
})();

const OV_INCIDENT_SEVERITIES = ["Critical", "High", "Medium", "Low"];
const OV_INCIDENT_STATUSES = ["Open", "Investigating", "Monitoring", "Escalated"];

/* Deterministic per-category incident records (severity + status), used only
   to drive the Category/Severity/Status filters above the donut. Each
   category's `count` is split into exactly that many synthetic records, so a
   filtered total always matches the sum of its filtered category counts
   instead of drifting the way a rounded percentage split would. */
function ovCategoryIncidentRecords(label, count) {
  const records = [];
  for (let i = 0; i < count; i++) {
    const seed = ovHash(`${label}#${i}`);
    records.push({
      severity: OV_INCIDENT_SEVERITIES[seed % OV_INCIDENT_SEVERITIES.length],
      status: OV_INCIDENT_STATUSES[(seed >>> 3) % OV_INCIDENT_STATUSES.length],
    });
  }
  return records;
}

function ovFilteredCategoryCount(label, count) {
  if (ovDonutCategoryFilter !== "all" && label !== ovDonutCategoryFilter) return 0;
  if (ovDonutSeverityFilter === "all" && ovDonutStatusFilter === "all") return count;
  return ovCategoryIncidentRecords(label, count).filter(
    (r) =>
      (ovDonutSeverityFilter === "all" || r.severity === ovDonutSeverityFilter) &&
      (ovDonutStatusFilter === "all" || r.status === ovDonutStatusFilter)
  ).length;
}

/* Same deterministic-record approach as the donut filter above, but seeded
   per month too (so each point on the trend line gets its own split rather
   than reusing the donut's single snapshot). */
function ovFilteredTrendMonthCount(label, monthLabel, count) {
  if (ovTrendSeverityFilter === "all" && ovTrendStatusFilter === "all") return count;
  const records = [];
  for (let i = 0; i < count; i++) {
    const seed = ovHash(`${label}#${monthLabel}#${i}`);
    records.push({
      severity: OV_INCIDENT_SEVERITIES[seed % OV_INCIDENT_SEVERITIES.length],
      status: OV_INCIDENT_STATUSES[(seed >>> 3) % OV_INCIDENT_STATUSES.length],
    });
  }
  return records.filter(
    (r) =>
      (ovTrendSeverityFilter === "all" || r.severity === ovTrendSeverityFilter) &&
      (ovTrendStatusFilter === "all" || r.status === ovTrendStatusFilter)
  ).length;
}

/* Category names here are the same list as CATEGORIES in js/support-data.js,
   so a legend row can drill straight into that category's tickets via
   Support's Category filter instead of going through an issue-type lookup. */
function ovCategoryDrilldownHref(label, orgId) {
  const params = new URLSearchParams();
  params.set("category", label);
  if (orgId && orgId !== "all") params.set("q", orgHealthData[orgId].name);
  return `support.html?${params.toString()}`;
}

function renderOvDonut(orgId) {
  const baseCategories = orgId === "all" ? ovCategories : orgHealthData[orgId].categories.filter((c) => c.count > 0);
  const categories = baseCategories
    .filter((c) => ovDonutCategoryFilter === "all" || c.label === ovDonutCategoryFilter)
    .map((c) => ({ ...c, count: ovFilteredCategoryCount(c.label, c.count) }));
  const total = categories.reduce((s, c) => s + c.count, 0);

  if (!total) {
    document.getElementById("ovDonut").style.background = "var(--bg)";
    document.getElementById("ovDonutTotal").textContent = "0";
    document.getElementById("ovDonutLegend").innerHTML = `<div class="bo-empty-state" style="color:var(--gray-text); font-size:13px;">No open issues match these filters.</div>`;
    return;
  }

  let acc = 0;
  const stops = categories
    .map((c) => {
      const from = (acc / total) * 360;
      acc += c.count;
      const to = (acc / total) * 360;
      return `${c.color} ${from}deg ${to}deg`;
    })
    .join(", ");
  document.getElementById("ovDonut").style.background = `conic-gradient(${stops})`;
  document.getElementById("ovDonutTotal").textContent = total;

  document.getElementById("ovDonutLegend").innerHTML = categories
    .map((c) => {
      const pct = Math.round((c.count / total) * 100);
      return `
      <a class="bo-donut-legend-row" href="${ovCategoryDrilldownHref(c.label, orgId)}">
        <span class="dot" style="background:${c.color};"></span>
        <span class="name">${c.label}</span>
        <span class="val">${c.count} (${pct}%)</span>
      </a>`;
    })
    .join("");
}

/* ---------------- Incidents by Category (over time) ----------------
   Monthly incident counts per category for the trailing 12 months, using
   the same category list/colors/order as the donut above so the two views
   agree. Month/year x-axis labels (instead of weekdays) so the trend reads
   as a real over-time chart, not a single-week snapshot. */
const ovCategoryTrendLabels = ["Oct '25", "Nov '25", "Dec '25", "Jan '26", "Feb '26", "Mar '26", "Apr '26", "May '26", "Jun '26", "Jul '26", "Aug '26", "Sep '26"];
const ovCategoryTrendData = {
  "Patient (Mobile/Web)": [42, 38, 55, 60, 58, 72, 68, 80, 76, 92, 88, 104],
  Compliance: [25, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 56],
  "Voice Engine": [12, 15, 14, 18, 16, 20, 19, 24, 22, 28, 26, 32],
  Sensors: [8, 10, 9, 12, 11, 14, 13, 16, 15, 18, 17, 20],
  "System Schedule Engine": [10, 12, 11, 14, 13, 16, 15, 18, 17, 20, 19, 22],
  "Clinic Users (Security)": [0, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 6],
};

document.getElementById("ovCategoryTrendLegend").innerHTML = ovCategories
  .map((c) => `<span><span class="dot" style="background:${c.color}"></span>${c.label}</span>`)
  .join("");

/* Range toggle for this chart only (separate from the header's System
   Health Trend range) -- "Last 6 Months"/"Last 1 Year" show the trailing
   window of the same 12-month dataset; a specific calendar year (e.g.
   "2021") instead generates a deterministic Jan-Dec series per category so
   older years stay browsable without hand-authoring a dataset for each one. */
let ovCategoryTrendRangeKey = "1y";
const OV_CATEGORY_TREND_RANGE_MONTHS = { "6mo": 6, "1y": 12 };
const OV_CATEGORY_TREND_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function ovCategoryYearSeries(label, year) {
  const baseMax = Math.max(10, ...(ovCategoryTrendData[label] || [10]));
  return OV_CATEGORY_TREND_MONTH_NAMES.map((_, m) => {
    const seed = ovHash(`${label}#${year}#${m}`);
    const pct = 0.15 + (seed % 71) / 100; // 0.15-0.85 of this category's current peak
    return Math.round(baseMax * pct);
  });
}

function ovCategoryTrendWindow() {
  const isYear = /^\d{4}$/.test(ovCategoryTrendRangeKey);
  if (isYear) {
    const year = ovCategoryTrendRangeKey;
    const yy = year.slice(2);
    return {
      labels: OV_CATEGORY_TREND_MONTH_NAMES.map((m) => `${m} '${yy}`),
      valuesFor: (label) => ovCategoryYearSeries(label, year),
    };
  }
  const months = OV_CATEGORY_TREND_RANGE_MONTHS[ovCategoryTrendRangeKey] || 12;
  return {
    labels: ovCategoryTrendLabels.slice(-months),
    valuesFor: (label) => (ovCategoryTrendData[label] || ovCategoryTrendLabels.map(() => 0)).slice(-months),
  };
}

/* Catmull-Rom -> cubic Bezier smoothing for a soft curve instead of sharp
   straight-line segments. */
function ovSmoothPath(points) {
  if (points.length < 2) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/* Round a raw max up to a "nice" grid step (1/2/5/10 x a power of ten) that
   yields roughly 4 gridlines, so the y-axis reads in round numbers whether
   the data tops out at 10 or 200 instead of a fixed step that's either too
   fine or too coarse for the current range. */
function ovNiceStep(max) {
  const rough = max / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  const step = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  return step * magnitude;
}

/* Smooth multi-line chart with hollow point markers and a single shared
   hover card (one card lists every category's value for the hovered day,
   plus a highlighted vertical band) instead of a plain per-dot tooltip --
   reads clean even with 6 series, unlike a stacked bar or filled area would. */
function renderOvCategoryTrendChart() {
  const { labels, valuesFor } = ovCategoryTrendWindow();
  const series = ovCategories
    .filter((c) => ovTrendCategoryFilter === "all" || c.label === ovTrendCategoryFilter)
    .map((c) => ({ ...c, values: valuesFor(c.label).map((v, i) => ovFilteredTrendMonthCount(c.label, labels[i], v)) }));

  const container = document.getElementById("ovCategoryTrendChart");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 220;
  const padL = 26;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const rawMax = Math.max(...series.map((s) => Math.max(...s.values)));
  const gridStep = ovNiceStep(rawMax || 1);
  const yMax = Math.max(gridStep, Math.ceil((rawMax || 1) / gridStep) * gridStep);

  const slotW = plotW / labels.length;
  const xAt = (i) => padL + slotW * i + slotW / 2;
  const yAt = (v) => padT + plotH - (v / yMax) * plotH;

  const gridLines = [];
  for (let v = 0; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#F1F3F6" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = labels
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 5}" text-anchor="middle" font-size="9.5" fill="#9AA5B1">${m}</text>`)
    .join("");

  const seriesPoints = series.map((s) => s.values.map((v, i) => ({ x: xAt(i), y: yAt(v) })));

  const bands = labels
    .map(
      (label, i) => `<rect class="ov-cat-band" id="ovCatBand${i}" x="${padL + slotW * i}" y="${padT}" width="${slotW}" height="${plotH}" fill="var(--btn-bg)" opacity="0"/>`
    )
    .join("");

  const lines = series
    .map(
      (s, i) => `
      <path d="${ovSmoothPath(seriesPoints[i])}" fill="none" stroke="${s.color}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round"/>
      ${seriesPoints[i].map((p) => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#fff" stroke="${s.color}" stroke-width="2"/>`).join("")}`
    )
    .join("");

  const hitCols = labels
    .map((label, i) => `<rect class="ov-cat-hitcol" x="${padL + slotW * i}" y="${padT}" width="${slotW}" height="${plotH}" fill="transparent" data-index="${i}"/>`)
    .join("");

  const topYAtIndex = labels.map((_, i) => Math.min(...seriesPoints.map((pts) => pts[i].y)));

  document.getElementById("ovCategoryTrendChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      ${bands}
      ${lines}
      ${xLabels}
      ${hitCols}
    </svg>
    <div class="bo-multitip" id="ovCategoryTrendTooltip"></div>`;

  wireOvCategoryTrendTooltips(series, labels, xAt, topYAtIndex, padT, width);
}

function wireOvCategoryTrendTooltips(series, labels, xAt, topYAtIndex, padT, width) {
  const container = document.getElementById("ovCategoryTrendChart");
  const tooltip = document.getElementById("ovCategoryTrendTooltip");

  container.querySelectorAll(".ov-cat-hitcol").forEach((col) => {
    const i = Number(col.dataset.index);
    col.addEventListener("mouseenter", () => {
      document.getElementById(`ovCatBand${i}`)?.setAttribute("opacity", "0.08");
      tooltip.innerHTML = `
        <div class="bo-multitip-title">${labels[i]}</div>
        ${series
          .map(
            (s) => `<div class="bo-multitip-row"><span class="dot" style="background:${s.color};"></span><span class="name">${s.label}</span><b>${s.values[i]}</b></div>`
          )
          .join("")}`;
      const x = xAt(i);
      const clampedX = Math.min(Math.max(x, 90), width - 90);
      const cardHeight = 26 + series.length * 17;
      tooltip.style.left = `${clampedX}px`;
      tooltip.style.top = `${Math.max(topYAtIndex[i], cardHeight + 14)}px`;
      tooltip.style.display = "block";
    });
    col.addEventListener("mouseleave", () => {
      document.getElementById(`ovCatBand${i}`)?.setAttribute("opacity", "0");
      tooltip.style.display = "none";
    });
  });
}
renderOvCategoryTrendChart();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderOvCategoryTrendChart);
window.addEventListener("load", renderOvCategoryTrendChart);
window.addEventListener("resize", renderOvCategoryTrendChart);

/* ---------------- Affected Organizations ---------------- */
const ovOrgDotColor = { critical: "var(--red)", warning: "var(--orange)", healthy: "var(--green)" };
const ovOrgIssuesPillClass = { critical: "critical", warning: "warning", healthy: "healthy" };

function renderOvOrgList(orgId) {
  const panelTitle = document.getElementById("ovOrgListTitle");
  const listEl = document.getElementById("ovOrgMiniList");

  if (orgId === "all") {
    if (panelTitle) panelTitle.textContent = `Affected Organizations (${ovAffectedOrgCount})`;
    listEl.innerHTML = Object.entries(orgHealthData)
      .sort((a, b) => b[1].openIssues - a[1].openIssues)
      .slice(0, 5)
      .map(
        ([id, o]) => `
    <a class="bo-org-mini-row" href="org-health-dashboard.html?org=${id}">
      <span class="dot" style="background:${ovOrgDotColor[o.severity]};"></span>
      <span class="bo-org-mini-name">${o.name}</span>
      <span class="bo-severity-pill ${ovOrgIssuesPillClass[o.severity]} bo-org-mini-issues">${o.openIssues} issue${o.openIssues === 1 ? "" : "s"}</span>
      <span class="bo-org-mini-patients">${o.patients} patients</span>
    </a>`
      )
      .join("");
    return;
  }

  const o = orgHealthData[orgId];
  if (panelTitle) panelTitle.textContent = "Organization";
  listEl.innerHTML = `
    <a class="bo-org-mini-row" href="org-health-dashboard.html?org=${orgId}">
      <span class="dot" style="background:${ovOrgDotColor[o.severity]};"></span>
      <span class="bo-org-mini-name">${o.name}</span>
      <span class="bo-severity-pill ${ovOrgIssuesPillClass[o.severity]} bo-org-mini-issues">${o.openIssues} issue${o.openIssues === 1 ? "" : "s"}</span>
      <span class="bo-org-mini-patients">${o.patients} patients</span>
    </a>
    <div style="font-size:12px; color:var(--gray-text); padding:6px 4px 2px;">${o.providers} providers &middot; Last incident ${o.lastIncident}</div>`;
}

/* "View all" opens a modal with every affected organization (not just the
   top 5 shown in the mini list), scrollable so the count doesn't push the
   dashboard layout around. */
const ovOrgListModalOverlay = document.getElementById("ovOrgListModalOverlay");
const ovOrgListModalBody = document.getElementById("ovOrgListModalBody");

function openOvOrgListModal() {
  document.getElementById("ovOrgListModalTitle").textContent = `Affected Organizations (${ovAffectedOrgCount})`;
  ovOrgListModalBody.innerHTML = Object.entries(orgHealthData)
    .filter(([, o]) => o.openIssues > 0)
    .sort((a, b) => b[1].openIssues - a[1].openIssues)
    .map(
      ([id, o]) => `
    <a class="bo-org-mini-row" href="org-health-dashboard.html?org=${id}">
      <span class="dot" style="background:${ovOrgDotColor[o.severity]};"></span>
      <span class="bo-org-mini-name">${o.name}</span>
      <span class="bo-severity-pill ${ovOrgIssuesPillClass[o.severity]} bo-org-mini-issues">${o.openIssues} issue${o.openIssues === 1 ? "" : "s"}</span>
      <span class="bo-org-mini-patients">${o.patients} patients</span>
    </a>`
    )
    .join("");
  ovOrgListModalOverlay.classList.add("open");
}

function closeOvOrgListModal() {
  ovOrgListModalOverlay.classList.remove("open");
}

document.getElementById("ovOrgListViewAllBtn").addEventListener("click", openOvOrgListModal);
document.getElementById("ovOrgListModalClose").addEventListener("click", closeOvOrgListModal);
ovOrgListModalOverlay.addEventListener("click", (e) => { if (e.target === ovOrgListModalOverlay) closeOvOrgListModal(); });

/* ---------------- Clinic-level Patient Compliance (monthly trend) ---------------- */
/* Same Compliance / Recording Quality line-chart language used on the
   per-patient Monthly Compliance chart, but scoped to a clinic (or averaged
   across all clinics, weighted by patient count) instead of one patient --
   swapping the org dropdown above re-renders this chart for that clinic. */
const OV_COMPLIANCE_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];

function ovHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

/* Deterministic per-clinic monthly series, centered on that clinic's current
   compliance snapshot (orgHealthData[id].compliance) so the chart's latest
   point stays consistent with the tier donut and KPI figures above it. */
function ovOrgMonthlySeries(id, org) {
  const seed = ovHash(id);
  const qualityBaseline = Math.max(20, org.compliance - 8);
  return OV_COMPLIANCE_MONTHS.map((month, i) => ({
    month,
    compliance: Math.max(20, Math.min(100, Math.round(org.compliance + Math.sin((seed + i) / 2) * 8))),
    quality: Math.max(15, Math.min(100, Math.round(qualityBaseline + Math.cos((seed + i) / 2) * 8))),
  }));
}

function ovMonthlyComplianceFor(orgId) {
  if (orgId !== "all") return ovOrgMonthlySeries(orgId, orgHealthData[orgId]);

  const entries = Object.entries(orgHealthData);
  const totalPatients = entries.reduce((sum, [, o]) => sum + o.patients, 0) || 1;
  const perOrgSeries = entries.map(([id, o]) => ({ weight: o.patients, series: ovOrgMonthlySeries(id, o) }));

  return OV_COMPLIANCE_MONTHS.map((month, i) => {
    const compliance = perOrgSeries.reduce((sum, o) => sum + o.series[i].compliance * o.weight, 0) / totalPatients;
    const quality = perOrgSeries.reduce((sum, o) => sum + o.series[i].quality * o.weight, 0) / totalPatients;
    return { month, compliance: Math.round(compliance), quality: Math.round(quality) };
  });
}

document.getElementById("ovClinicComplianceLegend").innerHTML = [
  { label: "Compliance", color: "#1F3C73" },
  { label: "Recording Quality", color: "#F2994A" },
]
  .map((s) => `<span><span class="dot" style="background:${s.color}"></span>${s.label}</span>`)
  .join("");

function renderOvClinicComplianceChart(orgId) {
  const titleEl = document.getElementById("ovClinicComplianceTitle");
  if (titleEl) titleEl.textContent = orgId === "all" ? "Organization-level Patient Compliance" : `Organization-level Patient Compliance — ${orgHealthData[orgId].name}`;

  const monthly = ovMonthlyComplianceFor(orgId);
  const container = document.getElementById("ovClinicComplianceChart");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 220;
  const padL = 34;
  const padR = 14;
  const padT = 12;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMin = 0;
  const yMax = 100;
  const gridStep = 20;

  const months = monthly.map((m) => m.month);
  const complianceSeries = monthly.map((m) => m.compliance);
  const qualitySeries = monthly.map((m) => m.quality);

  const xAt = (i) => padL + (plotW * i) / (months.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  for (let v = yMin; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#9AA5B1">${v}%</text>`
    );
  }

  const xLabels = months
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 6}" text-anchor="middle" font-size="10.5" fill="#9AA5B1">${m}</text>`)
    .join("");

  const buildLine = (series, color, label) => {
    const line = series.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    const dots = series
      .map(
        (v, i) =>
          `<circle class="bo-trend-dot" cx="${xAt(i)}" cy="${yAt(v)}" r="2.8" fill="${color}" data-label="${label}" data-value="${v}" data-x="${months[i]}" data-color="${color}"/>`
      )
      .join("");
    return `<path d="M ${xAt(0)},${yAt(series[0])} L ${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  };

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      ${buildLine(complianceSeries, "#1F3C73", "Compliance")}
      ${buildLine(qualitySeries, "#F2994A", "Recording Quality")}
      ${xLabels}
    </svg>
    <div class="bo-trend-tooltip" id="ovClinicComplianceTooltip"></div>`;

  wireOvChartTooltips(container, document.getElementById("ovClinicComplianceTooltip"));
}

/* Shared with renderOvTrendChart's tooltip wiring, generalized to take the
   container/tooltip elements so both charts' hover dots behave the same. */
function wireOvChartTooltips(container, tooltip) {
  container.querySelectorAll(".bo-trend-dot").forEach((dot) => {
    dot.addEventListener("mouseenter", () => {
      const { label, value, x, color } = dot.dataset;
      tooltip.innerHTML = `<span class="dot" style="background:${color};"></span>${label}: <b>${value}%</b> &middot; ${x}`;
      tooltip.style.left = `${dot.getAttribute("cx")}px`;
      tooltip.style.top = `${dot.getAttribute("cy")}px`;
      tooltip.style.display = "block";
      dot.setAttribute("r", "4.5");
    });
    dot.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
      dot.setAttribute("r", "2.8");
    });
  });
}

window.addEventListener("resize", () => renderOvClinicComplianceChart(ovSelectedOrgId));
window.addEventListener("resize", () => renderOvDonut(ovSelectedOrgId));

/* ---------------- System Health (per-service status + 30-day uptime) ---------------- */
/* A status-page-style widget (service + status dot + uptime% + daily history
   bars) rather than a load chart -- system health here means "is it up",
   not "how busy is it". Service names mirror the "View Version" avatar-menu
   modal. Voice Engine's current-day status is deliberately "degraded" to
   match the real "Voice engine errors" Critical incident already listed in
   Recent Incidents above (started "20 min ago"), so this panel and that one
   tell the same story instead of two disconnected numbers. Static like the
   Workload chart it replaces -- infra status isn't scoped to one org. */
const OV_UPTIME_STATUS_META = {
  ok: { color: "var(--green)", label: "Operational" },
  degraded: { color: "var(--orange)", label: "Degraded" },
  down: { color: "var(--red)", label: "Outage" },
};

/* Builds a 30-entry day-by-day history ending today. `exceptions` maps a
   days-ago offset (0 = today) to a status, so a service definition only has
   to name what went wrong instead of writing out 30 "ok"s by hand. */
function ovUptimeDays(exceptions) {
  const days = new Array(30).fill("ok");
  Object.entries(exceptions).forEach(([daysAgo, status]) => {
    days[29 - Number(daysAgo)] = status;
  });
  return days;
}

const OV_UPTIME_SERVICES = [
  { name: "Voice Engine", days: ovUptimeDays({ 0: "degraded" }) },
  { name: "ASR", days: ovUptimeDays({}) },
  { name: "API Server", days: ovUptimeDays({ 22: "down" }) },
  { name: "Database", days: ovUptimeDays({}) },
];

/* A "degraded" day counts as half an outage, not a full one, so a single
   rough day doesn't crater the uptime% the way a full outage would. */
function ovUptimePercent(days) {
  const credit = { ok: 1, degraded: 0.5, down: 0 };
  const sum = days.reduce((s, d) => s + credit[d], 0);
  return (sum / days.length) * 100;
}

function renderOvUptimeList() {
  const activeIncidents = OV_UPTIME_SERVICES.filter((s) => s.days[s.days.length - 1] !== "ok").length;
  const summaryEl = document.getElementById("ovUptimeSummary");
  summaryEl.textContent = activeIncidents ? `${activeIncidents} active incident${activeIncidents === 1 ? "" : "s"}` : "All systems operational";
  summaryEl.style.color = activeIncidents ? "var(--orange-text)" : "var(--green-text)";

  document.getElementById("ovUptimeRows").innerHTML = OV_UPTIME_SERVICES.map((s) => {
    const today = s.days[s.days.length - 1];
    const meta = OV_UPTIME_STATUS_META[today];
    const pct = ovUptimePercent(s.days);
    const bars = s.days
      .map((status, i) => {
        const daysAgo = s.days.length - 1 - i;
        const when = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
        return `<span class="bo-uptime-bar" style="background:${OV_UPTIME_STATUS_META[status].color};" data-label="${s.name}" data-status="${OV_UPTIME_STATUS_META[status].label}" data-x="${when}" data-color="${OV_UPTIME_STATUS_META[status].color}"></span>`;
      })
      .join("");

    return `
    <div class="bo-uptime-row">
      <div class="bo-uptime-row-top">
        <span class="bo-uptime-dot" style="background:${meta.color};"></span>
        <span class="bo-uptime-name">${s.name}</span>
        <span class="bo-uptime-status" style="color:${meta.color};">${meta.label}</span>
        <span class="bo-uptime-pct">${pct.toFixed(2)}% uptime</span>
      </div>
      <div class="bo-uptime-bars">${bars}</div>
    </div>`;
  }).join("");

  wireOvUptimeTooltips();
}

/* Same tooltip look as the line charts above (.bo-trend-tooltip), wired to
   the uptime bars instead of chart dots -- hovering a day shows which
   service, which day, and its status that day. */
function wireOvUptimeTooltips() {
  const container = document.getElementById("ovUptimeList");
  const tooltip = document.getElementById("ovUptimeTooltip");

  container.querySelectorAll(".bo-uptime-bar").forEach((bar) => {
    bar.addEventListener("mouseenter", () => {
      const { label, status, x, color } = bar.dataset;
      tooltip.innerHTML = `<span class="dot" style="background:${color};"></span>${label}: <b>${status}</b> &middot; ${x}`;
      tooltip.style.display = "block";

      /* The tooltip is centered on the bar's x position, but for a bar near
         either edge of the 30-day row that centered box runs past the card
         and off the page -- clamp it to the container's own width (now that
         .innerHTML/display are set, tooltip.getBoundingClientRect() reports
         its real rendered size) so it always stays fully visible. */
      const barRect = bar.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const halfW = tooltipRect.width / 2;
      const rawLeft = barRect.left - containerRect.left + barRect.width / 2;
      const left = Math.max(halfW + 4, Math.min(containerRect.width - halfW - 4, rawLeft));

      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${barRect.bottom - containerRect.top}px`;
    });
    bar.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  });
}

renderOvUptimeList();

/* ---------------- Render orchestration (re-run per organization scope) ---------------- */
function renderOvForOrg(orgId) {
  ovSelectedOrgId = orgId;
  renderOvHealthGrid(orgId);
  renderOvCritIssues(orgId);
  renderOvDonut(orgId);
  renderOvOrgList(orgId);
  renderOvClinicComplianceChart(orgId);
}

/* ---------------- Header: organization dropdown ---------------- */
const ovOrgSelect = document.querySelector('.bo-select[data-name="ovOrg"]');
const ovOrgMenu = document.getElementById("ovOrgMenu");
ovOrgMenu.innerHTML += Object.entries(orgHealthData)
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([id, o]) => `<div class="bo-select-option" data-value="${id}">${o.name}</div>`)
  .join("");

ovOrgSelect.querySelector(".bo-select-trigger").addEventListener("click", (e) => {
  e.stopPropagation();
  ovOrgSelect.classList.toggle("open");
});
ovOrgSelect.addEventListener("click", (e) => {
  const option = e.target.closest(".bo-select-option");
  if (!option) return;
  ovOrgSelect.querySelector(".bo-select-value").textContent = option.textContent;
  ovOrgSelect.querySelectorAll(".bo-select-option").forEach((el) => el.classList.remove("selected"));
  option.classList.add("selected");
  ovOrgSelect.classList.remove("open");
  renderOvForOrg(option.dataset.value);
});

renderOvForOrg(ovSelectedOrgId);

/* ---------------- Category/Severity/Status "Filter" dropdown -- shared by
   the Incidents by Category donut and the Incidents Over Time trend chart,
   each with its own filter state and re-render, all defaulting to All. */
function wireOvFilterDropdown({ containerId, triggerId, summaryId, resetId, fields, onChange }) {
  const container = document.getElementById(containerId);
  const summary = document.getElementById(summaryId);
  const selects = fields.map((field) => {
    const select = document.getElementById(field.selectId);
    select.innerHTML =
      `<option value="all">All ${field.label.toLowerCase()}s</option>` +
      field.options.map((opt) => `<option value="${opt}">${opt}</option>`).join("");
    select.addEventListener("change", () => {
      field.setter(select.value);
      updateSummary();
      onChange();
    });
    return { select, ...field };
  });

  function updateSummary() {
    const activeCount = selects.filter((f) => f.select.value !== "all").length;
    summary.textContent = activeCount ? `Filter (${activeCount})` : "Filter";
  }

  document.getElementById(triggerId).addEventListener("click", (e) => {
    e.stopPropagation();
    container.classList.toggle("open");
  });
  document.addEventListener("click", (e) => {
    if (container.classList.contains("open") && !e.target.closest(`#${containerId}`)) {
      container.classList.remove("open");
    }
  });
  document.getElementById(resetId).addEventListener("click", () => {
    selects.forEach((f) => {
      f.select.value = "all";
      f.setter("all");
    });
    updateSummary();
    onChange();
    container.classList.remove("open");
  });
}

wireOvFilterDropdown({
  containerId: "ovCatFilter",
  triggerId: "ovCatFilterTrigger",
  summaryId: "ovCatFilterSummary",
  resetId: "ovCatFilterReset",
  fields: [
    { selectId: "ovCatFilterCategorySelect", label: "Category", options: CATEGORIES, setter: (v) => (ovDonutCategoryFilter = v) },
    { selectId: "ovCatFilterSeveritySelect", label: "Severity", options: OV_INCIDENT_SEVERITIES, setter: (v) => (ovDonutSeverityFilter = v) },
    { selectId: "ovCatFilterStatusSelect", label: "Status", options: OV_INCIDENT_STATUSES, setter: (v) => (ovDonutStatusFilter = v) },
  ],
  onChange: () => renderOvDonut(ovSelectedOrgId),
});

wireOvFilterDropdown({
  containerId: "ovTrendFilter",
  triggerId: "ovTrendFilterTrigger",
  summaryId: "ovTrendFilterSummary",
  resetId: "ovTrendFilterReset",
  fields: [
    { selectId: "ovTrendFilterCategorySelect", label: "Category", options: CATEGORIES, setter: (v) => (ovTrendCategoryFilter = v) },
    { selectId: "ovTrendFilterSeveritySelect", label: "Severity", options: OV_INCIDENT_SEVERITIES, setter: (v) => (ovTrendSeverityFilter = v) },
    { selectId: "ovTrendFilterStatusSelect", label: "Status", options: OV_INCIDENT_STATUSES, setter: (v) => (ovTrendStatusFilter = v) },
  ],
  onChange: () => renderOvCategoryTrendChart(),
});

/* ---------------- Header: range dropdown + refresh + footer timestamp ---------------- */
const ovRangeSelect = document.querySelector('.bo-select[data-name="ovRange"]');
ovRangeSelect.querySelector(".bo-select-trigger").addEventListener("click", (e) => {
  e.stopPropagation();
  ovRangeSelect.classList.toggle("open");
});
ovRangeSelect.addEventListener("click", (e) => {
  const option = e.target.closest(".bo-select-option");
  if (!option) return;
  ovRangeSelect.querySelector(".bo-select-value").textContent = option.textContent;
  ovRangeSelect.classList.remove("open");

  if (ovTrendDatasets[option.dataset.value]) {
    ovTrendRangeKey = option.dataset.value;
    renderOvTrendChart();
    renderOvTrendFooter();
  }
});
/* ---------------- Incidents by Category Over Time: range dropdown ---------------- */
const ovCategoryTrendRangeSelect = document.querySelector('.bo-select[data-name="ovCategoryTrendRange"]');
/* Trailing 6mo/1y options stay above a divider, followed by a plain list of
   calendar years (current year back a handful of years) so an older year
   is one click away instead of only ever showing the trailing window. */
const ovCurrentYear = new Date("2026-09-09").getFullYear();
const ovTrendRangeMenu = ovCategoryTrendRangeSelect.querySelector(".bo-select-menu");
ovTrendRangeMenu.insertAdjacentHTML(
  "beforeend",
  `<div class="bo-select-divider"></div>` +
    Array.from({ length: 6 }, (_, i) => ovCurrentYear - i)
      .map((year) => `<div class="bo-select-option" data-value="${year}">${year}</div>`)
      .join("")
);
ovCategoryTrendRangeSelect.querySelector(".bo-select-trigger").addEventListener("click", (e) => {
  e.stopPropagation();
  ovCategoryTrendRangeSelect.classList.toggle("open");
});
ovCategoryTrendRangeSelect.addEventListener("click", (e) => {
  const option = e.target.closest(".bo-select-option");
  if (!option) return;
  ovCategoryTrendRangeSelect.querySelector(".bo-select-value").textContent = option.textContent;
  ovCategoryTrendRangeSelect.querySelectorAll(".bo-select-option").forEach((el) => el.classList.remove("selected"));
  option.classList.add("selected");
  ovCategoryTrendRangeSelect.classList.remove("open");
  ovCategoryTrendRangeKey = option.dataset.value;
  renderOvCategoryTrendChart();
});

document.addEventListener("click", () => {
  ovRangeSelect.classList.remove("open");
  ovOrgSelect.classList.remove("open");
  ovCategoryTrendRangeSelect.classList.remove("open");
});

document.getElementById("ovRefreshBtn").addEventListener("click", () => {
  renderOvTrendChart();
  renderOvTrendFooter();
  renderOvForOrg(ovSelectedOrgId);
});
