/* ---------------- Reference lists ---------------- */
/* Categories and issue types match the developed Support module's filter
   values exactly (Support > Incidents / Tickets: Category -> Issue Type).
   Every category ends in its own "Other" issue type, so an issue type alone
   doesn't always identify its category -- tickets carry their category. */
const CATEGORIES = ["Compliance", "Voice Engine", "Sensors", "Patient", "Clinic Users", "System Schedule Engine", "Mobile App"];
const SCOPES = ["Global", "Organization", "Patient"];

const ISSUE_TYPES_BY_CATEGORY = {
  "Compliance": ["Total Compliance Drop", "Total Usable Compliance Drop", "Org Compliance Drop", "Org Usable Compliance Drop", "Signed In Not Uploaded", "Other"],
  "Voice Engine": ["Smart Merger Mismatch", "ASR Results Missing", "Algo Results Missing", "Track Results Missing", "Other"],
  "Sensors": ["Sensors Not Uploaded", "Sensors Partial Upload", "Measurements Not Entered", "Other"],
  "Patient": ["Medication Not Entered", "Clinical Questions Unanswered", "App Language Changed", "Stuck In Baseline", "Stuck In Registered", "Stuck In Priority", "No Priority Set", "Paused Too Long", "Unmonitored Too Long", "Other"],
  "Clinic Users": ["Other"],
  "System Schedule Engine": ["Engine Baseline Completed Missed", "Engine Start Date Missed", "Engine Billing Calc Missed", "Engine Insufficient Recalc Missed", "Engine Is Valid Missed", "Other"],
  "Mobile App": [
    "App Stuck On Splash", "Splash Screen Reappears", "App Closed Unexpectedly", "App Frozen / Unresponsive", "No Internet Error While Online", "Unexpected Logout",
    "Text Not In Selected Language", "RTL Layout Incorrect", "App Update Popup Not Closing", "App Update Popup Incorrect", "App Update Link Not Working",
    "Consent Document Not Loading", "Consent Agree Not Working", "Consent Screen Repeats", "Language Selection Not Applied", "Language List Not Opening",
    "ID Number Not Accepted", "DOB Not Accepted", "Login Continue Disabled", "Login Details Not Recognized", "OTP Not Received", "OTP Resend Not Working",
    "OTP Keypad Not Showing", "OTP Wrong Code Error", "OTP Code Expired", "OTP Verify No Response", "Account Locked Out", "Biometric Prompt Not Showing",
    "Biometric Verification Failed", "Biometric Permission Denied", "Face ID Option Not Available", "Identity Check No Internet", "Identity Reverify Rejected",
    "Identity Check Repeated", "Home Screen Not Loading", "Start Session Not Working", "Start Session Button Missing", "Phone Call Blocks Recording",
    "Low Storage Blocks Recording", "Microphone Issue Screen Shown", "Chat Badge Incorrect", "Home Tutorial Stuck", "Home Popup Repeating",
    "Popup Start Session Not Working", "Popup Text Display Issue", "Message From Clinic Not Opening Chat", "Onboarding Repeats", "Practice Recording Not Starting",
    "Practice Screen Stuck", "Practice Result Incorrect", "Recording Sentence Not Shown", "Recording Not Starting", "Record Button Hold Popup",
    "Recording Stopped Automatically", "Recording Interrupted", "Recording Processing Stuck", "Recording Try Again Repeated", "Recording Try Again Skips Sentence",
    "Headphones Cause Recording Error", "Prompt Audio Not Playing", "Session Ended Unexpectedly", "Session No Exit Option", "Question Not Displaying",
    "Question Next Button Missing", "Question Value Cannot Be Entered", "Question Answer Option Missing", "Recording Upload Stuck", "Recording Saved Not Uploaded",
    "Recordings Not Uploaded Multiple Days", "Recording History Not Displaying", "Recording History Recorded Day Shown Missed", "Recording History Upload Status Wrong",
    "Recording History Previous Week Not Loading", "Recording History Day Tap Not Working", "Recording History Time Not Shown", "Recording History Low Quality Message Stuck",
    "Recording History Record Again Not Working", "Measurements Screen Not Opening", "Measurement Not Displaying", "Measurement Reading Missing",
    "Measurement Week Navigation Not Working", "Measurement Value Details Not Showing", "Measurement Unit Toggle Issue", "Add Measurement Not Opening",
    "Measurement Submit Failed", "Measurement Saved Twice", "Measurement Value Rejected", "Measurement Save Button Disabled", "Blood Pressure Entry Issue",
    "Measurement Saved Wrong Unit", "Measurement Not Updated After Save", "Check-in Not Starting", "Check-in Cannot Proceed", "Check-in Review Values Incorrect",
    "Check-in Submit Failed", "Check-in Progress Lost", "Check-in Status Incorrect", "Health Permission Popup Incorrect", "Health Popup Not Closing",
    "Health Settings Link Incorrect", "Health Access Cannot Be Enabled", "Health Data Not Syncing", "Chat Screen Not Opening", "Chat Not Loading",
    "Chat Older Messages Not Loading", "Chat New Message Not Showing", "Chat Message Send Failed", "Chat Reply Not Available", "Chat Media Request Not Opening",
    "Camera Not Opening", "Video Recorded Without Sound", "Video Recording Lost", "Chat Media Save Failed", "Chat Media Upload Failed", "Chat Media Not Displaying",
    "Chat Media Not Opening", "Enable Chat Failed", "Chat Consent Screen Repeats", "Push Notification Not Received", "Notification Tap Not Opening Chat",
    "Notification Tap Wrong Screen", "Notification Text Incorrect", "App Icon Badge Incorrect", "Notifications Cleared Unexpectedly", "Reminder Settings Not Displaying",
    "Reminder Not Received", "Reminder Stopped After Few Days", "Reminder Received Multiple Times", "Reminder Missing After Unfinished Session", "Reminder Setting Reverted",
    "Reminder Time Not Accepted", "Reminder Time Screen Closes App", "Profile Not Loading", "Profile Details Incorrect", "Edit Profile Not Opening", "Profile Save Failed",
    "Profile Validation Error", "Profile Phone Saved Incorrectly", "Profile DOB Saved Incorrectly", "Menu Option Not Responding", "Contact Us Option Missing",
    "Voice Playback Setting Disabled", "Contact Support Not Working", "About Info Incorrect", "Help Document Not Opening", "Help Document Blank",
    "Training Video Not Playing", "Medication List Not Displaying", "Medication Taken Not Saved", "Medication Taken Cannot Undo",
    "Medication History Month Navigation Not Working", "Microphone Permission Blocked", "Microphone Permission Prompt Repeated", "Camera Permission Blocked",
    "Notification Permission Blocked", "Other",
  ],
};

/* Every distinct issue type name (the New Ticket drawer's Issue Type list). */
const ISSUE_TYPES = Array.from(new Set(Object.values(ISSUE_TYPES_BY_CATEGORY).flat()));

/* Issue type -> category, for names that belong to exactly one category
   ("Other" exists in every category, so it has no entry here). */
const ISSUE_TYPE_CATEGORY = {};
Object.entries(ISSUE_TYPES_BY_CATEGORY).forEach(([category, types]) => types.forEach((type) => {
  ISSUE_TYPE_CATEGORY[type] = type in ISSUE_TYPE_CATEGORY ? undefined : category;
}));
Object.keys(ISSUE_TYPE_CATEGORY).forEach((type) => { if (!ISSUE_TYPE_CATEGORY[type]) delete ISSUE_TYPE_CATEGORY[type]; });

/* The issue types the seeded tickets below are spread across, with each
   one's default scope and description. A ticket can carry a different scope
   than this default when it's about one specific instance rather than the
   aggregate alarm (e.g. a single patient/device). */
const TICKET_ISSUE_SEEDS = [
  ["Compliance", "Total Compliance Drop", "Global", "Active-patient compliance fell more than 60% versus yesterday."],
  ["Compliance", "Total Usable Compliance Drop", "Global", "Active-patient usable compliance fell more than 50% versus yesterday."],
  ["Compliance", "Org Compliance Drop", "Organization", "This organization's compliance dropped versus yesterday's baseline."],
  ["Compliance", "Org Usable Compliance Drop", "Organization", "This organization's usable compliance dropped versus yesterday's baseline."],
  ["Compliance", "Signed In Not Uploaded", "Global", "Patient signed in but no recording was uploaded."],
  ["Voice Engine", "Smart Merger Mismatch", "Patient", "Active patient has no smart merger results from yesterday's recordings."],
  ["Voice Engine", "ASR Results Missing", "Patient", "One or more recordings are missing ASR results."],
  ["Voice Engine", "Algo Results Missing", "Patient", "Valid ASR recordings are missing breath/transformer/distortion feature data."],
  ["Voice Engine", "Track Results Missing", "Patient", "Active patient is missing feature-extraction output for one or more tracks."],
  ["Sensors", "Sensors Not Uploaded", "Global", "Patient signed in but sensor data was not uploaded."],
  ["Sensors", "Sensors Partial Upload", "Patient", "Only part of the patient's sensor data was uploaded."],
  ["Sensors", "Measurements Not Entered", "Patient", "Patient has not entered measurements in more than the allowed number of days."],
  ["Patient", "Medication Not Entered", "Patient", "Patient has not logged medication taken in more than the allowed number of days."],
  ["Patient", "Clinical Questions Unanswered", "Patient", "Patient has not answered clinical questions in the app."],
  ["Patient", "App Language Changed", "Patient", "Patient changed their language setting in the app."],
  ["Patient", "Stuck In Baseline", "Patient", "Patient has been stuck in the baseline period longer than expected."],
  ["Patient", "Stuck In Registered", "Patient", "Patient has been stuck in Registered status longer than expected."],
  ["Patient", "Stuck In Priority", "Patient", "Patient has been stuck in Priority status longer than expected."],
  ["Patient", "No Priority Set", "Patient", "Patient has never been assigned a Priority status."],
  ["Patient", "Paused Too Long", "Patient", "Patient has been Paused longer than the allowed number of days."],
  ["Patient", "Unmonitored Too Long", "Patient", "Patient has been Unmonitored longer than the allowed number of days."],
  ["Mobile App", "Recording Upload Stuck", "Patient", "Patient's recording is stuck uploading in the mobile app."],
  ["System Schedule Engine", "Engine Baseline Completed Missed", "Global", "The Baseline Completed Engine did not run yesterday."],
  ["System Schedule Engine", "Engine Start Date Missed", "Global", "The Start Date Engine did not run yesterday."],
  ["System Schedule Engine", "Engine Billing Calc Missed", "Global", "The Billing Calc job did not run yesterday."],
  ["System Schedule Engine", "Engine Insufficient Recalc Missed", "Global", "The Insufficient Recalculate job did not run yesterday."],
  ["System Schedule Engine", "Engine Is Valid Missed", "Global", "The Is Valid Engine did not run."],
  ["Clinic Users", "Other", "Organization", "Clinic user login flagged for unusual location or repeated failed attempts."],
].map(([category, issueType, scope, description]) => ({ category, issueType, scope, description }));

/* Default scope per issue type (New Ticket drawer); "Patient" otherwise. */
const ISSUE_TYPE_SCOPE = {};
TICKET_ISSUE_SEEDS.forEach((s) => { if (ISSUE_TYPE_CATEGORY[s.issueType]) ISSUE_TYPE_SCOPE[s.issueType] = s.scope; });

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
  { id: 0, ticketNo: "TCK-1042", patientId: "120-2001", organization: "120", issueType: "ASR Results Missing", scope: "Patient", tier: "Level 1", priority: "Critical", status: "Open", origin: "Patient", assignedTo: "Sarah Cohen", createdDate: "02/08/2026 09:14", description: "Patient's recordings aren't producing ASR results -- the app freezes a few seconds into every attempt and no audio file is saved." },
  { id: 1, ticketNo: "TCK-1041", patientId: "121-2002", organization: "121", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 2", priority: "High", status: "In Progress", origin: "Patient", assignedTo: "Daniel Avraham", createdDate: "01/08/2026 16:40", description: "Patient signs in and records, but the file never uploads; a spinning icon never resolves on Wi-Fi or cellular." },
  { id: 2, ticketNo: "TCK-1038", patientId: "104-3001", organization: "104", category: "Mobile App", issueType: "Other", scope: "Patient", tier: "Level 3", priority: "Critical", status: "In Progress", origin: "Patient", assignedTo: "Maya Gold", createdDate: "30/07/2026 11:02", description: "Patient's tablet will not power on after the last app update; suspected bricked device, needs replacement unit." },
  { id: 3, ticketNo: "TCK-1035", patientId: "B03-4002", organization: "B03", issueType: "Text Not In Selected Language", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "Patient", assignedTo: "Tomer Regev", createdDate: "28/07/2026 08:55", description: "Notification reminders were appearing in Hebrew instead of the patient's selected language, English." },
  { id: 4, ticketNo: "TCK-1031", patientId: "105-5001", organization: "105", issueType: "Algo Results Missing", scope: "Patient", tier: "Level 2", priority: "Medium", status: "Open", origin: "System", assignedTo: "Liat Peretz", createdDate: "26/07/2026 14:20", description: "Background noise cancellation seems disabled; breath/distortion features are missing from recordings since Tuesday." },
  { id: 5, ticketNo: "TCK-1027", patientId: "122-2001", organization: "122", issueType: "Signed In Not Uploaded", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "System", assignedTo: "Sarah Cohen", createdDate: "22/07/2026 10:10", description: "Single recording stuck in upload queue for 3 days; cleared after patient reinstalled the app." },
  { id: 6, ticketNo: "TCK-1019", patientId: "B01-6004", organization: "B01", issueType: "App Closed Unexpectedly", scope: "Patient", tier: "Level 2", priority: "High", status: "In Progress", origin: "System", assignedTo: "Daniel Avraham", createdDate: "18/07/2026 13:47", description: "App crashes immediately on launch on patient's older Android device; logs point to a memory issue." },
  { id: 7, ticketNo: "TCK-1012", patientId: "ATP-7002", organization: "ATP", issueType: "Measurements Screen Not Opening", scope: "Patient", tier: "Level 1", priority: "Low", status: "Open", origin: "Patient", assignedTo: "Maya Gold", createdDate: "14/07/2026 09:30", description: "Patient can't find the 'measurements' tab after the latest release; menu appears reordered." },
  { id: 8, ticketNo: "TCK-1050", patientId: "121-2010", organization: "121", issueType: "ASR Results Missing", scope: "Patient", tier: "Level 1", priority: "Critical", status: "Open", origin: "Patient", assignedTo: "Sarah Cohen", createdDate: "28/12/2026 09:15", description: "Patient's latest recording uploaded but never produced ASR results; the voice engine pipeline appears stuck." },
];

/* Cordio system (backend) and Clinic Portal (web app) versions -- shown on
   the ticket header only for clinic-raised tickets, since that's the
   software the clinic user was actually running when they raised it
   (patient tickets show App/Device info from the mobile app instead). */
const CORDIO_SYSTEM_VERSIONS = ["3.1.5", "3.2.0", "3.2.7", "3.3.0", "3.4.1"];
const CLINIC_PORTAL_VERSIONS = ["2.4.0", "2.5.1", "2.6.0", "2.6.3", "2.7.0"];

/* ---------------- Sample tickets raised by clinics ---------------- */
const clinicTickets = [
  { id: 0, ticketNo: "TCK-2018", raisedBy: "Rachel Cohen", organization: "120", issueType: "Sensors Not Uploaded", scope: "Organization", tier: "Level 3", priority: "Critical", status: "In Progress", origin: "System", assignedTo: "Tomer Regev", createdDate: "02/08/2026 08:05", description: "Clinic-wide: patient devices provisioned this week are not syncing sensor data with the dashboard at all.", cordioVersion: "3.3.0", portalVersion: "2.6.3" },
  { id: 1, ticketNo: "TCK-2015", raisedBy: "David Levi", organization: "121", issueType: "Org Compliance Drop", scope: "Organization", tier: "Level 2", priority: "Medium", status: "In Progress", origin: "System", assignedTo: "Liat Peretz", createdDate: "31/07/2026 15:18", description: "Compliance chart on the clinic dashboard is showing data one day behind for the whole site.", cordioVersion: "3.2.7", portalVersion: "2.6.0" },
  { id: 2, ticketNo: "TCK-2011", raisedBy: "Miriam Katz", organization: "B01", issueType: "Signed In Not Uploaded", scope: "Organization", tier: "Level 1", priority: "Critical", status: "Open", origin: "System", assignedTo: "Sarah Cohen", createdDate: "29/07/2026 12:44", description: "Several patient recordings uploaded overnight are missing from the clinic's session list.", cordioVersion: "3.4.1", portalVersion: "2.7.0" },
  { id: 3, ticketNo: "TCK-2006", raisedBy: "Omer Peretz", organization: "104", category: "Mobile App", issueType: "Microphone Issue Screen Shown", scope: "Patient", tier: "Level 1", priority: "Low", status: "Resolved", origin: "Clinic", assignedTo: "Daniel Avraham", createdDate: "24/07/2026 09:55", description: "Clinic reported one patient's recordings sound sped up; traced to a bad microphone on that device.", cordioVersion: "3.2.0", portalVersion: "2.5.1" },
  { id: 4, ticketNo: "TCK-2001", raisedBy: "Noa Ben-David", organization: "105", category: "Clinic Users", issueType: "Other", scope: "Organization", tier: "Level 2", priority: "High", status: "Open", origin: "Clinic", assignedTo: "Maya Gold", createdDate: "20/07/2026 17:02", description: "Clinic tablet used for onboarding new patients won't connect to the org Wi-Fi after firmware update.", cordioVersion: "3.1.5", portalVersion: "2.4.0" },
];

/* ---------------- Bulk synthetic tickets ----------------
   Tops up the hand-authored samples above so filtering this list by status yields
   the same totals the Overview dashboard's System Health footer promises (94
   Escalated / 206 In Progress / 68 Resolved) -- those footer cards deep-link
   straight into this filtered view via support.html?status=<Status>. */
const SUPPORT_ORG_CODES = ["120", "121", "104", "B03", "105", "122", "B01", "ATP"];
const SUPPORT_CLINIC_STAFF = ["Rachel Cohen", "David Levi", "Miriam Katz", "Omer Peretz", "Noa Ben-David", "Yossi Mizrahi", "Tamar Azoulay", "Eitan Shapiro"];
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
    const seed = TICKET_ISSUE_SEEDS[n % TICKET_ISSUE_SEEDS.length];
    const priorities = SUPPORT_STATUS_PRIORITIES[status];
    const ticket = {
      id: nextId + i,
      ticketNo: `${prefix}${100 + n}`,
      organization: org,
      category: seed.category,
      issueType: seed.issueType,
      scope: seed.scope,
      tier: TIERS[n % TIERS.length],
      priority: priorities[n % priorities.length],
      /* Picked from a different part of n than assignedTo (n % 5), so each
         agent gets a mix of origins instead of always the same one. */
      origin: Math.floor(n / 5) % 5 === 0 ? "System" : Math.floor(n / 5) % 5 === 1 ? "Backoffice" : kind === "patient" ? "Patient" : "Clinic",
      status,
      assignedTo: SUPPORT_AGENTS[n % SUPPORT_AGENTS.length],
      createdDate: `${String(1 + (n % 27)).padStart(2, "0")}/${String(1 + (n % 12)).padStart(2, "0")}/2026 ${String(8 + (n % 11)).padStart(2, "0")}:${String((n * 7) % 60).padStart(2, "0")}`,
      description: seed.description,
    };
    if (kind === "patient") {
      ticket.patientId = `${org}-${5000 + n}`;
    } else {
      ticket.raisedBy = SUPPORT_CLINIC_STAFF[n % SUPPORT_CLINIC_STAFF.length];
      ticket.cordioVersion = CORDIO_SYSTEM_VERSIONS[n % CORDIO_SYSTEM_VERSIONS.length];
      ticket.portalVersion = CLINIC_PORTAL_VERSIONS[n % CLINIC_PORTAL_VERSIONS.length];
    }
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

/* The developed Rules list: one rule per system-health alarm (25), with
   the developed names, conditions, priority, routed level and "applies to".
   No SLA set yet ("—"), In App channel only. */
const alertRules = [
  ["Total compliance", "Compliance", "Total compliance across active patients below 60% since yesterday", "Medium", "Level 1", "All Commercial orgs"],
  ["Total usable compliance", "Compliance", "Total usable compliance across active patients below 50% since yesterday", "High", "Level 2"],
  ["Organization compliance", "Compliance", "Total compliance for an organization below 60% since yesterday", "High", "Level 2"],
  ["Organization usable compliance", "Compliance", "Total usable compliance for an organization below 50% since yesterday", "High", "Level 2"],
  ["Signed in but not uploaded", "Compliance", "More than 5% of patients signed in yesterday but uploaded nothing", "Medium", "Level 1"],
  ["Smart merger mismatch", "Voice Engine", "Active patients without smart merger results, more than 1 since yesterday", "High", "Level 2"],
  ["ASR results missing", "Voice Engine", "Not all recordings have ASR results", "High", "Level 2"],
  ["Algo results missing", "Voice Engine", "Valid ASR recordings missing breath, transformer or distortion results", "High", "Level 2"],
  ["Track results missing", "Voice Engine", "Active patients missing track extractor, graph, detector or post-processor", "High", "Level 2"],
  ["Sensors not uploaded", "Sensors", "Patients signed in but uploaded no sensor data", "Medium", "Level 1"],
  ["Sensors partially uploaded", "Sensors", "Patient uploaded some metrics but below threshold, or none for Y days", "Medium", "Level 1"],
  ["Measurements not entered", "Sensors", "Patient entered no measurements for more than X days", "Medium", "Level 1"],
  ["Medication not entered", "Patient", "Patient recorded no medication taken for more than X days", "Medium", "Level 1"],
  ["App language changed", "Patient", "Patient changed the app language", "Medium", "Level 1"],
  ["Stuck in baseline", "Patient", "Patient stuck in the baseline period", "Medium", "Level 1"],
  ["Stuck in registered", "Patient", "Patient stuck in registered", "Medium", "Level 1"],
  ["Stuck in priority", "Patient", "Patient stuck in priority", "Medium", "Level 1"],
  ["No priority set", "Patient", "Patient has no priority set at all", "Medium", "Level 1"],
  ["Paused too long", "Patient", "Patient paused for more than X days", "Medium", "Level 1"],
  ["Unmonitored too long", "Patient", "Patient unmonitored for more than X days", "Medium", "Level 1"],
  ["Baseline Completed Engine missed", "System Schedule Engine", "Baseline Completed Engine did not run yesterday", "High", "Level 2"],
  ["Start Date Engine missed", "System Schedule Engine", "Start Date Engine did not run yesterday", "High", "Level 2"],
  ["Billing Calc missed", "System Schedule Engine", "Billing Calc did not run yesterday", "High", "Level 2"],
  ["Insufficient Recalculate missed", "System Schedule Engine", "Insufficient Recalculate did not run yesterday", "High", "Level 2"],
  ["Is Valid Engine missed", "System Schedule Engine", "Is Valid Engine did not run", "High", "Level 2"],
].map(([name, category, condition, priority, tier, appliesTo = "All organizations"], id) => ({
  id, name, category, condition, priority, tier,
  slaResponse: "", slaResolve: "",
  channels: ["Notification"],
  operator: "None",
  autoCreateTicket: true,
  appliesTo,
  thresholdValue: "",
  thresholdWindow: "",
}));
