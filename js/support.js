const selectedTypes = new Set();
const selectedCategories = new Set();
const selectedIssueTypes = new Set();
const selectedOrigins = new Set();
const selectedSeverities = new Set();
const selectedStates = new Set();
let ticketSearchTerm = "";

function filteredTicketList() {
  const term = ticketSearchTerm.trim().toLowerCase();
  return ticketList.filter((t) => {
    if (t.assignedTo !== CURRENT_ASSIGNEE) return false;
    if (selectedTypes.size && !selectedTypes.has(t.type)) return false;
    if (selectedCategories.size && !selectedCategories.has(t.category)) return false;
    if (selectedIssueTypes.size && !selectedIssueTypes.has(t.issueType)) return false;
    if (selectedOrigins.size && !selectedOrigins.has(t.origin)) return false;
    if (selectedSeverities.size && !selectedSeverities.has(t.severity)) return false;
    if (selectedStates.size && !selectedStates.has(t.state)) return false;
    if (term && !`${t.ticketId} ${t.who} ${t.organization}`.toLowerCase().includes(term)) return false;
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
        <td>${t.organization}</td>
        <td><span class="ticket-pill ${typeCellClass(t.type)}">${t.type}</span></td>
        <td>${t.who}</td>
        <td><span class="ticket-pill ticket-pill-category">${t.category}</span></td>
        <td>${t.issueType}</td>
        <td><span class="ticket-pill ${originCellClass(t.origin)}">${t.origin}</span></td>
        <td><span class="ticket-pill ${severityCellClass(t.severity)}">${t.severity}</span></td>
        <td><span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span></td>
        <td>${t.created}</td>
        <td><a class="ticket-view-link" href="ticket-detail.html?id=${t.id}">View</a></td>
      </tr>`
    )
    .join("");
  ticketRangeLabel.textContent = list.length ? `1-${list.length} of ${list.length}` : "";
  if (!list.length) {
    ticketRows.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--gray-text); padding:24px;">No tickets match the current filters.</td></tr>`;
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
