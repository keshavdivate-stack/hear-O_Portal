/* ---------------- EHR page: connected EHRs list + Connect EHR modal ----------------
   The modal mirrors step 5 (EHR Connection Details) of the Backoffice
   "Add Organization" wizard: up to 3 connection cards, each with EHR Name,
   Environment, Client Id, Client Secret and a multiselect Scope. */
const EHR_MAX = 3;
const EHR_NAMES = ["Athena", "ECW", "Epic"];
const EHR_ENVIRONMENTS = ["Sandbox", "Production"];
/* Scopes granted by the EHR (as listed on the URL the EHR/Epic sends back). */
const EHR_SCOPES = ["openid", "fhirUser", "offline_access", "user/Patient.read", "user/Patient.write", "user/Practitioner.read", "user/PractitionerRole.read", "user/Organization.read", "user/Encounter.read", "user/RelatedPerson.read", "user/CareTeam.read", "user/CarePlan.read", "user/Goal.read", "user/Flag.read", "user/List.read", "user/AllergyIntolerance.read", "user/AllergyIntolerance.write", "user/Condition.read", "user/Condition.write", "user/Observation.read", "user/Observation.write", "user/MedicationRequest.read", "user/Medication.read", "user/MedicationDispense.read", "user/MedicationAdministration.read", "user/DocumentReference.read", "user/DocumentReference.write", "user/Binary.read"];

const CHECK_ICON = `<svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECKBOX_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CARET_ICON = (cls) => `<svg class="${cls}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

/* One row per supported EHR. A row is "connected" once its credentials have been
   saved through the Connect EHR modal; Athena keeps previously entered (unsaved)
   details so the modal shows them pre-filled. */
const ehrs = [
  { ehr: "Epic", env: "Production", clientId: "a1f3c9d2-77be-4e10-9c55-0d2e8b41f6a7", clientSecret: "••••••••", scope: ["openid", "fhirUser", "user/Patient.read"], url: "https://fhir.epic.com/interconnect-fhir-oauth", connected: true },
  { ehr: "Athena", env: "Sandbox", clientId: "ath-5521-9be0", clientSecret: "", scope: ["user/Patient.read", "user/Observation.read"], url: "", connected: false },
  { ehr: "ECW", env: "", clientId: "", clientSecret: "", scope: [], url: "", connected: false },
];

/* ---------------- List ---------------- */
const ehrListRows = document.getElementById("ehrListRows");
const ehrRangeLabel = document.getElementById("ehrRangeLabel");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderConnections() {
  ehrRangeLabel.textContent = `1-${ehrs.length} of ${ehrs.length}`;

  ehrListRows.innerHTML = ehrs
    .map(
      (c, i) => `<tr>
        <td><strong>${escapeHtml(c.ehr)}</strong></td>
        <td>${c.env ? escapeHtml(c.env) : "—"}</td>
        <td>${c.clientId ? escapeHtml(c.clientId) : "—"}</td>
        <td>${c.scope.length ? escapeHtml(c.scope.join(", ")) : "—"}</td>
        <td><span class="ehr-status-pill${c.connected ? "" : " off"}">${c.connected ? "Connected" : "Not Connected"}</span></td>
        <td><a class="ticket-view-link" href="#" data-${c.connected ? "disconnect" : "connect"}="${i}">${c.connected ? "Disconnect" : "Connect"}</a></td>
      </tr>`
    )
    .join("");
}

ehrListRows.addEventListener("click", (e) => {
  const link = e.target.closest("[data-connect], [data-disconnect]");
  if (!link) return;
  e.preventDefault();
  if (link.dataset.connect !== undefined) {
    openConnectEhrModal(Number(link.dataset.connect));
  } else {
    ehrs[Number(link.dataset.disconnect)].connected = false;
    renderConnections();
  }
});
/* ---------------- Dropdown plumbing ---------------- */
function positionMenu(container, menuSel, triggerSel, maxH) {
  const rect = container.querySelector(triggerSel).getBoundingClientRect();
  const menu = container.querySelector(menuSel);
  const menuHeight = Math.min(menu.scrollHeight, maxH) + 12;
  const openUpward = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function closeAllEhrDropdowns() {
  document.querySelectorAll(".custom-select.open, .ehr-multiselect.open").forEach((el) => el.classList.remove("open"));
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".custom-select, .ehr-multiselect")) closeAllEhrDropdowns();
});
document.addEventListener("scroll", closeAllEhrDropdowns, true);
window.addEventListener("resize", closeAllEhrDropdowns);

function singleSelectHtml(name, placeholder, values) {
  return `
    <div class="custom-select" data-name="${name}">
      <button type="button" class="custom-select-trigger">
        <span class="custom-select-value placeholder">${placeholder}</span>
        ${CARET_ICON("custom-select-caret")}
      </button>
      <div class="custom-select-menu">
        ${values.map((v) => `<div class="custom-select-option" data-value="${v}">${v}${CHECK_ICON}</div>`).join("")}
      </div>
      <input type="hidden" name="${name}" />
    </div>`;
}

function wireSingleSelect(select, onChange) {
  const trigger = select.querySelector(".custom-select-trigger");
  const valueEl = select.querySelector(".custom-select-value");
  const hidden = select.querySelector("input[type=hidden]");

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    closeAllEhrDropdowns();
    if (willOpen) {
      positionMenu(select, ".custom-select-menu", ".custom-select-trigger", 220);
      select.classList.add("open");
    }
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-select-option");
    if (!option) return;
    select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.toggle("selected", o === option));
    valueEl.textContent = option.dataset.value;
    valueEl.classList.remove("placeholder");
    hidden.value = option.dataset.value;
    select.classList.remove("open");
    onChange();
  });
}

function multiSelectHtml(name, placeholder) {
  return `
    <div class="ehr-multiselect" data-name="${name}">
      <button type="button" class="ehr-multiselect-trigger">
        <span class="ehr-multiselect-value placeholder">${placeholder}</span>
        ${CARET_ICON("ehr-multiselect-caret")}
      </button>
      <div class="ehr-multiselect-menu"></div>
      <input type="hidden" name="${name}" />
    </div>`;
}

function wireMultiSelect(container, values, onChange) {
  const trigger = container.querySelector(".ehr-multiselect-trigger");
  const valueEl = container.querySelector(".ehr-multiselect-value");
  const menu = container.querySelector(".ehr-multiselect-menu");
  const hidden = container.querySelector("input[type=hidden]");
  const placeholderText = valueEl.textContent.trim();
  const selected = new Set();

  function render() {
    menu.innerHTML = values
      .map(
        (v) => `<label class="ehr-multiselect-option${selected.has(v) ? " checked" : ""}" data-value="${v}">
          <span class="ehr-multiselect-checkbox">${CHECKBOX_ICON}</span> ${v}
        </label>`
      )
      .join("");
    const chosen = values.filter((v) => selected.has(v));
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
      if (container.classList.contains("open")) positionMenu(container, ".ehr-multiselect-menu", ".ehr-multiselect-trigger", 240);
      onChange();
      return;
    }
    const willOpen = !container.classList.contains("open");
    closeAllEhrDropdowns();
    if (willOpen) {
      positionMenu(container, ".ehr-multiselect-menu", ".ehr-multiselect-trigger", 240);
      container.classList.add("open");
    }
  });

  menu.addEventListener("click", (e) => {
    const option = e.target.closest(".ehr-multiselect-option");
    if (!option) return;
    e.preventDefault();
    e.stopPropagation();
    const v = option.dataset.value;
    if (selected.has(v)) selected.delete(v);
    else selected.add(v);
    render();
    positionMenu(container, ".ehr-multiselect-menu", ".ehr-multiselect-trigger", 240);
    onChange();
  });

  render();
  return {
    setSelected: (vals) => { selected.clear(); vals.forEach((v) => selected.add(v)); render(); },
  };
}

/* ---------------- Connect EHR modal ----------------
   Mirrors step 5 (EHR Connection Details) of the Backoffice "Add Organization"
   wizard, opened for one EHR row and pre-filled from it. */
const connectEhrOverlay = document.getElementById("connectEhrOverlay");
const connectEhrForm = document.getElementById("connectEhrForm");
const ehrRowsWrap = document.getElementById("ehrRowsWrap");
const saveConnectEhrBtn = document.getElementById("saveConnectEhr");
let activeEhrIndex = null;

function prefillSingleSelect(select, value) {
  const option = Array.from(select.querySelectorAll(".custom-select-option")).find((o) => o.dataset.value === value);
  if (!option) return;
  option.classList.add("selected");
  const valueEl = select.querySelector(".custom-select-value");
  valueEl.textContent = value;
  valueEl.classList.remove("placeholder");
  select.querySelector("input[type=hidden]").value = value;
}

function validateConnectEhrForm() {
  const card = ehrRowsWrap.querySelector("[data-ehr-row]");
  const valid = ["ehrName", "ehrEnv", "clientId", "clientSecret"].every((n) => card.querySelector(`[name="${n}"]`).value.trim() !== "");
  saveConnectEhrBtn.disabled = !valid;
  saveConnectEhrBtn.classList.toggle("enabled", valid);
}

function openConnectEhrModal(index) {
  const row = ehrs[index];
  activeEhrIndex = index;

  ehrRowsWrap.innerHTML = `
    <div class="ehr-card" data-ehr-row>
      <div class="ehr-card-head"><span class="ehr-card-title">EHR Connection</span></div>
      <div class="form-grid">
        <div class="form-field">
          <label>EHR Name<span class="required-star">*</span></label>
          ${singleSelectHtml("ehrName", "Choose", EHR_NAMES)}
        </div>
        <div class="form-field">
          <label>Environment<span class="required-star">*</span></label>
          ${singleSelectHtml("ehrEnv", "Choose", EHR_ENVIRONMENTS)}
        </div>
        <div class="form-field">
          <label>Client Id<span class="required-star">*</span></label>
          <input type="text" name="clientId" placeholder="Enter Client ID" />
        </div>
        <div class="form-field">
          <label>Client Secret<span class="required-star">*</span></label>
          <input type="text" name="clientSecret" placeholder="Enter Client Secret" />
        </div>
        <div class="form-field" style="grid-column: 1 / -1;">
          <label>Scope</label>
          ${multiSelectHtml("scope", "Choose scope")}
        </div>
        <div class="form-field" style="grid-column: 1 / -1;">
          <label>URL</label>
          <input type="text" name="url" placeholder="Enter URL" />
        </div>
      </div>
    </div>`;

  const card = ehrRowsWrap.firstElementChild;
  card.querySelectorAll(".custom-select").forEach((s) => wireSingleSelect(s, validateConnectEhrForm));
  const scopeApi = wireMultiSelect(card.querySelector(".ehr-multiselect"), EHR_SCOPES, validateConnectEhrForm);
  card.querySelectorAll("input[type=text]").forEach((i) => i.addEventListener("input", validateConnectEhrForm));

  /* Auto-select from the table row; the EHR itself is fixed by the row. */
  const [nameSelect, envSelect] = card.querySelectorAll(".custom-select");
  prefillSingleSelect(nameSelect, row.ehr);
  nameSelect.querySelector(".custom-select-trigger").disabled = true;
  if (row.env) prefillSingleSelect(envSelect, row.env);
  card.querySelector('[name="clientId"]').value = row.clientId;
  card.querySelector('[name="clientSecret"]').value = row.clientSecret;
  card.querySelector('[name="url"]').value = row.url || "";
  scopeApi.setSelected(row.scope);

  validateConnectEhrForm();
  connectEhrOverlay.classList.add("open");
}

function closeConnectEhrModal() {
  closeAllEhrDropdowns();
  connectEhrOverlay.classList.remove("open");
}

document.getElementById("closeConnectEhrX").addEventListener("click", closeConnectEhrModal);
document.getElementById("cancelConnectEhr").addEventListener("click", closeConnectEhrModal);
connectEhrOverlay.addEventListener("click", (e) => { if (e.target === connectEhrOverlay) closeConnectEhrModal(); });

connectEhrForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const card = ehrRowsWrap.firstElementChild;
  const val = (n) => card.querySelector(`[name="${n}"]`).value.trim();
  Object.assign(ehrs[activeEhrIndex], {
    env: val("ehrEnv"),
    clientId: val("clientId"),
    clientSecret: val("clientSecret"),
    scope: val("scope") ? val("scope").split(",") : [],
    url: val("url"),
    connected: true,
  });
  renderConnections();
  closeConnectEhrModal();
});

renderConnections();