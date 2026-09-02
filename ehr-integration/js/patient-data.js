/* ---------------- Care Team popover ---------------- */
wireTopbarToggle("careTeamTrigger", "careTeamPopover");

/* Add care-team members from the Care Team popover. */
const patientCareTeam = [
  { name: "Dr. Sarah Mitchell", role: "Doctor · Provider" },
  { name: "Amanda Lee", role: "Nurse · Care Team" },
  { name: "Ayelet Er", role: "Nurse · Care Team" },
  { name: "Sandy Kohl", role: "Nurse · Care Team" },
];
const availableCareTeamMembers = [
  { name: "Michael Chen", role: "Care Coordinator · Care Team" },
  { name: "Priya Shah", role: "Pharmacist · Care Team" },
  { name: "James Wilson", role: "Social Worker · Care Team" },
  { name: "Elena Rodriguez", role: "Nurse · Care Team" },
];
/* Titles a care-team member's role can be reassigned to via the edit panel.
   The primary provider (role includes "Provider") isn't part of this pool and
   isn't editable/removable here -- they're the patient's doctor, not a
   care-team assignment this panel manages. */
const CARE_TEAM_ROLE_TITLES = ["Nurse", "Care Coordinator", "Pharmacist", "Social Worker"];
const careTeamPopover = document.getElementById("careTeamPopover");
const careTeamTitle = careTeamPopover.querySelector(".care-team-popover-title");
const careTeamMemberList = document.createElement("div");
const careTeamHeading = document.createElement("div");
const openCareTeamAdd = document.createElement("button");
const careTeamAddPanel = document.createElement("div");
const careTeamMultiselect = document.createElement("div");
const careTeamEditPanel = document.createElement("div");
careTeamMemberList.id = "careTeamMemberList";
careTeamHeading.className = "care-team-popover-heading";
openCareTeamAdd.type = "button";
openCareTeamAdd.className = "care-team-add-button";
openCareTeamAdd.textContent = "+ Add member";
careTeamAddPanel.className = "care-team-add-panel";
careTeamAddPanel.hidden = true;
careTeamMultiselect.className = "care-team-multiselect";
careTeamAddPanel.innerHTML = '<span class="care-team-add-label">Select care team members</span>';
careTeamAddPanel.append(careTeamMultiselect);
careTeamAddPanel.insertAdjacentHTML("beforeend", '<div class="care-team-add-actions"><button type="button" class="btn-text care-team-cancel-button">Cancel</button><button type="button" class="care-team-confirm-button">Add selected</button></div>');
/* Same flyout treatment as the "+ Add member" panel -- content is rebuilt
   each time it opens (via openCareTeamEditPanel) since it targets whichever
   row's edit icon was clicked. */
careTeamEditPanel.className = "care-team-add-panel";
careTeamEditPanel.hidden = true;
careTeamHeading.append(careTeamTitle, openCareTeamAdd);
careTeamPopover.replaceChildren(careTeamHeading, careTeamMemberList, careTeamAddPanel, careTeamEditPanel);
function renderPatientCareTeam() {
  careTeamMemberList.innerHTML = patientCareTeam.map((member) => {
    const isProvider = member.role.includes("Provider");
    return `<div class="care-team-popover-item"><div class="care-team-popover-info"><span class="care-team-popover-name">${member.name}</span><span class="care-team-popover-role">${member.role}</span></div>${isProvider ? "" : `<div class="care-team-item-actions"><button type="button" class="care-team-edit-button" data-name="${member.name}" title="Edit role" aria-label="Edit ${member.name}'s role"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button><button type="button" class="care-team-remove-button" data-name="${member.name}" title="Remove from care team" aria-label="Remove ${member.name} from care team"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg></button></div>`}</div>`;
  }).join("");
  const count = document.querySelector("#careTeamTrigger .care-team-more");
  if (count) count.textContent = patientCareTeam.length;
}

careTeamMemberList.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".care-team-remove-button");
  if (removeBtn) {
    event.stopPropagation();
    const name = removeBtn.dataset.name;
    const index = patientCareTeam.findIndex((member) => member.name === name);
    if (index === -1) return;
    patientCareTeam.splice(index, 1);
    if (careTeamEditPanel.dataset.name === name) closeCareTeamEditPanel();
    renderPatientCareTeam();
    renderCareTeamMultiselect();
    return;
  }

  const editBtn = event.target.closest(".care-team-edit-button");
  if (editBtn) {
    event.stopPropagation();
    openCareTeamEditPanel(editBtn.dataset.name);
  }
});

function renderCareTeamMultiselect() {
  const assignedNames = new Set(patientCareTeam.map((member) => member.name));
  careTeamMultiselect.innerHTML = availableCareTeamMembers.filter((member) => !assignedNames.has(member.name)).map((member) => `<label><input type="checkbox" value="${member.name}"> ${member.name}</label>`).join("") || '<span class="care-team-empty-option">All available members are assigned.</span>';
}
function closeCareTeamAddPanel() { careTeamAddPanel.hidden = true; openCareTeamAdd.hidden = false; }

/* Builds the edit panel's content fresh for whichever member's edit icon was
   clicked, mirroring the "+ Add member" flyout's look but with a single role
   select instead of a multiselect. Only one flyout (add or edit) is open at
   a time. */
function openCareTeamEditPanel(name) {
  const member = patientCareTeam.find((item) => item.name === name);
  if (!member) return;
  closeCareTeamAddPanel();

  const currentTitle = member.role.split(" · ")[0];
  careTeamEditPanel.innerHTML = `<span class="care-team-add-label">Edit role &mdash; ${member.name}</span><select class="care-team-role-select">${CARE_TEAM_ROLE_TITLES.map((title) => `<option value="${title}"${title === currentTitle ? " selected" : ""}>${title}</option>`).join("")}</select><div class="care-team-add-actions"><button type="button" class="btn-text care-team-edit-cancel-button">Cancel</button><button type="button" class="care-team-confirm-button care-team-edit-save-button">Save</button></div>`;
  careTeamEditPanel.dataset.name = name;
  careTeamEditPanel.hidden = false;
  openCareTeamAdd.hidden = true;
}

function closeCareTeamEditPanel() {
  careTeamEditPanel.hidden = true;
  careTeamEditPanel.innerHTML = "";
  delete careTeamEditPanel.dataset.name;
  openCareTeamAdd.hidden = false;
}

renderPatientCareTeam();
renderCareTeamMultiselect();
openCareTeamAdd.addEventListener("click", (event) => { event.stopPropagation(); closeCareTeamEditPanel(); careTeamAddPanel.hidden = false; openCareTeamAdd.hidden = true; });
careTeamAddPanel.querySelector(".care-team-cancel-button").addEventListener("click", (event) => { event.stopPropagation(); closeCareTeamAddPanel(); });
careTeamAddPanel.querySelector(".care-team-confirm-button").addEventListener("click", (event) => {
  event.stopPropagation();
  Array.from(careTeamMultiselect.querySelectorAll("input:checked")).map((input) => input.value).forEach((name) => {
    const member = availableCareTeamMembers.find((item) => item.name === name);
    if (member) patientCareTeam.push(member);
  });
  renderPatientCareTeam();
  renderCareTeamMultiselect();
  closeCareTeamAddPanel();
});

careTeamEditPanel.addEventListener("click", (event) => {
  event.stopPropagation();
  if (event.target.closest(".care-team-edit-cancel-button")) {
    closeCareTeamEditPanel();
    return;
  }
  if (event.target.closest(".care-team-edit-save-button")) {
    const name = careTeamEditPanel.dataset.name;
    const member = patientCareTeam.find((item) => item.name === name);
    const select = careTeamEditPanel.querySelector(".care-team-role-select");
    if (member && select) member.role = `${select.value} · Care Team`;
    closeCareTeamEditPanel();
    renderPatientCareTeam();
  }
});

/* ---------------- App & Device Info popover ---------------- */
wireTopbarToggle("appDeviceTrigger", "appDevicePopover");

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
const CHART_H = 150;
const Y = { baseline: 118, active: 71, priority: 62 };

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
const CARE_REC_STATUS = {
  recommended: { label: "Recommended", cls: "rec-status-recommended" },
  "in-progress": { label: "In Progress", cls: "rec-status-progress" },
  completed: { label: "Completed", cls: "rec-status-completed" },
  archived: { label: "Archived", cls: "rec-status-archived" },
};

function timeLabel(d) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return { short: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} · ${h}:${m} ${ampm}`, full: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}` };
}

let careRecIdSeq = 4;
const careRecs = [
  {
    id: 1,
    title: "Increase Furosemide dose",
    medication: "Furosemide",
    currentDose: "40 mg",
    newDose: "60",
    frequency: "Once Daily",
    duration: "3",
    startDate: "2026-08-05",
    instructionsPatient: "Take with breakfast. Weigh yourself each morning and record it in the app.",
    instructionsCareTeam: "Created in error — duplicate of an existing titration plan.",
    invitePatient: false,
    status: "archived",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "05 Aug 2026, 09:10 AM",
    updatedAt: "05 Aug 2026, 09:20 AM",
    pickedUpBy: null,
    activity: [
      { who: "Dr. Sarah Mitchell", when: "05 Aug · 09:10 AM", text: "Created care recommendation." },
      { who: "Dr. Sarah Mitchell", when: "05 Aug · 09:20 AM", label: "Archived", short: "Archived", note: "Created in error — duplicate of an existing titration plan." },
    ],
  },
  {
    id: 2,
    title: "Review Carvedilol titration",
    medication: "Carvedilol",
    currentDose: "6.25 mg",
    newDose: "12.5",
    frequency: "Twice Daily",
    duration: "14",
    startDate: "2026-08-08",
    instructionsPatient: "Take with food, morning and evening. Report any dizziness right away.",
    instructionsCareTeam: "Please review the patient's tolerance to the current Carvedilol dose and report any dizziness, fatigue, or low heart rate readings.",
    invitePatient: false,
    status: "completed",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "08 Aug 2026, 11:00 AM",
    updatedAt: "08 Aug 2026, 02:15 PM",
    pickedUpBy: "Amanda Lee, RN",
    activity: [
      { who: "Dr. Sarah Mitchell", when: "08 Aug · 11:00 AM", text: "Created care recommendation." },
      { who: "Amanda Lee, RN", when: "08 Aug · 11:20 AM", text: "Picked up recommendation." },
      { who: "Amanda Lee, RN", when: "08 Aug · 02:15 PM", label: "Action taken: Patient contacted", short: "Patient contacted", note: "Patient reports mild dizziness on standing; no other symptoms. Heart rate readings within range." },
      { who: "Amanda Lee, RN", when: "08 Aug · 02:15 PM", label: "Marked recommendation as Completed.", short: "Completed" },
    ],
  },
  {
    id: 3,
    title: "Review Furosemide adherence",
    medication: "Furosemide",
    currentDose: "40 mg",
    newDose: "40",
    frequency: "Once Daily",
    duration: "7",
    startDate: "2026-07-30",
    instructionsPatient: "Take every morning with breakfast. Set a daily reminder in the app.",
    instructionsCareTeam: "Review Furosemide adherence with the patient following two missed doses this week.",
    invitePatient: true,
    status: "completed",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "07 Aug 2026, 09:00 AM",
    updatedAt: "07 Aug 2026, 04:10 PM",
    pickedUpBy: "Amanda Lee, RN",
    activity: [
      { who: "Dr. Sarah Mitchell", when: "07 Aug · 09:00 AM", text: "Created care recommendation." },
      { who: "Amanda Lee, RN", when: "07 Aug · 09:40 AM", text: "Picked up recommendation." },
      { who: "Amanda Lee, RN", when: "07 Aug · 11:15 AM", label: "Action taken: Patient contacted", short: "Patient contacted", note: "Patient confirmed the missed doses; reported confusion about the evening dose schedule." },
      { who: "Dr. Sarah Mitchell", when: "07 Aug · 01:00 PM", label: "Added a note", short: "Added a note", note: "Please clarify the evening dose timing with the patient." },
      { who: "Amanda Lee, RN", when: "07 Aug · 03:00 PM", label: "Action taken", short: "Reviewed dose timing", note: "Clarified evening dose timing with the patient; adherence confirmed going forward." },
      { who: "Amanda Lee, RN", when: "07 Aug · 04:10 PM", label: "Marked recommendation as Completed.", short: "Completed" },
    ],
  },
];

function newCareRec(fields, createdBy = "Dr. Sarah Mitchell") {
  const t = timeLabel(new Date());
  return {
    id: careRecIdSeq++,
    title: `${fields.medication} dose change`,
    medication: fields.medication,
    currentDose: fields.currentDose,
    newDose: fields.newDose,
    frequency: fields.frequency,
    duration: fields.duration,
    startDate: fields.startDate,
    instructionsPatient: fields.instructionsPatient,
    instructionsCareTeam: fields.instructionsCareTeam,
    invitePatient: fields.invitePatient,
    assignedCareTeam: fields.assignedCareTeam,
    status: "recommended",
    createdBy,
    createdAt: t.full,
    updatedAt: t.full,
    pickedUpBy: null,
    activity: [{ who: createdBy, when: t.short, text: "Created care recommendation." }],
  };
}

let careRecFilter = "all"; // all | recommended | in-progress | completed
let activeRecId = null;

function careRecLatest(rec) {
  if (rec.status === "recommended") return { primary: "Awaiting action", secondary: "Available to care team" };
  const last = rec.activity[rec.activity.length - 1];
  return { primary: last.who, secondary: last.short || last.label || last.text };
}

function careRecMatchesFilter(rec) {
  if (careRecFilter === "all") return true;
  return rec.status === careRecFilter;
}

function hasActiveCareRec() {
  return careRecs.some((r) => r.status === "recommended" || r.status === "in-progress");
}

function updateCareRecTriggers() {
  const blocked = hasActiveCareRec();
  const tooltip = "Resolve the active recommendation before creating a new one.";

  const careBtn = document.getElementById("openCareRecBtn");
  if (careBtn) {
    careBtn.disabled = false;
    careBtn.title = "";
    careBtn.textContent = blocked ? "View Recommendation" : "Care Recommendation";
  }

  const addLink = document.getElementById("openAddRecBtn");
  if (addLink) {
    addLink.classList.toggle("is-disabled", blocked);
    addLink.title = blocked ? tooltip : "";
  }
}

function goToCareRecList() {
  document.querySelector('.data-tab[data-tab="clinical"]')?.click();
  document.querySelector('.subtab[data-subtab="care-rec"]')?.click();
}

document.getElementById("openCareRecBtn").addEventListener("click", (e) => {
  if (!hasActiveCareRec()) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  goToCareRecList();
  const activeRec = careRecs.find((r) => r.status === "in-progress") || careRecs.find((r) => r.status === "recommended");
  if (activeRec) openRecDrawer(activeRec.id);
});

function renderCareRecs() {
  document.getElementById("careRecCount").textContent = careRecs.length;
  updateCareRecTriggers();

  const list = careRecs
    .filter(careRecMatchesFilter)
    .slice()
    .sort((a, b) => (a.status === "archived") - (b.status === "archived"));
  document.getElementById("careRecTableBody").innerHTML = list.length
    ? list
        .map((rec) => {
          const meta = CARE_REC_STATUS[rec.status];
          const latest = careRecLatest(rec);
          return `
          <tr>
            <td><span class="rec-title-cell">${rec.title}</span></td>
            <td><span class="rec-status-chip ${meta.cls}">${meta.label}</span></td>
            <td>${rec.createdBy}</td>
            <td>
              <div class="rec-latest">
                <span class="rec-latest-primary">${latest.primary}</span>
                <span class="rec-latest-secondary">${latest.secondary}</span>
              </div>
            </td>
            <td>${rec.updatedAt}</td>
            <td>
              <div class="rec-row-actions">
                <button type="button" class="btn-open rec-view-btn" data-rec-id="${rec.id}">View</button>
                <button type="button" class="btn-open rec-edit-btn" data-rec-id="${rec.id}">Edit</button>
              </div>
            </td>
          </tr>`;
        })
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No care recommendations in this view.</td></tr>`;
}

function renderRecTimeline(rec) {
  return rec.activity
    .map(
      (a) => `
      <div class="rec-timeline-item">
        <div class="rec-timeline-dot"></div>
        <div class="rec-timeline-content">
          <div class="rec-timeline-when">${a.when}</div>
          <div class="rec-timeline-who">${a.who}</div>
          <div class="rec-timeline-text${a.label ? " rec-timeline-label" : ""}">${a.label || a.text || ""}</div>
          ${a.note ? `<div class="rec-timeline-note">${a.note}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
}

function openRecDrawer(id) {
  const rec = careRecs.find((r) => r.id === id);
  if (!rec) return;
  activeRecId = id;
  const meta = CARE_REC_STATUS[rec.status];

  document.getElementById("recDrawerTitle").textContent = rec.title;
  const statusEl = document.getElementById("recDrawerStatus");
  statusEl.textContent = meta.label;
  statusEl.className = `rec-status-chip ${meta.cls}`;

  document.getElementById("recDrawerMedication").textContent = rec.medication || "—";
  document.getElementById("recDrawerDoseChange").textContent = rec.currentDose ? `${rec.currentDose} → ${rec.newDose} mg` : `${rec.newDose} mg`;
  document.getElementById("recDrawerFrequency").textContent = rec.frequency || "—";
  document.getElementById("recDrawerDuration").textContent = rec.duration ? `${rec.duration} days` : "—";
  document.getElementById("recDrawerStartDate").textContent = rec.startDate || "—";
  document.getElementById("recDrawerInvite").textContent = rec.invitePatient ? "Yes" : "No";
  document.getElementById("recDrawerCareTeam").textContent = rec.assignedCareTeam && rec.assignedCareTeam.length ? rec.assignedCareTeam.join(", ") : "—";

  document.getElementById("recDrawerInstructionPatient").textContent = rec.instructionsPatient || "—";
  document.getElementById("recDrawerInstructionCareTeam").textContent = rec.instructionsCareTeam || "—";

  const actionTakenSection = document.getElementById("recDrawerActionTakenSection");
  if (rec.actionTaken) {
    actionTakenSection.style.display = "";
    document.getElementById("recDrawerActionTaken").textContent = rec.actionTaken;
  } else {
    actionTakenSection.style.display = "none";
  }

  document.getElementById("recDrawerCreatedBy").textContent = rec.createdBy;
  document.getElementById("recDrawerCreatedAt").textContent = rec.createdAt;
  document.getElementById("recDrawerUpdatedAt").textContent = rec.updatedAt;
  document.getElementById("recDrawerPickedUp").textContent = rec.pickedUpBy || "Not yet assigned";
  document.getElementById("recDrawerAck").textContent = rec.patientAcknowledgedAt ? `Yes · ${rec.patientAcknowledgedAt}` : "Not yet acknowledged";

  const completedByWrap = document.getElementById("recDrawerCompletedByWrap");
  const completedOnWrap = document.getElementById("recDrawerCompletedOnWrap");
  if (rec.status === "completed") {
    completedByWrap.style.display = "";
    completedOnWrap.style.display = "";
    document.getElementById("recDrawerCompletedBy").textContent = rec.completedBy || "—";
    document.getElementById("recDrawerCompletedOn").textContent = rec.completedOn || "—";
  } else {
    completedByWrap.style.display = "none";
    completedOnWrap.style.display = "none";
  }

  document.getElementById("recDrawerTimeline").innerHTML = renderRecTimeline(rec);

  document.getElementById("recDrawerOverlay").classList.add("open");
}

function closeRecDrawer() {
  document.getElementById("recDrawerOverlay").classList.remove("open");
  activeRecId = null;
}

document.getElementById("closeRecDrawer").addEventListener("click", closeRecDrawer);
document.getElementById("recDrawerOverlay").addEventListener("click", (e) => {
  if (e.target.id === "recDrawerOverlay") closeRecDrawer();
});

document.getElementById("careRecTableBody").addEventListener("click", (e) => {
  const viewBtn = e.target.closest(".rec-view-btn");
  if (viewBtn) {
    openRecDrawer(Number(viewBtn.dataset.recId));
    return;
  }

  const editBtn = e.target.closest(".rec-edit-btn");
  if (editBtn) {
    openEditRecModal(Number(editBtn.dataset.recId));
  }
});

document.getElementById("careRecStatusFilter").addEventListener("change", (e) => {
  careRecFilter = e.target.value;
  renderCareRecs();
});
renderCareRecs();

/* ---------------- EHR-integrated data: sync affordance ---------------- */
function ehrSourceCell(source) {
  if (source === "Manual entry" || source === "HearO") {
    return `<span class="profile-field-source">${source}</span>`;
  }
  return `<span class="profile-field-source"><span class="ehr-connected-dot" style="width:6px;height:6px;"></span>${source}</span>`;
}

function wireSyncButton(btnId, onSynced) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  const label = btn.querySelector(".btn-sync-label");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("is-syncing")) return;
    btn.classList.add("is-syncing");
    if (label) label.textContent = "Syncing…";
    setTimeout(() => {
      btn.classList.remove("is-syncing");
      if (label) label.textContent = "Sync with EHR";
      if (onSynced) onSynced();
    }, 900);
  });
}

function renderProfileGrid(containerId, fields) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = fields
    .map(
      (f) => `
      <div class="profile-field">
        <span class="profile-field-label">${f.label}</span>
        <span class="profile-field-value">${f.value}</span>
      </div>`
    )
    .join("");
}

["openAddRelatedPersonBtn", "openAddCareTeamMemberBtn"].forEach((id) => {
  document.getElementById(id)?.addEventListener("click", (e) => e.preventDefault());
});

/* Patient card EHR Sync: this patient's records sync from Epic (matches
   the "source" shown on Conditions/Allergies/etc. rows below). */
const connectedEhrName = "Epic";
const cardLastSynced = document.getElementById("cardLastSynced");
wireSyncButton("syncCardBtn", () => {
  if (cardLastSynced) {
    cardLastSynced.innerHTML = `
      <span class="ehr-last-synced-line">Last synced with <strong>${connectedEhrName}</strong></span>
      <span class="ehr-last-synced-line">Just now</span>`;
  }
});

/* ---------------- Clinical: Conditions ---------------- */
const conditions = [
  { name: "Heart Failure with reduced Ejection Fraction", code: "I50.22", status: "active", type: "Chronic", onset: "03/15/2024", source: "Epic", updated: "08/17/2026" },
  { name: "Hypertension", code: "I10", status: "active", type: "Chronic", onset: "06/02/2020", source: "Epic", updated: "08/17/2026" },
  { name: "Type 2 Diabetes Mellitus", code: "E11.9", status: "active", type: "Chronic", onset: "01/10/2022", source: "Epic", updated: "08/17/2026" },
  { name: "Seasonal Allergic Rhinitis", code: "J30.2", status: "resolved", type: "Acute", onset: "04/12/2019", source: "Manual entry", updated: "06/03/2025" },
];

function renderConditions() {
  document.getElementById("conditionsTableBody").innerHTML = conditions.length
    ? conditions
        .map(
          (c) => `
      <tr>
        <td><span class="rec-title-cell">${c.name}</span></td>
        <td>${c.code}</td>
        <td><span class="rec-status-chip rec-status-${c.status}">${c.status === "active" ? "Active" : "Resolved"}</span></td>
        <td>${c.type}</td>
        <td>${c.onset}</td>
        <td>${ehrSourceCell(c.source)}</td>
        <td>${c.updated}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7" class="rec-empty">No conditions on file.</td></tr>`;
}
renderConditions();

/* ---------------- Clinical: Allergies ---------------- */
const allergies = [
  { allergen: "Penicillin", reaction: "Hives", severity: "severe", onset: "—", source: "Epic", updated: "08/10/2026" },
  { allergen: "Pollen", reaction: "Fever", severity: "moderate", onset: "08/04/2026", source: "Epic", updated: "08/17/2026" },
  { allergen: "Shellfish", reaction: "Nausea", severity: "mild", onset: "—", source: "Manual entry", updated: "07/02/2025" },
];

function renderAllergies() {
  document.getElementById("allergiesTableBody").innerHTML = allergies.length
    ? allergies
        .map(
          (a) => `
      <tr>
        <td><span class="rec-title-cell">${a.allergen}</span></td>
        <td>${a.reaction}</td>
        <td><span class="rec-status-chip rec-status-${a.severity}">${a.severity[0].toUpperCase()}${a.severity.slice(1)}</span></td>
        <td>${a.onset}</td>
        <td>${ehrSourceCell(a.source)}</td>
        <td>${a.updated}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No known allergies on file.</td></tr>`;
}
renderAllergies();

/* ---------------- Clinical: Care Plan ---------------- */
const carePlans = [
  { name: "Heart Failure Management Plan", status: "active", start: "01/15/2026", review: "09/15/2026", owner: "Dr. Sarah Mitchell", source: "Epic" },
  { name: "Diabetes Self-Management Plan", status: "active", start: "03/01/2026", review: "09/01/2026", owner: "Amanda Lee, RN", source: "Epic" },
];

function renderCarePlans() {
  document.getElementById("carePlanTableBody").innerHTML = carePlans.length
    ? carePlans
        .map(
          (p) => `
      <tr>
        <td><span class="rec-title-cell">${p.name}</span></td>
        <td><span class="rec-status-chip rec-status-${p.status}">${p.status === "active" ? "Active" : "Completed"}</span></td>
        <td>${p.start}</td>
        <td>${p.review}</td>
        <td>${p.owner}</td>
        <td>${ehrSourceCell(p.source)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No care plans on file.</td></tr>`;
}
renderCarePlans();

/* ---------------- Clinical: Goals ---------------- */
const goals = [
  { goal: "Maintain daily weight within 2 lbs of baseline", target: "≤ 2 lbs variance", progress: "on-track", due: "09/30/2026", owner: "Patient", source: "HearO" },
  { goal: "Reduce sodium intake to under 2g/day", target: "< 2 g/day", progress: "at-risk", due: "09/30/2026", owner: "Dietitian", source: "Epic" },
  { goal: "Complete cardiac rehabilitation program", target: "12 sessions", progress: "on-track", due: "10/31/2026", owner: "Care Team", source: "Epic" },
];

const GOAL_PROGRESS_LABEL = { "on-track": "On Track", "at-risk": "At Risk", achieved: "Achieved", "not-met": "Not Met" };

function renderGoals() {
  document.getElementById("goalsTableBody").innerHTML = goals.length
    ? goals
        .map(
          (g) => `
      <tr>
        <td><span class="rec-title-cell">${g.goal}</span></td>
        <td>${g.target}</td>
        <td><span class="rec-status-chip rec-status-${g.progress}">${GOAL_PROGRESS_LABEL[g.progress]}</span></td>
        <td>${g.due}</td>
        <td>${g.owner}</td>
        <td>${ehrSourceCell(g.source)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No goals on file.</td></tr>`;
}
renderGoals();

/* ---------------- Clinical: Documents ---------------- */
const clinicalDocuments = [
  { name: "Discharge Summary", type: "Discharge Summary", date: "08/12/2026", source: "Epic", added: "08/17/2026" },
  { name: "Cardiology Consult Note", type: "Consult Note", date: "07/28/2026", source: "Epic", added: "08/17/2026" },
  { name: "Echocardiogram Report", type: "Diagnostic Report", date: "06/15/2026", source: "Epic", added: "08/17/2026" },
];

function renderDocuments() {
  document.getElementById("documentsTableBody").innerHTML = clinicalDocuments.length
    ? clinicalDocuments
        .map(
          (d) => `
      <tr>
        <td><span class="rec-title-cell">${d.name}</span></td>
        <td>${d.type}</td>
        <td>${d.date}</td>
        <td>${ehrSourceCell(d.source)}</td>
        <td>${d.added}</td>
        <td><button type="button" class="btn-open">View</button></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No documents on file.</td></tr>`;
}
renderDocuments();

/* ---------------- Patient Profile: Demographics ---------------- */
const demographicsFields = [
  { label: "Onboarding Date", value: "12/01/2025" },
  { label: "MRN", value: "ABC-123" },
  { label: "SSN", value: "•••-••-4471" },
  { label: "Language", value: "English" },
  { label: "Date of Birth", value: "04/12/1955" },
  { label: "Gender", value: "Female" },
  { label: "Marital Status", value: "Married" },
  { label: "Race", value: "White" },
  { label: "Ethnicity", value: "Not Hispanic or Latino" },
  { label: "Risk Score", value: "62 / 100" },
  { label: "Risk Level", value: "Moderate" },
  { label: "Preferred Location", value: "B01 — Main Clinic" },
];
renderProfileGrid("demographicsGrid", demographicsFields);

/* ---------------- Patient Profile: Contact Information ---------------- */
const contactFields = [
  { label: "Primary Phone Number", value: "+1 (415) 555-0132" },
  { label: "Secondary Phone Number", value: "—" },
  { label: "Work Phone Number", value: "+1 (415) 555-0177" },
  { label: "Home Phone Number", value: "—" },
  { label: "Email", value: "sarah.white@gmail.com" },
  { label: "Mailing Address", value: "482 Willow Creek Dr, San Mateo, CA 94402" },
  { label: "Default Communication Channel", value: "SMS" },
];
renderProfileGrid("contactGrid", contactFields);

const consentOptions = [
  { label: "Consent to Message", checked: true },
  { label: "Consent to Email", checked: true },
  { label: "Consent to Call", checked: false },
  { label: "Enable Call Recording", checked: true },
];
document.getElementById("contactConsentList").innerHTML = consentOptions
  .map(
    (c, i) => `
    <label class="profile-consent-item">
      ${c.label}
      <input type="checkbox" ${c.checked ? "checked" : ""} data-consent-idx="${i}" />
    </label>`
  )
  .join("");

/* ---------------- Patient Profile: Insurance ---------------- */
const insurancePlans = [
  { payer: "UnitedHealthcare Medicare Advantage", planType: "Medicare Advantage", memberId: "UHC-88213456", group: "GRP-4021", effective: "01/01/2026", status: "active", source: "Epic" },
  { payer: "Blue Cross Blue Shield PPO", planType: "Commercial PPO — Secondary", memberId: "BCBS-7729841", group: "GRP-1187", effective: "01/01/2025", status: "active", source: "Epic" },
];

function renderInsurance() {
  document.getElementById("insuranceTableBody").innerHTML = insurancePlans.length
    ? insurancePlans
        .map(
          (p) => `
      <tr>
        <td><span class="rec-title-cell">${p.payer}</span></td>
        <td>${p.planType}</td>
        <td>${p.memberId}</td>
        <td>${p.group}</td>
        <td>${p.effective}</td>
        <td><span class="rec-status-chip rec-status-active">Active</span></td>
        <td>${ehrSourceCell(p.source)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="7" class="rec-empty">No insurance on file.</td></tr>`;
}
renderInsurance();

/* ---------------- Patient Profile: Related Persons ---------------- */
const relatedPersons = [
  { name: "Robert White", relationship: "Spouse", phone: "+1 (415) 555-0199", email: "robert.white@gmail.com", primary: true, source: "Epic" },
  { name: "Emily White", relationship: "Daughter", phone: "+1 (415) 555-0148", email: "—", primary: false, source: "Manual entry" },
];

function renderRelatedPersons() {
  document.getElementById("relatedPersonsTableBody").innerHTML = relatedPersons.length
    ? relatedPersons
        .map(
          (p) => `
      <tr>
        <td><span class="rec-title-cell">${p.name}</span></td>
        <td>${p.relationship}</td>
        <td>${p.phone}</td>
        <td>${p.email}</td>
        <td>${p.primary ? "Yes" : "No"}</td>
        <td>${ehrSourceCell(p.source)}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" class="rec-empty">No related persons on file.</td></tr>`;
}
renderRelatedPersons();

/* ---------------- Patient Profile: Care Team ---------------- */
const careTeamProfile = [
  { name: "Dr. Sarah Mitchell", role: "Doctor", team: "Heart Failure Team", phone: "+1 (415) 555-0110", email: "s.mitchell@medclinic.com" },
  { name: "Amanda Lee", role: "Nurse · Care Team", team: "Heart Failure Team", phone: "+1 (415) 555-0121", email: "a.lee@medclinic.com" },
  { name: "Ayelet Er", role: "Nurse · Care Team", team: "Heart Failure Team", phone: "+1 (415) 555-0132", email: "a.er@medclinic.com" },
  { name: "Sandy Kohl", role: "Nurse · Care Team", team: "Heart Failure Team", phone: "+1 (415) 555-0143", email: "s.kohl@medclinic.com" },
];

function renderCareTeamProfile() {
  document.getElementById("careTeamProfileTableBody").innerHTML = careTeamProfile.length
    ? careTeamProfile
        .map(
          (m) => `
      <tr>
        <td><span class="rec-title-cell">${m.name}</span></td>
        <td>${m.role}</td>
        <td>${m.team}</td>
        <td>${m.phone}</td>
        <td>${m.email}</td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5" class="rec-empty">No care team members assigned.</td></tr>`;
}
renderCareTeamProfile();

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

/* ---------------- Care Recommendation: Edit ---------------- */
const editRecMedicationMenu = document.getElementById("editRecMedicationMenu");
editRecMedicationMenu.innerHTML = medications
  .map(
    (m) => `
    <div class="custom-select-option" data-value="${m.name}">${m.name}<svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
  )
  .join("");

document.getElementById("editRecMedicationSelect").addEventListener("change", (e) => {
  const med = medications.find((m) => m.name === e.target.value);
  document.getElementById("editRecCurrentDose").value = med ? med.dose : "—";
});

const editRecCareTeamField = document.getElementById("editRecCareTeamField");
const editRecCareTeamTrigger = editRecCareTeamField.querySelector(".care-team-trigger");
const editRecCareTeamValueEl = editRecCareTeamField.querySelector(".care-team-trigger-value");
const editRecCareTeamMenu = editRecCareTeamField.querySelector(".care-team-menu");
const editRecCareTeamHidden = editRecCareTeamField.querySelector('input[name="careTeam"]');
const editRecCareTeamPlaceholder = "Select care team";

editRecCareTeamTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !editRecCareTeamField.classList.contains("open");
  document.querySelectorAll(".checkbox-filter.open, .care-team-field.open").forEach((el) => el.classList.remove("open"));
  editRecCareTeamField.classList.toggle("open", willOpen);
});
editRecCareTeamMenu.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => editRecCareTeamField.classList.remove("open"));

function syncEditRecCareTeam() {
  const selected = Array.from(editRecCareTeamMenu.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
  editRecCareTeamHidden.value = selected.join(", ");
  editRecCareTeamValueEl.textContent = selected.length ? `${selected.length} selected` : editRecCareTeamPlaceholder;
  editRecCareTeamValueEl.classList.toggle("placeholder", !selected.length);
}
editRecCareTeamMenu.addEventListener("change", syncEditRecCareTeam);

const editRecOverlay = document.getElementById("editRecOverlay");
const editRecForm = document.getElementById("editRecForm");
let editingRecId = null;

function openEditRecModal(id) {
  const rec = careRecs.find((r) => r.id === id);
  if (!rec) return;

  editingRecId = id;
  editRecForm.reset();
  resetCustomSelectsIn(editRecForm);

  setCustomSelectValue(editRecForm.querySelector('.custom-select[data-name="medication"]'), rec.medication || "", { silent: true });
  document.getElementById("editRecCurrentDose").value = rec.currentDose || "—";
  editRecForm.newDose.value = rec.newDose || "";
  setCustomSelectValue(editRecForm.querySelector('.custom-select[data-name="frequency"]'), rec.frequency || "", { silent: true });
  editRecForm.duration.value = rec.duration || "";
  editRecForm.startDate.value = rec.startDate || "";
  editRecForm.instructionsPatient.value = rec.instructionsPatient || "";
  editRecForm.instructionsCareTeam.value = rec.instructionsCareTeam || "";
  editRecForm.invitePatient.checked = !!rec.invitePatient;

  editRecCareTeamMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.checked = (rec.assignedCareTeam || []).includes(cb.value);
  });
  syncEditRecCareTeam();

  editRecOverlay.classList.add("open");
}

function closeEditRecModal() {
  editRecOverlay.classList.remove("open");
  editingRecId = null;
}

document.getElementById("cancelEditRec").addEventListener("click", closeEditRecModal);
editRecOverlay.addEventListener("click", (e) => { if (e.target === editRecOverlay) closeEditRecModal(); });

editRecForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const rec = careRecs.find((r) => r.id === editingRecId);
  if (!rec) return;

  const fd = new FormData(editRecForm);
  const t = timeLabel(new Date());

  rec.medication = fd.get("medication");
  rec.title = `${rec.medication} dose change`;
  rec.currentDose = document.getElementById("editRecCurrentDose").value;
  rec.newDose = fd.get("newDose");
  rec.frequency = fd.get("frequency");
  rec.duration = fd.get("duration");
  rec.startDate = fd.get("startDate");
  rec.instructionsPatient = fd.get("instructionsPatient");
  rec.instructionsCareTeam = fd.get("instructionsCareTeam");
  rec.invitePatient = fd.get("invitePatient") === "on";
  rec.assignedCareTeam = (fd.get("careTeam") || "").split(", ").filter(Boolean);
  rec.updatedAt = t.full;
  rec.activity.push({ who: rec.createdBy, when: t.short, label: "Updated care recommendation.", short: "Updated" });

  renderCareRecs();
  closeEditRecModal();
  if (document.getElementById("recDrawerOverlay").classList.contains("open") && activeRecId === rec.id) {
    openRecDrawer(rec.id);
  }
});

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

    scope.querySelectorAll("[data-subtab-actions]").forEach((actions) => {
      actions.style.display = actions.dataset.subtabActions === target ? "flex" : "none";
    });
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

/* ---------------- History events ---------------- */
// Account-status changes made from the Patient List's "Update account" modal
// (Pause / Discontinue) are stored in localStorage so they show up here too,
// on whichever patient's chart is opened next.
const pendingAccountHistory = JSON.parse(localStorage.getItem("hearoAccountHistory") || "[]");
localStorage.removeItem("hearoAccountHistory");

let history = [
  ...pendingAccountHistory,

  // Status
  { category: "status", color: "dot-red", label: "Status changed to Priority", date: "01.09.2026" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.24.2025" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.16.2025" },
  { category: "status", color: "dot-gray", label: "Status changed to Baseline", date: "12.01.2025" },
  { category: "status", color: "dot-darkgray", label: "Status changed to Registered", date: "12.01.2025" },

  // Monitoring
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "01.03.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "01.01.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "12.30.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.23.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.21.2025", note: "Amanda Lee, RN: Patient forgot to record" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Missed recording", date: "12.20.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.16.2025" },
  { category: "monitoring", color: "dot-teal", label: "Baseline phase monitoring", date: "12.01.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.01.2025" },

  // Other
  { category: "other", color: "dot-blue", label: "Care recommendation created: Increase Furosemide dose", date: "01.09.2026", note: "Dr. Sarah Mitchell: 2.1 kg weight gain over 3 days with rising respiration rate" },
  { category: "other", color: "dot-blue", label: "Care recommendation action taken: Patient contacted", date: "01.03.2026", note: "Amanda Lee, RN: Reviewed Carvedilol tolerance; mild dizziness reported, no other symptoms" },
  { category: "other", color: "dot-blue", label: "Message sent to patient", date: "01.03.2026", note: "Sent by Ayelet Er, NP. Seen 01.03.2026, 01:12 PM" },
  { category: "other", color: "dot-blue", label: "Message sent to patient", date: "01.02.2026", note: "Seen 01.02.2026, 11:22 AM" },
  { category: "other", color: "dot-blue", label: "Action taken: Contacted", date: "12.20.2025", note: "Ayelet Er, NP: Patient forgot to record; reminder sent" },
  { category: "other", color: "dot-blue", label: "Operational difficulty", date: "12.10.2025", note: "Sandy Kohl, RN: Patient reported transportation issues and is unable to attend clinic visits" },

  // Account
  { category: "account", color: "dot-blue", label: "Account changed to Enabled", date: "12.28.2025", note: "Changed by Dr. Sarah Mitchell" },
  { category: "account", color: "dot-slate", label: "Account changed to Paused", date: "12.20.2025", note: "Changed by Dr. Sarah Mitchell" },
  { category: "account", color: "dot-blue", label: "Account is Enabled", date: "08.28.2025" },
];

function parseHistoryDate(str) {
  const [m, d, y] = str.split(".").map(Number);
  return new Date(y, m - 1, d).getTime();
}

const HISTORY_PAGE_SIZE = 12;
let activeHistoryTab = "all";
let historyVisibleCount = HISTORY_PAGE_SIZE;

function filteredHistory() {
  const items = activeHistoryTab === "all" ? history : history.filter((h) => h.category === activeHistoryTab);
  return [...items].sort((a, b) => parseHistoryDate(b.date) - parseHistoryDate(a.date));
}

function renderHistory() {
  const items = filteredHistory();
  const visible = items.slice(0, historyVisibleCount);

  document.getElementById("historyRows").innerHTML = visible
    .map(
      (h, i) => `
    <tr>
      <td><span class="event-dot"><span class="dot ${h.color}"></span>${h.label}</span></td>
      <td>${h.date}</td>
      <td>${
        h.note
          ? h.note
          : `<button type="button" class="add-note-link" data-index="${history.indexOf(h)}"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Add Note</button>`
      }</td>
    </tr>`
    )
    .join("");

  const loadMoreRow = document.getElementById("historyLoadMoreRow");
  loadMoreRow.style.display = items.length > historyVisibleCount ? "flex" : "none";

  fitTableToRows(".history-table-scroll", 6);
}

renderHistory();

document.querySelectorAll(".history-tabs span").forEach((t) => {
  t.addEventListener("click", () => {
    document.querySelectorAll(".history-tabs span").forEach((s) => s.classList.remove("active"));
    t.classList.add("active");
    activeHistoryTab = t.dataset.tab;
    historyVisibleCount = HISTORY_PAGE_SIZE;
    renderHistory();
  });
});

document.getElementById("historyLoadMoreBtn").addEventListener("click", () => {
  historyVisibleCount += HISTORY_PAGE_SIZE;
  renderHistory();
});

/* ---------------- Add Event modal ---------------- */
const addEventOverlay = document.getElementById("addEventOverlay");
const addEventForm = document.getElementById("addEventForm");
const saveAddEvent = document.getElementById("saveAddEvent");

const CATEGORY_DOT = { account: "dot-blue", status: "dot-green", monitoring: "dot-teal", other: "dot-blue" };

function validateAddEventForm() {
  const valid = addEventForm.category.value !== "" && addEventForm.label.value.trim() !== "" && addEventForm.date.value !== "";
  saveAddEvent.disabled = !valid;
  saveAddEvent.classList.toggle("enabled", valid);
}

addEventForm.addEventListener("input", validateAddEventForm);
addEventForm.addEventListener("change", validateAddEventForm);

document.getElementById("openAddEventBtn").addEventListener("click", () => {
  addEventForm.reset();
  resetCustomSelectsIn(addEventForm);
  validateAddEventForm();
  addEventOverlay.classList.add("open");
});

function closeAddEventModal() { addEventOverlay.classList.remove("open"); }
document.getElementById("cancelAddEvent").addEventListener("click", closeAddEventModal);
addEventOverlay.addEventListener("click", (e) => { if (e.target === addEventOverlay) closeAddEventModal(); });

addEventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddEvent.disabled) return;

  const [y, m, d] = addEventForm.date.value.split("-");
  history.unshift({
    category: addEventForm.category.value,
    color: CATEGORY_DOT[addEventForm.category.value],
    label: addEventForm.label.value.trim(),
    date: `${m}.${d}.${y}`,
    note: addEventForm.note.value.trim() || undefined,
  });

  closeAddEventModal();
  renderHistory();
});

/* ---------------- Add Note modal ---------------- */
const addNoteOverlay = document.getElementById("addNoteOverlay");
const addNoteForm = document.getElementById("addNoteForm");
const saveAddNote = document.getElementById("saveAddNote");
let addNoteTargetIndex = null;

function validateAddNoteForm() {
  const valid = addNoteForm.note.value.trim() !== "";
  saveAddNote.disabled = !valid;
  saveAddNote.classList.toggle("enabled", valid);
}

addNoteForm.addEventListener("input", validateAddNoteForm);

function closeAddNoteModal() { addNoteOverlay.classList.remove("open"); }
document.getElementById("cancelAddNote").addEventListener("click", closeAddNoteModal);
addNoteOverlay.addEventListener("click", (e) => { if (e.target === addNoteOverlay) closeAddNoteModal(); });

document.getElementById("historyRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-note-link");
  if (!btn) return;
  addNoteTargetIndex = Number(btn.dataset.index);
  addNoteForm.reset();
  validateAddNoteForm();
  document.getElementById("addNoteEventLabel").textContent = history[addNoteTargetIndex].label;
  addNoteOverlay.classList.add("open");
});

addNoteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddNote.disabled || addNoteTargetIndex === null) return;
  history[addNoteTargetIndex].note = addNoteForm.note.value.trim();
  closeAddNoteModal();
  renderHistory();
});

/* ---------------- Chat panel ---------------- */
const chatMessages = [
  { type: "out", name: "Emily Colley", time: "11:10 AM", text: "Hello Alex, how do you feel today?", seen: "Seen 01.21.2026, 7:12 AM" },
  { type: "in", time: "11:11 AM", text: "I feel good" },
  { type: "sep", label: "Yesterday" },
  { type: "out", name: "Dr. Alex Sholl", time: "09:08 AM", text: "Hello Alex, how is you breathe today?", seen: "Seen 01.25.2026, 11:22 AM" },
  { type: "in", time: "11:25 AM", text: "I'm having a little trouble breathing" },
];

const chatMessagesEl = document.getElementById("chatMessages");
const chatEmptyStateEl = document.getElementById("chatEmptyState");

function renderChatMessages() {
  chatEmptyStateEl.hidden = chatMessages.length > 0;
  chatMessagesEl.hidden = chatMessages.length === 0;
  chatMessagesEl.innerHTML = chatMessages
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
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

renderChatMessages();

const chatPanel = document.getElementById("chatPanel");
document.getElementById("chatOpenBtn").addEventListener("click", () => chatPanel.classList.add("open"));
document.getElementById("chatCloseBtn").addEventListener("click", () => chatPanel.classList.remove("open"));

function chatNowTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function addOutgoingChatMessage(text) {
  chatMessages.push({ type: "out", name: "Dr. Alex Sholl", time: chatNowTime(), text });
  renderChatMessages();
}

const chatInputField = document.getElementById("chatInputField");
document.getElementById("chatSendBtn").addEventListener("click", () => {
  const text = chatInputField.value.trim();
  if (!text) return;
  addOutgoingChatMessage(text);
  chatInputField.value = "";
});
chatInputField.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("chatSendBtn").click();
  }
});

const chatPlusBtn = document.getElementById("chatPlusBtn");
const chatPlusMenu = document.getElementById("chatPlusMenu");
chatPlusBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  chatPlusMenu.classList.toggle("open");
});
document.addEventListener("click", (e) => {
  if (!chatPlusMenu.contains(e.target) && e.target !== chatPlusBtn) chatPlusMenu.classList.remove("open");
});
chatPlusMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".chat-plus-menu-item");
  if (!item) return;
  chatPlusMenu.classList.remove("open");
  const label = item.dataset.request === "image" ? "Requested an image" : "Requested a video";
  addOutgoingChatMessage(label);
});

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

function wireAddModal(overlayId, formId, cancelId, openBtnId, onSubmit, options = {}) {
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

  const openBtnIds = Array.isArray(openBtnId) ? openBtnId : [openBtnId];
  openBtnIds.forEach((id) => {
    document.getElementById(id).addEventListener("click", (e) => {
      e.preventDefault();
      if (options.canOpen && !options.canOpen()) return;
      open();
    });
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


/* ---------------- Add Measurement modal ---------------- */
const WEIGHT_RANGE = {
  kg: { min: 1, max: 300, placeholder: "e.g. 75" },
  lbs: { min: 2, max: 660, placeholder: "e.g. 165" },
};

const measurementWeightUnitToggle = document.getElementById("measurementWeightUnitToggle");
const measurementWeightUnitInput = document.getElementById("measurementWeightUnit");
const measurementWeightValueInput = document.getElementById("measurementWeightValue");

function setMeasurementWeightUnit(unit) {
  measurementWeightUnitInput.value = unit;
  measurementWeightUnitToggle.querySelectorAll("span").forEach((btn) => btn.classList.toggle("active", btn.dataset.unit === unit));
  measurementWeightValueInput.min = WEIGHT_RANGE[unit].min;
  measurementWeightValueInput.max = WEIGHT_RANGE[unit].max;
  measurementWeightValueInput.placeholder = WEIGHT_RANGE[unit].placeholder;
}

measurementWeightUnitToggle.querySelectorAll("span").forEach((btn) => {
  btn.addEventListener("click", () => setMeasurementWeightUnit(btn.dataset.unit));
});

wireAddModal("addMeasurementOverlay", "addMeasurementForm", "cancelAddMeasurement", "openAddMeasurementBtn", (fd) => {
  const parts = [];
  if (fd.get("systolic") && fd.get("diastolic")) parts.push(`BP ${fd.get("systolic")}/${fd.get("diastolic")} mmHG`);
  if (fd.get("heartRateValue")) parts.push(`Heart Rate ${fd.get("heartRateValue")} bpm`);
  if (fd.get("bloodOxygenValue")) parts.push(`Blood Oxygen ${fd.get("bloodOxygenValue")}%`);
  if (fd.get("weightValue")) parts.push(`Weight ${fd.get("weightValue")} ${fd.get("weightUnit")}`);
  alert(parts.length ? `Measurement added: ${parts.join(", ")}` : "No measurement values entered");
});

document.getElementById("openAddMeasurementBtn").addEventListener("click", () => setMeasurementWeightUnit(weightUnit));

/* ---------------- Patient header kebab menu ---------------- */
const patientHeaderKebab = document.getElementById("patientHeaderKebab");
const patientHeaderMenu = document.getElementById("patientHeaderMenu");

if (patientHeaderKebab && patientHeaderMenu) {
  patientHeaderKebab.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !patientHeaderMenu.classList.contains("open");
    patientHeaderMenu.classList.remove("open");
    if (willOpen) {
      const rect = patientHeaderKebab.getBoundingClientRect();
      patientHeaderMenu.style.top = `${rect.bottom + 6}px`;
      patientHeaderMenu.style.left = `${rect.right - 190}px`;
      patientHeaderMenu.classList.add("open");
    }
  });

  patientHeaderMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    if (e.target.closest(".row-menu-item")) patientHeaderMenu.classList.remove("open");
  });

  document.addEventListener("click", (e) => {
    if (!patientHeaderMenu.contains(e.target) && e.target !== patientHeaderKebab) {
      patientHeaderMenu.classList.remove("open");
    }
  });
}
