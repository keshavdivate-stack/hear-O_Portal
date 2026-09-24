const eyeIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M1.5 12C1.5 12 5.5 5 12 5C18.5 5 22.5 12 22.5 12C22.5 12 18.5 19 12 19C5.5 19 1.5 12 1.5 12Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/></svg>`;
const selectedTypes = new Set();
const selectedCategories = new Set();
const selectedIssueTypes = new Set();
const selectedOrigins = new Set();
const selectedStates = new Set();
const selectedAssignees = new Set();
let ticketSearchTerm = "";
const TICKET_PAGE_SIZE = 25;
let ticketCurrentPage = 1;

/* Open and In Progress tickets come first, Resolved last -- regardless of
   Created date. Within a status group the original order is kept. */
const stateRank = (state) => (state === "Resolved" ? 1 : 0);

function filteredTicketList() {
  const term = ticketSearchTerm.trim().toLowerCase();
  return ticketList.filter((t) => {
    if (selectedTypes.size && !selectedTypes.has(t.type)) return false;
    if (selectedCategories.size && !selectedCategories.has(t.category)) return false;
    if (selectedIssueTypes.size && !selectedIssueTypes.has(t.issueType)) return false;
    if (selectedOrigins.size && !selectedOrigins.has(t.origin)) return false;
    if (selectedStates.size && !selectedStates.has(t.state)) return false;
    if (selectedAssignees.size && !selectedAssignees.has(t.assignedTo)) return false;
    if (term && !`${t.ticketId} ${t.who} ${t.patientName || ""} ${t.organization}`.toLowerCase().includes(term)) return false;
    return true;
  }).sort((a, b) => stateRank(a.state) - stateRank(b.state));
}

const ticketRows = document.getElementById("ticketListRows");
const ticketRangeLabel = document.getElementById("ticketRangeLabel");

/* Stat cards count every ticket in the clinic's queue, not just the rows the
   current filters leave visible. */
function renderTicketStats() {
  const count = (state) => ticketList.filter((t) => t.state === state).length;
  document.getElementById("ticketStatTotal").textContent = ticketList.length;
  document.getElementById("ticketStatOpen").textContent = count("Open");
  document.getElementById("ticketStatInProgress").textContent = count("In Progress");
  document.getElementById("ticketStatResolved").textContent = count("Resolved");
}

function renderTicketList() {
  renderTicketStats();
  const list = filteredTicketList();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / TICKET_PAGE_SIZE));
  ticketCurrentPage = Math.min(Math.max(ticketCurrentPage, 1), totalPages);
  const start = (ticketCurrentPage - 1) * TICKET_PAGE_SIZE;
  ticketRows.innerHTML = list
    .slice(start, start + TICKET_PAGE_SIZE)
    .map(
      (t) => `
      <tr>
        <td><b>${t.ticketId}</b></td>
        <td><span class="ticket-pill ${typeCellClass(t.type)}">${t.type}</span></td>
        <td>${
          !t.who
            ? "&mdash;"
            : t.type === "Patient"
            ? `<a class="ticket-view-link" href="patient-data.html">${t.patientName || t.who}</a><span class="ticket-who-id">${t.who}</span>`
            : t.who
        }</td>
        <td><span class="ticket-pill ticket-pill-category">${t.category}</span></td>
        <td>${t.issueType}</td>
        <td>${t.origin}</td>
        <td><span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span></td>
        <td>${t.assignedTo || "&mdash;"}</td>
        <td>${t.created}</td>
        <td><a class="ticket-view-icon" href="ticket-detail.html?id=${t.id}" aria-label="View">${eyeIcon}</a></td>
      </tr>`
    )
    .join("");
  ticketRangeLabel.textContent = total ? `${start + 1} – ${Math.min(start + TICKET_PAGE_SIZE, total)} of ${total}` : "0 of 0";
  document.getElementById("ticketFirstPage").disabled = ticketCurrentPage === 1;
  document.getElementById("ticketPrevPage").disabled = ticketCurrentPage === 1;
  document.getElementById("ticketNextPage").disabled = ticketCurrentPage === totalPages;
  document.getElementById("ticketLastPage").disabled = ticketCurrentPage === totalPages;
  if (!total) {
    ticketRows.innerHTML = `<tr><td colspan="10" style="text-align:center; color:var(--gray-text); padding:24px;">No tickets match the current filters.</td></tr>`;
  }
}

/* Any filter/search change starts back on page 1. */
function applyTicketFilters() {
  ticketCurrentPage = 1;
  renderTicketList();
}

[
  ["ticketFirstPage", () => 1],
  ["ticketPrevPage", () => ticketCurrentPage - 1],
  ["ticketNextPage", () => ticketCurrentPage + 1],
  ["ticketLastPage", () => Infinity],
].forEach(([id, nextPage]) => {
  document.getElementById(id).addEventListener("click", () => {
    ticketCurrentPage = nextPage();
    renderTicketList();
  });
});

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
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="type"]'), ticketTypeMenu, selectedTypes, applyTicketFilters);

const ticketCategoryMenu = document.getElementById("ticketCategoryMenu");
ticketCategoryMenu.innerHTML = buildOptionsHtml(ticketCategories);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="category"]'), ticketCategoryMenu, selectedCategories, applyTicketFilters);

const allIssueTypes = [...new Set(ticketList.map((t) => t.issueType))].map((v) => ({ key: v, label: v }));
const ticketIssueMenu = document.getElementById("ticketIssueMenu");
ticketIssueMenu.innerHTML = buildOptionsHtml(allIssueTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="issueType"]'), ticketIssueMenu, selectedIssueTypes, applyTicketFilters);

const ticketOriginMenu = document.getElementById("ticketOriginMenu");
ticketOriginMenu.innerHTML = buildOptionsHtml(ticketOrigins);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="origin"]'), ticketOriginMenu, selectedOrigins, applyTicketFilters);

const ticketStateMenu = document.getElementById("ticketStateMenu");
ticketStateMenu.innerHTML = buildOptionsHtml(ticketStates);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="state"]'), ticketStateMenu, selectedStates, applyTicketFilters);

const ticketAssigneeMenu = document.getElementById("ticketAssigneeMenu");
ticketAssigneeMenu.innerHTML = buildOptionsHtml(SUPPORT_TEAM_MEMBERS.map((m) => ({ key: m, label: m })));
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="assignedTo"]'), ticketAssigneeMenu, selectedAssignees, applyTicketFilters);

/* ---------------- Search ---------------- */
document.getElementById("ticketSearchInput").addEventListener("input", (e) => {
  ticketSearchTerm = e.target.value;
  applyTicketFilters();
});

/* ---------------- Clear all filters ---------------- */
const clearableTicketFilters = [
  { name: "type", menu: ticketTypeMenu, set: selectedTypes, label: "Type" },
  { name: "category", menu: ticketCategoryMenu, set: selectedCategories, label: "Category" },
  { name: "issueType", menu: ticketIssueMenu, set: selectedIssueTypes, label: "Issue Type" },
  { name: "origin", menu: ticketOriginMenu, set: selectedOrigins, label: "Origin" },
  { name: "state", menu: ticketStateMenu, set: selectedStates, label: "Status" },
  { name: "assignedTo", menu: ticketAssigneeMenu, set: selectedAssignees, label: "Assigned To" },
];

document.getElementById("clearTicketFilters").addEventListener("click", () => {
  document.getElementById("ticketSearchInput").value = "";
  ticketSearchTerm = "";
  clearableTicketFilters.forEach(({ name, menu, set, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.querySelector(`.checkbox-filter[data-name="${name}"] .checkbox-filter-label`).textContent = label;
  });
  applyTicketFilters();
});

/* Mirrors the "Support Ticket" floating button's own definition of "this
   clinic's tickets" (js/topbar.js) -- used to stamp a newly-raised ticket
   with the org currently selected in the topbar switcher. */
function currentOrg() {
  const checked = document.querySelector('input[name="org"]:checked');
  return (checked ? checked.value : "b01").toUpperCase();
}

/* ---------------- New Ticket modal ----------------
   The .custom-select engine itself (setCustomSelectValue, initCustomSelects,
   etc.) lives in js/custom-select.js, shared with ticket-detail.html. */
const createTicketOverlay = document.getElementById("createTicketOverlay");
const createTicketForm = document.getElementById("createTicketForm");
const saveCreateTicketBtn = document.getElementById("saveCreateTicket");
const modalSelect = (name) => document.querySelector(`#createTicketOverlay .custom-select[data-name="${name}"]`);
const selectValue = (select) => select.querySelector("input[type=hidden]").value;
const createTicketTypeSelect = modalSelect("type");
const createTicketForSelect = modalSelect("patient");
const createTicketCategorySelect = modalSelect("category");
const createTicketIssueSelect = modalSelect("issueType");
const createTicketPrioritySelect = modalSelect("priority");
const createTicketAssignedToSelect = modalSelect("assignedTo");

createTicketTypeSelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketTypes.map((t) => t.label));
createTicketCategorySelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketCategories.map((c) => c.label));
createTicketPrioritySelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(ticketSeverities.map((s) => s.label));
createTicketAssignedToSelect.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(SUPPORT_TEAM_MEMBERS);

/* "Create For" lists the clinic's patients ("First Last (ID)") when Type is
   Patient, or the clinic's users when Type is Clinic. Optional either way. */
const TICKET_PATIENTS = [...new Map(
  ticketList.filter((t) => t.type === "Patient" && t.patientName).map((t) => [t.who, { id: t.who, name: t.patientName }])
).values()].sort((a, b) => a.name.localeCompare(b.name));
const patientOptionLabel = (p) => `${p.name} (${p.id})`;
const CLINIC_USERS = [...new Set(ticketList.filter((t) => t.type === "Clinic").map((t) => t.who))].sort();

/* Point a dependent select at a new option list, clearing its value. */
function refillSelect(select, options, placeholder, emptyPlaceholder) {
  const trigger = select.querySelector(".custom-select-trigger");
  const valueEl = select.querySelector(".custom-select-value");
  select.querySelector(".custom-select-menu").innerHTML = buildCustomSelectOptions(options);
  resetCustomSelect(select);
  trigger.disabled = !options.length;
  valueEl.dataset.placeholder = options.length ? placeholder : emptyPlaceholder;
  valueEl.textContent = valueEl.dataset.placeholder;
  valueEl.classList.add("placeholder");
}

/* "Create For" is searchable: a search box pinned at the top of its menu
   filters options as you type. Patient labels are "Name (ID)", so one match
   against the label covers searching by name or by patient ID. */
const createForSearchIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8"/><path d="M21 21L16.5 16.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

function refillCreateFor() {
  const isPatient = selectValue(createTicketTypeSelect) !== "Clinic";
  refillSelect(
    createTicketForSelect,
    isPatient ? TICKET_PATIENTS.map(patientOptionLabel) : CLINIC_USERS,
    isPatient ? "Search or select patient" : "Search or select user",
    "Select type first"
  );
  const menu = createTicketForSelect.querySelector(".custom-select-menu");
  menu.insertAdjacentHTML(
    "afterbegin",
    `<div class="custom-select-search">${createForSearchIcon}<input type="text" autocomplete="off" placeholder="${isPatient ? "Search by patient name or ID" : "Search by name"}" /></div>`
  );
  menu.insertAdjacentHTML("beforeend", `<div class="custom-select-empty" hidden>${isPatient ? "No patients found" : "No users found"}</div>`);
}

function filterCreateForOptions(term) {
  const q = term.trim().toLowerCase();
  let visible = 0;
  createTicketForSelect.querySelectorAll(".custom-select-option").forEach((o) => {
    const match = !q || o.textContent.toLowerCase().includes(q);
    o.hidden = !match;
    if (match) visible++;
  });
  createTicketForSelect.querySelector(".custom-select-empty").hidden = visible > 0;
}

/* Opening the menu clears any previous search and focuses the box. */
createTicketForSelect.querySelector(".custom-select-trigger").addEventListener("click", () => {
  const input = createTicketForSelect.querySelector(".custom-select-search input");
  if (!input || !createTicketForSelect.classList.contains("open")) return;
  input.value = "";
  filterCreateForOptions("");
  input.focus();
});

createTicketForSelect.addEventListener("click", (e) => {
  if (e.target.closest(".custom-select-search")) e.stopPropagation();
});
createTicketForSelect.addEventListener("input", (e) => {
  if (!e.target.closest(".custom-select-search")) return;
  e.stopPropagation();
  filterCreateForOptions(e.target.value);
});
/* Enter picks the first match; Escape closes the menu. */
createTicketForSelect.addEventListener("keydown", (e) => {
  if (!e.target.closest(".custom-select-search")) return;
  if (e.key === "Enter") {
    e.preventDefault();
    const first = [...createTicketForSelect.querySelectorAll(".custom-select-option")].find((o) => !o.hidden);
    if (first) {
      setCustomSelectValue(createTicketForSelect, first.dataset.value);
      createTicketForSelect.classList.remove("open");
    }
  } else if (e.key === "Escape") {
    createTicketForSelect.classList.remove("open");
  }
});

createTicketTypeSelect.querySelector("input[type=hidden]").addEventListener("change", () => {
  refillCreateFor();
  validateCreateTicketForm();
});

createTicketCategorySelect.querySelector("input[type=hidden]").addEventListener("change", (e) => {
  refillSelect(createTicketIssueSelect, issueTypesByCategory[e.target.value] || [], "Select issue type", "Select a category first");
  validateCreateTicketForm();
});

function openCreateTicketModal() {
  createTicketForm.reset();
  createTicketForm.querySelectorAll(".custom-select").forEach(resetCustomSelect);
  refillCreateFor();
  refillSelect(createTicketIssueSelect, [], "", "Select a category first");
  validateCreateTicketForm();
  createTicketOverlay.classList.add("open");
}
function closeCreateTicketModal() {
  createTicketOverlay.classList.remove("open");
}

document.getElementById("openCreateTicketBtn").addEventListener("click", openCreateTicketModal);
document.getElementById("cancelCreateTicket").addEventListener("click", closeCreateTicketModal);
document.getElementById("closeCreateTicketX").addEventListener("click", closeCreateTicketModal);
createTicketOverlay.addEventListener("click", (e) => { if (e.target === createTicketOverlay) closeCreateTicketModal(); });

/* Required: Type, Category, Issue Type, Priority. Create For, Assigned To and
   Description are optional. */
function validateCreateTicketForm() {
  const valid = [createTicketTypeSelect, createTicketCategorySelect, createTicketIssueSelect, createTicketPrioritySelect].every((s) => selectValue(s) !== "");
  saveCreateTicketBtn.disabled = !valid;
  saveCreateTicketBtn.classList.toggle("enabled", valid);
}
createTicketForm.addEventListener("input", validateCreateTicketForm);
createTicketForm.addEventListener("change", validateCreateTicketForm);

createTicketForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const type = selectValue(createTicketTypeSelect);
  const createFor = selectValue(createTicketForSelect);
  const patient = type === "Patient" ? TICKET_PATIENTS.find((p) => patientOptionLabel(p) === createFor) : null;
  const assignedTo = selectValue(createTicketAssignedToSelect);
  const today = new Date();
  const created = `${String(today.getDate()).padStart(2, "0")}.${String(today.getMonth() + 1).padStart(2, "0")}.${today.getFullYear()}`;

  const newTicket = {
    ticketId: `TCK-${1000 + ticketList.length + 1}`,
    organization: currentOrg(),
    type,
    who: patient ? patient.id : createFor,
    patientName: patient ? patient.name : undefined,
    scope: type === "Patient" ? "Patient" : "Organization",
    category: selectValue(createTicketCategorySelect),
    issueType: selectValue(createTicketIssueSelect),
    origin: "User Created",
    severity: selectValue(createTicketPrioritySelect),
    level: AGENT_LEVEL[assignedTo] || "Level 1",
    state: "Open",
    assignedTo,
    created,
    description: createTicketForm.description.value.trim(),
  };
  newTicket.id = ticketList.length;
  newTicket.history = [{ date: created, title: "Ticket Created" }];
  ticketList.push(newTicket);

  applyTicketFilters();
  closeCreateTicketModal();
});
