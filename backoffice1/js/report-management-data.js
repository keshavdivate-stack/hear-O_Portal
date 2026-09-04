/* ---------------- Report Management: sample data ----------------
   Three separate concepts, per the UX brief:
   - Report    = the content being generated (e.g. Missed Recordings).
   - Schedule  = an automated delivery config for a report. One row = one
     schedule (a report can have multiple schedules, e.g. two cadences for
     two organisations).
   - History   = a record of a report that was actually generated and sent,
     whether by schedule or by a one-time Send Report action. */

const RM_REPORTS = [
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

const RM_ORGS = ["120", "121", "122", "104", "B01", "B03", "105"];
const RM_TAGS = ["CURRENT", "NEW"];
const RM_FREQUENCIES = ["Daily", "Weekly", "Monthly"];
const RM_STATUSES = ["Active", "Paused"];
const RM_DELIVERY_STATUSES = ["Delivered", "Failed", "Processing"];
const RM_DIRECTORY = ["VickyDev1", "igor_clinic", "emily.carter", "supervisor_dev3"];

function rmReportLabel(key) {
  const r = RM_REPORTS.find((x) => x.key === key);
  return r ? r.label : key;
}

let rmScheduleSeq = 0;
let rmSchedules = [
  {
    id: rmScheduleSeq++,
    reportKey: "missedRecordings",
    name: "Daily – Current & New",
    org: "HMO Clalit",
    tags: ["Current", "New"],
    frequency: "Daily",
    time: "10:22 AM",
    timezone: "GMT",
    recipients: ["VickyDev1", "Sarah Admin", "Daniel Avraham"],
    status: "Active",
    lastSent: "Today, 10:22 AM",
    lastDeliveryStatus: "Delivered",
    nextRun: "Tomorrow, 10:22 AM",
  },
  {
    id: rmScheduleSeq++,
    reportKey: "missedRecordings",
    name: "Daily – New",
    org: "HMO Clalit",
    tags: ["New"],
    frequency: "Daily",
    time: "08:57 AM",
    timezone: "GMT",
    recipients: ["VickyDev1", "Sarah Admin"],
    status: "Active",
    lastSent: "Today, 08:57 AM",
    lastDeliveryStatus: "Delivered",
    nextRun: "Tomorrow, 08:57 AM",
  },
  {
    id: rmScheduleSeq++,
    reportKey: "qualityNotification",
    name: "Weekly Quality Review",
    org: "Assuta Cardio",
    tags: ["Current"],
    frequency: "Weekly",
    time: "09:00 AM",
    timezone: "GMT",
    recipients: ["igor_clinic"],
    status: "Active",
    lastSent: "Mon, 09:00 AM",
    lastDeliveryStatus: "Delivered",
    nextRun: "Mon, 09:00 AM",
  },
  {
    id: rmScheduleSeq++,
    reportKey: "lowCompliance",
    name: "Monthly Review",
    org: "Clalit South",
    tags: ["Current", "New"],
    frequency: "Monthly",
    time: "09:00 AM",
    timezone: "GMT",
    recipients: ["supervisor_dev3", "emily.carter"],
    status: "Paused",
    lastSent: "Aug 1, 09:00 AM",
    lastDeliveryStatus: "Delivered",
    nextRun: "—",
  },
  {
    id: rmScheduleSeq++,
    reportKey: "clinicSummary",
    name: "Weekly Clinic Digest",
    org: "Maccabi West",
    tags: ["Current"],
    frequency: "Weekly",
    time: "04:00 PM",
    timezone: "GMT",
    recipients: ["emily.carter"],
    status: "Active",
    lastSent: "Fri, 04:00 PM",
    lastDeliveryStatus: "Failed",
    nextRun: "Fri, 04:00 PM",
  },
  {
    id: rmScheduleSeq++,
    reportKey: "clinicPriorityNotification",
    name: "Daily Priority Alert",
    org: "B01 Pilot",
    tags: ["New"],
    frequency: "Daily",
    time: "12:15 PM",
    timezone: "GMT",
    recipients: ["VickyDev1"],
    status: "Active",
    lastSent: "Today, 12:15 PM",
    lastDeliveryStatus: "Failed",
    nextRun: "Tomorrow, 12:15 PM",
  },
];

/* `daysAgo` backs the Report History "Date Range" filter (Last 7/30/90 days,
   All time) -- sentOn stays a display-only string since it's already
   formatted the way each row should read ("Today", "Yesterday", a weekday,
   or a short date), same as everywhere else in this file. */
let rmHistorySeq = 0;
const rmHistory = [
  { id: rmHistorySeq++, reportKey: "missedRecordings", org: "HMO Clalit", sentOn: "Today, 10:22 AM", daysAgo: 0, recipients: 3, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "missedRecordings", org: "HMO Clalit", sentOn: "Today, 08:57 AM", daysAgo: 0, recipients: 2, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "clinicSummary", org: "Maccabi West", sentOn: "Fri, 04:00 PM", daysAgo: 3, recipients: 1, status: "Failed", failureReason: "SMTP relay timed out after 3 retries." },
  { id: rmHistorySeq++, reportKey: "clinicPriorityNotification", org: "B01 Pilot", sentOn: "Today, 12:15 PM", daysAgo: 0, recipients: 2, status: "Failed", failureReason: "1 of 2 recipient addresses bounced." },
  { id: rmHistorySeq++, reportKey: "qualityNotification", org: "Assuta Cardio", sentOn: "Mon, 09:00 AM", daysAgo: 5, recipients: 1, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "lowCompliance", org: "Clalit South", sentOn: "Aug 1, 09:00 AM", daysAgo: 7, recipients: 2, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "missedRecordings", org: "HMO Clalit", sentOn: "Yesterday, 10:22 AM", daysAgo: 1, recipients: 3, status: "Processing" },
  { id: rmHistorySeq++, reportKey: "recordingErrors", org: "HMO Clalit", sentOn: "Jul 25, 11:40 AM", daysAgo: 14, recipients: 2, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "clinicSummary", org: "Maccabi West", sentOn: "Jul 10, 04:00 PM", daysAgo: 29, recipients: 1, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "qualityNotification", org: "Assuta Cardio", sentOn: "Jun 20, 09:00 AM", daysAgo: 49, recipients: 1, status: "Delivered" },
  { id: rmHistorySeq++, reportKey: "lowCompliance", org: "Clalit South", sentOn: "May 5, 09:00 AM", daysAgo: 95, recipients: 2, status: "Delivered" },
];
