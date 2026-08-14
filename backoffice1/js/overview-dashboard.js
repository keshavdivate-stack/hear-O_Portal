/* ---------------- Organization scope (All Organizations vs single org) ---------------- */
let ovSelectedOrgId = "all";

/* ---------------- KPI row (System Health Summary) ---------------- */
const ovAllOrgsHealthStats = [
  { num: Object.keys(orgHealthData).length, label: "Total Organizations", color: "var(--navy)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/><path d="M10 21v-3a2 2 0 0 1 4 0v3"/>`, delta: 0, deltaDir: "flat" },
  { num: 3, label: "Critical Issues", color: "var(--red)", icon: `<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>`, delta: 2, deltaDir: "up" },
  { num: 8, label: "Warnings", color: "var(--orange)", icon: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`, delta: 3, deltaDir: "up" },
  { num: 4, label: "Organizations Affected", color: "var(--blue)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>`, delta: 1, deltaDir: "up" },
  { num: 68, label: "Patients Affected", color: "var(--purple)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, delta: 23, deltaDir: "up" },
  { num: 11, label: "Issues Requiring Action", color: "var(--green)", icon: `<path d="M4 12L9 17L20 6"/>`, delta: 2, deltaDir: "down" },
  { num: 0, label: "On Hold", color: "var(--gray)", icon: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`, delta: 0, deltaDir: "flat" },
];

const ovDeltaArrow = { up: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>`, down: `<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>`, flat: `<path d="M5 12h14"/>` };
const ovDeltaText = (s) => (s.deltaDir === "flat" ? "No change" : `${s.delta} vs yesterday`);
const ovDeltaColor = (s) => (s.deltaDir === "flat" ? "var(--gray-text)" : s.deltaDir === "up" ? "var(--red)" : "var(--green)");

function ovHealthStatsFor(orgId) {
  if (orgId === "all") return ovAllOrgsHealthStats;
  const o = orgHealthData[orgId];
  const warnings = Math.max(o.openIssues - o.criticalIssues, 0);
  return [
    { num: 1, label: "Organization", color: "var(--navy)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/><path d="M9 16h1"/><path d="M14 16h1"/><path d="M10 21v-3a2 2 0 0 1 4 0v3"/>`, delta: 0, deltaDir: "flat" },
    { num: o.criticalIssues, label: "Critical Issues", color: "var(--red)", icon: `<circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/>`, delta: 0, deltaDir: "flat" },
    { num: warnings, label: "Warnings", color: "var(--orange)", icon: `<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>`, delta: 0, deltaDir: "flat" },
    { num: o.providers, label: "Providers", color: "var(--blue)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>`, delta: 0, deltaDir: "flat" },
    { num: o.patientsAffected.length, label: "Patients Affected", color: "var(--purple)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`, delta: 0, deltaDir: "flat" },
    { num: o.openIssues, label: "Issues Requiring Action", color: "var(--green)", icon: `<path d="M4 12L9 17L20 6"/>`, delta: 0, deltaDir: "flat" },
    { num: 0, label: "On Hold", color: "var(--gray)", icon: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>`, delta: 0, deltaDir: "flat" },
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
const ovTrendLabels = ["12:00 PM", "4:00 PM", "8:00 PM", "12:00 AM", "4:00 AM", "8:00 AM", "12:00 PM"];
const ovTrendSeries = [
  { key: "info", label: "Information", color: "#2AA9E0", values: [38, 42, 40, 36, 44, 62, 58] },
  { key: "warning", label: "Warning", color: "#F2994A", values: [22, 26, 24, 20, 30, 44, 40] },
  { key: "critical", label: "Critical", color: "#F16C6C", values: [8, 12, 10, 6, 14, 24, 20] },
];

document.getElementById("ovTrendLegend").innerHTML = ovTrendSeries
  .slice()
  .reverse()
  .map((s) => `<span><span class="dot" style="background:${s.color}"></span>${s.label}</span>`)
  .join("");

function renderOvTrendChart() {
  const container = document.getElementById("ovTrendChart");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 220;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMax = 90;
  const gridStep = 20;

  const xAt = (i) => padL + (plotW * i) / (ovTrendLabels.length - 1);
  const yAt = (v) => padT + plotH - (v / yMax) * plotH;

  const gridLines = [];
  for (let v = 0; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = ovTrendLabels
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 5}" text-anchor="middle" font-size="9.5" fill="#9AA5B1">${m}</text>`)
    .join("");

  const buildArea = (series) => {
    const line = series.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    const areaPath = `M ${xAt(0)},${yAt(series.values[0])} L ${line} L ${xAt(series.values.length - 1)},${padT + plotH} L ${xAt(0)},${padT + plotH} Z`;
    return `
      <path d="${areaPath}" fill="${series.color}" opacity="0.28"/>
      <path d="M ${xAt(0)},${yAt(series.values[0])} L ${line}" fill="none" stroke="${series.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${series.values.map((v, i) => `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="2.6" fill="${series.color}"/>`).join("")}`;
  };

  document.getElementById("ovTrendChart").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      ${ovTrendSeries.map(buildArea).join("")}
      ${xLabels}
    </svg>`;
}
renderOvTrendChart();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderOvTrendChart);
window.addEventListener("load", renderOvTrendChart);
window.addEventListener("resize", renderOvTrendChart);

const ovTrendFooter = [
  { num: 21, label: "Critical Issues", color: "var(--red)", delta: 8, dir: "up" },
  { num: 45, label: "Warnings", color: "var(--orange)", delta: 12, dir: "up" },
  { num: 102, label: "Informational", color: "var(--blue)", delta: 5, dir: "down" },
  { num: 68, label: "Resolved", color: "var(--green)", delta: 15, dir: "up" },
];

document.getElementById("ovTrendFooter").innerHTML = ovTrendFooter
  .map(
    (f) => `
    <div class="bo-mini-stat-cell">
      <span class="num" style="color:${f.color};">${f.num}</span>
      <span class="lbl">${f.label}</span>
      <span class="delta ${f.dir}">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ovDeltaArrow[f.dir]}</svg>
        ${f.delta} vs yesterday
      </span>
    </div>`
  )
  .join("");

/* ---------------- Critical Issues (Top 5) ---------------- */
const ovCritIssues = [
  { title: "Recording failures", desc: "Recordings not received from devices", severity: "Critical", started: "42 min ago", orgs: 3, patients: 18, color: "var(--red)", category: "Recording", icon: `<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0"/><path d="M12 19v3"/>` },
  { title: "Upload failures", desc: "Recordings failing to upload to server", severity: "Critical", started: "2 hrs ago", orgs: 2, patients: 7, color: "var(--red)", category: "Upload", icon: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>` },
  { title: "Voice engine errors", desc: "High error rate in voice processing", severity: "High", started: "3 hrs ago", orgs: 1, patients: 5, color: "var(--orange)", category: "Voice Engine", icon: `<path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>` },
  { title: "Device connectivity issues", desc: "Devices not connecting or syncing", severity: "High", started: "5 hrs ago", orgs: 2, patients: 9, color: "var(--orange)", category: "Device / System", icon: `<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>` },
  { title: "Sensor data delays", desc: "Sensor data delayed or missing", severity: "Medium", started: "6 hrs ago", orgs: 1, patients: 4, color: "#F2C94C", category: "Sensors", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>` },
];

const ovSeverityPillClass = { Critical: "critical", High: "warning", Medium: "info" };

/* Route each issue to the organization currently most affected by that
   category, so clicking an issue drops the user straight into the
   relevant org instead of a generic default. */
function topOrgForCategory(category) {
  let bestId = null;
  let bestCount = -1;
  Object.entries(orgHealthData).forEach(([id, o]) => {
    const cat = o.categories.find((c) => c.label === category);
    if (cat && cat.count > bestCount) {
      bestCount = cat.count;
      bestId = id;
    }
  });
  return bestId;
}

function renderOvCritIssues(orgId) {
  const listEl = document.getElementById("ovCritIssueList");
  const issues =
    orgId === "all"
      ? ovCritIssues
      : ovCritIssues.filter((i) => {
          const cat = orgHealthData[orgId].categories.find((c) => c.label === i.category);
          return cat && cat.count > 0;
        });

  if (!issues.length) {
    listEl.innerHTML = `<div class="bo-empty-state" style="padding:24px 4px; color:var(--gray-text); font-size:13px;">No critical issues for this organization.</div>`;
    return;
  }

  listEl.innerHTML = issues
    .map((i) => {
      const targetOrgId = orgId === "all" ? topOrgForCategory(i.category) : orgId;
      const href = `org-health-dashboard.html?issue=${encodeURIComponent(i.category)}${targetOrgId ? `&org=${targetOrgId}` : ""}`;
      return `
    <a class="bo-crit-issue-row" href="${href}">
      <span class="bo-crit-issue-icon" style="background:${i.color};">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${i.icon}</svg>
      </span>
      <span class="bo-crit-issue-body">
        <span class="bo-crit-issue-title">${i.title}</span>
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

/* ---------------- Issues by Category (donut) ---------------- */
const ovCategories = [
  { label: "Recording", count: 18, color: "var(--red)" },
  { label: "Voice Engine", count: 14, color: "var(--orange)" },
  { label: "Sensors", count: 12, color: "#F2C94C" },
  { label: "Upload", count: 9, color: "var(--green)" },
  { label: "Device", count: 8, color: "var(--blue)" },
  { label: "Compliance", count: 6, color: "var(--purple)" },
  { label: "Other", count: 12, color: "var(--gray)" },
];

function renderOvDonut(orgId) {
  const categories = orgId === "all" ? ovCategories : orgHealthData[orgId].categories.filter((c) => c.count > 0);
  const total = categories.reduce((s, c) => s + c.count, 0);

  if (!total) {
    document.getElementById("ovDonut").style.background = "var(--bg)";
    document.getElementById("ovDonutTotal").textContent = "0";
    document.getElementById("ovDonutLegend").innerHTML = `<div class="bo-empty-state" style="color:var(--gray-text); font-size:13px;">No open issues.</div>`;
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
      <div class="bo-donut-legend-row">
        <span class="dot" style="background:${c.color};"></span>
        <span class="name">${c.label}</span>
        <span class="val">${c.count} (${pct}%)</span>
      </div>`;
    })
    .join("");
}

/* ---------------- Affected Organizations ---------------- */
const ovOrgDotColor = { critical: "var(--red)", warning: "var(--orange)", healthy: "var(--green)" };
const ovOrgIssuesPillClass = { critical: "critical", warning: "warning", healthy: "healthy" };

function renderOvOrgList(orgId) {
  const panelTitle = document.getElementById("ovOrgListTitle");
  const listEl = document.getElementById("ovOrgMiniList");

  if (orgId === "all") {
    if (panelTitle) panelTitle.textContent = "Affected Organizations";
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

/* ---------------- System Health gauge ---------------- */
const ovSeverityGaugeScore = { critical: 38, warning: 64, healthy: 91 };

function renderOvGauge(orgId) {
  const score = orgId === "all" ? 72 : ovSeverityGaugeScore[orgHealthData[orgId].severity];
  const angle = -90 + (score / 100) * 180;
  document.getElementById("ovGaugeNeedle").style.transform = `translateX(-50%) rotate(${angle}deg)`;
  document.getElementById("ovGaugeScore").textContent = score;
  const label = score >= 80 ? "Healthy" : score >= 50 ? "Needs Attention" : "Critical";
  const color = score >= 80 ? "var(--green)" : score >= 50 ? "var(--orange)" : "var(--red)";
  const labelEl = document.getElementById("ovGaugeLabel");
  labelEl.textContent = label;
  labelEl.style.color = color;
}

/* ---------------- Render orchestration (re-run per organization scope) ---------------- */
function renderOvForOrg(orgId) {
  ovSelectedOrgId = orgId;
  renderOvHealthGrid(orgId);
  renderOvCritIssues(orgId);
  renderOvDonut(orgId);
  renderOvOrgList(orgId);
  renderOvGauge(orgId);
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
});
document.addEventListener("click", () => {
  ovRangeSelect.classList.remove("open");
  ovOrgSelect.classList.remove("open");
});

function stampLastUpdated() {
  document.getElementById("ovLastUpdated").textContent = "Just now";
}
stampLastUpdated();

document.getElementById("ovRefreshBtn").addEventListener("click", () => {
  renderOvTrendChart();
  renderOvForOrg(ovSelectedOrgId);
  stampLastUpdated();
});
