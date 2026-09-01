/* ---------------- Incidents — reference lists ----------------
   An Incident is a system-generated issue (Start Date Engine skipped a run,
   Voice Engine failure, ...), never a manually raised Ticket. */
const INC_SEVERITIES = ["SEV-1", "SEV-2", "SEV-3", "SEV-4"];
const INC_SEVERITY_LABEL = { "SEV-1": "Critical", "SEV-2": "High", "SEV-3": "Medium", "SEV-4": "Low" };
const INC_SEVERITY_CLASS = { "SEV-1": "bo-pill-severity-critical", "SEV-2": "bo-pill-severity-high", "SEV-3": "bo-pill-severity-medium", "SEV-4": "bo-pill-severity-low" };

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
  "System Health": "Platform / Infra",
  "Other": "Other",
};
const INC_CATEGORIES = ["System Schedule Engine", "Voice Engine", "Sensors", "Integrations", "Patient (Mobile/Web)", "Platform / Infra", "Localization", "Other"];

/* Dedicated Support Team — distinct from SUPPORT_AGENTS (Ticket assignees) so
   the Incident Owner is never confused with who a Ticket is assigned to. */
const SUPPORT_TEAM = ["Maya Chen", "Sarah Collins", "Daniel Adams", "Priya Nair", "Jordan Lee"];

const INC_ORG_CODES = ["B03", "ATP", "120", "121", "104", "105", "122", "B01", "106", "107", "108", "B04"];

function orgsForCount(n, seed) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(INC_ORG_CODES[(seed + i) % INC_ORG_CODES.length]);
  return out;
}
function patientsForOrgs(orgs, perOrg, seed) {
  const out = [];
  orgs.forEach((org, oi) => {
    for (let i = 0; i < perOrg; i++) out.push(`${org}-${5000 + seed + oi * 10 + i}`);
  });
  return out;
}

/* ---------------- Hand-authored incidents (fully detailed) ---------------- */
const incidents = [
  {
    id: "INC-2026-0042",
    title: "Start Date Engine skipped a run",
    source: "System Scheduler",
    category: "System Schedule Engine",
    severity: "SEV-2",
    status: "Escalated",
    owner: "Maya Chen",
    relatedTicket: { ticketNo: "TCK-2018", source: "clinic" },
    detectedAt: "Aug 19, 2026 · 10:42 AM",
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
    id: "INC-2026-0041",
    title: "Sensor upload latency elevated in EU region",
    source: "Sensors",
    category: "Sensors",
    severity: "SEV-3",
    status: "Active",
    owner: "Sarah Collins",
    detectedAt: "Aug 19, 2026 · 1:20 PM",
    duration: "42m",
    orgs: orgsForCount(7, 3),
    patients: patientsForOrgs(orgsForCount(7, 3), 5, 100).slice(0, 32),
    scheduledRunsAffected: 0,
    summary: "Sensor upload processing in the EU region is running well above normal latency, delaying patient sensor data from appearing on clinic dashboards.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Check EU upload queue backlog", assignee: "Sarah Collins", status: "In Progress" },
      { id: 2, title: "Confirm patient data eventually lands", assignee: "Priya Nair", status: "Open" },
    ],
    timeline: [
      { time: "1:20 PM", text: "Incident detected automatically" },
      { time: "1:22 PM", text: "SEV-3 escalation triggered" },
      { time: "1:31 PM", text: "Sarah Collins acknowledged incident" },
    ],
    resolution: null,
  },
  {
    id: "INC-2026-0043",
    title: "Voice Engine failure",
    source: "Voice Engine",
    category: "Voice Engine",
    severity: "SEV-1",
    status: "Active",
    owner: "Priya Nair",
    detectedAt: "Aug 19, 2026 · 2:05 PM",
    duration: "18m",
    orgs: orgsForCount(5, 8),
    patients: patientsForOrgs(orgsForCount(5, 8), 4, 200).slice(0, 18),
    scheduledRunsAffected: 0,
    summary: "Voice Engine is returning errors on the majority of ASR requests, blocking recording processing across affected organizations.",
    rootCause: "Not identified",
    tasks: [
      { id: 1, title: "Roll back last Voice Engine deploy", assignee: "Priya Nair", status: "In Progress" },
      { id: 2, title: "Reprocess failed recordings once restored", assignee: "Jordan Lee", status: "Open" },
    ],
    timeline: [
      { time: "2:05 PM", text: "Incident detected automatically" },
      { time: "2:06 PM", text: "SEV-1 escalation triggered" },
      { time: "2:09 PM", text: "Priya Nair acknowledged incident" },
      { time: "2:18 PM", text: "Rollback in progress" },
    ],
    resolution: null,
  },
  {
    id: "INC-2026-0039",
    title: "Hebrew locale strings missing after release",
    source: "Other",
    category: "Localization",
    severity: "SEV-3",
    status: "Resolved",
    owner: "Daniel Adams",
    detectedAt: "Aug 12, 2026 · 9:05 AM",
    duration: "6h 40m",
    orgs: orgsForCount(1, 1),
    patients: patientsForOrgs(orgsForCount(1, 1), 4, 300).slice(0, 4),
    scheduledRunsAffected: 0,
    summary: "Hebrew locale strings were missing from the patient app after the latest release, falling back to English for affected patients.",
    rootCause: "Localization bundle for he-IL was excluded from the release build.",
    tasks: [
      { id: 1, title: "Restore he-IL locale bundle", assignee: "Daniel Adams", status: "Completed" },
      { id: 2, title: "Confirm affected patients see Hebrew again", assignee: "Daniel Adams", status: "Completed" },
    ],
    timeline: [
      { time: "9:05 AM", text: "Incident detected automatically" },
      { time: "9:10 AM", text: "SEV-3 escalation triggered" },
      { time: "9:22 AM", text: "Daniel Adams acknowledged incident" },
      { time: "1:40 PM", text: "Fix deployed" },
      { time: "3:45 PM", text: "Incident moved to Escalated" },
      { time: "3:45 PM", text: "Verification completed, incident resolved" },
    ],
    resolution: {
      summary: "Localization bundle was restored and redeployed; all affected patients confirmed to be seeing Hebrew strings again.",
      resolvedBy: "Daniel Adams",
      resolvedAt: "Aug 12, 2026 · 3:45 PM",
      fixDeployed: true,
      verificationCompleted: true,
    },
  },
];

/* ---------------- Bulk synthetic resolved incidents ----------------
   Tops up the hand-authored incidents above so the Resolved status tab
   shows the same total (24) the KPI/status-tab counts promise. */
const INC_TITLE_TEMPLATES = [
  { title: "Start Date Engine skipped a run", source: "System Scheduler" },
  { title: "Baseline Completed Engine missed nightly run", source: "System Scheduler" },
  { title: "Billing Calc job failed to complete", source: "System Scheduler" },
  { title: "Sensor upload latency elevated", source: "Sensors" },
  { title: "Sensor metrics pipeline stalled", source: "Sensors" },
  { title: "Voice Engine ASR error rate spike", source: "Voice Engine" },
  { title: "Voice Engine feature extraction delayed", source: "Voice Engine" },
  { title: "EHR integration failure", source: "EHR Integration" },
  { title: "FHIR endpoint unreachable", source: "EHR Integration" },
  { title: "Patient Monitoring alert delivery delayed", source: "Patient Monitoring" },
  { title: "Compliance dashboard showing stale data", source: "System Health" },
  { title: "Notification delivery degraded", source: "System Health" },
  { title: "App login failures spike", source: "System Health" },
  { title: "Scheduled job failure", source: "System Scheduler" },
];

function topUpResolvedIncidents(count, startNum) {
  for (let i = 0; i < count; i++) {
    const n = startNum - i;
    const tpl = INC_TITLE_TEMPLATES[i % INC_TITLE_TEMPLATES.length];
    const severity = INC_SEVERITIES[(i + 1) % INC_SEVERITIES.length];
    const owner = SUPPORT_TEAM[i % SUPPORT_TEAM.length];
    const orgCount = 1 + (i % 4);
    const orgs = orgsForCount(orgCount, i * 2);
    const patientCount = 2 + (i % 6);
    const patients = patientsForOrgs(orgs, patientCount, 400 + i * 20).slice(0, orgCount * patientCount);
    const hours = i % 5;
    const minutes = 10 + ((i * 7) % 50);
    const day = 1 + (i % 27);
    const month = 1 + (i % 8);

    incidents.push({
      id: `INC-2026-${String(n).padStart(4, "0")}`,
      title: tpl.title,
      source: tpl.source,
      category: INC_SOURCE_CATEGORY[tpl.source],
      severity,
      status: "Resolved",
      owner,
      detectedAt: `Aug ${day}, 2026 · ${String(1 + (i % 11)).padStart(2, "0")}:${String((i * 9) % 60).padStart(2, "0")} AM`,
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
        resolvedAt: `Aug ${day}, 2026`,
        fixDeployed: true,
        verificationCompleted: true,
      },
    });
  }
}
topUpResolvedIncidents(23, 38);
