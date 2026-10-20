/* ---------------- Data ---------------- (see js/users-data.js, loaded before this file) */

/* The eight roles in use: Back Office (Supervisor, Clinical Supervisor, Tech Support,
   Linguistic User) and Clinic Portal (Clinic Supervisor, Clinic Manager, Clinic User,
   Clinic Doctor). */
const USER_ROLES = [
  "Supervisor", "Clinical Supervisor", "Linguistic User", "Tech Support",
  "Clinic Doctor", "Clinic Manager", "Clinic User", "Clinic Supervisor",
];

/* Only these roles get the View Log / View Recording permissions. */
const ROLES_WITH_VIEW_PERMS = ["Supervisor", "Tech Support", "Clinic Doctor", "Clinic Manager", "Clinic Supervisor", "Clinic User"];

/* users-data.js stores roles upper-case ("CLINIC DOCTOR") for Org Profile;
   this page shows and edits them by their dropdown label. */
function roleLabel(role) {
  return USER_ROLES.find((r) => r.toLowerCase() === String(role || "").toLowerCase()) || role || "—";
}

/* Stored as DD/MM/YYYY; the list shows MM/DD/YYYY like the developed page. */
function displayDate(ddmmyyyy) {
  const [d, m, y] = String(ddmmyyyy).split("/");
  return y ? `${m}/${d}/${y}` : ddmmyyyy;
}

const ALL_ORGS = "All Organizations";
const orgNames = orgs.map((o) => o.name);
const displayOrgs = (allowedOrgs) => (allowedOrgs === ALL_ORGS ? ALL_ORGS : String(allowedOrgs || "").split(" ").filter(Boolean).join(", ") || "—");

/* ---------------- State ---------------- */
let userPageSize = 20;
let userCurrentPage = 1;
let userSearchTerm = "";

function filteredUsers() {
  if (!userSearchTerm) return boUsers;
  const q = userSearchTerm.toLowerCase();
  return boUsers.filter((u) => u.username.toLowerCase().includes(q));
}

function sortedUsers() {
  return [...filteredUsers()].sort((a, b) => a.username.localeCompare(b.username, undefined, { numeric: true }));
}

/* ---------------- Render ---------------- */
const yesNo = (v) => (v ? "Yes" : "No");
const onOff = (v) => (v ? "On" : "Off");

const userKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderUsers() {
  const list = sortedUsers();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / userPageSize));
  userCurrentPage = Math.min(userCurrentPage, totalPages);

  const start = (userCurrentPage - 1) * userPageSize;
  const pageItems = list.slice(start, start + userPageSize);

  document.getElementById("usersRows").innerHTML = pageItems
    .map(
      (u) => `
      <tr>
        <td>${u.username}</td>
        <td>${u.firstName || "—"}</td>
        <td>${u.lastName || "—"}</td>
        <td>${u.email || "—"}</td>
        <td>${u.phone || "—"}</td>
        <td>${roleLabel(u.role)}</td>
        <td>${displayDate(u.dateCreated)}</td>
        <td>${displayOrgs(u.allowedOrgs)}</td>
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

  const rangeEnd = total === 0 ? 0 : Math.min(start + userPageSize, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("userPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("userFirstPage").disabled = userCurrentPage === 1;
  document.getElementById("userPrevPage").disabled = userCurrentPage === 1;
  document.getElementById("userNextPage").disabled = userCurrentPage === totalPages;
  document.getElementById("userLastPage").disabled = userCurrentPage === totalPages;
}

renderUsers();

/* ---------------- Search (by username) ---------------- */
document.getElementById("userSearchInput").addEventListener("input", (e) => {
  userSearchTerm = e.target.value.trim();
  userCurrentPage = 1;
  renderUsers();
});

/* ---------------- Pagination ---------------- */
document.getElementById("userFirstPage").addEventListener("click", () => { userCurrentPage = 1; renderUsers(); });
document.getElementById("userPrevPage").addEventListener("click", () => { userCurrentPage -= 1; renderUsers(); });
document.getElementById("userNextPage").addEventListener("click", () => { userCurrentPage += 1; renderUsers(); });
document.getElementById("userLastPage").addEventListener("click", () => {
  userCurrentPage = Math.ceil(filteredUsers().length / userPageSize);
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
    if (!confirm(`Delete user "${user.username}"?`)) return;
    boUsers.splice(boUsers.indexOf(user), 1);
    renderUsers();
  } else if (item.dataset.action === "edit") {
    openUserDrawer(user);
  }
  // "reset" (Reset Password) has no wired behavior in this preview.
});

/* ---------------- Custom selects ---------------- */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const option = select.querySelector(`.bo-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".bo-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.dataset.display || option.textContent.trim();
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
  if (valueEl.classList.contains("placeholder")) valueEl.dataset.placeholder = valueEl.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    closeAllBoSelects();
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
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

const checkSvg = `<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

document.getElementById("roleSelectMenu").innerHTML = USER_ROLES.map(
  (r) => `<div class="bo-select-option" data-value="${supFilterEsc(r)}">${supFilterEsc(r)}${checkSvg}</div>`
).join("");

/* Country options carry the ISO code as their value (several countries share
   +1, +44 ...); the trigger shows only the dial code. */
document.getElementById("countrySelectMenu").innerHTML = COUNTRY_CODES.map(
  ([iso, name, dial]) =>
    `<div class="bo-select-option bo-country-option" data-value="${iso}" data-display="${dial}"><span class="bo-country-name">${supFilterEsc(name)}</span><span class="bo-country-dial">${dial}</span>${checkSvg}</div>`
).join("");

document.querySelectorAll(".bo-select").forEach(wireBoSelect);

const userForm = document.getElementById("addUserForm");
const roleSelect = userForm.querySelector('.bo-select[data-name="role"]');
const countrySelect = userForm.querySelector('.bo-select[data-name="countryCode"]');
const mfaMethodSelect = userForm.querySelector('.bo-select[data-name="mfaMethod"]');
const commPrefSelect = userForm.querySelector('.bo-select[data-name="commPref"]');
const perPageSelect = document.getElementById("userPerPageSelect");

addBoSelectSearch(roleSelect, "Search...");
addBoSelectSearch(countrySelect, "Search countries");

document.addEventListener("click", closeAllBoSelects);
/* Scrolling a long menu (Role, country) keeps it open; scrolling anything
   else closes it, since the menu is fixed under its trigger. */
document.addEventListener("scroll", (e) => {
  if (e.target instanceof Element && e.target.closest(".bo-select-menu")) return;
  closeAllBoSelects();
}, true);
window.addEventListener("resize", closeAllBoSelects);

/* ---------------- Items per page ---------------- */
perPageSelect.querySelector("input[type=hidden]").addEventListener("change", (e) => {
  userPageSize = Number(e.target.value);
  userCurrentPage = 1;
  renderUsers();
});

/* ---------------- Allowed Organizations (multi-select, all ticked by default) ---------------- */
const allowedOrgsFilter = wireSupportMultiFilter("allowedOrgsSelect", {
  options: asFilterOptions(orgNames),
  selected: orgNames,
  searchPlaceholder: "Search...",
  allLabel: ALL_ORGS,
});

/* ---------------- Create / Edit user drawer ---------------- */
const userOverlay = document.getElementById("addUserOverlay");
const userDrawerTitle = document.getElementById("userDrawerTitle");
const saveUserBtn = document.getElementById("saveAddUser");
const viewLogFieldWrap = document.getElementById("viewLogFieldWrap");
const viewRecordingFieldWrap = document.getElementById("viewRecordingFieldWrap");
const mfaMethodFieldWrap = document.getElementById("mfaMethodFieldWrap");

let editingUserId = null;
let initialFormState = "";

const hiddenValue = (select) => select.querySelector("input[type=hidden]").value;

function updateViewPermsVisibility() {
  const hasPerms = ROLES_WITH_VIEW_PERMS.includes(hiddenValue(roleSelect));
  viewLogFieldWrap.hidden = !hasPerms;
  viewRecordingFieldWrap.hidden = !hasPerms;
  if (!hasPerms) {
    userForm.canViewLogs.checked = false;
    userForm.canViewRecordings.checked = false;
  }
}

function updateMfaMethodVisibility() {
  mfaMethodFieldWrap.hidden = !userForm.mfa.checked;
}

roleSelect.querySelector("input[type=hidden]").addEventListener("change", updateViewPermsVisibility);
userForm.mfa.addEventListener("change", updateMfaMethodVisibility);

/* Required-field values, keyed by each field wrapper's data-required. */
function requiredValues() {
  return {
    username: userForm.username.value.trim(),
    role: hiddenValue(roleSelect),
    firstName: userForm.firstName.value.trim(),
    lastName: userForm.lastName.value.trim(),
    email: userForm.email.value.trim(),
    mobile: userForm.mobile.value.trim(),
    allowedOrgs: allowedOrgsFilter.getSelected().join(" "),
  };
}

function setFieldError(key, show) {
  const field = userForm.querySelector(`[data-required="${key}"]`);
  field.querySelector(".bo-field-error").hidden = !show;
}

function formState() {
  return JSON.stringify({
    ...requiredValues(),
    country: hiddenValue(countrySelect),
    mfa: userForm.mfa.checked,
    mfaMethod: hiddenValue(mfaMethodSelect),
    commPref: hiddenValue(commPrefSelect),
    logs: userForm.canViewLogs.checked,
    recordings: userForm.canViewRecordings.checked,
  });
}

function validateUserForm() {
  const allFilled = Object.values(requiredValues()).every(Boolean);
  const changed = editingUserId === null || formState() !== initialFormState;
  saveUserBtn.disabled = !allFilled || !changed;
}

/* A required text field shows its error once it's left empty. */
["username", "firstName", "lastName", "email", "mobile"].forEach((name) => {
  userForm[name].addEventListener("blur", () => setFieldError(name, userForm[name].value.trim() === ""));
  userForm[name].addEventListener("input", () => { if (userForm[name].value.trim()) setFieldError(name, false); });
});
roleSelect.querySelector("input[type=hidden]").addEventListener("change", () => setFieldError("role", false));
document.getElementById("allowedOrgsSelect").addEventListener("change", () => {
  setFieldError("allowedOrgs", allowedOrgsFilter.getSelected().length === 0);
  validateUserForm();
});

userForm.addEventListener("input", validateUserForm);
userForm.addEventListener("change", validateUserForm);

/* Several countries share a dial code; an existing number opens on the
   country most users mean by it. */
const PREFERRED_COUNTRY_BY_DIAL = { "+1": "US", "+7": "RU", "+39": "IT", "+44": "GB", "+47": "NO", "+61": "AU", "+212": "MA", "+262": "YT", "+590": "GP" };
function countryForDial(dial) {
  return PREFERRED_COUNTRY_BY_DIAL[dial] || (COUNTRY_CODES.find((c) => c[2] === dial) || [])[0] || "US";
}

function openUserDrawer(user = null) {
  editingUserId = user ? user.id : null;
  userDrawerTitle.textContent = user ? "Edit User" : "Create User";

  userForm.reset();
  userForm.querySelectorAll(".bo-field-error").forEach((el) => { el.hidden = true; });
  userForm.username.disabled = !!user;

  const [dial, number] = user && user.phone ? [user.phone.slice(0, user.phone.indexOf("-")), user.phone.slice(user.phone.indexOf("-") + 1)] : ["", ""];

  userForm.username.value = user ? user.username : "";
  userForm.firstName.value = user ? user.firstName : "";
  userForm.lastName.value = user ? user.lastName : "";
  userForm.email.value = user ? user.email : "";
  userForm.mobile.value = number;
  setBoSelectValue(roleSelect, user ? roleLabel(user.role) : "", { silent: true });
  setBoSelectValue(countrySelect, user ? user.countryIso || countryForDial(dial) : "US", { silent: true });
  allowedOrgsFilter.setSelected(!user || user.allowedOrgs === ALL_ORGS ? orgNames : user.allowedOrgs.split(" "));
  userForm.mfa.checked = user ? !!user.mfa : false;
  setBoSelectValue(mfaMethodSelect, (user && user.mfaMethod) || "SMS", { silent: true });
  setBoSelectValue(commPrefSelect, (user && user.commPreference) || "Email", { silent: true });

  updateViewPermsVisibility();
  userForm.canViewLogs.checked = !!(user && user.canViewLogs);
  userForm.canViewRecordings.checked = !!(user && user.canViewRecordings);
  updateMfaMethodVisibility();

  initialFormState = formState();
  validateUserForm();
  userOverlay.classList.add("open");
}

function closeUserDrawer() {
  userOverlay.classList.remove("open");
  closeAllBoSelects();
}

userForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveUserBtn.disabled) return;

  const role = hiddenValue(roleSelect);
  const iso = hiddenValue(countrySelect);
  const dial = (COUNTRY_CODES.find((c) => c[0] === iso) || [])[2] || "";
  const pickedOrgs = allowedOrgsFilter.getSelected();
  const hasPerms = ROLES_WITH_VIEW_PERMS.includes(role);

  const fields = {
    firstName: userForm.firstName.value.trim(),
    lastName: userForm.lastName.value.trim(),
    email: userForm.email.value.trim(),
    phone: `${dial}-${userForm.mobile.value.trim()}`,
    countryIso: iso,
    role,
    allowedOrgs: pickedOrgs.length === orgNames.length ? ALL_ORGS : pickedOrgs.join(" "),
    mfa: userForm.mfa.checked,
    mfaMethod: userForm.mfa.checked ? hiddenValue(mfaMethodSelect) : "",
    commPreference: hiddenValue(commPrefSelect),
    canViewLogs: hasPerms && userForm.canViewLogs.checked,
    canViewRecordings: hasPerms && userForm.canViewRecordings.checked,
  };

  const existing = boUsers.find((u) => u.id === editingUserId);
  if (existing) {
    Object.assign(existing, fields);
  } else {
    boUsers.unshift({
      id: boUsers.length ? Math.max(...boUsers.map((u) => u.id)) + 1 : 0,
      username: userForm.username.value.trim(),
      dateCreated: new Date().toLocaleDateString("en-GB"),
      locked: false,
      ...fields,
    });
    userCurrentPage = 1;
  }

  closeUserDrawer();
  renderUsers();
});

document.getElementById("openAddUserBtn").addEventListener("click", () => openUserDrawer());
document.getElementById("cancelAddUser").addEventListener("click", closeUserDrawer);
document.getElementById("closeAddUserX").addEventListener("click", closeUserDrawer);
userOverlay.addEventListener("click", (e) => { if (e.target === userOverlay) closeUserDrawer(); });
