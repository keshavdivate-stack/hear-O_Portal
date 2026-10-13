/* ---------------- Patient Event ---------------- */
const PE_PAGE_SIZE = 20;

/* ---------------- Filter bar ----------------
   Matches the developed Patient Event filters, in our own components:
   Clinical site (multi-select, defaults to All), Select event type
   (multi-select over the 24 event types, nothing picked = every type),
   Approved (single-select: Not approved / Approved, nothing picked = both),
   three text searches and a From/To start-date range. Picking values only
   stages them -- the list changes on Apply. */
const peSiteMultiSelect = wireSupportMultiFilter("peSiteFilter", {
  options: asFilterOptions(PE_SITES),
  selected: PE_SITES,
});
const peEventTypeMultiSelect = wireSupportMultiFilter("peEventTypeFilter", {
  options: asFilterOptions(PE_EVENT_TYPES),
  searchPlaceholder: "Search event type",
});
const peApprovedSelect = document.getElementById("peApprovedSelect");

const PE_DEFAULT_FILTERS = { sites: PE_SITES, eventTypes: [], approved: "", patient: "", addedBy: "", reportedBy: "", from: "", to: "" };
let peFilters = { ...PE_DEFAULT_FILTERS };
/* Active/Archived is its own tab, not a filter -- archiving an event hides it
   from the working list without deleting it, mirroring Organizations Management. */
let peViewTab = "active";

/* Copies what the filter controls currently show into peFilters. */
function peReadFilters() {
  peFilters = {
    sites: peSiteMultiSelect.getSelected(),
    eventTypes: peEventTypeMultiSelect.getSelected(),
    approved: document.getElementById("peApprovedFilter").value,
    patient: document.getElementById("pePatientFilter").value,
    addedBy: document.getElementById("peAddedByFilter").value,
    reportedBy: document.getElementById("peReportedByFilter").value,
    from: document.getElementById("peFromDate").value,
    to: document.getElementById("peToDate").value,
  };
}

/* Comma-separated text search: matches when any of the terms is contained. */
function peMatchesSearch(value, query) {
  const terms = query.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return !terms.length || terms.some((t) => String(value || "").toLowerCase().includes(t));
}

function peFiltered() {
  const f = peFilters;
  return peEvents.filter((r) => {
    if (!!r.archived !== (peViewTab === "archived")) return false;
    /* No site picked behaves like All, same as an empty event-type pick. */
    if (f.sites.length && f.sites.length < PE_SITES.length && !f.sites.some((s) => r.username.startsWith(s))) return false;
    if (f.eventTypes.length && !f.eventTypes.includes(r.eventType)) return false;
    if (f.approved && String(!!r.approved) !== f.approved) return false;

    if (!peMatchesSearch(r.username, f.patient)) return false;
    if (!peMatchesSearch(r.addedBy, f.addedBy)) return false;
    if (!peMatchesSearch(r.reportedBy, f.reportedBy)) return false;

    /* Date inputs hold ISO "YYYY-MM-DD"; compare against the event's start date. */
    const start = peToIso(r.startDate).slice(0, 10);
    if (f.from && (!start || start < f.from)) return false;
    if (f.to && (!start || start > f.to)) return false;

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
      <td>${peEsc(peFormatDateTime(e.r.reportedTime))}</td>
      <td>${peEsc(peFormatDate(e.r.startDate))}</td>
      <td>${peEsc(peFormatDate(e.r.endDate))}</td>
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

/* ---------------- Events / Archived Events tabs ---------------- */
document.getElementById("peViewTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-tab");
  if (!btn || btn.classList.contains("active")) return;
  peViewTab = btn.dataset.view;
  document.querySelectorAll("#peViewTabs .bo-tab").forEach((b) => b.classList.toggle("active", b === btn));
  pePager.resetPage();
  pePager();
});

document.getElementById("peRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const rec = peEvents.find((r) => r.id === Number(box.dataset.id));
  if (rec) rec[box.dataset.field] = box.checked;
});

/* ---------------- Row action dropdown (edit / archive) ---------------- */
const peRowMenu = document.getElementById("peRowMenu");
const peRowMenuEditBtn = document.getElementById("peRowMenuEditBtn");
const peRowMenuArchiveBtn = document.getElementById("peRowMenuArchiveBtn");
let activePeRowId = null;

document.getElementById("peRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activePeRowId = Number(trigger.dataset.id);

  const rec = peEvents.find((r) => r.id === activePeRowId);
  const isArchived = !!rec?.archived;

  peRowMenuEditBtn.hidden = isArchived;
  if (rec) {
    peRowMenuArchiveBtn.textContent = isArchived ? "Unarchive Event" : "Archive Event";
    peRowMenuArchiveBtn.dataset.action = isArchived ? "unarchive" : "archive";
    peRowMenuArchiveBtn.classList.toggle("danger", !isArchived);
  }

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
  } else if (item.dataset.action === "archive") {
    if (!confirm(`Archive this event for "${rec.username}"? It will move to the Archived Events tab.`)) return;
    rec.archived = true;
    pePager();
  } else if (item.dataset.action === "unarchive") {
    rec.archived = false;
    pePager();
  }
});

document.getElementById("peApplyBtn").addEventListener("click", () => {
  peReadFilters();
  pePager.resetPage();
  pePager();
});

/* Back to the defaults: every clinical site, no event type / approved pick,
   empty searches and dates. */
document.getElementById("peClearFiltersBtn").addEventListener("click", () => {
  peSiteMultiSelect.setSelected(PE_DEFAULT_FILTERS.sites);
  peEventTypeMultiSelect.setSelected([]);
  setBoSelectValue(peApprovedSelect, "", { silent: true });

  document.getElementById("pePatientFilter").value = "";
  document.getElementById("peAddedByFilter").value = "";
  document.getElementById("peReportedByFilter").value = "";

  const fromDateEl = document.getElementById("peFromDate");
  const toDateEl = document.getElementById("peToDate");
  fromDateEl.value = "";
  fromDateEl.type = "text";
  toDateEl.value = "";
  toDateEl.type = "text";

  peFilters = { ...PE_DEFAULT_FILTERS };
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

function peDateToIso(value) {
  return value ? value.split("/").reverse().join("-") : "";
}

function peDateToDisplay(value) {
  return value ? value.split("-").reverse().join("/") : "";
}

function peCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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
    const [reportedDate, reportedTime] = (record.reportedTime || "").split(" ");
    peEventForm.reportedDate.value = peDateToIso(reportedDate) || todayIso();
    peEventForm.reportedTime.value = (reportedTime || "").slice(0, 5);
    peEventForm.startDate.value = peDateToIso(record.startDate);
    peEventForm.endDate.value = peDateToIso(record.endDate);
  } else {
    peEventForm.reportedDate.value = todayIso();
    peEventForm.reportedTime.value = peCurrentTime();
    peEventForm.startDate.value = todayIso();
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

  const dateStr = peDateToDisplay(peEventForm.reportedDate.value);
  const timeStr = peEventForm.reportedTime.value ? `${peEventForm.reportedTime.value}:00` : "";
  const startDate = peDateToDisplay(peEventForm.startDate.value);
  const endDate = peDateToDisplay(peEventForm.endDate.value);

  const record = {
    username: peEventForm.username.value.trim(),
    /* The drawer has no event-type field, so a new event is filed as "Other". */
    eventType: editingEventId === null ? "Other" : peEvents.find((r) => r.id === editingEventId).eventType,
    influenceCompliance: influenceSelect.querySelector("input[type=hidden]").value === "Yes",
    description: peEventForm.description.value.trim(),
    addedBy: peEventForm.username.value.trim(),
    reportedBy: peEventForm.reportedBy.value.trim(),
    reportedVia: reportedViaSelect.querySelector("input[type=hidden]").value,
    reportedTime: `${dateStr} ${timeStr}`,
    reportedAt: peToIso(`${dateStr} ${timeStr}`),
    startDate,
    endDate,
    approved: editingEventId === null ? false : peEvents.find((r) => r.id === editingEventId).approved,
    status: editingEventId === null ? "New" : peEvents.find((r) => r.id === editingEventId).status,
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

document.getElementById("peCancelMessageDrawer").addEventListener("click", closeMessageDrawer);
document.getElementById("peCloseMessageDrawerX").addEventListener("click", closeMessageDrawer);

/* ---------------- Commercial / Non Commercial toggle ----------------
   On = Commercial, off = Non Commercial -- the label swaps with the
   switch instead of staying fixed on one word regardless of state. */
const peHmoToggle = document.getElementById("peHmoToggle");
const peHmoToggleLabel = document.getElementById("peHmoToggleLabel");
function syncHmoToggleLabel() {
  peHmoToggleLabel.textContent = peHmoToggle.checked ? "Commercial" : "Non Commercial";
}
peHmoToggle.addEventListener("change", syncHmoToggleLabel);
syncHmoToggleLabel();
peMessageDrawerOverlay.addEventListener("click", (e) => { if (e.target === peMessageDrawerOverlay) closeMessageDrawer(); });

/* ---------------- Deep link: ?eventTypes=<Type>,<Type>,...&approved=true|false&patient=<username> ----------------
   The Summary dashboard's "Patient Event (Recent Error Event) > View" link
   lands here with the error event types and approved=true. The values are
   shown in the filter controls ("10 selected", "Approved") and applied, so
   Clear filters takes the page back to its defaults as usual. Unknown event
   type names are ignored. */
(function applyIncomingEventFilters() {
  const params = new URLSearchParams(location.search);
  const byName = new Map(PE_EVENT_TYPES.map((t) => [t.toLowerCase(), t]));
  const eventTypes = (params.get("eventTypes") || "")
    .split(",")
    .map((s) => byName.get(s.trim().toLowerCase()))
    .filter(Boolean);
  const approved = params.get("approved");

  if (eventTypes.length) peEventTypeMultiSelect.setSelected(eventTypes);
  if (approved === "true" || approved === "false") setBoSelectValue(peApprovedSelect, approved, { silent: true });
  /* A Summary row click also narrows to that one patient (Search patient). */
  if (params.get("patient")) document.getElementById("pePatientFilter").value = params.get("patient");
  peReadFilters();
})();
pePager();
