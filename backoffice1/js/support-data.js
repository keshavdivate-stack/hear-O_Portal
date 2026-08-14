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
