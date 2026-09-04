/* ---------------- Shared by support.html and ticket-detail.html ----------------
   Ticket handling defaults (Level) and the seeded Patient Log generator --
   ported from backoffice1/js/support-tickets-common.js and adapted to the
   clinic portal's ticket shape (ticketList entries: ticketId, organization,
   type, who, patientName, category, issueType, origin, severity, state,
   assignedTo, created, description, history -- no separate patientId field,
   so `who` doubles as the patient id for Patient-type tickets; `created` is
   "dd.mm.yyyy", not backoffice's "dd/mm/yyyy hh:mm"). */

/* ---------------- Ticket history ----------------
   Clinic's ticketList already seeds t.history = [{ date, title, detail }]
   for every ticket at load time (see js/support-data.js), so unlike
   backoffice this never needs to be back-filled lazily -- this helper just
   gives ticket-detail.js the same call shape backoffice's ticket-detail.js
   uses, in case a ticket is ever added without history attached. */
function ensureTicketHistory(ticket) {
  if (!ticket.history) {
    ticket.history = [{ date: ticket.created, title: "Ticket Created" }];
  }
  return ticket.history;
}

/* ---------------- Handling: default Level ----------------
   The clinic's ticketList has no `tier`/`level` field -- unlike backoffice's
   seeded data. Give every ticket a one-time default the first time its
   Handling form is opened: prefer whatever Level the ticket's current
   assignedTo agent actually belongs to (TIER_AGENTS/AGENT_LEVEL, see
   support-data.js), so the Handling form doesn't show a Level that
   immediately reassigns the ticket away from its existing owner. Only
   falls back to a severity-based guess when assignedTo isn't a recognized
   support-team member. */
function deriveDefaultTier(ticket) {
  if (ticket.tier) return ticket.tier;
  const agentLevel = AGENT_LEVEL[ticket.assignedTo];
  if (agentLevel) {
    ticket.tier = agentLevel;
    return ticket.tier;
  }
  const bySeverity = { Critical: "Level 3", High: "Level 2", Medium: "Level 1", Low: "Level 1" };
  ticket.tier = bySeverity[ticket.severity] || "Level 1";
  return ticket.tier;
}

/* ---------------- Handling: Organization choices ----------------
   Backoffice draws Level 3's Organization select from a dedicated `orgs`
   list (orgs-data.js). Clinic has no such reference list, so the choices
   are simply every organization code already used across ticketList. */
const TICKET_ORG_CODES = [...new Set(ticketList.map((t) => t.organization))].sort();

/* ---------------- Seeded random (same algorithm as backoffice) ---------------- */
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

/* Like buildCustomSelectOptions (js/custom-select.js), but for a list of
   support team member names -- the option (and the trigger, once selected)
   displays "Name (Level X)" via agentLabel() while the underlying stored
   value stays the plain name. Mirrors backoffice's buildAgentSelectOptions. */
function buildAgentSelectOptions(names) {
  return names
    .map(
      (n) => `
      <div class="custom-select-option" data-value="${n}">${agentLabel(n)}
        <svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}

/* ---------------- Patient log (app version / device / permissions) ----------------
   Field set and generation logic ported verbatim from backoffice1/js/
   support-tickets-common.js's buildPatientLog -- same device list, app
   version list, and raw log-line templates (sampled from a real mobile app
   log export), so the demo data reads the same across both portals. */
const LOG_DEVICES = [
  { deviceId: "iPhone17-5", os: "iOS 26.5", platform: "iOS" },
  { deviceId: "iPhone16-2", os: "iOS 18.4", platform: "iOS" },
  { deviceId: "iPhone14-7", os: "iOS 17.6", platform: "iOS" },
  { deviceId: "SM-G991B", os: "Android 14", platform: "Android" },
  { deviceId: "Pixel-7", os: "Android 14", platform: "Android" },
];
const LOG_APP_VERSIONS = ["3.1.5", "3.2.0", "3.2.7", "3.3.0", "3.4.1"];

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

function buildLogHistory(rand, dayLabel) {
  const count = 18 + Math.floor(rand() * 10);
  let h = 8 + Math.floor(rand() * 10);
  let m = Math.floor(rand() * 60);
  let s = Math.floor(rand() * 60);
  const lines = [];
  for (let i = 0; i < count; i++) {
    s += 1 + Math.floor(rand() * 4);
    if (s >= 60) { s -= 60; m += 1; }
    if (m >= 60) { m -= 60; h += 1; }
    const ts = `${dayLabel} ${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    lines.push({ ts, msg: pickFrom(rand, LOG_HISTORY_TEMPLATES) });
  }
  return lines;
}

const PATIENT_LOG_SESSION_COUNT = 6;

/* Clinic's ticket.created is "dd.mm.yyyy" (no time component), unlike
   backoffice's "dd/mm/yyyy hh:mm". */
function parseDdMmYyyyDot(datePart) {
  const [dd, mm, yyyy] = (datePart || "").split(".").map(Number);
  return dd && mm && yyyy ? new Date(yyyy, mm - 1, dd) : new Date();
}
function formatDdMmYyyyDot(d) {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function buildLogSessions(ticket) {
  const seedBase = ticket.who || ticket.ticketId;
  const gapRand = seededRandom(`${seedBase}-session-gaps`);
  const anchorDate = parseDdMmYyyyDot(ticket.created);
  const sessions = [];
  let cursor = new Date(anchorDate);
  for (let i = 0; i < PATIENT_LOG_SESSION_COUNT; i++) {
    const dateLabel = formatDdMmYyyyDot(cursor);
    const sessionRand = seededRandom(`${seedBase}-session-${dateLabel}`);
    sessions.push({
      id: `session-${i}`,
      date: dateLabel,
      dateObj: new Date(cursor),
      lines: buildLogHistory(sessionRand, dateLabel),
    });
    cursor.setDate(cursor.getDate() - (1 + Math.floor(gapRand() * 3)));
  }
  return sessions; // most-recent-first, sessions[0] matches the ticket's own created date
}

function buildPatientLog(ticket) {
  const seedBase = ticket.who || ticket.ticketId;
  const rand = seededRandom(seedBase);
  const device = pickFrom(rand, LOG_DEVICES);
  const appVersion = pickFrom(rand, LOG_APP_VERSIONS);
  const buildNumber = 80 + Math.floor(rand() * 20);
  const storageMb = 40000 + Math.floor(rand() * 90000);

  return {
    appVersion: [
      { label: "App Version", value: appVersion },
      { label: "Build Number", value: String(buildNumber) },
      { label: "Platform", value: device.platform },
      { label: "Last Updated", value: ticket.created },
    ],
    deviceInfo: [
      { label: "Device ID", value: device.deviceId },
      { label: "OS Version", value: device.os },
      { label: "Available Storage", value: `${(storageMb / 1024).toFixed(1)} GB` },
    ],
    /* Microphone and Health Data Access used to be hardcoded "Granted" in the
       original backoffice design -- now seeded per patient, same as
       backoffice's own buildPatientLog, so Voice Engine tickets skew toward
       "Denied" and the Issue panel's mic-permission callout has something
       real to demonstrate (e.g. TCK-1050). */
    permissions: [
      { label: "Microphone", value: rand() < (ticket.category === "Voice Engine" ? 0.6 : 0.1) ? "Denied" : "Granted" },
      { label: "Notifications", value: "Granted" },
      { label: "Health Data Access", value: rand() > 0.8 ? "Denied" : "Granted" },
      { label: "Chat", value: rand() > 0.85 ? "Denied" : "Granted" },
      { label: "Blood Pressure Data", value: rand() > 0.5 ? "Denied" : "Granted" },
    ],
    sessions: buildLogSessions(ticket),
  };
}
