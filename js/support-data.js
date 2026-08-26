/* Current logged-in clinician (matches the "EC" topbar avatar) -- tickets
   assigned to this person are what "Support" shows by default. Shared by
   support.html (list) and ticket-detail.html (single ticket). */
const CURRENT_ASSIGNEE = "Emily Carter";

const ticketCategories = [
  { key: "Compliance", label: "Compliance" },
  { key: "Voice Engine", label: "Voice Engine" },
  { key: "Sensors", label: "Sensors" },
  { key: "Patient App", label: "Patient App" },
  { key: "Clinic User Security", label: "Clinic User Security" },
  { key: "Scheduling Engine", label: "Scheduling Engine" },
];

const issueTypesByCategory = {
  "Compliance": ["Non-compliance Alert", "Compliance Score Mismatch"],
  "Voice Engine": ["Missing ASR Results", "Recording Failed to Process"],
  "Sensors": ["Sensor Data Gap", "Device Sync Failure"],
  "Patient App": ["Paused Too Long", "Stuck In Baseline", "App Crash On Login"],
  "Clinic User Security": ["Suspicious Login Attempt", "MFA Reset Request"],
  "Scheduling Engine": ["Missing Run: Start Date Engine", "Schedule Conflict"],
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

function issueType(category, index) {
  return issueTypesByCategory[category][index % issueTypesByCategory[category].length];
}

const ticketList = [
  { ticketId: "TCK-1050", organization: "121", type: "Patient", who: "121-2010", category: "Voice Engine", issueType: issueType("Voice Engine", 0), origin: "System Generated", severity: "Critical", state: "Open", assignedTo: "Emily Carter", created: "18.08.2028", description: "The voice engine failed to return ASR results for the patient's daily recording. No transcript was generated for the last 3 sessions." },
  { ticketId: "TCK-1207", organization: "B03", type: "Patient", who: "B03-5107", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "System Generated", severity: "Critical", state: "In Progress", assignedTo: "Emily Carter", created: "17.08.2028", description: "Scheduled recording run did not trigger for the patient's start date. Baseline window is at risk of expiring." },
  { ticketId: "TCK-1315", organization: "ATP", type: "Patient", who: "ATP-5215", category: "Patient App", issueType: issueType("Patient App", 0), origin: "System Generated", severity: "Critical", state: "Resolved", assignedTo: "Emily Carter", created: "12.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-1339", organization: "ATP", type: "Patient", who: "ATP-5239", category: "Patient App", issueType: issueType("Patient App", 1), origin: "System Generated", severity: "Critical", state: "Open", assignedTo: "Emily Carter", created: "20.08.2028", description: "Patient onboarding is stuck in baseline collection with no valid recordings for 6 days." },
  { ticketId: "TCK-1401", organization: "B01", type: "Patient", who: "B01-3312", category: "Compliance", issueType: issueType("Compliance", 0), origin: "System Generated", severity: "Medium", state: "Escalated", assignedTo: "Emily Carter", created: "19.08.2028", description: "Patient compliance score dropped below the configured threshold for two consecutive weeks." },
  { ticketId: "TCK-1422", organization: "B01", type: "Clinic", who: "Ariel Fox", category: "Clinic User Security", issueType: issueType("Clinic User Security", 0), origin: "System Generated", severity: "High", state: "Open", assignedTo: "Emily Carter", created: "21.08.2028", description: "Multiple failed login attempts detected for a clinic user account outside of normal usage hours." },
  { ticketId: "TCK-1478", organization: "105", type: "Patient", who: "105-4471", category: "Sensors", issueType: issueType("Sensors", 0), origin: "System Generated", severity: "Low", state: "In Progress", assignedTo: "Emily Carter", created: "16.08.2028", description: "No sensor readings received from the patient's connected device for the past 24 hours." },
  { ticketId: "TCK-1502", organization: "B01", type: "Clinic", who: "Dr. Sarah Mitchell", category: "Clinic User Security", issueType: issueType("Clinic User Security", 1), origin: "User Created", severity: "Medium", state: "Resolved", assignedTo: "Emily Carter", created: "10.08.2028", description: "Clinic user requested an MFA reset after losing access to their authenticator app." },
  { ticketId: "TCK-1231", organization: "B03", type: "Patient", who: "B03-5131", category: "Patient App", issueType: issueType("Patient App", 0), origin: "System Generated", severity: "Critical", state: "In Progress", assignedTo: "Daniel Roy", created: "18.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-2207", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "User Created", severity: "Critical", state: "In Progress", assignedTo: "Maya Cohen", created: "17.08.2028", description: "Clinic reported the scheduling engine did not start the patient's monitoring run on the agreed date." },
  { ticketId: "TCK-2231", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "Patient App", issueType: issueType("Patient App", 0), origin: "User Created", severity: "Critical", state: "Resolved", assignedTo: "Daniel Roy", created: "13.08.2028", description: "Clinic reported patient app pause issue, since resolved after a forced re-sync." },
  { ticketId: "TCK-1123", organization: "ATP", type: "Patient", who: "ATP-5023", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "User Created", severity: "Medium", state: "Escalated", assignedTo: "Tomer Levi", created: "14.08.2028", description: "Scheduled run missing a start date, escalated after repeated occurrence for this organization." },
  { ticketId: "TCK-1560", organization: "104", type: "Patient", who: "104-2290", category: "Voice Engine", issueType: issueType("Voice Engine", 1), origin: "System Generated", severity: "High", state: "Open", assignedTo: "Sarah Cline", created: "21.08.2028", description: "Recording uploaded but failed to process through the voice engine pipeline." },
  { ticketId: "TCK-1588", organization: "B01", type: "Patient", who: "B01-3390", category: "Sensors", issueType: issueType("Sensors", 1), origin: "System Generated", severity: "Low", state: "Resolved", assignedTo: "Maya Cohen", created: "09.08.2028", description: "Connected device failed to sync after a firmware update; resolved by re-pairing the device." },
];

ticketList.forEach((t, i) => (t.id = i));
ticketList.forEach((t) => (t.history = [
  { date: t.created, text: `Ticket created (${t.origin}).` },
]));

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
