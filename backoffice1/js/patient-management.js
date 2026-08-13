/* ---------------- Data ---------------- */
const patients = [
  { username: "120-2001", lang: "HE", tag: "CUR", status: "Registered", statusStart: "31/10/2023", lastSession: "25/09/2024", usableCompliance: 91.82, compliance: 92.12 },
  { username: "120-2002", lang: "EN", tag: "CUR", status: "Registered", statusStart: "02/11/2023", lastSession: "25/09/2024", usableCompliance: 72.26, compliance: 72.26 },
  { username: "120-2003", lang: "HE", tag: "CUR", status: "Registered", statusStart: "12/11/2023", lastSession: "12/11/2023", usableCompliance: null, compliance: null },
  { username: "120-2004", lang: "HE", tag: "CUR", status: "Active", statusStart: "13/11/2023", lastSession: "11/02/2024", usableCompliance: 100, compliance: 100 },
  { username: "120-2005", lang: "HE", tag: "CUR", status: "Active", statusStart: "20/11/2023", lastSession: "18/12/2023", usableCompliance: 67.86, compliance: 67.86 },
  { username: "120-2006", lang: "HE", tag: "CUR", status: "Paused", statusStart: "20/11/2023", lastSession: "05/12/2023", usableCompliance: 0, compliance: null },
  { username: "120-2007", lang: "HE", tag: "CUR", status: "Priority", statusStart: "23/11/2023", lastSession: "10/07/2024", usableCompliance: 56.23, compliance: 57.74 },
  { username: "121-2001", lang: "AR", tag: "CUR", status: "Active", statusStart: "05/01/2024", lastSession: "20/09/2024", usableCompliance: 88.4, compliance: 89.1 },
  { username: "121-2002", lang: "AR", tag: "CUR", status: "Registered", statusStart: "07/01/2024", lastSession: "07/01/2024", usableCompliance: null, compliance: null },
  { username: "122-2001", lang: "EN", tag: "CUR", status: "Priority", statusStart: "11/02/2024", lastSession: "21/09/2024", usableCompliance: 41.3, compliance: 44.9 },
];

patients.forEach((p, i) => (p.id = i));

/* ---------------- State ---------------- */
const PATIENT_PAGE_SIZE = 20;
let patientCurrentPage = 1;
let patientSortDir = "asc";
let patientSearchTerm = "";
let patientStatusFilter = "";
let patientSiteFilter = "";

/* ---------------- Filter options ---------------- */
const siteCodes = [...new Set(patients.map((p) => p.username.split("-")[0]))];
document.getElementById("clinicalSiteFilter").insertAdjacentHTML(
  "beforeend",
  siteCodes.map((c) => `<option value="${c}">${c}</option>`).join("")
);

function filteredPatients() {
  return patients.filter((p) => {
    if (patientSiteFilter && !p.username.startsWith(patientSiteFilter)) return false;
    if (patientStatusFilter && p.status !== patientStatusFilter) return false;
    if (patientSearchTerm && !p.username.toLowerCase().includes(patientSearchTerm)) return false;
    return true;
  });
}

function sortedPatients() {
  const list = [...filteredPatients()];
  list.sort((a, b) => (patientSortDir === "asc" ? a.username.localeCompare(b.username, undefined, { numeric: true }) : b.username.localeCompare(a.username, undefined, { numeric: true })));
  return list;
}

/* ---------------- Render ---------------- */
const pct = (v) => (v === null || v === undefined ? "—" : `${v}%`);
const bellIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 20.5C10 21.3 10.9 21.8 12 21.8C13.1 21.8 14 21.3 14.5 20.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const editIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

function statusClass(status) {
  return status.toLowerCase();
}

function renderPatients() {
  const list = sortedPatients();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PATIENT_PAGE_SIZE));
  patientCurrentPage = Math.min(patientCurrentPage, totalPages);

  const start = (patientCurrentPage - 1) * PATIENT_PAGE_SIZE;
  const pageItems = list.slice(start, start + PATIENT_PAGE_SIZE);

  document.getElementById("patientRows").innerHTML = pageItems
    .map(
      (p) => `
      <tr>
        <td><span class="bo-name-link">${p.username}</span></td>
        <td>${p.lang}</td>
        <td>${p.tag}</td>
        <td><span class="bo-status-pill ${statusClass(p.status)}">${p.status}</span></td>
        <td>${p.statusStart}</td>
        <td>${p.lastSession}</td>
        <td>${pct(p.usableCompliance)}</td>
        <td>${pct(p.compliance)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon" data-id="${p.id}" aria-label="Notify">${bellIcon}</button>
            <button class="bo-action-icon" data-id="${p.id}" aria-label="Edit">${editIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + PATIENT_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("patientPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("patientFirstPage").disabled = patientCurrentPage === 1;
  document.getElementById("patientPrevPage").disabled = patientCurrentPage === 1;
  document.getElementById("patientNextPage").disabled = patientCurrentPage === totalPages;
  document.getElementById("patientLastPage").disabled = patientCurrentPage === totalPages;
}

renderPatients();

/* ---------------- Search & filters ---------------- */
document.getElementById("patientSearchInput").addEventListener("input", (e) => {
  patientSearchTerm = e.target.value.trim().toLowerCase();
  patientCurrentPage = 1;
  renderPatients();
});

function syncFilterSelectStyle(select) {
  select.classList.toggle("has-value", select.value !== "");
}

document.getElementById("clinicalSiteFilter").addEventListener("change", (e) => {
  patientSiteFilter = e.target.value;
  syncFilterSelectStyle(e.target);
  patientCurrentPage = 1;
  renderPatients();
});

document.getElementById("statusFilter").addEventListener("change", (e) => {
  patientStatusFilter = e.target.value;
  syncFilterSelectStyle(e.target);
  patientCurrentPage = 1;
  renderPatients();
});

document.getElementById("hmoToggle").addEventListener("change", (e) => {
  patientSiteFilter = "";
  const siteSelect = document.getElementById("clinicalSiteFilter");
  siteSelect.value = "";
  syncFilterSelectStyle(siteSelect);
  patientCurrentPage = 1;
  renderPatients();
});

/* ---------------- Sort ---------------- */
document.querySelector("#patientTable th.sortable").addEventListener("click", () => {
  patientSortDir = patientSortDir === "asc" ? "desc" : "asc";
  renderPatients();
});

/* ---------------- Pagination ---------------- */
document.getElementById("patientFirstPage").addEventListener("click", () => { patientCurrentPage = 1; renderPatients(); });
document.getElementById("patientPrevPage").addEventListener("click", () => { patientCurrentPage -= 1; renderPatients(); });
document.getElementById("patientNextPage").addEventListener("click", () => { patientCurrentPage += 1; renderPatients(); });
document.getElementById("patientLastPage").addEventListener("click", () => {
  patientCurrentPage = Math.ceil(filteredPatients().length / PATIENT_PAGE_SIZE);
  renderPatients();
});
