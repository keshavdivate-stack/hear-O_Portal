/* ---------------- Data ---------------- (see js/orgs-data.js, loaded before this file) */

/* ---------------- State ---------------- */
const ORG_PAGE_SIZE = 20;
let orgCurrentPage = 1;
let orgSortField = "name";
let orgSortDir = "asc";
let orgSearchTerm = "";
/* Active/Archived is its own tab, not a filter dropdown value -- archiving an
   org hides it from the working list without deleting it, and this is the
   only place it's still reachable (to review it or Unarchive it back in). */
let orgViewTab = "active";

function filteredOrgs() {
  const inView = orgs.filter((o) => !!o.archived === (orgViewTab === "archived"));
  if (!orgSearchTerm) return inView;
  const q = orgSearchTerm.toLowerCase();
  return inView.filter((o) => o.name.toLowerCase().includes(q) || o.tag.toLowerCase().includes(q) || o.study.toLowerCase().includes(q));
}

/* dateCreated is stored "DD/MM/YYYY" -- parsed to a timestamp so Date
   Created sorts chronologically instead of lexicographically. */
function orgSortValue(o, field) {
  if (field === "target") return Number(o.target) || 0;
  if (field === "dateCreated") {
    const [d, m, y] = o.dateCreated.split("/").map(Number);
    return new Date(y, m - 1, d).getTime();
  }
  return o.name;
}

function sortedOrgs() {
  const list = [...filteredOrgs()];
  list.sort((a, b) => {
    const av = orgSortValue(a, orgSortField);
    const bv = orgSortValue(b, orgSortField);
    if (typeof av === "string") {
      return orgSortDir === "asc" ? av.localeCompare(bv, undefined, { numeric: true }) : bv.localeCompare(av, undefined, { numeric: true });
    }
    return orgSortDir === "asc" ? av - bv : bv - av;
  });
  return list;
}

/* ---------------- Render ---------------- */
/* On/off columns are switches, like the developed Organizations table. */
const orgCheck = (id, field, on) => `<label class="bo-switch"><input type="checkbox" class="bo-cell-checkbox" data-id="${id}" data-field="${field}" ${on ? "checked" : ""} /><span class="bo-switch-track"></span></label>`;
const orgKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* Organizations without stored values: EHR is on when it has connections,
   Medication module off and Support on (as the developed table shows). */
orgs.forEach((o) => {
  if (o.ehrEnabled === undefined) o.ehrEnabled = (o.ehr || []).length > 0;
  if (o.medicationModule === undefined) o.medicationModule = false;
  if (o.supportModule === undefined) o.supportModule = true;
});

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
        <td>${o.target}</td>
        <td>${o.dateCreated}</td>
        <td>${o.authType}</td>
        <td>${o.type}</td>
        <td>${o.phone || "&mdash;"}</td>
        <td class="mono">${o.latLng}</td>
        <td>${o.docPath || "&mdash;"}</td>
        <td>${orgCheck(o.id, "onDashboard", o.onDashboard)}</td>
        <td>${orgCheck(o.id, "careRec", o.careRec)}</td>
        <td>${orgCheck(o.id, "ehrEnabled", o.ehrEnabled)}</td>
        <td>${orgCheck(o.id, "medicationModule", o.medicationModule)}</td>
        <td>${orgCheck(o.id, "supportModule", o.supportModule)}</td>
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

/* ---------------- Active / Archived tabs ---------------- */
document.getElementById("orgViewTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-tab");
  if (!btn || btn.classList.contains("active")) return;
  orgViewTab = btn.dataset.view;
  document.querySelectorAll("#orgViewTabs .bo-tab").forEach((b) => b.classList.toggle("active", b === btn));
  orgCurrentPage = 1;
  renderOrgs();
});

/* ---------------- Sort ---------------- */
document.querySelectorAll(".bo-list-table th.sortable").forEach((th) => {
  th.addEventListener("click", () => {
    const field = th.dataset.field;
    orgSortDir = orgSortField === field && orgSortDir === "asc" ? "desc" : "asc";
    orgSortField = field;
    renderOrgs();
  });
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

const orgRowMenuArchiveBtn = document.getElementById("orgRowMenuArchiveBtn");
const orgRowMenuSendUpdateBtn = document.getElementById("orgRowMenuSendUpdateBtn");
const orgRowMenuEditBtn = document.getElementById("orgRowMenuEditBtn");

document.getElementById("orgsRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeOrgRowId = Number(trigger.dataset.id);

  const org = orgs.find((o) => o.id === activeOrgRowId);
  const isArchived = !!org?.archived;

  /* An archived organization is read-only -- the only action left for it is
     to bring it back, so every other row action is hidden while it's archived. */
  orgRowMenuSendUpdateBtn.hidden = isArchived;
  orgRowMenuEditBtn.hidden = isArchived;

  if (org) {
    orgRowMenuArchiveBtn.textContent = isArchived ? "Unarchive Organization" : "Archive Organization";
    orgRowMenuArchiveBtn.dataset.action = isArchived ? "unarchive" : "archive";
    orgRowMenuArchiveBtn.classList.toggle("danger", !isArchived);
  }

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
  if (item.dataset.action === "edit") openEditOrgModal(activeOrgRowId);
  if (item.dataset.action === "archive") {
    const org = orgs.find((o) => o.id === activeOrgRowId);
    if (!org) return;
    if (!confirm(`Archive organization "${org.name}"? It will move to the Archived Organizations tab.`)) return;
    org.archived = true;
    renderOrgs();
  }
  if (item.dataset.action === "unarchive") {
    const org = orgs.find((o) => o.id === activeOrgRowId);
    if (!org) return;
    org.archived = false;
    renderOrgs();
  }
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
/* Capturing so a scroll of the page (which the menu, positioned fixed, would
   otherwise drift away from) closes it -- but ignore scrolls that happen
   inside the menu itself, i.e. someone scrolling its own option list. */
document.addEventListener("scroll", (e) => { if (!e.target.closest?.(".bo-select")) closeAllBoSelects(); }, true);
window.addEventListener("resize", closeAllBoSelects);

initBoSelects();

/* Time Zone (Configuration step): options come from the shared
   ORG_TIME_ZONES list, with a search box since the list is long. */
const orgTimeZoneSelect = document.getElementById("orgTimeZoneSelect");
orgTimeZoneSelect.querySelector(".bo-select-menu").innerHTML = ORG_TIME_ZONES.map(
  (z) => `<div class="bo-select-option" data-value="${z.id}">${z.label}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
).join("");
addBoSelectSearch(orgTimeZoneSelect, "Search time zones");

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

function ehrConnNameFieldHtml(prefix, n) {
  return `
    <div class="bo-modal-field">
      <label>Connection Name</label>
      <input type="text" name="${prefix}${n}ConnName" placeholder="Enter Connection Name" />
    </div>`;
}

function ehrBaseUrlFieldHtml(prefix, n) {
  return `
    <div class="bo-modal-field full" data-base-url-field hidden>
      <label>Base URL</label>
      <input type="text" name="${prefix}${n}Url" placeholder="Enter Base URL" />
    </div>`;
}

/* Base URL only applies to a live Production connection -- shown/hidden as the
   Environment select changes, driven off the "change" event setBoSelectValue fires. */
function wireEhrBaseUrlToggle(card, prefix, n) {
  const envInput = card.querySelector(`input[type=hidden][name="${prefix}${n}Env"]`);
  const baseUrlField = card.querySelector("[data-base-url-field]");
  if (!envInput || !baseUrlField) return;
  const sync = () => { baseUrlField.hidden = envInput.value !== "Production"; };
  envInput.addEventListener("change", sync);
  sync();
}

/* Scopes granted by the EHR (as listed on the URL the EHR/Epic sends back). */
const EHR_SCOPE_OPTIONS = ["openid", "fhirUser", "offline_access", "user/Patient.read", "user/Patient.write", "user/Practitioner.read", "user/PractitionerRole.read", "user/Organization.read", "user/Encounter.read", "user/RelatedPerson.read", "user/CareTeam.read", "user/CarePlan.read", "user/Goal.read", "user/Flag.read", "user/List.read", "user/AllergyIntolerance.read", "user/AllergyIntolerance.write", "user/Condition.read", "user/Condition.write", "user/Observation.read", "user/Observation.write", "user/MedicationRequest.read", "user/Medication.read", "user/MedicationDispense.read", "user/MedicationAdministration.read", "user/DocumentReference.read", "user/DocumentReference.write", "user/Binary.read"];
const EHR_SCOPE_CHECK_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function ehrScopeFieldHtml(prefix, n) {
  return `
    <div class="bo-modal-field full">
      <label>Scope</label>
      <div class="bo-multiselect" data-ehr-scope>
        <button type="button" class="bo-multiselect-trigger">
          <span class="bo-multiselect-value placeholder">Choose scope</span>
          <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="bo-multiselect-menu"></div>
        <input type="hidden" name="${prefix}${n}Scope" />
      </div>
    </div>`;
}

/* Menu is still display:none at this point (its "open" class hasn't been added
   yet), so scrollHeight would read 0 -- use the CSS max-height instead. */
const BO_SCOPE_MENU_MAX_HEIGHT = 174;
function positionEhrScopeMenu(container) {
  const rect = container.querySelector(".bo-multiselect-trigger").getBoundingClientRect();
  const menu = container.querySelector(".bo-multiselect-menu");
  const menuHeight = BO_SCOPE_MENU_MAX_HEIGHT + 12;
  const openUpward = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function closeAllEhrScopes() {
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
}

function initEhrScopes(root = document) {
  root.querySelectorAll("[data-ehr-scope]").forEach((container) => {
    const trigger = container.querySelector(".bo-multiselect-trigger");
    const valueEl = container.querySelector(".bo-multiselect-value");
    const menu = container.querySelector(".bo-multiselect-menu");
    const hidden = container.querySelector("input[type=hidden]");
    const placeholderText = valueEl.textContent.trim();
    const selected = new Set();

    function render() {
      menu.innerHTML = EHR_SCOPE_OPTIONS.map(
        (v) => `<label class="bo-multiselect-option${selected.has(v) ? " checked" : ""}" data-value="${v}">
          <span class="bo-multiselect-checkbox">${EHR_SCOPE_CHECK_ICON}</span> ${v}
        </label>`
      ).join("");
      const chosen = EHR_SCOPE_OPTIONS.filter((v) => selected.has(v));
      if (chosen.length) {
        valueEl.innerHTML = chosen
          .map((v) => `<span class="scope-chip">${v}<span class="scope-chip-x" role="button" aria-label="Remove ${v}" data-remove="${v}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg></span></span>`)
          .join("");
      } else {
        valueEl.textContent = placeholderText;
      }
      valueEl.classList.toggle("placeholder", chosen.length === 0);
      valueEl.classList.toggle("has-chips", chosen.length > 0);
      hidden.value = chosen.join(",");
    }

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const removeBtn = e.target.closest("[data-remove]");
      if (removeBtn) {
        selected.delete(removeBtn.dataset.remove);
        render();
        if (container.classList.contains("open")) positionEhrScopeMenu(container);
        return;
      }
      const willOpen = !container.classList.contains("open");
      closeAllEhrScopes();
      closeAllBoSelects();
      if (willOpen) {
        positionEhrScopeMenu(container);
        container.classList.add("open");
      }
    });

    menu.addEventListener("click", (e) => {
      const option = e.target.closest(".bo-multiselect-option");
      if (!option) return;
      e.stopPropagation();
      const v = option.dataset.value;
      if (selected.has(v)) selected.delete(v);
      else selected.add(v);
      render();
      positionEhrScopeMenu(container);
    });

    container.clearScope = () => { selected.clear(); render(); };
    render();
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) closeAllEhrScopes();
});
/* Ignore scrolls inside the menu itself -- otherwise scrolling its own
   option list bubbles up (in the capture phase) and closes the dropdown. */
document.addEventListener("scroll", (e) => { if (!e.target.closest?.(".bo-multiselect")) closeAllEhrScopes(); }, true);
window.addEventListener("resize", closeAllEhrScopes);

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
      ${ehrConnNameFieldHtml("ehr", n)}
      ${ehrScopeFieldHtml("ehr", n)}
      ${ehrBaseUrlFieldHtml("ehr", n)}
    </div>
  `;

  ehrRowsWrap.appendChild(card);
  initBoSelects(card);
  initEhrScopes(card);
  wireEhrBaseUrlToggle(card, "ehr", n);

  card.querySelector(".bo-org-row-remove").addEventListener("click", () => {
    card.remove();
    relabelEhrRows();
  });

  relabelEhrRows();
}

addEhrRowBtn.addEventListener("click", addEhrRow);
initEhrScopes();
ehrRowFields().forEach((card) => wireEhrBaseUrlToggle(card, "ehr", 1));

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
const addOrgStep5Btn = document.getElementById("addOrgStep5Btn");
const addOrgStep5Line = document.getElementById("addOrgStep5Line");
let addOrgStep = 1;

/* The EHR Connection Details step only exists while "Enable EHR connection"
   (Display Settings) is on -- so the step count isn't fixed, it depends on
   that toggle's current state. */
function addOrgStepCount() {
  return addOrgStep5Btn.hidden ? 4 : 5;
}

/* Shows/hides step 5 as the "Enable EHR connection" toggle changes. If the
   form is currently sitting on step 5 when it's switched off, step back to
   4 (the last real step) rather than leaving the user on a vanished step. */
function syncEhrStepVisibility() {
  const enabled = !!addOrgForm.enableEhrConnection?.checked;
  addOrgStep5Btn.hidden = !enabled;
  addOrgStep5Line.hidden = !enabled;
  if (!enabled && addOrgStep === 5) goToAddOrgStep(4);
}

function goToAddOrgStep(step) {
  const stepCount = addOrgStepCount();
  addOrgStep = Math.min(Math.max(step, 1), stepCount);

  addOrgForm.querySelectorAll(".bo-modal-section[data-step]").forEach((section) => {
    section.classList.toggle("step-active", Number(section.dataset.step) === addOrgStep);
  });

  addOrgStepper.querySelectorAll(".bo-step").forEach((step_) => {
    const n = Number(step_.dataset.stepNav);
    step_.classList.toggle("active", n === addOrgStep);
    step_.classList.toggle("done", n < addOrgStep);
  });

  backAddOrgBtn.hidden = addOrgStep === 1;
  nextAddOrgBtn.hidden = addOrgStep === stepCount;
  saveAddOrgBtn.hidden = addOrgStep !== stepCount;

  addOrgForm.closest(".bo-fullscreen-body")?.scrollTo({ top: 0 });
}

/* Add and Edit share this panel; editingOrgId is the organization being
   edited, or null when adding a new one. */
let editingOrgId = null;

function openAddOrgModal() {
  editingOrgId = null;
  document.getElementById("addOrgTitle").textContent = "Add Organization";
  saveAddOrgBtn.textContent = "Save";
  addOrgForm.reset();
  addOrgForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  addOrgForm.querySelectorAll("[data-ehr-scope]").forEach((el) => el.clearScope());
  addOrgForm.querySelectorAll("[data-base-url-field]").forEach((el) => { el.hidden = true; });
  resetEhrRows();
  syncEhrStepVisibility();
  validateAddOrgForm();
  goToAddOrgStep(1);
  addOrgOverlay.classList.add("open");
}

/* Edit Organization: the same steps and fields as Add Organization,
   pre-filled with what the organization already has. */
function openEditOrgModal(id) {
  const org = orgs.find((o) => o.id === id);
  if (!org) return;
  openAddOrgModal();
  editingOrgId = id;
  document.getElementById("addOrgTitle").textContent = `Edit Organization — ${org.name}`;
  saveAddOrgBtn.textContent = "Save Changes";

  const f = addOrgForm;
  const select = (name, value) => {
    const el = f.querySelector(`.bo-select[data-name="${name}"]`);
    if (el && value) setBoSelectValue(el, value, { silent: true });
  };
  f.name.value = org.name;
  f.displayName.value = org.name;
  f.target.value = org.target ?? "";
  f.onDashboard.checked = !!org.onDashboard;
  f.careRec.checked = !!org.careRec;
  f.medicationModule.checked = !!org.medicationModule;
  f.supportModule.checked = !!org.supportModule;
  f.phone1.value = org.phone || "";
  const [lat, lng] = (org.latLng || "").split("/").map((v) => v.trim());
  f.lat.value = lat || "";
  f.lng.value = lng || "";
  f.consentPath.value = org.docPath || "";
  select("type", org.type);
  select("study", org.study);
  select("defaultTag", org.tag);
  select("authType", org.authType);
  select("defaultLanguage", org.lng);

  /* EHR connection on turns on the EHR step, first connection pre-filled. */
  if (org.ehrEnabled) {
    f.enableEhrConnection.checked = true;
    syncEhrStepVisibility();
    select("ehr1Name", org.ehr[0]);
  }
  validateAddOrgForm();
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
addOrgForm.enableEhrConnection.addEventListener("change", syncEhrStepVisibility);

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
  const org = editingOrgId !== null && orgs.find((o) => o.id === editingOrgId);
  if (org) {
    const value = (name) => addOrgForm.querySelector(`.bo-select[data-name="${name}"] input[type=hidden]`)?.value;
    org.name = addOrgForm.name.value.trim();
    org.target = Number(addOrgForm.target.value) || 0;
    org.onDashboard = addOrgForm.onDashboard.checked;
    org.careRec = addOrgForm.careRec.checked;
    org.medicationModule = addOrgForm.medicationModule.checked;
    org.supportModule = addOrgForm.supportModule.checked;
    org.ehrEnabled = addOrgForm.enableEhrConnection.checked;
    org.phone = addOrgForm.phone1.value.trim();
    org.latLng = `${addOrgForm.lat.value.trim() || 0} / ${addOrgForm.lng.value.trim() || 0}`;
    org.docPath = addOrgForm.consentPath.value.trim();
    org.type = value("type") || org.type;
    org.study = value("study") || org.study;
    org.tag = value("defaultTag") || org.tag;
    org.authType = value("authType") || org.authType;
    org.lng = value("defaultLanguage") || org.lng;
    renderOrgs();
  }
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
    removeBtn.hidden = fields.length === 1;
  });
  addEhrConnRowBtn.disabled = fields.length >= EHR_MAX;
  addEhrConnRowBtn.style.display = fields.length >= EHR_MAX ? "none" : "";
}

function addEhrConnRow(presetName) {
  if (ehrConnRowFields().length >= EHR_MAX) return;
  ehrConnRowCount += 1;
  const n = ehrConnRowCount;

  const card = document.createElement("div");
  card.className = "bo-ehr-card bo-ehr-card--plain";
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
      ${ehrScopeFieldHtml("ehrConn", n)}
      ${ehrBaseUrlFieldHtml("ehrConn", n)}
    </div>
  `;

  ehrConnRowsWrap.appendChild(card);
  initBoSelects(card);
  initEhrScopes(card);
  wireEhrBaseUrlToggle(card, "ehrConn", n);

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
