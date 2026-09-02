/* ---------------- Non-HMO Patients Events ---------------- */
const PE_PAGE_SIZE = 20;
const PE_APPROVED_OPTIONS = ["APPROVED", "DISAPPROVED"];

/* ---------------- Multi-select checkbox filter (Clinical site / Event type / Approved) ----------------
   Every value starts checked (= "All", no filtering). Unchecking items narrows the filter;
   the "All" row is just a shortcut that selects/clears every option at once. */
const peCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function wireMultiSelect(containerId, values) {
  const container = document.getElementById(containerId);
  const trigger = container.querySelector(".bo-multiselect-trigger");
  const valueEl = container.querySelector(".bo-multiselect-value");
  const menu = container.querySelector(".bo-multiselect-menu");
  const selected = new Set(values);

  function renderMenu() {
    const allChecked = selected.size === values.length;
    menu.innerHTML =
      `<label class="bo-multiselect-option all${allChecked ? " checked" : ""}" data-all="1">
        <span class="bo-multiselect-checkbox">${peCheckIcon}</span> All
      </label>` +
      values
        .map(
          (v) => `<label class="bo-multiselect-option${selected.has(v) ? " checked" : ""}" data-value="${v}">
            <span class="bo-multiselect-checkbox">${peCheckIcon}</span> ${v}
          </label>`
        )
        .join("");
  }

  function renderTrigger() {
    if (selected.size === values.length || selected.size === 0) {
      valueEl.textContent = "All";
    } else {
      valueEl.textContent = values.filter((v) => selected.has(v)).join(", ");
    }
  }

  renderMenu();
  renderTrigger();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !container.classList.contains("open");
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
    if (willOpen) container.classList.add("open");
  });

  menu.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-multiselect-option");
    if (!option) return;
    e.stopPropagation();

    if (option.dataset.all) {
      if (selected.size === values.length) selected.clear();
      else values.forEach((v) => selected.add(v));
    } else {
      const v = option.dataset.value;
      if (selected.has(v)) selected.delete(v);
      else selected.add(v);
    }

    renderMenu();
    renderTrigger();
  });

  return { getSelected: () => selected };
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) {
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
  }
});

const peSiteMultiSelect = wireMultiSelect("peSiteFilter", PE_SITES);
const peEventTypeMultiSelect = wireMultiSelect("peEventTypeFilter", PE_EVENT_TYPES);
const peApprovedMultiSelect = wireMultiSelect("peApprovedFilter", PE_APPROVED_OPTIONS);

let peSiteFilter = new Set(PE_SITES);
let peEventTypeFilter = new Set(PE_EVENT_TYPES);
let peApprovedFilter = new Set(PE_APPROVED_OPTIONS);
let pePatientFilter = "";
let peAddedByFilter = "";
let peReportedByFilter = "";

function peFiltered() {
  return peEvents.filter((r) => {
    if (peSiteFilter.size && peSiteFilter.size < PE_SITES.length) {
      if (![...peSiteFilter].some((s) => r.username.startsWith(s))) return false;
    }
    if (peEventTypeFilter.size && peEventTypeFilter.size < PE_EVENT_TYPES.length && !peEventTypeFilter.has(r.eventType)) return false;
    if (peApprovedFilter.size && peApprovedFilter.size < PE_APPROVED_OPTIONS.length) {
      const label = r.approved ? "APPROVED" : "DISAPPROVED";
      if (!peApprovedFilter.has(label)) return false;
    }

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

const peKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

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
          <button class="bo-action-icon row-menu-trigger" data-id="${e.r.id}" aria-label="Row actions">${peKebabIcon}</button>
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

/* ---------------- Row action dropdown (edit / delete) ---------------- */
const peRowMenu = document.getElementById("peRowMenu");
let activePeRowId = null;

document.getElementById("peRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activePeRowId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  peRowMenu.style.top = `${rect.bottom + 6}px`;
  peRowMenu.style.left = `${rect.right - 190}px`;
  peRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!peRowMenu.contains(e.target)) peRowMenu.classList.remove("open");
});

peRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activePeRowId === null) return;
  peRowMenu.classList.remove("open");

  const rec = peEvents.find((r) => r.id === activePeRowId);
  if (!rec) return;

  if (item.dataset.action === "edit") {
    openEventDrawer(rec);
  } else if (item.dataset.action === "delete") {
    if (!confirm(`Delete this event for "${rec.username}"?`)) return;
    peEvents.splice(peEvents.indexOf(rec), 1);
    pePager();
  }
});

document.getElementById("peApplyBtn").addEventListener("click", () => {
  peSiteFilter = peSiteMultiSelect.getSelected();
  peEventTypeFilter = peEventTypeMultiSelect.getSelected();
  peApprovedFilter = peApprovedMultiSelect.getSelected();
  pePatientFilter = document.getElementById("pePatientFilter").value;
  peAddedByFilter = document.getElementById("peAddedByFilter").value;
  peReportedByFilter = document.getElementById("peReportedByFilter").value;
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
const peMessageLanguageSelect = peMessageForm.querySelector('.bo-select[data-name="language"]');

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
  setBoSelectValue(peMessageLanguageSelect, "", { silent: true });
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
  setBoSelectValue(peMessageLanguageSelect, langs[username.length % langs.length]);
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
