/* ---------------- Shared day axis (31 days, gap = 21-23 Dec) ---------------- */
const chartDays = [
  { label: "11", month: "Dec", status: "baseline" },
  { label: "12", month: "Dec", status: "baseline" },
  { label: "13", month: "Dec", status: "baseline" },
  { label: "14", month: "Dec", status: "baseline" },
  { label: "15", month: "Dec", status: "active" },
  { label: "16", month: "Dec", status: "active" },
  { label: "17", month: "Dec", status: "active" },
  { label: "18", month: "Dec", status: "active" },
  { label: "19", month: "Dec", status: "active" },
  { label: "20", month: "Dec", status: "active" },
  { label: "21", month: "Dec", status: "active", gap: true },
  { label: "22", month: "Dec", status: "active", gap: true },
  { label: "23", month: "Dec", status: "active", gap: true },
  { label: "24", month: "Dec", status: "active" },
  { label: "25", month: "Dec", status: "active" },
  { label: "26", month: "Dec", status: "active" },
  { label: "27", month: "Dec", status: "active" },
  { label: "28", month: "Dec", status: "active" },
  { label: "29", month: "Dec", status: "active" },
  { label: "30", month: "Dec", status: "active" },
  { label: "31", month: "Dec", status: "active" },
  { label: "01", month: "Jan", status: "active" },
  { label: "02", month: "Jan", status: "active" },
  { label: "03", month: "Jan", status: "active" },
  { label: "04", month: "Jan", status: "active" },
  { label: "05", month: "Jan", status: "active" },
  { label: "06", month: "Jan", status: "active" },
  { label: "07", month: "Jan", status: "priority", heart: true },
  { label: "08", month: "Jan", status: "priority" },
  { label: "09", month: "Jan", status: "priority" },
  { label: "10", month: "Jan", status: "priority", today: true },
];

function gapIndicesOf(days) {
  return days.reduce((acc, d, i) => (d.gap ? [...acc, i] : acc), []);
}

const GAP_IDX = gapIndicesOf(chartDays);

function buildDayScale(containerId, days = chartDays) {
  document.getElementById(containerId).innerHTML = days
    .map((d) => `<span>${d.today ? `<span class="today">${d.label}</span>` : d.label}</span>`)
    .join("");
}

/* ---------------- Week / Month range toggle (Recordings / Health Data / Clinical) ---------------- */
let rangeMode = "month";

function visibleDays() {
  return rangeMode === "week" ? chartDays.slice(-7) : chartDays;
}

function sliceForRange(arr) {
  return rangeMode === "week" ? arr.slice(-7) : arr;
}

function monthRowHtml(days) {
  const months = [];
  days.forEach((d) => { if (!months.includes(d.month)) months.push(d.month); });
  return months.map((m) => `<span>${m}</span>`).join("");
}

function setMonthRow(id, days) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = monthRowHtml(days);
}

/* ---------------- Overview chart (status timeline) ---------------- */
const FALLBACK_COL_W = 40;
const PAD = 30;
const CHART_H = 190;
const Y = { baseline: 150, active: 90, priority: 78 };

let COL_W = FALLBACK_COL_W;
let CHART_W = PAD * 2 + (chartDays.length - 1) * COL_W;

function xAt(i) { return PAD + i * COL_W; }
function yAt(d) { return Y[d.status]; }

function buildOverviewChart() {
  const wrapEl = document.getElementById("overviewChartWrap");
  const available = wrapEl.clientWidth || 0;
  /* Always match the container exactly (no fixed-width floor) so the chart
     never overflows and gets clipped by the wrap's horizontal scroll, and
     never falls short of the container leaving dead space on the right. */
  CHART_W = Math.max(400, available);
  COL_W = (CHART_W - PAD * 2) / (chartDays.length - 1);

  const pts = chartDays.map((d, i) => ({ x: xAt(i), y: yAt(d), d }));

  const baselineIdx = chartDays.findIndex((d) => d.status !== "baseline");
  const priorityIdx = chartDays.findIndex((d) => d.status === "priority");

  const baselinePts = pts.slice(0, baselineIdx);
  const activePts = pts.slice(baselineIdx - 1, priorityIdx);
  const priorityPts = pts.slice(priorityIdx - 1);

  const toPoly = (arr) => arr.map((p) => `${p.x},${p.y}`).join(" ");

  const hatchX = xAt(GAP_IDX[0]) - COL_W / 2;
  const hatchW = xAt(GAP_IDX[GAP_IDX.length - 1]) - xAt(GAP_IDX[0]) + COL_W;

  let markers = "";
  pts.forEach((p) => {
    if (p.d.gap) return;
    if (p.d.status === "baseline") {
      markers += `<rect x="${p.x - 4}" y="${p.y - 4}" width="8" height="8" rx="2" fill="#C9CFD6" />`;
    } else if (p.d.status === "active") {
      markers += `<circle cx="${p.x}" cy="${p.y}" r="4.5" fill="#fff" stroke="#3FBE84" stroke-width="2" />`;
    } else if (p.d.status === "priority") {
      markers += `<circle cx="${p.x}" cy="${p.y}" r="5.5" fill="#F16C6C" />`;
    }
    if (p.d.heart) {
      markers += `<path transform="translate(${p.x - 9}, ${p.y - 40})" d="M9 16C9 16 1 10.9 1 5.7C1 3 3.1 1.2 5.4 1.2C6.6 1.2 7.5 1.7 9 2.9C10.5 1.7 11.4 1.2 12.6 1.2C14.9 1.2 17 3 17 5.7C17 10.9 9 16 9 16Z" fill="#F16C6C"/>`;
    }
  });

  const svg = `
    <svg class="chart-svg" viewBox="0 0 ${CHART_W} ${CHART_H}" width="${CHART_W}" height="${CHART_H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hatch" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
        </pattern>
      </defs>
      <rect x="${hatchX}" y="6" width="${hatchW}" height="${CHART_H - 24}" fill="url(#hatch)" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />
      <polyline points="${toPoly(baselinePts)}" fill="none" stroke="#C9CFD6" stroke-width="2.5" />
      <polyline points="${toPoly(activePts)}" fill="none" stroke="#3FBE84" stroke-width="2.5" />
      <polyline points="${toPoly(priorityPts)}" fill="none" stroke="#F16C6C" stroke-width="2.5" />
      ${markers}
    </svg>`;

  document.getElementById("overviewChartWrap").innerHTML = svg;
  buildDayScale("chartDayScale");
}

buildOverviewChart();

let overviewResizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(overviewResizeTimer);
  overviewResizeTimer = setTimeout(buildOverviewChart, 150);
});

/* ---------------- Recordings ---------------- */
const recordingStatus = [
  "valid", "valid", "valid", "none", "valid", "valid", "none", "none", "none", "low",
  "none", "none", "valid",
  "valid", "valid", "valid", "valid", "none", "valid", "valid", "valid",
  "valid", "none", "valid", "valid", "valid", "none", "low", "low", "valid", "valid",
];

function buildRecordings() {
  const days = visibleDays();
  const status = sliceForRange(recordingStatus);
  const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  document.getElementById("recordingsRow").innerHTML = days
    .map((d, i) => {
      const s = status[i];
      let icon = "";
      let cls = "rec-none";
      if (s === "valid") { cls = "rec-valid"; icon = checkIcon; }
      else if (s === "low") { cls = "rec-low"; icon = "!"; }
      return `
        <div class="rec-day">
          <div class="rec-icon ${cls}">${icon}</div>
          <span class="rec-day-label">${d.label}</span>
        </div>`;
    })
    .join("");
  setMonthRow("recMonthRow", days);
}

buildRecordings();

/* ---------------- Activity chart (Steps / Distance / Elevation) ---------------- */
const activityData = chartDays.map((d, i) => {
  if (d.gap) return null;
  const seed = (i * 37) % 100;
  return {
    steps: 60 + (seed % 60) + (i > 20 ? 30 : 0),
    distance: 40 + ((seed * 3) % 55) + (i > 20 ? 20 : 0),
    elevation: 30 + ((seed * 5) % 45),
  };
});

function buildActivityChart() {
  const days = visibleDays();
  const data = sliceForRange(activityData);
  const H = 150;
  const top = 10;
  const bottom = top + H;

  const wrapEl = document.getElementById("activityChartWrap");
  const width = Math.max(400, wrapEl.clientWidth || 0);
  const colW = (width - PAD * 2) / Math.max(1, days.length - 1);
  const xAtLocal = (i) => PAD + i * colW;

  const toPts = (key) => {
    const vals = data.filter(Boolean).map((v) => v[key]);
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return days
      .map((d, i) => {
        const v = data[i];
        if (!v) return null;
        const y = bottom - ((v[key] - min) / (max - min || 1)) * H;
        return { x: xAtLocal(i), y };
      })
      .filter(Boolean);
  };

  const toPoly = (pts) => pts.map((p) => `${p.x},${p.y.toFixed(1)}`).join(" ");
  const stepsPts = toPts("steps");
  const distPts = toPts("distance");
  const elevPts = toPts("elevation");

  const dots = (pts, color) => pts.map((p) => `<circle cx="${p.x}" cy="${p.y.toFixed(1)}" r="3" fill="${color}" />`).join("");

  const gapIdx = gapIndicesOf(days);
  let hatchRect = "";
  if (gapIdx.length) {
    const hatchX = xAtLocal(gapIdx[0]) - colW / 2;
    const hatchW = xAtLocal(gapIdx[gapIdx.length - 1]) - xAtLocal(gapIdx[0]) + colW;
    hatchRect = `<rect x="${hatchX}" y="2" width="${hatchW}" height="${top + H + 12}" fill="url(#hatchA)" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />`;
  }

  const svg = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${top + H + 20}" width="${width}" height="${top + H + 20}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="hatchA" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
        </pattern>
      </defs>
      ${hatchRect}
      <polyline points="${toPoly(stepsPts)}" fill="none" stroke="#8E97F2" stroke-width="2" />
      <polyline points="${toPoly(distPts)}" fill="none" stroke="#1CBFA6" stroke-width="2" />
      <polyline points="${toPoly(elevPts)}" fill="none" stroke="#B23FD8" stroke-width="2" stroke-dasharray="4 3" />
      ${dots(stepsPts, "#8E97F2")}
      ${dots(distPts, "#1CBFA6")}
    </svg>`;

  document.getElementById("activityChartWrap").innerHTML = svg;
  buildDayScale("activityDayScale", days);
  setMonthRow("activityMonthRow", days);
}

buildActivityChart();

/* ---------------- Generic axis line chart (Blood Pressure / Weight / Heart Rate / SpO2) ---------------- */
let lineChartSeq = 0;

function buildAxisLineChart(wrapId, dayScaleId, seriesList, domainMin, domainMax, H, monthRowId) {
  const days = visibleDays();
  const span = domainMax - domainMin;
  const patternId = `hatchLine${lineChartSeq++}`;

  const wrapEl = document.getElementById(wrapId);
  const width = Math.max(400, wrapEl.clientWidth || 0);
  const colW = (width - PAD * 2) / Math.max(1, days.length - 1);
  const xAtLocal = (i) => PAD + i * colW;

  function toPts(vals) {
    return days
      .map((d, i) => {
        const v = vals[i];
        if (v == null) return null;
        let y = H - ((v - domainMin) / span) * H;
        y = Math.min(H - 5, Math.max(5, y));
        return { x: xAtLocal(i), y };
      })
      .filter(Boolean);
  }

  const gapIdx = gapIndicesOf(days);
  let inner = "";
  if (gapIdx.length) {
    const hatchX = xAtLocal(gapIdx[0]) - colW / 2;
    const hatchW = xAtLocal(gapIdx[gapIdx.length - 1]) - xAtLocal(gapIdx[0]) + colW;
    inner = `<rect x="${hatchX}" y="2" width="${hatchW}" height="${H - 4}" fill="url(#${patternId})" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />`;
  }

  seriesList.forEach((s) => {
    const vals = sliceForRange(s.data);
    const pts = toPts(vals);
    const poly = pts.map((p) => `${p.x},${p.y.toFixed(1)}`).join(" ");
    inner += `<polyline points="${poly}" fill="none" stroke="${s.color}" stroke-width="2.5" />`;
    inner += pts.map((p) => `<circle cx="${p.x}" cy="${p.y.toFixed(1)}" r="5" fill="${s.color}" />`).join("");
  });

  const svg = `
    <svg class="chart-svg" viewBox="0 0 ${width} ${H}" width="${width}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="${patternId}" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
        </pattern>
      </defs>
      ${inner}
    </svg>`;

  document.getElementById(wrapId).innerHTML = svg;
  buildDayScale(dayScaleId, days);
  if (monthRowId) setMonthRow(monthRowId, days);
}

function seriesValues(base, jitter) {
  return chartDays.map((d) => {
    if (d.gap) return null;
    return Math.round(base + (Math.random() * jitter - jitter / 2));
  });
}

/* -- Blood Pressure -- */
const systolicData = seriesValues(105, 20);
const diastolicData = seriesValues(65, 15);
function buildBpChart() {
  buildAxisLineChart("bpChartWrap", "bpDayScale", [
    { data: systolicData, color: "#D9A628" },
    { data: diastolicData, color: "#F2994A" },
  ], 60, 180, 150, "bpMonthRow");
}
buildBpChart();

/* -- Heart Rate (Measurement) -- */
const heartRateMData = seriesValues(112, 25);
function buildHrmChart() {
  buildAxisLineChart("hrmChartWrap", "hrmDayScale", [{ data: heartRateMData, color: "#1CBFA6" }], 60, 180, 150, "hrmMonthRow");
}
buildHrmChart();

/* -- Blood Saturation (SpO2) -- */
const spo2Data = seriesValues(98, 2.4);
function buildSpo2Chart() {
  buildAxisLineChart("spo2ChartWrap", "spo2DayScale", [{ data: spo2Data, color: "#7C7CE0" }], 96, 100, 150, "spo2MonthRow");
}
buildSpo2Chart();

/* -- Weight (KG stored, toggled to lbs for display) -- */
const weightKgData = seriesValues(80, 5).map((v) => (v == null ? null : v + 0.5));
let weightUnit = "lbs";

function kgToLbs(kg) { return kg * 2.20462; }

function renderWeightChart() {
  const isLbs = weightUnit === "lbs";
  const data = weightKgData.map((v) => (v == null ? null : (isLbs ? kgToLbs(v) : v)));
  const domainMin = isLbs ? 176 : 80;
  const domainMax = isLbs ? 220 : 100;
  document.getElementById("weightYAxis").innerHTML = isLbs
    ? "<span>220</span><span>198</span><span>176</span>"
    : "<span>100</span><span>90</span><span>80</span>";
  document.getElementById("weightLegendLabel").textContent = isLbs ? "lbs" : "kg";
  buildAxisLineChart("weightChartWrap", "weightDayScale", [{ data, color: "#2E5AAC" }], domainMin, domainMax, 150, "weightMonthRow");
}

renderWeightChart();

function setWeightUnit(unit) {
  weightUnit = unit;
  document.querySelectorAll(".weight-unit-toggle span").forEach((b) => {
    b.classList.toggle("active", b.dataset.unit === unit);
  });
  renderWeightChart();
}

document.querySelectorAll("#weightUnitToggle span").forEach((btn) => {
  btn.addEventListener("click", () => setWeightUnit(btn.dataset.unit));
});

/* ---------------- Sleep chart ---------------- */
const sleepData = [
  { deep: 20, light: 45, rem: 25, awake: 10, mins: 380 },
  { deep: 18, light: 48, rem: 24, awake: 10, mins: 360 },
  { deep: 22, light: 44, rem: 22, awake: 12, mins: 375 },
  { deep: 19, light: 47, rem: 26, awake: 8, mins: 390 },
  { deep: 21, light: 46, rem: 23, awake: 10, mins: 370 },
  { deep: 17, light: 49, rem: 25, awake: 9, mins: 365 },
  { deep: 20, light: 45, rem: 24, awake: 11, mins: 355 },
  { deep: 23, light: 43, rem: 22, awake: 12, mins: 380 },
  { deep: 19, light: 46, rem: 25, awake: 10, mins: 370 },
  { deep: 20, light: 45, rem: 24, awake: 11, mins: 368 },
  null, null, null,
  { deep: 21, light: 45, rem: 24, awake: 10, mins: 375 },
  { deep: 18, light: 47, rem: 25, awake: 10, mins: 360 },
  { deep: 20, light: 46, rem: 23, awake: 11, mins: 365 },
  { deep: 22, light: 44, rem: 24, awake: 10, mins: 385 },
  { deep: 19, light: 45, rem: 26, awake: 10, mins: 370 },
  { deep: 21, light: 46, rem: 22, awake: 11, mins: 372 },
  { deep: 24, light: 42, rem: 22, awake: 12, mins: 400 },
  { deep: 20, light: 45, rem: 25, awake: 10, mins: 368 },
  { deep: 18, light: 44, rem: 24, awake: 14, mins: 350 },
  { deep: 22, light: 43, rem: 23, awake: 12, mins: 378 },
  { deep: 9, light: 45, rem: 35, awake: 11, mins: 476 },
  { deep: 20, light: 46, rem: 24, awake: 10, mins: 370 },
  { deep: 19, light: 45, rem: 25, awake: 11, mins: 362 },
  { deep: 21, light: 44, rem: 23, awake: 12, mins: 358 },
  { deep: 20, light: 46, rem: 24, awake: 10, mins: 366 },
  { deep: 20, light: 45, rem: 24, awake: 11, mins: 369 },
  { deep: 9, light: 45, rem: 35, awake: 11, mins: 476 },
];

function fmtMins(m) {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} hr ${mm} min`;
}

function buildSleepChart() {
  const days = visibleDays();
  const data = sliceForRange(sleepData);
  const wrap = document.getElementById("sleepChart");
  wrap.innerHTML = days
    .map((d, i) => {
      const s = data[i];
      if (!s) {
        return `<div class="sleep-col"><div class="sleep-bars gap"></div><span class="sleep-col-label">${d.label}</span></div>`;
      }
      const total = 220;
      const deepH = (s.deep / 100) * total;
      const lightH = (s.light / 100) * total;
      const remH = (s.rem / 100) * total;
      const awakeH = (s.awake / 100) * total;
      return `
        <div class="sleep-col">
          <div class="sleep-tooltip">
            <div class="tt-time">12:00AM-12:00AM<br/>${fmtMins(s.mins)}</div>
            <div class="tt-awake">${s.awake}% Awake</div>
            <div class="tt-rem">${s.rem}% REM</div>
            <div class="tt-light">${s.light}% Light</div>
            <div class="tt-deep">${s.deep}% Deep</div>
          </div>
          <div class="sleep-bars">
            <div class="seg" style="height:${deepH}px; background:#2E5AAC;"></div>
            <div class="seg" style="height:${lightH}px; background:#3FBE84;"></div>
            <div class="seg" style="height:${remH}px; background:#8B6BD1;"></div>
            <div class="seg" style="height:${awakeH}px; background:#F2994A;"></div>
          </div>
          <span class="sleep-col-label">${d.label}</span>
        </div>`;
    })
    .join("");
  setMonthRow("sleepMonthRow", days);
}

buildSleepChart();

/* ---------------- Generic min/max range-bar chart ---------------- */
function buildRangeChart(containerId, data, domainMin, domainMax, trackH, color, monthRowId) {
  const days = visibleDays();
  const windowedData = sliceForRange(data);
  const el = document.getElementById(containerId);
  el.innerHTML = days
    .map((d, i) => {
      const v = windowedData[i];
      if (!v) {
        return `<div class="range-col"><div class="range-gap-hatch"></div><span class="range-col-label">${d.label}</span></div>`;
      }
      const span = domainMax - domainMin;
      const top = trackH * (1 - (v.max - domainMin) / span);
      const h = Math.max(10, trackH * ((v.max - v.min) / span));
      return `
        <div class="range-col">
          <div class="range-bar" style="top:${top.toFixed(1)}px; height:${h.toFixed(1)}px; background:${color};"></div>
          <span class="range-col-label">${d.label}</span>
        </div>`;
    })
    .join("");
  if (monthRowId) setMonthRow(monthRowId, days);
}

function rangeSeries(baseMin, baseMax, jitter) {
  return chartDays.map((d) => {
    if (d.gap) return null;
    const m = Math.random() * jitter - jitter / 2;
    return { min: Math.round(baseMin + m), max: Math.round(baseMax + m) };
  });
}

const heartData = rangeSeries(70, 150, 30);
const oxygenData = rangeSeries(92, 99, 6);
const respirationData = rangeSeries(16, 32, 8);

function buildHeartChart() { buildRangeChart("heartChart", heartData, 45, 200, 150, "#1CBFA6", "heartMonthRow"); }
function buildOxygenChart() { buildRangeChart("oxygenChart", oxygenData, 80, 100, 150, "#F2994A", "oxygenMonthRow"); }
function buildRespirationChart() { buildRangeChart("respirationChart", respirationData, 10, 50, 150, "#7C7CE0", "respirationMonthRow"); }

buildHeartChart();
buildOxygenChart();
buildRespirationChart();

/* ---------------- Clinical: Care Recommendations ---------------- */
const careRecs = [
  {
    active: true,
    title: "Increase loop diuretic",
    desc: "Increase Furosemide by 50% for 3 days following a 2.1 kg weight gain and rising respiration rate.",
    status: "Active",
    statusClass: "status-active",
    date: "08/08/2026",
    from: { initials: "LK", cls: "av-blue", name: "Dr. Lior Klein" },
    to: { initials: "AE", cls: "av-orange", name: "Ayelet Er, NP" },
    note: "Patient contacted — dose confirmed",
  },
  {
    active: false,
    title: "Invite to clinic",
    desc: "Voice biomarker sustained above baseline for 6 consecutive days. Invite for in-person review.",
    status: "Completed",
    statusClass: "status-completed",
    date: "07/22/2026",
    from: { initials: "SL", cls: "av-purple", name: "Dr. Shani Levin" },
    to: { initials: "MP", cls: "av-pink", name: "Max Payne" },
    note: "Appointment booked 07/28",
  },
  {
    active: false,
    title: "Review medication adherence",
    desc: "Three missed ARNI doses in the last 7 days. Review barriers with the patient.",
    status: "Completed",
    statusClass: "status-completed",
    date: "06/30/2026",
    from: { initials: "LK", cls: "av-blue", name: "Dr. Lior Klein" },
    to: { initials: "SK", cls: "av-teal", name: "Sandy Kohl" },
    note: "Reminder schedule adjusted",
  },
];

function renderCareRecs() {
  document.getElementById("careRecCount").textContent = careRecs.length;
  document.getElementById("careRecList").innerHTML = careRecs
    .map(
      (r) => `
      <div class="care-rec-item ${r.active ? "active-rec" : ""}">
        <div class="care-rec-top">
          <div>
            <h4 class="care-rec-title">${r.title}</h4>
            <p class="care-rec-desc">${r.desc}</p>
          </div>
          <div class="care-rec-status">
            <span class="status-chip ${r.statusClass}">${r.status}</span>
            <span class="status-date">${r.date}</span>
          </div>
        </div>
        <div class="care-rec-handoff">
          <span class="init-avatar ${r.from.cls}">${r.from.initials}</span>
          <span class="handoff-person">${r.from.name}</span>
          <span class="handoff-arrow"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M13 6L19 12L13 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
          <span class="init-avatar ${r.to.cls}">${r.to.initials}</span>
          <span class="handoff-person">${r.to.name}</span>
          <span class="handoff-note">&middot; ${r.note}</span>
          <span class="handoff-spacer"></span>
          <button class="btn-open">Open</button>
        </div>
      </div>`
    )
    .join("");
}
renderCareRecs();

/* ---------------- Clinical: Medications ---------------- */
function dailyAdherence(missedIdx) {
  return chartDays.map((d, i) => !missedIdx.includes(i));
}

const medications = [
  {
    hf: true, name: "Furosemide", cls: "Loop diuretic", freq: "Daily", dose: "40 mg", schedule: "Once daily, morning",
    warning: null, adherence: dailyAdherence([8, 21, 26, 30]), source: "Care rec", srcClass: "src-carerec", status: "active",
    ehrStatus: "Active", doseForm: "Tablet", manufacturer: "Sandoz Inc.", ingredient: "Furosemide", amount: "40 mg",
    effectiveDateTime: "2025-12-11T08:00", route: "Oral", sig: "Take one tablet by mouth once daily in the morning",
    statusReason: "Not applicable", lotNumber: "L2394A", expiryDate: "2027-03-15",
  },
  {
    hf: false, name: "Carvedilol", cls: "Beta blocker", freq: "Twice daily", dose: "6.25 mg", schedule: "Twice daily",
    warning: null, adherence: dailyAdherence([5, 12, 19, 27]), source: "Clinic", srcClass: "src-clinic", status: "active",
    ehrStatus: "Active", doseForm: "Tablet", manufacturer: "Teva Pharmaceuticals", ingredient: "Carvedilol", amount: "6.25 mg",
    effectiveDateTime: "2025-12-11T08:00", route: "Oral", sig: "Take one tablet by mouth twice daily with food",
    statusReason: "Not applicable", lotNumber: "C8821B", expiryDate: "2026-11-02",
  },
  {
    hf: false, name: "Sacubitril/Valsartan", cls: "ARNI", freq: "Twice daily", dose: "49/51 mg", schedule: "Twice daily",
    warning: "Monitor renal function with diuretic", adherence: dailyAdherence([2, 3, 9, 15, 22, 23, 28, 29]), source: "Clinic", srcClass: "src-clinic", status: "active",
    ehrStatus: "Active", doseForm: "Tablet", manufacturer: "Novartis", ingredient: "Sacubitril / Valsartan", amount: "49/51 mg",
    effectiveDateTime: "2025-12-11T08:00", route: "Oral", sig: "Take one tablet by mouth twice daily",
    statusReason: "Dose adjustment", lotNumber: "S5510C", expiryDate: "2027-01-20",
  },
  {
    hf: false, name: "Spironolactone", cls: "MRA", freq: "Daily", dose: "25 mg", schedule: "Once daily",
    warning: null, adherence: dailyAdherence([]), source: "Care rec", srcClass: "src-carerec", status: "active",
    ehrStatus: "Active", doseForm: "Tablet", manufacturer: "Pfizer", ingredient: "Spironolactone", amount: "25 mg",
    effectiveDateTime: "2025-12-11T08:00", route: "Oral", sig: "Take one tablet by mouth once daily",
    statusReason: "Not applicable", lotNumber: "P1187D", expiryDate: "2026-09-30",
  },
  {
    hf: false, name: "Ibuprofen", cls: "NSAID (OTC)", freq: "As needed", dose: "200 mg", schedule: "As needed",
    warning: "NSAIDs may worsen fluid retention in HF", adherence: dailyAdherence([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29]), source: "Patient", srcClass: "src-patient", status: "past",
    ehrStatus: "Inactive", doseForm: "Tablet", manufacturer: "Other", ingredient: "Ibuprofen", amount: "200 mg",
    effectiveDateTime: "2025-11-02T09:00", route: "Oral", sig: "Take as needed for pain, not to exceed 3 tablets per day",
    statusReason: "Adverse reaction", lotNumber: "—", expiryDate: "2025-12-01",
  },
  {
    hf: false, name: "Atorvastatin", cls: "Statin", freq: "Daily", dose: "20 mg", schedule: "Once daily, evening",
    warning: null, adherence: dailyAdherence([6, 14, 24]), source: "Clinic", srcClass: "src-clinic", status: "active",
    ehrStatus: "Active", doseForm: "Tablet", manufacturer: "Mylan", ingredient: "Atorvastatin", amount: "20 mg",
    effectiveDateTime: "2025-12-11T20:00", route: "Oral", sig: "Take one tablet by mouth once daily in the evening",
    statusReason: "Not applicable", lotNumber: "M4402E", expiryDate: "2027-05-08",
  },
];

medications.forEach((m, i) => (m.id = i));
let nextMedId = medications.length;

const adhCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const adhDashIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 12H18" stroke="#9AA5B1" stroke-width="2.4" stroke-linecap="round"/></svg>`;

let medStatusFilter = "all";

function filteredMeds() {
  return medications.filter((m) => {
    if (medStatusFilter !== "all" && m.status !== medStatusFilter) return false;
    return true;
  });
}

const medInfoIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><rect x="11.2" y="10.3" width="1.6" height="6" rx="0.8" fill="currentColor"/><rect x="11.2" y="7" width="1.6" height="1.7" rx="0.8" fill="currentColor"/></svg>`;

function medInfoRow(label, value) {
  return `<div class="med-info-row"><span class="med-info-label">${label}</span><span class="med-info-value">${value || "—"}</span></div>`;
}

function medInfoDateTime(v) {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function medInfoDate(v) {
  if (!v) return null;
  const d = new Date(`${v}T00:00`);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function medInfoPopover(m, mi) {
  return `
    <div class="med-info-popover" id="medInfoPop${mi}">
      <p class="med-info-title">${m.name} &middot; Medication details</p>
      ${medInfoRow("Status", m.ehrStatus)}
      ${medInfoRow("Dose Form", m.doseForm)}
      ${medInfoRow("Manufacturer", m.manufacturer)}
      ${medInfoRow("Ingredient", m.ingredient)}
      ${medInfoRow("Amount", m.amount)}
      ${medInfoRow("Effective Date &amp; Time", medInfoDateTime(m.effectiveDateTime))}
      ${medInfoRow("Dose", m.dose)}
      ${medInfoRow("Route", m.route)}
      ${medInfoRow("Sig / Directions", m.sig)}
      ${medInfoRow("Status Reason", m.statusReason)}
      ${medInfoRow("Lot Number", m.lotNumber)}
      ${medInfoRow("Expiry Date", medInfoDate(m.expiryDate))}
    </div>`;
}

function renderMeds() {
  const list = filteredMeds();
  document.getElementById("medCount").textContent = medications.length;
  document.getElementById("medList").innerHTML = list
    .map(
      (m, mi) => `
      <div class="med-block">
        <div class="med-block-head">
          <div>
            <div class="med-name-row">
              <span class="med-bar ${m.hf ? "hf" : "other"}"></span>
              <div class="med-block-name">
                <span class="med-name">${m.name}</span>
                <span class="med-freq">${m.freq}</span>
              </div>
              <button type="button" class="med-info-btn" data-med="${mi}" aria-label="View ${m.name} EHR mapping details">${medInfoIcon}</button>
              ${medInfoPopover(m, mi)}
            </div>
            <div class="med-block-meta" style="margin-top:6px;">
              ${m.hf ? `<span class="med-hf-badge">Heart Failure medication</span>` : ""}
              <span class="med-class">${m.cls}</span>
              <span>${m.dose} &middot; ${m.schedule}</span>
              ${m.warning ? `<span class="med-warning"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 4L2 20H22L12 4Z" stroke="#C77B22" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10V14M12 17V17.3" stroke="#C77B22" stroke-width="1.6" stroke-linecap="round"/></svg>${m.warning}</span>` : ""}
            </div>
          </div>
          <div class="med-block-side">
            <span class="source-badge ${m.srcClass}">${m.source}</span>
            <button class="btn-edit" data-med-id="${m.id}">Edit</button>
          </div>
        </div>

        <div class="med-adherence-row">
          <button class="chart-arrow med-adh-prev" data-med="${mi}" aria-label="Previous month"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          <div class="med-adh-scroll" id="medAdh${mi}">
            ${(() => {
              const days = visibleDays();
              const adh = sliceForRange(m.adherence);
              return days
                .map(
                  (d, i) => `
                <div class="med-adh-day">
                  <span class="med-adh-icon ${adh[i] ? "med-adh-taken" : "med-adh-missed"}">${adh[i] ? adhCheckIcon : adhDashIcon}</span>
                  <span class="med-adh-day-label">${d.label}</span>
                </div>`
                )
                .join("");
            })()}
          </div>
          <button class="chart-arrow med-adh-next" data-med="${mi}" aria-label="Next month"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
        </div>
        <div class="chart-month-row" style="padding:0 40px;">${monthRowHtml(visibleDays())}</div>
      </div>`
    )
    .join("") || `<p class="empty-state-text">No medications match the selected filters.</p>`;

  document.querySelectorAll(".med-adh-prev, .med-adh-next").forEach((btn) => {
    btn.addEventListener("click", () => {
      const row = document.getElementById(`medAdh${btn.dataset.med}`);
      const dir = btn.classList.contains("med-adh-next") ? 1 : -1;
      row.scrollBy({ left: dir * 320, behavior: "smooth" });
    });
  });

  document.querySelectorAll(".med-info-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const pop = document.getElementById(`medInfoPop${btn.dataset.med}`);
      const willOpen = !pop.classList.contains("open");
      closeAllMedInfoPopovers();
      if (willOpen) {
        pop.classList.add("open");
        btn.classList.add("active");
      }
    });
  });

  document.querySelectorAll(".med-info-popover").forEach((pop) => {
    pop.addEventListener("click", (e) => e.stopPropagation());
  });
}

function closeAllMedInfoPopovers() {
  document.querySelectorAll(".med-info-popover.open").forEach((p) => p.classList.remove("open"));
  document.querySelectorAll(".med-info-btn.active").forEach((b) => b.classList.remove("active"));
}

document.addEventListener("click", closeAllMedInfoPopovers);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAllMedInfoPopovers(); });

renderMeds();

document.getElementById("medStatusFilter").addEventListener("change", (e) => {
  medStatusFilter = e.target.value;
  renderMeds();
});

/* ---------------- Tabs: Recordings / Health Data / Clinical ---------------- */
document.querySelectorAll(".data-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".data-tab").forEach((t) => t.classList.remove("open"));
    document.querySelectorAll(".data-tab-panel").forEach((p) => p.classList.remove("open"));
    tab.classList.add("open");
    document.querySelector(`.data-tab-panel[data-panel="${target}"]`).classList.add("open");
    /* charts inside a hidden panel measure 0 width when built, so re-run once it's visible */
    if (target === "health-data") rebuildRangedCharts();
  });
});

/* ---------------- Sub-tabs (Measurement/Wellness, Medication/Care Recommendations) ----------------
   Scoped to the closest .data-tab-panel so two independent subtab groups on the
   same page (Health Data, Clinical) don't clear each other's active panel. */
document.querySelectorAll(".subtab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const scope = tab.closest(".data-tab-panel");
    const target = tab.dataset.subtab;
    scope.querySelectorAll(".subtab").forEach((t) => t.classList.remove("active"));
    scope.querySelectorAll(".subtab-panel").forEach((p) => p.classList.remove("open"));
    tab.classList.add("active");
    scope.querySelector(`.subtab-panel[data-subpanel="${target}"]`).classList.add("open");
    rebuildRangedCharts();

    const medActions = document.getElementById("medSubtabActions");
    const careRecActions = document.getElementById("careRecSubtabActions");
    if (medActions && careRecActions) {
      medActions.style.display = target === "medication" ? "flex" : "none";
      careRecActions.style.display = target === "care-rec" ? "flex" : "none";
    }
  });
});

function rebuildRangedCharts() {
  buildRecordings();
  buildActivityChart();
  buildBpChart();
  buildHrmChart();
  buildSpo2Chart();
  renderWeightChart();
  buildSleepChart();
  buildHeartChart();
  buildOxygenChart();
  buildRespirationChart();
  renderMeds();
}

document.querySelectorAll(".range-toggle span").forEach((r) => {
  r.addEventListener("click", () => {
    document.querySelectorAll(".range-toggle span").forEach((s) => s.classList.remove("active"));
    r.classList.add("active");
    rangeMode = r.dataset.range || "month";
    rebuildRangedCharts();
  });
});

document.querySelectorAll(".history-tabs span").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".history-tabs span").forEach((s) => s.classList.remove("active"));
    t.classList.add("active");
  });
});

/* ---------------- History events ---------------- */
const history = [
  { color: "dot-red", label: "Status changed to Priority", date: "01.09.2026" },
  { color: "dot-green", label: "Status changed to Active", date: "12.24.2025" },
  { color: "dot-green", label: "Status changed to Active", date: "12.16.2025" },
  { color: "dot-gray", label: "Status changed to Baseline", date: "12.01.2025" },
  { color: "dot-darkgray", label: "Status changed to Registered", date: "12.01.2025" },
];

document.getElementById("historyRows").innerHTML = history
  .map(
    (h) => `
    <tr>
      <td><span class="event-dot"><span class="dot ${h.color}"></span>${h.label}</span></td>
      <td>${h.date}</td>
      <td><a class="add-note-link" href="#"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Add Note</a></td>
    </tr>`
  )
  .join("");

fitTableToRows(".history-table-scroll", 4);

/* ---------------- Chat panel ---------------- */
const chatMessages = [
  { type: "out", name: "Emily Colley", time: "11:10 AM", text: "Hello Alex, how do you feel today?", seen: "Seen 01.21.2026, 7:12 AM" },
  { type: "in", time: "11:11 AM", text: "I feel good" },
  { type: "sep", label: "Yesterday" },
  { type: "out", name: "Dr. Alex Sholl", time: "09:08 AM", text: "Hello Alex, how is you breathe today?", seen: "Seen 01.25.2026, 11:22 AM" },
  { type: "in", time: "11:25 AM", text: "I'm having a little trouble breathing" },
];

document.getElementById("chatMessages").innerHTML = chatMessages
  .map((m) => {
    if (m.type === "sep") return `<div class="chat-day-sep">${m.label}</div>`;
    return `
      <div class="chat-msg ${m.type}">
        <div class="chat-msg-meta">${m.name ? `<b>${m.name}</b> &middot; ` : ""}${m.time}</div>
        <div class="chat-bubble">${m.text}</div>
        ${m.seen ? `<div class="chat-seen">${m.seen}</div>` : ""}
      </div>`;
  })
  .join("");

const chatPanel = document.getElementById("chatPanel");
document.getElementById("chatOpenBtn").addEventListener("click", () => chatPanel.classList.add("open"));
document.getElementById("chatCloseBtn").addEventListener("click", () => chatPanel.classList.remove("open"));

/* ---------------- Clinical: Add Medication / Recommendation modals ---------------- */
/* ---------------- Custom dropdowns (same pattern as Registration) ---------------- */
function setCustomSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".custom-select-value");
  const option = select.querySelector(`.custom-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionCustomSelectMenu(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function wireCustomSelect(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const valueEl = select.querySelector(".custom-select-value");
  const hiddenInput = select.querySelector("input[type=hidden]");

  valueEl.dataset.placeholder = valueEl.textContent.trim();
  hiddenInput.dataset.default = hiddenInput.value;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
    if (willOpen) positionCustomSelectMenu(select);
    select.classList.toggle("open", willOpen);
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-select-option");
    if (!option) return;
    setCustomSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

document.querySelectorAll(".custom-select").forEach(wireCustomSelect);
document.addEventListener("click", closeAllCustomSelects);
document.addEventListener("scroll", closeAllCustomSelects, true);
window.addEventListener("resize", closeAllCustomSelects);

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

function wireAddModal(overlayId, formId, cancelId, openBtnId, onSubmit) {
  const overlay = document.getElementById(overlayId);
  const form = document.getElementById(formId);

  function open() {
    form.reset();
    resetCustomSelectsIn(form);
    overlay.classList.add("open");
  }
  function close() {
    overlay.classList.remove("open");
  }

  document.getElementById(openBtnId).addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });
  document.getElementById(cancelId).addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    onSubmit(new FormData(form));
    close();
  });
}

wireAddModal("addMedOverlay", "addMedForm", "cancelAddMed", "openAddMedBtn", (fd) => {
  const ehrStatus = fd.get("status");
  const dose = fd.get("dose");
  medications.unshift({
    id: nextMedId++,
    hf: false,
    name: fd.get("name"),
    cls: fd.get("doseForm") || "",
    freq: fd.get("frequency") || "",
    dose: dose || "",
    schedule: fd.get("sig") || "",
    warning: null,
    adherence: dailyAdherence([]),
    source: "Clinic",
    srcClass: "src-clinic",
    status: ehrStatus === "Active" ? "active" : "past",
    ehrStatus,
    doseForm: fd.get("doseForm"),
    amount: fd.get("amount"),
    effectiveDateTime: fd.get("effectiveDateTime"),
    route: fd.get("route"),
    sig: fd.get("sig"),
    drugCodeType: fd.get("drugCodeType"),
    drugCodeValue: fd.get("drugCodeValue"),
  });
  renderMeds();
});

/* ---------------- Edit Medication ---------------- */
const FREQ_NORMALIZE = {
  "daily": "Once Daily",
  "once daily": "Once Daily",
  "twice daily": "Twice Daily",
  "three times daily": "Three Times Daily",
  "four times daily": "Four Times Daily",
  "every morning": "Every Morning",
  "every night": "Every Night",
};

const editMedOverlay = document.getElementById("editMedOverlay");
const editMedForm = document.getElementById("editMedForm");
let editingMedId = null;

function openEditMedModal(id) {
  const m = medications.find((x) => x.id === id);
  if (!m) return;

  editingMedId = id;
  editMedForm.reset();
  resetCustomSelectsIn(editMedForm);

  editMedForm.name.value = m.name || "";
  editMedForm.amount.value = m.amount || "";
  editMedForm.effectiveDateTime.value = m.effectiveDateTime || "";
  editMedForm.dose.value = m.dose || "";
  editMedForm.sig.value = m.sig || "";

  setCustomSelectValue(editMedForm.querySelector('.custom-select[data-name="drugCodeType"]'), m.drugCodeType || "RxNorm", { silent: true });
  editMedForm.drugCodeValue.value = m.drugCodeValue || "";

  setCustomSelectValue(editMedForm.querySelector('.custom-select[data-name="status"]'), m.ehrStatus || "", { silent: true });
  setCustomSelectValue(editMedForm.querySelector('.custom-select[data-name="doseForm"]'), m.doseForm || "", { silent: true });
  setCustomSelectValue(editMedForm.querySelector('.custom-select[data-name="route"]'), m.route || "", { silent: true });

  const normalizedFreq = FREQ_NORMALIZE[(m.freq || "").trim().toLowerCase()] || "";
  setCustomSelectValue(editMedForm.querySelector('.custom-select[data-name="frequency"]'), normalizedFreq, { silent: true });

  editMedOverlay.classList.add("open");
}

function closeEditMedModal() {
  editMedOverlay.classList.remove("open");
  editingMedId = null;
}

document.getElementById("medList").addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-edit");
  if (!btn) return;
  openEditMedModal(Number(btn.dataset.medId));
});

document.getElementById("cancelEditMed").addEventListener("click", closeEditMedModal);
editMedOverlay.addEventListener("click", (e) => { if (e.target === editMedOverlay) closeEditMedModal(); });

editMedForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const m = medications.find((x) => x.id === editingMedId);
  if (!m) return;

  const fd = new FormData(editMedForm);
  const ehrStatus = fd.get("status");

  m.name = fd.get("name");
  m.doseForm = fd.get("doseForm");
  m.cls = fd.get("doseForm") || m.cls;
  m.amount = fd.get("amount");
  m.effectiveDateTime = fd.get("effectiveDateTime");
  m.dose = fd.get("dose");
  m.freq = fd.get("frequency") || m.freq;
  m.route = fd.get("route");
  m.sig = fd.get("sig");
  m.schedule = fd.get("sig") || m.schedule;
  m.drugCodeType = fd.get("drugCodeType");
  m.drugCodeValue = fd.get("drugCodeValue");
  m.ehrStatus = ehrStatus;
  m.status = ehrStatus === "Active" ? "active" : "past";

  renderMeds();
  closeEditMedModal();
});

const REC_STATUS_CLASS = { Active: "status-active", Completed: "status-completed" };
wireAddModal("addRecOverlay", "addRecForm", "cancelAddRec", "openAddRecBtn", (fd) => {
  const status = fd.get("status");
  careRecs.unshift({
    active: status === "Active",
    title: fd.get("title"),
    desc: fd.get("desc"),
    status,
    statusClass: REC_STATUS_CLASS[status],
    date: "01/10/2026",
    from: { initials: "EC", cls: "av-blue", name: "Emily Carter" },
    to: { initials: "EC", cls: "av-blue", name: "Emily Carter" },
    note: "Just added",
  });
  renderCareRecs();
});

wireAddModal("careRecOverlay", "careRecForm", "cancelCareRec", "openCareRecBtn", (fd) => {
  const medication = fd.get("medication") || "Medication";
  const newDose = fd.get("newDose");
  const frequency = fd.get("frequency");
  const duration = fd.get("duration");
  careRecs.unshift({
    active: true,
    title: `Adjust ${medication}`,
    desc: `${medication}${newDose ? ` ${newDose} mg` : ""}${frequency ? ` · ${frequency}` : ""}${duration ? ` for ${duration} days` : ""}${fd.get("invite") === "on" ? " · Patient invited to clinic" : ""}${fd.get("instructions") ? ` — ${fd.get("instructions")}` : ""}`,
    status: "Active",
    statusClass: REC_STATUS_CLASS.Active,
    date: "01/10/2026",
    from: { initials: "EC", cls: "av-blue", name: "Emily Carter" },
    to: { initials: "EC", cls: "av-blue", name: "Emily Carter" },
    note: "Just added",
  });
  renderCareRecs();
});

/* ---------------- Add Measurement modal ---------------- */
function mReqField(name, label, placeholder, step) {
  return `
    <div class="form-field full">
      <label>${label}<span class="required-star">*</span></label>
      <input type="number" ${step ? `step="${step}"` : ""} name="${name}" placeholder="${placeholder}" required />
    </div>`;
}

const MEASUREMENT_FIELD_SETS = {
  bloodPressure: () => `
    <div class="form-field">
      <label>Systolic (mmHG)<span class="required-star">*</span></label>
      <input type="number" name="systolic" placeholder="e.g. 120" required />
    </div>
    <div class="form-field">
      <label>Diastolic (mmHG)<span class="required-star">*</span></label>
      <input type="number" name="diastolic" placeholder="e.g. 80" required />
    </div>`,
  weight: () => `
    <div class="form-field">
      <label>Weight<span class="required-star">*</span></label>
      <input type="number" step="0.1" name="weightValue" placeholder="e.g. 165" required />
    </div>
    <div class="form-field">
      <label>Unit</label>
      <div class="unit-toggle weight-unit-toggle" id="measurementWeightUnitToggle">
        <span data-unit="kg" class="${weightUnit === "kg" ? "active" : ""}">KG</span>
        <span data-unit="lbs" class="${weightUnit === "lbs" ? "active" : ""}">lbs</span>
      </div>
      <input type="hidden" name="weightUnit" value="${weightUnit}" />
    </div>`,
  heartRate: () => mReqField("heartRateValue", "Heart Rate (bpm)", "e.g. 72"),
  bloodOxygen: () => mReqField("bloodOxygenValue", "Blood Oxygen (%)", "e.g. 98"),
  respirationRate: () => mReqField("respirationValue", "Respiration Rate (breaths/min)", "e.g. 16"),
  temperature: () => mReqField("temperatureValue", "Temperature (°F)", "e.g. 98.6", "0.1"),
  bloodGlucose: () => mReqField("bloodGlucoseValue", "Blood Glucose (mg/dL)", "e.g. 95"),
  height: () => mReqField("heightValue", "Height (in)", "e.g. 68"),
  bmi: () => mReqField("bmiValue", "BMI", "e.g. 24.5", "0.1"),
};

const measurementTypeSelect = document.getElementById("measurementTypeSelect");
const measurementValueFields = document.getElementById("measurementValueFields");
const saveAddMeasurementBtn = document.getElementById("saveAddMeasurement");

function renderMeasurementFields() {
  const type = measurementTypeSelect.value;
  measurementValueFields.innerHTML = type ? MEASUREMENT_FIELD_SETS[type]() : "";

  const hiddenWeightInput = measurementValueFields.querySelector('input[name="weightUnit"]');
  if (hiddenWeightInput) {
    measurementValueFields.querySelectorAll("#measurementWeightUnitToggle span").forEach((btn) => {
      btn.addEventListener("click", () => {
        setWeightUnit(btn.dataset.unit);
        measurementValueFields.querySelectorAll("#measurementWeightUnitToggle span").forEach((b) => b.classList.toggle("active", b === btn));
        hiddenWeightInput.value = btn.dataset.unit;
      });
    });
  }

  saveAddMeasurementBtn.disabled = !type;
  saveAddMeasurementBtn.classList.toggle("enabled", !!type);
}

measurementTypeSelect.addEventListener("change", renderMeasurementFields);

wireAddModal("addMeasurementOverlay", "addMeasurementForm", "cancelAddMeasurement", "openAddMeasurementBtn", (fd) => {
  alert(`Measurement added: ${measurementTypeSelect.options[measurementTypeSelect.selectedIndex].text}`);
});

document.getElementById("openAddMeasurementBtn").addEventListener("click", renderMeasurementFields);
