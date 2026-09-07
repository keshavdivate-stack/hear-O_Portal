/* ---------------- Terms & Conditions ---------------- */
const TC_PAGE_SIZE = 10;

document.getElementById("tcUserTypeFilter").insertAdjacentHTML(
  "beforeend",
  TC_USER_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")
);
document.getElementById("tcDocTypeFilter").insertAdjacentHTML(
  "beforeend",
  TC_DOC_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")
);
document.getElementById("tcOrgFilter").insertAdjacentHTML(
  "beforeend",
  TC_ORGS.map((o) => `<option value="${o}">${o}</option>`).join("")
);

let tcUserTypeFilter = "";
let tcUserSearch = "";
let tcDocTypeFilter = "";
let tcOrgFilter = "";
let tcFromDate = "";
let tcToDate = "";

function tcFormatDateTime(iso) {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y.slice(2)} | ${timePart.slice(0, 5)}`;
}

function tcFiltered() {
  return termsConditionsLog.filter((e) => {
    if (tcUserTypeFilter && e.userType !== tcUserTypeFilter) return false;
    if (tcDocTypeFilter && e.docType !== tcDocTypeFilter) return false;
    if (tcOrgFilter && e.org !== tcOrgFilter) return false;
    if (tcUserSearch && !e.user.toLowerCase().includes(tcUserSearch.toLowerCase())) return false;
    if (tcFromDate && e.signedAt.slice(0, 10) < tcFromDate) return false;
    if (tcToDate && e.signedAt.slice(0, 10) > tcToDate) return false;
    return true;
  }).sort((a, b) => (a.signedAt < b.signedAt ? 1 : -1));
}

const eyeIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;

const tcPager = boCreatePager(
  "tcRows",
  tcFiltered,
  (e, i) => `
    <tr>
      <td>${e.user}</td>
      <td>${e.docType}</td>
      <td>${e.docPath}</td>
      <td>${e.org}</td>
      <td>${tcFormatDateTime(e.signedAt)}</td>
      <td>
        <button type="button" class="bo-action-icon blue" data-tc-view="${i}" aria-label="View document" title="View document">${eyeIcon}</button>
      </td>
    </tr>`,
  { pageSize: TC_PAGE_SIZE, emptyColspan: 6, emptyText: "No signed documents found for the selected filters." }
);

/* boCreatePager slices the already-filtered/sorted list before handing rows
   to the row renderer, so `i` above is a page-local index -- re-derive the
   matching record from the current filtered list by document identity
   (user + docType + signedAt is unique per row) rather than trusting `i`
   as a global index into termsConditionsLog. */
document.getElementById("tcRows").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-tc-view]");
  if (!btn) return;
  const row = tcFiltered()[Number(btn.dataset.tcView)];
  if (row) openTcDocModal(row);
});

tcPager();

document.querySelectorAll("#tcUserTypeFilter, #tcDocTypeFilter, #tcOrgFilter").forEach((select) => {
  select.addEventListener("change", () => select.classList.toggle("has-value", select.value !== ""));
});

document.getElementById("tcApplyBtn").addEventListener("click", () => {
  tcUserTypeFilter = document.getElementById("tcUserTypeFilter").value;
  tcUserSearch = document.getElementById("tcUserSearch").value;
  tcDocTypeFilter = document.getElementById("tcDocTypeFilter").value;
  tcOrgFilter = document.getElementById("tcOrgFilter").value;
  tcFromDate = document.getElementById("tcFromDate").value;
  tcToDate = document.getElementById("tcToDate").value;
  tcPager.resetPage();
  tcPager();
});

/* ---------------- "View document" modal ---------------- */
const tcDocOverlay = document.getElementById("tcDocOverlay");
const tcDocTitle = document.getElementById("tcDocTitle");
const tcDocBody = document.getElementById("tcDocBody");

function openTcDocModal(row) {
  tcDocTitle.textContent = row.docPath;
  tcDocBody.innerHTML = TC_DOCUMENT_BODY[row.docType] || "<p>No preview available for this document.</p>";
  tcDocBody.scrollTop = 0;
  tcDocOverlay.classList.add("open");
}

function closeTcDocModal() {
  tcDocOverlay.classList.remove("open");
}

tcDocOverlay.addEventListener("click", (e) => {
  if (e.target === tcDocOverlay) closeTcDocModal();
});
document.getElementById("tcDocCancelBtn").addEventListener("click", closeTcDocModal);
document.getElementById("tcDocCloseX").addEventListener("click", closeTcDocModal);
