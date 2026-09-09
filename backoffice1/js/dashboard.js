/* ---------------- KPI row ---------------- */
const boStats = [
  { num: 134, label: "Registered", color: "var(--blue)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>` },
  { num: 5, label: "Baseline", color: "var(--navy)", icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` },
  { num: 118, label: "Active", color: "var(--green)", icon: `<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>` },
  { num: 3, label: "Priority", color: "var(--red)", icon: `<path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/>` },
  { num: 5, label: "Unmonitored", color: "var(--cyan)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>` },
  { num: 1, label: "Paused", color: "var(--gray)", icon: `<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>` },
  { num: 2, label: "Discontinued", color: "var(--orange)", icon: `<circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/>` },
];

document.getElementById("boTotalPatients").textContent = boStats.reduce((s, d) => s + d.num, 0);

document.getElementById("boStatGrid").innerHTML = boStats
  .map(
    (s) => `
    <div class="bo-stat-card">
      <span class="bo-stat-icon" style="background:${s.color};">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </span>
      <span>
        <span class="bo-stat-num">${s.num}</span>
        <span class="bo-stat-label">${s.label}</span>
      </span>
    </div>`
  )
  .join("");

/* ---------------- Status Change / Error Message ---------------- */
const statusChangeData = [
  { username: "ABC-0044", status: "Priority", date: "14.01.28" },
  { username: "ABC-0011", status: "Unmonitored", date: "14.01.28" },
  { username: "ABC-0023", status: "Paused", date: "12.01.28" },
  { username: "ABC-0012", status: "Priority", date: "12.01.28" },
  { username: "ABC-0031", status: "Active", date: "11.01.28" },
  { username: "ABC-0009", status: "Registered", date: "11.01.28" },
  { username: "ABC-0027", status: "Priority", date: "10.01.28" },
  { username: "ABC-0018", status: "Baseline", date: "10.01.28" },
  { username: "ABC-0052", status: "Unmonitored", date: "09.01.28" },
  { username: "ABC-0006", status: "Paused", date: "08.01.28" },
  { username: "ABC-0041", status: "Active", date: "08.01.28" },
  { username: "ABC-0015", status: "Priority", date: "07.01.28" },
];

const errorMessageData = [
  { username: "ABC-0044", message: "Low quality", date: "14.01.28" },
  { username: "ABC-0011", message: "Notification off", date: "14.01.28" },
  { username: "ABC-0023", message: "Uploading error", date: "12.01.28" },
  { username: "ABC-0012", message: "Notification off", date: "12.01.28" },
  { username: "ABC-0031", message: "Low quality", date: "11.01.28" },
  { username: "ABC-0009", message: "Uploading error", date: "11.01.28" },
  { username: "ABC-0027", message: "Notification off", date: "10.01.28" },
  { username: "ABC-0018", message: "Low quality", date: "10.01.28" },
  { username: "ABC-0052", message: "Device disconnected", date: "09.01.28" },
  { username: "ABC-0006", message: "Uploading error", date: "08.01.28" },
  { username: "ABC-0041", message: "Notification off", date: "08.01.28" },
  { username: "ABC-0015", message: "Low quality", date: "07.01.28" },
];

document.getElementById("statusChangeRows").innerHTML = statusChangeData
  .map((r) => `<tr><td>${r.username}</td><td><span class="bo-status-pill ${r.status.toLowerCase()}">${r.status}</span></td><td>${r.date}</td></tr>`)
  .join("");

document.getElementById("errorMessageRows").innerHTML = errorMessageData
  .map((r) => `<tr><td>${r.username}</td><td>${r.message}</td><td>${r.date}</td></tr>`)
  .join("");

/* ---------------- Monthly Compliance chart ---------------- */
const chartMonths = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const complianceSeries = [83, 82, 84, 83, 85, 83, 86, 84, 82, 83];
const qualitySeries = [78, 74, 77, 76, 79, 76, 80, 78, 76, 77];

function average(series) {
  return Math.round(series.reduce((a, b) => a + b, 0) / series.length);
}

function renderChartStats() {
  const complianceDelta = complianceSeries[complianceSeries.length - 1] - complianceSeries[0];
  const qualityDelta = qualitySeries[qualitySeries.length - 1] - qualitySeries[0];
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
      Recording Quality avg <b>${average(qualitySeries)}%</b>
      ${trendChip(qualityDelta)}
    </div>`;
}
renderChartStats();

let lastChartMode = "both";

function renderAreaChart(mode) {
  lastChartMode = mode = mode || lastChartMode;
  const container = document.getElementById("complianceArea");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 240;
  const padL = 34;
  const padR = 16;
  const padT = 14;
  const padB = 24;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMin = 60;
  const yMax = 95;
  const gridStep = 10;

  const xAt = (i) => padL + (plotW * i) / (chartMonths.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  for (let v = 60; v <= yMax; v += gridStep) {
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

  const parts = [];
  if (mode !== "quality") parts.push(buildArea(complianceSeries, "#1F3C73", "gradNavy"));
  if (mode !== "compliance") parts.push(buildArea(qualitySeries, "#F2994A", "gradOrange"));

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
      ${parts.join("")}
      ${xLabels}
    </svg>`;
}
renderAreaChart("both");

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => renderAreaChart());
}
window.addEventListener("load", () => renderAreaChart());
window.addEventListener("resize", () => renderAreaChart());

/* ---------------- Compliance bins (tabs) ---------------- */
const binDefs = [
  { key: "90-100", label: "90%-100%", color: "var(--navy)" },
  { key: "80-90", label: "80%-90%", color: "var(--blue)" },
  { key: "70-80", label: "70%-80%", color: "var(--cyan)" },
  { key: "60-70", label: "60%-70%", color: "var(--orange)" },
  { key: "lt60", label: "Less than 60%", color: "var(--red)" },
];

const binData = {
  quality: { "90-100": 25, "80-90": 8, "70-80": 2, "60-70": 9, lt60: 3 },
  compliance: { "90-100": 30, "80-90": 6, "70-80": 1, "60-70": 7, lt60: 2 },
};

function renderBins(tab) {
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
renderBins("quality");

document.getElementById("binsToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.getElementById("binsToggle").querySelectorAll(".bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderBins(btn.dataset.tab);
});
