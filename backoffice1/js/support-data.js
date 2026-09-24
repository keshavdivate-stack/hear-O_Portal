/* ---------------- Reference lists ---------------- */
/* Categories + named alarms sourced from the "System Health Check (Alarm -
   Error / Warning)" spec. ISSUE_TYPES covers every named alarm the doc
   defines, grouped by category via ISSUE_TYPE_CATEGORY, plus one manual
   catch-all ("Other / Manual Report") for tickets that don't correspond to
   any automated alarm (hardware failures, UI/translation bugs, etc. -- the
   doc only specifies system-health monitoring, not every possible
   complaint), and "Suspicious Clinic Login" so every category -- including
   Clinic Users (Security) -- has at least one demonstrable ticket (the doc
   lists that area but defines no alarms under it). Per the doc, monitoring
   only applies to commercial and study organizations. */
const CATEGORIES = ["Compliance", "Voice Engine", "Sensors", "Patient (Mobile/Web)", "Clinic Users (Security)", "System Schedule Engine"];
const SCOPES = ["Global", "Organization", "Patient"];

const ISSUE_TYPES = [
  "Total Compliance Drop",
  "Total Recording Quality Drop",
  "Organization Compliance Drop",
  "Organization Recording Quality Drop",
  "Signed In Not Uploaded",
  "Missing Smart Merger Results",
  "Missing ASR Results",
  "Missing ASR Derived Features",
  "Missing Track Feature Extraction",
  "Sensors Not Uploaded",
  "Sensor Metrics Below Threshold",
  "Measurements Not Entered",
  "Medication Not Logged",
  "Clinical Questions Not Answered",
  "Language Changed In App",
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
  "Total Recording Quality Drop": "Compliance",
  "Organization Compliance Drop": "Compliance",
  "Organization Recording Quality Drop": "Compliance",
  "Signed In Not Uploaded": "Compliance",
  "Missing Smart Merger Results": "Voice Engine",
  "Missing ASR Results": "Voice Engine",
  "Missing ASR Derived Features": "Voice Engine",
  "Missing Track Feature Extraction": "Voice Engine",
  "Sensors Not Uploaded": "Sensors",
  "Sensor Metrics Below Threshold": "Sensors",
  "Measurements Not Entered": "Sensors",
  "Medication Not Logged": "Patient (Mobile/Web)",
  "Clinical Questions Not Answered": "Patient (Mobile/Web)",
  "Language Changed In App": "Patient (Mobile/Web)",
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
  "Total Recording Quality Drop": "Global",
  "Organization Compliance Drop": "Organization",
  "Organization Recording Quality Drop": "Organization",
  "Signed In Not Uploaded": "Global",
  "Missing Smart Merger Results": "Patient",
  "Missing ASR Results": "Patient",
  "Missing ASR Derived Features": "Patient",
  "Missing Track Feature Extraction": "Patient",
  "Sensors Not Uploaded": "Global",
  "Sensor Metrics Below Threshold": "Patient",
  "Measurements Not Entered": "Patient",
  "Medication Not Logged": "Patient",
  "Clinical Questions Not Answered": "Patient",
  "Language Changed In App": "Patient",
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
const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["Open", "In Progress", "Resolved"];
const ORIGINS = ["System", "Patient", "Clinic", "Backoffice"];
const TICKET_TYPES = ["Patient", "Clinic"];

/* ---------------- Support agents (ticket owners) ---------------- */
const SUPPORT_AGENTS = ["Sarah Cohen", "Daniel Avraham", "Maya Gold", "Tomer Regev", "Liat Peretz"];

/* Who a ticket can be transferred to, grouped by the tier it's being routed
   to -- so picking a tier narrows the assignee list to that tier's team. */
const TIER_AGENTS = {
  "Level 1": ["Sarah Cohen", "Daniel Avraham"],
  "Level 2": ["Maya Gold", "Tomer Regev"],
  "Level 3": ["Liat Peretz"],
};

/* Reverse lookup from agent name to the level they were defined under above
   (used to filter agents by level). */
const AGENT_LEVEL = {};
Object.entries(TIER_AGENTS).forEach(([level, names]) => names.forEach((name) => { AGENT_LEVEL[name] = level; }));

/* ---------------- Sample tickets raised by patients ---------------- */
const patientTickets = [
  { id: 0, ticketNo: "TCK-1042", patientId: "120-2001", organization: "120", issueType: "Missing ASR Results", scope: "Patient", tier: "Level 1", priority: "Critical", status: "Open", origin: "Patient", assignedTo: "Sarah Cohen", createdDate: "02/08/2026 09:14", description: "Patient's recordings aren't producing ASR results -- the app freezes a few seconds into every attempt and no audio file is saved." },
  { id: 1, ticketNo: "TCK-1041", patientId: "121-2002", organization: "121", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 2", priority: "High", status: "In Progress", origin: "Patient", assignedTo: "Daniel Avraham", createdDate: "01/08/2026 16:40", description: "Patient signs in and records, but the file never uploads; a spinning icon never resolves on Wi-Fi or cellular." },
  { id: 2, ticketNo: "TCK-1038", patientId: "104-3001", organization: "104", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 3", priority: "Critical", status: "In Progress", origin: "Patient", assignedTo: "Maya Gold", createdDate: "30/07/2026 11:02", description: "Patient's tablet will not power on after the last app update; suspected bricked device, needs replacement unit." },
  { id: 3, ticketNo: "TCK-1035", patientId: "B03-4002", organization: "B03", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "Patient", assignedTo: "Tomer Regev", createdDate: "28/07/2026 08:55", description: "Notification reminders were appearing in Hebrew instead of the patient's selected language, English." },
  { id: 4, ticketNo: "TCK-1031", patientId: "105-5001", organization: "105", issueType: "Missing ASR Derived Features", scope: "Patient", tier: "Level 2", priority: "Medium", status: "Open", origin: "System", assignedTo: "Liat Peretz", createdDate: "26/07/2026 14:20", description: "Background noise cancellation seems disabled; breath/distortion features are missing from recordings since Tuesday." },
  { id: 5, ticketNo: "TCK-1027", patientId: "122-2001", organization: "122", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "System", assignedTo: "Sarah Cohen", createdDate: "22/07/2026 10:10", description: "Single recording stuck in upload queue for 3 days; cleared after patient reinstalled the app." },
  { id: 6, ticketNo: "TCK-1019", patientId: "B01-6004", organization: "B01", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 2", priority: "High", status: "In Progress", origin: "System", assignedTo: "Daniel Avraham", createdDate: "18/07/2026 13:47", description: "App crashes immediately on launch on patient's older Android device; logs point to a memory issue." },
  { id: 7, ticketNo: "TCK-1012", patientId: "ATP-7002", organization: "ATP", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", priority: "Low", status: "Open", origin: "Patient", assignedTo: "Maya Gold", createdDate: "14/07/2026 09:30", description: "Patient can't find the 'measurements' tab after the latest release; menu appears reordered." },
  { id: 8, ticketNo: "TCK-1050", patientId: "121-2010", organization: "121", issueType: "Missing ASR Results", scope: "Patient", tier: "Level 1", priority: "Critical", status: "Open", origin: "Patient", assignedTo: "Sarah Cohen", createdDate: "28/12/2026 09:15", description: "Patient's latest recording uploaded but never produced ASR results; the voice engine pipeline appears stuck." },
];

/* ---------------- Sample tickets raised by clinics ---------------- */
const clinicTickets = [
  { id: 0, ticketNo: "TCK-2018", raisedBy: "Rachel Cohen", organization: "120", issueType: "Sensors Not Uploaded", scope: "Organization", tier: "Level 3", priority: "Critical", status: "In Progress", origin: "System", assignedTo: "Tomer Regev", createdDate: "02/08/2026 08:05", description: "Clinic-wide: patient devices provisioned this week are not syncing sensor data with the dashboard at all." },
  { id: 1, ticketNo: "TCK-2015", raisedBy: "David Levi", organization: "121", issueType: "Organization Compliance Drop", scope: "Organization", tier: "Level 2", priority: "Medium", status: "In Progress", origin: "System", assignedTo: "Liat Peretz", createdDate: "31/07/2026 15:18", description: "Compliance chart on the clinic dashboard is showing data one day behind for the whole site." },
  { id: 2, ticketNo: "TCK-2011", raisedBy: "Miriam Katz", organization: "B01", issueType: "Signed In Not Uploaded", scope: "Organization", tier: "Level 1", priority: "Critical", status: "Open", origin: "System", assignedTo: "Sarah Cohen", createdDate: "29/07/2026 12:44", description: "Several patient recordings uploaded overnight are missing from the clinic's session list." },
  { id: 3, ticketNo: "TCK-2006", raisedBy: "Omer Peretz", organization: "104", issueType: "Other / Manual Report", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "Clinic", assignedTo: "Daniel Avraham", createdDate: "24/07/2026 09:55", description: "Clinic reported one patient's recordings sound sped up; traced to a bad microphone on that device." },
  { id: 4, ticketNo: "TCK-2001", raisedBy: "Noa Ben-David", organization: "105", issueType: "Other / Manual Report", scope: "Organization", tier: "Level 2", priority: "High", status: "Open", origin: "Clinic", assignedTo: "Maya Gold", createdDate: "20/07/2026 17:02", description: "Clinic tablet used for onboarding new patients won't connect to the org Wi-Fi after firmware update." },
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
  "Total Recording Quality Drop": "Active-patient recording quality fell more than 50% versus yesterday.",
  "Organization Compliance Drop": "This organization's compliance dropped versus yesterday's baseline.",
  "Organization Recording Quality Drop": "This organization's recording quality dropped versus yesterday's baseline.",
  "Signed In Not Uploaded": "Patient signed in but no recording was uploaded.",
  "Missing Smart Merger Results": "Active patient has no smart merger results from yesterday's recordings.",
  "Missing ASR Results": "One or more recordings are missing ASR results.",
  "Missing ASR Derived Features": "Valid ASR recordings are missing breath/transformer/distortion feature data.",
  "Missing Track Feature Extraction": "Active patient is missing feature-extraction output for one or more tracks.",
  "Sensors Not Uploaded": "Patient signed in but sensor data was not uploaded.",
  "Sensor Metrics Below Threshold": "Patient's uploaded sensor metrics are below the expected threshold.",
  "Measurements Not Entered": "Patient has not entered measurements in more than the allowed number of days.",
  "Medication Not Logged": "Patient has not logged medication taken in more than the allowed number of days.",
  "Clinical Questions Not Answered": "Patient has not answered clinical questions in the app.",
  "Language Changed In App": "Patient changed their language setting in the app.",
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
const SUPPORT_STATUS_PRIORITIES = {
  Open: ["Low", "Medium", "High", "Critical"],
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
    const priorities = SUPPORT_STATUS_PRIORITIES[status];
    const ticket = {
      id: nextId + i,
      ticketNo: `${prefix}${100 + n}`,
      organization: org,
      issueType,
      scope: ISSUE_TYPE_SCOPE[issueType],
      tier: TIERS[n % TIERS.length],
      priority: priorities[n % priorities.length],
      origin: n % 5 === 0 ? "System" : n % 5 === 1 ? "Backoffice" : kind === "patient" ? "Patient" : "Clinic",
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

topUpTickets(patientTickets, "patient", "In Progress", 55, 0);
topUpTickets(patientTickets, "patient", "In Progress", 122, 55);
topUpTickets(patientTickets, "patient", "Resolved", 39, 177);
/* Open only had a handful of hand-authored tickets, which didn't span every
   tier/category/priority/origin -- combining Status=Open with another
   filter (e.g. Tier 3, or a category besides the couple those tickets
   happened to use) could return zero results. Top it up like every other
   status so every filter combination has something to show. */
topUpTickets(patientTickets, "patient", "Open", 46, 216);

topUpTickets(clinicTickets, "clinic", "In Progress", 37, 0);
topUpTickets(clinicTickets, "clinic", "In Progress", 81, 37);
topUpTickets(clinicTickets, "clinic", "Resolved", 26, 118);
topUpTickets(clinicTickets, "clinic", "Open", 32, 144);

/* ---------------- Alert rules (Rules tab) ---------------- */
const RULE_CHANNELS = ["Notification", "Email", "SMS"];

/* One rule per system-health alarm, matching the developed Rules list:
   no SLA set yet ("—"), In App channel only, applies to all organisations. */
const alertRules = [
  ["Total compliance below 60%", "Compliance", "Total compliance across active patients below 60%", "High", "Level 2"],
  ["Total usable compliance below 60%", "Compliance", "Total usable compliance across active patients below 60%", "High", "Level 2"],
  ["Organization compliance below 60%", "Compliance", "Total compliance for an organization below 60%", "High", "Level 2"],
  ["Organization usable compliance below 60%", "Compliance", "Total usable compliance for an organization below 60%", "High", "Level 2"],
  ["Signed in but not uploaded above 5%", "Compliance", "More than 5% of patients signed in yesterday but did not upload a recording", "Medium", "Level 1"],
  ["Smart merger mismatch", "Voice Engine", "Active patients without smart merger results", "High", "Level 2"],
  ["ASR results missing", "Voice Engine", "Not all recordings have ASR results", "High", "Level 2"],
  ["Algo results missing", "Voice Engine", "Valid ASR recordings missing breath, transcription or feature results", "High", "Level 2"],
  ["Track results missing", "Voice Engine", "Active patients missing track extractor, graph or feature results", "High", "Level 2"],
  ["Sensors not uploaded", "Sensors", "Patients signed in but uploaded no sensor data", "Medium", "Level 1"],
  ["Sensor metrics below threshold", "Sensors", "Patient sensor metrics below the configured threshold", "Medium", "Level 1"],
  ["Measurements not entered", "Sensors", "Active patients with no measurements entered for 3 days", "Medium", "Level 1"],
  ["Medication not logged", "Patient (Mobile/Web)", "Active patients with no medication logged for 3 days", "Medium", "Level 1"],
  ["Clinical questions not answered", "Patient (Mobile/Web)", "Active patients who did not answer clinical questions for 3 days", "Medium", "Level 1"],
  ["Language changed in app", "Patient (Mobile/Web)", "Patient changed the app language", "Low", "Level 1"],
  ["Stuck in baseline", "Patient (Mobile/Web)", "Patients in Baseline status longer than expected", "Medium", "Level 1"],
  ["Stuck in registered", "Patient (Mobile/Web)", "Patients in Registered status longer than expected", "Medium", "Level 1"],
  ["Stuck in priority", "Patient (Mobile/Web)", "Patients in Priority status longer than expected", "Medium", "Level 1"],
  ["Missing priority status", "Patient (Mobile/Web)", "Active patients without a priority status", "Medium", "Level 1"],
  ["Paused too long", "Patient (Mobile/Web)", "Patients paused longer than the allowed period", "Medium", "Level 1"],
  ["Unmonitored too long", "Patient (Mobile/Web)", "Patients unmonitored longer than the allowed period", "Medium", "Level 1"],
  ["Missing run: Baseline Completed Engine", "System Schedule Engine", "Baseline Completed Engine did not run in the last 24 hours", "High", "Level 2"],
  ["Missing run: Start Date Engine", "System Schedule Engine", "Start Date Engine did not run in the last 24 hours", "High", "Level 2"],
  ["Missing run: Billing Calc", "System Schedule Engine", "Billing Calc did not run in the last 24 hours", "High", "Level 2"],
  ["Missing run: Insufficient Recalculate", "System Schedule Engine", "Insufficient Recalculate did not run in the last 24 hours", "High", "Level 2"],
  ["Missing run: Is Valid Engine", "System Schedule Engine", "Is Valid Engine did not run in the last 24 hours", "High", "Level 2"],
].map(([name, category, condition, priority, tier], id) => ({
  id, name, category, condition, priority, tier,
  slaResponse: "", slaResolve: "",
  channels: ["Notification"],
  operator: "None",
  autoCreateTicket: true,
  appliesTo: "All organisations",
}));
