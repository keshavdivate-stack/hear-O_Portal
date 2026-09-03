const selectedTypes = new Set();
const selectedCategories = new Set();
const selectedIssueTypes = new Set();
const selectedOrigins = new Set();
const selectedSeverities = new Set();
const selectedStates = new Set();
/* Assigned Ticket used to be hard-locked to CURRENT_ASSIGNEE's own tickets;
   now it defaults to "just mine" via this filter (pre-checked below) but can
   be widened to see what's assigned to any teammate. */
const selectedAssignees = new Set([CURRENT_ASSIGNEE]);
let ticketSearchTerm = "";

function filteredTicketList() {
  const term = ticketSearchTerm.trim().toLowerCase();
  return ticketList.filter((t) => {
    if (selectedTypes.size && !selectedTypes.has(t.type)) return false;
    if (selectedCategories.size && !selectedCategories.has(t.category)) return false;
    if (selectedIssueTypes.size && !selectedIssueTypes.has(t.issueType)) return false;
    if (selectedOrigins.size && !selectedOrigins.has(t.origin)) return false;
    if (selectedSeverities.size && !selectedSeverities.has(t.severity)) return false;
    if (selectedStates.size && !selectedStates.has(t.state)) return false;
    if (selectedAssignees.size && !selectedAssignees.has(t.assignedTo)) return false;
    if (term && !`${t.ticketId} ${t.who} ${t.patientName || ""} ${t.organization}`.toLowerCase().includes(term)) return false;
    return true;
  });
}

const ticketRows = document.getElementById("ticketListRows");
const ticketRangeLabel = document.getElementById("ticketRangeLabel");

function renderTicketList() {
  const list = filteredTicketList();
  ticketRows.innerHTML = list
    .map(
      (t) => `
      <tr>
        <td><b>${t.ticketId}</b></td>
        <td><span class="ticket-pill ${typeCellClass(t.type)}">${t.type}</span></td>
        <td>${
          t.type === "Patient"
            ? `<a class="ticket-view-link" href="patient-data.html">${t.patientName || t.who}</a><span class="ticket-who-id">${t.who}</span>`
            : t.who
        }</td>
        <td><span class="ticket-pill ticket-pill-category">${t.category}</span></td>
        <td>${t.issueType}</td>
        <td><span class="ticket-pill ${severityCellClass(t.severity)}">${t.severity}</span></td>
        <td><span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span></td>
        <td>${t.created}</td>
        <td>${t.assignedTo}</td>
        <td><a class="ticket-view-link" href="ticket-detail.html?id=${t.id}">View</a></td>
      </tr>`
    )
    .join("");
  ticketRangeLabel.textContent = list.length ? `1-${list.length} of ${list.length}` : "";
  if (!list.length) {
    ticketRows.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--gray-text); padding:24px;">No tickets match the current filters.</td></tr>`;
  }
}

renderTicketList();

/* ---------------- Filter menu portaling (matches patient-list.js) ---------------- */
const portaledFilterMenus = new Map();

function positionFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function openFilterMenu(wrapEl, menuEl) {
  if (!portaledFilterMenus.has(menuEl)) {
    portaledFilterMenus.set(menuEl, { parent: menuEl.parentNode, next: menuEl.nextSibling });
  }
  document.body.appendChild(menuEl);
  menuEl.classList.add("checkbox-filter-menu-portaled");
  positionFilterMenu(wrapEl.querySelector(".filter-btn"), menuEl);
}

function closeFilterMenu(menuEl) {
  const original = portaledFilterMenus.get(menuEl);
  if (original && menuEl.parentNode === document.body) {
    if (original.next && original.next.parentNode === original.parent) {
      original.parent.insertBefore(menuEl, original.next);
    } else {
      original.parent.appendChild(menuEl);
    }
  }
  menuEl.classList.remove("checkbox-filter-menu-portaled");
  menuEl.style.position = "";
  menuEl.style.left = "";
  menuEl.style.top = "";
  menuEl.style.bottom = "";
  menuEl.style.minWidth = "";
}

function wireCheckboxFilter(wrapEl, menuEl, selectedSet, onChange) {
  const trigger = wrapEl.querySelector(".filter-btn");
  const label = wrapEl.querySelector(".checkbox-filter-label");
  const baseLabel = label.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrapEl.classList.contains("open");
    closeAllFilterPopovers();
    wrapEl.classList.toggle("open", willOpen);
    if (willOpen) openFilterMenu(wrapEl, menuEl);
  });

  menuEl.addEventListener("click", (e) => e.stopPropagation());

  menuEl.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selectedSet.add(checkbox.value);
    else selectedSet.delete(checkbox.value);

    label.textContent = selectedSet.size ? `${baseLabel} (${selectedSet.size})` : baseLabel;
    onChange();
  });
}

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeFilterMenu(menuEl));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- Filter menus ---------------- */
function buildOptionsHtml(options) {
  return options.map((o) => `<label class="checkbox-filter-option"><input type="checkbox" value="${o.key}" />${o.label}</label>`).join("");
}

const ticketTypeMenu = document.getElementById("ticketTypeMenu");
ticketTypeMenu.innerHTML = buildOptionsHtml(ticketTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="type"]'), ticketTypeMenu, selectedTypes, renderTicketList);

const ticketCategoryMenu = document.getElementById("ticketCategoryMenu");
ticketCategoryMenu.innerHTML = buildOptionsHtml(ticketCategories);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="category"]'), ticketCategoryMenu, selectedCategories, renderTicketList);

const allIssueTypes = [...new Set(ticketList.map((t) => t.issueType))].map((v) => ({ key: v, label: v }));
const ticketIssueMenu = document.getElementById("ticketIssueMenu");
ticketIssueMenu.innerHTML = buildOptionsHtml(allIssueTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="issueType"]'), ticketIssueMenu, selectedIssueTypes, renderTicketList);

const ticketOriginMenu = document.getElementById("ticketOriginMenu");
ticketOriginMenu.innerHTML = buildOptionsHtml(ticketOrigins);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="origin"]'), ticketOriginMenu, selectedOrigins, renderTicketList);

const ticketSeverityMenu = document.getElementById("ticketSeverityMenu");
ticketSeverityMenu.innerHTML = buildOptionsHtml(ticketSeverities);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="severity"]'), ticketSeverityMenu, selectedSeverities, renderTicketList);

const ticketStateMenu = document.getElementById("ticketStateMenu");
ticketStateMenu.innerHTML = buildOptionsHtml(ticketStates);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="state"]'), ticketStateMenu, selectedStates, renderTicketList);

const allAssignees = [...new Set(ticketList.map((t) => t.assignedTo))].map((v) => ({ key: v, label: v }));
const ticketAssignedToMenu = document.getElementById("ticketAssignedToMenu");
ticketAssignedToMenu.innerHTML = allAssignees
  .map((o) => `<label class="checkbox-filter-option"><input type="checkbox" value="${o.key}" ${selectedAssignees.has(o.key) ? "checked" : ""} />${o.label}</label>`)
  .join("");
{
  const assignedToFilterWrap = document.querySelector('.checkbox-filter[data-name="assignedTo"]');
  assignedToFilterWrap.querySelector(".checkbox-filter-label").textContent = `Assigned To (${selectedAssignees.size})`;
  wireCheckboxFilter(assignedToFilterWrap, ticketAssignedToMenu, selectedAssignees, renderTicketList);
}

/* ---------------- Search ---------------- */
document.getElementById("ticketSearchInput").addEventListener("input", (e) => {
  ticketSearchTerm = e.target.value;
  renderTicketList();
});

/* ---------------- Clear all filters ---------------- */
const clearableTicketFilters = [
  { name: "type", menu: ticketTypeMenu, set: selectedTypes, label: "Type" },
  { name: "category", menu: ticketCategoryMenu, set: selectedCategories, label: "Category" },
  { name: "issueType", menu: ticketIssueMenu, set: selectedIssueTypes, label: "Issue Type" },
  { name: "origin", menu: ticketOriginMenu, set: selectedOrigins, label: "Origin" },
  { name: "severity", menu: ticketSeverityMenu, set: selectedSeverities, label: "Severity" },
  { name: "state", menu: ticketStateMenu, set: selectedStates, label: "State" },
  { name: "assignedTo", menu: ticketAssignedToMenu, set: selectedAssignees, label: "Assigned To" },
];

document.getElementById("clearTicketFilters").addEventListener("click", () => {
  document.getElementById("ticketSearchInput").value = "";
  ticketSearchTerm = "";
  clearableTicketFilters.forEach(({ name, menu, set, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.querySelector(`.checkbox-filter[data-name="${name}"] .checkbox-filter-label`).textContent = label;
  });
  renderTicketList();
});

/* ---------------- Tabs: Raised by Clinic / Assigned to Clinic ---------------- */
document.querySelectorAll("#supportTicketTabs .page-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#supportTicketTabs .page-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.querySelector(`.tab-panel[data-tab-panel="${tab.dataset.tab}"]`).classList.add("active");
  });
});

/* ---------------- Raised by Clinic ----------------
   Mirrors the "Support Ticket" floating button's own definition of "this
   clinic's tickets" (js/topbar.js) -- Clinic-type tickets scoped to the
   org currently selected in the topbar switcher. */
function currentOrg() {
  const checked = document.querySelector('input[name="org"]:checked');
  return (checked ? checked.value : "b01").toUpperCase();
}

let raisedTicketSearchTerm = "";
const selectedRaisedCategories = new Set();
const selectedRaisedIssueTypes = new Set();
const selectedRaisedSeverities = new Set();
const selectedRaisedStates = new Set();

function raisedTicketList() {
  const term = raisedTicketSearchTerm.trim().toLowerCase();
  const org = currentOrg();
  return ticketList.filter((t) => {
    if (t.type !== "Clinic" || t.organization.toUpperCase() !== org) return false;
    if (selectedRaisedCategories.size && !selectedRaisedCategories.has(t.category)) return false;
    if (selectedRaisedIssueTypes.size && !selectedRaisedIssueTypes.has(t.issueType)) return false;
    if (selectedRaisedSeverities.size && !selectedRaisedSeverities.has(t.severity)) return false;
    if (selectedRaisedStates.size && !selectedRaisedStates.has(t.state)) return false;
    if (term && !`${t.ticketId} ${t.who} ${t.issueType}`.toLowerCase().includes(term)) return false;
    return true;
  });
}

const raisedTicketRows = document.getElementById("raisedTicketRows");
const raisedTicketRangeLabel = document.getElementById("raisedTicketRangeLabel");

function renderRaisedTicketList() {
  const list = raisedTicketList();
  raisedTicketRows.innerHTML = list
    .map(
      (t) => `
      <tr>
        <td><b>${t.ticketId}</b></td>
        <td>${t.who}</td>
        <td><span class="ticket-pill ticket-pill-category">${t.category}</span></td>
        <td>${t.issueType}</td>
        <td><span class="ticket-pill ${severityCellClass(t.severity)}">${t.severity}</span></td>
        <td><span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span></td>
        <td>${t.created}</td>
        <td><a class="ticket-view-link" href="ticket-detail.html?id=${t.id}">View</a></td>
      </tr>`
    )
    .join("");
  raisedTicketRangeLabel.textContent = list.length ? `1-${list.length} of ${list.length}` : "";
  if (!list.length) {
    raisedTicketRows.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--gray-text); padding:24px;">No tickets raised by this clinic yet.</td></tr>`;
  }
}
renderRaisedTicketList();

document.getElementById("raisedTicketSearchInput").addEventListener("input", (e) => {
  raisedTicketSearchTerm = e.target.value;
  renderRaisedTicketList();
});
document.querySelectorAll('input[name="org"]').forEach((radio) => radio.addEventListener("change", renderRaisedTicketList));

/* ---------------- Raised by Clinic: filters ---------------- */
const raisedCategoryMenu = document.getElementById("raisedCategoryMenu");
raisedCategoryMenu.innerHTML = buildOptionsHtml(ticketCategories);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="raisedCategory"]'), raisedCategoryMenu, selectedRaisedCategories, renderRaisedTicketList);

const raisedIssueTypeMenu = document.getElementById("raisedIssueTypeMenu");
raisedIssueTypeMenu.innerHTML = buildOptionsHtml(allIssueTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="raisedIssueType"]'), raisedIssueTypeMenu, selectedRaisedIssueTypes, renderRaisedTicketList);

const raisedSeverityMenu = document.getElementById("raisedSeverityMenu");
raisedSeverityMenu.innerHTML = buildOptionsHtml(ticketSeverities);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="raisedSeverity"]'), raisedSeverityMenu, selectedRaisedSeverities, renderRaisedTicketList);

const raisedStateMenu = document.getElementById("raisedStateMenu");
raisedStateMenu.innerHTML = buildOptionsHtml(ticketStates);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="raisedState"]'), raisedStateMenu, selectedRaisedStates, renderRaisedTicketList);

const clearableRaisedTicketFilters = [
  { name: "raisedCategory", menu: raisedCategoryMenu, set: selectedRaisedCategories, label: "Category" },
  { name: "raisedIssueType", menu: raisedIssueTypeMenu, set: selectedRaisedIssueTypes, label: "Issue Type" },
  { name: "raisedSeverity", menu: raisedSeverityMenu, set: selectedRaisedSeverities, label: "Severity" },
  { name: "raisedState", menu: raisedStateMenu, set: selectedRaisedStates, label: "State" },
];

document.getElementById("clearRaisedTicketFilters").addEventListener("click", () => {
  document.getElementById("raisedTicketSearchInput").value = "";
  raisedTicketSearchTerm = "";
  clearableRaisedTicketFilters.forEach(({ name, menu, set, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.querySelector(`.checkbox-filter[data-name="${name}"] .checkbox-filter-label`).textContent = label;
  });
  renderRaisedTicketList();
});

/* ---------------- Custom dropdowns (Create Ticket modal) ----------------
   The .custom-select engine itself (setCustomSelectValue, initCustomSelects,
   etc.) now lives in js/custom-select.js, shared with ticket-detail.html. */

/* ---------------- Create Ticket modal ---------------- */
const createTicketOverlay = document.getElementById("createTicketOverlay");
const createTicketForm = document.getElementById("createTicketForm");
const saveCreateTicketBtn = document.getElementById("saveCreateTicket");
const createTicketCategorySelect = document.querySelector('#createTicketOverlay .custom-select[data-name="category"]');
const createTicketIssueSelect = document.querySelector('#createTicketOverlay .custom-select[data-name="issueType"]');
const createTicketSeveritySelect = document.querySelector('#createTicketOverlay .custom-select[data-name="severity"]');
const createTicketLevelSelect = document.querySelector('#createTicketOverlay .custom-select[data-name="level"]');
const createTicketAssignedToSelect = document.querySelector('#createTicketOverlay .custom-select[data-name="assignedTo"]');

/* The logged-in clinic user (avatar "EC" in the topbar) raises the ticket --
   no need to ask them to pick their own name from a list. */
const CURRENT_USER = "Emily Carter";

createTicketCategorySelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketCategories.map((c) => c.label));
createTicketSeveritySelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketSeverities.map((s) => s.label));
createTicketLevelSelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketLevels.map((l) => l.label));
createTicketAssignedToSelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(SUPPORT_TEAM_MEMBERS);

function resetCreateTicketIssueSelect() {
  const trigger = createTicketIssueSelect.querySelector(".custom-select-trigger");
  const valueEl = createTicketIssueSelect.querySelector(".custom-select-value");
  createTicketIssueSelect.querySelector(".custom-select-menu").innerHTML = "";
  resetCustomSelect(createTicketIssueSelect);
  trigger.disabled = true;
  valueEl.dataset.placeholder = "Choose category first";
  valueEl.textContent = "Choose category first";
  valueEl.classList.add("placeholder");
}

createTicketCategorySelect.querySelector("input[type=hidden]").addEventListener("change", (e) => {
  const category = e.target.value;
  const issues = issueTypesByCategory[category] || [];
  const trigger = createTicketIssueSelect.querySelector(".custom-select-trigger");
  const valueEl = createTicketIssueSelect.querySelector(".custom-select-value");
  createTicketIssueSelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(issues);
  resetCustomSelect(createTicketIssueSelect);
  trigger.disabled = !issues.length;
  valueEl.dataset.placeholder = issues.length ? "Choose issue type" : "Choose category first";
  valueEl.textContent = valueEl.dataset.placeholder;
  valueEl.classList.add("placeholder");
  validateCreateTicketForm();
});

function openCreateTicketModal() {
  createTicketForm.reset();
  createTicketForm.querySelectorAll(".custom-select").forEach(resetCustomSelect);
  resetCreateTicketIssueSelect();
  validateCreateTicketForm();
  createTicketOverlay.classList.add("open");
}
function closeCreateTicketModal() {
  createTicketOverlay.classList.remove("open");
}

document.getElementById("openCreateTicketBtn").addEventListener("click", openCreateTicketModal);
document.getElementById("cancelCreateTicket").addEventListener("click", closeCreateTicketModal);
createTicketOverlay.addEventListener("click", (e) => { if (e.target === createTicketOverlay) closeCreateTicketModal(); });

function validateCreateTicketForm() {
  const categoryValue = createTicketCategorySelect.querySelector("input[type=hidden]").value;
  const issueValue = createTicketIssueSelect.querySelector("input[type=hidden]").value;
  const severityValue = createTicketSeveritySelect.querySelector("input[type=hidden]").value;
  const levelValue = createTicketLevelSelect.querySelector("input[type=hidden]").value;
  const assignedToValue = createTicketAssignedToSelect.querySelector("input[type=hidden]").value;
  const valid =
    categoryValue !== "" &&
    issueValue !== "" &&
    severityValue !== "" &&
    levelValue !== "" &&
    assignedToValue !== "" &&
    createTicketForm.description.value.trim() !== "";
  saveCreateTicketBtn.disabled = !valid;
}
createTicketForm.addEventListener("input", validateCreateTicketForm);
createTicketForm.addEventListener("change", validateCreateTicketForm);

createTicketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const categoryValue = createTicketCategorySelect.querySelector("input[type=hidden]").value;
  const issueValue = createTicketIssueSelect.querySelector("input[type=hidden]").value;
  const severityValue = createTicketSeveritySelect.querySelector("input[type=hidden]").value;
  const levelValue = createTicketLevelSelect.querySelector("input[type=hidden]").value;
  const assignedToValue = createTicketAssignedToSelect.querySelector("input[type=hidden]").value;
  const today = new Date();
  const created = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

  const newTicket = {
    ticketId: `TCK-${1000 + ticketList.length + 1}`,
    organization: currentOrg(),
    type: "Clinic",
    who: CURRENT_USER,
    category: categoryValue,
    issueType: issueValue,
    origin: "User Created",
    severity: severityValue,
    level: levelValue,
    state: "Open",
    assignedTo: assignedToValue,
    created,
    description: createTicketForm.description.value.trim(),
  };
  newTicket.id = ticketList.length;
  newTicket.history = [{ date: created, text: "Ticket created (User Created)." }];
  ticketList.push(newTicket);

  renderRaisedTicketList();
  renderTicketList();
  closeCreateTicketModal();
});
