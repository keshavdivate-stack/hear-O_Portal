/* ---------------- Shared by support.html and ticket-detail.html ----------------
   Ticket badges/category classification, the custom "bo-select" dropdown
   plumbing, and the seeded Patient Log generator -- so ticket-detail.html,
   which never loads support.js, still gets working badges, dropdowns, and
   device log data. */

const statusPillClass = { "Open": "bo-pill-status-open", "In Progress": "bo-pill-status-inprogress", "Escalated": "bo-pill-status-escalated", "Resolved": "bo-pill-status-resolved" };
const severityPillClass = { "Low": "bo-pill-severity-low", "Medium": "bo-pill-severity-medium", "High": "bo-pill-severity-high", "Critical": "bo-pill-severity-critical" };
const originPillClass = { "System Generated": "bo-pill-origin-system", "User Created": "bo-pill-origin-user" };
const typePillClass = { "Patient": "bo-pill-type-patient", "Clinic": "bo-pill-type-clinic" };

const statusPill = (s) => `<span class="bo-pill ${statusPillClass[s] || ""}">${s}</span>`;
const severityPill = (p) => `<span class="bo-pill ${severityPillClass[p] || ""}">${p}</span>`;
const tierPill = (t) => `<span class="bo-pill bo-pill-tier">${t}</span>`;
const originPill = (o) => `<span class="bo-pill ${originPillClass[o] || ""}">${o}</span>`;
const typePill = (s) => `<span class="bo-pill ${typePillClass[s] || ""}">${s}</span>`;
/* Category is a classification/routing field, not an urgency indicator --
   rendered as a neutral tag so it doesn't visually compete with the
   severity/status color coding in the same row. Tickets created via the
   New Ticket form can carry an explicit category (user picked it, or it
   defaulted from Issue Type); older/generated tickets fall back to the
   Issue Type -> category lookup. */
const ticketCategory = (t) => t.category || ISSUE_TYPE_CATEGORY[t.issueType];
const categoryPill = (t) => `<span class="bo-pill bo-pill-tag">${ticketCategory(t) || "—"}</span>`;

/* ---------------- Custom "bo-select" dropdown plumbing ---------------- */
function buildFilterSelectOptions(values, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  return clearOption + buildSelectOptions(values);
}

function buildSelectOptions(values) {
  return values
    .map(
      (v) => `
      <div class="bo-select-option" data-value="${v}">${v}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}

/* Like buildSelectOptions, but for a list of support agent names -- the
   option (and the trigger, once selected) displays "Name (Level X)" while
   the underlying stored value stays the plain agent name. */
function buildAgentSelectOptions(names) {
  return names
    .map(
      (n) => `
      <div class="bo-select-option" data-value="${n}">${agentLabel(n)}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}

function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const options = Array.from(select.querySelectorAll(".bo-select-option"));
  /* Compare dataset.value directly rather than building a
     [data-value="..."] CSS selector -- many values here (statuses like "In
     Progress", levels like "Level 1", categories like "Patient (Mobile/Web)",
     issue types with colons/slashes) contain characters CSS.escape would
     encode, which never matches the plain, unescaped attribute actually
     rendered in the DOM. That silently left the dropdown showing its
     placeholder instead of the selected value, even though the underlying
     filter was applied correctly. */
  const option = options.find((o) => o.dataset.value === value);

  options.forEach((o) => o.classList.remove("selected"));

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

function resetBoSelect(select) {
  setBoSelectValue(select, "", { silent: true });
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function initBoSelects() {
  document.querySelectorAll(".bo-select").forEach((select) => {
    const trigger = select.querySelector(".bo-select-trigger");
    const valueEl = select.querySelector(".bo-select-value");

    valueEl.dataset.placeholder = valueEl.textContent.trim();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !select.classList.contains("open");
      closeAllBoSelects();
      if (willOpen) positionBoSelectMenu(select);
      select.classList.toggle("open", willOpen);
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
}

/* ---------------- Ticket history ---------------- */
/* Tickets are seeded without a history log -- back-fill a single "Created"
   entry the first time a ticket is opened, so every ticket shows at least
   its origin instead of an empty timeline. */
function ensureTicketHistory(ticket) {
  if (!ticket.history) {
    ticket.history = [{ text: `Ticket created (${ticket.origin})`, date: ticket.createdDate }];
  }
  return ticket.history;
}

/* ---------------- Patient log (app version / device / permissions) ----------------
   Field set mirrors what the mobile app's own device log actually reports
   (see a raw log export: `[DeviceID]: iPhone17-5`, `VersionUpdateManager:
   Current App version: 3.2.0`, `Available device capacity usage MB: ...`,
   `HealthKit: Permission requesting - success`, `reading Blood Pressure -
   permissions denied`, etc.) -- so this only surfaces fields the app log
   really emits, not invented telemetry (no battery %, network type, etc.
   which the log never records). The seeded ticket data has no device
   telemetry attached to it, so the log is derived deterministically from
   the patient ID -- same ticket always shows the same "captured" log
   instead of re-rolling on every open. */
function seededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    hash = (hash * 1103515245 + 12345) >>> 0;
    return hash / 4294967296;
  };
}

function pickFrom(rand, arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const LOG_DEVICES = [
  { deviceId: "iPhone17-5", os: "iOS 26.5", platform: "iOS" },
  { deviceId: "iPhone16-2", os: "iOS 18.4", platform: "iOS" },
  { deviceId: "iPhone14-7", os: "iOS 17.6", platform: "iOS" },
  { deviceId: "SM-G991B", os: "Android 14", platform: "Android" },
  { deviceId: "Pixel-7", os: "Android 14", platform: "Android" },
];
const LOG_APP_VERSIONS = ["3.1.5", "3.2.0", "3.2.7", "3.3.0", "3.4.1"];

/* Raw event lines the mobile app's device log actually emits, sampled from a
   real log export -- used to fabricate a plausible "Log History" list. */
const LOG_HISTORY_TEMPLATES = [
  "AudioEngineManager: Initalize session configuration - success",
  "AudioEngineManager: Set preferred sample rate - success",
  "AudioEngineManager: Activate session - success",
  "AudioEngineManager: Starting mic",
  "AudioRecorder: Mixer attach - success",
  "AudioRecorder: Mixer Input - success",
  "AudioRecorder: Engine Start - success",
  "AudioEngineManager: Model successfully initialized for language 'en'",
  "CordioNetworkManager: POST /api/Auth/saveFCMToken",
  "CordioNetworkManager: Response Status Code: 200",
  "CordioNetworkManager: POST /api/comm/chatmessage/GetForPatient",
  "FCM Token Sync: Successfully sent token to server",
  "Lexicon: Getting new version url - success",
  "Lexicon: Download - started chunk #0. Chunk size is 20MB",
  "Lexicon: Found model for language 'en' with version '0.0'",
  "FileUploader: get pending files list - failed: folder \"recordings\" doesn't exist",
  "Notification Manager: reminder mode updated from new config",
  "VoskModel: Found model path for language 'en'",
  "reset the app Badge",
  "Available device capacity usage MB: 110286 MB",
  "NoSessionLog: skipped - gap 0d < required 3d",
];

function buildLogHistory(rand, ticket) {
  const count = 18 + Math.floor(rand() * 10);
  let h = 8 + Math.floor(rand() * 10);
  let m = Math.floor(rand() * 60);
  let s = Math.floor(rand() * 60);
  const day = (ticket.createdDate || "").split(" ")[0] || "";
  const lines = [];
  for (let i = 0; i < count; i++) {
    s += 1 + Math.floor(rand() * 4);
    if (s >= 60) { s -= 60; m += 1; }
    if (m >= 60) { m -= 60; h += 1; }
    const ts = `${day} ${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    lines.push({ ts, msg: pickFrom(rand, LOG_HISTORY_TEMPLATES) });
  }
  return lines;
}

/* Each patient session writes its own log file on-device (see the Patient
   Log review comments on session-by-session logs) -- so the console shows
   one session at a time, with a selector to move between the sessions that
   exist for this patient rather than pretending there's a single log. */
const PATIENT_LOG_SESSION_COUNT = 6;

function parseDdMmYyyy(datePart) {
  const [dd, mm, yyyy] = (datePart || "").split("/").map(Number);
  return dd && mm && yyyy ? new Date(yyyy, mm - 1, dd) : new Date();
}
function formatDdMmYyyy(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function buildLogSessions(ticket) {
  const seedBase = ticket.patientId || String(ticket.id);
  const gapRand = seededRandom(`${seedBase}-session-gaps`);
  const anchorDate = parseDdMmYyyy((ticket.createdDate || "").split(" ")[0]);
  const sessions = [];
  let cursor = new Date(anchorDate);
  for (let i = 0; i < PATIENT_LOG_SESSION_COUNT; i++) {
    const dateLabel = formatDdMmYyyy(cursor);
    const sessionRand = seededRandom(`${seedBase}-session-${dateLabel}`);
    sessions.push({
      id: `session-${i}`,
      date: dateLabel,
      dateObj: new Date(cursor),
      lines: buildLogHistory(sessionRand, { createdDate: `${dateLabel} 00:00` }),
    });
    cursor.setDate(cursor.getDate() - (1 + Math.floor(gapRand() * 3)));
  }
  return sessions; // most-recent-first, sessions[0] matches the ticket's own created date
}

function buildPatientLog(ticket) {
  const rand = seededRandom(ticket.patientId || String(ticket.id));
  const device = pickFrom(rand, LOG_DEVICES);
  const appVersion = pickFrom(rand, LOG_APP_VERSIONS);
  const buildNumber = 80 + Math.floor(rand() * 20);
  const storageMb = 40000 + Math.floor(rand() * 90000);

  return {
    appVersion: [
      { label: "App Version", value: appVersion },
      { label: "Build Number", value: String(buildNumber) },
      { label: "Platform", value: device.platform },
      { label: "Last Updated", value: ticket.createdDate.split(" ")[0] },
    ],
    deviceInfo: [
      { label: "Device ID", value: device.deviceId },
      { label: "OS Version", value: device.os },
      { label: "Available Storage", value: `${(storageMb / 1024).toFixed(1)} GB` },
    ],
    /* Microphone and Health Data Access used to be hardcoded "Granted" --
       that made it impossible to ever see the single most common cause of a
       failed recording (mic access denied on-device), so they're now
       seeded per patient like every other field here. Voice Engine tickets
       skew toward "Denied" so the diagnostic path (Issue panel's
       permission callout) actually has something to demonstrate. */
    permissions: [
      { label: "Microphone", value: rand() < (ticketCategory(ticket) === "Voice Engine" ? 0.6 : 0.1) ? "Denied" : "Granted" },
      { label: "Notifications", value: "Granted" },
      { label: "Health Data Access", value: rand() > 0.8 ? "Denied" : "Granted" },
      { label: "Chat", value: rand() > 0.85 ? "Denied" : "Granted" },
      { label: "Blood Pressure Data", value: rand() > 0.5 ? "Denied" : "Granted" },
    ],
    sessions: buildLogSessions(ticket),
  };
}
