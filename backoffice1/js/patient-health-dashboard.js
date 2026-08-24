/* ---------------- Resolve current patient from ?patient= ---------------- */
const phParams = new URLSearchParams(location.search);
const phUsername = phParams.get("patient") || PATIENT_HEALTH_DEFAULT;
const ph = buildPatientProfile(phUsername);

document.title = `HearO Backoffice | ${ph.username}`;
document.getElementById("patientName").textContent = ph.username;
document.getElementById("patientSub").textContent = `${ph.org} · ${ph.langName}`;

/* If the patient was opened by drilling down from an organization's
   health dashboard, "back" should return there (preserving that
   investigation context) instead of the generic patient list. */
const phOrgContext = phParams.get("org");
if (phOrgContext) {
  document.getElementById("patientBackLink").href = `org-health-dashboard.html?org=${phOrgContext}`;
}

const phStatusClass = { Active: "healthy", Registered: "info", Priority: "critical", Paused: "neutral" };
const phSevEl = document.getElementById("patientSeverity");
phSevEl.classList.add(phStatusClass[ph.status] || "neutral");
phSevEl.innerHTML = `<span class="dot"></span>${ph.status}`;

/* ---------------- Status overview (was a KPI strip, now a compact list) ---------------- */
document.getElementById("patientStatusOverviewList").innerHTML = [
  { label: "Account", value: ph.statusOverview.account, since: ph.statusOverview.accountSince },
  { label: "Status", value: ph.status, since: ph.statusOverview.statusSince || ph.statusOverview.accountSince },
  { label: "Monitoring", value: ph.statusOverview.monitoring, since: ph.statusOverview.monitoringSince },
]
  .map(
    (s) => `
    <div class="bo-status-overview-row">
      <span class="label">${s.label}: <strong>${s.value}</strong></span>
      <span class="since">Since: ${s.since}</span>
    </div>`
  )
  .join("");

/* ---------------- Registration / Usage / Compliance info (compact kv grid) ---------------- */
const boKv = (label, value) => `
  <div class="bo-kv-cell">
    <span class="k">${label}</span>
    <span class="v">${value}</span>
  </div>`;

document.getElementById("patientRegistrationList").innerHTML = [
  boKv("Gender", ph.registration.gender),
  boKv("Mother tongue", ph.registration.motherTongue),
  boKv("Weight", ph.registration.weight),
  boKv("Country", ph.registration.country),
  boKv("Creation date", ph.registration.creationDate),
  boKv("Last hospitalized", ph.registration.lastHospitalized),
].join("");

document.getElementById("patientUsageList").innerHTML = [
  boKv("Phone", ph.usage.phone),
  boKv("Version", ph.usage.version),
  boKv("Language", ph.usage.language),
  boKv("Reminder Mode", ph.usage.reminderMode),
  boKv("Auto / Manual time", ph.usage.autoManualTime),
].join("");

document.getElementById("patientComplianceInfoList").innerHTML = [
  boKv("First Sign In", ph.complianceInfo.firstSignIn),
  boKv("Last Sign In", ph.complianceInfo.lastSignIn),
  boKv("Started at", ph.complianceInfo.startedAt),
  boKv("Baseline Complete", ph.complianceInfo.baselineComplete),
  boKv("Total Available Days", ph.complianceInfo.totalAvailableDays),
  boKv("Total Recorded Days", ph.complianceInfo.totalRecordedDays),
  boKv("Un-recorded Days", ph.complianceInfo.unrecordedDays),
  boKv("Non-valid ASR Days", ph.complianceInfo.nonValidAsrDays),
  boKv("Total Compliance", `${ph.complianceInfo.totalCompliance}%`),
  boKv("Usable Compliance", `${ph.usableCompliance}%`),
].join("");

document.getElementById("patientUsableCompliancePct").textContent = `${ph.usableCompliance}%`;

/* ---------------- Calendar widget ---------------- */
const PH_CAL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const phCalToday = new Date();
let phCalView = new Date(phCalToday.getFullYear(), phCalToday.getMonth(), 1);
let phCalSelected = new Date(phCalToday);

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function renderPatientCalendar() {
  const year = phCalView.getFullYear();
  const month = phCalView.getMonth();
  document.getElementById("patientCalTitle").textContent = `${PH_CAL_MONTHS[month]} ${year}`;

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, date: new Date(year, month - 1, daysInPrevMonth - i), muted: true });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, date: new Date(year, month, d), muted: false });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: nextDay, date: new Date(year, month + 1, nextDay), muted: true });
    nextDay++;
  }

  document.getElementById("patientCalGrid").innerHTML = cells
    .map((c) => {
      const dow = c.date.getDay();
      const classes = ["bo-cal-day"];
      if (dow === 0 || dow === 6) classes.push("weekend");
      if (c.muted) classes.push("muted");
      if (isSameDay(c.date, phCalToday)) classes.push("today");
      if (isSameDay(c.date, phCalSelected)) classes.push("selected");
      return `<button type="button" class="${classes.join(" ")}" data-date="${c.date.toISOString()}">${c.day}</button>`;
    })
    .join("");
}

document.getElementById("patientCalGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-cal-day");
  if (!btn) return;
  phCalSelected = new Date(btn.dataset.date);
  phCalView = new Date(phCalSelected.getFullYear(), phCalSelected.getMonth(), 1);
  renderPatientCalendar();
});

document.getElementById("patientCalPrev").addEventListener("click", () => {
  phCalView = new Date(phCalView.getFullYear(), phCalView.getMonth() - 1, 1);
  renderPatientCalendar();
});
document.getElementById("patientCalNext").addEventListener("click", () => {
  phCalView = new Date(phCalView.getFullYear(), phCalView.getMonth() + 1, 1);
  renderPatientCalendar();
});
document.getElementById("patientCalToday").addEventListener("click", () => {
  phCalView = new Date(phCalToday.getFullYear(), phCalToday.getMonth(), 1);
  phCalSelected = new Date(phCalToday);
  renderPatientCalendar();
});
document.getElementById("patientCalTodayBtn").addEventListener("click", () => {
  phCalView = new Date(phCalToday.getFullYear(), phCalToday.getMonth(), 1);
  phCalSelected = new Date(phCalToday);
  renderPatientCalendar();
});
renderPatientCalendar();

/* ---------------- Monthly Compliance chart ---------------- */
function renderPatientComplianceChart() {
  const container = document.getElementById("patientComplianceArea");
  const width = container.clientWidth || 640;
  const height = container.clientHeight || 220;
  const padL = 34;
  const padR = 14;
  const padT = 12;
  const padB = 22;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;

  const months = ph.monthlyCompliance.map((m) => m.month);
  const complianceSeries = ph.monthlyCompliance.map((m) => m.compliance);
  const usableSeries = ph.monthlyCompliance.map((m) => m.usable);
  const justifiedSeries = ph.monthlyCompliance.map((m) => m.justified);

  /* Range the y-axis to the data actually in view (rounded to the nearest
     10, with a little breathing room) instead of a fixed 40-100 -- these
     series usually sit in a tight high band (e.g. 84-100), which against a
     fixed 40-100 axis crams every line up against the top of the chart. */
  const gridStep = 10;
  const allValues = [...complianceSeries, ...usableSeries, ...justifiedSeries];
  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const yMin = Math.max(0, Math.floor((dataMin - gridStep) / gridStep) * gridStep);
  const yMax = Math.min(100, Math.ceil((dataMax + gridStep) / gridStep) * gridStep);

  const xAt = (i) => padL + (plotW * i) / (months.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  for (let v = yMin; v <= yMax; v += gridStep) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 8}" y="${y + 4}" text-anchor="end" font-size="10.5" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = months
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 6}" text-anchor="middle" font-size="10.5" fill="#9AA5B1">${m}</text>`)
    .join("");

  const buildLine = (series, color) => {
    const line = series.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");
    const dots = series.map((v, i) => `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="2.8" fill="${color}"/>`).join("");
    return `<path d="M ${xAt(0)},${yAt(series[0])} L ${line}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  };

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      ${buildLine(complianceSeries, "#1F3C73")}
      ${buildLine(justifiedSeries, "#0FA3B1")}
      ${buildLine(usableSeries, "#F2994A")}
      ${xLabels}
    </svg>`;
}
renderPatientComplianceChart();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderPatientComplianceChart);
window.addEventListener("load", renderPatientComplianceChart);
window.addEventListener("resize", renderPatientComplianceChart);

/* ---------------- Sessions ---------------- */
document.getElementById("patientSessionRows").innerHTML = ph.sessions
  .map(
    (s) => `
    <tr>
      <td>${s.date}</td><td>${s.startTime}</td><td>${s.endTime || "—"}</td>
      <td>${s.errors ? `<span class="bo-severity-pill critical">${s.errors}</span>` : "0"}</td>
      <td>${s.vEngineNote || "—"}</td><td>${s.os}</td><td>${s.mobileModel}</td><td>${s.appVersion}</td>
    </tr>`
  )
  .join("");

/* ---------------- Compliance: histograms + records info ---------------- */
function renderHistogram(containerId, buckets) {
  const max = Math.max(1, ...buckets.map((b) => b.value));
  document.getElementById(containerId).innerHTML = buckets
    .map(
      (b) => `
      <div class="bo-histogram-bar-wrap">
        <div class="bo-histogram-bar" style="height:${Math.max(3, Math.round((b.value / max) * 100))}%;" title="${b.label}: ${b.value}"></div>
        <span class="bo-histogram-label">${b.label}</span>
      </div>`
    )
    .join("");
}
renderHistogram("patientErrorsHistogram", ph.histograms.errors);
renderHistogram("patientNonRecordedHistogram", ph.histograms.nonRecordedByWeekday);
renderHistogram("patientRecordedHoursHistogram", ph.histograms.recordedHours);

document.getElementById("patientRecordsInfoList").innerHTML = [
  boKv("Total recordings", ph.recordsInfo.totalRecordings),
  boKv("Recordings with errors", ph.recordsInfo.recordingsWithErrors),
  boKv("Total recording errors", ph.recordsInfo.recordingErrors),
  boKv("Records Quality", `${ph.recordsInfo.recordsQuality}%`),
].join("");

document.getElementById("patientCompliancePdfBtn").addEventListener("click", () => {
  alert("Compliance report export is not available in this preview.");
});

/* ---------------- Events (paginated, editable) ---------------- */
const phEventIcons = {
  edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
};

function phEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

const phEventsPager = boCreatePager(
  "patientEventRows",
  () => peEvents.filter((e) => e.username === ph.username),
  (e) => `
    <tr>
      <td>${phEsc(e.eventType)}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${e.id}" data-field="influenceCompliance" ${e.influenceCompliance ? "checked" : ""} /></td>
      <td>${phEsc(e.description)}</td>
      <td>${phEsc(e.addedBy)}</td>
      <td>${phEsc(e.reportedBy)}</td>
      <td>${phEsc(e.reportedVia)}</td>
      <td>${phEsc(e.reportedTime)}</td>
      <td>${phEsc(e.startDate)}</td>
      <td>${phEsc(e.endDate) || "—"}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${e.id}" data-field="approved" ${e.approved ? "checked" : ""} /></td>
      <td>${phEsc(e.status) || "—"}</td>
      <td>
        <div class="bo-row-actions">
          ${e.eventType !== "MESSAGE_OUT" ? `<button type="button" class="bo-action-icon" data-action="edit" data-id="${e.id}" aria-label="Edit event">${phEventIcons.edit}</button>` : ""}
          <button type="button" class="bo-action-icon" data-action="delete" data-id="${e.id}" aria-label="Delete event">${phEventIcons.trash}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: 20, emptyColspan: 12, emptyText: "No events reported for this patient." }
);
phEventsPager();

document.getElementById("patientEventRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const rec = peEvents.find((r) => r.id === Number(box.dataset.id));
  if (rec) rec[box.dataset.field] = box.checked;
});

document.getElementById("patientEventRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-action-icon");
  if (!btn) return;
  const rec = peEvents.find((r) => r.id === Number(btn.dataset.id));
  if (!rec) return;
  if (btn.dataset.action === "edit") {
    openPatientEventDrawer(rec);
  } else if (btn.dataset.action === "delete") {
    if (!confirm(`Delete this event for "${rec.username}"?`)) return;
    peEvents.splice(peEvents.indexOf(rec), 1);
    phEventsPager();
  }
});

/* ---------------- Custom selects (Add/Update Event modal) ---------------- */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const option = select.querySelector(`.bo-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".bo-select-option").forEach((o) => o.classList.remove("selected"));

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

function positionBoSelectMenu(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const menu = select.querySelector(".bo-select-menu");
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

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

document.querySelectorAll(".bo-select").forEach((select) => {
  const trigger = select.querySelector(".bo-select-trigger");
  const valueEl = select.querySelector(".bo-select-value");
  valueEl.dataset.placeholder = valueEl.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    closeAllBoSelects();
    if (willOpen) {
      select.classList.add("open");
      positionBoSelectMenu(select);
    }
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-select-option");
    if (!option) return;
    setBoSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
});

document.addEventListener("click", closeAllBoSelects);
document.addEventListener("scroll", closeAllBoSelects, true);
window.addEventListener("resize", closeAllBoSelects);

/* ---------------- Add / Update Event modal ---------------- */
const patientEventDrawerOverlay = document.getElementById("patientEventDrawerOverlay");
const patientEventForm = document.getElementById("patientEventForm");
const patientInfluenceSelect = patientEventForm.querySelector('.bo-select[data-name="influenceCompliance"]');
const patientReportedViaSelect = patientEventForm.querySelector('.bo-select[data-name="reportedVia"]');
let phEditingEventId = null;

function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function dmyToIso(dmy) {
  if (!dmy) return "";
  const parts = dmy.split(" ")[0].split("/");
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : "";
}

function openPatientEventDrawer(record) {
  patientEventForm.reset();
  phEditingEventId = record ? record.id : null;
  document.getElementById("patientEventUsername").value = ph.username;

  setBoSelectValue(patientInfluenceSelect, record ? (record.influenceCompliance ? "Yes" : "No") : "", { silent: true });
  setBoSelectValue(patientReportedViaSelect, record ? record.reportedVia : "", { silent: true });

  if (record) {
    patientEventForm.description.value = record.description;
    patientEventForm.reportedBy.value = record.reportedBy;
    patientEventForm.reportedDate.value = dmyToIso(record.reportedTime) || todayIso();
    patientEventForm.startDate.value = dmyToIso(record.startDate);
    patientEventForm.endDate.value = dmyToIso(record.endDate);
  } else {
    patientEventForm.reportedDate.value = todayIso();
  }

  patientEventDrawerOverlay.classList.add("open");
}

function closePatientEventDrawer() {
  patientEventDrawerOverlay.classList.remove("open");
}

patientEventForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const dateStr = patientEventForm.reportedDate.value ? patientEventForm.reportedDate.value.split("-").reverse().join("/") : "";
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const startDateStr = patientEventForm.startDate.value ? patientEventForm.startDate.value.split("-").reverse().join("/") : dateStr;
  const endDateStr = patientEventForm.endDate.value ? patientEventForm.endDate.value.split("-").reverse().join("/") : "";

  const record = {
    username: ph.username,
    eventType: phEditingEventId === null ? "MANUAL" : peEvents.find((r) => r.id === phEditingEventId).eventType,
    influenceCompliance: patientInfluenceSelect.querySelector("input[type=hidden]").value === "Yes",
    description: patientEventForm.description.value.trim(),
    addedBy: ph.username,
    reportedBy: patientEventForm.reportedBy.value.trim(),
    reportedVia: patientReportedViaSelect.querySelector("input[type=hidden]").value,
    reportedTime: `${dateStr} ${timeStr}`,
    startDate: startDateStr,
    endDate: endDateStr,
    approved: phEditingEventId === null ? false : peEvents.find((r) => r.id === phEditingEventId).approved,
    status: phEditingEventId === null ? "NEW" : peEvents.find((r) => r.id === phEditingEventId).status,
  };

  if (phEditingEventId === null) {
    peEvents.unshift({ ...record, id: peEvents.length ? Math.max(...peEvents.map((r) => r.id)) + 1 : 0 });
  } else {
    const existing = peEvents.find((r) => r.id === phEditingEventId);
    if (existing) Object.assign(existing, record);
  }

  closePatientEventDrawer();
  phEventsPager.resetPage();
  phEventsPager();
});

document.getElementById("patientAddEventBtn").addEventListener("click", () => openPatientEventDrawer(null));
document.getElementById("patientCancelEventDrawer").addEventListener("click", closePatientEventDrawer);
document.getElementById("patientCloseEventDrawerX").addEventListener("click", closePatientEventDrawer);
patientEventDrawerOverlay.addEventListener("click", (e) => { if (e.target === patientEventDrawerOverlay) closePatientEventDrawer(); });

/* ---------------- Send message modal ---------------- */
const patientMessageDrawerOverlay = document.getElementById("patientMessageDrawerOverlay");
const patientMessageForm = document.getElementById("patientMessageForm");
const patientSaveMessageBtn = document.getElementById("patientSaveMessageBtn");

function validatePatientMessageForm() {
  patientSaveMessageBtn.disabled = patientMessageForm.message.value.trim() === "";
}

function openPatientMessageDrawer() {
  patientMessageForm.reset();
  document.getElementById("patientMessageSendTo").value = ph.username;
  document.getElementById("patientMessageLanguage").value = "";
  validatePatientMessageForm();
  patientMessageDrawerOverlay.classList.add("open");
}

function closePatientMessageDrawer() {
  patientMessageDrawerOverlay.classList.remove("open");
}

patientMessageForm.addEventListener("input", validatePatientMessageForm);

document.getElementById("patientCheckLanguageBtn").addEventListener("click", () => {
  document.getElementById("patientMessageLanguage").value = ph.langName;
});

patientMessageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (patientSaveMessageBtn.disabled) return;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const nowStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  peEvents.unshift({
    id: peEvents.length ? Math.max(...peEvents.map((r) => r.id)) + 1 : 0,
    username: ph.username,
    eventType: "MESSAGE_OUT",
    influenceCompliance: false,
    description: patientMessageForm.message.value.trim(),
    addedBy: "Emily Carter",
    reportedBy: "",
    reportedVia: "APPLICATION",
    reportedTime: nowStr,
    startDate: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`,
    endDate: "",
    approved: false,
    status: "NEW",
  });

  closePatientMessageDrawer();
  phEventsPager.resetPage();
  phEventsPager();
});

document.getElementById("patientAddMessageBtn").addEventListener("click", openPatientMessageDrawer);
document.getElementById("patientCancelMessageDrawer").addEventListener("click", closePatientMessageDrawer);
document.getElementById("patientCloseMessageDrawerX").addEventListener("click", closePatientMessageDrawer);
patientMessageDrawerOverlay.addEventListener("click", (e) => { if (e.target === patientMessageDrawerOverlay) closePatientMessageDrawer(); });

/* ---------------- Tabs ---------------- */
const eventsTabActions = document.getElementById("eventsTabActions");

document.querySelectorAll("#patientTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#patientTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    eventsTabActions.hidden = tab.dataset.tab !== "events";
    if (tab.dataset.tab === "summary") renderPatientComplianceChart();
  });
});
