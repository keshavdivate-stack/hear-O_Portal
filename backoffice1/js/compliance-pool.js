/* ---------------- Study compliance population (shared) ----------------
   One seeded list of study patients with their Compliance Over Time and
   Current Compliance day counts. The Screening dashboard's compliance bins
   count it per range, and the compliance patient list (usable-compliance.html)
   lists it -- so a bin's number is exactly the "Total: N patients" its tab
   shows. Needs js/mkt-orgs.js (MKT_ORG_LIST, mktHash, mktScale). */

const UC_BUCKETS = [
  { key: "90-100", min: 90, max: 100 },
  { key: "80-89", min: 80, max: 89 },
  { key: "70-79", min: 70, max: 79 },
  { key: "60-69", min: 60, max: 69 },
  { key: "lt60", min: -Infinity, max: 59 },
];

/* Current Compliance looks at the same trailing window the dashboards' bins
   default to ("Last 31 days"); Compliance Over Time covers the patient's
   whole time in the study. */
const UC_CURRENT_WINDOW_DAYS = 31;

function ucBucketOf(pct) {
  return UC_BUCKETS.find((b) => pct >= b.min && pct <= b.max).key;
}

/* Sequential usernames hash to near-identical numbers (COR-0001 vs COR-0002
   differ only in the last character), which made neighbouring rows show
   near-identical values -- scramble the bits so each row looks independent. */
function ucMix(n) {
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  n = Math.imul(n ^ (n >>> 16), 0x45d9f3b);
  return (n ^ (n >>> 16)) >>> 0;
}

/* Skewed so most patients sit in the healthy 55-100 range, with a small
   tail landing at 0 (no data at all -- shows as "Insufficient data") or a
   low 10-54 range, roughly matching a real compliance distribution instead
   of a flat random spread across every bucket. */
function ucPct(seed) {
  const r = seed % 1000;
  if (r < 55) return 0;
  if (r < 110) return 10 + (seed % 45);
  return 55 + (seed % 46);
}

const UC_DAY_MS = 24 * 60 * 60 * 1000;
const ucToday = new Date();
ucToday.setHours(0, 0, 0, 0);

function ucAddDays(date, days) {
  return new Date(date.getTime() + days * UC_DAY_MS);
}

function ucDaysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / UC_DAY_MS);
}

// MM/DD/YYYY, matching the developed app.
function ucFmtDate(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

/* Day counts for one compliance type. The last column is recorded / available
   days, and the bucket is derived from that same rounded value, so every row
   on a tab always shows a percentage inside that tab's range. */
function ucDayStats(totalAvailableDays, pct, seed) {
  const totalRecordedDays = Math.round((totalAvailableDays * pct) / 100);
  const totalUnrecordedDays = totalAvailableDays - totalRecordedDays;
  const nvrd = Math.min(totalRecordedDays, seed % 3);
  const daysWithJustification = Math.min(totalUnrecordedDays, (seed >>> 3) % 3);
  const value = totalAvailableDays ? Math.round((totalRecordedDays / totalAvailableDays) * 100) : 0;
  return { totalAvailableDays, totalRecordedDays, totalUnrecordedDays, nvrd, daysWithJustification, value, bucket: ucBucketOf(value) };
}

/* The population for an organization selection ("all" or org ids). Patient
   identity (username, dates, status) is shared by both compliance types;
   only the day counts and percentage differ, so flipping the type re-buckets
   the same population rather than inventing a new one. */
function buildCompliancePool(orgIds) {
  const ids = (orgIds || ["all"]).filter(Boolean);
  const isAllOrgs = ids.length === 0 || (ids.length === 1 && ids[0] === "all");
  const orgSeed = isAllOrgs ? 0 : mktHash(ids.slice().sort().join(","));
  const orgCode = isAllOrgs ? "COR" : (MKT_ORG_LIST.find((o) => o.id === ids[0])?.code || "COR");
  const total = isAllOrgs ? 759 : Math.max(20, mktScale(759, orgSeed, 0.5));

  return Array.from({ length: total }, (_, i) => {
    const username = `${orgCode}-${String(i + 1).padStart(4, "0")}`;
    const seed = ucMix(mktHash(username));

    const startDate = ucAddDays(ucToday, -(60 + (seed % 700)));
    const daysSinceStart = ucDaysBetween(startDate, ucToday);
    const isLeft = seed % 11 === 0;
    const leavingDate = isLeft ? ucAddDays(startDate, 30 + ((seed >>> 6) % (daysSinceStart - 45))) : null;
    const endDate = leavingDate || ucToday;
    const daysInStudy = ucDaysBetween(startDate, endDate);

    const overTimePct = ucPct(seed);
    const isInsufficient = overTimePct === 0;
    const currentPct = isInsufficient ? 0 : ucPct(ucMix(seed + 1));

    const status = isLeft ? "Left study" : isInsufficient ? "Insufficient data" : seed % 7 === 0 ? "Priority" : "Active";
    const statusStartDate = leavingDate || ucAddDays(startDate, (seed >>> 2) % daysInStudy);

    return {
      username,
      startDate: ucFmtDate(startDate),
      leavingDate: leavingDate ? ucFmtDate(leavingDate) : "",
      status,
      statusStartDate: ucFmtDate(statusStartDate),
      quality: ucDayStats(daysInStudy, overTimePct, seed),
      compliance: ucDayStats(Math.min(UC_CURRENT_WINDOW_DAYS, daysInStudy), currentPct, ucMix(seed + 2)),
    };
  });
}

/* Patients per range for one compliance type ("quality" | "compliance"),
   in UC_BUCKETS order. */
function compliancePoolCounts(pool, metric) {
  return UC_BUCKETS.map((b) => pool.filter((p) => p[metric].bucket === b.key).length);
}
