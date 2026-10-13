/* ---------------- Compliance drill-down ----------------
   Reached from the Screening dashboard's Compliance bins widget (clicking a
   bar, js/mkt-study.js renderMktBins) or the Summary dashboard's "View
   details" link (js/mkt-summary.js renderBins). The clicked bucket
   ("90-100", "80-89", "70-79", "60-69", "lt60") and compliance type
   ("quality" = Compliance Over Time | "compliance" = Current Compliance) are
   passed via the query string and pre-select the matching toggle/tab here,
   so the drill-down opens already filtered to what was clicked instead of
   dumping the whole study population on the user. */

const UC_BUCKETS = [
  { key: "90-100", min: 90, max: 100 },
  { key: "80-89", min: 80, max: 89 },
  { key: "70-79", min: 70, max: 79 },
  { key: "60-69", min: 60, max: 69 },
  { key: "lt60", min: -Infinity, max: 59 },
];

/* The Summary dashboard keys its bins "80-90" / "70-80" / "60-70" -- accept
   those too so a link built from any of its bins still lands on the right tab. */
const UC_BUCKET_ALIASES = { "80-90": "80-89", "70-80": "70-79", "60-70": "60-69" };

const UC_TYPES = {
  quality: { label: "Compliance Over Time", column: "Compliance over time" },
  compliance: { label: "Current Compliance", column: "Current compliance %" },
};

/* Current Compliance looks at the same trailing window the Summary
   dashboard's bins default to ("Last 31 days"); Compliance Over Time covers
   the patient's whole time in the study. */
const UC_CURRENT_WINDOW_DAYS = 31;
const UC_PAGE_SIZE = 10;

function ucBucketOf(pct) {
  return UC_BUCKETS.find((b) => pct >= b.min && pct <= b.max).key;
}

const params = new URLSearchParams(location.search);
const ucBucketParam = UC_BUCKET_ALIASES[params.get("bucket")] || params.get("bucket");
let ucMetric = params.get("metric") === "compliance" ? "compliance" : "quality";
let ucActiveBucket = UC_BUCKETS.some((b) => b.key === ucBucketParam) ? ucBucketParam : "90-100";
const ucOrgParam = (params.get("org") || "all").split(",").filter(Boolean);

// Reached from either the Screening dashboard's per-bucket bars or the Summary
// dashboard's "View details" link -- point the back arrow at whichever one sent us here.
if (params.get("from") === "summary") {
  document.getElementById("ucBackLink").href = "mkt-summary.html";
  document.getElementById("ucBackLabel").textContent = "Back to Summary";
  document.querySelectorAll("#dashboardPopover .bo-popover-item").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "mkt-summary.html");
  });
}

const isAllOrgs = ucOrgParam.length === 0 || (ucOrgParam.length === 1 && ucOrgParam[0] === "all");
const ucOrgSeed = isAllOrgs ? 0 : mktHash(ucOrgParam.slice().sort().join(","));
const ucOrgCode = isAllOrgs ? "COR" : (MKT_ORG_LIST.find((o) => o.id === ucOrgParam[0])?.code || "COR");

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

const ucTotal = isAllOrgs ? 759 : Math.max(20, mktScale(759, ucOrgSeed, 0.5));

/* Patient identity (username, dates, status) is shared by both compliance
   types; only the day counts and percentage differ, so flipping the type
   toggle re-buckets the same population rather than inventing a new one. */
const ucPool = Array.from({ length: ucTotal }, (_, i) => {
  const username = `${ucOrgCode}-${String(i + 1).padStart(4, "0")}`;
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

/* ---------------- Render ---------------- */

/* Status column color -- reuses the same .bo-status-pill classes/colors as
   the Patient Management table (Active=green, Priority=red, Baseline/Left
   study=gray, Insufficient data=orange) instead of inventing new colors. */
function ucStatusClass(status) {
  const map = { "Active": "active", "Priority": "priority", "Baseline": "baseline", "Left study": "left-study", "Insufficient data": "insufficient" };
  return map[status] || "";
}

function ucFilteredRows() {
  return ucPool.filter((p) => p[ucMetric].bucket === ucActiveBucket);
}

const ucPager = boCreatePager(
  "ucRows",
  () => ucFilteredRows().map((p, i) => ({ p, no: i + 1 })),
  ({ p, no }) => {
    const s = p[ucMetric];
    return `
      <tr>
        <td>${no}</td>
        <td>${p.username}</td>
        <td>${p.startDate}</td>
        <td>${p.leavingDate || "&mdash;"}</td>
        <td><span class="bo-status-pill ${ucStatusClass(p.status)}">${p.status}</span></td>
        <td>${p.statusStartDate}</td>
        <td>${s.totalAvailableDays}</td>
        <td>${s.totalRecordedDays}</td>
        <td>${s.totalUnrecordedDays}</td>
        <td>${s.nvrd}</td>
        <td>${s.daysWithJustification}</td>
        <td>${s.value}</td>
      </tr>`;
  },
  { pageSize: UC_PAGE_SIZE, emptyColspan: 12, emptyText: "No patients in this range." }
);

function renderUc() {
  const type = UC_TYPES[ucMetric];
  document.title = `HearO Backoffice | ${type.label}`;
  document.getElementById("ucTitle").textContent = type.label;
  document.getElementById("ucValueHead").textContent = type.column;

  const count = ucFilteredRows().length;
  document.getElementById("ucTotalLabel").textContent = `Total: ${count} patient${count === 1 ? "" : "s"}`;

  ucPager.resetPage();
  ucPager();
}

// Keeps the toggle/tabs and the URL in sync, so a refresh or shared link
// reopens the same type + bucket.
function ucApplyState() {
  document.querySelectorAll("#ucTypeToggle button").forEach((b) => b.classList.toggle("active", b.dataset.metric === ucMetric));
  document.querySelectorAll("#ucBucketTabs button").forEach((b) => b.classList.toggle("active", b.dataset.bucket === ucActiveBucket));
  const url = new URL(location.href);
  url.searchParams.set("metric", ucMetric);
  url.searchParams.set("bucket", ucActiveBucket);
  history.replaceState(null, "", url);
  renderUc();
}

// Switching the type keeps the selected bucket and reloads the list.
document.getElementById("ucTypeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.dataset.metric === ucMetric) return;
  ucMetric = btn.dataset.metric;
  ucApplyState();
});

document.getElementById("ucBucketTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn || btn.dataset.bucket === ucActiveBucket) return;
  ucActiveBucket = btn.dataset.bucket;
  ucApplyState();
});

ucApplyState();
