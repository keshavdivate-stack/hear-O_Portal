/* ---------------- Reference lists ---------------- */
const ISSUE_TYPES = ["Recording Problem", "Uploading Problem", "Device/System Issue", "Other Software Issue"];
const TIERS = ["Tier 1", "Tier 2", "Tier 3", "Tier 4"];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["Open", "In Progress", "Escalated", "Resolved"];

/* ---------------- Sample tickets raised by patients ---------------- */
const patientTickets = [
  { id: 0, ticketNo: "TCK-1042", patientId: "120-2001", organization: "120", issueType: "Recording Problem", tier: "Tier 1", priority: "High", status: "Open", createdDate: "02/08/2026 09:14", description: "Patient reports the app freezes a few seconds into every recording attempt and no audio file is saved." },
  { id: 1, ticketNo: "TCK-1041", patientId: "121-2002", organization: "121", issueType: "Uploading Problem", tier: "Tier 2", priority: "Medium", status: "In Progress", createdDate: "01/08/2026 16:40", description: "Recordings complete but fail to upload; patient sees a spinning icon that never resolves on Wi-Fi and cellular both." },
  { id: 2, ticketNo: "TCK-1038", patientId: "104-3001", organization: "104", issueType: "Device/System Issue", tier: "Tier 3", priority: "Urgent", status: "Escalated", createdDate: "30/07/2026 11:02", description: "Patient's tablet will not power on after the last app update; suspected bricked device, needs replacement unit." },
  { id: 3, ticketNo: "TCK-1035", patientId: "B03-4002", organization: "B03", issueType: "Other Software Issue", tier: "Tier 1", priority: "Low", status: "Resolved", createdDate: "28/07/2026 08:55", description: "Notification reminders were appearing in Hebrew instead of the patient's selected language, English." },
  { id: 4, ticketNo: "TCK-1031", patientId: "105-5001", organization: "105", issueType: "Recording Problem", tier: "Tier 2", priority: "High", status: "Open", createdDate: "26/07/2026 14:20", description: "Background noise cancellation seems disabled; all recordings since Tuesday have heavy static." },
  { id: 5, ticketNo: "TCK-1027", patientId: "122-2001", organization: "122", issueType: "Uploading Problem", tier: "Tier 1", priority: "Medium", status: "Resolved", createdDate: "22/07/2026 10:10", description: "Single recording stuck in upload queue for 3 days; cleared after patient reinstalled the app." },
  { id: 6, ticketNo: "TCK-1019", patientId: "B01-6004", organization: "B01", issueType: "Device/System Issue", tier: "Tier 2", priority: "Medium", status: "In Progress", createdDate: "18/07/2026 13:47", description: "App crashes immediately on launch on patient's older Android device; logs point to a memory issue." },
  { id: 7, ticketNo: "TCK-1012", patientId: "ATP-7002", organization: "ATP", issueType: "Other Software Issue", tier: "Tier 1", priority: "Low", status: "Open", createdDate: "14/07/2026 09:30", description: "Patient can't find the 'measurements' tab after the latest release; menu appears reordered." },
];

/* ---------------- Sample tickets raised by clinics ---------------- */
const clinicTickets = [
  { id: 0, ticketNo: "TCK-2018", raisedBy: "Rachel Cohen", organization: "120", issueType: "Device/System Issue", tier: "Tier 3", priority: "Urgent", status: "Escalated", createdDate: "02/08/2026 08:05", description: "Clinic-wide: patient devices provisioned this week are not syncing with the dashboard at all." },
  { id: 1, ticketNo: "TCK-2015", raisedBy: "David Levi", organization: "121", issueType: "Other Software Issue", tier: "Tier 2", priority: "Medium", status: "In Progress", createdDate: "31/07/2026 15:18", description: "Compliance chart on the clinic dashboard is showing data one day behind for the whole site." },
  { id: 2, ticketNo: "TCK-2011", raisedBy: "Miriam Katz", organization: "B01", issueType: "Uploading Problem", tier: "Tier 1", priority: "High", status: "Open", createdDate: "29/07/2026 12:44", description: "Several patient recordings uploaded overnight are missing from the clinic's session list." },
  { id: 3, ticketNo: "TCK-2006", raisedBy: "Omer Peretz", organization: "104", issueType: "Recording Problem", tier: "Tier 1", priority: "Low", status: "Resolved", createdDate: "24/07/2026 09:55", description: "Clinic reported one patient's recordings sound sped up; traced to a bad microphone on that device." },
  { id: 4, ticketNo: "TCK-2001", raisedBy: "Noa Ben-David", organization: "105", issueType: "Device/System Issue", tier: "Tier 2", priority: "High", status: "Open", createdDate: "20/07/2026 17:02", description: "Clinic tablet used for onboarding new patients won't connect to the org Wi-Fi after firmware update." },
];

/* ---------------- Bulk synthetic tickets ----------------
   Tops up the hand-authored samples above so filtering this list by status yields
   the same totals the Overview dashboard's System Health footer promises (94
   Escalated / 206 In Progress / 68 Resolved) -- those footer cards deep-link
   straight into this filtered view via support.html?status=<Status>. */
const SUPPORT_ORG_CODES = ["120", "121", "104", "B03", "105", "122", "B01", "ATP"];
const SUPPORT_CLINIC_STAFF = ["Rachel Cohen", "David Levi", "Miriam Katz", "Omer Peretz", "Noa Ben-David", "Yossi Mizrahi", "Tamar Azoulay", "Eitan Shapiro"];
const SUPPORT_ISSUE_DESCRIPTIONS = {
  "Recording Problem": "Recording did not complete or save as expected.",
  "Uploading Problem": "Upload stalled and required a retry.",
  "Device/System Issue": "Device stopped responding or syncing correctly.",
  "Other Software Issue": "Unexpected app behavior reported by the user.",
};
const SUPPORT_STATUS_PRIORITIES = {
  Escalated: ["Urgent", "Urgent", "High"],
  "In Progress": ["Medium", "High"],
  Resolved: ["Low", "Medium", "High"],
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
      tier: TIERS[n % TIERS.length],
      priority: priorities[n % priorities.length],
      status,
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

topUpTickets(clinicTickets, "clinic", "Escalated", 37, 0);
topUpTickets(clinicTickets, "clinic", "In Progress", 81, 37);
topUpTickets(clinicTickets, "clinic", "Resolved", 26, 118);
