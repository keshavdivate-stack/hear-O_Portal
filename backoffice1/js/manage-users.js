/* ---------------- Data ---------------- (see js/users-data.js, loaded before this file) */

/* ---------------- State ---------------- */
const USER_PAGE_SIZE = 20;
let userCurrentPage = 1;
let userSortDir = "asc";
let userSearchTerm = "";

function filteredUsers() {
  if (!userSearchTerm) return boUsers;
  const q = userSearchTerm.toLowerCase();
  return boUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
}

function sortedUsers() {
  const list = [...filteredUsers()];
  list.sort((a, b) => (userSortDir === "asc" ? a.username.localeCompare(b.username, undefined, { numeric: true }) : b.username.localeCompare(a.username, undefined, { numeric: true })));
  return list;
}

/* ---------------- Render ---------------- */
const yesNo = (v) => (v ? "Yes" : "No");
const onOff = (v) => (v ? "On" : "Off");

const userKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderUsers() {
  const list = sortedUsers();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / USER_PAGE_SIZE));
  userCurrentPage = Math.min(userCurrentPage, totalPages);

  const start = (userCurrentPage - 1) * USER_PAGE_SIZE;
  const pageItems = list.slice(start, start + USER_PAGE_SIZE);

  document.getElementById("usersRows").innerHTML = pageItems
    .map(
      (u) => `
      <tr>
        <td><span class="bo-name-link">${u.username}</span></td>
        <td>${u.firstName || "—"}</td>
        <td>${u.lastName || "—"}</td>
        <td>${u.email || "—"}</td>
        <td>${u.phone || "—"}</td>
        <td>${u.role}</td>
        <td>${u.dateCreated}</td>
        <td>${u.allowedOrgs}</td>
        <td>${onOff(u.mfa)}</td>
        <td>${yesNo(u.locked)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${u.id}" aria-label="Row actions">${userKebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + USER_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("userPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("userFirstPage").disabled = userCurrentPage === 1;
  document.getElementById("userPrevPage").disabled = userCurrentPage === 1;
  document.getElementById("userNextPage").disabled = userCurrentPage === totalPages;
  document.getElementById("userLastPage").disabled = userCurrentPage === totalPages;
}

renderUsers();

/* ---------------- Search ---------------- */
document.getElementById("userSearchInput").addEventListener("input", (e) => {
  userSearchTerm = e.target.value.trim();
  userCurrentPage = 1;
  renderUsers();
});

/* ---------------- Sort ---------------- */
document.querySelector(".bo-list-table th.sortable").addEventListener("click", () => {
  userSortDir = userSortDir === "asc" ? "desc" : "asc";
  renderUsers();
});

/* ---------------- Pagination ---------------- */
document.getElementById("userFirstPage").addEventListener("click", () => { userCurrentPage = 1; renderUsers(); });
document.getElementById("userPrevPage").addEventListener("click", () => { userCurrentPage -= 1; renderUsers(); });
document.getElementById("userNextPage").addEventListener("click", () => { userCurrentPage += 1; renderUsers(); });
document.getElementById("userLastPage").addEventListener("click", () => {
  userCurrentPage = Math.ceil(filteredUsers().length / USER_PAGE_SIZE);
  renderUsers();
});

/* ---------------- Row action dropdown (reset password / edit / delete) ---------------- */
const userRowMenu = document.getElementById("userRowMenu");
let activeUserRowId = null;

document.getElementById("usersRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeUserRowId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  userRowMenu.style.top = `${rect.bottom + 6}px`;
  userRowMenu.style.left = `${rect.right - 190}px`;
  userRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!userRowMenu.contains(e.target)) userRowMenu.classList.remove("open");
});

userRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeUserRowId === null) return;
  userRowMenu.classList.remove("open");

  const user = boUsers.find((u) => u.id === activeUserRowId);
  if (!user) return;

  if (item.dataset.action === "delete") {
    boUsers.splice(boUsers.indexOf(user), 1);
    renderUsers();
  } else if (item.dataset.action === "edit") {
    openAddUserModal();
  }
  // "reset" (Reset Password) has no wired behavior in this preview.
});

/* ---------------- Custom selects (used inside the Create user drawer) ---------------- */
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
  setBoSelectValue(select, "", { silent: true });
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function wireBoSelect(select) {
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
}

function initBoSelects(root = document) {
  root.querySelectorAll(".bo-select").forEach(wireBoSelect);
}

initBoSelects();
document.addEventListener("click", closeAllBoSelects);
document.addEventListener("scroll", closeAllBoSelects, true);
window.addEventListener("resize", closeAllBoSelects);

/* ---------------- Repeatable Organization rows ---------------- */
const orgOptionsHtml = `
  <div class="bo-select-option" data-value="120">120<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="B01">B01<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="ATP">ATP<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
  <div class="bo-select-option" data-value="All Organizations">All Organizations<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
`;

const orgRowsWrap = document.getElementById("orgRowsWrap");
const addOrgRowBtn = document.getElementById("addOrgRowBtn");
const addOrgRowBtnField = addOrgRowBtn.closest(".bo-modal-field");
let orgRowCount = 1;

function orgRowFields() {
  return Array.from(orgRowsWrap.parentElement.querySelectorAll(".bo-modal-field")).filter((f) => f.querySelector("[data-org-row]"));
}

function relabelOrgRows() {
  orgRowFields().forEach((field, i) => {
    field.querySelector("label").textContent = `Organization ${i + 1}`;
  });
}

function addOrgRow() {
  orgRowCount += 1;
  const name = `org${orgRowCount}`;

  const field = document.createElement("div");
  field.className = "bo-modal-field full";
  field.innerHTML = `
    <label>Organization ${orgRowCount}</label>
    <div class="bo-org-row" data-org-row>
      <div class="bo-select" data-name="${name}">
        <button type="button" class="bo-select-trigger">
          <span class="bo-select-value placeholder">Select organization</span>
          <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="bo-select-menu">${orgOptionsHtml}</div>
        <input type="hidden" name="${name}" />
      </div>
      <button type="button" class="bo-org-row-remove" aria-label="Remove organization">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>
      </button>
    </div>
  `;

  orgRowsWrap.parentElement.insertBefore(field, addOrgRowBtnField);
  initBoSelects(field);

  field.querySelector(".bo-org-row-remove").addEventListener("click", () => {
    field.remove();
    orgRowCount -= 1;
    relabelOrgRows();
  });
}

addOrgRowBtn.addEventListener("click", addOrgRow);

function resetOrgRows() {
  orgRowFields().forEach((field) => {
    if (field !== orgRowsWrap) field.remove();
  });
  orgRowCount = 1;
  relabelOrgRows();
}

/* ---------------- Create user drawer ---------------- */
const addUserOverlay = document.getElementById("addUserOverlay");
const addUserForm = document.getElementById("addUserForm");
const saveAddUserBtn = document.getElementById("saveAddUser");

/* Level and the recording/log view permissions only apply to Support
   users -- everyone else is a clinic-side role that doesn't touch tickets
   or patient recordings, so those fields stay hidden until Support is picked. */
const levelFieldWrap = document.getElementById("levelFieldWrap");
const viewRecordingsFieldWrap = document.getElementById("viewRecordingsFieldWrap");
const viewLogsFieldWrap = document.getElementById("viewLogsFieldWrap");

function updateSupportFieldsVisibility() {
  const roleValue = addUserForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').value;
  const isSupport = roleValue === "SUPPORT";
  levelFieldWrap.hidden = !isSupport;
  viewRecordingsFieldWrap.hidden = !isSupport;
  viewLogsFieldWrap.hidden = !isSupport;
  const levelSelect = addUserForm.querySelector('.bo-select[data-name="level"]');
  if (isSupport) {
    /* Default new Support users to Level 1 -- per the onboarding rules
       discussion, everything starts at Level 1 until routing is defined
       more granularly, rather than forcing a level choice up front. */
    if (levelSelect.querySelector("input[type=hidden]").value === "") {
      setBoSelectValue(levelSelect, "Level 1", { silent: true });
    }
  } else {
    setBoSelectValue(levelSelect, "", { silent: true });
    addUserForm.canViewRecordings.checked = false;
    addUserForm.canViewLogs.checked = false;
  }
}

addUserForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').addEventListener("change", updateSupportFieldsVisibility);

function openAddUserModal() {
  addUserForm.reset();
  addUserForm.querySelectorAll(".bo-select").forEach(resetBoSelect);
  setBoSelectValue(addUserForm.querySelector('.bo-select[data-name="countryCode"]'), "+91", { silent: true });
  setBoSelectValue(addUserForm.querySelector('.bo-select[data-name="language"]'), "English", { silent: true });
  resetOrgRows();
  updateSupportFieldsVisibility();
  validateAddUserForm();
  addUserOverlay.classList.add("open");
}

function closeAddUserModal() {
  addUserOverlay.classList.remove("open");
}

function validateAddUserForm() {
  const roleValue = addUserForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').value;
  const levelValue = addUserForm.querySelector('.bo-select[data-name="level"] input[type=hidden]').value;
  const levelMissing = roleValue === "SUPPORT" && levelValue === "";
  saveAddUserBtn.disabled = addUserForm.username.value.trim() === "" || addUserForm.email.value.trim() === "" || roleValue === "" || levelMissing;
}

addUserForm.addEventListener("input", validateAddUserForm);
addUserForm.addEventListener("change", validateAddUserForm);

addUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddUserBtn.disabled) return;

  const roleValue = addUserForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').value;
  const levelValue = addUserForm.querySelector('.bo-select[data-name="level"] input[type=hidden]').value;
  const commPrefValue = addUserForm.querySelector('.bo-select[data-name="commPref"] input[type=hidden]').value;
  const countryCode = addUserForm.querySelector('.bo-select[data-name="countryCode"] input[type=hidden]').value;
  const orgValues = Array.from(orgRowsWrap.parentElement.querySelectorAll('[data-org-row] input[type=hidden]'))
    .map((i) => i.value)
    .filter(Boolean);

  boUsers.unshift({
    id: boUsers.length ? Math.max(...boUsers.map((u) => u.id)) + 1 : 0,
    username: addUserForm.username.value.trim(),
    firstName: addUserForm.firstName.value.trim(),
    lastName: addUserForm.lastName.value.trim(),
    email: addUserForm.email.value.trim(),
    phone: addUserForm.mobile.value.trim() ? `${countryCode}-${addUserForm.mobile.value.trim()}` : "",
    role: roleValue,
    level: levelValue,
    commPreference: commPrefValue,
    dateCreated: new Date().toLocaleDateString("en-GB"),
    allowedOrgs: orgValues.length ? orgValues.join(", ") : "—",
    mfa: addUserForm.mfa.checked,
    locked: false,
    canViewRecordings: roleValue === "SUPPORT" ? addUserForm.canViewRecordings.checked : false,
    canViewLogs: roleValue === "SUPPORT" ? addUserForm.canViewLogs.checked : false,
  });

  closeAddUserModal();
  userCurrentPage = 1;
  renderUsers();
});

document.getElementById("openAddUserBtn").addEventListener("click", openAddUserModal);
document.getElementById("cancelAddUser").addEventListener("click", closeAddUserModal);
document.getElementById("closeAddUserX").addEventListener("click", closeAddUserModal);
addUserOverlay.addEventListener("click", (e) => { if (e.target === addUserOverlay) closeAddUserModal(); });
