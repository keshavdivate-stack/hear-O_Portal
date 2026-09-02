/* ---------------- State ---------------- */
const PATIENT_PAGE_SIZE = 20;
let patientCurrentPage = 1;
let patientSortDir = "asc";
let patientSearchTerm = "";
let patientStatusFilter = "";
let patientSiteFilter = "";
let patientTagFilter = "";
let patientLanguageFilter = "";
let patientActiveFilter = "";
let patientAppVersionFilter = "";
let patientPhoneModelFilter = "";
let patientLastSessionUpTo = "";
/* Study / Commercial / R&D toggles -- multiple can be on at once (e.g. Study
   + Commercial together); none checked means no org-type filter is applied
   at all, same "off = unfiltered" behavior the old scope toggles had. */
const patientOrgTypeToggles = new Set();

/* ---------------- Filter options ---------------- */
const siteCodes = [...new Set(patients.map((p) => p.username.split("-")[0]))];
document.getElementById("clinicalSiteFilter").insertAdjacentHTML(
  "beforeend",
  siteCodes.map((c) => `<option value="${c}">${c}</option>`).join("")
);
document.getElementById("tagFilter").insertAdjacentHTML(
  "beforeend",
  PATIENT_TAGS.map((t) => `<option value="${t}">${t}</option>`).join("")
);
document.getElementById("languageFilter").insertAdjacentHTML(
  "beforeend",
  PATIENT_LANGUAGES.map((l) => `<option value="${l}">${l}</option>`).join("")
);

function dmyToIso(s) {
  const [d, m, y] = s.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function filteredPatients() {
  return patients.filter((p) => {
    if (patientOrgTypeToggles.size && !patientOrgTypeToggles.has(patientOrgType(p))) return false;
    if (patientSiteFilter && !p.username.startsWith(patientSiteFilter)) return false;
    if (patientTagFilter && p.tag !== patientTagFilter) return false;
    if (patientLanguageFilter && p.lang !== patientLanguageFilter) return false;
    if (patientStatusFilter && p.status !== patientStatusFilter) return false;
    if (patientActiveFilter && (p.active ? "yes" : "no") !== patientActiveFilter) return false;
    if (patientAppVersionFilter && !p.appVersion.toLowerCase().includes(patientAppVersionFilter)) return false;
    if (patientPhoneModelFilter && !p.phoneModel.toLowerCase().includes(patientPhoneModelFilter)) return false;
    if (patientLastSessionUpTo && dmyToIso(p.lastSession) > patientLastSessionUpTo) return false;
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
const patientKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

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
        <td><a class="bo-name-link" href="patient-health-dashboard.html?patient=${p.username}">${p.username}</a></td>
        <td><input type="checkbox" class="bo-table-checkbox" ${p.algo ? "checked" : ""} disabled aria-label="Algo enabled" /></td>
        <td>${p.lang}</td>
        <td>${p.tag}</td>
        <td>${p.creationDate || "—"}</td>
        <td>${p.startDate || "—"}</td>
        <td>${p.baselineCompletedDate || "—"}</td>
        <td>${p.followUpDate || "—"}</td>
        <td>${p.leavingDate || "—"}</td>
        <td><span class="bo-status-pill ${statusClass(p.status)}">${p.status}</span></td>
        <td>${p.statusStart}</td>
        <td>${p.lastAppVersion || "—"}</td>
        <td>${p.lastPhoneModel || "—"}</td>
        <td>${p.lastSession}</td>
        <td>${p.lastSignIn || "—"}</td>
        <td>${pct(p.usableCompliance)}</td>
        <td>${pct(p.compliance)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${p.id}" aria-label="Row actions">${patientKebabIcon}</button>
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

/* ---------------- Filters (staged, applied on Apply click) ---------------- */
function syncFilterSelectStyle(select) {
  select.classList.toggle("has-value", select.value !== "");
}

document.querySelectorAll(".bo-filter-select").forEach((select) => {
  select.addEventListener("change", () => syncFilterSelectStyle(select));
});

document.getElementById("patientApplyBtn").addEventListener("click", () => {
  patientSiteFilter = document.getElementById("clinicalSiteFilter").value;
  patientTagFilter = document.getElementById("tagFilter").value;
  patientLanguageFilter = document.getElementById("languageFilter").value;
  patientStatusFilter = document.getElementById("statusFilter").value;
  patientActiveFilter = document.getElementById("activeFilter").value;
  patientAppVersionFilter = document.getElementById("appVersionFilter").value.trim().toLowerCase();
  patientPhoneModelFilter = document.getElementById("phoneModelFilter").value.trim().toLowerCase();
  patientLastSessionUpTo = document.getElementById("lastSessionUpToFilter").value;
  patientSearchTerm = document.getElementById("patientSearchInput").value.trim().toLowerCase();
  patientCurrentPage = 1;
  renderPatients();
});

/* ---------------- Organization type toggles (apply immediately) ---------------- */
document.querySelectorAll("[data-org-type]").forEach((toggle) => {
  toggle.addEventListener("change", (e) => {
    if (e.target.checked) patientOrgTypeToggles.add(toggle.dataset.orgType);
    else patientOrgTypeToggles.delete(toggle.dataset.orgType);
    patientCurrentPage = 1;
    renderPatients();
  });
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

/* ---------------- Row action dropdown (notify / edit) ---------------- */
const patientRowMenu = document.getElementById("patientRowMenu");
let activePatientRowId = null;

document.getElementById("patientRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activePatientRowId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  patientRowMenu.style.top = `${rect.bottom + 6}px`;
  patientRowMenu.style.left = `${rect.right - 190}px`;
  patientRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!patientRowMenu.contains(e.target)) patientRowMenu.classList.remove("open");
});

patientRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activePatientRowId === null) return;
  patientRowMenu.classList.remove("open");
});
