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

document.querySelector('.bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(TIERS);
document.querySelector('.bo-select[data-name="ticketSeverityHandling"] .bo-select-menu').innerHTML = buildSelectOptions(SEVERITIES);
document.querySelector('.bo-select[data-name="ticketStatus"] .bo-select-menu').innerHTML = buildSelectOptions(STATUSES);

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

/* Resolved tickets no longer need routing info -- hide Level/Severity/
   Assigned To rather than asking for values that don't matter anymore. */
function applyTicketDetailStatusVisibility(status) {
  const resolved = status === "Resolved";
  document.getElementById("ticketDetailLevelField").hidden = resolved;
  document.getElementById("ticketDetailSeverityField").hidden = resolved;
  document.getElementById("ticketDetailAssignedToField").hidden = resolved;
}

function validateTicketDetailForm() {
  const status = document.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value;
  applyTicketDetailStatusVisibility(status);
  const assigneeFilled = status === "Resolved" || document.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').value !== "";
  document.getElementById("saveTicketDetail").disabled = !assigneeFilled;
}

function renderTicketHeader() {
  document.getElementById("ticketDetailTitle").textContent = currentTicket.ticketNo;
  document.getElementById("ticketDetailBadges").innerHTML = typePill(currentSource === "patient" ? "Patient" : "Clinic");
  document.title = `HearO Backoffice | ${currentTicket.ticketNo}`;

  const viewProfileBtn = document.getElementById("ticketDetailViewProfileBtn");
  const returnTo = encodeURIComponent(location.href);
  if (currentSource === "patient") {
    viewProfileBtn.textContent = "View Patient Profile";
    viewProfileBtn.href = `patient-health-dashboard.html?patient=${encodeURIComponent(currentTicket.patientId)}&return=${returnTo}`;
  } else {
    const org = orgs.find((o) => o.name === currentTicket.organization);
    viewProfileBtn.textContent = "View Organization Profile";
    viewProfileBtn.href = org ? `org-profile.html?id=${org.id}&return=${returnTo}` : "#";
  }
}

function renderTicketInfo() {
  document.getElementById("ticketDetailSource").textContent = currentSource === "patient" ? "Patient" : "Clinic";
  document.getElementById("ticketDetailStatusKv").innerHTML = statusPill(currentTicket.status);
  document.getElementById("ticketDetailSeverityKv").innerHTML = severityPill(currentTicket.severity);
  document.getElementById("ticketDetailWhoLabel").textContent = currentSource === "patient" ? "Patient ID" : "Raised By";
  document.getElementById("ticketDetailWho").textContent = currentSource === "patient" ? currentTicket.patientId : currentTicket.raisedBy;
  document.getElementById("ticketDetailOrg").textContent = currentTicket.organization;
  const ticketOrgRecord = orgs.find((o) => o.name === currentTicket.organization);
  document.getElementById("ticketDetailOrgContact").textContent = (ticketOrgRecord && ticketOrgRecord.phone) || "—";
  document.getElementById("ticketDetailOrigin").textContent = currentTicket.origin;
  document.getElementById("ticketDetailScope").textContent = currentTicket.scope;
  document.getElementById("ticketDetailCreated").textContent = currentTicket.createdDate;
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

/* Deterministic bar heights (seeded off the ticket number) so the waveform
   looks like a real recording instead of a flat line, and stays the same
   shape every time this ticket is opened. */
const WAVEFORM_BAR_COUNT = 48;
function buildWaveformBars(rand) {
  let html = "";
  for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
    const height = 20 + Math.floor(rand() * 80);
    html += `<span class="bar" style="height:${height}%"></span>`;
  }
  return html;
}

let ticketRecordingTimer = null;

function formatRecordingTime(sec) {
  return `0:${String(Math.floor(sec)).padStart(2, "0")}`;
}

function renderTicketRecording() {
  const wrap = document.getElementById("ticketDetailRecordingWrap");
  const micAlert = document.getElementById("ticketDetailMicAlert");
  const playBtn = document.getElementById("ticketDetailAudioPlay");
  const timeEl = document.getElementById("ticketDetailAudioTime");
  const progressEl = document.getElementById("ticketDetailWaveformProgress");

  clearInterval(ticketRecordingTimer);
  playBtn.classList.remove("playing");
  playBtn.innerHTML = lrPlayIcon;
  progressEl.style.width = "0%";
  micAlert.hidden = true;

  if (!isRecordingIssue(currentTicket)) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden = false;
  const rand = seededRandom(currentTicket.ticketNo);
  const durationSec = 8 + Math.floor(rand() * 40);
  const barsHtml = buildWaveformBars(rand);
  document.getElementById("ticketDetailWaveformBars").innerHTML = barsHtml;
  document.getElementById("ticketDetailWaveformBarsFill").innerHTML = barsHtml;

  const durationMs = durationSec * 1000;
  playBtn.dataset.durationMs = durationMs;
  playBtn.dataset.elapsedMs = 0;
  timeEl.textContent = `0:00 / ${formatRecordingTime(durationSec)}`;

  /* Root-cause check: this is the same seeded permissions data the
     Patient Log's Permissions Info panel shows -- built independently
     here rather than reused from currentPatientLog so this doesn't
     depend on render order (Patient Log renders after the Issue panel). */
  if (currentSource === "patient") {
    const micPermission = buildPatientLog(currentTicket).permissions.find((p) => p.label === "Microphone");
    micAlert.hidden = !micPermission || micPermission.value !== "Denied";
  }
}

document.getElementById("ticketDetailAudioPlay").addEventListener("click", (e) => {
  const btn = e.currentTarget;
  const timeEl = document.getElementById("ticketDetailAudioTime");
  const progressEl = document.getElementById("ticketDetailWaveformProgress");
  const durationMs = Number(btn.dataset.durationMs) || 0;
  const durationSec = durationMs / 1000;

  clearInterval(ticketRecordingTimer);

  const playing = btn.classList.toggle("playing");
  btn.innerHTML = playing ? lrPauseIcon : lrPlayIcon;
  if (!playing) return;

  const startedAt = Date.now() - Number(btn.dataset.elapsedMs || 0);
  ticketRecordingTimer = setInterval(() => {
    const elapsedMs = Math.min(Date.now() - startedAt, durationMs);
    btn.dataset.elapsedMs = elapsedMs;
    progressEl.style.width = `${(elapsedMs / durationMs) * 100}%`;
    timeEl.textContent = `${formatRecordingTime(elapsedMs / 1000)} / ${formatRecordingTime(durationSec)}`;

    if (elapsedMs >= durationMs) {
      clearInterval(ticketRecordingTimer);
      btn.classList.remove("playing");
      btn.innerHTML = lrPlayIcon;
      btn.dataset.elapsedMs = 0;
      progressEl.style.width = "0%";
      timeEl.textContent = `0:00 / ${formatRecordingTime(durationSec)}`;
    }
  }, 200);
});

function renderTicketHandling() {
  document.getElementById("ticketDetailRootCause").value = currentTicket.rootCause || "";
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketStatus"]'), currentTicket.status, { silent: true });
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketLevel"]'), currentTicket.tier, { silent: true });
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketSeverityHandling"]'), currentTicket.severity, { silent: true });
  populateTicketDetailAssignees(currentTicket.tier);
  const tierAgents = TIER_AGENTS[currentTicket.tier] || SUPPORT_AGENTS;
  const assignee = tierAgents.includes(currentTicket.assignedTo) ? currentTicket.assignedTo : defaultAssigneeForTier(currentTicket.tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), assignee, { silent: true });
  validateTicketDetailForm();
}

function renderTicketHistory() {
  const entries = ensureTicketHistory(currentTicket);
  document.getElementById("ticketDetailHistory").innerHTML = entries
    .slice()
    .reverse()
    .map((h) => `<div class="bo-ticket-history-item"><span class="text">${h.text}</span><span class="meta">${h.date}</span></div>`)
    .join("");
}

/* ---------------- Patient Log (app version / device / permissions) ---------------- */
function renderPatientLogSection(elId, rows) {
  document.getElementById(elId).innerHTML = rows
    .map((r) => `<div class="patient-log-chip"><span class="label">${r.label}</span><span class="value">${r.value}</span></div>`)
    .join("");
}

function renderPatientLogHistory(elId, lines) {
  document.getElementById(elId).innerHTML = lines
    .map((l) => `<div class="patient-log-line"><span class="ts">${l.ts}</span><span class="msg">${l.msg}</span></div>`)
    .join("");
}

let currentPatientLog = null;
let currentPatientLogSessionId = null;

function currentSession() {
  return currentPatientLog && currentPatientLog.sessions.find((s) => s.id === currentPatientLogSessionId);
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

  const sessionSelect = document.getElementById("patientLogSessionSelect");
  sessionSelect.querySelector(".bo-select-menu").innerHTML = currentPatientLog.sessions
    .map(
      (s, i) => `
      <div class="bo-select-option" data-value="${s.id}">${s.date}${i === 0 ? " (latest)" : ""}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
  currentPatientLogSessionId = currentPatientLog.sessions[0].id;
  setBoSelectValue(sessionSelect, currentPatientLogSessionId, { silent: true });
  renderPatientLogHistory("patientLogHistory", currentSession().lines);

  const sessionDates = currentPatientLog.sessions.map((s) => s.dateObj).sort((a, b) => a - b);
  patientLogFromDate = sessionDates[0];
  patientLogToDate = sessionDates[sessionDates.length - 1];
  updatePatientLogDateFieldDisplay("from");
  updatePatientLogDateFieldDisplay("to");
}

document.querySelector('#patientLogSessionSelect input[type=hidden]').addEventListener("change", (e) => {
  currentPatientLogSessionId = e.target.value;
  const session = currentSession();
  if (session) renderPatientLogHistory("patientLogHistory", session.lines);
});

/* ---------------- Download Log (date-range picker) ----------------
   A small self-contained calendar replaces native <input type="date">
   here -- that had two calendar glyphs stacked (the browser's own
   picker-indicator plus our SVG) and opened the OS/browser's own date
   picker, which looked out of place next to the rest of the app's UI. */
function toIsoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
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
  patientLogCalendarEl.hidden = false;
  renderPatientLogCalendar();
}
function closePatientLogCalendar() {
  patientLogCalendarField = null;
  document.getElementById("patientLogDownloadFromField").classList.remove("active");
  document.getElementById("patientLogDownloadToField").classList.remove("active");
  patientLogCalendarEl.hidden = true;
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
  const picked = new Date(Number(btn.dataset.time));
  if (patientLogCalendarField === "from") patientLogFromDate = picked;
  else patientLogToDate = picked;
  updatePatientLogDateFieldDisplay(patientLogCalendarField);
  closePatientLogCalendar();
});
document.getElementById("patientLogCalendarClear").addEventListener("click", (e) => {
  e.stopPropagation();
  if (patientLogCalendarField === "from") patientLogFromDate = null;
  else if (patientLogCalendarField === "to") patientLogToDate = null;
  updatePatientLogDateFieldDisplay(patientLogCalendarField);
  renderPatientLogCalendar();
});
document.getElementById("patientLogCalendarToday").addEventListener("click", (e) => {
  e.stopPropagation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (patientLogCalendarField === "from") patientLogFromDate = today;
  else if (patientLogCalendarField === "to") patientLogToDate = today;
  updatePatientLogDateFieldDisplay(patientLogCalendarField);
  closePatientLogCalendar();
});

const patientLogDownloadPopover = document.getElementById("patientLogDownloadPopover");

function openPatientLogDownloadPopover() {
  document.getElementById("patientLogDownloadHint").textContent = "";
  patientLogDownloadPopover.hidden = false;
}
function closePatientLogDownloadPopover() {
  patientLogDownloadPopover.hidden = true;
  closePatientLogCalendar();
}

document.getElementById("downloadPatientLogBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!currentPatientLog) return;
  if (patientLogDownloadPopover.hidden) openPatientLogDownloadPopover();
  else closePatientLogDownloadPopover();
});
document.getElementById("patientLogDownloadCancel").addEventListener("click", closePatientLogDownloadPopover);
document.addEventListener("click", (e) => {
  if (!patientLogDownloadPopover.hidden && !e.target.closest(".patient-log-download-wrap")) closePatientLogDownloadPopover();
  else if (!patientLogCalendarEl.hidden && !e.target.closest(".bo-mini-calendar") && !e.target.closest(".bo-date-field-trigger")) closePatientLogCalendar();
});

document.getElementById("patientLogDownloadConfirm").addEventListener("click", () => {
  if (!currentPatientLog) return;
  const hint = document.getElementById("patientLogDownloadHint");
  if (!patientLogFromDate || !patientLogToDate) {
    hint.textContent = "Pick both a from and to date.";
    return;
  }
  const from = patientLogFromDate;
  const to = patientLogToDate;
  if (from > to) {
    hint.textContent = "From date must be before the to date.";
    return;
  }

  const sessionsInRange = currentPatientLog.sessions
    .filter((s) => s.dateObj >= from && s.dateObj <= to)
    .sort((a, b) => a.dateObj - b.dateObj);
  if (!sessionsInRange.length) {
    hint.textContent = "No sessions found in that date range.";
    return;
  }

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
  closePatientLogDownloadPopover();
});

function renderAll() {
  renderTicketHeader();
  renderTicketInfo();
  renderTicketHandling();
  renderPatientLog();
  renderTicketHistory();
}
renderAll();

/* ---------------- Chat with Patient (patient-sourced tickets only) ----------------
   Same chat panel pattern as the clinic portal's patient-data.html, so
   support agents get a familiar UI to message the patient straight from
   their ticket instead of switching to another tool. Only offered when the
   ticket was actually raised on behalf of a patient -- clinic-staff tickets
   have no patient to chat with. */
const chatMessages = currentSource === "patient"
  ? [
      { type: "out", name: "Support Team", time: "10:02 AM", text: `Hi, this is regarding your ticket ${currentTicket.ticketNo}. Can you tell us a bit more about what happened?` },
      { type: "in", time: "10:06 AM", text: "Sure — it's been happening since yesterday morning." },
      { type: "out", name: "Support Team", time: "10:08 AM", text: "Thanks, we're looking into it now." },
    ]
  : [];

const chatOpenBtn = document.getElementById("chatOpenBtn");
const chatPanel = document.getElementById("chatPanel");
const chatMessagesEl = document.getElementById("chatMessages");
const chatEmptyStateEl = document.getElementById("chatEmptyState");

function renderChatMessages() {
  chatEmptyStateEl.hidden = chatMessages.length > 0;
  chatMessagesEl.hidden = chatMessages.length === 0;
  chatMessagesEl.innerHTML = chatMessages
    .map(
      (m) => `
        <div class="chat-msg ${m.type}">
          <div class="chat-msg-meta">${m.name ? `<b>${m.name}</b> &middot; ` : ""}${m.time}</div>
          <div class="chat-bubble">${m.text}</div>
        </div>`
    )
    .join("");
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function chatNowTime() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function addOutgoingChatMessage(text) {
  chatMessages.push({ type: "out", name: "Support Team", time: chatNowTime(), text });
  renderChatMessages();
}

if (currentSource === "patient") {
  chatOpenBtn.hidden = false;
  renderChatMessages();

  chatOpenBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    chatPanel.classList.add("open");
  });
  document.getElementById("chatCloseBtn").addEventListener("click", () => chatPanel.classList.remove("open"));
  document.addEventListener("click", (e) => {
    if (!chatPanel.classList.contains("open")) return;
    if (chatPanel.contains(e.target) || chatOpenBtn.contains(e.target)) return;
    chatPanel.classList.remove("open");
  });

  const chatInputField = document.getElementById("chatInputField");
  const chatSendBtn = document.getElementById("chatSendBtn");
  chatSendBtn.addEventListener("click", () => {
    const text = chatInputField.value.trim();
    if (!text) return;
    addOutgoingChatMessage(text);
    chatInputField.value = "";
  });
  chatInputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      chatSendBtn.click();
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
}

/* ---------------- Handling form wiring ---------------- */
document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
  const tier = e.target.value;
  populateTicketDetailAssignees(tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), defaultAssigneeForTier(tier), { silent: true });
  validateTicketDetailForm();
});

const ticketDetailForm = document.getElementById("ticketDetailForm");
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
  const nextSeverity = document.querySelector('.bo-select[data-name="ticketSeverityHandling"] input[type=hidden]').value || currentTicket.severity;
  const nextStatus = document.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value || currentTicket.status;

  if (rootCause !== (currentTicket.rootCause || "")) history.push({ text: `Root cause recorded: ${rootCause}`, date: changeDate });
  if (nextAssignee !== (currentTicket.assignedTo || "")) history.push({ text: `Reassigned from ${currentTicket.assignedTo || "Unassigned"} to ${nextAssignee}`, date: changeDate });
  if (nextTier !== currentTicket.tier) history.push({ text: `Level changed from ${currentTicket.tier} to ${nextTier}`, date: changeDate });
  if (nextSeverity !== currentTicket.severity) history.push({ text: `Severity changed from ${currentTicket.severity} to ${nextSeverity}`, date: changeDate });
  if (nextStatus !== currentTicket.status) history.push({ text: `Status changed from ${currentTicket.status} to ${nextStatus}`, date: changeDate });

  currentTicket.rootCause = rootCause;
  currentTicket.assignedTo = nextAssignee;
  currentTicket.tier = nextTier;
  currentTicket.severity = nextSeverity;
  currentTicket.status = nextStatus;

  renderTicketHeader();
  renderTicketInfo();
  renderTicketHandling();
  renderTicketHistory();
});
