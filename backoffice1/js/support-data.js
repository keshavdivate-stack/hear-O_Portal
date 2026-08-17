/* ---------------- Reference lists ---------------- */
/* Categories + named alarms sourced from the "System Health Check (Alarm -
   Error / Warning)" spec. ISSUE_TYPES covers every named alarm the doc
   defines, grouped by category via ISSUE_TYPE_CATEGORY, plus one manual
   catch-all ("Other / Manual Report") for tickets that don't correspond to
   any automated alarm (hardware failures, UI/translation bugs, etc. -- the
   doc only specifies system-health monitoring, not every possible
   complaint), and "Suspicious Clinic Login" so every category -- including
   Clinic Users (Security) -- has at least one demonstrable ticket. */
const CATEGORIES = ["Compliance", "Voice Engine", "Sensors", "Patient (Mobile/Web)", "Clinic Users (Security)", "System Schedule Engine"];
const SCOPES = ["Global", "Organization", "Patient"];

const ISSUE_TYPES = [
  "Total Compliance Drop",
  "Total Usable Compliance Drop",
  "Organization Compliance Drop",
  "Organization Usable Compliance Drop",
  "Signed In Not Uploaded",
  "Missing Smart Merger Results",
  "Missing ASR Results",
  "Missing ASR Derived Features",
  "Missing Track Feature Extraction",
  "Sensors Not Uploaded",
  "Sensor Metrics Below Threshold",
  "Stuck In Baseline",
  "Stuck In Registered",
  "Stuck In Priority",
  "Missing Priority Status",
  "Paused Too Long",
  "Unmonitored Too Long",
  "Other / Manual Report",
  "Missing Run: Baseline Completed Engine",
  "Missing Run: Start Date Engine",
  "Missing Run: Billing Calc",
  "Missing Run: Insufficient Recalculate",
  "Missing Run: Is Valid Engine",
  "Suspicious Clinic Login",
];

const ISSUE_TYPE_CATEGORY = {
  "Total Compliance Drop": "Compliance",
  "Total Usable Compliance Drop": "Compliance",
  "Organization Compliance Drop": "Compliance",
  "Organization Usable Compliance Drop": "Compliance",
  "Signed In Not Uploaded": "Compliance",
  "Missing Smart Merger Results": "Voice Engine",
  "Missing ASR Results": "Voice Engine",
  "Missing ASR Derived Features": "Voice Engine",
  "Missing Track Feature Extraction": "Voice Engine",
  "Sensors Not Uploaded": "Sensors",
  "Sensor Metrics Below Threshold": "Sensors",
  "Stuck In Baseline": "Patient (Mobile/Web)",
  "Stuck In Registered": "Patient (Mobile/Web)",
  "Stuck In Priority": "Patient (Mobile/Web)",
  "Missing Priority Status": "Patient (Mobile/Web)",
  "Paused Too Long": "Patient (Mobile/Web)",
  "Unmonitored Too Long": "Patient (Mobile/Web)",
  "Other / Manual Report": "Patient (Mobile/Web)",
  "Missing Run: Baseline Completed Engine": "System Schedule Engine",
  "Missing Run: Start Date Engine": "System Schedule Engine",
  "Missing Run: Billing Calc": "System Schedule Engine",
  "Missing Run: Insufficient Recalculate": "System Schedule Engine",
  "Missing Run: Is Valid Engine": "System Schedule Engine",
  "Suspicious Clinic Login": "Clinic Users (Security)",
};

/* Default scope per the doc's "Scope" column -- used to assign a scope to
   synthetic tickets. Individual tickets (hand-authored below) can carry a
   different scope than this default when the ticket is about one specific
   instance rather than the aggregate alarm (e.g. a single patient/device). */
const ISSUE_TYPE_SCOPE = {
  "Total Compliance Drop": "Global",
  "Total Usable Compliance Drop": "Global",
  "Organization Compliance Drop": "Organization",
  "Organization Usable Compliance Drop": "Organization",
  "Signed In Not Uploaded": "Global",
  "Missing Smart Merger Results": "Patient",
  "Missing ASR Results": "Patient",
  "Missing ASR Derived Features": "Patient",
  "Missing Track Feature Extraction": "Patient",
  "Sensors Not Uploaded": "Global",
  "Sensor Metrics Below Threshold": "Patient",
  "Stuck In Baseline": "Patient",
  "Stuck In Registered": "Patient",
  "Stuck In Priority": "Patient",
  "Missing Priority Status": "Patient",
  "Paused Too Long": "Patient",
  "Unmonitored Too Long": "Patient",
  "Other / Manual Report": "Patient",
  "Missing Run: Baseline Completed Engine": "Global",
  "Missing Run: Start Date Engine": "Global",
  "Missing Run: Billing Calc": "Global",
  "Missing Run: Insufficient Recalculate": "Global",
  "Missing Run: Is Valid Engine": "Global",
  "Suspicious Clinic Login": "Organization",
};

const TIERS = ["Level 1", "Level 2", "Level 3"];
const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "In Progress", "Escalated", "Resolved"];
const ORIGINS = ["System Generated", "User Created"];
const TICKET_TYPES = ["Patient", "Clinic"];

/* ---------------- Support agents (ticket owners) ---------------- */
const SUPPORT_AGENTS = ["Sarah Cohen", "Daniel Avraham", "Maya Gold", "Tomer Regev", "Liat Peretz"];

/* ---------------- Sample tickets raised by patients ---------------- */
const patientTickets = [
  { id: 0, ticketNo: "TCK-1042", patientId: "120-2001", organization: "120", issueType: "Missing ASR Results", scope: "Patient", tier: "Level 1", severity: "Critical", status: "Open", origin: "User Created", assignedTo: "Sarah Cohen", createdDate: "02/08/2026 09:14", description: "Patient's recordings aren't producing ASR results -- the app freezes a few seconds into every attempt and no audio file is saved." },
  { id: 1, ticketNo: "TCK-1041", patientId: "121-2002", organization: "121", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 2", severity: "High", status: "In Progress", origin: "User Created", assignedTo: "Daniel Avraham", createdDate: "01/08/2026 16:40", description: "Patient signs in and records, but the file never uploads; a spinning icon never resolves on Wi-Fi or cellular." },
  { id: 2, ticketNo: "TCK-1038", patientId: "104-3001", organization: "104", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 3", severity: "Critical", status: "Escalated", origin: "User Created", assignedTo: "Maya Gold", createdDate: "30/07/2026 11:02", description: "Patient's tablet will not power on after the last app update; suspected bricked device, needs replacement unit." },
  { id: 3, ticketNo: "TCK-1035", patientId: "B03-4002", organization: "B03", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", severity: "Low", status: "Resolved", origin: "User Created", assignedTo: "Tomer Regev", createdDate: "28/07/2026 08:55", description: "Notification reminders were appearing in Hebrew instead of the patient's selected language, English." },
  { id: 4, ticketNo: "TCK-1031", patientId: "105-5001", organization: "105", issueType: "Missing ASR Derived Features", scope: "Patient", tier: "Level 2", severity: "Medium", status: "Open", origin: "System Generated", assignedTo: "Liat Peretz", createdDate: "26/07/2026 14:20", description: "Background noise cancellation seems disabled; breath/distortion features are missing from recordings since Tuesday." },
  { id: 5, ticketNo: "TCK-1027", patientId: "122-2001", organization: "122", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 1", severity: "Low", status: "Resolved", origin: "System Generated", assignedTo: "Sarah Cohen", createdDate: "22/07/2026 10:10", description: "Single recording stuck in upload queue for 3 days; cleared after patient reinstalled the app." },
  { id: 6, ticketNo: "TCK-1019", patientId: "B01-6004", organization: "B01", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 2", severity: "High", status: "In Progress", origin: "System Generated", assignedTo: "Daniel Avraham", createdDate: "18/07/2026 13:47", description: "App crashes immediately on launch on patient's older Android device; logs point to a memory issue." },
  { id: 7, ticketNo: "TCK-1012", patientId: "ATP-7002", organization: "ATP", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", severity: "Low", status: "Open", origin: "User Created", assignedTo: "Maya Gold", createdDate: "14/07/2026 09:30", description: "Patient can't find the 'measurements' tab after the latest release; menu appears reordered." },
];

/* ---------------- Sample tickets raised by clinics ---------------- */
const clinicTickets = [
  { id: 0, ticketNo: "TCK-2018", raisedBy: "Rachel Cohen", organization: "120", issueType: "Sensors Not Uploaded", scope: "Organization", tier: "Level 3", severity: "Critical", status: "Escalated", origin: "System Generated", assignedTo: "Tomer Regev", createdDate: "02/08/2026 08:05", description: "Clinic-wide: patient devices provisioned this week are not syncing sensor data with the dashboard at all." },
  { id: 1, ticketNo: "TCK-2015", raisedBy: "David Levi", organization: "121", issueType: "Organization Compliance Drop", scope: "Organization", tier: "Level 2", severity: "Medium", status: "In Progress", origin: "System Generated", assignedTo: "Liat Peretz", createdDate: "31/07/2026 15:18", description: "Compliance chart on the clinic dashboard is showing data one day behind for the whole site." },
  { id: 2, ticketNo: "TCK-2011", raisedBy: "Miriam Katz", organization: "B01", issueType: "Signed In Not Uploaded", scope: "Organization", tier: "Level 1", severity: "Critical", status: "Open", origin: "System Generated", assignedTo: "Sarah Cohen", createdDate: "29/07/2026 12:44", description: "Several patient recordings uploaded overnight are missing from the clinic's session list." },
  { id: 3, ticketNo: "TCK-2006", raisedBy: "Omer Peretz", organization: "104", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", severity: "Low", status: "Resolved", origin: "User Created", assignedTo: "Daniel Avraham", createdDate: "24/07/2026 09:55", description: "Clinic reported one patient's recordings sound sped up; traced to a bad microphone on that device." },
  { id: 4, ticketNo: "TCK-2001", raisedBy: "Noa Ben-David", organization: "105", issueType: "Other / Manual Report", scope: "Organization", tier: "Level 2", severity: "High", status: "Open", origin: "User Created", assignedTo: "Maya Gold", createdDate: "20/07/2026 17:02", description: "Clinic tablet used for onboarding new patients won't connect to the org Wi-Fi after firmware update." },
];

/* ---------------- Bulk synthetic tickets ----------------
   Tops up the hand-authored samples above so filtering this list by status yields
   the same totals the Overview dashboard's System Health footer promises (94
   Escalated / 206 In Progress / 68 Resolved) -- those footer cards deep-link
   straight into this filtered view via support.html?status=<Status>. */
const SUPPORT_ORG_CODES = ["120", "121", "104", "B03", "105", "122", "B01", "ATP"];
const SUPPORT_CLINIC_STAFF = ["Rachel Cohen", "David Levi", "Miriam Katz", "Omer Peretz", "Noa Ben-David", "Yossi Mizrahi", "Tamar Azoulay", "Eitan Shapiro"];
const SUPPORT_ISSUE_DESCRIPTIONS = {
  "Total Compliance Drop": "Active-patient compliance fell more than 60% versus yesterday.",
  "Total Usable Compliance Drop": "Active-patient usable compliance fell more than 50% versus yesterday.",
  "Organization Compliance Drop": "This organization's compliance dropped versus yesterday's baseline.",
  "Organization Usable Compliance Drop": "This organization's usable compliance dropped versus yesterday's baseline.",
  "Signed In Not Uploaded": "Patient signed in but no recording was uploaded.",
  "Missing Smart Merger Results": "Active patient has no smart merger results from yesterday's recordings.",
  "Missing ASR Results": "One or more recordings are missing ASR results.",
  "Missing ASR Derived Features": "Valid ASR recordings are missing breath/transformer/distortion feature data.",
  "Missing Track Feature Extraction": "Active patient is missing feature-extraction output for one or more tracks.",
  "Sensors Not Uploaded": "Patient signed in but sensor data was not uploaded.",
  "Sensor Metrics Below Threshold": "Patient's uploaded sensor metrics are below the expected threshold.",
  "Stuck In Baseline": "Patient has been stuck in the baseline period longer than expected.",
  "Stuck In Registered": "Patient has been stuck in Registered status longer than expected.",
  "Stuck In Priority": "Patient has been stuck in Priority status longer than expected.",
  "Missing Priority Status": "Patient has never been assigned a Priority status.",
  "Paused Too Long": "Patient has been Paused longer than the allowed number of days.",
  "Unmonitored Too Long": "Patient has been Unmonitored longer than the allowed number of days.",
  "Other / Manual Report": "Manually reported issue that doesn't match an automated system alarm.",
  "Missing Run: Baseline Completed Engine": "The Baseline Completed Engine did not run yesterday.",
  "Missing Run: Start Date Engine": "The Start Date Engine did not run yesterday.",
  "Missing Run: Billing Calc": "The Billing Calc job did not run yesterday.",
  "Missing Run: Insufficient Recalculate": "The Insufficient Recalculate job did not run yesterday.",
  "Missing Run: Is Valid Engine": "The Is Valid Engine did not run.",
  "Suspicious Clinic Login": "Clinic user login flagged for unusual location or repeated failed attempts.",
};
const SUPPORT_STATUS_SEVERITIES = {
  Open: ["Low", "Medium", "High", "Critical"],
  Escalated: ["Critical", "Critical", "High", "Medium"],
  "In Progress": ["Medium", "High", "Low", "Critical"],
  Resolved: ["Low", "Medium", "High", "Critical"],
};

function topUpTickets(array, kind, status, count, ticketSeqStart) {
  let nextId = array.length ? Math.max(...array.map((t) => t.id)) + 1 : 0;
  const prefix = kind === "patient" ? "TCK-1" : "TCK-2";
  for (let i = 0; i < count; i++) {
    const n = ticketSeqStart + i;
    const org = SUPPORT_ORG_CODES[n % SUPPORT_ORG_CODES.length];
    const issueType = ISSUE_TYPES[n % ISSUE_TYPES.length];
    const severities = SUPPORT_STATUS_SEVERITIES[status];
    const ticket = {
      id: nextId + i,
      ticketNo: `${prefix}${100 + n}`,
      organization: org,
      issueType,
      scope: ISSUE_TYPE_SCOPE[issueType],
      tier: TIERS[n % TIERS.length],
      severity: severities[n % severities.length],
      origin: n % 3 === 0 ? "System Generated" : "User Created",
      status,
      assignedTo: SUPPORT_AGENTS[n % SUPPORT_AGENTS.length],
      createdDate: `${String(1 + (n % 27)).padStart(2, "0")}/${String(1 + (n % 12)).padStart(2, "0")}/2026 ${String(8 + (n % 11)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")}`,
      description: SUPPORT_ISSUE_DESCRIPTIONS[issueType],
    };
    if (kind === "patient") ticket.patientId = `${org}-${5000 + n}`;
    else ticket.raisedBy = SUPPORT_CLINIC_STAFF[n % SUPPORT_CLINIC_STAFF.length];
    array.push(ticket);
  }
}

topUpTickets(patientTickets, "patient", "Escalated", 55, 0);
topUpTickets(patientTickets, "patient", "In Progress", 122, 55);
topUpTickets(patientTickets, "patient", "Resolved", 39, 177);
/* Open only had a handful of hand-authored tickets, which didn't span every
   tier/category/severity/origin -- combining Status=Open with another
   filter (e.g. Tier 3, or a category besides the couple those tickets
   happened to use) could return zero results. Top it up like every other
   status so every filter combination has something to show. */
topUpTickets(patientTickets, "patient", "Open", 46, 216);

topUpTickets(clinicTickets, "clinic", "Escalated", 37, 0);
topUpTickets(clinicTickets, "clinic", "In Progress", 81, 37);
topUpTickets(clinicTickets, "clinic", "Resolved", 26, 118);
topUpTickets(clinicTickets, "clinic", "Open", 32, 144);

/* ---------------- Alert rules (Rules tab) ---------------- */
const RULE_CHANNELS = ["Notification", "Email", "SMS"];

const alertRules = [
  { id: 0, name: "Missing sensor data", condition: "No sensor data for ≥ 3 consecutive days", severity: "High", tier: "Level 2", slaResponse: "2h", slaResolve: "24h", channels: ["Notification", "Email"], autoCreateTicket: true, appliesTo: "All Commercial orgs" },
  { id: 1, name: "Recording failure", condition: "≥ 3 failed sessions in 24h for one patient", severity: "Medium", tier: "Level 1", slaResponse: "8h", slaResolve: "3d", channels: ["Notification"], autoCreateTicket: false, appliesTo: "All organisations" },
  { id: 2, name: "Compliance drop", condition: "Patient compliance < 60% over 14 days", severity: "High", tier: "Level 1", slaResponse: "2h", slaResolve: "24h", channels: ["Notification", "Email"], autoCreateTicket: true, appliesTo: "All Commercial orgs" },
  { id: 3, name: "Health permission off", condition: "HealthKit / Health Connect permission revoked", severity: "Medium", tier: "Level 1", slaResponse: "8h", slaResolve: "3d", channels: ["Notification"], autoCreateTicket: false, appliesTo: "All organisations" },
  { id: 4, name: "Voice engine degradation", condition: "ASR error rate > 10% over 2h", severity: "Critical", tier: "Level 2", slaResponse: "30m", slaResolve: "4h", channels: ["Notification", "Email", "SMS"], autoCreateTicket: true, appliesTo: "System-wide" },
  { id: 5, name: "Sync failure", condition: "Upload queue stalled > 12h", severity: "High", tier: "Level 2", slaResponse: "2h", slaResolve: "24h", channels: ["Notification", "Email"], autoCreateTicket: true, appliesTo: "System-wide" },
  { id: 6, name: "EHR connection failure", condition: "FHIR / HL7 endpoint unreachable > 30 min", severity: "Critical", tier: "Level 3", slaResponse: "30m", slaResolve: "4h", channels: ["Notification", "Email", "SMS"], autoCreateTicket: true, appliesTo: "Per organisation" },
  { id: 7, name: "System downtime", condition: "Availability below SLO beyond allowed limit", severity: "Critical", tier: "Level 3", slaResponse: "15m", slaResolve: "2h", channels: ["Notification", "Email", "SMS"], autoCreateTicket: true, appliesTo: "System-wide" },
];
