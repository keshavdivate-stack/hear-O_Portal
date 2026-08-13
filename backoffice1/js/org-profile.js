/* ---------------- Resolve current org from ?id= ---------------- */
const orgProfileId = Number(new URLSearchParams(location.search).get("id"));
const org = orgs.find((o) => o.id === orgProfileId) || orgs[0];

/* ---------------- Header ---------------- */
document.getElementById("orgProfileName").textContent = org.name;
document.title = `HearO Backoffice | ${org.name}`;

/* ---------------- Profile tab ---------------- */
const yesNo = (v) => (v ? "Yes" : "No");
const profileFields = [
  { label: "Default Tag", value: org.tag },
  { label: "Study", value: org.study },
  { label: "Is HMO", value: yesNo(org.isHmo) },
  { label: "Target Patients", value: org.target },
  { label: "Date Created", value: org.dateCreated },
  { label: "Display on Dashboard", value: yesNo(org.onDashboard) },
  { label: "Display Care Recommendation", value: yesNo(org.careRec) },
  { label: "Authentication Type", value: org.authType },
  { label: "Phone Number", value: org.phone || "—" },
  { label: "Latitude / Longitude", value: org.latLng },
  { label: "Document Path", value: org.docPath || "—" },
  { label: "Update Sent", value: org.updateSent },
  { label: "Default Language", value: org.lng },
];

document.getElementById("orgProfileGrid").innerHTML = profileFields
  .map((f) => `<div class="bo-profile-field"><span class="bo-profile-field-label">${f.label}</span><span class="bo-profile-field-value">${f.value}</span></div>`)
  .join("");

/* ---------------- Tabs ---------------- */
const editOrgBtn = document.getElementById("editOrgBtn");
const usersTabActions = document.getElementById("usersTabActions");

document.querySelectorAll(".bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    const onUsersTab = tab.dataset.tab === "users";
    editOrgBtn.hidden = onUsersTab;
    usersTabActions.hidden = !onUsersTab;
  });
});

/* ---------------- Users table ---------------- */
let userSearchTerm = "";

function filteredUsers() {
  const list = getOrgUsers(org.id);
  if (!userSearchTerm) return list;
  const q = userSearchTerm.toLowerCase();
  return list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
}

const userKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderUsers() {
  const list = filteredUsers();
  document.getElementById("orgUsersRows").innerHTML = list.length
    ? list
        .map(
          (u, i) => `
      <tr>
        <td><span style="font-weight:700;">${u.name}</span></td>
        <td>${u.email}</td>
        <td>${u.role}</td>
        <td><span class="bo-status-pill ${u.status === "Active" ? "bo-status-active" : "bo-status-inactive"}">${u.status}</span></td>
        <td>${u.lastLogin}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-idx="${i}" aria-label="Row actions">${userKebabIcon}</button>
          </div>
        </td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center; color:var(--gray-text); padding:28px;">No users yet for this organization.</td></tr>`;
}

renderUsers();

document.getElementById("userSearchInput").addEventListener("input", (e) => {
  userSearchTerm = e.target.value.trim();
  renderUsers();
});

/* ---------------- Row action dropdown ---------------- */
const userRowMenu = document.getElementById("userRowMenu");
let activeUserIdx = null;

document.getElementById("orgUsersRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeUserIdx = Number(trigger.dataset.idx);
  const rect = trigger.getBoundingClientRect();
  userRowMenu.style.top = `${rect.bottom + 6}px`;
  userRowMenu.style.left = `${rect.right - 170}px`;
  userRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!userRowMenu.contains(e.target)) userRowMenu.classList.remove("open");
});

userRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeUserIdx === null) return;
  userRowMenu.classList.remove("open");
  const list = filteredUsers();
  const user = list[activeUserIdx];
  const realIdx = getOrgUsers(org.id).indexOf(user);

  if (item.dataset.action === "edit") {
    openUserDrawer(user, realIdx);
  } else if (item.dataset.action === "delete") {
    getOrgUsers(org.id).splice(realIdx, 1);
    renderUsers();
  }
});

/* ---------------- Custom selects (role) ---------------- */
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

document.querySelectorAll(".bo-select").forEach(wireBoSelect);

document.addEventListener("click", closeAllBoSelects);
document.addEventListener("scroll", closeAllBoSelects, true);
window.addEventListener("resize", closeAllBoSelects);

/* ---------------- Add / Edit User drawer ---------------- */
const userDrawerOverlay = document.getElementById("userDrawerOverlay");
const userForm = document.getElementById("userForm");
const saveUserBtn = document.getElementById("saveUserBtn");
const userDrawerTitle = document.getElementById("userDrawerTitle");
let editingUserIdx = null;

function validateUserForm() {
  const roleValue = userForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').value;
  saveUserBtn.disabled = userForm.username.value.trim() === "" || userForm.email.value.trim() === "" || roleValue === "";
}

function openUserDrawer(user, idx) {
  userForm.reset();
  editingUserIdx = idx === undefined ? null : idx;
  userDrawerTitle.textContent = editingUserIdx === null ? "Add User" : "Edit User";

  const roleSelect = userForm.querySelector('.bo-select[data-name="role"]');
  const mfaMethodSelect = userForm.querySelector('.bo-select[data-name="mfaMethod"]');
  const countryCodeSelect = userForm.querySelector('.bo-select[data-name="countryCode"]');
  const languageSelect = userForm.querySelector('.bo-select[data-name="language"]');

  setBoSelectValue(roleSelect, user ? user.role : "", { silent: true });
  setBoSelectValue(mfaMethodSelect, user ? user.mfaMethod || "" : "", { silent: true });
  setBoSelectValue(countryCodeSelect, user ? user.countryCode || "+91" : "+91", { silent: true });
  setBoSelectValue(languageSelect, user ? user.language || "English" : "English", { silent: true });

  if (user) {
    userForm.username.value = user.username || user.name || "";
    userForm.firstName.value = user.firstName || "";
    userForm.lastName.value = user.lastName || "";
    userForm.mobile.value = user.mobile || "";
    userForm.email.value = user.email;
    userForm.mfa.checked = !!user.mfa;
  }

  validateUserForm();
  userDrawerOverlay.classList.add("open");
}

function closeUserDrawer() {
  userDrawerOverlay.classList.remove("open");
}

userForm.addEventListener("input", validateUserForm);
userForm.addEventListener("change", validateUserForm);

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveUserBtn.disabled) return;

  const roleSelect = userForm.querySelector('.bo-select[data-name="role"]');
  const mfaMethodSelect = userForm.querySelector('.bo-select[data-name="mfaMethod"]');
  const countryCodeSelect = userForm.querySelector('.bo-select[data-name="countryCode"]');
  const languageSelect = userForm.querySelector('.bo-select[data-name="language"]');

  const firstName = userForm.firstName.value.trim();
  const lastName = userForm.lastName.value.trim();
  const username = userForm.username.value.trim();

  const record = {
    username,
    firstName,
    lastName,
    name: [firstName, lastName].filter(Boolean).join(" ") || username,
    email: userForm.email.value.trim(),
    mobile: userForm.mobile.value.trim(),
    countryCode: countryCodeSelect.querySelector('input[type=hidden]').value || "+91",
    role: roleSelect.querySelector('input[type=hidden]').value || "—",
    mfaMethod: mfaMethodSelect.querySelector('input[type=hidden]').value || "",
    mfa: userForm.mfa.checked,
    language: languageSelect.querySelector('input[type=hidden]').value || "English",
    status: editingUserIdx === null ? "Active" : getOrgUsers(org.id)[editingUserIdx].status,
    lastLogin: editingUserIdx === null ? "—" : getOrgUsers(org.id)[editingUserIdx].lastLogin,
  };

  const list = getOrgUsers(org.id);
  if (editingUserIdx === null) {
    list.push(record);
  } else {
    list[editingUserIdx] = record;
  }

  closeUserDrawer();
  renderUsers();
});

document.getElementById("openAddUserBtn").addEventListener("click", () => openUserDrawer());
document.getElementById("cancelUserDrawer").addEventListener("click", closeUserDrawer);
document.getElementById("closeUserDrawerX").addEventListener("click", closeUserDrawer);
userDrawerOverlay.addEventListener("click", (e) => { if (e.target === userDrawerOverlay) closeUserDrawer(); });
