/* ---------------- Data ---------------- (see js/orgs-data.js, loaded before this file) */

/* ---------------- State ---------------- */
const ORG_PAGE_SIZE = 20;
let orgCurrentPage = 1;
let orgSortDir = "asc";
let orgSearchTerm = "";

function filteredOrgs() {
  if (!orgSearchTerm) return orgs;
  const q = orgSearchTerm.toLowerCase();
  return orgs.filter((o) => o.name.toLowerCase().includes(q) || o.tag.toLowerCase().includes(q) || o.study.toLowerCase().includes(q));
}

function sortedOrgs() {
  const list = [...filteredOrgs()];
  list.sort((a, b) => (orgSortDir === "asc" ? a.name.localeCompare(b.name, undefined, { numeric: true }) : b.name.localeCompare(a.name, undefined, { numeric: true })));
  return list;
}

/* ---------------- Render ---------------- */
const orgCheck = (id, field, on) => `<input type="checkbox" class="bo-cell-checkbox" data-id="${id}" data-field="${field}" ${on ? "checked" : ""} />`;
const orgKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const EHR_CLASS = { Athena: "athena", ECW: "ecw", Epic: "epic" };
function orgEhrTags(ehr) {
  if (!ehr || !ehr.length) return `<span class="bo-ehr-none">—</span>`;
  return `<div class="bo-ehr-tags">${ehr.map((e) => `<span class="bo-ehr-tag ${EHR_CLASS[e] || ""}">${e}</span>`).join("")}</div>`;
}

function renderOrgs() {
  const list = sortedOrgs();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / ORG_PAGE_SIZE));
  orgCurrentPage = Math.min(orgCurrentPage, totalPages);

  const start = (orgCurrentPage - 1) * ORG_PAGE_SIZE;
  const pageItems = list.slice(start, start + ORG_PAGE_SIZE);

  document.getElementById("orgsRows").innerHTML = pageItems
    .map(
      (o) => `
      <tr>
        <td><a class="bo-name-link" href="org-profile.html?id=${o.id}">${o.name}</a></td>
        <td>${o.tag}</td>
        <td>${o.study}</td>
        <td>${orgCheck(o.id, "isHmo", o.isHmo)}</td>
        <td>${o.target}</td>
        <td>${o.dateCreated}</td>
        <td>${orgCheck(o.id, "onDashboard", o.onDashboard)}</td>
        <td>${orgCheck(o.id, "careRec", o.careRec)}</td>
        <td>${o.authType}</td>
        <td>${orgEhrTags(o.ehr)}</td>
        <td>${o.phone}</td>
        <td class="mono">${o.latLng}</td>
        <td>${o.docPath}</td>
        <td>${o.updateSent}</td>
        <td>${o.lng}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${o.id}" aria-label="Row actions">${orgKebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + ORG_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("orgPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("orgFirstPage").disabled = orgCurrentPage === 1;
  document.getElementById("orgPrevPage").disabled = orgCurrentPage === 1;
  document.getElementById("orgNextPage").disabled = orgCurrentPage === totalPages;
  document.getElementById("orgLastPage").disabled = orgCurrentPage === totalPages;
}

renderOrgs();

/* ---------------- Search ---------------- */
document.getElementById("orgSearchInput").addEventListener("input", (e) => {
  orgSearchTerm = e.target.value.trim();
  orgCurrentPage = 1;
  renderOrgs();
});

/* ---------------- Sort ---------------- */
document.querySelector(".bo-list-table th.sortable").addEventListener("click", () => {
  orgSortDir = orgSortDir === "asc" ? "desc" : "asc";
  renderOrgs();
});

/* ---------------- Pagination ---------------- */
document.getElementById("orgFirstPage").addEventListener("click", () => { orgCurrentPage = 1; renderOrgs(); });
document.getElementById("orgPrevPage").addEventListener("click", () => { orgCurrentPage -= 1; renderOrgs(); });
document.getElementById("orgNextPage").addEventListener("click", () => { orgCurrentPage += 1; renderOrgs(); });
document.getElementById("orgLastPage").addEventListener("click", () => {
  orgCurrentPage = Math.ceil(filteredOrgs().length / ORG_PAGE_SIZE);
  renderOrgs();
});

document.getElementById("orgsRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const org = orgs.find((o) => o.id === Number(box.dataset.id));
  if (org) org[box.dataset.field] = box.checked;
});

/* ---------------- Row action dropdown ---------------- */
const orgRowMenu = document.getElementById("orgRowMenu");
let activeOrgRowId = null;

const orgRowMenuEhrBtn = document.getElementById("orgRowMenuEhrBtn");

document.getElementById("orgsRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeOrgRowId = Number(trigger.dataset.id);

  const org = orgs.find((o) => o.id === activeOrgRowId);
  orgRowMenuEhrBtn.hidden = !org || (org.ehr || []).length >= EHR_MAX;

  const rect = trigger.getBoundingClientRect();
  orgRowMenu.style.top = `${rect.bottom + 6}px`;
  orgRowMenu.style.left = `${rect.right - 190}px`;
  orgRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!orgRowMenu.contains(e.target)) orgRowMenu.classList.remove("open");
});

orgRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item) return;
  orgRowMenu.classList.remove("open");
  if (item.dataset.action === "ehr") openEhrConnDrawer(activeOrgRowId);
});

/* ---------------- Custom selects (used inside the Add Organization drawer) ---------------- */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const option = select.querySelector(`.bo-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".bo-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionBoSelectMenu(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const menu = select.querySelector(".bo-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function resetBoSelect(select) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  setBoSelectValue(select, "", { silent: true });
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function initBoSelects(root = document) {
  root.querySelectorAll(".bo-select").forEach((select) => {
    const trigger = select.querySelector(".bo-select-trigger");
    const valueEl = select.querySelector(".bo-select-value");

    valueEl.dataset.placeholder = valueEl.textContent.trim();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !select.classList.contains("open");
      closeAllBoSelects();
      if (willOpen) {
        select.classList.add("open");
        positionBoSelectMenu(select);
      }
    });

    select.addEventListener("click", (e) => {
      const option = e.target.closest(".bo-select-option");
      if (!option) return;
      setBoSelectValue(select, option.dataset.value);
      select.classList.remove("open");
    });
  });
}

document.addEventListener("click", closeAllBoSelects);
document.addEventListener("scroll", closeAllBoSelects, true);
window.addEventListener("resize", closeAllBoSelects);

initBoSelects();

/* ---------------- EHR Connection cards (up to 3 — Athena, ECW, Epic) ---------------- */
const EHR_OPTIONS_HTML = `
  <div class="bo-select-option" data-value="Athena">Athena<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="ECW">ECW<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="Epic">Epic<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
`;
const EHR_ENV_OPTIONS_HTML = `
  <div class="bo-select-option" data-value="Sandbox">Sandbox<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="Production">Production<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
`;
const EHR_MAX = 3;

const ehrRowsWrap = document.getElementById("ehrRowsWrap");
const addEhrRowBtn = document.getElementById("addEhrRowBtn");
let ehrRowCount = 1;

function ehrRowFields() {
  return Array.from(ehrRowsWrap.querySelectorAll("[data-ehr-row]"));
}

function relabelEhrRows() {
  const fields = ehrRowFields();
  fields.forEach((field, i) => {
    field.querySelector(".bo-ehr-card-title").textContent = `EHR Connection ${i + 1}`;
    const removeBtn = field.querySelector(".bo-org-row-remove");
    removeBtn.disabled = fields.length === 1;
  });
  addEhrRowBtn.disabled = fields.length >= EHR_MAX;
  addEhrRowBtn.style.display = fields.length >= EHR_MAX ? "none" : "";
}

function addEhrRow() {
  if (ehrRowFields().length >= EHR_MAX) return;
  ehrRowCount += 1;
  const n = ehrRowCount;

  const card = document.createElement("div");
  card.className = "bo-ehr-card";
  card.setAttribute("data-ehr-row", "");
  card.innerHTML = `
    <div class="bo-ehr-card-head">
      <span class="bo-ehr-card-title">EHR Connection ${n}</span>
      <button type="button" class="bo-org-row-remove" aria-label="Remove EHR connection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>
      </button>
    </div>
    <div class="bo-modal-grid">
      <div class="bo-modal-field">
        <label>EHR Name</label>
        <div class="bo-select" data-name="ehr${n}Name">
          <button type="button" class="bo-select-trigger">
            <span class="bo-select-value placeholder">Choose</span>
            <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="bo-select-menu">${EHR_OPTIONS_HTML}</div>
          <input type="hidden" name="ehr${n}Name" />
        </div>
      </div>
      <div class="bo-modal-field">
        <label>Environment</label>
        <div class="bo-select" data-name="ehr${n}Env">
          <button type="button" class="bo-select-trigger">
            <span class="bo-select-value placeholder">Choose</span>
            <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="bo-select-menu">${EHR_ENV_OPTIONS_HTML}</div>
          <input type="hidden" name="ehr${n}Env" />
        </div>
      </div>
      <div class="bo-modal-field">
        <label>Client Id</label>
        <input type="text" name="ehr${n}ClientId" placeholder="Enter Client ID" />
      </div>
      <div class="bo-modal-field">
        <label>Client Secret</label>
        <input type="text" name="ehr${n}ClientSecret" placeholder="Enter Client Secret" />
      </div>
      <div class="bo-modal-field full">
        <label>Connection Name</label>
        <input type="text" name="ehr${n}ConnName" placeholder="Enter Connection Name" />
      </div>
    </div>
  `;

  ehrRowsWrap.appendChild(card);
  initBoSelects(card);

  card.querySelector(".bo-org-row-remove").addEventListener("click", () => {
    card.remove();
    relabelEhrRows();
  });

  relabelEhrRows();
}

addEhrRowBtn.addEventListener("click", addEhrRow);

function resetEhrRows() {
  ehrRowFields().forEach((field, i) => {
    if (i > 0) field.remove();
  });
  ehrRowCount = 1;
  relabelEhrRows();
}

/* ---------------- Add Organization: full-screen stepper panel ---------------- */
const addOrgOverlay = document.getElementById("addOrgOverlay");
const addOrgForm = document.getElementById("addOrgForm");
const saveAddOrgBtn = document.getElementById("saveAddOrg");
const nextAddOrgBtn = document.getElementById("nextAddOrg");
const backAddOrgBtn = document.getElementById("backAddOrg");
const addOrgStepper = document.getElementById("addOrgStepper");
const ADD_ORG_STEP_COUNT = addOrgStepper.querySelectorAll(".bo-step").length;
let addOrgStep = 1;

function goToAddOrgStep(step) {
  addOrgStep = Math.min(Math.max(step, 1), ADD_ORG_STEP_COUNT);

  addOrgForm.querySelectorAll(".bo-modal-section[data-step]").forEach((section) => {
    section.classList.toggle("step-active", Number(section.dataset.step) === addOrgStep);
  });

  addOrgStepper.querySelectorAll(".bo-step").forEach((step_) => {
    const n = Number(step_.dataset.stepNav);
    step_.classList.toggle("active", n === addOrgStep);
    step_.classList.toggle("done", n < addOrgStep);
  });

  backAddOrgBtn.hidden = addOrgStep === 1;
  nextAddOrgBtn.hidden = addOrgStep === ADD_ORG_STEP_COUNT;
  saveAddOrgBtn.hidden = addOrgStep !== ADD_ORG_STEP_COUNT;

  addOrgForm.closest(".bo-fullscreen-body")?.scrollTo({ top: 0 });
}

function openAddOrgModal() {
  addOrgForm.reset();
  addOrgForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  resetEhrRows();
  validateAddOrgForm();
  goToAddOrgStep(1);
  addOrgOverlay.classList.add("open");
}

function closeAddOrgModal() {
  addOrgOverlay.classList.remove("open");
}

function validateAddOrgForm() {
  const nameOk = addOrgForm.name.value.trim() !== "";
  nextAddOrgBtn.disabled = addOrgStep === 1 && !nameOk;
  saveAddOrgBtn.disabled = !nameOk;
}

addOrgForm.addEventListener("input", validateAddOrgForm);
addOrgForm.addEventListener("change", validateAddOrgForm);

addOrgStepper.addEventListener("click", (e) => {
  const step = e.target.closest(".bo-step");
  if (!step) return;
  goToAddOrgStep(Number(step.dataset.stepNav));
  validateAddOrgForm();
});

nextAddOrgBtn.addEventListener("click", () => {
  if (nextAddOrgBtn.disabled) return;
  goToAddOrgStep(addOrgStep + 1);
  validateAddOrgForm();
});

backAddOrgBtn.addEventListener("click", () => {
  goToAddOrgStep(addOrgStep - 1);
  validateAddOrgForm();
});

addOrgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddOrgBtn.disabled) return;
  closeAddOrgModal();
});

document.getElementById("openAddOrgBtn").addEventListener("click", openAddOrgModal);
document.getElementById("cancelAddOrg").addEventListener("click", closeAddOrgModal);
document.getElementById("closeAddOrgX").addEventListener("click", closeAddOrgModal);
addOrgOverlay.addEventListener("click", (e) => { if (e.target === addOrgOverlay) closeAddOrgModal(); });

/* ---------------- EHR Connection drawer (row-menu action) ----------------
   Shows only the "EHR Connection Details" fields directly, no stepper.
   Prefilled with the organization's existing EHR connections; capped at EHR_MAX. */
const ehrConnDrawerOverlay = document.getElementById("ehrConnDrawerOverlay");
const ehrConnForm = document.getElementById("ehrConnForm");
const ehrConnRowsWrap = document.getElementById("ehrConnRowsWrap");
const addEhrConnRowBtn = document.getElementById("addEhrConnRowBtn");
let ehrConnOrgId = null;
let ehrConnRowCount = 0;

function ehrConnRowFields() {
  return Array.from(ehrConnRowsWrap.querySelectorAll("[data-ehr-row]"));
}

function relabelEhrConnRows() {
  const fields = ehrConnRowFields();
  fields.forEach((field, i) => {
    field.querySelector(".bo-ehr-card-title").textContent = `EHR Connection ${i + 1}`;
    const removeBtn = field.querySelector(".bo-org-row-remove");
    removeBtn.disabled = fields.length === 1;
  });
  addEhrConnRowBtn.disabled = fields.length >= EHR_MAX;
  addEhrConnRowBtn.style.display = fields.length >= EHR_MAX ? "none" : "";
}

function addEhrConnRow(presetName) {
  if (ehrConnRowFields().length >= EHR_MAX) return;
  ehrConnRowCount += 1;
  const n = ehrConnRowCount;

  const card = document.createElement("div");
  card.className = "bo-ehr-card";
  card.setAttribute("data-ehr-row", "");
  card.innerHTML = `
    <div class="bo-ehr-card-head">
      <span class="bo-ehr-card-title">EHR Connection</span>
      <button type="button" class="bo-org-row-remove" aria-label="Remove EHR connection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>
      </button>
    </div>
    <div class="bo-modal-grid">
      <div class="bo-modal-field">
        <label>EHR Name</label>
        <div class="bo-select" data-name="ehrConn${n}Name">
          <button type="button" class="bo-select-trigger">
            <span class="bo-select-value placeholder">Choose</span>
            <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="bo-select-menu">${EHR_OPTIONS_HTML}</div>
          <input type="hidden" name="ehrConn${n}Name" />
        </div>
      </div>
      <div class="bo-modal-field">
        <label>Environment</label>
        <div class="bo-select" data-name="ehrConn${n}Env">
          <button type="button" class="bo-select-trigger">
            <span class="bo-select-value placeholder">Choose</span>
            <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          <div class="bo-select-menu">${EHR_ENV_OPTIONS_HTML}</div>
          <input type="hidden" name="ehrConn${n}Env" />
        </div>
      </div>
      <div class="bo-modal-field">
        <label>Client Id</label>
        <input type="text" name="ehrConn${n}ClientId" placeholder="Enter Client ID" />
      </div>
      <div class="bo-modal-field">
        <label>Client Secret</label>
        <input type="text" name="ehrConn${n}ClientSecret" placeholder="Enter Client Secret" />
      </div>
      <div class="bo-modal-field full">
        <label>Connection Name</label>
        <input type="text" name="ehrConn${n}ConnName" placeholder="Enter Connection Name" />
      </div>
    </div>
  `;

  ehrConnRowsWrap.appendChild(card);
  initBoSelects(card);

  if (presetName) {
    setBoSelectValue(card.querySelector(`.bo-select[data-name="ehrConn${n}Name"]`), presetName, { silent: true });
  }

  card.querySelector(".bo-org-row-remove").addEventListener("click", () => {
    card.remove();
    relabelEhrConnRows();
  });

  relabelEhrConnRows();
}

addEhrConnRowBtn.addEventListener("click", () => addEhrConnRow());

function openEhrConnDrawer(orgId) {
  const org = orgs.find((o) => o.id === orgId);
  if (!org) return;
  ehrConnOrgId = orgId;

  ehrConnRowsWrap.innerHTML = "";
  ehrConnRowCount = 0;

  const existing = org.ehr && org.ehr.length ? org.ehr : [""];
  existing.forEach((name) => addEhrConnRow(name));

  ehrConnDrawerOverlay.classList.add("open");
}

function closeEhrConnDrawer() {
  ehrConnDrawerOverlay.classList.remove("open");
}

ehrConnForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const org = orgs.find((o) => o.id === ehrConnOrgId);
  if (!org) { closeEhrConnDrawer(); return; }

  const names = ehrConnRowFields()
    .map((field) => field.querySelector('input[type=hidden][name^="ehrConn"][name$="Name"]').value)
    .filter(Boolean);

  org.ehr = [...new Set(names)].slice(0, EHR_MAX);
  closeEhrConnDrawer();
  renderOrgs();
});

document.getElementById("cancelEhrConn").addEventListener("click", closeEhrConnDrawer);
document.getElementById("closeEhrConnX").addEventListener("click", closeEhrConnDrawer);
ehrConnDrawerOverlay.addEventListener("click", (e) => { if (e.target === ehrConnDrawerOverlay) closeEhrConnDrawer(); });
