/* ---------------- Base data (baseline = "All Organizations") ---------------- */
const boStatsBase = [
  { key: "total", num: 92, label: "Total", color: "var(--navy)", icon: `<path d="M3 3v18h18"/><path d="M18 9l-5 5-4-4-4 4"/>` },
  { key: "registered", num: 42, label: "Registered", color: "var(--blue)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>` },
  { key: "baseline", num: 6, label: "Baseline", color: "var(--navy)", icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` },
  { key: "active", num: 30, label: "Active", color: "var(--green)", icon: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>` },
  { key: "priority", num: 4, label: "Priority", color: "var(--red)", icon: `<path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/>` },
  { key: "discontinued", num: 3, label: "Discontinued", color: "var(--orange)", icon: `<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>` },
  { key: "insufficient", num: 5, label: "Insufficient", color: "var(--orange)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/>` },
  { key: "onhold", num: 2, label: "On Hold", color: "var(--gray)", icon: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>` },
];

const statusChangeBase = [
  { username: "10000", status: "Registered", date: "03.12.25" },
  { username: "0222", status: "Priority", date: "18.11.25" },
  { username: "7777", status: "Insufficient", date: "28.12.25" },
  { username: "0790", status: "Insufficient", date: "28.12.25" },
  { username: "0780", status: "Registered", date: "28.12.25" },
];

const errorMessageBase = [
  { username: "0219", message: "Mobile data disabled", date: "13.08.26" },
  { username: "0219", message: "Mobile data disabled", date: "04.08.26" },
  { username: "0311", message: "Low quality", date: "04.08.26" },
  { username: "7777", message: "Mobile data disabled", date: "03.08.26" },
  { username: "0790", message: "Notification off", date: "02.08.26" },
  { username: "0044", message: "Mobile data disabled", date: "01.08.26" },
];

const chartMonths = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const complianceSeriesBase = [58, 60, 62, 59, 61, 63, 65, 62, 60, 61];
const usableSeriesBase = [52, 55, 57, 54, 56, 58, 60, 57, 55, 56];

const binDefs = [
  { key: "90-100", label: "90%-100%", color: "var(--navy)" },
  { key: "80-90", label: "80%-90%", color: "var(--blue)" },
  { key: "70-80", label: "70%-80%", color: "var(--cyan)" },
  { key: "60-70", label: "60%-70%", color: "var(--orange)" },
  { key: "lt60", label: "Less than 60%", color: "var(--red)" },
];

const binDataBase = {
  usable: { "90-100": 3, "80-90": 6, "70-80": 9, "60-70": 12, lt60: 21 },
  compliance: { "90-100": 5, "80-90": 8, "70-80": 11, "60-70": 14, lt60: 24 },
};

let activeBinsTab = "usable";
let complianceSeries = complianceSeriesBase;
let usableSeries = usableSeriesBase;
let binData = binDataBase;

/* ---------------- KPI row ---------------- */
function renderStats(org, seed) {
  document.getElementById("boStatGrid").innerHTML = boStatsBase
    .map((s) => {
      const num = mktScale(s.num, seed + s.key.length, 0.4);
      return `
      <div class="bo-stat-card">
        <span class="bo-stat-icon" style="background:${s.color};">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
        </span>
        <span>
          <span class="bo-stat-num">${num}</span>
          <span class="bo-stat-label">${s.label}</span>
        </span>
      </div>`;
    })
    .join("");
}

/* ---------------- Status Change / Error Message ---------------- */
function renderTables(org) {
  document.getElementById("statusChangeRows").innerHTML = statusChangeBase
    .map((r) => `<tr><td>${org.code}-${r.username}</td><td><span class="bo-status-pill ${r.status.toLowerCase()}">${r.status}</span></td><td>${r.date}</td></tr>`)
    .join("");

  document.getElementById("errorMessageRows").innerHTML = errorMessageBase
    .map((r) => `<tr><td>${org.code}-${r.username}</td><td>${r.message}</td><td>${r.date}</td></tr>`)
    .join("");
}

/* ---------------- Monthly Compliance chart ---------------- */
function average(series) {
  return Math.round(series.reduce((a, b) => a + b, 0) / series.length);
}

function renderChartStats() {
  const complianceDelta = complianceSeries[complianceSeries.length - 1] - complianceSeries[0];
  const usableDelta = usableSeries[usableSeries.length - 1] - usableSeries[0];
  const trendChip = (delta) => {
    if (delta === 0) {
      return `<span class="bo-trend-chip flat">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/></svg>0pt</span>`;
    }
    const up = delta > 0;
    return `<span class="bo-trend-chip ${up ? "up" : "down"}">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${
        up ? '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>' : '<path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>'
      }</svg>${Math.abs(delta)}pt</span>`;
  };

  document.getElementById("chartStats").innerHTML = `
    <div class="bo-chart-stat">
      <span class="dot" style="background:var(--navy)"></span>
      Compliance avg <b>${average(complianceSeries)}%</b>
      ${trendChip(complianceDelta)}
    </div>
    <div class="bo-chart-stat">
      <span class="dot" style="background:var(--orange)"></span>
      Usable avg <b>${average(usableSeries)}%</b>
      ${trendChip(usableDelta)}
    </div>`;
}

function renderAreaChart() {
  const container = document.getElementById("complianceArea");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 240;
  const padL = 34;
  const padR = 16;
  const padT = 14;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMin = 30;
  const yMax = 85;
  const gridStep = 10;

  const xAt = (i) => padL + (plotW * i) / (chartMonths.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  for (let v = Math.ceil(yMin / gridStep) * gridStep; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = chartMonths
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 6}" text-anchor="middle" font-size="11" fill="#9AA5B1">${m}</text>`)
    .join("");

  const buildArea = (series, color, gradId) => {
    const line = series.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    const areaPath = `M ${xAt(0)},${yAt(series[0])} L ${line} L ${xAt(series.length - 1)},${padT + plotH} L ${xAt(0)},${padT + plotH} Z`;
    const dots = series.map((v, i) => `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="3.2" fill="${color}"/>`).join("");
    const lastX = xAt(series.length - 1);
    const lastY = yAt(series[series.length - 1]);
    const badgeW = 30;
    const badgeX = Math.min(lastX + 8, width - padR - badgeW);
    const badge = `
      <g>
        <rect x="${badgeX}" y="${lastY - 10}" width="${badgeW}" height="20" rx="10" fill="${color}"/>
        <text x="${badgeX + badgeW / 2}" y="${lastY + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${series[series.length - 1]}%</text>
      </g>`;
    return `
      <path d="${areaPath}" fill="url(#${gradId})"/>
      <path d="M ${xAt(0)},${yAt(series[0])} L ${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
      ${badge}`;
  };

  document.getElementById("complianceArea").innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id="gradNavy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1F3C73" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#1F3C73" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#F2994A" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#F2994A" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridLines.join("")}
      ${buildArea(complianceSeries, "#1F3C73", "gradNavy")}
      ${buildArea(usableSeries, "#F2994A", "gradOrange")}
      ${xLabels}
    </svg>`;
}

/* ---------------- Compliance bins (tabs) ---------------- */
function renderBins(tab) {
  activeBinsTab = tab;
  const data = binData[tab];
  const maxVal = Math.max(...Object.values(data));
  const order = [binDefs[0], binDefs[3], binDefs[1], binDefs[4], binDefs[2]];
  document.getElementById("binsGrid").innerHTML = order
    .map((b) => {
      const val = data[b.key];
      const pct = maxVal ? Math.round((val / maxVal) * 100) : 0;
      return `
        <div class="bo-bin">
          <div class="bo-bin-bar-track"><div class="bo-bin-bar-fill" style="width:${pct}%; background:${b.color};"></div></div>
          <span class="bo-bin-label"><b>${val}</b>${b.label}</span>
        </div>`;
    })
    .join("");
}

document.getElementById("binsToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.getElementById("binsToggle").querySelectorAll(".bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderBins(btn.dataset.tab);
});

/* ---------------- "Did not record" mini stat ---------------- */
function renderDnr(seed) {
  document.getElementById("dnrCount").textContent = mktScale(180, seed, 0.35);
}

/* ---------------- Wire everything to the organization selector ---------------- */
function renderForOrg(orgId) {
  const org = MKT_ORG_LIST.find((o) => o.id === orgId) || MKT_ORG_LIST[0];
  const seed = org.id === "all" ? 0 : mktHash(org.id);

  renderStats(org, seed);
  renderTables(org);

  complianceSeries = complianceSeriesBase.map((v, i) => mktScale(v, seed + i, 0.25));
  usableSeries = usableSeriesBase.map((v, i) => mktScale(v, seed + i + 7, 0.25));
  renderChartStats();
  renderAreaChart();

  binData = {
    usable: Object.fromEntries(Object.entries(binDataBase.usable).map(([k, v]) => [k, mktScale(v, seed + k.length, 0.5)])),
    compliance: Object.fromEntries(Object.entries(binDataBase.compliance).map(([k, v]) => [k, mktScale(v, seed + k.length + 3, 0.5)])),
  };
  renderBins(activeBinsTab);

  renderDnr(seed + 11);
}

mktRenderOrgSelect("mktSummaryOrgSelect", renderForOrg);
renderForOrg("all");

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => renderAreaChart());
}
window.addEventListener("load", () => renderAreaChart());
window.addEventListener("resize", () => renderAreaChart());
