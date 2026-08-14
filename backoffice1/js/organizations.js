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

document.getElementById("orgsRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeOrgRowId = Number(trigger.dataset.id);
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

function initBoSelects() {
  document.querySelectorAll(".bo-select").forEach((select) => {
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

  document.addEventListener("click", closeAllBoSelects);
  document.addEventListener("scroll", closeAllBoSelects, true);
  window.addEventListener("resize", closeAllBoSelects);
}

initBoSelects();

/* ---------------- Add Organization drawer ---------------- */
const addOrgOverlay = document.getElementById("addOrgOverlay");
const addOrgForm = document.getElementById("addOrgForm");
const saveAddOrgBtn = document.getElementById("saveAddOrg");

function openAddOrgModal() {
  addOrgForm.reset();
  addOrgForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  validateAddOrgForm();
  addOrgOverlay.classList.add("open");
}

function closeAddOrgModal() {
  addOrgOverlay.classList.remove("open");
}

function validateAddOrgForm() {
  saveAddOrgBtn.disabled = addOrgForm.name.value.trim() === "";
}

addOrgForm.addEventListener("input", validateAddOrgForm);
addOrgForm.addEventListener("change", validateAddOrgForm);

addOrgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddOrgBtn.disabled) return;
  closeAddOrgModal();
});

document.getElementById("openAddOrgBtn").addEventListener("click", openAddOrgModal);
document.getElementById("cancelAddOrg").addEventListener("click", closeAddOrgModal);
document.getElementById("closeAddOrgX").addEventListener("click", closeAddOrgModal);
addOrgOverlay.addEventListener("click", (e) => { if (e.target === addOrgOverlay) closeAddOrgModal(); });
