/* ---------------- B01 Clinic Portal -- shared patient/status dataset ----------------
   Backs the Dashboard / Status / Patient Management screens (backoffice1/clinic/
   index.html, status.html, patient-management.html). Scoped to organization B01
   only -- the org switcher in the topbar is decorative here, matching the rest
   of this Backoffice Clinic portal (its data isn't wired to the selected org
   elsewhere either). */

const CLINIC_STATUSES = ["Priority", "Registered", "Baseline", "Active", "Insufficient Data", "On Hold", "Discontinued"];

const CLINIC_STATUS_TARGETS = {
  "Priority": 186,
  "Registered": 46,
  "Baseline": 70,
  "Active": 21,
  "Insufficient Data": 0,
  "On Hold": 1,
  "Discontinued": 5,
};

const CLINIC_PATIENT_COUNT = Object.values(CLINIC_STATUS_TARGETS).reduce((a, b) => a + b, 0);

function clinicPad4(n) { return String(n).padStart(4, "0"); }
function clinicPatientId(n) { return `B01-${clinicPad4(n)}`; }

/* Rows confirmed from the reference screens; every other patient below is generated. */
const CLINIC_PATIENT_OVERRIDES = {
  1: { enrollmentDate: new Date(2024, 5, 29), status: "Baseline", statusSince: new Date(2024, 11, 6) },
  2: { enrollmentDate: new Date(2024, 5, 29), status: "Baseline", statusSince: new Date(2025, 10, 16) },
  3: { enrollmentDate: new Date(2024, 6, 4), status: "Baseline", statusSince: new Date(2024, 10, 19) },
  4: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 1, 24) },
  5: { enrollmentDate: new Date(2024, 7, 29), status: "Baseline", statusSince: new Date(2025, 6, 27) },
  6: { enrollmentDate: new Date(2025, 0, 17), status: "Baseline", statusSince: new Date(2025, 1, 10) },
  7: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 1, 24) },
  8: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 22) },
  9: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 22) },
  10: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 22) },
  11: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 27) },
  12: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 27) },
  13: { enrollmentDate: new Date(2025, 0, 29), status: "Baseline", statusSince: new Date(2025, 0, 29) },
  14: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 11, 15) },
  15: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 0, 27) },
  16: { enrollmentDate: null, status: "On Hold", statusSince: new Date(2025, 0, 29) },
  17: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 9, 8) },
  19: { enrollmentDate: new Date(2025, 0, 30), status: "Baseline", statusSince: new Date(2025, 7, 27) },
  23: { enrollmentDate: new Date(2025, 0, 31), status: "Baseline", statusSince: new Date(2025, 8, 9) },
  41: { enrollmentDate: new Date(2025, 1, 20), status: "Baseline", statusSince: new Date(2025, 7, 12) },
  42: { enrollmentDate: null, status: "Active", statusSince: new Date(2026, 1, 8) },
  44: { enrollmentDate: null, status: "Active", statusSince: new Date(2026, 1, 8) },
  45: { enrollmentDate: null, status: "Priority", statusSince: new Date(2025, 11, 23) },
  64: { enrollmentDate: null, status: "Priority", statusSince: new Date(2026, 4, 7) },
  100: { enrollmentDate: null, status: "Priority", statusSince: new Date(2026, 7, 24) },
  147: { enrollmentDate: null, status: "Active", statusSince: new Date(2026, 1, 8) },
  150: { enrollmentDate: new Date(2025, 8, 11), status: "Active", statusSince: new Date(2025, 8, 29) },
  176: { enrollmentDate: new Date(2025, 9, 9), status: "Active", statusSince: new Date(2026, 7, 13) },
  178: { enrollmentDate: null, status: "Active", statusSince: new Date(2026, 1, 24) },
  183: { enrollmentDate: null, status: "Active", statusSince: new Date(2025, 9, 10) },
  186: { enrollmentDate: null, status: "Active", statusSince: new Date(2025, 9, 10) },
  187: { enrollmentDate: null, status: "Active", statusSince: new Date(2025, 9, 10) },
  276: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 2, 4) },
  277: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 2, 8) },
  278: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 2, 9) },
  279: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 2, 9) },
  280: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 2, 17) },
  285: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 5, 15) },
  286: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 5, 22) },
  288: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 6, 7) },
  289: { enrollmentDate: null, status: "Registered", statusSince: new Date(2026, 6, 7) },
};

/* Deterministic PRNG (mulberry32) so the generated rows are stable across reloads. */
function clinicSeededRandom(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clinicBuildFillQueue() {
  const overrideCounts = {};
  Object.values(CLINIC_PATIENT_OVERRIDES).forEach((o) => {
    overrideCounts[o.status] = (overrideCounts[o.status] || 0) + 1;
  });

  const queue = [];
  CLINIC_STATUSES.forEach((status) => {
    const remaining = CLINIC_STATUS_TARGETS[status] - (overrideCounts[status] || 0);
    for (let i = 0; i < remaining; i++) queue.push(status);
  });

  const rand = clinicSeededRandom(20260904);
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
  return queue;
}

function clinicSynthesizeDates(id, status, rand) {
  const today = new Date(2026, 8, 4);
  /* Priority is kept older than the hardcoded "recently turned Priority" rows
     above (oldest is B01-0017 at 08/10/25, ~331 days before today) so the
     Dashboard's Priority list -- the 5 most recent -- always surfaces exactly
     the rows the reference screenshot shows, not a randomly generated one. */
  const daysAgoSince = status === "Priority" ? 345 + Math.floor(rand() * 360) : 5 + Math.floor(rand() * 700);
  const statusSince = new Date(today);
  statusSince.setDate(statusSince.getDate() - daysAgoSince);

  const needsEnrollment = status === "Baseline" || status === "Active" || status === "Discontinued";
  let enrollmentDate = null;
  if (needsEnrollment) {
    enrollmentDate = new Date(statusSince);
    enrollmentDate.setDate(enrollmentDate.getDate() - (10 + Math.floor(rand() * 200)));
  }
  return { enrollmentDate, statusSince };
}

const CLINIC_PATIENTS = (() => {
  const fillQueue = clinicBuildFillQueue();
  const rand = clinicSeededRandom(42);
  let fillIdx = 0;
  const rows = [];

  for (let n = 1; n <= CLINIC_PATIENT_COUNT; n++) {
    const override = CLINIC_PATIENT_OVERRIDES[n];
    if (override) {
      rows.push({ id: clinicPatientId(n), n, status: override.status, enrollmentDate: override.enrollmentDate, statusSince: override.statusSince });
      continue;
    }
    const status = fillQueue[fillIdx++];
    const { enrollmentDate, statusSince } = clinicSynthesizeDates(n, status, rand);
    rows.push({ id: clinicPatientId(n), n, status, enrollmentDate, statusSince });
  }
  return rows;
})();

const CLINIC_MONTH_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function clinicFmtDMY2(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = String(date.getFullYear()).slice(-2);
  return `${d}/${m}/${y}`;
}

function clinicFmtDMY4(date) {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
}

function clinicFmtHeaderDate(date) {
  return `${date.getDate()} ${CLINIC_MONTH_ABBR[date.getMonth()]}, ${date.getFullYear()}`;
}

function clinicPatientsByStatus(status) {
  return CLINIC_PATIENTS.filter((p) => p.status === status);
}

const CLINIC_STATUS_BADGE_META = {
  "Priority": { color: "var(--red-text)", icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" class="b01-status-icon"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>` },
  "Registered": { color: "var(--blue-text)", icon: "" },
  "Baseline": { color: "var(--blue-text)", icon: "" },
  "Active": { color: "var(--green-text)", icon: "" },
  "Insufficient Data": { color: "#7E8993", icon: "" },
  "On Hold": { color: "#23272E", icon: "" },
  "Discontinued": { color: "#7E8993", icon: "" },
};

function clinicStatusBadgeHtml(status) {
  const meta = CLINIC_STATUS_BADGE_META[status] || { color: "#23272E", icon: "" };
  return `<b style="color:${meta.color}; font-weight:700;">${status}</b>${meta.icon}`;
}
