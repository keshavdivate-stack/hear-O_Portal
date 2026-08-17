/* ---------------- Data ---------------- */
/* start dates stored ISO (YYYY-MM-DD) so From/To date filters compare correctly */
const statusChanges = [
  { username: "ABC-1252", type: "Status", prev: "Active", next: "Priority", start: "2026-07-04", days: 3, by: "System" },
  { username: "ABC-1254", type: "Monitoring", prev: "Monitored", next: "Unmonitored", start: "2026-06-30", days: 7, by: "ayelet_clinic" },
  { username: "ABC-1254", type: "Account", prev: "Enabled", next: "Paused", start: "2026-06-30", days: 7, by: "ayelet_clinic" },
  { username: "ABC-1238", type: "Monitoring", prev: "Monitored", next: "Unmonitored", start: "2026-06-25", days: 6, by: "System" },
  { username: "ABC-1242", type: "Status", prev: "Registered", next: "Baseline", start: "2026-06-24", days: 2, by: "System" },
  { username: "ABC-1283", type: "Account", prev: "Enabled", next: "Discontinued", start: "2026-06-24", days: 13, by: "ayelet_clinic" },
  { username: "ABC-1283", type: "Status", prev: "Priority", next: "Active", start: "2026-06-23", days: 2, by: "System" },
];

const formatDate = (iso) => iso.split("-").reverse().join("/");

statusChanges.forEach((s, i) => (s.id = i));

/* ---------------- State ---------------- */
const SC_PAGE_SIZE = 20;
let scCurrentPage = 1;
let scSiteFilter = "";
let scStatusToFilter = "";
let scSearchTerm = "";
let scFromDate = "";
let scToDate = "";

/* ---------------- Filter options ---------------- */
const scSiteCodes = [...new Set(statusChanges.map((s) => s.username.split("-")[0]))];
document.getElementById("scSiteFilter").insertAdjacentHTML(
  "beforeend",
  scSiteCodes.map((c) => `<option value="${c}">${c}</option>`).join("")
);

const scStatusOptions = [...new Set(statusChanges.map((s) => s.next))];
document.getElementById("scStatusToFilter").insertAdjacentHTML(
  "beforeend",
  scStatusOptions.map((s) => `<option value="${s}">${s}</option>`).join("")
);

function scFilteredRows() {
  return statusChanges.filter((s) => {
    if (scSiteFilter && !s.username.startsWith(scSiteFilter)) return false;
    if (scStatusToFilter && s.next !== scStatusToFilter) return false;
    if (scSearchTerm && !s.username.toLowerCase().includes(scSearchTerm)) return false;
    if (scFromDate && s.start < scFromDate) return false;
    if (scToDate && s.start > scToDate) return false;
    return true;
  });
}

/* ---------------- Render ---------------- */
function scStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-").replace("insufficient-data", "insufficient");
}

function scCell(type, value) {
  if (!value) return "";
  return type === "Status"
    ? `<span class="bo-sc-badge ${scStatusClass(value)}">${value}</span>`
    : value;
}

function renderStatusChanges() {
  const list = scFilteredRows();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / SC_PAGE_SIZE));
  scCurrentPage = Math.min(scCurrentPage, totalPages);

  const start = (scCurrentPage - 1) * SC_PAGE_SIZE;
  const pageItems = list.slice(start, start + SC_PAGE_SIZE);

  document.getElementById("statusChangeRows").innerHTML = pageItems
    .map(
      (s) => `
      <tr>
        <td><span class="bo-name-link">${s.username}</span></td>
        <td>${s.type}</td>
        <td>${scCell(s.type, s.prev)}</td>
        <td>${scCell(s.type, s.next)}</td>
        <td>${formatDate(s.start)}</td>
        <td>${s.days}</td>
        <td>${s.by}</td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + SC_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("scPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("scFirstPage").disabled = scCurrentPage === 1;
  document.getElementById("scPrevPage").disabled = scCurrentPage === 1;
  document.getElementById("scNextPage").disabled = scCurrentPage === totalPages;
  document.getElementById("scLastPage").disabled = scCurrentPage === totalPages;
}

renderStatusChanges();

/* ---------------- Filters ---------------- */
function scSyncSelectStyle(select) {
  select.classList.toggle("has-value", select.value !== "");
}

document.getElementById("scSiteFilter").addEventListener("change", (e) => {
  scSiteFilter = e.target.value;
  scSyncSelectStyle(e.target);
});

document.getElementById("scStatusToFilter").addEventListener("change", (e) => {
  scStatusToFilter = e.target.value;
  scSyncSelectStyle(e.target);
});

document.getElementById("scSearchInput").addEventListener("input", (e) => {
  scSearchTerm = e.target.value.trim().toLowerCase();
});

document.getElementById("scFromDate").addEventListener("change", (e) => { scFromDate = e.target.value; });
document.getElementById("scToDate").addEventListener("change", (e) => { scToDate = e.target.value; });

document.getElementById("scApplyBtn").addEventListener("click", () => {
  scCurrentPage = 1;
  renderStatusChanges();
});

/* ---------------- Pagination ---------------- */
document.getElementById("scFirstPage").addEventListener("click", () => { scCurrentPage = 1; renderStatusChanges(); });
document.getElementById("scPrevPage").addEventListener("click", () => { scCurrentPage -= 1; renderStatusChanges(); });
document.getElementById("scNextPage").addEventListener("click", () => { scCurrentPage += 1; renderStatusChanges(); });
document.getElementById("scLastPage").addEventListener("click", () => {
  scCurrentPage = Math.ceil(scFilteredRows().length / SC_PAGE_SIZE);
  renderStatusChanges();
});
