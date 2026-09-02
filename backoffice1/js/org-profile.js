/* ---------------- Resolve current org from ?id= ---------------- */
const orgProfileParams = new URLSearchParams(location.search);
const orgProfileId = Number(orgProfileParams.get("id"));
const org = orgs.find((o) => o.id === orgProfileId) || orgs[0];

/* An explicit ?return= (e.g. from a Ticket's "View Organization Profile"
   action) sends back there instead of the generic Organizations list. */
const orgProfileReturnTo = orgProfileParams.get("return");
if (orgProfileReturnTo) {
  document.getElementById("orgProfileBackLink").href = decodeURIComponent(orgProfileReturnTo);
}

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
const patientsTabActions = document.getElementById("patientsTabActions");

document.querySelectorAll(".bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    const onUsersTab = tab.dataset.tab === "users";
    const onPatientsTab = tab.dataset.tab === "patients";
    editOrgBtn.hidden = onUsersTab || onPatientsTab;
    usersTabActions.hidden = !onUsersTab;
    patientsTabActions.hidden = !onPatientsTab;
  });
});

/* ---------------- Users table (same data + behavior as Manage Users, scoped to this org) ---------------- */
const USER_PAGE_SIZE = 20;
let orgUserCurrentPage = 1;
let orgUserSortDir = "asc";
let orgUserSearchTerm = "";

function orgOwnsUser(u) {
  return u.allowedOrgs === "All Organizations" || u.allowedOrgs.split(" ").includes(org.name);
}

function orgUsersList() {
  return boUsers.filter(orgOwnsUser);
}

function filteredUsers() {
  const list = orgUsersList();
  if (!orgUserSearchTerm) return list;
  const q = orgUserSearchTerm.toLowerCase();
  return list.filter(
    (u) =>
      u.username.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
}

function sortedUsers() {
  const list = [...filteredUsers()];
  list.sort((a, b) => (orgUserSortDir === "asc" ? a.username.localeCompare(b.username, undefined, { numeric: true }) : b.username.localeCompare(a.username, undefined, { numeric: true })));
  return list;
}

const onOff = (v) => (v ? "On" : "Off");
const userKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderUsers() {
  const list = sortedUsers();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / USER_PAGE_SIZE));
  orgUserCurrentPage = Math.min(orgUserCurrentPage, totalPages);

  const start = (orgUserCurrentPage - 1) * USER_PAGE_SIZE;
  const pageItems = list.slice(start, start + USER_PAGE_SIZE);

  document.getElementById("orgUsersRows").innerHTML = pageItems.length
    ? pageItems
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
        <td>${onOff(u.mfa)}</td>
        <td>${yesNo(u.locked)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${u.id}" aria-label="Row actions">${userKebabIcon}</button>
          </div>
        </td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="10" style="text-align:center; color:var(--gray-text); padding:28px;">No users yet for this organization.</td></tr>`;

  const rangeEnd = total === 0 ? 0 : Math.min(start + USER_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("orgUserPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("orgUserFirstPage").disabled = orgUserCurrentPage === 1;
  document.getElementById("orgUserPrevPage").disabled = orgUserCurrentPage === 1;
  document.getElementById("orgUserNextPage").disabled = orgUserCurrentPage === totalPages;
  document.getElementById("orgUserLastPage").disabled = orgUserCurrentPage === totalPages;
}

renderUsers();

document.getElementById("userSearchInput").addEventListener("input", (e) => {
  orgUserSearchTerm = e.target.value.trim();
  orgUserCurrentPage = 1;
  renderUsers();
});

document.querySelector("#tab-users .bo-list-table th.sortable").addEventListener("click", () => {
  orgUserSortDir = orgUserSortDir === "asc" ? "desc" : "asc";
  renderUsers();
});

document.getElementById("orgUserFirstPage").addEventListener("click", () => { orgUserCurrentPage = 1; renderUsers(); });
document.getElementById("orgUserPrevPage").addEventListener("click", () => { orgUserCurrentPage -= 1; renderUsers(); });
document.getElementById("orgUserNextPage").addEventListener("click", () => { orgUserCurrentPage += 1; renderUsers(); });
document.getElementById("orgUserLastPage").addEventListener("click", () => {
  orgUserCurrentPage = Math.ceil(filteredUsers().length / USER_PAGE_SIZE);
  renderUsers();
});

/* ---------------- Row action dropdown (reset password / edit / delete) ---------------- */
const userRowMenu = document.getElementById("userRowMenu");
let activeUserId = null;

document.getElementById("orgUsersRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeUserId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  userRowMenu.style.top = `${rect.bottom + 6}px`;
  userRowMenu.style.left = `${rect.right - 190}px`;
  userRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!userRowMenu.contains(e.target)) userRowMenu.classList.remove("open");
});

userRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-icon-btn");
  if (!item || activeUserId === null) return;
  userRowMenu.classList.remove("open");

  const user = boUsers.find((u) => u.id === activeUserId);
  if (!user) return;

  if (item.dataset.action === "delete") {
    boUsers.splice(boUsers.indexOf(user), 1);
    renderUsers();
  } else if (item.dataset.action === "edit") {
    openUserDrawer(user);
  }
  // "reset" (Reset Password) has no wired behavior in this preview.
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
let editingUserId = null;

function validateUserForm() {
  const roleValue = userForm.querySelector('.bo-select[data-name="role"] input[type=hidden]').value;
  saveUserBtn.disabled = userForm.username.value.trim() === "" || userForm.email.value.trim() === "" || roleValue === "";
}

function openUserDrawer(user) {
  userForm.reset();
  editingUserId = user ? user.id : null;
  userDrawerTitle.textContent = "Create user";

  const roleSelect = userForm.querySelector('.bo-select[data-name="role"]');
  const mfaMethodSelect = userForm.querySelector('.bo-select[data-name="mfaMethod"]');
  const countryCodeSelect = userForm.querySelector('.bo-select[data-name="countryCode"]');
  const languageSelect = userForm.querySelector('.bo-select[data-name="language"]');

  setBoSelectValue(roleSelect, user ? user.role : "", { silent: true });
  setBoSelectValue(mfaMethodSelect, user ? user.mfaMethod || "" : "", { silent: true });
  setBoSelectValue(countryCodeSelect, "+91", { silent: true });
  setBoSelectValue(languageSelect, user ? user.language || "English" : "English", { silent: true });

  if (user) {
    userForm.username.value = user.username || "";
    userForm.firstName.value = user.firstName || "";
    userForm.lastName.value = user.lastName || "";
    userForm.mobile.value = (user.phone || "").split("-").slice(1).join("-");
    userForm.email.value = user.email || "";
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
  const countryCode = userForm.querySelector('.bo-select[data-name="countryCode"] input[type=hidden]').value || "+91";
  const languageSelect = userForm.querySelector('.bo-select[data-name="language"]');

  const record = {
    username: userForm.username.value.trim(),
    firstName: userForm.firstName.value.trim(),
    lastName: userForm.lastName.value.trim(),
    email: userForm.email.value.trim(),
    phone: userForm.mobile.value.trim() ? `${countryCode}-${userForm.mobile.value.trim()}` : "",
    role: roleSelect.querySelector('input[type=hidden]').value || "—",
    mfaMethod: mfaMethodSelect.querySelector('input[type=hidden]').value || "",
    mfa: userForm.mfa.checked,
    language: languageSelect.querySelector('input[type=hidden]').value || "English",
  };

  if (editingUserId === null) {
    boUsers.unshift({
      ...record,
      id: boUsers.length ? Math.max(...boUsers.map((u) => u.id)) + 1 : 0,
      dateCreated: new Date().toLocaleDateString("en-GB"),
      allowedOrgs: org.name,
      locked: false,
    });
    orgUserCurrentPage = 1;
  } else {
    const existing = boUsers.find((u) => u.id === editingUserId);
    if (existing) Object.assign(existing, record);
  }

  closeUserDrawer();
  renderUsers();
});

document.getElementById("openAddUserBtn").addEventListener("click", () => openUserDrawer());
document.getElementById("cancelUserDrawer").addEventListener("click", closeUserDrawer);
document.getElementById("closeUserDrawerX").addEventListener("click", closeUserDrawer);
userDrawerOverlay.addEventListener("click", (e) => { if (e.target === userDrawerOverlay) closeUserDrawer(); });

/* ---------------- Patients table (same data + behavior as Patient Management, scoped to this org) ---------------- */
const ORG_PATIENT_PAGE_SIZE = 20;
let orgPatientCurrentPage = 1;
let orgPatientSortDir = "asc";
let orgPatientSearchTerm = "";

function orgOwnsPatient(p) {
  return p.username.split("-")[0] === org.name;
}

function orgPatientsList() {
  return patients.filter(orgOwnsPatient);
}

function filteredOrgPatients() {
  const list = orgPatientsList();
  if (!orgPatientSearchTerm) return list;
  return list.filter((p) => p.username.toLowerCase().includes(orgPatientSearchTerm));
}

function sortedOrgPatients() {
  const list = [...filteredOrgPatients()];
  list.sort((a, b) => (orgPatientSortDir === "asc" ? a.username.localeCompare(b.username, undefined, { numeric: true }) : b.username.localeCompare(a.username, undefined, { numeric: true })));
  return list;
}

const orgPatientPct = (v) => (v === null || v === undefined ? "—" : `${v}%`);
const orgPatientKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function orgPatientStatusClass(status) {
  return status.toLowerCase();
}

function renderOrgPatients() {
  const list = sortedOrgPatients();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / ORG_PATIENT_PAGE_SIZE));
  orgPatientCurrentPage = Math.min(orgPatientCurrentPage, totalPages);

  const start = (orgPatientCurrentPage - 1) * ORG_PATIENT_PAGE_SIZE;
  const pageItems = list.slice(start, start + ORG_PATIENT_PAGE_SIZE);

  document.getElementById("orgPatientRows").innerHTML = pageItems.length
    ? pageItems
        .map(
          (p) => `
      <tr>
        <td><a class="bo-name-link" href="patient-health-dashboard.html?patient=${p.username}">${p.username}</a></td>
        <td>${p.lang}</td>
        <td>${p.tag}</td>
        <td><span class="bo-status-pill ${orgPatientStatusClass(p.status)}">${p.status}</span></td>
        <td>${p.statusStart}</td>
        <td>${p.lastSession}</td>
        <td>${orgPatientPct(p.usableCompliance)}</td>
        <td>${orgPatientPct(p.compliance)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-id="${p.id}" aria-label="Row actions">${orgPatientKebabIcon}</button>
          </div>
        </td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="9" style="text-align:center; color:var(--gray-text); padding:28px;">No patients yet for this organization.</td></tr>`;

  const rangeEnd = total === 0 ? 0 : Math.min(start + ORG_PATIENT_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("orgPatientPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("orgPatientFirstPage").disabled = orgPatientCurrentPage === 1;
  document.getElementById("orgPatientPrevPage").disabled = orgPatientCurrentPage === 1;
  document.getElementById("orgPatientNextPage").disabled = orgPatientCurrentPage === totalPages;
  document.getElementById("orgPatientLastPage").disabled = orgPatientCurrentPage === totalPages;
}

renderOrgPatients();

document.getElementById("orgPatientSearchInput").addEventListener("input", (e) => {
  orgPatientSearchTerm = e.target.value.trim().toLowerCase();
  orgPatientCurrentPage = 1;
  renderOrgPatients();
});

document.querySelector("#tab-patients .bo-list-table th.sortable").addEventListener("click", () => {
  orgPatientSortDir = orgPatientSortDir === "asc" ? "desc" : "asc";
  renderOrgPatients();
});

document.getElementById("orgPatientFirstPage").addEventListener("click", () => { orgPatientCurrentPage = 1; renderOrgPatients(); });
document.getElementById("orgPatientPrevPage").addEventListener("click", () => { orgPatientCurrentPage -= 1; renderOrgPatients(); });
document.getElementById("orgPatientNextPage").addEventListener("click", () => { orgPatientCurrentPage += 1; renderOrgPatients(); });
document.getElementById("orgPatientLastPage").addEventListener("click", () => {
  orgPatientCurrentPage = Math.ceil(filteredOrgPatients().length / ORG_PATIENT_PAGE_SIZE);
  renderOrgPatients();
});

const orgPatientRowMenu = document.getElementById("orgPatientRowMenu");
let activeOrgPatientId = null;

document.getElementById("orgPatientRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeOrgPatientId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  orgPatientRowMenu.style.top = `${rect.bottom + 6}px`;
  orgPatientRowMenu.style.left = `${rect.right - 190}px`;
  orgPatientRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!orgPatientRowMenu.contains(e.target)) orgPatientRowMenu.classList.remove("open");
});

orgPatientRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-icon-btn");
  if (!item) return;
  orgPatientRowMenu.classList.remove("open");
});
