/* ---------------- Usable Compliance drill-down ----------------
   Reached by clicking a bar in the Study dashboard's Recording Quality /
   Compliance bins widget (js/mkt-study.js renderMktBins). The clicked
   bucket ("90-100", "80-89", "70-79", "60-69", "lt60") and metric
   ("quality"|"compliance") are passed via the query string and pre-select
   the matching tab here, so the drill-down opens already filtered to what
   was clicked instead of dumping the whole study population on the user. */

const UC_BUCKETS = [
  { key: "90-100", min: 90, max: 100 },
  { key: "80-89", min: 80, max: 89 },
  { key: "70-79", min: 70, max: 79 },
  { key: "60-69", min: 60, max: 69 },
  { key: "lt60", min: -Infinity, max: 59 },
];

function ucBucketOf(pct) {
  return UC_BUCKETS.find((b) => pct >= b.min && pct <= b.max).key;
}

const params = new URLSearchParams(location.search);
const ucMetric = params.get("metric") === "compliance" ? "compliance" : "quality";
const ucOrgParam = (params.get("org") || "all").split(",").filter(Boolean);
let ucActiveBucket = UC_BUCKETS.some((b) => b.key === params.get("bucket")) ? params.get("bucket") : "90-100";

const isAllOrgs = ucOrgParam.length === 0 || (ucOrgParam.length === 1 && ucOrgParam[0] === "all");
const ucOrgSeed = isAllOrgs ? 0 : mktHash(ucOrgParam.slice().sort().join(","));
const ucOrgCode = isAllOrgs ? "COR" : (MKT_ORG_LIST.find((o) => o.id === ucOrgParam[0])?.code || "COR");

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

const UC_MONTHS = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
function ucDate(seed, yearFloor) {
  const day = String(1 + (seed % 28)).padStart(2, "0");
  const month = UC_MONTHS[(seed >> 4) % 12];
  const year = yearFloor + ((seed >> 8) % 4);
  return `${day}/${month}/${String(year).slice(2)}`;
}

const ucTotal = isAllOrgs ? 759 : Math.max(20, mktScale(759, ucOrgSeed, 0.5));

const ucPool = Array.from({ length: ucTotal }, (_, i) => {
  const username = `${ucOrgCode}-${String(i + 1).padStart(4, "0")}`;
  const seed = mktHash(username);
  const qualityPct = ucPct(seed);
  const compliancePct = ucPct(seed >> 5);
  const pct = ucMetric === "compliance" ? compliancePct : qualityPct;

  const totalAvailableDays = 31;
  const totalRecordedDays = Math.round((totalAvailableDays * pct) / 100);
  const totalUnrecordedDays = totalAvailableDays - totalRecordedDays;
  const nvrd = totalRecordedDays > 0 ? seed % 3 : 0;
  const daysWithJustification = totalUnrecordedDays > 0 ? (seed >> 3) % 3 : 0;
  const usablePct = Math.max(0, Math.min(100, Math.round(((totalRecordedDays + daysWithJustification) / totalAvailableDays) * 100)));
  const compliancePctCol = Math.round((totalRecordedDays / totalAvailableDays) * 100);

  const startDate = ucDate(seed, 2020);
  const statusStartDate = ucDate(seed >> 2, 2021);
  const isLeft = seed % 11 === 0;
  const status = totalRecordedDays === 0 ? "Insufficient data" : isLeft ? "Left study" : seed % 7 === 0 ? "Priority" : "Active";

  return {
    username,
    startDate,
    leavingDate: isLeft ? ucDate(seed >> 6, 2023) : "",
    status,
    statusStartDate,
    totalAvailableDays,
    totalRecordedDays,
    totalUnrecordedDays,
    nvrd,
    daysWithJustification,
    compliancePctCol,
    usablePct,
    bucket: ucBucketOf(usablePct),
  };
});

/* ---------------- Render ---------------- */
function ucFormatRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `Last 31 Days: ${fmt(start)} - ${fmt(end)}`;
}

document.getElementById("ucRangeLabel").textContent = ucFormatRange();
document.getElementById("ucTotalLabel").textContent = `Total: ${ucTotal} patients`;

function renderUcTable() {
  const rows = ucPool.filter((p) => p.bucket === ucActiveBucket);
  document.getElementById("ucRows").innerHTML = rows
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.username}</td>
        <td>${p.startDate}</td>
        <td>${p.leavingDate}</td>
        <td>${p.status}</td>
        <td>${p.statusStartDate}</td>
        <td>${p.totalAvailableDays}</td>
        <td>${p.totalRecordedDays}</td>
        <td>${p.totalUnrecordedDays}</td>
        <td>${p.nvrd}</td>
        <td>${p.daysWithJustification}</td>
        <td>${p.compliancePctCol}</td>
        <td>${p.usablePct}</td>
      </tr>`
    )
    .join("") || `<tr><td colspan="13" style="text-align:center; color:var(--gray-text); padding:24px;">No patients in this range.</td></tr>`;
}

function ucSetActiveTab(bucket) {
  ucActiveBucket = bucket;
  document.querySelectorAll("#ucBucketTabs button").forEach((b) => b.classList.toggle("active", b.dataset.bucket === bucket));
  const url = new URL(location.href);
  url.searchParams.set("bucket", bucket);
  history.replaceState(null, "", url);
  renderUcTable();
}

document.getElementById("ucBucketTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  ucSetActiveTab(btn.dataset.bucket);
});

ucSetActiveTab(ucActiveBucket);
