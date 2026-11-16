/* Backoffice-safe fork of ../../js/patient-data.js (the root Patient Data chart).
   Why forked instead of shared: the root file mixes patient PHI (name, contact
   details, medication, care-recommendation, questionnaire-answer and chat
   content) into the render logic for every tab, so it cannot be reused
   unmodified. Re-synced with the root file; this fork:
   - Shows the patient's user number (e.g. ABC-1254) instead of a name, read
     from the URL (?patient= / ?username= / ?user= / ?id=), falling back to the
     demo chart's own user number. The avatar is the generic person icon.
   - Keeps (same code as root): discontinued-account banner, Care Team popover
     with add/remove members (staff only), App & Device Info popover, Overview
     status timeline, Recordings presence/absence row + Compliance, Health Data
     (Measurement + Wellness charts, Add measurement), History Events, Add Event
     / Add Note. ../../js/chart-pan.js (loaded after this file) swaps the
     Recordings / Health Data builders for its drag/arrow-panned versions.
   - Drops entirely (their HTML isn't on this page): Clinical tab (Medication,
     Care Recommendations, EHR sections from js/clinical-ehr.js),
     Questionnaire answers, Chat + Export Chat, the Care Recommendation button
     and the hideMedDetails / noCareRec link plumbing that only served it.
   - History Events: Medication category dropped; care-recommendation entries
     (medication names / clinical findings) and "Message sent to patient" chat
     entries removed. Staff names are not patient PHI and stay.
   - Backoffice-only: the header kebab's Update account / Reset password open
     working modals (the root menu items are inert); Edit patient is removed. */

/* ---------------- Patient identity: user number, never a name ---------------- */
(() => {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("patient") || params.get("username") || params.get("user") || params.get("id") || "";
  const value = raw.trim().toUpperCase();
  /* Only accept something shaped like a user number (ABC-1254) so a free-text
     value in the URL can never put arbitrary text (or a name) in the header. */
  if (!/^[A-Z]{2,6}-\d{2,8}$/.test(value)) return;
  const heading = document.getElementById("patientIdHeading");
  if (heading) heading.textContent = value;
})();

/* ---------------- Discontinued account banner ---------------- */
(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get("discontinued") !== "1") return;
  document.getElementById("discontinuedBannerDate").textContent = params.get("discontinuedDate") || "an earlier date";

  const reason = params.get("discontinuedReason");
  if (reason) {
    document.getElementById("discontinuedBannerReasonText").textContent = reason;
    document.getElementById("discontinuedBannerReason").style.display = "inline";
  }

  document.getElementById("discontinuedBanner").style.display = "flex";
  document.querySelector(".patient-card").classList.add("is-discontinued");
  /* Discontinued patients are read-only everywhere on this page -- staff can
     still view history, but actions that would create/edit something for this
     patient are blocked. The header kebab stays live since "Update account" is
     how staff reactivate the record. */
  document.body.classList.add("patient-discontinued");
})();

/* ---------------- Care Team popover (staff only -- not patient PHI) ---------------- */
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
const careTeamPopover = document.getElementById("careTeamPopover");
const careTeamTitle = careTeamPopover.querySelector(".care-team-popover-title");
const careTeamMemberList = document.createElement("div");
const careTeamHeading = document.createElement("div");
const openCareTeamAdd = document.createElement("button");
const careTeamAddPanel = document.createElement("div");
const careTeamMultiselect = document.createElement("div");

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

careTeamHeading.append(careTeamTitle, openCareTeamAdd);
careTeamPopover.replaceChildren(careTeamHeading, careTeamMemberList, careTeamAddPanel);

function renderPatientCareTeam() {
  careTeamMemberList.innerHTML = patientCareTeam.map((member) => {
    const isProvider = member.role.includes("Provider");
    return `
    <div class="care-team-popover-item">
      <div class="care-team-popover-info">
        <span class="care-team-popover-name">${member.name}</span>
        <span class="care-team-popover-role">${member.role}</span>
      </div>
      ${isProvider ? "" : `
      <div class="care-team-item-actions">
        <button type="button" class="care-team-remove-button" data-name="${member.name}" title="Remove from care team" aria-label="Remove ${member.name} from care team">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>
        </button>
      </div>`}
    </div>`;
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
    renderPatientCareTeam();
    renderCareTeamMultiselect();
  }
});

function renderCareTeamMultiselect() {
  const assignedNames = new Set(patientCareTeam.map((member) => member.name));
  careTeamMultiselect.innerHTML = availableCareTeamMembers
    .filter((member) => !assignedNames.has(member.name))
    .map((member) => `<label><input type="checkbox" value="${member.name}"> ${member.name}</label>`)
    .join("") || '<span class="care-team-empty-option">All available members are assigned.</span>';
}

function closeCareTeamAddPanel() {
  careTeamAddPanel.hidden = true;
  openCareTeamAdd.hidden = false;
}

renderPatientCareTeam();
renderCareTeamMultiselect();

openCareTeamAdd.addEventListener("click", (event) => {
  event.stopPropagation();
  careTeamAddPanel.hidden = false;
  openCareTeamAdd.hidden = true;
});
careTeamAddPanel.querySelector(".care-team-cancel-button").addEventListener("click", (event) => {
  event.stopPropagation();
  closeCareTeamAddPanel();
});
careTeamAddPanel.querySelector(".care-team-confirm-button").addEventListener("click", (event) => {
  event.stopPropagation();
  const selectedNames = Array.from(careTeamMultiselect.querySelectorAll("input:checked")).map((input) => input.value);
  selectedNames.forEach((name) => {
    const member = availableCareTeamMembers.find((item) => item.name === name);
    if (member) patientCareTeam.push(member);
  });
  renderPatientCareTeam();
  renderCareTeamMultiselect();
  closeCareTeamAddPanel();
});

/* ---------------- App & Device Info popover (device model / app version only) ---------------- */
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

/* ---------------- Week / Month range toggle ---------------- */
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
const CHART_H = 100;
const Y = { baseline: 65, active: 65, priority: 65 };

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

/* ---------------- Recordings: presence/absence only, never recording content ---------------- */
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
      <polyline points="${toPoly(stepsPts)}" fill="none" stroke="#9B7FE8" stroke-width="2" />
      <polyline points="${toPoly(distPts)}" fill="none" stroke="#1CBFA6" stroke-width="2" />
      <polyline points="${toPoly(elevPts)}" fill="none" stroke="#B23FD8" stroke-width="2" stroke-dasharray="4 3" />
      ${dots(stepsPts, "#9B7FE8")}
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
    { data: systolicData, color: "#EAB308" },
    { data: diastolicData, color: "#EA580C" },
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
  buildAxisLineChart("spo2ChartWrap", "spo2DayScale", [{ data: spo2Data, color: "#9B7FE8" }], 96, 100, 150, "spo2MonthRow");
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
            <div class="seg" style="height:${awakeH}px; background:#EA580C;"></div>
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
function buildOxygenChart() { buildRangeChart("oxygenChart", oxygenData, 80, 100, 150, "#EA580C", "oxygenMonthRow"); }
function buildRespirationChart() { buildRangeChart("respirationChart", respirationData, 10, 50, 150, "#9B7FE8", "respirationMonthRow"); }

buildHeartChart();
buildOxygenChart();
buildRespirationChart();

/* ---------------- Tabs: Recordings / Health Data ---------------- */
document.querySelectorAll(".data-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    const panel = document.querySelector(`.data-tab-panel[data-panel="${target}"]`);
    if (!panel) return;
    document.querySelectorAll(".data-tab").forEach((t) => t.classList.remove("open"));
    document.querySelectorAll(".data-tab-panel").forEach((p) => p.classList.remove("open"));
    tab.classList.add("open");
    panel.classList.add("open");
    /* charts inside a hidden panel measure 0 width when built, so re-run once it's visible */
    if (target === "health-data") rebuildRangedCharts();
    /* Week/Month only applies to charted panels -- not Recordings */
    document.getElementById("dataRangeToggle").style.display = target === "info" || target === "recordings" ? "none" : "";
  });
});

/* Opens straight to a given top-level tab on load (?openTab=health-data).
   Links asking for a tab that isn't in this redacted view (e.g. clinical)
   simply stay on Recordings. */
(() => {
  const openTab = new URLSearchParams(window.location.search).get("openTab");
  if (!openTab) return;
  document.querySelectorAll(".data-tab").forEach((t) => {
    if (t.dataset.tab === openTab) t.click();
  });
})();

/* ---------------- Sub-tabs (Measurement / Wellness) ----------------
   Scoped to the closest .data-tab-panel so subtab groups don't clear each
   other's active panel. */
document.querySelectorAll(".subtab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const scope = tab.closest(".data-tab-panel");
    const target = tab.dataset.subtab;
    scope.querySelectorAll(".subtab").forEach((t) => t.classList.remove("active"));
    scope.querySelectorAll(".subtab-panel").forEach((p) => p.classList.remove("open"));
    tab.classList.add("active");
    scope.querySelector(`.subtab-panel[data-subpanel="${target}"]`).classList.add("open");
    rebuildRangedCharts();

    /* Add measurement only belongs to the Measurement subtab, not Wellness */
    if (target === "measurement" || target === "wellness") {
      document.getElementById("openAddMeasurementBtn").style.display = target === "wellness" ? "none" : "";
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
}

document.querySelectorAll("#dataRangeToggle span").forEach((r) => {
  r.addEventListener("click", () => {
    document.querySelectorAll("#dataRangeToggle span").forEach((s) => s.classList.remove("active"));
    r.classList.add("active");
    rangeMode = r.dataset.range || "month";
    rebuildRangedCharts();
  });
});

/* ---------------- Compliance bar: insufficient (<70%) vs sufficient (70%+) ----------------
   Only the progress bar fill carries the color -- the card itself stays a
   neutral gray, matching the orange/green key by the heading. */
document.querySelectorAll(".compliance-highlight").forEach((box) => {
  const value = parseFloat(box.querySelector(".compliance-highlight-value")?.textContent || "0");
  box.querySelector(".goal-progress-fill")?.classList.add(value >= 70 ? "fill-green" : "fill-orange");
});

/* ---------------- History events ---------------- */
// Account-status changes made from the Patient List's "Update account" modal
// (Pause / Discontinue) are stored in localStorage so they show up here too,
// on whichever patient's chart is opened next. Medication-category entries
// (clinical) are filtered out in case the shared key ever carries one.
const pendingAccountHistory = (() => {
  try {
    const items = JSON.parse(localStorage.getItem("hearoAccountHistory") || "[]");
    localStorage.removeItem("hearoAccountHistory");
    return Array.isArray(items) ? items.filter((h) => h && h.category !== "medication") : [];
  } catch (e) {
    return [];
  }
})();

let history = [
  ...pendingAccountHistory,

  // Status
  { category: "status", color: "dot-red", label: "Status changed to Priority", date: "01.09.2026" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.24.2025" },
  { category: "status", color: "dot-green", label: "Status changed to Active", date: "12.16.2025" },
  { category: "status", color: "dot-gray", label: "Status changed to Baseline", date: "12.01.2025" },
  { category: "status", color: "dot-darkgray", label: "Status changed to Registered", date: "12.01.2025" },

  // Monitoring -- operational status, not clinical findings
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "01.03.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "01.01.2026" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Low quality", date: "12.30.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.23.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Unmonitored", date: "12.21.2025", note: "Amanda Lee, RN: Patient forgot to record" },
  { category: "monitoring", color: "dot-teal", label: "Monitoring issue: Missed recording", date: "12.20.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.16.2025" },
  { category: "monitoring", color: "dot-teal", label: "Baseline phase monitoring", date: "12.01.2025" },
  { category: "monitoring", color: "dot-teal", label: "Patient is Monitored", date: "12.01.2025" },

  // Medication category dropped entirely (clinical).

  // Other -- care-recommendation entries (medication names / clinical
  // findings) and chat "Message sent to patient" entries dropped; only the
  // operational ones are kept.
  { category: "other", color: "dot-blue", label: "Action taken: Contacted", date: "12.20.2025", note: "Ayelet Er, NP: Patient forgot to record; reminder sent" },
  { category: "other", color: "dot-blue", label: "Operational difficulty", date: "12.10.2025", note: "Sandy Kohl, RN: Patient reported transportation issues and is unable to attend clinic visits" },

  // Account -- staff names in notes are not patient PHI
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
      (h) => `
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

/* ---------------- Add Event modal ---------------- */
const addEventOverlay = document.getElementById("addEventOverlay");
const addEventForm = document.getElementById("addEventForm");
const saveAddEvent = document.getElementById("saveAddEvent");
const addEventActionTypeField = document.getElementById("addEventActionTypeField");
const addEventNameField = document.getElementById("addEventNameField");
const addEventDateField = document.getElementById("addEventDateField");
const addEventNoteField = document.getElementById("addEventNoteField");

function updateAddEventTypeFields() {
  const eventType = addEventForm.eventType.value;
  addEventActionTypeField.style.display = eventType === "action" ? "" : "none";
  addEventNameField.style.display = eventType === "other" ? "" : "none";
  addEventDateField.style.display = eventType === "" ? "none" : "";
  addEventNoteField.style.display = eventType === "" ? "none" : "";
}

function validateAddEventForm() {
  const eventType = addEventForm.eventType.value;
  const detailValid = eventType === "action" ? addEventForm.actionType.value !== "" : eventType === "other" ? addEventForm.eventName.value.trim() !== "" : false;
  const valid = eventType !== "" && detailValid && addEventForm.date.value !== "";
  saveAddEvent.disabled = !valid;
  saveAddEvent.classList.toggle("enabled", valid);
}

addEventForm.addEventListener("input", validateAddEventForm);
addEventForm.addEventListener("change", (e) => {
  if (e.target.name === "eventType") updateAddEventTypeFields();
  validateAddEventForm();
});

document.getElementById("openAddEventBtn").addEventListener("click", () => {
  addEventForm.reset();
  resetCustomSelectsIn(addEventForm);
  updateAddEventTypeFields();
  validateAddEventForm();
  addEventOverlay.classList.add("open");
});

function closeAddEventModal() { addEventOverlay.classList.remove("open"); }
document.getElementById("cancelAddEvent").addEventListener("click", closeAddEventModal);
document.getElementById("closeAddEventX").addEventListener("click", closeAddEventModal);
addEventOverlay.addEventListener("click", (e) => { if (e.target === addEventOverlay) closeAddEventModal(); });

addEventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddEvent.disabled) return;

  const [y, m, d] = addEventForm.date.value.split("-");
  const note = addEventForm.note.value.trim();
  const label = addEventForm.eventType.value === "action"
    ? `Action taken: ${addEventForm.actionType.value}`
    : addEventForm.eventName.value.trim();

  history.unshift({
    category: "other",
    color: "dot-blue",
    label,
    date: `${m}.${d}.${y}`,
    note: note || undefined,
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

/* Blood pressure is one "systolic/diastolic" field (e.g. 120/80). Save stays
   disabled until at least one measurement is entered and the BP, if given,
   is in that format. */
const addMeasurementForm = document.getElementById("addMeasurementForm");
const saveAddMeasurementBtn = document.getElementById("saveAddMeasurement");
const measurementBpInput = document.getElementById("measurementBp");
const measurementBpError = document.getElementById("measurementBpError");

function parseBloodPressure(value) {
  const m = String(value || "").trim().match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  return m ? { systolic: Number(m[1]), diastolic: Number(m[2]) } : null;
}

function updateMeasurementSave() {
  const bp = measurementBpInput.value.trim();
  const bpValid = !bp || !!parseBloodPressure(bp);
  const hasValue = ["weightValue", "bloodPressure", "heartRateValue", "bloodOxygenValue"]
    .some((name) => String(addMeasurementForm.elements[name].value).trim() !== "");
  const canSave = hasValue && bpValid;
  saveAddMeasurementBtn.disabled = !canSave;
  saveAddMeasurementBtn.classList.toggle("enabled", canSave);
  measurementBpError.hidden = bpValid;
  measurementBpInput.setAttribute("aria-invalid", String(!bpValid));
}

addMeasurementForm.addEventListener("input", updateMeasurementSave);
/* form.reset() runs on open; re-check once the fields are cleared */
addMeasurementForm.addEventListener("reset", () => setTimeout(updateMeasurementSave, 0));
document.getElementById("closeAddMeasurementX").addEventListener("click", () => {
  document.getElementById("addMeasurementOverlay").classList.remove("open");
});

wireAddModal("addMeasurementOverlay", "addMeasurementForm", "cancelAddMeasurement", "openAddMeasurementBtn", (fd) => {
  const parts = [];
  const bp = parseBloodPressure(fd.get("bloodPressure"));
  if (fd.get("weightValue")) parts.push(`Weight ${fd.get("weightValue")} ${fd.get("weightUnit")}`);
  if (bp) parts.push(`BP ${bp.systolic}/${bp.diastolic} mmHg`);
  if (fd.get("heartRateValue")) parts.push(`Heart Rate ${fd.get("heartRateValue")} bpm`);
  if (fd.get("bloodOxygenValue")) parts.push(`Blood Oxygen ${fd.get("bloodOxygenValue")}%`);
  alert(parts.length ? `Measurement added: ${parts.join(", ")}` : "No measurement values entered");
});

document.getElementById("openAddMeasurementBtn").addEventListener("click", () => setMeasurementWeightUnit(weightUnit));

/* ---------------- Patient header kebab: Update account / Reset password ----------------
   (Edit patient is intentionally not offered here -- see patient-data.html.) */
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
    const item = e.target.closest(".row-menu-item");
    if (!item) return;
    patientHeaderMenu.classList.remove("open");
    if (item.dataset.action === "account") openUpdateAccountModal();
    else if (item.dataset.action === "reset") openResetPasswordModal();
  });

  document.addEventListener("click", (e) => {
    if (!patientHeaderMenu.contains(e.target) && e.target !== patientHeaderKebab) {
      patientHeaderMenu.classList.remove("open");
    }
  });
}

/* ---------------- Update Account modal ---------------- */
const updateAccountOverlay = document.getElementById("updateAccountOverlay");
const updateAccountSubtitle = document.getElementById("updateAccountSubtitle");
const discontinueReasonField = document.getElementById("discontinueReasonField");
const discontinueReasonSelect = document.getElementById("discontinueReasonSelect");
const discontinueReasonInput = discontinueReasonSelect.querySelector("input[type=hidden]");
const discontinueReasonOtherField = document.getElementById("discontinueReasonOtherField");
const discontinueReasonOther = document.getElementById("discontinueReasonOther");
const saveUpdateAccount = document.getElementById("saveUpdateAccount");
const accountActionRadios = document.querySelectorAll('input[name="accountAction"]');

function validateUpdateAccountForm() {
  const selected = document.querySelector('input[name="accountAction"]:checked');
  let valid = !!selected;
  if (selected && selected.value === "Discontinued") {
    valid = discontinueReasonInput.value !== "" &&
      (discontinueReasonInput.value !== "Other" || discontinueReasonOther.value.trim() !== "");
  }
  saveUpdateAccount.disabled = !valid;
  saveUpdateAccount.classList.toggle("enabled", valid);
}

accountActionRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.checked) discontinueReasonField.style.display = radio.value === "Discontinued" ? "block" : "none";
    if (radio.checked && radio.value !== "Discontinued") {
      discontinueReasonOtherField.style.display = "none";
    }
    validateUpdateAccountForm();
  });
});

discontinueReasonInput.addEventListener("change", () => {
  discontinueReasonOtherField.style.display = discontinueReasonInput.value === "Other" ? "block" : "none";
  validateUpdateAccountForm();
});

discontinueReasonOther.addEventListener("input", validateUpdateAccountForm);

function openUpdateAccountModal() {
  /* Subtitle carries the user number shown in the header -- never a name. */
  updateAccountSubtitle.textContent = document.getElementById("patientIdHeading").textContent;
  accountActionRadios.forEach((radio) => (radio.checked = false));
  discontinueReasonField.style.display = "none";
  discontinueReasonOtherField.style.display = "none";
  setCustomSelectValue(discontinueReasonSelect, "", { silent: true });
  discontinueReasonOther.value = "";
  validateUpdateAccountForm();
  updateAccountOverlay.classList.add("open");
}

function closeUpdateAccountModal() { updateAccountOverlay.classList.remove("open"); }
document.getElementById("cancelUpdateAccount").addEventListener("click", closeUpdateAccountModal);
updateAccountOverlay.addEventListener("click", (e) => { if (e.target === updateAccountOverlay) closeUpdateAccountModal(); });
saveUpdateAccount.addEventListener("click", () => { if (!saveUpdateAccount.disabled) closeUpdateAccountModal(); });

/* ---------------- Reset Password modal ---------------- */
const resetPasswordOverlay = document.getElementById("resetPasswordOverlay");

function openResetPasswordModal() { resetPasswordOverlay.classList.add("open"); }
function closeResetPasswordModal() { resetPasswordOverlay.classList.remove("open"); }

document.getElementById("cancelResetPassword").addEventListener("click", closeResetPasswordModal);
resetPasswordOverlay.addEventListener("click", (e) => { if (e.target === resetPasswordOverlay) closeResetPasswordModal(); });
document.getElementById("confirmResetPassword").addEventListener("click", closeResetPasswordModal);
