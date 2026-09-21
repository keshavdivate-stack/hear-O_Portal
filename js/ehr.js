/* ---------------- EHR page: connected EHRs list + Connect EHR modal ----------------
   The modal mirrors step 5 (EHR Connection Details) of the Backoffice
   "Add Organization" wizard: up to 3 connection cards, each with EHR Name,
   Environment, Client Id, Client Secret and a multiselect Scope. */
const EHR_MAX = 3;
const EHR_NAMES = ["Athena", "ECW", "Epic"];
const EHR_ENVIRONMENTS = ["Sandbox", "Production"];
/* Scopes granted by the EHR (as listed on the URL the EHR/Epic sends back). */
const EHR_SCOPES = ["patient/*.read", "patient/*.write", "user/*.read", "user/*.write", "launch", "openid", "fhirUser", "offline_access"];

const CHECK_ICON = `<svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECKBOX_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CARET_ICON = (cls) => `<svg class="${cls}" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

const connections = [
  { ehr: "Epic", env: "Production", clientId: "a1f3c9d2-77be-4e10-9c55-0d2e8b41f6a7", scope: ["patient/*.read", "launch", "openid"] },
];

/* ---------------- List ---------------- */
const ehrListRows = document.getElementById("ehrListRows");
const ehrConnectedCount = document.getElementById("ehrConnectedCount");
const ehrConnectedHint = document.getElementById("ehrConnectedHint");
const ehrRangeLabel = document.getElementById("ehrRangeLabel");
const openConnectEhrBtn = document.getElementById("openConnectEhrBtn");

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderConnections() {
  ehrConnectedCount.textContent = connections.length;
  ehrConnectedHint.textContent = `of ${EHR_MAX} available`;
  ehrRangeLabel.textContent = connections.length ? `1-${connections.length} of ${connections.length}` : "0 of 0";
  openConnectEhrBtn.disabled = connections.length >= EHR_MAX;

  if (!connections.length) {
    ehrListRows.innerHTML = `<tr><td colspan="6" class="ehr-empty">No EHR connected yet. Use "Connect EHR" to add one.</td></tr>`;
    return;
  }

  ehrListRows.innerHTML = connections
    .map(
      (c, i) => `<tr>
        <td><strong>${escapeHtml(c.ehr)}</strong></td>
        <td>${escapeHtml(c.env)}</td>
        <td>${escapeHtml(c.clientId)}</td>
        <td>${c.scope.length ? escapeHtml(c.scope.join(", ")) : "—"}</td>
        <td><span class="ehr-status-pill">Connected</span></td>
        <td><a class="ticket-view-link" href="#" data-disconnect="${i}">Disconnect</a></td>
      </tr>`
    )
    .join("");
}

ehrListRows.addEventListener("click", (e) => {
  const link = e.target.closest("[data-disconnect]");
  if (!link) return;
  e.preventDefault();
  connections.splice(Number(link.dataset.disconnect), 1);
  renderConnections();
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
    valueEl.textContent = chosen.length ? chosen.join(", ") : placeholderText;
    valueEl.classList.toggle("placeholder", chosen.length === 0);
    hidden.value = chosen.join(",");
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
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
}

/* ---------------- Connect EHR modal ---------------- */
const connectEhrOverlay = document.getElementById("connectEhrOverlay");
const connectEhrForm = document.getElementById("connectEhrForm");
const ehrRowsWrap = document.getElementById("ehrRowsWrap");
const addEhrRowBtn = document.getElementById("addEhrRowBtn");
const saveConnectEhrBtn = document.getElementById("saveConnectEhr");
let ehrRowCount = 0;

function ehrCards() {
  return Array.from(ehrRowsWrap.querySelectorAll("[data-ehr-row]"));
}

function relabelEhrCards() {
  const cards = ehrCards();
  cards.forEach((card, i) => {
    card.querySelector(".ehr-card-title").textContent = `EHR Connection ${i + 1}`;
    card.querySelector(".ehr-card-remove").disabled = cards.length === 1;
  });
  addEhrRowBtn.style.display = cards.length >= EHR_MAX - connections.length ? "none" : "";
}

function validateConnectEhrForm() {
  const valid = ehrCards().every((card) =>
    ["ehrName", "ehrEnv", "clientId", "clientSecret"].every((n) => card.querySelector(`[name="${n}"]`).value.trim() !== "")
  );
  saveConnectEhrBtn.disabled = !valid;
  saveConnectEhrBtn.classList.toggle("enabled", valid);
}

function addEhrCard() {
  if (ehrCards().length >= EHR_MAX - connections.length) return;
  ehrRowCount += 1;

  const card = document.createElement("div");
  card.className = "ehr-card";
  card.setAttribute("data-ehr-row", "");
  card.innerHTML = `
    <div class="ehr-card-head">
      <span class="ehr-card-title"></span>
      <button type="button" class="ehr-card-remove" aria-label="Remove EHR connection">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>
      </button>
    </div>
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
      <div class="form-field" style="grid-column: span 2;">
        <label>Scope</label>
        ${multiSelectHtml("scope", "Choose scope")}
      </div>
      <div class="form-field" style="grid-column: 1 / -1;">
        <label>URL</label>
        <input type="text" name="url" placeholder="Enter URL" />
      </div>
    </div>`;

  ehrRowsWrap.appendChild(card);
  card.querySelectorAll(".custom-select").forEach((s) => wireSingleSelect(s, validateConnectEhrForm));
  wireMultiSelect(card.querySelector(".ehr-multiselect"), EHR_SCOPES, validateConnectEhrForm);
  card.querySelectorAll("input[type=text]").forEach((i) => i.addEventListener("input", validateConnectEhrForm));

  card.querySelector(".ehr-card-remove").addEventListener("click", () => {
    card.remove();
    relabelEhrCards();
    validateConnectEhrForm();
  });

  relabelEhrCards();
  validateConnectEhrForm();
}

function openConnectEhrModal() {
  if (connections.length >= EHR_MAX) return;
  ehrRowsWrap.innerHTML = "";
  ehrRowCount = 0;
  addEhrCard();
  connectEhrOverlay.classList.add("open");
}

function closeConnectEhrModal() {
  closeAllEhrDropdowns();
  connectEhrOverlay.classList.remove("open");
}

openConnectEhrBtn.addEventListener("click", openConnectEhrModal);
addEhrRowBtn.addEventListener("click", addEhrCard);
document.getElementById("closeConnectEhrX").addEventListener("click", closeConnectEhrModal);
document.getElementById("cancelConnectEhr").addEventListener("click", closeConnectEhrModal);
connectEhrOverlay.addEventListener("click", (e) => { if (e.target === connectEhrOverlay) closeConnectEhrModal(); });

connectEhrForm.addEventListener("submit", (e) => {
  e.preventDefault();
  ehrCards().forEach((card) => {
    const val = (n) => card.querySelector(`[name="${n}"]`).value.trim();
    connections.push({
      ehr: val("ehrName"),
      env: val("ehrEnv"),
      clientId: val("clientId"),
      url: val("url"),
      scope: val("scope") ? val("scope").split(",") : [],
    });
  });
  renderConnections();
  closeConnectEhrModal();
});

renderConnections();
