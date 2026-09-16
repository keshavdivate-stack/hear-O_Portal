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
document.getElementById("clinicalSiteFilterMenu").innerHTML = buildBoSelectOptions(siteCodes);
document.getElementById("tagFilterMenu").innerHTML = buildBoSelectOptions(PATIENT_TAGS);
document.getElementById("languageFilterMenu").innerHTML = buildBoSelectOptions(PATIENT_LANGUAGES);
document.getElementById("statusFilterMenu").innerHTML = buildBoSelectOptions(["Registered", "Active", "Priority", "Paused"]);
document.getElementById("activeFilterMenu").innerHTML =
  `<div class="bo-select-option" data-value="yes">Yes<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` +
  `<div class="bo-select-option" data-value="no">No<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;

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
        <td data-col="username"><a class="bo-name-link" href="patient-health-dashboard.html?patient=${p.username}">${p.username}</a></td>
        <td data-col="algo"><input type="checkbox" class="bo-table-checkbox" ${p.algo ? "checked" : ""} disabled aria-label="Algo enabled" /></td>
        <td data-col="lang">${p.lang}</td>
        <td data-col="tag">${p.tag}</td>
        <td data-col="creationDate">${p.creationDate || "—"}</td>
        <td data-col="startDate">${p.startDate || "—"}</td>
        <td data-col="baselineCompletedDate">${p.baselineCompletedDate || "—"}</td>
        <td data-col="followUpDate">${p.followUpDate || "—"}</td>
        <td data-col="leavingDate">${p.leavingDate || "—"}</td>
        <td data-col="account"><span class="bo-status-pill ${statusClass(p.account)}">${p.account}</span></td>
        <td data-col="status"><span class="bo-status-pill ${statusClass(p.status)}">${p.status}</span></td>
        <td data-col="monitoring"><span class="bo-status-pill ${statusClass(p.monitoring)}">${p.monitoring}</span></td>
        <td data-col="statusStart">${p.statusStart}</td>
        <td data-col="lastAppVersion">${p.lastAppVersion || "—"}</td>
        <td data-col="lastPhoneModel">${p.lastPhoneModel || "—"}</td>
        <td data-col="lastSession">${p.lastSession}</td>
        <td data-col="lastSignIn">${p.lastSignIn || "—"}</td>
        <td data-col="recordingQuality">${pct(p.recordingQuality)}</td>
        <td data-col="compliance">${pct(p.compliance)}</td>
        <td data-col="actions">
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

  applyColumnVisibility();
}

/* ---------------- Columns / Views menu ----------------
   "Columns" opens a saved-views switcher: two built-in Default Views
   plus any number of user-created Custom Views, each capturing its own
   column selection. Built from the table's own data-col headers, so
   the available columns never drift out of sync with the table. */
const pencilIconSm = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const plusIconSm = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const checkIconBlueSm = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#2AA9E0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const patientColumnDefs = Array.from(document.querySelectorAll('#patientTable thead th[data-col]'))
  .map((th) => ({ key: th.dataset.col, label: th.textContent.trim() }))
  .filter((c) => c.key !== "actions");
const hiddenPatientColumns = new Set();

const patientDefaultViews = [
  { key: "default1", name: "Default View 1", columns: patientColumnDefs.map((c) => c.key) },
  { key: "default2", name: "Default View 2", columns: ["username", "status", "monitoring", "lastSession"] },
];
const patientCustomViews = [
  { key: "custom1", name: "Custom View 1", columns: ["username", "lang", "tag", "status", "monitoring", "compliance"] },
];
let patientActiveViewKey = "default1";
let patientDefaultViewKey = "default1";
let patientEditingViewKey = null;

function patientViewByKey(key) {
  return patientDefaultViews.find((v) => v.key === key) || patientCustomViews.find((v) => v.key === key);
}

function applyColumnVisibility() {
  document.querySelectorAll("#patientTable [data-col]").forEach((cell) => {
    cell.style.display = hiddenPatientColumns.has(cell.dataset.col) ? "none" : "";
  });
}

function applyPatientView(view) {
  hiddenPatientColumns.clear();
  patientColumnDefs.forEach((c) => {
    if (!view.columns.includes(c.key)) hiddenPatientColumns.add(c.key);
  });
  applyColumnVisibility();
}

const patientColumnsField = document.getElementById("patientColumnsField");
const patientColumnsBtn = document.getElementById("patientColumnsBtn");
const patientColumnsMenu = document.getElementById("patientColumnsMenu");

patientColumnsMenu.innerHTML = `
  <div class="bo-views-menu-search">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    <input type="text" id="patientViewsSearchInput" placeholder="Search" autocomplete="off" />
  </div>
  <div class="bo-views-menu-section" id="patientDefaultViewsSection">
    <div class="bo-views-menu-section-label">Default Views</div>
    <div id="patientDefaultViewsList"></div>
  </div>
  <div class="bo-views-menu-section" id="patientCustomViewsSection">
    <div class="bo-views-menu-section-label">Custom Views</div>
    <div id="patientCustomViewsList"></div>
  </div>
  <button type="button" class="bo-views-menu-create-btn" id="createPatientCustomViewBtn">${plusIconSm} Create Custom View</button>
`;

const patientViewsSearchInput = document.getElementById("patientViewsSearchInput");
const patientDefaultViewsSection = document.getElementById("patientDefaultViewsSection");
const patientDefaultViewsList = document.getElementById("patientDefaultViewsList");
const patientCustomViewsSection = document.getElementById("patientCustomViewsSection");
const patientCustomViewsList = document.getElementById("patientCustomViewsList");

function renderPatientViewRow(view, isBuiltIn) {
  const isActive = view.key === patientActiveViewKey;
  const isDefault = view.key === patientDefaultViewKey;
  return `
    <div class="bo-views-menu-item" data-view="${view.key}">
      <span class="bo-views-menu-item-check">${isActive ? checkIconBlueSm : ""}</span>
      <span class="bo-views-menu-item-name">${view.name}</span>
      ${isDefault ? `<span class="bo-views-menu-item-badge">Default</span>` : ""}
      ${
        isBuiltIn
          ? ""
          : `<span class="bo-views-menu-item-actions">
               ${!isDefault ? `<button type="button" class="bo-views-set-default-btn" data-view="${view.key}">Set as Default</button>` : ""}
               <button type="button" class="bo-views-edit-btn" data-view="${view.key}" aria-label="Edit view">${pencilIconSm}</button>
             </span>`
      }
    </div>`;
}

function renderPatientViewsMenu() {
  const query = patientViewsSearchInput.value.trim().toLowerCase();
  const filteredDefaults = patientDefaultViews.filter((v) => v.name.toLowerCase().includes(query));
  const filteredCustom = patientCustomViews.filter((v) => v.name.toLowerCase().includes(query));

  patientDefaultViewsSection.hidden = filteredDefaults.length === 0;
  patientDefaultViewsList.innerHTML = filteredDefaults.map((v) => renderPatientViewRow(v, true)).join("");

  patientCustomViewsSection.hidden = query.length > 0 && filteredCustom.length === 0;
  patientCustomViewsList.innerHTML =
    filteredCustom.map((v) => renderPatientViewRow(v, false)).join("") ||
    (query ? "" : `<p class="bo-views-menu-empty">No custom views yet</p>`);
}

patientViewsSearchInput.addEventListener("input", renderPatientViewsMenu);

patientColumnsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !patientColumnsMenu.classList.contains("open");
  document.querySelectorAll(".bo-popover.open").forEach((p) => p.classList.remove("open"));
  patientColumnsField.classList.toggle("open", willOpen);
  patientColumnsMenu.classList.toggle("open", willOpen);
  if (willOpen) {
    patientViewsSearchInput.value = "";
    renderPatientViewsMenu();
  }
});

patientColumnsMenu.addEventListener("click", (e) => {
  e.stopPropagation();

  const editBtn = e.target.closest(".bo-views-edit-btn");
  if (editBtn) {
    openViewDrawer(editBtn.dataset.view);
    return;
  }

  const defaultBtn = e.target.closest(".bo-views-set-default-btn");
  if (defaultBtn) {
    patientDefaultViewKey = defaultBtn.dataset.view;
    renderPatientViewsMenu();
    return;
  }

  if (e.target.closest("#createPatientCustomViewBtn")) {
    openViewDrawer(null);
    return;
  }

  const row = e.target.closest(".bo-views-menu-item");
  if (row) {
    patientActiveViewKey = row.dataset.view;
    applyPatientView(patientViewByKey(patientActiveViewKey));
    renderPatientViewsMenu();
    patientColumnsField.classList.remove("open");
    patientColumnsMenu.classList.remove("open");
  }
});

/* ---------------- Create/Edit Custom View drawer ---------------- */
const viewDrawerOverlay = document.getElementById("viewDrawerOverlay");
const viewDrawerTitle = document.getElementById("viewDrawerTitle");
const viewNameInput = document.getElementById("viewNameInput");
const viewColumnsGrid = document.getElementById("viewColumnsGrid");
const cancelViewDrawerBtn = document.getElementById("cancelViewDrawer");
const saveViewDrawerBtn = document.getElementById("saveViewDrawer");

function updateSaveViewDrawerState() {
  const hasName = viewNameInput.value.trim().length > 0;
  const hasColumn = !!viewColumnsGrid.querySelector('input[type="checkbox"]:checked');
  saveViewDrawerBtn.disabled = !(hasName && hasColumn);
}

function openViewDrawer(editKey) {
  patientEditingViewKey = editKey;
  const existing = editKey ? patientViewByKey(editKey) : null;

  viewDrawerTitle.textContent = existing ? "Edit Custom View" : "Create Custom View";
  saveViewDrawerBtn.textContent = existing ? "Save Changes" : "Create View";
  viewNameInput.value = existing ? existing.name : "";

  viewColumnsGrid.innerHTML = patientColumnDefs
    .map(
      (c) => `
      <label class="bo-view-column-option">
        <input type="checkbox" value="${c.key}" ${!existing || existing.columns.includes(c.key) ? "checked" : ""} />
        ${c.label}
      </label>`
    )
    .join("");

  updateSaveViewDrawerState();
  viewDrawerOverlay.classList.add("open");
  viewNameInput.focus();
}

function closeViewDrawer() {
  viewDrawerOverlay.classList.remove("open");
  patientEditingViewKey = null;
}

viewNameInput.addEventListener("input", updateSaveViewDrawerState);
viewColumnsGrid.addEventListener("change", updateSaveViewDrawerState);
document.getElementById("closeViewDrawerX").addEventListener("click", closeViewDrawer);
cancelViewDrawerBtn.addEventListener("click", closeViewDrawer);
viewDrawerOverlay.addEventListener("click", (e) => {
  if (e.target === viewDrawerOverlay) closeViewDrawer();
});

saveViewDrawerBtn.addEventListener("click", () => {
  const name = viewNameInput.value.trim();
  const selectedColumns = Array.from(viewColumnsGrid.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
  if (!name || !selectedColumns.length) return;

  if (patientEditingViewKey) {
    const view = patientViewByKey(patientEditingViewKey);
    view.name = name;
    view.columns = selectedColumns;
    if (patientActiveViewKey === patientEditingViewKey) applyPatientView(view);
  } else {
    const newView = { key: `custom-${Date.now()}`, name, columns: selectedColumns };
    patientCustomViews.push(newView);
    patientActiveViewKey = newView.key;
    applyPatientView(newView);
  }

  closeViewDrawer();
  renderPatientViewsMenu();
});

applyPatientView(patientViewByKey(patientActiveViewKey));

renderPatients();

/* ---------------- Filters (apply as soon as a field changes) ---------------- */
function applyPatientFilter(update) {
  update();
  patientCurrentPage = 1;
  renderPatients();
}

document.getElementById("clinicalSiteFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientSiteFilter = e.target.value; }));
document.getElementById("tagFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientTagFilter = e.target.value; }));
document.getElementById("languageFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientLanguageFilter = e.target.value; }));
document.getElementById("statusFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientStatusFilter = e.target.value; }));
document.getElementById("activeFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientActiveFilter = e.target.value; }));
document.getElementById("appVersionFilter").addEventListener("input", (e) => applyPatientFilter(() => { patientAppVersionFilter = e.target.value.trim().toLowerCase(); }));
document.getElementById("phoneModelFilter").addEventListener("input", (e) => applyPatientFilter(() => { patientPhoneModelFilter = e.target.value.trim().toLowerCase(); }));
document.getElementById("lastSessionUpToFilter").addEventListener("change", (e) => applyPatientFilter(() => { patientLastSessionUpTo = e.target.value; }));
document.getElementById("patientSearchInput").addEventListener("input", (e) => applyPatientFilter(() => { patientSearchTerm = e.target.value.trim().toLowerCase(); }));

document.getElementById("patientClearFiltersBtn").addEventListener("click", () => {
  patientSiteFilter = "";
  patientTagFilter = "";
  patientLanguageFilter = "";
  patientStatusFilter = "";
  patientActiveFilter = "";
  patientAppVersionFilter = "";
  patientPhoneModelFilter = "";
  patientLastSessionUpTo = "";
  patientSearchTerm = "";
  patientOrgTypeToggles.clear();

  resetBoSelect(document.querySelector('.bo-select[data-name="clinicalSite"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="tag"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="language"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="status"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="active"]'));
  document.getElementById("appVersionFilter").value = "";
  document.getElementById("phoneModelFilter").value = "";
  document.getElementById("patientSearchInput").value = "";
  const lastSessionEl = document.getElementById("lastSessionUpToFilter");
  lastSessionEl.value = "";
  lastSessionEl.type = "text";
  document.querySelectorAll("[data-org-type]").forEach((toggle) => { toggle.checked = false; });

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
