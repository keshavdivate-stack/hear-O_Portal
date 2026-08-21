/* ---------------- Data ---------------- */
const rolePool = ["CLINIC DOCTOR", "CLINIC USER"];
const namePool = [
  { username: "2413214ewr", first: "Igor", last: "Minyaylo", email: "igor@cordio-med.com", phone: "+972-538726747", role: "CLINIC DOCTOR" },
  { username: "895447", first: "Yoni", last: "Bloch", email: "ayelet@cordio-med.com", phone: "+972-548654123", role: "CLINIC USER" },
  { username: "774521", first: "Ayelet", last: "Er", email: "ayelet.er@cordio-med.com", phone: "+972-521456987", role: "CLINIC USER" },
  { username: "331256", first: "Shani", last: "Levin", email: "shani@cordio-med.com", phone: "+972-546123789", role: "CLINIC DOCTOR" },
];

const users = Array.from({ length: 32 }, (_, i) => {
  const base = namePool[i % namePool.length];
  return {
    ...base,
    id: i,
    dateCreated: "02/08/2026",
    mfa: i % 5 === 0 ? "On" : "Off",
    blocked: i % 11 === 0 ? "Yes" : "No",
  };
});

/* ---------------- State ---------------- */
const PAGE_SIZE = 20;
let currentPage = 1;
let sortDir = "asc";
let searchTerm = "";

function filteredUsers() {
  if (!searchTerm) return users;
  const q = searchTerm.toLowerCase();
  return users.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.first.toLowerCase().includes(q) ||
      u.last.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
}

function sortedUsers() {
  const list = [...filteredUsers()];
  list.sort((a, b) => (sortDir === "asc" ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username)));
  return list;
}

/* ---------------- Render ---------------- */
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderUsers() {
  const list = sortedUsers();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  document.getElementById("usersRows").innerHTML = pageItems
    .map(
      (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.first}</td>
        <td>${u.last}</td>
        <td>${u.email}</td>
        <td>${u.phone}</td>
        <td>${u.role}</td>
        <td>${u.dateCreated}</td>
        <td>${u.mfa}</td>
        <td>${u.blocked}</td>
        <td>
          <button class="action-icon kebab row-menu-trigger" data-id="${u.id}" aria-label="Row actions">${kebabIcon}</button>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("userPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("userFirstPage").disabled = currentPage === 1;
  document.getElementById("userPrevPage").disabled = currentPage === 1;
  document.getElementById("userNextPage").disabled = currentPage === totalPages;
  document.getElementById("userLastPage").disabled = currentPage === totalPages;
}

renderUsers();

/* ---------------- Search ---------------- */
document.getElementById("userSearchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  currentPage = 1;
  renderUsers();
});

/* ---------------- Sort ---------------- */
document.querySelector(".users-mgmt-table th.sortable").addEventListener("click", () => {
  sortDir = sortDir === "asc" ? "desc" : "asc";
  renderUsers();
});

/* ---------------- Pagination ---------------- */
document.getElementById("userFirstPage").addEventListener("click", () => { currentPage = 1; renderUsers(); });
document.getElementById("userPrevPage").addEventListener("click", () => { currentPage -= 1; renderUsers(); });
document.getElementById("userNextPage").addEventListener("click", () => { currentPage += 1; renderUsers(); });
document.getElementById("userLastPage").addEventListener("click", () => {
  currentPage = Math.ceil(filteredUsers().length / PAGE_SIZE);
  renderUsers();
});

/* ---------------- Row action dropdown ---------------- */
const rowMenu = document.getElementById("rowMenu");
let activeRowUserId = null;

document.getElementById("usersRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeRowUserId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  rowMenu.style.top = `${rect.bottom + 6}px`;
  rowMenu.style.left = `${rect.right - 190}px`;
  rowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!rowMenu.contains(e.target)) rowMenu.classList.remove("open");
});

rowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item) return;
  const user = users.find((u) => u.id === activeRowUserId);
  rowMenu.classList.remove("open");

  if (item.dataset.action === "edit") openAddUserModal(user);
  if (item.dataset.action === "invite") openEhrInviteModal();
  // Reset Password / Delete User: no dedicated modal was provided in the design reference.
});

/* ---------------- Custom dropdowns ---------------- */
function setCustomSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".custom-select-value");
  const option = select.querySelector(`.custom-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.remove("selected"));

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

function positionCustomSelectMenu(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
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

function resetCustomSelect(select) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
}

function initCustomSelects() {
  document.querySelectorAll(".custom-select").forEach((select) => {
    const trigger = select.querySelector(".custom-select-trigger");
    const valueEl = select.querySelector(".custom-select-value");
    const hiddenInput = select.querySelector("input[type=hidden]");

    valueEl.dataset.placeholder = valueEl.textContent.trim();
    hiddenInput.dataset.default = hiddenInput.value;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !select.classList.contains("open");
      document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
      if (willOpen) positionCustomSelectMenu(select);
      select.classList.toggle("open", willOpen);
    });

    select.addEventListener("click", (e) => {
      const option = e.target.closest(".custom-select-option");
      if (!option) return;
      setCustomSelectValue(select, option.dataset.value);
      select.classList.remove("open");
    });
  });

  document.addEventListener("click", closeAllCustomSelects);
  document.addEventListener("scroll", closeAllCustomSelects, true);
  window.addEventListener("resize", closeAllCustomSelects);
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

initCustomSelects();

/* ---------------- Add User modal ---------------- */
const addUserOverlay = document.getElementById("addUserOverlay");
const addUserForm = document.getElementById("addUserForm");
const saveAddUserBtn = document.getElementById("saveAddUser");
const addUserModalTitle = addUserOverlay.querySelector(".modal h2");

function openAddUserModal(user) {
  addUserForm.reset();
  addUserForm.querySelectorAll(".custom-select").forEach(resetCustomSelect);
  if (user) {
    addUserModalTitle.textContent = "Edit User";
    addUserForm.firstName.value = user.first;
    addUserForm.lastName.value = user.last;
    addUserForm.username.value = user.username;
    addUserForm.mobile.value = user.phone.replace(/^\+\d+-?/, "");
    addUserForm.email.value = user.email;
  } else {
    addUserModalTitle.textContent = "Add User";
  }
  validateAddUserForm();
  addUserOverlay.classList.add("open");
}

function closeAddUserModal() {
  addUserOverlay.classList.remove("open");
}

function validateAddUserForm() {
  const required = ["firstName", "lastName", "username", "mobile", "email", "role"];
  const valid = required.every((name) => addUserForm[name].value.trim() !== "");
  saveAddUserBtn.disabled = !valid;
  saveAddUserBtn.classList.toggle("enabled", valid);
}

addUserForm.addEventListener("input", validateAddUserForm);
addUserForm.addEventListener("change", validateAddUserForm);

addUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveAddUserBtn.disabled) return;
  closeAddUserModal();
});

document.getElementById("openAddUserBtn").addEventListener("click", () => openAddUserModal(null));
document.getElementById("cancelAddUser").addEventListener("click", closeAddUserModal);
addUserOverlay.addEventListener("click", (e) => { if (e.target === addUserOverlay) closeAddUserModal(); });

/* ---------------- Send EHR Invite modal ---------------- */
const ehrInviteOverlay = document.getElementById("ehrInviteOverlay");
const ehrOrgSelect = document.getElementById("ehrOrgSelect");
const ehrTypeSelect = document.getElementById("ehrTypeSelect");
const sendEhrInviteBtn = document.getElementById("sendEhrInvite");

function openEhrInviteModal() {
  ehrInviteOverlay.querySelectorAll(".custom-select").forEach(resetCustomSelect);
  validateEhrInviteForm();
  ehrInviteOverlay.classList.add("open");
}

function closeEhrInviteModal() {
  ehrInviteOverlay.classList.remove("open");
}

function validateEhrInviteForm() {
  const valid = ehrOrgSelect.value !== "" && ehrTypeSelect.value !== "";
  sendEhrInviteBtn.disabled = !valid;
  sendEhrInviteBtn.classList.toggle("enabled", valid);
}

ehrOrgSelect.addEventListener("change", validateEhrInviteForm);
ehrTypeSelect.addEventListener("change", validateEhrInviteForm);
sendEhrInviteBtn.addEventListener("click", () => { if (!sendEhrInviteBtn.disabled) closeEhrInviteModal(); });
document.getElementById("cancelEhrInvite").addEventListener("click", closeEhrInviteModal);
ehrInviteOverlay.addEventListener("click", (e) => { if (e.target === ehrInviteOverlay) closeEhrInviteModal(); });
