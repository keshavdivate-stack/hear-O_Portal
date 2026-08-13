/* ---------------- Non-HMO Patients Events ---------------- */
const PE_PAGE_SIZE = 20;

document.getElementById("peSiteFilter").insertAdjacentHTML(
  "beforeend",
  PE_SITES.map((s) => `<option value="${s}">${s}</option>`).join("")
);
document.getElementById("peEventTypeFilter").insertAdjacentHTML(
  "beforeend",
  PE_EVENT_TYPES.map((t) => `<option value="${t}">${t}</option>`).join("")
);

let peSiteFilter = "";
let peEventTypeFilter = "";
let pePatientFilter = "";
let peAddedByFilter = "";
let peReportedByFilter = "";
let peDisapprovedOnly = false;

function peFiltered() {
  return peEvents.filter((r) => {
    if (peSiteFilter && !r.username.startsWith(peSiteFilter)) return false;
    if (peEventTypeFilter && r.eventType !== peEventTypeFilter) return false;
    if (peDisapprovedOnly && r.approved) return false;

    if (pePatientFilter) {
      const names = pePatientFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (names.length && !names.some((n) => r.username.toLowerCase().includes(n))) return false;
    }
    if (peAddedByFilter) {
      const names = peAddedByFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (names.length && !names.some((n) => r.addedBy.toLowerCase().includes(n))) return false;
    }
    if (peReportedByFilter) {
      const names = peReportedByFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (names.length && !names.some((n) => r.reportedBy.toLowerCase().includes(n))) return false;
    }

    return true;
  });
}

const peEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const peTrashIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 7V4.5C9 4 9.4 3.6 9.9 3.6H14.1C14.6 3.6 15 4 15 4.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 7L6.8 19.2C6.9 19.9 7.5 20.4 8.2 20.4H15.8C16.5 20.4 17.1 19.9 17.2 19.2L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function peEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

const pePager = boCreatePager(
  "peRows",
  () => peFiltered().map((r) => ({ r })),
  (e) => `
    <tr>
      <td>${peEsc(e.r.username)}</td>
      <td>${peEsc(e.r.eventType)}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${e.r.id}" data-field="influenceCompliance" ${e.r.influenceCompliance ? "checked" : ""} /></td>
      <td>${peEsc(e.r.description)}</td>
      <td>${peEsc(e.r.addedBy)}</td>
      <td>${peEsc(e.r.reportedBy)}</td>
      <td>${peEsc(e.r.reportedVia)}</td>
      <td>${peEsc(e.r.reportedTime)}</td>
      <td>${peEsc(e.r.startDate)}</td>
      <td>${peEsc(e.r.endDate)}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${e.r.id}" data-field="approved" ${e.r.approved ? "checked" : ""} /></td>
      <td>${peEsc(e.r.status)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon" data-id="${e.r.id}" data-act="edit" aria-label="Edit">${peEditIcon}</button>
          <button class="bo-action-icon" data-id="${e.r.id}" data-act="delete" aria-label="Delete">${peTrashIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: PE_PAGE_SIZE, emptyColspan: 13, emptyText: "No events found for the selected filters." }
);
pePager();

document.getElementById("peRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const rec = peEvents.find((r) => r.id === Number(box.dataset.id));
  if (rec) rec[box.dataset.field] = box.checked;
});

document.getElementById("peRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-action-icon");
  if (!btn) return;
  const rec = peEvents.find((r) => r.id === Number(btn.dataset.id));
  if (!rec) return;

  if (btn.dataset.act === "edit") {
    openEventDrawer(rec);
  } else if (btn.dataset.act === "delete") {
    if (!confirm(`Delete this event for "${rec.username}"?`)) return;
    peEvents.splice(peEvents.indexOf(rec), 1);
    pePager();
  }
});

document.getElementById("peApplyBtn").addEventListener("click", () => {
  peSiteFilter = document.getElementById("peSiteFilter").value;
  peEventTypeFilter = document.getElementById("peEventTypeFilter").value;
  pePatientFilter = document.getElementById("pePatientFilter").value;
  peAddedByFilter = document.getElementById("peAddedByFilter").value;
  peReportedByFilter = document.getElementById("peReportedByFilter").value;
  pePager.resetPage();
  pePager();
});

document.getElementById("peDisapprovedOnly").addEventListener("change", (e) => {
  peDisapprovedOnly = e.target.checked;
  pePager.resetPage();
  pePager();
});

/* ---------------- Custom selects (shared across both drawers) ---------------- */
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

/* ---------------- Add / Update Event drawer ---------------- */
const peEventDrawerOverlay = document.getElementById("peEventDrawerOverlay");
const peEventForm = document.getElementById("peEventForm");
const peSaveEventBtn = document.getElementById("peSaveEventBtn");
const influenceSelect = peEventForm.querySelector('.bo-select[data-name="influenceCompliance"]');
const reportedViaSelect = peEventForm.querySelector('.bo-select[data-name="reportedVia"]');
let editingEventId = null;

function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function validateEventForm() {
  peSaveEventBtn.disabled = peEventForm.username.value.trim() === "";
}

function openEventDrawer(record) {
  peEventForm.reset();
  editingEventId = record ? record.id : null;

  setBoSelectValue(influenceSelect, record ? (record.influenceCompliance ? "Yes" : "No") : "", { silent: true });
  setBoSelectValue(reportedViaSelect, record ? record.reportedVia : "", { silent: true });

  if (record) {
    peEventForm.username.value = record.username;
    peEventForm.description.value = record.description;
    peEventForm.reportedBy.value = record.reportedBy;
    peEventForm.reportedDate.value = record.reportedTime ? record.reportedTime.split(" ")[0].split("/").reverse().join("-") : todayIso();
  } else {
    peEventForm.reportedDate.value = todayIso();
  }

  validateEventForm();
  peEventDrawerOverlay.classList.add("open");
}

function closeEventDrawer() {
  peEventDrawerOverlay.classList.remove("open");
}

peEventForm.addEventListener("input", validateEventForm);
peEventForm.addEventListener("change", validateEventForm);

document.getElementById("peCheckExistenceBtn").addEventListener("click", () => {
  const input = peEventForm.username;
  if (!input.value.trim()) {
    input.focus();
    return;
  }
  input.style.borderColor = "var(--green)";
  setTimeout(() => { input.style.borderColor = ""; }, 900);
});

peEventForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (peSaveEventBtn.disabled) return;

  const dateStr = peEventForm.reportedDate.value ? peEventForm.reportedDate.value.split("-").reverse().join("/") : "";
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const record = {
    username: peEventForm.username.value.trim(),
    eventType: editingEventId === null ? "MANUAL" : peEvents.find((r) => r.id === editingEventId).eventType,
    influenceCompliance: influenceSelect.querySelector("input[type=hidden]").value === "Yes",
    description: peEventForm.description.value.trim(),
    addedBy: peEventForm.username.value.trim(),
    reportedBy: peEventForm.reportedBy.value.trim(),
    reportedVia: reportedViaSelect.querySelector("input[type=hidden]").value,
    reportedTime: `${dateStr} ${timeStr}`,
    startDate: dateStr,
    endDate: editingEventId === null ? "" : peEvents.find((r) => r.id === editingEventId).endDate,
    approved: editingEventId === null ? false : peEvents.find((r) => r.id === editingEventId).approved,
    status: editingEventId === null ? "" : peEvents.find((r) => r.id === editingEventId).status,
  };

  if (editingEventId === null) {
    peEvents.unshift({ ...record, id: peEvents.length ? Math.max(...peEvents.map((r) => r.id)) + 1 : 0 });
  } else {
    const existing = peEvents.find((r) => r.id === editingEventId);
    if (existing) Object.assign(existing, record);
  }

  closeEventDrawer();
  pePager.resetPage();
  pePager();
});

document.getElementById("peAddEventBtn").addEventListener("click", () => openEventDrawer(null));
document.getElementById("peCancelEventDrawer").addEventListener("click", closeEventDrawer);
document.getElementById("peCloseEventDrawerX").addEventListener("click", closeEventDrawer);
peEventDrawerOverlay.addEventListener("click", (e) => { if (e.target === peEventDrawerOverlay) closeEventDrawer(); });

/* ---------------- Send message drawer ---------------- */
const peMessageDrawerOverlay = document.getElementById("peMessageDrawerOverlay");
const peMessageForm = document.getElementById("peMessageForm");
const peSaveMessageBtn = document.getElementById("peSaveMessageBtn");
const peMsgPatientField = document.getElementById("peMsgPatientField");

function validateMessageForm() {
  const sendTo = peMessageForm.sendTo.value;
  const patientOk = sendTo !== "Patient" || peMessageForm.patientUsername.value.trim() !== "";
  const messageOk = peMessageForm.message.value.trim() !== "";
  peSaveMessageBtn.disabled = !(patientOk && messageOk);
}

function syncMessageSendTo() {
  const sendTo = peMessageForm.sendTo.value;
  peMsgPatientField.style.display = sendTo === "Patient" ? "" : "none";
  validateMessageForm();
}

function openMessageDrawer() {
  peMessageForm.reset();
  peMessageForm.language.value = "";
  syncMessageSendTo();
  peMessageDrawerOverlay.classList.add("open");
}

function closeMessageDrawer() {
  peMessageDrawerOverlay.classList.remove("open");
}

peMessageForm.addEventListener("input", validateMessageForm);
peMessageForm.addEventListener("change", (e) => {
  if (e.target.name === "sendTo") syncMessageSendTo();
  else validateMessageForm();
});

document.getElementById("peCheckLanguageBtn").addEventListener("click", () => {
  const username = peMessageForm.patientUsername.value.trim();
  if (!username) {
    peMessageForm.patientUsername.focus();
    return;
  }
  const langs = ["EN", "HE", "AR", "ES", "RU", "DE"];
  peMessageForm.language.value = langs[username.length % langs.length];
});

peMessageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (peSaveMessageBtn.disabled) return;
  closeMessageDrawer();
});

document.getElementById("peAddMessageBtn").addEventListener("click", openMessageDrawer);
document.getElementById("peCancelMessageDrawer").addEventListener("click", closeMessageDrawer);
document.getElementById("peCloseMessageDrawerX").addEventListener("click", closeMessageDrawer);
peMessageDrawerOverlay.addEventListener("click", (e) => { if (e.target === peMessageDrawerOverlay) closeMessageDrawer(); });
