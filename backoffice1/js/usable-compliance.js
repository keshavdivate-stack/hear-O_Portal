/* ---------------- Compliance drill-down ----------------
   Reached from the "View details" link on the Screening dashboard's
   compliance section (js/mkt-study.js renderMktBins) or the Summary
   dashboard (js/mkt-summary.js renderBins). The bucket
   ("90-100", "80-89", "70-79", "60-69", "lt60") and compliance type
   ("quality" = Compliance Over Time | "compliance" = Current Compliance) are
   passed via the query string and pre-select the matching toggle/tab here,
   so the drill-down opens already filtered to what was clicked instead of
   dumping the whole study population on the user. */

/* The Summary dashboard keys its bins "80-90" / "70-80" / "60-70" -- accept
   those too so a link built from any of its bins still lands on the right tab. */
const UC_BUCKET_ALIASES = { "80-90": "80-89", "70-80": "70-79", "60-70": "60-69" };

const UC_TYPES = {
  quality: { label: "Compliance Over Time", column: "Compliance over time" },
  compliance: { label: "Current Compliance", column: "Current compliance %" },
};

const UC_PAGE_SIZE = 10;

const params = new URLSearchParams(location.search);
const ucBucketParam = UC_BUCKET_ALIASES[params.get("bucket")] || params.get("bucket");
let ucMetric = params.get("metric") === "compliance" ? "compliance" : "quality";
let ucActiveBucket = UC_BUCKETS.some((b) => b.key === ucBucketParam) ? ucBucketParam : "90-100";
const ucOrgParam = (params.get("org") || "all").split(",").filter(Boolean);

// Reached from either the Screening dashboard's "View details" link or the Summary
// dashboard's "View details" link -- point the back arrow at whichever one sent us here.
if (params.get("from") === "summary") {
  document.getElementById("ucBackLink").href = "mkt-summary.html";
  document.getElementById("ucBackLabel").textContent = "Back to Summary";
  document.querySelectorAll("#dashboardPopover .bo-popover-item").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "mkt-summary.html");
  });
}

/* Same population the Screening dashboard counts (js/compliance-pool.js),
   so each tab's total matches the number on the dashboard. */
const ucPool = buildCompliancePool(ucOrgParam);

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
