/* ---------------- Ticket Detail page ----------------
   Full-screen deep dive for a single Ticket: Ticket Info -> Issue -> Handling
   -> Patient Log (patient-sourced tickets only) -> History. Reached from the
   Tickets tab's row / "View Ticket" action, or a deep link from the Support
   Dashboard / notifications (?ticket=TCK-xxxx&source=patient|clinic).
   Mirrors incident-detail.html's full-page pattern instead of the old
   in-page drawer, and folds in what used to be a separate Patient Log modal
   so everything about a ticket lives on one screen. */
initBoSelects();

function resolveTicketFromUrl() {
  const params = new URLSearchParams(location.search);
  const idParam = params.get("id");
  const ticketNo = params.get("ticket");
  const sourceParam = params.get("source");
  let source = sourceParam === "clinic" ? "clinic" : sourceParam === "patient" ? "patient" : null;

  if (idParam !== null && source) {
    const list = source === "patient" ? patientTickets : clinicTickets;
    const ticket = list.find((t) => t.id === Number(idParam));
    if (ticket) return { source, ticket };
  }

  if (ticketNo) {
    let match = null;
    if (source) match = (source === "patient" ? patientTickets : clinicTickets).find((t) => t.ticketNo === ticketNo);
    if (!match) {
      match = patientTickets.find((t) => t.ticketNo === ticketNo);
      if (match) source = "patient";
    }
    if (!match) {
      match = clinicTickets.find((t) => t.ticketNo === ticketNo);
      if (match) source = "clinic";
    }
    if (match) return { source, ticket: match };
  }

  return { source: "patient", ticket: patientTickets[0] };
}

let { source: currentSource, ticket: currentTicket } = resolveTicketFromUrl();

/* The Back arrow returns to wherever the user actually came from (Support
   Dashboard, the Tickets tab, a notification, an incident's related ticket,
   etc.) instead of always landing on the Tickets tab. When the referring page
   is part of this app, that page's URL wins -- history.back() is used on
   click so it's a true back-nav (preserves scroll/tab state), and the link's
   href falls back to that same URL for reload/new-tab cases where there's no
   history entry to go back to. With no usable in-app referrer, the link keeps
   its default "Tickets tab" destination. */
(function initTicketDetailBackLink() {
  const backLink = document.getElementById("ticketDetailBack");
  if (!backLink) return;
  const ref = document.referrer;
  if (!ref) return;
  try {
    const refUrl = new URL(ref);
    if (refUrl.origin !== location.origin) return;
    backLink.setAttribute("href", refUrl.pathname + refUrl.search);
    backLink.addEventListener("click", (e) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  } catch (e) {}
})();

document.querySelector('.bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('.bo-select[data-name="ticketPriorityHandling"] .bo-select-menu').innerHTML = buildSelectOptions(PRIORITIES);
document.querySelector('.bo-select[data-name="ticketStatus"] .bo-select-menu').innerHTML = buildSelectOptions(STATUSES);
document.querySelector('.bo-select[data-name="ticketOrgHandling"] .bo-select-menu').innerHTML = buildSelectOptions(orgs.map((o) => o.name));

/* Assignee choices narrow to whichever tier is currently selected in the
   Level field, so a ticket always lands on someone who actually works
   that tier. */
function populateTicketDetailAssignees(tier) {
  const menu = document.querySelector('.bo-select[data-name="ticketAssignedTo"] .bo-select-menu');
  menu.innerHTML = buildAgentSelectOptions(TIER_AGENTS[tier] || SUPPORT_AGENTS);
}

/* Every ticket routes to a level, and every level has people on it (TIER_AGENTS) --
   so Assigned To should never sit empty. Falls back to the tier's first agent
   whenever the stored assignee isn't actually on the currently selected tier. */
function defaultAssigneeForTier(tier) {
  return (TIER_AGENTS[tier] || SUPPORT_AGENTS)[0] || "";
}

/* Resolved tickets no longer need routing info -- hide Level/Priority/
   Assigned To rather than asking for values that don't matter anymore. */
function applyTicketDetailStatusVisibility(status) {
  const resolved = status === "Resolved";
  document.getElementById("ticketDetailLevelField").hidden = resolved;
  document.getElementById("ticketDetailPriorityField").hidden = resolved;
  document.getElementById("ticketDetailAssignedToField").hidden = resolved;
  const tier = document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').value;
  document.getElementById("ticketDetailOrgField").hidden = resolved || tier !== "Level 3";
}

/* Shows which organization a Level 3 escalation belongs to right under the
   Assigned To field, so the reviewer doesn't have to look back up at the
   Organization dropdown to see who they're assigning within. */
function updateAssignedOrgNote(orgName) {
  const note = document.getElementById("ticketDetailAssignedOrgNote");
  note.textContent = orgName ? `Organization: ${orgName}` : "";
  note.hidden = !orgName;
}

function validateTicketDetailForm() {
  const status = document.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value;
  applyTicketDetailStatusVisibility(status);
  const orgFieldVisible = !document.getElementById("ticketDetailOrgField").hidden;
  const orgFilled = !orgFieldVisible || document.querySelector('.bo-select[data-name="ticketOrgHandling"] input[type=hidden]').value !== "";
  const assigneeFilled = status === "Resolved" || document.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').value !== "";
  document.getElementById("saveTicketDetail").disabled = !assigneeFilled || !orgFilled;
}

function renderTicketHeader() {
  document.getElementById("ticketDetailTitle").textContent = currentTicket.ticketNo;
  const badge = (label, pill) => `<span class="td-badge-group"><span class="td-badge-label">${label}</span>${pill}</span>`;
  document.getElementById("ticketDetailBadges").innerHTML = [
    badge("Status", statusPill(currentTicket.status)),
    badge("Priority", priorityPill(currentTicket.priority)),
    currentTicket.tier ? badge("Level", tierPill(currentTicket.tier)) : "",
    badge("Type", typePill(currentSource === "patient" ? "Patient" : "Clinic")),
  ].join("");
  const origin = originLabel[currentTicket.origin] || currentTicket.origin;
  /* Clinic-raised tickets show the Cordio system and Clinic Portal versions
     the clinic user was running when they raised it -- there's no mobile
     App/Device info for a clinic ticket the way there is for a patient one.
     Patient-raised tickets instead show the patient's own contact info, so
     an agent can reach them directly without leaving the ticket. */
  let extraMeta = "";
  if (currentSource === "clinic" && currentTicket.cordioVersion) {
    extraMeta =
      `<span class="td-meta-sep">&middot;</span>Cordio Version: ${currentTicket.cordioVersion}` +
      `<span class="td-meta-sep">&middot;</span>Portal Version: ${currentTicket.portalVersion}`;
  } else if (currentSource === "patient") {
    const contact = patientContactInfo(currentTicket.patientId);
    extraMeta =
      `<span class="td-meta-sep">&middot;</span>Email: ${contact.email}` +
      `<span class="td-meta-sep">&middot;</span>Mobile: ${contact.phone}`;
  }
  document.getElementById("ticketDetailMeta").innerHTML =
    `Created ${formatTicketCreated(currentTicket.createdDate)}` +
    `<span class="td-meta-sep">&middot;</span>Origin: ${origin}` +
    `<span class="td-meta-sep">&middot;</span>Organization: ${currentTicket.organization}` +
    `<span class="td-meta-sep">&middot;</span>Created For: ${currentSource === "patient" ? currentTicket.patientId : currentTicket.raisedBy}` +
    extraMeta;
  document.title = `HearO Backoffice | ${currentTicket.ticketNo}`;
}

function renderTicketInfo() {
  document.getElementById("ticketDetailIssueType").textContent = currentTicket.issueType;
  document.getElementById("ticketDetailCategory").textContent = ticketCategory(currentTicket) || "—";
  document.getElementById("ticketDetailDescription").textContent = currentTicket.description;
  renderTicketRecording();
}

/* ---------------- Recording (Voice Engine tickets only) ----------------
   Voice Engine issue types (Missing ASR Results, Missing Smart Merger
   Results, Missing ASR Derived Features, Missing Track Feature Extraction)
   are all about the patient's spoken recording failing somewhere in the
   ASR pipeline, so an agent investigating one needs to actually listen to
   what the patient recorded. Every other category has nothing to play. */
const lrPlayIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4L20 12L6 20Z"/></svg>`;
const lrPauseIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;

function isRecordingIssue(ticket) {
  return ticketCategory(ticket) === "Voice Engine";
}

/* The recording is shown as its separate parts (Part 1, Part 2, ...), each
   with its own play button, time and progress line. Part count and lengths
   are seeded off the ticket number so the same ticket always shows the same
   parts. Only one part plays at a time. */
let ticketRecordingTimer = null;

function formatRecordingTime(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function stopTicketRecording() {
  clearInterval(ticketRecordingTimer);
  ticketRecordingTimer = null;
  document.querySelectorAll("#ticketDetailRecordingParts .bo-rec-part").forEach((row) => {
    const btn = row.querySelector(".bo-rec-play");
    btn.classList.remove("playing");
    btn.innerHTML = lrPlayIcon;
    btn.setAttribute("aria-label", "Play");
    row.dataset.elapsedMs = 0;
    row.querySelector(".bo-rec-fill").style.width = "0%";
    row.querySelector(".bo-rec-time").textContent = `0:00 / ${formatRecordingTime(Number(row.dataset.durationMs) / 1000)}`;
  });
}

function renderTicketRecording() {
  const wrap = document.getElementById("ticketDetailRecordingWrap");
  const micAlert = document.getElementById("ticketDetailMicAlert");
  const partsEl = document.getElementById("ticketDetailRecordingParts");

  stopTicketRecording();
  micAlert.hidden = true;

  if (!isRecordingIssue(currentTicket)) {
    wrap.hidden = true;
    partsEl.innerHTML = "";
    return;
  }

  wrap.hidden = false;
  const rand = seededRandom(currentTicket.ticketNo);
  const partCount = 4 + Math.floor(rand() * 3); // 4-6 parts
  partsEl.innerHTML = Array.from({ length: partCount }, (_, i) => {
    const durationSec = 2 + Math.floor(rand() * 8); // 2-9 s
    return `
      <div class="bo-rec-part" data-duration-ms="${durationSec * 1000}" data-elapsed-ms="0">
        <button type="button" class="bo-rec-play" aria-label="Play">${lrPlayIcon}</button>
        <span class="bo-rec-time">0:00 / ${formatRecordingTime(durationSec)}</span>
        <div class="bo-rec-track"><div class="bo-rec-fill"></div></div>
        <span class="bo-rec-label">Part ${i + 1}</span>
      </div>`;
  }).join("");

  /* Root-cause check: this is the same seeded permissions data the
     Patient Log's Permissions Info panel shows -- built independently
     here rather than reused from currentPatientLog so this doesn't
     depend on render order (Patient Log renders after the Issue panel). */
  if (currentSource === "patient") {
    const micPermission = buildPatientLog(currentTicket).permissions.find((p) => p.label === "Microphone");
    micAlert.hidden = !micPermission || micPermission.value !== "Disabled";
  }
}

document.getElementById("ticketDetailRecordingParts").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-rec-play");
  if (!btn) return;
  const row = btn.closest(".bo-rec-part");
  const wasPlaying = btn.classList.contains("playing");
  const resumeFromMs = Number(row.dataset.elapsedMs) || 0;

  /* Pausing keeps this part's position; playing a part stops any other. */
  clearInterval(ticketRecordingTimer);
  if (wasPlaying) {
    btn.classList.remove("playing");
    btn.innerHTML = lrPlayIcon;
    btn.setAttribute("aria-label", "Play");
    return;
  }
  stopTicketRecording();
  row.dataset.elapsedMs = resumeFromMs;

  const durationMs = Number(row.dataset.durationMs);
  const fillEl = row.querySelector(".bo-rec-fill");
  const timeEl = row.querySelector(".bo-rec-time");
  btn.classList.add("playing");
  btn.innerHTML = lrPauseIcon;
  btn.setAttribute("aria-label", "Pause");

  const startedAt = Date.now() - resumeFromMs;
  ticketRecordingTimer = setInterval(() => {
    const elapsedMs = Math.min(Date.now() - startedAt, durationMs);
    row.dataset.elapsedMs = elapsedMs;
    fillEl.style.width = `${(elapsedMs / durationMs) * 100}%`;
    timeEl.textContent = `${formatRecordingTime(elapsedMs / 1000)} / ${formatRecordingTime(durationMs / 1000)}`;
    if (elapsedMs >= durationMs) stopTicketRecording();
  }, 100);
});
/* Handling shows the same fields as the edit form, but locked until Edit is
   clicked (see "Handling form wiring"). Resolved tickets drop the routing
   fields, same as the form does. */
function renderTicketHandling() {
  document.getElementById("ticketDetailRootCause").value = currentTicket.rootCause || "";
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketStatus"]'), currentTicket.status, { silent: true });
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketLevel"]'), currentTicket.tier, { silent: true });
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketPriorityHandling"]'), currentTicket.priority, { silent: true });
  populateTicketDetailAssignees(currentTicket.tier);
  const tierAgents = TIER_AGENTS[currentTicket.tier] || SUPPORT_AGENTS;
  const assignee = tierAgents.includes(currentTicket.assignedTo) ? currentTicket.assignedTo : defaultAssigneeForTier(currentTicket.tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), assignee, { silent: true });
  if (currentTicket.tier === "Level 3") {
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketOrgHandling"]'), currentTicket.organization, { silent: true });
    updateAssignedOrgNote(currentTicket.organization);
  } else {
    updateAssignedOrgNote("");
  }
  validateTicketDetailForm();
}

function renderTicketHistory() {
  const entries = ensureTicketHistory(currentTicket);
  document.getElementById("ticketDetailHistory").innerHTML = entries
    .slice()
    .reverse()
    .map(
      (h) => `
      <div class="bo-ticket-history-item">
        <span class="bo-history-title">${h.title}</span>
        ${h.detail ? `<div class="bo-history-detail">${h.detail}</div>` : ""}
        <span class="bo-history-date">${h.date}</span>
      </div>`
    )
    .join("");
}

/* ---------------- Patient Log (app version / device / permissions) ---------------- */
function renderPatientLogSection(elId, rows) {
  document.getElementById(elId).innerHTML = rows
    .map((r) => `<div class="patient-log-chip"><span class="label">${r.label}</span><span class="value${r.value === "Disabled" ? " is-disabled" : ""}">${r.value}</span></div>`)
    .join("");
}

function renderPatientLogHistory(elId, lines) {
  document.getElementById(elId).innerHTML = lines
    .map((l) => `<div class="patient-log-line"><span class="ts">${l.ts}</span><span class="msg">${l.msg}</span></div>`)
    .join("");
}

let currentPatientLog = null;

/* ---------------- Log History: date-range filter ----------------
   From/To dates (a small self-contained calendar rather than native
   <input type="date">, which stacked two calendar glyphs and opened the
   browser's own picker) pick which sessions the log shows. Defaults to the
   latest session's day. Download Log saves exactly what the filter shows. */
function formatDisplayDate(d) {
  return d ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` : "—";
}
function sameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

let patientLogFromDate = null;
let patientLogToDate = null;
let patientLogCalendarField = null;
let patientLogCalendarViewDate = new Date();

/* Sessions whose day falls inside From..To (either end may be empty = open). */
function patientLogSessionsInRange() {
  if (!currentPatientLog) return [];
  const from = patientLogFromDate;
  const to = patientLogToDate ? new Date(patientLogToDate.getFullYear(), patientLogToDate.getMonth(), patientLogToDate.getDate(), 23, 59, 59) : null;
  return currentPatientLog.sessions
    .filter((s) => (!from || s.dateObj >= from) && (!to || s.dateObj <= to))
    .sort((a, b) => a.dateObj - b.dateObj);
}

function renderPatientLogRange() {
  const el = document.getElementById("patientLogHistory");
  if (patientLogFromDate && patientLogToDate && patientLogFromDate > patientLogToDate) {
    el.innerHTML = `<div class="patient-log-empty">From date must be on or before the To date.</div>`;
    return;
  }
  const sessions = patientLogSessionsInRange();
  if (!sessions.length) {
    el.innerHTML = `<div class="patient-log-empty">No logs found for this date range.</div>`;
    return;
  }
  renderPatientLogHistory("patientLogHistory", sessions.flatMap((s) => s.lines));
}

function renderPatientLog() {
  const section = document.getElementById("patientLog");
  if (currentSource !== "patient") {
    section.hidden = true;
    currentPatientLog = null;
    return;
  }
  section.hidden = false;
  currentPatientLog = buildPatientLog(currentTicket);
  renderPatientLogSection("patientLogAppVersion", currentPatientLog.appVersion);
  renderPatientLogSection("patientLogDeviceInfo", currentPatientLog.deviceInfo);
  renderPatientLogSection("patientLogPermissions", currentPatientLog.permissions);

  const latest = currentPatientLog.sessions.map((s) => s.dateObj).sort((a, b) => b - a)[0];
  const latestDay = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());
  patientLogFromDate = latestDay;
  patientLogToDate = latestDay;
  updatePatientLogDateFieldDisplay("from");
  updatePatientLogDateFieldDisplay("to");
  renderPatientLogRange();
}

function updatePatientLogDateFieldDisplay(field) {
  const date = field === "from" ? patientLogFromDate : patientLogToDate;
  document.getElementById(field === "from" ? "patientLogDownloadFromValue" : "patientLogDownloadToValue").textContent = formatDisplayDate(date);
  document.getElementById(field === "from" ? "patientLogDownloadFromField" : "patientLogDownloadToField").classList.toggle("placeholder", !date);
}

const patientLogCalendarEl = document.getElementById("patientLogDownloadCalendar");

function renderPatientLogCalendar() {
  const viewYear = patientLogCalendarViewDate.getFullYear();
  const viewMonth = patientLogCalendarViewDate.getMonth();
  document.getElementById("patientLogCalendarMonthLabel").textContent = patientLogCalendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstOfMonth.getDay(); i++) cells.push({ date: new Date(viewYear, viewMonth, i - firstOfMonth.getDay() + 1), muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(viewYear, viewMonth, d), muted: false });
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
  }

  document.getElementById("patientLogCalendarDays").innerHTML = cells
    .map(({ date, muted }) => {
      const classes = ["bo-mini-calendar-day"];
      if (muted) classes.push("muted");
      const isFrom = sameDay(date, patientLogFromDate);
      const isTo = sameDay(date, patientLogToDate);
      if (isFrom || isTo) classes.push("selected");
      else if (patientLogFromDate && patientLogToDate && date > patientLogFromDate && date < patientLogToDate) classes.push("in-range");
      if (isFrom && patientLogToDate) classes.push("range-start");
      if (isTo && patientLogFromDate) classes.push("range-end");
      return `<button type="button" class="${classes.join(" ")}" data-time="${date.getTime()}">${date.getDate()}</button>`;
    })
    .join("");
}

function openPatientLogCalendar(field) {
  patientLogCalendarField = field;
  const date = field === "from" ? patientLogFromDate : patientLogToDate;
  patientLogCalendarViewDate = date ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date();
  document.getElementById("patientLogDownloadFromField").classList.toggle("active", field === "from");
  document.getElementById("patientLogDownloadToField").classList.toggle("active", field === "to");
  patientLogCalendarEl.classList.toggle("align-to", field === "to");
  patientLogCalendarEl.hidden = false;
  renderPatientLogCalendar();
}
function closePatientLogCalendar() {
  patientLogCalendarField = null;
  document.getElementById("patientLogDownloadFromField").classList.remove("active");
  document.getElementById("patientLogDownloadToField").classList.remove("active");
  patientLogCalendarEl.hidden = true;
}

/* Every date change re-filters the log right away. */
function setPatientLogDate(field, date) {
  if (field === "from") patientLogFromDate = date;
  else if (field === "to") patientLogToDate = date;
  updatePatientLogDateFieldDisplay(field);
  renderPatientLogRange();
}

document.getElementById("patientLogDownloadFromField").addEventListener("click", (e) => { e.stopPropagation(); openPatientLogCalendar("from"); });
document.getElementById("patientLogDownloadToField").addEventListener("click", (e) => { e.stopPropagation(); openPatientLogCalendar("to"); });
document.getElementById("patientLogCalendarPrev").addEventListener("click", (e) => {
  e.stopPropagation();
  patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() - 1, 1);
  renderPatientLogCalendar();
});
document.getElementById("patientLogCalendarNext").addEventListener("click", (e) => {
  e.stopPropagation();
  patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() + 1, 1);
  renderPatientLogCalendar();
});
document.getElementById("patientLogCalendarDays").addEventListener("click", (e) => {
  e.stopPropagation();
  const btn = e.target.closest(".bo-mini-calendar-day");
  if (!btn || !patientLogCalendarField) return;
  setPatientLogDate(patientLogCalendarField, new Date(Number(btn.dataset.time)));
  closePatientLogCalendar();
});
document.getElementById("patientLogCalendarClear").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!patientLogCalendarField) return;
  setPatientLogDate(patientLogCalendarField, null);
  renderPatientLogCalendar();
});
document.getElementById("patientLogCalendarToday").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!patientLogCalendarField) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  setPatientLogDate(patientLogCalendarField, today);
  closePatientLogCalendar();
});
document.addEventListener("click", (e) => {
  if (!patientLogCalendarEl.hidden && !e.target.closest(".bo-mini-calendar") && !e.target.closest(".bo-date-field-trigger")) closePatientLogCalendar();
});

/* Download Log saves the sessions the date-range filter currently shows. */
document.getElementById("downloadPatientLogBtn").addEventListener("click", () => {
  const sessionsInRange = patientLogSessionsInRange();
  if (!currentPatientLog || !sessionsInRange.length) return;

  const section = (title, rows) => `${title}\n${rows.map((r) => `  ${r.label}: ${r.value}`).join("\n")}\n`;
  const historySection = sessionsInRange
    .map((s) => `Session ${s.date}\n${s.lines.map((l) => `  ${l.ts}: ${l.msg}`).join("\n")}\n`)
    .join("\n");
  const text = [
    `Patient Log - ${currentTicket.ticketNo} (${currentTicket.patientId})`,
    `Date range: ${sessionsInRange[0].date} - ${sessionsInRange[sessionsInRange.length - 1].date}`,
    "",
    section("App Version", currentPatientLog.appVersion),
    section("Device Info", currentPatientLog.deviceInfo),
    section("Permissions Info", currentPatientLog.permissions),
    historySection,
  ].join("\n");

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${currentTicket.ticketNo}-patient-log.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
/* ---------------- History / Patient Log tabs ----------------
   Patient Log only exists for patient-sourced tickets (renderPatientLog
   hides its panel otherwise), so its tab follows that panel's visibility. */
function selectDetailTab(name) {
  document.querySelectorAll(".td-tab").forEach((t) => t.classList.toggle("active", t.dataset.tdTab === name));
  document.querySelectorAll(".td-tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.tdPanel === name));
}
document.querySelectorAll(".td-tab").forEach((tab) => tab.addEventListener("click", () => selectDetailTab(tab.dataset.tdTab)));

/* Recording follows renderTicketRecording(), which only reveals the player
   for Voice Engine tickets. */
function syncPatientLogTab() {
  document.querySelector('.td-tab[data-td-tab="patientLog"]').hidden = document.getElementById("patientLog").hidden;
  document.querySelector('.td-tab[data-td-tab="recording"]').hidden = document.getElementById("ticketDetailRecordingWrap").hidden;
}

function renderAll() {
  renderTicketHeader();
  renderTicketInfo();
  renderTicketHandling();
  renderPatientLog();
  renderTicketHistory();
  syncPatientLogTab();
}
renderAll();

/* ---------------- Handling form wiring ----------------
   The form is always on the page but locked (read-only) until Edit is
   clicked. Cancel re-seeds every field from the ticket, so anything typed
   and then cancelled is discarded instead of lingering. */
const ticketDetailFormEl = document.getElementById("ticketDetailForm");
const editTicketHandlingBtn = document.getElementById("editTicketHandlingBtn");
const ticketHandlingInlineSlot = document.getElementById("ticketHandlingInlineSlot");
const ticketHandlingModalSlot = document.getElementById("ticketHandlingModalSlot");
const ticketHandlingOverlay = document.getElementById("ticketHandlingOverlay");
const ticketNoteInput = document.getElementById("ticketDetailRootCause");
const NOTE_PLACEHOLDER = "What caused this issue? (optional)";
let ticketHandlingEditing = false;

/* The Handling form is a single element that lives inline (read-only) on the
   page and gets physically moved into the Edit popup while editing, then
   moved back on close -- so there's only ever one form/one set of field
   state to keep in sync, matching the modal markup's own comment. */
function setTicketHandlingEditing(editing) {
  ticketHandlingEditing = editing;
  ticketDetailFormEl.classList.toggle("is-readonly", !editing);
  ticketDetailFormEl.querySelectorAll(".bo-select-trigger").forEach((t) => { t.disabled = !editing; });
  ticketNoteInput.disabled = !editing;
  ticketNoteInput.placeholder = editing ? NOTE_PLACEHOLDER : "—";
  if (editing) {
    ticketHandlingModalSlot.appendChild(ticketDetailFormEl);
    ticketHandlingOverlay.classList.add("open");
  } else {
    ticketHandlingInlineSlot.appendChild(ticketDetailFormEl);
    ticketHandlingOverlay.classList.remove("open");
    closeAllBoSelects();
  }
}

function cancelTicketHandlingEdit() {
  renderTicketHandling();
  setTicketHandlingEditing(false);
}

editTicketHandlingBtn.addEventListener("click", () => setTicketHandlingEditing(true));
document.getElementById("cancelTicketHandling").addEventListener("click", cancelTicketHandlingEdit);
document.getElementById("closeTicketHandlingX").addEventListener("click", cancelTicketHandlingEdit);
ticketHandlingOverlay.addEventListener("click", (e) => { if (e.target === ticketHandlingOverlay) cancelTicketHandlingEdit(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && ticketHandlingEditing) cancelTicketHandlingEdit();
});
document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
  const tier = e.target.value;
  populateTicketDetailAssignees(tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), defaultAssigneeForTier(tier), { silent: true });
  if (tier === "Level 3") {
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketOrgHandling"]'), currentTicket.organization, { silent: true });
    updateAssignedOrgNote(currentTicket.organization);
  } else {
    resetBoSelect(document.querySelector('.bo-select[data-name="ticketOrgHandling"]'));
    updateAssignedOrgNote("");
  }
  validateTicketDetailForm();
});

/* Reassigning the Level 3 escalation to a different organization keeps the
   note under Assigned To in sync with whatever was just picked. */
document.querySelector('.bo-select[data-name="ticketOrgHandling"] input[type=hidden]').addEventListener("change", (e) => {
  updateAssignedOrgNote(e.target.value);
  validateTicketDetailForm();
});

const ticketDetailForm = ticketDetailFormEl;
ticketDetailForm.addEventListener("input", validateTicketDetailForm);
ticketDetailForm.addEventListener("change", validateTicketDetailForm);

function formatChangeDate() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

ticketDetailForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (document.getElementById("saveTicketDetail").disabled) return;

  const history = ensureTicketHistory(currentTicket);
  const changeDate = formatChangeDate();

  const rootCause = document.getElementById("ticketDetailRootCause").value.trim();
  const nextAssignee = document.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').value;
  const nextTier = document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').value || currentTicket.tier;
  const nextPriority = document.querySelector('.bo-select[data-name="ticketPriorityHandling"] input[type=hidden]').value || currentTicket.priority;
  const nextStatus = document.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value || currentTicket.status;
  const nextOrg = (nextTier === "Level 3" && document.querySelector('.bo-select[data-name="ticketOrgHandling"] input[type=hidden]').value) || currentTicket.organization;

  /* Every field a Save touches (reassignment, level/tier transfer, priority,
     status) is folded into a single history entry instead of one line per
     field -- so a ticket transfer and the note explaining it always land
     together, and whoever picks the ticket up next sees the note attached
     directly to the transfer instead of buried in a separate line. The
     entry's title headlines whichever change is most significant
     (reassignment > level > status > priority); everything that changed,
     plus the free-text note, goes in the boxed detail underneath. */
  const isReassignment = nextAssignee !== (currentTicket.assignedTo || "");
  const changeParts = [];
  let title = "";
  if (isReassignment) {
    changeParts.push(`Reassigned from ${currentTicket.assignedTo || "Unassigned"} to ${nextAssignee}`);
    title = `Ticket Transferred to ${nextAssignee}`;
  }
  if (nextTier !== currentTicket.tier) {
    changeParts.push(`Level changed from ${currentTicket.tier} to ${nextTier}`);
    title = title || `Ticket Escalated to ${nextTier}`;
  }
  if (nextStatus !== currentTicket.status) {
    changeParts.push(`Status changed from ${currentTicket.status} to ${nextStatus}`);
    title = title || `Status Changed to ${nextStatus}`;
  }
  if (nextPriority !== currentTicket.priority) {
    changeParts.push(`Priority changed from ${currentTicket.priority} to ${nextPriority}`);
    title = title || `Priority Changed to ${nextPriority}`;
  }
  if (nextOrg !== currentTicket.organization) {
    changeParts.push(`Organization changed from ${currentTicket.organization} to ${nextOrg}`);
    title = title || `Organization Changed to ${nextOrg}`;
  }

  const noteChanged = rootCause !== (currentTicket.rootCause || "");
  if (!changeParts.length && noteChanged) {
    changeParts.push("Note updated");
    title = "Note Updated";
  }

  if (changeParts.length) {
    let detail = `${changeParts.join("; ")}.`;
    if (rootCause) detail += ` Note: ${rootCause}`;
    history.push({ title, detail, date: changeDate });
  }

  currentTicket.rootCause = rootCause;
  currentTicket.assignedTo = nextAssignee;
  currentTicket.tier = nextTier;
  currentTicket.priority = nextPriority;
  currentTicket.status = nextStatus;
  currentTicket.organization = nextOrg;

  renderTicketHeader();
  renderTicketInfo();
  renderTicketHandling();
  renderTicketHistory();
  setTicketHandlingEditing(false);
});

setTicketHandlingEditing(false);
