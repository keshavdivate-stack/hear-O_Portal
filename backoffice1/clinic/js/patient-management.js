/* ---------------- B01 Clinic Portal: Patient Management ---------------- */
document.getElementById("clinicOrgLabel").textContent = new URLSearchParams(location.search).get("org") || "B01";

const PM_PAGE_SIZE = 20;
let pmSearchTerm = "";
let pmCurrentPage = 1;

const pmEyeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12S5.5 5 12 5s10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>`;

function pmFilteredRows() {
  if (!pmSearchTerm) return CLINIC_PATIENTS;
  return CLINIC_PATIENTS.filter((p) => p.id.toLowerCase().includes(pmSearchTerm));
}

function renderPmTable() {
  const rows = pmFilteredRows();
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / PM_PAGE_SIZE));
  pmCurrentPage = Math.min(pmCurrentPage, totalPages);

  const start = (pmCurrentPage - 1) * PM_PAGE_SIZE;
  const pageItems = rows.slice(start, start + PM_PAGE_SIZE);

  document.getElementById("pmRows").innerHTML = pageItems
    .map(
      (p) => `
      <tr>
        <td>${p.id}</td>
        <td>${clinicFmtDMY4(p.enrollmentDate)}</td>
        <td>${clinicStatusBadgeHtml(p.status)}</td>
        <td>${clinicFmtDMY4(p.statusSince)}</td>
        <td>
          <div class="b01-row-actions">
            <button type="button" class="b01-row-icon-btn" title="View Patient" aria-label="View ${p.id}">${pmEyeIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + PM_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("pmPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("pmFirstPage").disabled = pmCurrentPage === 1;
  document.getElementById("pmPrevPage").disabled = pmCurrentPage === 1;
  document.getElementById("pmNextPage").disabled = pmCurrentPage === totalPages;
  document.getElementById("pmLastPage").disabled = pmCurrentPage === totalPages;
}

document.getElementById("pmSearchInput").addEventListener("input", (e) => {
  pmSearchTerm = e.target.value.trim().toLowerCase();
  pmCurrentPage = 1;
  renderPmTable();
});

document.getElementById("pmFirstPage").addEventListener("click", () => { pmCurrentPage = 1; renderPmTable(); });
document.getElementById("pmPrevPage").addEventListener("click", () => { pmCurrentPage -= 1; renderPmTable(); });
document.getElementById("pmNextPage").addEventListener("click", () => { pmCurrentPage += 1; renderPmTable(); });
document.getElementById("pmLastPage").addEventListener("click", () => {
  pmCurrentPage = Math.max(1, Math.ceil(pmFilteredRows().length / PM_PAGE_SIZE));
  renderPmTable();
});

renderPmTable();
