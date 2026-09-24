/* ---------------- Incidents — reference lists ----------------
   An Incident is a system-generated issue (Start Date Engine skipped a run,
   Voice Engine failure, ...), never a manually raised Ticket. */
const INC_PRIORITIES = ["SEV-1", "SEV-2", "SEV-3", "SEV-4"];
const INC_PRIORITY_LABEL = { "SEV-1": "Critical", "SEV-2": "High", "SEV-3": "Medium", "SEV-4": "Low" };
const INC_PRIORITY_CLASS = { "SEV-1": "bo-pill-severity-critical", "SEV-2": "bo-pill-severity-high", "SEV-3": "bo-pill-severity-medium", "SEV-4": "bo-pill-severity-low" };

const INC_STATUSES = ["Active", "Escalated", "Resolved"];
const INC_STATUS_CLASS = { Active: "bo-pill-incident-active", Escalated: "bo-pill-incident-escalated", Resolved: "bo-pill-incident-resolved" };

/* Category values are shared with Tickets (see CATEGORIES in support-data.js)
   wherever the underlying area overlaps, so the same category reads the same
   way in both the Tickets and Incidents tables. */
const INC_SOURCES = ["System Scheduler", "Voice Engine", "Sensors", "EHR Integration", "Patient Monitoring", "System Health", "Other"];
const INC_SOURCE_CATEGORY = {
  "System Scheduler": "System Schedule Engine",
  "Voice Engine": "Voice Engine",
  "Sensors": "Sensors",
  "EHR Integration": "Integrations",
  "Patient Monitoring": "Patient (Mobile/Web)",
  "System Health": "Compliance",
  "Other": "Other",
};
const INC_CATEGORIES = ["System Schedule Engine", "Voice Engine", "Sensors", "Integrations", "Patient (Mobile/Web)", "Compliance", "Platform / Infra", "Localization", "Other"];

/* Dedicated Support Team — distinct from SUPPORT_AGENTS (Ticket assignees) so
   the Incident Owner is never confused with who a Ticket is assigned to. */
const SUPPORT_TEAM = ["Maya Chen", "Sarah Collins", "Daniel Adams", "Priya Nair", "Jordan Lee"];

/* 36 distinct org codes -- platform-wide compliance incidents hit every
   organization, so the list must be long enough to not repeat codes. */
const INC_ORG_CODES = [
  "B03", "ATP", "120", "121", "104", "105", "122", "B01", "106", "107", "108", "B04",
  "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "123",
  "124", "125", "126", "127", "128", "129", "130", "B02", "B05", "B06", "B07", "ATQ",
];

function orgsForCount(n, seed) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(INC_ORG_CODES[(seed + i) % INC_ORG_CODES.length]);
  return out;
}
function patientsForOrgs(orgs, perOrg, seed) {
  const out = [];
  orgs.forEach((org, oi) => {
    for (let i = 0; i < perOrg; i++) out.push(`${org}-${5000 + seed + oi * 100 + i}`);
  });
  return out;
}
/* Voice Engine "recording(s) without ASR results" incidents are raised per
   patient, not per organization -- hence "0 orgs · N patients". */
function unassignedPatients(n, seed) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(`P-${7000 + seed + i}`);
  return out;
}

/* Issue Type is the specific detection rule that fired, one level below
   Category (e.g. Voice Engine > ASR Results Missing). Derived from the
   incident title unless the record sets issueType explicitly. */
function incIssueType(incident) {
  if (incident.issueType) return incident.issueType;
  const t = incident.title;
  if (/without ASR results/i.test(t)) return "ASR Results Missing";
  if (/^Usable compliance/i.test(t)) return "Usable Compliance Below Threshold";
  if (/compliance/i.test(t)) return "Compliance Below Threshold";
  if (/Voice Engine/i.test(t)) return "Voice Engine Errors";
  if (/Billing Calc|Start Date Engine|skipped a run|did not run/i.test(t)) return "Missed Scheduled Run";
  if (/Sensor/i.test(t)) return "Sensor Data Delays";
  if (/Registered/i.test(t)) return "Patient Stuck in Registered";
  if (/locale/i.test(t)) return "Missing Localization";
  if (/FHIR|EHR/i.test(t)) return "EHR Integration Failure";
  if (/alert delivery/i.test(t)) return "Alert Delivery Delayed";
  return "Other";
}

const ALL_ORGS = orgsForCount(36, 0);
const ALL_ORG_PATIENTS = patientsForOrgs(ALL_ORGS, 67, 0).slice(0, 2386);

/* Platform-wide compliance incident (36 orgs · 2386 patients). */
function complianceIncident(id, title, status, detectedAt, extra) {
  return Object.assign({
    id,
    title,
    source: "System Health",
    category: "Compliance",
    priority: "SEV-2",
    status,
    owner: "Jordan Lee",
    detectedAt,
    duration: "—",
    orgs: ALL_ORGS,
    patients: ALL_ORG_PATIENTS,
    scheduledRunsAffected: 0,
    summary: `${title}. Compliance is measured across every active patient on the platform.`,
    rootCause: "Not identified",
    tasks: [],
    timeline: [
      { time: detectedAt.split(", ")[1], text: "Incident detected automatically" },
      { time: detectedAt.split(", ")[1], text: "SEV-2 escalation triggered" },
    ],
    resolution: null,
  }, extra || {});
}

/* ---------------- Hand-authored incidents (fully detailed) ---------------- */
const incidents = [
  {
    id: "INC-000140",
    title: "6 recording(s) without ASR results",
    source: "Voice Engine",
    category: "Voice Engine",
    priority: "SEV-2",
    status: "Active",
    owner: "Priya Nair",
    detectedAt: "09/24/2026, 02:37 PM",
    duration: "—",
    orgs: [],
    patients: unassignedPatients(3, 0),
    scheduledRunsAffected: 0,
    summary: "6 of 38 recordings from the last 1 day(s) failed on-device ASR, across 3 patient(s).",
    rootCause: "Not identified",
    tasks: [],
    timeline: [
      { time: "02:37 PM", text: "Incident detected automatically" },
      { time: "02:37 PM", text: "SEV-2 escalation triggered" },
    ],
    resolution: null,
  },
  complianceIncident("INC-000131", "Usable compliance below threshold in 36 organization(s)", "Active", "09/24/2026, 02:37 PM"),
  complianceIncident("INC-000132", "Compliance 0.1% across the platform", "Active", "09/24/2026, 02:37 PM"),
  complianceIncident("INC-000133", "Usable compliance 0.0% across the platform", "Active", "09/24/2026, 02:37 PM"),
  complianceIncident("INC-000130", "Compliance below threshold in 36 organization(s)", "Active", "09/24/2026, 02:37 PM"),
  {
    id: "INC-000124",
    title: "5 recording(s) without ASR results",
    source: "Voice Engine",
    category: "Voice Engine",
    priority: "SEV-2",
    status: "Resolved",
    owner: "Priya Nair",
    relatedTickets: [{ ticketNo: "TCK-2011", source: "clinic" }],
    detectedAt: "09/22/2026, 02:37 PM",
    duration: "3h 10m",
    orgs: [],
    patients: unassignedPatients(3, 20),
    scheduledRunsAffected: 0,
    summary: "5 of 34 recordings from the last 1 day(s) failed on-device ASR, across 3 patient(s).",
    rootCause: "ASR worker queue stalled after a restart.",
    tasks: [
      { id: 1, title: "Reprocess recordings without ASR results", assignee: "Priya Nair", status: "Completed" },
    ],
    timeline: [
      { time: "02:37 PM", text: "Incident detected automatically" },
      { time: "02:37 PM", text: "SEV-2 escalation triggered" },
      { time: "05:47 PM", text: "Verification completed, incident resolved" },
    ],
    resolution: {
      summary: "ASR worker queue was restarted and all 5 recordings were reprocessed successfully.",
      resolvedBy: "Priya Nair",
      resolvedAt: "09/22/2026, 05:47 PM",
      fixDeployed: true,
      verificationCompleted: true,
    },
  },
  complianceIncident("INC-000119", "Compliance below threshold in 36 organization(s)", "Escalated", "09/22/2026, 02:37 PM", {
    relatedTickets: [{ ticketNo: "TCK-2018", source: "clinic" }],
  }),
  {
    id: "INC-000139",
    title: "Voice Engine failure",
    source: "Voice Engine",
    category: "Voice Engine",
    priority: "SEV-1",
    status: "Active",
    owner: "Priya Nair",
    detectedAt: "09/23/2026, 02:05 PM",
    duration: "18m",
    orgs: orgsForCount(1, 8),
    patients: patientsForOrgs(orgsForCount(1, 8), 2, 200),
    scheduledRunsAffected: 0,
    summary: "Voice Engine is returning errors on the majority of ASR requests, blocking recording processing across affected organizations.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Roll back last Voice Engine deploy", assignee: "Priya Nair", status: "In Progress" },
      { id: 2, title: "Reprocess failed recordings once restored", assignee: "Jordan Lee", status: "Open" },
    ],
    timeline: [
      { time: "02:05 PM", text: "Incident detected automatically" },
      { time: "02:06 PM", text: "SEV-1 escalation triggered" },
      { time: "02:09 PM", text: "Priya Nair acknowledged incident" },
      { time: "02:18 PM", text: "Rollback in progress" },
    ],
    resolution: null,
  },
  {
    id: "INC-000138",
    title: "Billing Calc job did not run",
    source: "System Scheduler",
    category: "System Schedule Engine",
    priority: "SEV-2",
    status: "Active",
    owner: "Sarah Collins",
    detectedAt: "09/23/2026, 11:15 AM",
    duration: "3h 00m",
    orgs: orgsForCount(2, 2),
    patients: patientsForOrgs(orgsForCount(2, 2), 2, 700).slice(0, 3),
    scheduledRunsAffected: 2,
    summary: "The Billing Calc scheduled job did not run yesterday for two organizations, delaying their billing reports.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Manually trigger the missed Billing Calc run", assignee: "Sarah Collins", status: "In Progress" },
      { id: 2, title: "Confirm billing reports regenerate correctly", assignee: "Daniel Adams", status: "Open" },
    ],
    timeline: [
      { time: "11:15 AM", text: "Incident detected automatically" },
      { time: "11:18 AM", text: "SEV-2 escalation triggered" },
      { time: "11:30 AM", text: "Sarah Collins acknowledged incident" },
    ],
    resolution: null,
  },
  {
    id: "INC-000137",
    title: "Active-patient compliance dropped below threshold",
    source: "System Health",
    category: "Compliance",
    priority: "SEV-1",
    status: "Active",
    owner: "Jordan Lee",
    detectedAt: "09/23/2026, 12:35 PM",
    duration: "2h 00m",
    orgs: orgsForCount(1, 5),
    patients: patientsForOrgs(orgsForCount(1, 5), 3, 500),
    scheduledRunsAffected: 0,
    summary: "Active-patient compliance has fallen below the configured threshold for one organization, driven by a run of missed recordings.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Confirm affected patients' recording status", assignee: "Jordan Lee", status: "In Progress" },
      { id: 2, title: "Notify care team of compliance drop", assignee: "Maya Chen", status: "Open" },
    ],
    timeline: [
      { time: "12:35 PM", text: "Incident detected automatically" },
      { time: "12:37 PM", text: "SEV-1 escalation triggered" },
      { time: "12:44 PM", text: "Jordan Lee acknowledged incident" },
    ],
    resolution: null,
  },
  {
    id: "INC-000136",
    title: "Sensor upload latency elevated in EU region",
    source: "Sensors",
    category: "Sensors",
    priority: "SEV-3",
    status: "Active",
    owner: "Sarah Collins",
    detectedAt: "09/23/2026, 01:20 PM",
    duration: "42m",
    orgs: orgsForCount(3, 3),
    patients: patientsForOrgs(orgsForCount(3, 3), 1, 100),
    scheduledRunsAffected: 0,
    summary: "Sensor upload processing in the EU region is running well above normal latency, delaying patient sensor data from appearing on clinic dashboards.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Check EU upload queue backlog", assignee: "Sarah Collins", status: "In Progress" },
      { id: 2, title: "Confirm patient data eventually lands", assignee: "Priya Nair", status: "Open" },
    ],
    timeline: [
      { time: "01:20 PM", text: "Incident detected automatically" },
      { time: "01:22 PM", text: "SEV-3 escalation triggered" },
      { time: "01:31 PM", text: "Sarah Collins acknowledged incident" },
    ],
    resolution: null,
  },
  {
    id: "INC-000135",
    title: "Patients stuck in Registered status",
    source: "Patient Monitoring",
    category: "Patient (Mobile/Web)",
    priority: "SEV-4",
    status: "Active",
    owner: "Priya Nair",
    detectedAt: "09/22/2026, 02:35 PM",
    duration: "24h 10m",
    orgs: orgsForCount(1, 9),
    patients: patientsForOrgs(orgsForCount(1, 9), 1, 600),
    scheduledRunsAffected: 0,
    summary: "One or more patients have remained in Registered status longer than expected, suggesting onboarding did not complete.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Check onboarding completion for affected patients", assignee: "Priya Nair", status: "Open" },
    ],
    timeline: [
      { time: "02:35 PM", text: "Incident detected automatically" },
      { time: "02:40 PM", text: "SEV-4 escalation triggered" },
    ],
    resolution: null,
  },
  {
    id: "INC-000128",
    title: "Start Date Engine skipped a run",
    source: "System Scheduler",
    category: "System Schedule Engine",
    priority: "SEV-2",
    status: "Escalated",
    owner: "Maya Chen",
    relatedTickets: [
      { ticketNo: "TCK-2018", source: "clinic" },
      { ticketNo: "TCK-2011", source: "clinic" },
      { ticketNo: "TCK-1041", source: "patient" },
      { ticketNo: "TCK-1038", source: "patient" },
    ],
    detectedAt: "09/21/2026, 10:42 AM",
    duration: "1h 05m",
    orgs: orgsForCount(12, 0),
    patients: patientsForOrgs(orgsForCount(12, 0), 6, 0).slice(0, 61),
    scheduledRunsAffected: 18,
    summary: "Start Date Engine skipped scheduled runs for multiple organizations.",
    rootCause: "Scheduler drift after deployment",
    tasks: [
      { id: 1, title: "Investigate scheduler failure", assignee: "Maya Chen", status: "In Progress" },
      { id: 2, title: "Re-run affected schedules", assignee: "Sarah Collins", status: "Open" },
      { id: 3, title: "Verify affected patient records", assignee: "Daniel Adams", status: "Completed" },
      { id: 4, title: "Notify impacted organizations", assignee: "Maya Chen", status: "Completed" },
    ],
    timeline: [
      { time: "10:42 AM", text: "Incident detected automatically" },
      { time: "10:44 AM", text: "SEV-2 escalation triggered" },
      { time: "10:48 AM", text: "Maya Chen acknowledged incident" },
      { time: "11:12 AM", text: "Fix deployed" },
      { time: "11:15 AM", text: "Incident moved to Escalated" },
      { time: "11:45 AM", text: "No new failures detected" },
    ],
    resolution: null,
  },
  {
    id: "INC-000121",
    title: "Hebrew locale strings missing after release",
    source: "Other",
    category: "Localization",
    priority: "SEV-3",
    status: "Resolved",
    owner: "Daniel Adams",
    detectedAt: "09/20/2026, 09:05 AM",
    duration: "6h 40m",
    orgs: orgsForCount(1, 1),
    patients: patientsForOrgs(orgsForCount(1, 1), 4, 300),
    scheduledRunsAffected: 0,
    summary: "Hebrew locale strings were missing from the patient app after the latest release, falling back to English for affected patients.",
    rootCause: "Localization bundle for he-IL was excluded from the release build.",
    tasks: [
      { id: 1, title: "Restore he-IL locale bundle", assignee: "Daniel Adams", status: "Completed" },
      { id: 2, title: "Confirm affected patients see Hebrew again", assignee: "Daniel Adams", status: "Completed" },
    ],
    timeline: [
      { time: "09:05 AM", text: "Incident detected automatically" },
      { time: "09:10 AM", text: "SEV-3 escalation triggered" },
      { time: "09:22 AM", text: "Daniel Adams acknowledged incident" },
      { time: "01:40 PM", text: "Fix deployed" },
      { time: "03:45 PM", text: "Verification completed, incident resolved" },
    ],
    resolution: {
      summary: "Localization bundle was restored and redeployed; all affected patients confirmed to be seeing Hebrew strings again.",
      resolvedBy: "Daniel Adams",
      resolvedAt: "09/20/2026, 03:45 PM",
      fixDeployed: true,
      verificationCompleted: true,
    },
  },
];

/* ---------------- Bulk synthetic resolved incidents ----------------
   Tops up the hand-authored incidents above to the same 27-incident total
   the developed Incidents list shows. */
const INC_TITLE_TEMPLATES = [
  { title: "4 recording(s) without ASR results", source: "Voice Engine", perPatient: true },
  { title: "Compliance below threshold in 36 organization(s)", source: "System Health", platform: true },
  { title: "Start Date Engine skipped a run", source: "System Scheduler" },
  { title: "Usable compliance below threshold in 36 organization(s)", source: "System Health", platform: true },
  { title: "Sensor upload latency elevated", source: "Sensors" },
  { title: "3 recording(s) without ASR results", source: "Voice Engine", perPatient: true },
  { title: "Billing Calc job failed to complete", source: "System Scheduler" },
  { title: "FHIR endpoint unreachable", source: "EHR Integration" },
  { title: "Compliance 0.4% across the platform", source: "System Health", platform: true },
  { title: "Patient Monitoring alert delivery delayed", source: "Patient Monitoring" },
];

function topUpResolvedIncidents(count, startNum) {
  for (let i = 0; i < count; i++) {
    const n = startNum - i;
    const tpl = INC_TITLE_TEMPLATES[i % INC_TITLE_TEMPLATES.length];
    const priority = INC_PRIORITIES[(i + 1) % INC_PRIORITIES.length];
    const owner = SUPPORT_TEAM[i % SUPPORT_TEAM.length];
    const orgCount = 1 + (i % 4);
    const patientCount = 2 + (i % 6);
    let orgs = orgsForCount(orgCount, i * 2);
    let patients = patientsForOrgs(orgs, patientCount, 400 + i * 20);
    if (tpl.perPatient) { orgs = []; patients = unassignedPatients(patientCount, 100 + i * 10); }
    if (tpl.platform) { orgs = ALL_ORGS; patients = ALL_ORG_PATIENTS; }
    const hours = i % 5;
    const minutes = 10 + ((i * 7) % 50);
    const day = String(19 - Math.floor(i / 2)).padStart(2, "0");
    const detectedAt = `09/${day}/2026, 02:37 PM`;

    incidents.push({
      id: `INC-${String(n).padStart(6, "0")}`,
      title: tpl.title,
      source: tpl.source,
      category: INC_SOURCE_CATEGORY[tpl.source],
      priority,
      status: "Resolved",
      owner,
      detectedAt,
      duration: `${hours}h ${minutes}m`,
      orgs,
      patients,
      scheduledRunsAffected: tpl.source === "System Scheduler" ? 2 + (i % 6) : 0,
      summary: `${tpl.title} — resolved after investigation and a targeted fix.`,
      rootCause: i % 3 === 0 ? "Not identified" : "Configuration drift introduced by a recent deployment",
      tasks: [
        { id: 1, title: "Investigate root cause", assignee: owner, status: "Completed" },
        { id: 2, title: "Verify affected records", assignee: SUPPORT_TEAM[(i + 1) % SUPPORT_TEAM.length], status: "Completed" },
      ],
      timeline: [
        { time: "Detected", text: "Incident detected automatically" },
        { time: "Acknowledged", text: `${owner} acknowledged incident` },
        { time: "Resolved", text: "Verification completed, incident resolved" },
      ],
      resolution: {
        summary: `${tpl.title} was resolved and verified with no recurrence.`,
        resolvedBy: owner,
        resolvedAt: `09/${day}/2026`,
        fixDeployed: true,
        verificationCompleted: true,
      },
    });
  }
}
topUpResolvedIncidents(13, 118);
