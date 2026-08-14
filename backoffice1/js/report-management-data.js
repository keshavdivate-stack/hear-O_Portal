/* ---------------- Report Management: sample data ---------------- */
const RM_HMOS = ["120", "121", "122", "104", "B01", "B03", "105"];
const RM_TAGS = ["CURRENT", "NEW", "ARCHIVED"];
const RM_USERS = ["VickyDev1", "igor_clinic", "emily.carter", "supervisor_dev3"];

const RM_REPORT_TYPES = [
  { key: "healthQuestionEmail", label: "Health Question Email" },
  { key: "baselineCompletedEmail", label: "Baseline Completed Email" },
  { key: "missedRecordings", label: "Missed Recordings" },
  { key: "recordingErrors", label: "Recording Errors" },
  { key: "baselineCompletedEmailNotification", label: "Baseline Completed Email Notification" },
  { key: "qualityNotification", label: "Quality Notification" },
  { key: "lowCompliance", label: "Low Compliance" },
  { key: "clinicSummary", label: "Clinic Summary" },
  { key: "clinicPriorityNotification", label: "Clinic Priority Notification" },
];

let rmSchedules = [
  { id: 0, reportType: "missedRecordings", name: "missed 122", hmo: "122", tag: "CURRENT; NEW", user: "VickyDev1", scheduleType: "DAILY", daysOfWeek: "all days", reportTime: "10:22(GMT)" },
  { id: 1, reportType: "missedRecordings", name: "missed 122", hmo: "122", tag: "NEW; CURRENT", user: "VickyDev1", scheduleType: "DAILY", daysOfWeek: "all days", reportTime: "08:57(GMT)" },
  { id: 2, reportType: "qualityNotification", name: "quality B01", hmo: "B01", tag: "CURRENT", user: "igor_clinic", scheduleType: "WEEKLY", daysOfWeek: "Mon, Thu", reportTime: "09:00(GMT)" },
  { id: 3, reportType: "lowCompliance", name: "low compliance 120", hmo: "120", tag: "CURRENT; NEW", user: "supervisor_dev3", scheduleType: "DAILY", daysOfWeek: "all days", reportTime: "07:30(GMT)" },
  { id: 4, reportType: "clinicSummary", name: "clinic summary ATP", hmo: "104", tag: "CURRENT", user: "emily.carter", scheduleType: "WEEKLY", daysOfWeek: "Fri", reportTime: "16:00(GMT)" },
  { id: 5, reportType: "clinicPriorityNotification", name: "priority B03", hmo: "B03", tag: "NEW", user: "VickyDev1", scheduleType: "DAILY", daysOfWeek: "all days", reportTime: "12:15(GMT)" },
];
