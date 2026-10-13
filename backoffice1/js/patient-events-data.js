/* ---------------- Patient Event: sample data ----------------
   Also loaded by patient-health-dashboard.html (per-patient events table)
   and reused by the Summary dashboard's "Patient Event (Recent Error Event)"
   card, so record fields stay stable:
   - eventType: one of PE_EVENT_TYPES, in readable case ("Mobile data disabled")
   - reportedTime / startDate / endDate: "DD/MM/YYYY HH:mm:ss" / "DD/MM/YYYY"
     (the stored format both pages' edit drawers parse) -- display them with
     peFormatDateTime / peFormatDate, which give the US "MM/DD/YYYY" form
   - reportedAt: ISO timestamp of reportedTime, for sorting newest first
   - approved / influenceCompliance: booleans behind the table checkboxes */
const PE_SITES = ["MKT-0219", "MKT-0500", "120", "121", "B01"];
const PE_EVENT_TYPES = [
  "Technical", "Overseas", "Vacation", "Hospitalized", "Sick", "Religious", "Request to stop", "Deterioration",
  "Other", "Forgot", "Recording issue", "Message in", "Message out", "Quality issue", "Flight mode enabled",
  "Mobile data disabled", "Network disabled", "Push notification disabled", "Files not uploaded",
  "App update available (skipped)", "App update available (updated)", "App update installed (confirmed)",
  "Microphone issue occurred", "Storage issue occurred",
];
/* The event types the Summary dashboard counts as "error" events; its
   "Patient Event (Recent Error Event) > View" link opens this page filtered
   to them (?eventTypes=...&approved=true). */
const PATIENT_EVENT_ERROR_TYPES = [
  "Message out", "Quality issue", "Flight mode enabled", "Mobile data disabled", "Network disabled",
  "Push notification disabled", "Files not uploaded", "App update available (skipped)",
  "App update available (updated)", "App update installed (confirmed)",
];
const PE_REPORTED_VIA = ["APPLICATION", "PHONE", "MANUAL"];

/* "13/10/2026" -> "10/13/2026" */
function peFormatDate(dmy) {
  const [d, m, y] = String(dmy || "").split(" ")[0].split("/");
  return y ? `${m}/${d}/${y}` : "";
}

/* "12/10/2026 19:56:00" -> "10/12/2026, 07:56 PM" */
function peFormatDateTime(dmyTime) {
  const date = peFormatDate(dmyTime);
  const [h, min] = (String(dmyTime || "").split(" ")[1] || "").split(":");
  if (!date || h === undefined || min === undefined) return date;
  const hour = Number(h);
  return `${date}, ${String(hour % 12 || 12).padStart(2, "0")}:${min} ${hour < 12 ? "AM" : "PM"}`;
}

/* "13/10/2026 09:14:00" -> "2026-10-13T09:14:00" (blank time -> midnight) */
function peToIso(dmyTime) {
  const [date, time] = String(dmyTime || "").split(" ");
  const [d, m, y] = (date || "").split("/");
  return y ? `${y}-${m}-${d}T${(time || "00:00:00").padEnd(8, ":00").slice(0, 8)}` : "";
}

let peEvents = [
  { username: "B01-0338", eventType: "Mobile data disabled", influenceCompliance: false, description: "Mobile data was switched off on the patient's phone", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "13/10/2026 09:14:00", reportedAt: "2026-10-13T09:14:00", startDate: "13/10/2026", endDate: "", approved: true, status: "New" },
  { username: "120-2002", eventType: "Flight mode enabled", influenceCompliance: false, description: "Flight mode was turned on during the recording window", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "13/10/2026 08:02:00", reportedAt: "2026-10-13T08:02:00", startDate: "13/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Files not uploaded", influenceCompliance: false, description: "3 recordings are waiting to upload", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "13/10/2026 07:41:00", reportedAt: "2026-10-13T07:41:00", startDate: "13/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2001", eventType: "Message out", influenceCompliance: false, description: "Reminder: please record your daily sample", addedBy: "Emily Carter", reportedBy: "Emily Carter", reportedVia: "MANUAL", reportedTime: "12/10/2026 19:56:00", reportedAt: "2026-10-12T19:56:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0338", eventType: "Quality issue", influenceCompliance: false, description: "Background noise detected in the last recording", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "12/10/2026 19:30:00", reportedAt: "2026-10-12T19:30:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "121-2001", eventType: "App update available (skipped)", influenceCompliance: false, description: "Patient skipped app update 3.2.1", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "12/10/2026 17:12:00", reportedAt: "2026-10-12T17:12:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "MKT-0219", eventType: "Forgot", influenceCompliance: true, description: "Patient approved the 'didn't record' reason", addedBy: "MKT-0219", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "12/10/2026 16:48:00", reportedAt: "2026-10-12T16:48:00", startDate: "12/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2002", eventType: "Network disabled", influenceCompliance: false, description: "No network connection for more than 6 hours", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "12/10/2026 14:05:00", reportedAt: "2026-10-12T14:05:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Push notification disabled", influenceCompliance: false, description: "Recording reminders are blocked on the device", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "12/10/2026 11:22:00", reportedAt: "2026-10-12T11:22:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "121-2002", eventType: "App update installed (confirmed)", influenceCompliance: false, description: "App 3.2.1 installed and confirmed", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "12/10/2026 09:37:00", reportedAt: "2026-10-12T09:37:00", startDate: "12/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0338", eventType: "Message out", influenceCompliance: false, description: "We noticed missed recordings, please call the clinic", addedBy: "clinic_admin", reportedBy: "clinic_admin", reportedVia: "MANUAL", reportedTime: "11/10/2026 18:44:00", reportedAt: "2026-10-11T18:44:00", startDate: "11/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2001", eventType: "App update available (updated)", influenceCompliance: false, description: "Patient updated the app to 3.2.1", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "11/10/2026 15:20:00", reportedAt: "2026-10-11T15:20:00", startDate: "11/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Mobile data disabled", influenceCompliance: false, description: "Mobile data was switched off on the patient's phone", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "11/10/2026 12:09:00", reportedAt: "2026-10-11T12:09:00", startDate: "11/10/2026", endDate: "", approved: false, status: "New" },
  { username: "MKT-0500", eventType: "Message in", influenceCompliance: false, description: "Patient asked to change the reminder time", addedBy: "MKT-0500", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "11/10/2026 10:51:00", reportedAt: "2026-10-11T10:51:00", startDate: "11/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2002", eventType: "Quality issue", influenceCompliance: false, description: "Recording too short to analyze", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "11/10/2026 08:15:00", reportedAt: "2026-10-11T08:15:00", startDate: "11/10/2026", endDate: "", approved: true, status: "New" },
  { username: "121-2001", eventType: "Vacation", influenceCompliance: true, description: "Family vacation, recording paused", addedBy: "supervisor_dev3", reportedBy: "Supervisor", reportedVia: "PHONE", reportedTime: "10/10/2026 18:03:00", reportedAt: "2026-10-10T18:03:00", startDate: "10/10/2026", endDate: "17/10/2026", approved: true, status: "New" },
  { username: "B01-0338", eventType: "Files not uploaded", influenceCompliance: false, description: "5 recordings are waiting to upload", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "10/10/2026 13:46:00", reportedAt: "2026-10-10T13:46:00", startDate: "10/10/2026", endDate: "", approved: true, status: "New" },
  { username: "120-2001", eventType: "Flight mode enabled", influenceCompliance: false, description: "Flight mode was turned on during the recording window", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "10/10/2026 07:58:00", reportedAt: "2026-10-10T07:58:00", startDate: "10/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0298", eventType: "App update available (skipped)", influenceCompliance: false, description: "Patient skipped app update 3.2.1", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "09/10/2026 20:31:00", reportedAt: "2026-10-09T20:31:00", startDate: "09/10/2026", endDate: "", approved: true, status: "New" },
  { username: "121-2002", eventType: "Microphone issue occurred", influenceCompliance: false, description: "Microphone could not be accessed during recording", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "09/10/2026 17:24:00", reportedAt: "2026-10-09T17:24:00", startDate: "09/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2002", eventType: "Push notification disabled", influenceCompliance: false, description: "Recording reminders are blocked on the device", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "09/10/2026 12:40:00", reportedAt: "2026-10-09T12:40:00", startDate: "09/10/2026", endDate: "", approved: false, status: "New" },
  { username: "MKT-0219", eventType: "Recording issue", influenceCompliance: true, description: "Recording stopped before completion", addedBy: "MKT-0219", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "09/10/2026 09:12:00", reportedAt: "2026-10-09T09:12:00", startDate: "09/10/2026", endDate: "", approved: false, status: "New" },
  { username: "B01-0338", eventType: "Network disabled", influenceCompliance: false, description: "No network connection for more than 6 hours", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "08/10/2026 21:05:00", reportedAt: "2026-10-08T21:05:00", startDate: "08/10/2026", endDate: "", approved: true, status: "New" },
  { username: "120-2001", eventType: "Hospitalized", influenceCompliance: true, description: "Short hospital stay, recording paused", addedBy: "clinic_admin", reportedBy: "Clinician", reportedVia: "PHONE", reportedTime: "08/10/2026 15:33:00", reportedAt: "2026-10-08T15:33:00", startDate: "08/10/2026", endDate: "11/10/2026", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Message out", influenceCompliance: false, description: "Your device has not uploaded recordings since Monday", addedBy: "Emily Carter", reportedBy: "Emily Carter", reportedVia: "MANUAL", reportedTime: "08/10/2026 11:18:00", reportedAt: "2026-10-08T11:18:00", startDate: "08/10/2026", endDate: "", approved: true, status: "New" },
  { username: "121-2001", eventType: "Storage issue occurred", influenceCompliance: false, description: "Phone storage is almost full", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "08/10/2026 08:47:00", reportedAt: "2026-10-08T08:47:00", startDate: "08/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2002", eventType: "App update installed (confirmed)", influenceCompliance: false, description: "App 3.2.1 installed and confirmed", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "07/10/2026 19:02:00", reportedAt: "2026-10-07T19:02:00", startDate: "07/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0338", eventType: "Technical", influenceCompliance: false, description: "App crashed while recording", addedBy: "B01-0338", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "07/10/2026 14:26:00", reportedAt: "2026-10-07T14:26:00", startDate: "07/10/2026", endDate: "07/10/2026", approved: false, status: "New" },
  { username: "MKT-0500", eventType: "Mobile data disabled", influenceCompliance: false, description: "Mobile data was switched off on the patient's phone", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "07/10/2026 10:10:00", reportedAt: "2026-10-07T10:10:00", startDate: "07/10/2026", endDate: "", approved: false, status: "New" },
  { username: "121-2002", eventType: "Sick", influenceCompliance: true, description: "Patient reported flu symptoms", addedBy: "121-2002", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "06/10/2026 18:55:00", reportedAt: "2026-10-06T18:55:00", startDate: "06/10/2026", endDate: "09/10/2026", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Quality issue", influenceCompliance: false, description: "Background noise detected in the last recording", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "06/10/2026 13:37:00", reportedAt: "2026-10-06T13:37:00", startDate: "06/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2001", eventType: "Files not uploaded", influenceCompliance: false, description: "2 recordings are waiting to upload", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "06/10/2026 09:03:00", reportedAt: "2026-10-06T09:03:00", startDate: "06/10/2026", endDate: "", approved: true, status: "New" },
  { username: "B01-0338", eventType: "App update available (updated)", influenceCompliance: false, description: "Patient updated the app to 3.2.1", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "05/10/2026 16:42:00", reportedAt: "2026-10-05T16:42:00", startDate: "05/10/2026", endDate: "", approved: true, status: "New" },
  { username: "120-2002", eventType: "Overseas", influenceCompliance: true, description: "Patient traveling abroad, out of coverage", addedBy: "supervisor_dev3", reportedBy: "Supervisor", reportedVia: "PHONE", reportedTime: "05/10/2026 11:29:00", reportedAt: "2026-10-05T11:29:00", startDate: "05/10/2026", endDate: "12/10/2026", approved: true, status: "New" },
  { username: "MKT-0219", eventType: "Forgot", influenceCompliance: true, description: "Patient approved the 'didn't record' reason", addedBy: "MKT-0219", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "04/10/2026 19:15:00", reportedAt: "2026-10-04T19:15:00", startDate: "04/10/2026", endDate: "", approved: false, status: "New" },
  { username: "121-2001", eventType: "Religious", influenceCompliance: true, description: "Religious holiday, no recording", addedBy: "121-2001", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "03/10/2026 17:50:00", reportedAt: "2026-10-03T17:50:00", startDate: "03/10/2026", endDate: "04/10/2026", approved: true, status: "New" },
  { username: "B01-0298", eventType: "Network disabled", influenceCompliance: false, description: "No network connection for more than 6 hours", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "03/10/2026 08:26:00", reportedAt: "2026-10-03T08:26:00", startDate: "03/10/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2001", eventType: "Deterioration", influenceCompliance: true, description: "Clinician noted worsening symptoms", addedBy: "clinic_admin", reportedBy: "Clinician", reportedVia: "PHONE", reportedTime: "02/10/2026 14:12:00", reportedAt: "2026-10-02T14:12:00", startDate: "02/10/2026", endDate: "", approved: true, status: "New" },
  { username: "MKT-0500", eventType: "Request to stop", influenceCompliance: true, description: "Patient asked to stop the program", addedBy: "MKT-0500", reportedBy: "Patient", reportedVia: "PHONE", reportedTime: "01/10/2026 10:44:00", reportedAt: "2026-10-01T10:44:00", startDate: "01/10/2026", endDate: "", approved: false, status: "New" },
  { username: "121-2002", eventType: "Flight mode enabled", influenceCompliance: false, description: "Flight mode was turned on during the recording window", addedBy: "System", reportedBy: "Application", reportedVia: "APPLICATION", reportedTime: "30/09/2026 07:39:00", reportedAt: "2026-09-30T07:39:00", startDate: "30/09/2026", endDate: "", approved: false, status: "New" },
  { username: "B01-0338", eventType: "Other", influenceCompliance: false, description: "Other reason not covered by standard list", addedBy: "clinic_admin", reportedBy: "Clinician", reportedVia: "MANUAL", reportedTime: "29/09/2026 16:21:00", reportedAt: "2026-09-29T16:21:00", startDate: "29/09/2026", endDate: "", approved: false, status: "New" },
  { username: "120-2002", eventType: "Message in", influenceCompliance: false, description: "Patient confirmed the new reminder time", addedBy: "120-2002", reportedBy: "Patient", reportedVia: "APPLICATION", reportedTime: "28/09/2026 12:57:00", reportedAt: "2026-09-28T12:57:00", startDate: "28/09/2026", endDate: "", approved: false, status: "New" },
];

peEvents.forEach((r, i) => (r.id = i));
