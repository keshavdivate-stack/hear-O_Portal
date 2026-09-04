/* ---------------- B01 Clinic Portal: Status ---------------- */
document.getElementById("clinicOrgLabel").textContent = new URLSearchParams(location.search).get("org") || "B01";

const STATUS_PAGE_SIZE = 20;
let statusActiveTab = "Priority";
let statusSearchTerm = "";
let statusCurrentPage = 1;

function statusFilteredRows() {
  const rows = clinicPatientsByStatus(statusActiveTab);
  if (!statusSearchTerm) return rows;
  return rows.filter((p) => p.id.toLowerCase().includes(statusSearchTerm));
}

function renderStatusTable() {
  const rows = statusFilteredRows();
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / STATUS_PAGE_SIZE));
  statusCurrentPage = Math.min(statusCurrentPage, totalPages);

  const start = (statusCurrentPage - 1) * STATUS_PAGE_SIZE;
  const pageItems = rows.slice(start, start + STATUS_PAGE_SIZE);

  document.getElementById("statusRows").innerHTML = pageItems
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${clinicFmtDMY2(p.enrollmentDate)}</td>
        <td>${clinicStatusBadgeHtml(p.status)}</td>
        <td>${clinicFmtDMY2(p.statusSince)}</td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + STATUS_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("statusPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("statusFirstPage").disabled = statusCurrentPage === 1;
  document.getElementById("statusPrevPage").disabled = statusCurrentPage === 1;
  document.getElementById("statusNextPage").disabled = statusCurrentPage === totalPages;
  document.getElementById("statusLastPage").disabled = statusCurrentPage === totalPages;
}

document.getElementById("statusSubtabs").addEventListener("click", (e) => {
  const tab = e.target.closest(".subtab");
  if (!tab) return;
  document.querySelectorAll("#statusSubtabs .subtab").forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  statusActiveTab = tab.dataset.status;
  statusCurrentPage = 1;
  renderStatusTable();
});

document.getElementById("statusSearchInput").addEventListener("input", (e) => {
  statusSearchTerm = e.target.value.trim().toLowerCase();
  statusCurrentPage = 1;
  renderStatusTable();
});

document.getElementById("statusFirstPage").addEventListener("click", () => { statusCurrentPage = 1; renderStatusTable(); });
document.getElementById("statusPrevPage").addEventListener("click", () => { statusCurrentPage -= 1; renderStatusTable(); });
document.getElementById("statusNextPage").addEventListener("click", () => { statusCurrentPage += 1; renderStatusTable(); });
document.getElementById("statusLastPage").addEventListener("click", () => {
  statusCurrentPage = Math.max(1, Math.ceil(statusFilteredRows().length / STATUS_PAGE_SIZE));
  renderStatusTable();
});

renderStatusTable();
