/* ---------------- Tabs ---------------- */
document.querySelectorAll("#allocTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#allocTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Filter options ---------------- */
const allocSites = ["B01", "101", "104", "B03", "105"];
document.getElementById("allocSiteFilterMenu").innerHTML = buildBoSelectOptions(allocSites);

const allocConfigs = ["Main New8 no HQ Sensors Train 4.0 Zaza", "Main New8 HQ Sensors Train 4.0", "Legacy Config 3.2"];
document.getElementById("allocConfigFilterMenu").innerHTML = buildBoSelectOptions(allocConfigs);

const allocLangs = ["EN", "HE", "AR", "ES"];
document.getElementById("allocLangFilterMenu").innerHTML = buildBoSelectOptions(allocLangs);

/* ---------------- Current patients ---------------- */
const ALLOC_PAGE_SIZE = 10;
const allocEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`;

const currentPatients = [
  { id: 0, username: "120-2001", language: "HE", creationDate: "31/10/2023", startDate: "31/10/2023", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "09/02/2025 21:20:14" },
  { id: 1, username: "120-2002", language: "EN", creationDate: "02/11/2023", startDate: "02/11/2023", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "11/03/2025 09:12:44" },
  { id: 2, username: "120-2003", language: "HE", creationDate: "12/11/2023", startDate: "13/11/2023", appConfig: "Legacy Config 3.2", lastModified: "05/01/2025 16:40:02" },
  { id: 3, username: "121-2001", language: "AR", creationDate: "05/01/2024", startDate: "05/01/2024", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "20/09/2024 12:05:31" },
  { id: 4, username: "121-2002", language: "AR", creationDate: "07/01/2024", startDate: "07/01/2024", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "07/01/2024 08:00:00" },
  { id: 5, username: "122-2001", language: "EN", creationDate: "11/02/2024", startDate: "11/02/2024", appConfig: "Legacy Config 3.2", lastModified: "21/09/2024 14:22:10" },
  { id: 6, username: "104-3001", language: "ES", creationDate: "18/02/2024", startDate: "19/02/2024", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "02/10/2024 10:15:00" },
  { id: 7, username: "104-3002", language: "ES", creationDate: "22/02/2024", startDate: "22/02/2024", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "15/11/2024 17:30:00" },
  { id: 8, username: "B03-4001", language: "HE", creationDate: "01/03/2024", startDate: "01/03/2024", appConfig: "Legacy Config 3.2", lastModified: "01/03/2024 09:00:00" },
  { id: 9, username: "B03-4002", language: "EN", creationDate: "04/03/2024", startDate: "05/03/2024", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "19/12/2024 13:45:00" },
  { id: 10, username: "105-5001", language: "AR", creationDate: "10/03/2024", startDate: "10/03/2024", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "03/02/2025 11:00:00" },
  { id: 11, username: "105-5002", language: "ES", creationDate: "14/03/2024", startDate: "15/03/2024", appConfig: "Legacy Config 3.2", lastModified: "14/03/2024 08:30:00" },
];

let allocSiteFilterValue = "";
let allocConfigFilterValue = "";
let allocLangFilterValue = "";
let allocSearchTerm = "";

function filteredCurrentPatients() {
  return currentPatients.filter((p) => {
    if (allocSiteFilterValue && !p.username.startsWith(allocSiteFilterValue)) return false;
    if (allocConfigFilterValue && p.appConfig !== allocConfigFilterValue) return false;
    if (allocLangFilterValue && p.language !== allocLangFilterValue) return false;
    if (allocSearchTerm && !p.username.toLowerCase().includes(allocSearchTerm)) return false;
    return true;
  });
}

const allocCurrentPager = boCreatePager(
  "allocCurrentRows",
  () => filteredCurrentPatients().map((r, i) => ({ r, i })),
  (e) => `
    <tr>
      <td>${e.r.username}</td>
      <td>${e.r.language}</td>
      <td>${e.r.creationDate}</td>
      <td>${e.r.startDate}</td>
      <td>${e.r.appConfig}</td>
      <td>${e.r.lastModified}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon alloc-edit-btn" data-scope="current" data-id="${e.r.id}" aria-label="Edit">${allocEditIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: ALLOC_PAGE_SIZE, emptyColspan: 7, emptyText: "No patients found." }
);
allocCurrentPager();

document.getElementById("allocSiteFilter").addEventListener("change", (e) => {
  allocSiteFilterValue = e.target.value;
  allocCurrentPager.resetPage();
  allocCurrentPager();
});
document.getElementById("allocConfigFilter").addEventListener("change", (e) => {
  allocConfigFilterValue = e.target.value;
  allocCurrentPager.resetPage();
  allocCurrentPager();
});
document.getElementById("allocLangFilter").addEventListener("change", (e) => {
  allocLangFilterValue = e.target.value;
  allocCurrentPager.resetPage();
  allocCurrentPager();
});
document.getElementById("allocSearchInput").addEventListener("input", (e) => {
  allocSearchTerm = e.target.value.trim().toLowerCase();
  allocCurrentPager.resetPage();
  allocCurrentPager();
});

/* ---------------- Future patients ---------------- */
const futurePatients = [
  { id: 0, name: "MKT", isHmo: false, dateCreated: "14/08/2019", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "09/02/2025 21:20:14" },
  { id: 1, name: "120", isHmo: true, dateCreated: "06/06/2023", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "12/03/2025 10:05:22" },
  { id: 2, name: "121", isHmo: true, dateCreated: "06/06/2023", appConfig: "Legacy Config 3.2", lastModified: "01/01/2025 08:00:00" },
  { id: 3, name: "ATP", isHmo: false, dateCreated: "14/08/2019", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "20/11/2024 15:40:10" },
  { id: 4, name: "B01", isHmo: true, dateCreated: "26/06/2024", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "05/02/2025 09:20:00" },
  { id: 5, name: "104", isHmo: false, dateCreated: "12/06/2023", appConfig: "Legacy Config 3.2", lastModified: "17/09/2024 13:11:00" },
  { id: 6, name: "B03", isHmo: true, dateCreated: "24/04/2022", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "22/10/2024 11:30:00" },
  { id: 7, name: "105", isHmo: false, dateCreated: "03/05/2022", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "30/01/2025 16:05:00" },
  { id: 8, name: "MKT B01", isHmo: true, dateCreated: "11/03/2021", appConfig: "Legacy Config 3.2", lastModified: "18/12/2024 14:25:00" },
  { id: 9, name: "ASF", isHmo: false, dateCreated: "11/03/2021", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "09/04/2025 12:00:00" },
  { id: 10, name: "240", isHmo: true, dateCreated: "24/04/2022", appConfig: "Main New8 HQ Sensors Train 4.0", lastModified: "27/02/2025 10:45:00" },
  { id: 11, name: "241", isHmo: false, dateCreated: "03/05/2022", appConfig: "Legacy Config 3.2", lastModified: "14/01/2025 09:55:00" },
];

const allocFuturePager = boCreatePager(
  "allocFutureRows",
  () => futurePatients.map((r, i) => ({ r, i })),
  (e) => `
    <tr>
      <td>${e.r.name}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${e.r.id}" ${e.r.isHmo ? "checked" : ""} /></td>
      <td>${e.r.dateCreated}</td>
      <td>${e.r.appConfig}</td>
      <td>${e.r.lastModified}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon alloc-edit-btn" data-scope="future" data-id="${e.r.id}" aria-label="Edit">${allocEditIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: ALLOC_PAGE_SIZE, emptyColspan: 6, emptyText: "No future patients yet." }
);
allocFuturePager();

document.getElementById("allocFutureRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const row = futurePatients.find((p) => p.id === Number(box.dataset.id));
  if (row) row.isHmo = box.checked;
});

/* ---------------- Edit AppConfig modal ----------------
   One action per row (Edit), so it's a direct icon button instead of a
   kebab menu with a single item. Shared by both tabs: Current Patients
   edits that patient's username, Future Patients edits the org name --
   the same modal just relabels the field to match what's being edited. */
const allocEditOverlay = document.getElementById("allocEditOverlay");
const allocEditForm = document.getElementById("allocEditForm");
const allocEditUsername = document.getElementById("allocEditUsername");
const allocEditNameLabel = document.getElementById("allocEditNameLabel");
const allocSaveEditBtn = document.getElementById("allocSaveEdit");
const allocEditConfigSelect = document.querySelector('.bo-select[data-name="allocEditConfig"]');
let allocEditScope = null;
let allocEditId = null;

document.getElementById("allocEditConfigMenu").innerHTML = buildBoSelectOptions(allocConfigs);

function allocEditRow() {
  const list = allocEditScope === "future" ? futurePatients : currentPatients;
  return list.find((p) => p.id === allocEditId);
}

function openAllocEditModal(scope, id) {
  const list = scope === "future" ? futurePatients : currentPatients;
  const row = list.find((p) => p.id === id);
  if (!row) return;

  allocEditScope = scope;
  allocEditId = id;

  allocEditNameLabel.textContent = scope === "future" ? "Name:" : "Username:";
  allocEditUsername.value = scope === "future" ? row.name : row.username;
  setBoSelectValue(allocEditConfigSelect, row.appConfig, { silent: true });
  validateAllocEditForm();

  allocEditOverlay.classList.add("open");
}

function closeAllocEditModal() {
  allocEditOverlay.classList.remove("open");
  allocEditScope = null;
  allocEditId = null;
}

function validateAllocEditForm() {
  const configChosen = allocEditConfigSelect.querySelector("input[type=hidden]").value !== "";
  allocSaveEditBtn.disabled = !(allocEditUsername.value.trim() && configChosen);
}

allocEditForm.addEventListener("input", validateAllocEditForm);
allocEditForm.addEventListener("change", validateAllocEditForm);

function openAllocEdit(e) {
  const btn = e.target.closest(".alloc-edit-btn");
  if (!btn) return;
  openAllocEditModal(btn.dataset.scope, Number(btn.dataset.id));
}

document.getElementById("allocCurrentRows").addEventListener("click", openAllocEdit);
document.getElementById("allocFutureRows").addEventListener("click", openAllocEdit);

document.getElementById("allocCancelEdit").addEventListener("click", closeAllocEditModal);
allocEditOverlay.addEventListener("click", (e) => { if (e.target === allocEditOverlay) closeAllocEditModal(); });

allocEditForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (allocSaveEditBtn.disabled) return;

  const scope = allocEditScope;
  const row = allocEditRow();
  if (row) {
    if (scope === "future") row.name = allocEditUsername.value.trim();
    else row.username = allocEditUsername.value.trim();
    row.appConfig = allocEditConfigSelect.querySelector("input[type=hidden]").value;
  }

  closeAllocEditModal();
  if (scope === "future") allocFuturePager();
  else allocCurrentPager();
});

/* ---------------- Clear filters ---------------- */
document.getElementById("allocClearFiltersBtn").addEventListener("click", () => {
  allocSiteFilterValue = "";
  allocConfigFilterValue = "";
  allocLangFilterValue = "";
  allocSearchTerm = "";

  resetBoSelect(document.querySelector('.bo-select[data-name="allocSite"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="allocConfig"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="allocLang"]'));
  document.getElementById("allocSearchInput").value = "";

  allocCurrentPager.resetPage();
  allocCurrentPager();
});
