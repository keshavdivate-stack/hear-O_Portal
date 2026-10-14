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

/* The developed Handling panel only offers Level 1 / Level 2, so a ticket
   seeded at Level 3 is shown (and saved) as Level 2 on this page. Done once
   up front so Save doesn't log a spurious "Level changed" entry for it. */
const HANDLING_TIERS = TIERS.filter((t) => t !== "Level 3");
if (currentTicket.tier === "Level 3") currentTicket.tier = "Level 2";

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

document.querySelector('.bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(HANDLING_TIERS);
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

/* Resolved tickets no longer need routing info -- hide Level/Assigned To
   rather than asking for values that don't matter anymore. */
function applyTicketDetailStatusVisibility(status) {
  const resolved = status === "Resolved";
  document.getElementById("ticketDetailLevelField").hidden = resolved;
  document.getElementById("ticketDetailAssignedToField").hidden = resolved;
}

/* Handling is always editable, so Save Changes (page header) compares the
   form against what was last rendered: it stays disabled until something
   actually changes, and -- as before -- until Assigned To and Note are set. */
let ticketHandlingBaseline = null;

function readTicketHandlingForm() {
  const val = (name) => document.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`).value;
  return {
    status: val("ticketStatus"),
    tier: val("ticketLevel"),
    assignedTo: val("ticketAssignedTo"),
    note: document.getElementById("ticketDetailRootCause").value.trim(),
  };
}

function validateTicketDetailForm() {
  const form = readTicketHandlingForm();
  applyTicketDetailStatusVisibility(form.status);
  const assigneeFilled = form.status === "Resolved" || form.assignedTo !== "";
  const noteFilled = form.note !== "";
  const changed = !ticketHandlingBaseline || Object.keys(form).some((k) => form[k] !== ticketHandlingBaseline[k]);
  document.getElementById("saveTicketDetail").disabled = !changed || !assigneeFilled || !noteFilled;
}

function renderTicketHeader() {
  document.getElementById("ticketDetailTitle").textContent = currentTicket.ticketNo;
  const badge = (label, pill) => `<span class="td-badge-group"><span class="td-badge-label">${label}</span>${pill}</span>`;
  /* Status / Level live in the Handling panel; the header only
     carries the Type tag, as on the developed screen. */
  document.getElementById("ticketDetailBadges").innerHTML = badge("Type", typePill(ticketType(currentTicket)));
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
    `<span class="td-meta-sep">&middot;</span>Created For: ${currentTicket.who || (currentSource === "patient" ? currentTicket.patientId : currentTicket.raisedBy)}` +
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

function formatRecordingTime(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function stopTicketRecording() {
  ticketRecordingPlayer.stop();
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
  /* The recording date filter starts on the ticket's creation day so the
     calendar opens on a useful date for this ticket. */
  const createdDate = parseTicketDate(currentTicket.createdDate);
  ticketRecordingDate = createdDate || new Date();
  ticketRecordingDate.setHours(0, 0, 0, 0);
  updateTicketRecordingDateDisplay();
  const rand = seededRandom(currentTicket.ticketNo);
  const partCount = 4 + Math.floor(rand() * 3); // 4-6 parts
  partsEl.innerHTML = Array.from({ length: partCount }, (_, i) => recordingPartRow(2 + Math.floor(rand() * 8), i)).join(""); // 2-9 s each

  /* Root-cause check: this is the same seeded permissions data the
     Patient Log's Permissions Info panel shows -- built independently
     here rather than reused from currentPatientLog so this doesn't
     depend on render order (Patient Log renders after the Issue panel). */
  if (currentSource === "patient") {
    const micPermission = buildPatientLog(currentTicket).permissions.find((p) => p.label === "Microphone");
    micAlert.hidden = !micPermission || micPermission.value !== "Disabled";
  }
}

/* ---------------- Recording date filter ---------------- */
let ticketRecordingDate = null;
let ticketRecordingCalendarViewDate = new Date();
const ticketRecordingCalendarEl = document.getElementById("ticketRecordingCalendar");

function parseTicketDate(value) {
  if (!value) return null;
  const match = String(value).match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
}

function updateTicketRecordingDateDisplay() {
  document.getElementById("ticketRecordingDateValue").textContent = formatDisplayDate(ticketRecordingDate);
  document.getElementById("ticketRecordingDateField").classList.toggle("placeholder", !ticketRecordingDate);
}

function renderTicketRecordingCalendar() {
  const year = ticketRecordingCalendarViewDate.getFullYear();
  const month = ticketRecordingCalendarViewDate.getMonth();
  document.getElementById("ticketRecordingCalendarMonthLabel").textContent =
    ticketRecordingCalendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const first = new Date(year, month, 1);
  const cells = [];
  for (let i = 0; i < first.getDay(); i++) cells.push({ date: new Date(year, month, i - first.getDay() + 1), muted: true });
  for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day++) cells.push({ date: new Date(year, month, day), muted: false });
  while (cells.length % 7) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
  }
  document.getElementById("ticketRecordingCalendarDays").innerHTML = cells.map(({ date, muted }) => {
    const classes = ["bo-mini-calendar-day"];
    if (muted) classes.push("muted");
    if (sameDay(date, ticketRecordingDate)) classes.push("selected");
    return `<button type="button" class="${classes.join(" ")}" data-time="${date.getTime()}" aria-pressed="${sameDay(date, ticketRecordingDate)}">${date.getDate()}</button>`;
  }).join("");
}

function openTicketRecordingCalendar() {
  const date = ticketRecordingDate || new Date();
  ticketRecordingCalendarViewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  document.getElementById("ticketRecordingDateField").classList.add("active");
  ticketRecordingCalendarEl.hidden = false;
  renderTicketRecordingCalendar();
}

function closeTicketRecordingCalendar() {
  document.getElementById("ticketRecordingDateField").classList.remove("active");
  ticketRecordingCalendarEl.hidden = true;
}

document.getElementById("ticketRecordingDateField").addEventListener("click", (e) => {
  e.stopPropagation();
  if (ticketRecordingCalendarEl.hidden) openTicketRecordingCalendar();
  else closeTicketRecordingCalendar();
});
document.getElementById("ticketRecordingCalendarPrev").addEventListener("click", (e) => {
  e.stopPropagation();
  ticketRecordingCalendarViewDate = new Date(ticketRecordingCalendarViewDate.getFullYear(), ticketRecordingCalendarViewDate.getMonth() - 1, 1);
  renderTicketRecordingCalendar();
});
document.getElementById("ticketRecordingCalendarNext").addEventListener("click", (e) => {
  e.stopPropagation();
  ticketRecordingCalendarViewDate = new Date(ticketRecordingCalendarViewDate.getFullYear(), ticketRecordingCalendarViewDate.getMonth() + 1, 1);
  renderTicketRecordingCalendar();
});
document.getElementById("ticketRecordingCalendarDays").addEventListener("click", (e) => {
  e.stopPropagation();
  const day = e.target.closest(".bo-mini-calendar-day");
  if (!day) return;
  ticketRecordingDate = new Date(Number(day.dataset.time));
  ticketRecordingDate.setHours(0, 0, 0, 0);
  updateTicketRecordingDateDisplay();
  closeTicketRecordingCalendar();
});
document.getElementById("ticketRecordingCalendarToday").addEventListener("click", (e) => {
  e.stopPropagation();
  ticketRecordingDate = new Date();
  ticketRecordingDate.setHours(0, 0, 0, 0);
  updateTicketRecordingDateDisplay();
  closeTicketRecordingCalendar();
});

/* Fake playback for a list of .bo-rec-part rows (no real audio in the
   prototype): play animates that part's time + progress line, pause keeps
   its position, and playing one part stops any other in the same list.
   Used by the Recording tab and the Patient Log's Recording section. */
function createRecordingPlayer(partsEl) {
  let timer = null;

  function stop() {
    clearInterval(timer);
    timer = null;
    partsEl.querySelectorAll(".bo-rec-part").forEach((row) => {
      const btn = row.querySelector(".bo-rec-play");
      btn.classList.remove("playing");
      btn.innerHTML = lrPlayIcon;
      btn.setAttribute("aria-label", "Play");
      row.dataset.elapsedMs = 0;
      row.querySelector(".bo-rec-fill").style.width = "0%";
      row.querySelector(".bo-rec-time").textContent = `0:00 / ${formatRecordingTime(Number(row.dataset.durationMs) / 1000)}`;
    });
  }

  partsEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".bo-rec-play");
    if (!btn) return;
    const row = btn.closest(".bo-rec-part");
    const wasPlaying = btn.classList.contains("playing");
    const resumeFromMs = Number(row.dataset.elapsedMs) || 0;

    /* Pausing keeps this part's position; playing a part stops any other. */
    clearInterval(timer);
    if (wasPlaying) {
      btn.classList.remove("playing");
      btn.innerHTML = lrPlayIcon;
      btn.setAttribute("aria-label", "Play");
      return;
    }
    stop();
    row.dataset.elapsedMs = resumeFromMs;

    const durationMs = Number(row.dataset.durationMs);
    const fillEl = row.querySelector(".bo-rec-fill");
    const timeEl = row.querySelector(".bo-rec-time");
    btn.classList.add("playing");
    btn.innerHTML = lrPauseIcon;
    btn.setAttribute("aria-label", "Pause");

    const startedAt = Date.now() - resumeFromMs;
    timer = setInterval(() => {
      const elapsedMs = Math.min(Date.now() - startedAt, durationMs);
      row.dataset.elapsedMs = elapsedMs;
      fillEl.style.width = `${(elapsedMs / durationMs) * 100}%`;
      timeEl.textContent = `${formatRecordingTime(elapsedMs / 1000)} / ${formatRecordingTime(durationMs / 1000)}`;
      if (elapsedMs >= durationMs) stop();
    }, 100);
  });

  return { stop };
}

/* Markup for one part row -- shared by both recording lists. */
function recordingPartRow(durationSec, index) {
  return `
      <div class="bo-rec-part" data-duration-ms="${durationSec * 1000}" data-elapsed-ms="0">
        <button type="button" class="bo-rec-play" aria-label="Play">${lrPlayIcon}</button>
        <span class="bo-rec-time">0:00 / ${formatRecordingTime(durationSec)}</span>
        <div class="bo-rec-track"><div class="bo-rec-fill"></div></div>
        <span class="bo-rec-label">Part ${index + 1}</span>
      </div>`;
}

const ticketRecordingPlayer = createRecordingPlayer(document.getElementById("ticketDetailRecordingParts"));

/* Handling is always editable (see "Handling form wiring"). Resolved
   tickets drop the routing fields. */
function renderTicketHandling() {
  document.getElementById("ticketDetailRootCause").value = currentTicket.rootCause || "";
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketStatus"]'), currentTicket.status, { silent: true });
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketLevel"]'), currentTicket.tier, { silent: true });
  populateTicketDetailAssignees(currentTicket.tier);
  const tierAgents = TIER_AGENTS[currentTicket.tier] || SUPPORT_AGENTS;
  const assignee = tierAgents.includes(currentTicket.assignedTo) ? currentTicket.assignedTo : defaultAssigneeForTier(currentTicket.tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), assignee, { silent: true });
  ticketHandlingBaseline = readTicketHandlingForm();
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
        <span class="bo-history-date">${/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}$/.test(h.date) ? formatTicketCreated(h.date) : h.date}</span>
        ${h.by ? `<span class="bo-history-by">by ${h.by}</span>` : ""}
      </div>`
    )
    .join("");
}

/* ---------------- Patient Log ----------------
   Matches the developed screen: From / To dates + "Clear dates" on top,
   then the app's daily SUPPORT.log files listed on the left (newest first)
   with the selected file's lines on the right, and a Recording section
   below. None of it is real telemetry -- files and recordings are seeded
   off the ticket's "Created For" id (same ticket, same data), and dated
   relative to today so the default last-30-days range always has files. */
let currentPatientLog = null;

/* Used by the Recording tab's single-date picker. */
function formatDisplayDate(d) {
  return d ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` : "—";
}
function sameDay(a, b) {
  return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const pad2 = (n) => String(n).padStart(2, "0");
function startOfDay(d) {
  const day = new Date(d);
  day.setHours(0, 0, 0, 0);
  return day;
}
/* Patient Log dates read US-style like the developed screen: 10/13/2026, 11:59 AM */
function formatUsDate(d) {
  return `${pad2(d.getMonth() + 1)}/${pad2(d.getDate())}/${d.getFullYear()}`;
}
function formatUsDateTime(d) {
  return `${formatUsDate(d)}, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}
/* 2026-10-13 -> "261013", the date stamp the app puts in log file names. */
function logDateStamp(d) {
  return `${String(d.getFullYear()).slice(2)}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}
/* Either end may be empty (= open range). */
function inPatientLogRange(date, from, to) {
  const day = startOfDay(date);
  return (!from || day >= from) && (!to || day <= to);
}

/* ~9 log files over the last ~2 weeks, named the way the app writes them:
   <CreatedFor>_<YYMMDD>_000000_<Platform>_SUPPORT.log. Mostly from the
   patient's own device platform; now and then (and always today) a second
   file from the other platform, as when the patient also signs in on
   another phone. */
function buildPatientLogFiles(createdFor, platform) {
  const rand = seededRandom(`${createdFor}#log-files`);
  const otherPlatform = platform === "iOS" ? "Android" : "iOS";
  const now = new Date();
  const today = startOfDay(now);
  const files = [];
  let offset = 0;
  while (files.length < 9) {
    const day = new Date(today);
    day.setDate(today.getDate() - offset);
    const platforms = offset === 0 || rand() < 0.2 ? [otherPlatform, platform] : [platform];
    platforms.forEach((p, i) => {
      const modified = new Date(day);
      modified.setHours(8 + Math.floor(rand() * 12), Math.floor(rand() * 60));
      if (modified > now) modified.setTime(now.getTime() - (i + 1) * 7 * 60000); // today's files can't be from later today
      files.push({ name: `${createdFor}_${logDateStamp(day)}_000000_${p}_SUPPORT.log`, platform: p, day, modified, lines: null });
    });
    offset += 1 + Math.floor(rand() * 2);
  }
  return files.sort((a, b) => b.modified - a.modified);
}

const PATIENT_LOG_HEALTH_METRICS = ["Flights", "Sleep", "Steps", "Heart Rate", "Blood Pressure", "Weight", "Oxygen Saturation"];
const PATIENT_LOG_WARNINGS = ["Low storage - 1.2 GB available", "Network unreachable - retry scheduled", "Background App Refresh disabled by OS"];
const PATIENT_LOG_INCIDENTS = ["Sensors Data Failure detected", "Upload queue stalled - recordings pending", "Microphone unavailable - recording aborted"];

/* One file's lines ("HH:MM:SS : LEVEL - message"), seeded by the file name
   so a file always reads the same. Health reads go through HealthKit on
   iOS and Health Connect on Android. Some files end with the app's
   multi-line "Session Incident" block. */
function buildPatientLogFileLines(file) {
  const rand = seededRandom(file.name);
  const healthSource = file.platform === "Android" ? "Health Connect" : "HealthKit";
  const prevDay = new Date(file.day);
  prevDay.setDate(prevDay.getDate() - 1);
  let sec = Math.max(0, file.modified.getHours() - 1) * 3600 + Math.floor(rand() * 1800);
  const clock = () => `${pad2(Math.floor(sec / 3600) % 24)}:${pad2(Math.floor(sec / 60) % 60)}:${pad2(sec % 60)}`;
  const lines = [];
  const count = 16 + Math.floor(rand() * 12);
  for (let i = 0; i < count; i++) {
    sec += Math.floor(rand() * 25);
    const roll = rand();
    let entry;
    if (roll < 0.4) entry = `INFO - ${pickFrom(rand, LOG_HISTORY_TEMPLATES)}`;
    else if (roll < 0.68) entry = `ERROR - ${pickFrom(rand, PATIENT_LOG_HEALTH_METRICS)} read failed for ${logDateStamp(prevDay)} - ${healthSource}: Data requesting - failed: no data`;
    else if (roll < 0.8) entry = `PERMISSION - Health permission denied for ${pickFrom(rand, PATIENT_LOG_HEALTH_METRICS)}`;
    else if (roll < 0.9) entry = `WARNING - ${pickFrom(rand, PATIENT_LOG_WARNINGS)}`;
    else entry = `INCIDENT - ${pickFrom(rand, PATIENT_LOG_INCIDENTS)}`;
    lines.push(`${clock()} : ${entry}`);
  }
  if (rand() < 0.6) {
    const gapDays = 2 + Math.floor(rand() * 3);
    const lastActivity = new Date(file.day);
    lastActivity.setDate(lastActivity.getDate() - gapDays);
    sec += 60 + Math.floor(rand() * 120);
    lines.push(
      `${file.day.getFullYear()}-${pad2(file.day.getMonth() + 1)}-${pad2(file.day.getDate())} | ${clock()} IST | Session Incident`,
      "INCIDENT    : No Recording Session",
      `DESCRIPTION : No recording session for ${gapDays} days - last activity ${logDateStamp(lastActivity)}`
    );
  }
  return lines;
}

/* ~5 recent recording sessions (newest first), each split into 7-9 parts. */
function buildPatientRecordingSessions(createdFor) {
  const rand = seededRandom(`${createdFor}#recordings`);
  const today = startOfDay(new Date());
  const sessions = [];
  let offset = 1 + Math.floor(rand() * 2);
  for (let i = 0; i < 5; i++) {
    const morning = rand() < 0.6;
    const at = new Date(today);
    at.setDate(today.getDate() - offset);
    at.setHours(morning ? 7 + Math.floor(rand() * 4) : 18 + Math.floor(rand() * 3), Math.floor(rand() * 60));
    const partCount = 7 + Math.floor(rand() * 3);
    sessions.push({
      name: morning ? "Morning recording" : "Evening recording",
      at,
      parts: Array.from({ length: partCount }, () => 3 + Math.floor(rand() * 7)), // 3-9 s each
    });
    offset += 2 + Math.floor(rand() * 5);
  }
  return sessions;
}

/* Four date fields share one state object and one mini calendar:
   logFrom / logTo filter the log files, recFrom / recTo the recordings. */
const patientLogDates = { logFrom: null, logTo: null, recFrom: null, recTo: null };
let patientLogFiles = [];
let patientLogSelectedFile = null;
let patientRecordingSessions = [];
let patientLogCalendarField = null;
let patientLogCalendarViewDate = new Date();
const patientLogCalendarEl = document.getElementById("plogCalendar");
const patientRecordingPlayer = createRecordingPlayer(document.getElementById("plogRecParts"));

function patientLogFieldEl(field) {
  return document.querySelector(`.td-plog-date-field[data-plog-field="${field}"]`);
}
function patientLogRangeFields(field) {
  return field.startsWith("log") ? ["logFrom", "logTo"] : ["recFrom", "recTo"];
}

function updatePatientLogDateField(field) {
  const el = patientLogFieldEl(field);
  const date = patientLogDates[field];
  el.querySelector(".bo-date-field-value").textContent = date ? formatUsDate(date) : "Select date";
  el.classList.toggle("placeholder", !date);
  el.querySelector(".td-plog-date-clear").hidden = !date;
}

/* Files in the From..To range, newest first; keeps the current selection if
   it's still in range, otherwise selects the newest file. */
function renderPatientLogFiles() {
  const listEl = document.getElementById("plogFileList");
  const viewerEl = document.getElementById("plogFileViewer");
  const { logFrom, logTo } = patientLogDates;
  const badRange = logFrom && logTo && logFrom > logTo;
  const files = badRange ? [] : patientLogFiles.filter((f) => inPatientLogRange(f.day, logFrom, logTo));
  if (!files.includes(patientLogSelectedFile)) patientLogSelectedFile = files[0] || null;

  listEl.innerHTML = files.length
    ? files
        .map(
          (f) => `
      <button type="button" class="td-plog-file${f === patientLogSelectedFile ? " selected" : ""}" data-file="${f.name}">
        <span class="td-plog-file-name" title="${f.name}">${f.name}</span>
        <span class="td-plog-file-time">${formatUsDateTime(f.modified)}</span>
      </button>`
        )
        .join("")
    : `<div class="patient-log-empty">${badRange ? "From date must be on or before the To date." : "No log files in this date range"}</div>`;

  if (patientLogSelectedFile) {
    patientLogSelectedFile.lines = patientLogSelectedFile.lines || buildPatientLogFileLines(patientLogSelectedFile);
    viewerEl.innerHTML = patientLogSelectedFile.lines.map((l) => `<div class="td-plog-line">${l}</div>`).join("");
    viewerEl.scrollTop = 0;
  } else {
    viewerEl.innerHTML = `<div class="patient-log-empty">No log file selected</div>`;
  }
  document.getElementById("downloadPatientLogBtn").disabled = !patientLogSelectedFile;
}

/* No dates picked: the patient's last session. With a range: the latest
   session inside it. */
function renderPatientLogRecording() {
  patientRecordingPlayer.stop();
  const captionEl = document.getElementById("plogRecCaption");
  const partsEl = document.getElementById("plogRecParts");
  const { recFrom, recTo } = patientLogDates;
  const session = patientRecordingSessions.find((s) => inPatientLogRange(s.at, recFrom, recTo));
  if (!session) {
    captionEl.hidden = true;
    partsEl.innerHTML = `<div class="patient-log-empty">No recordings in this date range</div>`;
    return;
  }
  captionEl.hidden = false;
  captionEl.innerHTML = `${recFrom || recTo ? "Session" : "Last Session"} &mdash; ${session.name} &middot; ${formatUsDateTime(session.at)}`;
  partsEl.innerHTML = session.parts.map((sec, i) => recordingPartRow(sec, i)).join("");
}

/* Patient Device Info card: same fields as the developed ticket screen
   (which has no Notifications row). A denied permission is highlighted --
   usually the reason the patient's data isn't coming through. */
function renderDeviceInfo() {
  document.getElementById("deviceInfo").hidden = false;
  document.getElementById("ticketDetailDeviceInfo").innerHTML = currentPatientLog.deviceCard
    .filter((r) => r.label !== "Notifications")
    .map((r) => `<div class="bo-kv-cell"><span class="k">${r.label}</span><span class="v${r.value === "Denied" ? " is-denied" : ""}">${r.value}</span></div>`)
    .join("");
}

function renderPatientLog() {
  const section = document.getElementById("patientLog");
  if (currentSource !== "patient") {
    section.hidden = true;
    document.getElementById("deviceInfo").hidden = true;
    currentPatientLog = null;
    return;
  }
  section.hidden = false;
  currentPatientLog = buildPatientLog(currentTicket);
  renderDeviceInfo();

  /* File names use the same "Created For" id the header shows. */
  const createdFor = currentTicket.who || currentTicket.patientId;
  const platform = currentPatientLog.appVersion.find((r) => r.label === "Platform").value;
  patientLogFiles = buildPatientLogFiles(createdFor, platform);
  patientRecordingSessions = buildPatientRecordingSessions(createdFor);
  patientLogSelectedFile = null;

  /* Logs default to the last 30 days ending today; Recording starts empty. */
  const today = startOfDay(new Date());
  patientLogDates.logTo = today;
  patientLogDates.logFrom = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
  patientLogDates.recFrom = null;
  patientLogDates.recTo = null;
  Object.keys(patientLogDates).forEach(updatePatientLogDateField);
  renderPatientLogFiles();
  renderPatientLogRecording();
}

/* ---------------- Patient Log: shared mini calendar ---------------- */
function renderPatientLogCalendar() {
  const viewYear = patientLogCalendarViewDate.getFullYear();
  const viewMonth = patientLogCalendarViewDate.getMonth();
  document.getElementById("plogCalendarMonthLabel").textContent = patientLogCalendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const [fromKey, toKey] = patientLogRangeFields(patientLogCalendarField);
  const from = patientLogDates[fromKey];
  const to = patientLogDates[toKey];

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstOfMonth.getDay(); i++) cells.push({ date: new Date(viewYear, viewMonth, i - firstOfMonth.getDay() + 1), muted: true });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(viewYear, viewMonth, d), muted: false });
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date;
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
  }

  document.getElementById("plogCalendarDays").innerHTML = cells
    .map(({ date, muted }) => {
      const classes = ["bo-mini-calendar-day"];
      if (muted) classes.push("muted");
      const isFrom = sameDay(date, from);
      const isTo = sameDay(date, to);
      if (isFrom || isTo) classes.push("selected");
      else if (from && to && date > from && date < to) classes.push("in-range");
      if (isFrom && to) classes.push("range-start");
      if (isTo && from) classes.push("range-end");
      return `<button type="button" class="${classes.join(" ")}" data-time="${date.getTime()}">${date.getDate()}</button>`;
    })
    .join("");
}

/* The calendar element is moved under whichever field opened it. */
function openPatientLogCalendar(field) {
  patientLogCalendarField = field;
  const fieldEl = patientLogFieldEl(field);
  document.querySelectorAll(".td-plog-date-field").forEach((el) => el.classList.toggle("active", el === fieldEl));
  fieldEl.parentElement.appendChild(patientLogCalendarEl);
  const [fromKey, toKey] = patientLogRangeFields(field);
  const anchor = patientLogDates[field] || patientLogDates[fromKey] || patientLogDates[toKey] || new Date();
  patientLogCalendarViewDate = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  patientLogCalendarEl.hidden = false;
  renderPatientLogCalendar();
}
function closePatientLogCalendar() {
  patientLogCalendarField = null;
  document.querySelectorAll(".td-plog-date-field").forEach((el) => el.classList.remove("active"));
  patientLogCalendarEl.hidden = true;
}

/* Every date change re-filters its own list right away. */
function setPatientLogDate(field, date) {
  patientLogDates[field] = date ? startOfDay(date) : null;
  updatePatientLogDateField(field);
  if (field.startsWith("log")) renderPatientLogFiles();
  else renderPatientLogRecording();
}

/* Date field triggers / × clear buttons / log file rows. */
document.getElementById("patientLog").addEventListener("click", (e) => {
  const trigger = e.target.closest(".td-plog-date-trigger");
  const clearBtn = e.target.closest(".td-plog-date-clear");
  const fileRow = e.target.closest(".td-plog-file");
  if (trigger) {
    e.stopPropagation();
    const field = trigger.closest(".td-plog-date-field").dataset.plogField;
    if (patientLogCalendarField === field) closePatientLogCalendar();
    else openPatientLogCalendar(field);
  } else if (clearBtn) {
    closePatientLogCalendar();
    setPatientLogDate(clearBtn.closest(".td-plog-date-field").dataset.plogField, null);
  } else if (fileRow) {
    patientLogSelectedFile = patientLogFiles.find((f) => f.name === fileRow.dataset.file) || null;
    renderPatientLogFiles();
  }
});
document.getElementById("plogCalendarPrev").addEventListener("click", (e) => {
  e.stopPropagation();
  patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() - 1, 1);
  renderPatientLogCalendar();
});
document.getElementById("plogCalendarNext").addEventListener("click", (e) => {
  e.stopPropagation();
  patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() + 1, 1);
  renderPatientLogCalendar();
});
document.getElementById("plogCalendarDays").addEventListener("click", (e) => {
  e.stopPropagation();
  const btn = e.target.closest(".bo-mini-calendar-day");
  if (!btn || !patientLogCalendarField) return;
  setPatientLogDate(patientLogCalendarField, new Date(Number(btn.dataset.time)));
  closePatientLogCalendar();
});
document.getElementById("plogCalendarClear").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!patientLogCalendarField) return;
  setPatientLogDate(patientLogCalendarField, null);
  renderPatientLogCalendar();
});
document.getElementById("plogCalendarToday").addEventListener("click", (e) => {
  e.stopPropagation();
  if (!patientLogCalendarField) return;
  setPatientLogDate(patientLogCalendarField, new Date());
  closePatientLogCalendar();
});
document.addEventListener("click", (e) => {
  if (!patientLogCalendarEl.hidden && !e.target.closest("#plogCalendar") && !e.target.closest(".td-plog-date-trigger")) closePatientLogCalendar();
  if (!ticketRecordingCalendarEl.hidden && !e.target.closest("#ticketRecordingCalendar") && !e.target.closest("#ticketRecordingDateField")) closeTicketRecordingCalendar();
});

/* "Clear dates" drops the log range -- every log file shows. */
document.getElementById("plogClearDates").addEventListener("click", () => {
  closePatientLogCalendar();
  setPatientLogDate("logFrom", null);
  setPatientLogDate("logTo", null);
});

/* Download Log saves the selected file as-is, under its own name. */
document.getElementById("downloadPatientLogBtn").addEventListener("click", () => {
  if (!patientLogSelectedFile) return;
  const blob = new Blob([`${patientLogSelectedFile.lines.join("\n")}\n`], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = patientLogSelectedFile.name;
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
  document.getElementById("ticketRecordingDateToolbar").hidden = name !== "recording";
}
document.getElementById("ticketRecordingDateToolbar").appendChild(document.querySelector(".bo-rec-date-row"));
document.querySelectorAll(".td-tab").forEach((tab) => tab.addEventListener("click", () => selectDetailTab(tab.dataset.tdTab)));

/* Recording follows renderTicketRecording(), which only reveals the player
   for Voice Engine tickets. */
function syncPatientLogTab() {
  document.querySelector('.td-tab[data-td-tab="deviceInfo"]').hidden = document.getElementById("deviceInfo").hidden;
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
   Handling is always editable -- no Edit button or read-only mode, matching
   the developed screen. The header's "Save Changes" button submits the
   form (via its form="ticketDetailForm" attribute). */
const ticketDetailForm = document.getElementById("ticketDetailForm");

document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
  const tier = e.target.value;
  populateTicketDetailAssignees(tier);
  setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), defaultAssigneeForTier(tier), { silent: true });
  validateTicketDetailForm();
});

ticketDetailForm.addEventListener("input", validateTicketDetailForm);
ticketDetailForm.addEventListener("change", validateTicketDetailForm);

/* The signed-in Backoffice user shown in the page header -- History says
   who made each change. */
const CURRENT_BO_USER = "Emily Carter";

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
  const nextStatus = document.querySelector('.bo-select[data-name="ticketStatus"] input[type=hidden]').value || currentTicket.status;

  /* Every field a Save touches (reassignment, level/tier transfer, status)
     is folded into a single history entry instead of one line per
     field -- so a ticket transfer and the note explaining it always land
     together, and whoever picks the ticket up next sees the note attached
     directly to the transfer instead of buried in a separate line. The
     entry's title headlines whichever change is most significant
     (reassignment > level > status); everything that changed,
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

  const noteChanged = rootCause !== (currentTicket.rootCause || "");
  if (!changeParts.length && noteChanged) {
    changeParts.push("Note updated");
    title = "Note Updated";
  }

  if (changeParts.length) {
    let detail = `${changeParts.join("; ")}.`;
    if (rootCause) detail += ` Note: ${rootCause}`;
    history.push({ title, detail, date: changeDate, by: CURRENT_BO_USER });
  }

  currentTicket.rootCause = rootCause;
  currentTicket.assignedTo = nextAssignee;
  currentTicket.tier = nextTier;
  currentTicket.status = nextStatus;

  renderTicketHeader();
  renderTicketInfo();
  renderTicketHandling();
  renderTicketHistory();
});
