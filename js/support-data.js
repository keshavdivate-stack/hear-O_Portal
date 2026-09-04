/* Current logged-in clinician (matches the "EC" topbar avatar) -- tickets
   assigned to this person are what "Support" shows by default. Shared by
   support.html (list) and ticket-detail.html (single ticket). */
const CURRENT_ASSIGNEE = "Emily Carter";

const ticketCategories = [
  { key: "Patient (Mobile/Web)", label: "Patient (Mobile/Web)" },
  { key: "Compliance", label: "Compliance" },
  { key: "Voice Engine", label: "Voice Engine" },
  { key: "Sensors", label: "Sensors" },
  { key: "System Schedule Engine", label: "System Schedule Engine" },
  { key: "Clinic Users (Security)", label: "Clinic Users (Security)" },
];

const issueTypesByCategory = {
  "Patient (Mobile/Web)": ["Paused Too Long", "Stuck In Baseline", "App Crash On Login"],
  "Compliance": ["Non-compliance Alert", "Compliance Score Mismatch"],
  "Voice Engine": ["Missing ASR Results", "Recording Failed to Process"],
  "Sensors": ["Sensor Data Gap", "Device Sync Failure"],
  "System Schedule Engine": ["Missing Run: Start Date Engine", "Schedule Conflict"],
  "Clinic Users (Security)": ["Suspicious Login Attempt", "MFA Reset Request"],
};

const ticketOrigins = [
  { key: "System Generated", label: "System Generated" },
  { key: "User Created", label: "User Created" },
];

const ticketSeverities = [
  { key: "Critical", label: "Critical" },
  { key: "High", label: "High" },
  { key: "Medium", label: "Medium" },
  { key: "Low", label: "Low" },
];

const ticketStates = [
  { key: "Open", label: "Open" },
  { key: "In Progress", label: "In Progress" },
  { key: "Escalated", label: "Escalated" },
  { key: "Resolved", label: "Resolved" },
];

const ticketTypes = [
  { key: "Patient", label: "Patient" },
  { key: "Clinic", label: "Clinic" },
];

const ticketLevels = [
  { key: "Level 1", label: "Level 1" },
  { key: "Level 2", label: "Level 2" },
  { key: "Level 3", label: "Level 3" },
];

/* Support team members a new ticket can be assigned to -- matches the
   assignedTo values already used across ticketList below. */
const SUPPORT_TEAM_MEMBERS = ["Emily Carter", "Daniel Roy", "Maya Cohen", "Tomer Levi", "Sarah Cline"];

/* Who a ticket can be transferred to, grouped by the Level it's being routed
   to -- mirrors backoffice's TIER_AGENTS (backoffice1/js/support-data.js), so
   picking a Level on the Ticket Detail Handling form narrows Assigned To to
   that Level's people, same as backoffice does. */
const TIER_AGENTS = {
  "Level 1": ["Emily Carter", "Daniel Roy"],
  "Level 2": ["Maya Cohen", "Tomer Levi"],
  "Level 3": ["Sarah Cline"],
};

/* Reverse lookup so any support team member's name can carry their level
   wherever it's displayed (Ticket Detail's Assigned To select), matching
   backoffice's AGENT_LEVEL/agentLabel. */
const AGENT_LEVEL = {};
Object.entries(TIER_AGENTS).forEach(([level, names]) => names.forEach((name) => { AGENT_LEVEL[name] = level; }));

function agentLabel(name) {
  const level = AGENT_LEVEL[name];
  return name && level ? `${name} (${level})` : name || "";
}

function issueType(category, index) {
  return issueTypesByCategory[category][index % issueTypesByCategory[category].length];
}

/* `scope` mirrors the backoffice ticket-detail Ticket Info field of the same
   name (see backoffice1/js/support-data.js's SCOPES: "Global" / "Organization"
   / "Patient") -- it says how broadly the underlying issue applies: one
   patient, one clinic/organization, or the whole system. Every hand-authored
   ticket below is scoped per its own description rather than a blanket
   per-category default, since a couple of Clinic-raised tickets are really
   about one specific patient despite being raised by clinic staff. */
const ticketList = [
  { ticketId: "TCK-1050", organization: "121", type: "Patient", who: "121-2010", patientName: "Meital Barak", category: "Voice Engine", issueType: issueType("Voice Engine", 0), origin: "System Generated", severity: "Critical", state: "Open", scope: "Patient", assignedTo: "Emily Carter", created: "18.08.2028", description: "The voice engine failed to return ASR results for the patient's daily recording. No transcript was generated for the last 3 sessions." },
  { ticketId: "TCK-1207", organization: "B03", type: "Patient", who: "B03-5107", patientName: "Noam Kessler", category: "System Schedule Engine", issueType: issueType("System Schedule Engine", 0), origin: "System Generated", severity: "Critical", state: "In Progress", scope: "Patient", assignedTo: "Emily Carter", created: "17.08.2028", description: "Scheduled recording run did not trigger for the patient's start date. Baseline window is at risk of expiring." },
  { ticketId: "TCK-1315", organization: "ATP", type: "Patient", who: "ATP-5215", patientName: "Yael Ashkenazi", category: "Patient (Mobile/Web)", issueType: issueType("Patient (Mobile/Web)", 0), origin: "System Generated", severity: "Critical", state: "Resolved", scope: "Patient", assignedTo: "Emily Carter", created: "12.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-1339", organization: "ATP", type: "Patient", who: "ATP-5239", patientName: "Doron Sharabi", category: "Patient (Mobile/Web)", issueType: issueType("Patient (Mobile/Web)", 1), origin: "System Generated", severity: "Critical", state: "Open", scope: "Patient", assignedTo: "Emily Carter", created: "20.08.2028", description: "Patient onboarding is stuck in baseline collection with no valid recordings for 6 days." },
  { ticketId: "TCK-1401", organization: "B01", type: "Patient", who: "B01-3312", patientName: "Liora Ben-Ami", category: "Compliance", issueType: issueType("Compliance", 0), origin: "System Generated", severity: "Medium", state: "Escalated", scope: "Patient", assignedTo: "Emily Carter", created: "19.08.2028", description: "Patient compliance score dropped below the configured threshold for two consecutive weeks." },
  { ticketId: "TCK-1422", organization: "B01", type: "Clinic", who: "Ariel Fox", category: "Clinic Users (Security)", issueType: issueType("Clinic Users (Security)", 0), origin: "System Generated", severity: "High", state: "Open", scope: "Organization", assignedTo: "Emily Carter", created: "21.08.2028", description: "Multiple failed login attempts detected for a clinic user account outside of normal usage hours." },
  { ticketId: "TCK-1478", organization: "105", type: "Patient", who: "105-4471", patientName: "Amit Golan", category: "Sensors", issueType: issueType("Sensors", 0), origin: "System Generated", severity: "Low", state: "In Progress", scope: "Patient", assignedTo: "Emily Carter", created: "16.08.2028", description: "No sensor readings received from the patient's connected device for the past 24 hours." },
  { ticketId: "TCK-1502", organization: "B01", type: "Clinic", who: "Dr. Sarah Mitchell", category: "Clinic Users (Security)", issueType: issueType("Clinic Users (Security)", 1), origin: "User Created", severity: "Medium", state: "Resolved", scope: "Organization", assignedTo: "Emily Carter", created: "10.08.2028", description: "Clinic user requested an MFA reset after losing access to their authenticator app." },
  { ticketId: "TCK-1231", organization: "B03", type: "Patient", who: "B03-5131", patientName: "Shira Nave", category: "Patient (Mobile/Web)", issueType: issueType("Patient (Mobile/Web)", 0), origin: "System Generated", severity: "Critical", state: "In Progress", scope: "Patient", assignedTo: "Daniel Roy", created: "18.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-2207", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "System Schedule Engine", issueType: issueType("System Schedule Engine", 0), origin: "User Created", severity: "Critical", state: "In Progress", scope: "Patient", assignedTo: "Maya Cohen", created: "17.08.2028", description: "Clinic reported the scheduling engine did not start the patient's monitoring run on the agreed date." },
  { ticketId: "TCK-2231", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "Patient (Mobile/Web)", issueType: issueType("Patient (Mobile/Web)", 0), origin: "User Created", severity: "Critical", state: "Resolved", scope: "Patient", assignedTo: "Daniel Roy", created: "13.08.2028", description: "Clinic reported patient app pause issue, since resolved after a forced re-sync." },
  { ticketId: "TCK-1123", organization: "ATP", type: "Patient", who: "ATP-5023", patientName: "Eyal Peretz", category: "System Schedule Engine", issueType: issueType("System Schedule Engine", 0), origin: "User Created", severity: "Medium", state: "Escalated", scope: "Organization", assignedTo: "Tomer Levi", created: "14.08.2028", description: "Scheduled run missing a start date, escalated after repeated occurrence for this organization." },
  { ticketId: "TCK-1560", organization: "104", type: "Patient", who: "104-2290", patientName: "Talia Rosen", category: "Voice Engine", issueType: issueType("Voice Engine", 1), origin: "System Generated", severity: "High", state: "Open", scope: "Patient", assignedTo: "Sarah Cline", created: "21.08.2028", description: "Recording uploaded but failed to process through the voice engine pipeline." },
  { ticketId: "TCK-1588", organization: "B01", type: "Patient", who: "B01-3390", patientName: "Guy Amrani", category: "Sensors", issueType: issueType("Sensors", 1), origin: "System Generated", severity: "Low", state: "Resolved", scope: "Patient", assignedTo: "Maya Cohen", created: "09.08.2028", description: "Connected device failed to sync after a firmware update; resolved by re-pairing the device." },
];

ticketList.forEach((t, i) => (t.id = i));

/* Every ticket is seeded with its creation entry plus one prior handoff --
   a reassignment to who's currently on it, carrying the note that handoff
   was made with -- so History always shows the "transferred + note" pattern
   the ticket detail's Handling form produces, not just a bare creation line.
   Notes read like a real handoff: what the previous owner already tried,
   and why they're passing it on instead of just describing the issue. */
const TICKET_HANDOFF_NOTES = [
  "Tried re-syncing the device and clearing the local cache, but the issue is still happening -- passing this along for a deeper look.",
  "Walked the patient through a reinstall and re-authentication, but they're still seeing the same failure. Escalating for further troubleshooting.",
  "Checked the logs and retried the failed job manually -- it still didn't go through, so this needs another set of eyes.",
  "Reached out to the patient and confirmed the steps were followed correctly, but the problem persists. Handing off for further investigation.",
  "Attempted the standard fix for this issue but it didn't resolve it -- transferring so it can be looked at with fresh eyes.",
];

ticketList.forEach((t, i) => {
  const previousAssignee = SUPPORT_TEAM_MEMBERS.find((name) => name !== t.assignedTo) || t.assignedTo;
  t.history = [
    { date: t.created, title: "Ticket Created" },
    { date: t.created, title: `Ticket Transferred to ${t.assignedTo}`, detail: `Reassigned from ${previousAssignee} to ${t.assignedTo}. Note: ${TICKET_HANDOFF_NOTES[i % TICKET_HANDOFF_NOTES.length]}` },
  ];
});

function stateCellClass(state) {
  return { Open: "ticket-pill-state-open", "In Progress": "ticket-pill-state-inprogress", Escalated: "ticket-pill-state-escalated", Resolved: "ticket-pill-state-resolved" }[state];
}
function severityCellClass(severity) {
  return { Critical: "ticket-pill-severity-critical", High: "ticket-pill-severity-high", Medium: "ticket-pill-severity-medium", Low: "ticket-pill-severity-low" }[severity];
}
function originCellClass(origin) {
  return origin === "System Generated" ? "ticket-pill-origin-system" : "ticket-pill-origin-user";
}
function typeCellClass(type) {
  return type === "Patient" ? "ticket-pill-type-patient" : "ticket-pill-type-clinic";
}
