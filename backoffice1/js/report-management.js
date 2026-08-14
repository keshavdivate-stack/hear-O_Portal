/* ---------------- Report Management ---------------- */
let rmTypeFilter = "";
let rmHmoFilter = "";
let rmTagFilter = "";
let rmUserFilter = "";
const rmExpanded = new Set();

function rmFilteredSchedules(reportType) {
  return rmSchedules.filter((s) => {
    if (s.reportType !== reportType) return false;
    if (rmTypeFilter && s.reportType !== rmTypeFilter) return false;
    if (rmHmoFilter && s.hmo !== rmHmoFilter) return false;
    if (rmTagFilter && !s.tag.includes(rmTagFilter)) return false;
    if (rmUserFilter && !s.user.toLowerCase().includes(rmUserFilter.toLowerCase())) return false;
    return true;
  });
}

const rmEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const rmTrashIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 7V4.5C9 4 9.4 3.6 9.9 3.6H14.1C14.6 3.6 15 4 15 4.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 7L6.8 19.2C6.9 19.9 7.5 20.4 8.2 20.4H15.8C16.5 20.4 17.1 19.9 17.2 19.2L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function rmRenderGroupRow(t) {
  const rows = rmFilteredSchedules(t.key);
  const hasRows = rows.length > 0;
  const isOpen = hasRows && rmExpanded.has(t.key);

  const bandRow = `
    <tr class="bo-report-band${hasRows ? "" : " disabled"}" data-type="${t.key}">
      <td class="bo-report-band-title" colspan="8">${t.label}</td>
      <td>
        ${
          hasRows
            ? `<button type="button" class="bo-report-expand${isOpen ? " open" : ""}" aria-label="${isOpen ? "Collapse" : "Expand"} ${t.label}" aria-expanded="${isOpen}">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>`
            : ""
        }
      </td>
    </tr>`;

  const subRows = isOpen
    ? rows
        .map(
          (r) => `
    <tr class="bo-report-row">
      <td>${t.label}</td>
      <td>${r.name}</td>
      <td>${r.hmo}</td>
      <td>${r.tag}</td>
      <td>${r.user}</td>
      <td>${r.scheduleType}</td>
      <td>${r.daysOfWeek}</td>
      <td>${r.reportTime}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon blue" data-id="${r.id}" data-act="edit" aria-label="Edit">${rmEditIcon}</button>
          <button class="bo-action-icon blue" data-id="${r.id}" data-act="delete" aria-label="Delete">${rmTrashIcon}</button>
        </div>
      </td>
    </tr>`
        )
        .join("")
    : "";

  return bandRow + subRows;
}

const rmGroupsPager = boCreatePager(
  "rmGroups",
  () => RM_REPORT_TYPES,
  rmRenderGroupRow,
  { pageSize: 20, emptyColspan: 9, emptyText: "No report types configured." }
);
rmGroupsPager();

document.getElementById("rmGroups").addEventListener("click", (e) => {
  const band = e.target.closest(".bo-report-band:not(.disabled)");
  if (band) {
    const key = band.dataset.type;
    if (rmExpanded.has(key)) rmExpanded.delete(key);
    else rmExpanded.add(key);
    rmGroupsPager();
    return;
  }

  const btn = e.target.closest(".bo-action-icon");
  if (!btn) return;
  const rec = rmSchedules.find((s) => s.id === Number(btn.dataset.id));
  if (!rec) return;

  if (btn.dataset.act === "edit") {
    openCreateDrawer(rec);
  } else if (btn.dataset.act === "delete") {
    if (!confirm(`Delete "${rec.name}"?`)) return;
    rmSchedules.splice(rmSchedules.indexOf(rec), 1);
    rmGroupsPager();
  }
});

document.getElementById("rmApplyBtn").addEventListener("click", () => {
  rmTypeFilter = document.getElementById("rmTypeFilter").value;
  rmHmoFilter = document.getElementById("rmHmoFilter").value;
  rmTagFilter = document.getElementById("rmTagFilter").value;
  rmUserFilter = document.getElementById("rmUserFilter").value;
  rmGroupsPager();
});

document.getElementById("rmDownloadBtn").addEventListener("click", () => {
  alert("Downloading report list...");
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

function rmOptionsHtml(values) {
  return values
    .map(
      (v) => `<div class="bo-select-option" data-value="${v}">${v}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    )
    .join("");
}

const rmTypeOptionsHtml = RM_REPORT_TYPES.map(
  (t) => `<div class="bo-select-option" data-value="${t.key}">${t.label}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
).join("");

function rmClearOptionHtml(placeholder) {
  return `<div class="bo-select-option" data-value="">${placeholder}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
}

document.getElementById("rmTypeFilterMenu").innerHTML = rmClearOptionHtml("All report types") + rmTypeOptionsHtml;
document.getElementById("rmHmoFilterMenu").innerHTML = rmClearOptionHtml("All HMOs") + rmOptionsHtml(RM_HMOS);
document.getElementById("rmTagFilterMenu").innerHTML = rmClearOptionHtml("All tags") + rmOptionsHtml(RM_TAGS);

document.getElementById("rmCreateTypeMenu").innerHTML = rmTypeOptionsHtml;
document.getElementById("rmCreateHmoMenu").innerHTML = rmOptionsHtml(RM_HMOS);
document.getElementById("rmCreateTagMenu").innerHTML = rmOptionsHtml(RM_TAGS);
document.getElementById("rmCreateUserMenu").innerHTML = rmOptionsHtml(RM_USERS);
document.getElementById("rmManualTypeMenu").innerHTML = rmTypeOptionsHtml;
document.getElementById("rmManualHmoMenu").innerHTML = rmOptionsHtml(RM_HMOS);
document.getElementById("rmManualTagMenu").innerHTML = rmOptionsHtml(RM_TAGS);

/* ---------------- Create New Report drawer (also used for editing an existing schedule) ---------------- */
const rmCreateOverlay = document.getElementById("rmCreateDrawerOverlay");
const rmCreateForm = document.getElementById("rmCreateForm");
const rmSaveCreateBtn = document.getElementById("rmSaveCreateBtn");
const rmCreateTypeSelect = rmCreateForm.querySelector('.bo-select[data-name="reportType"]');
const rmCreateHmoSelect = rmCreateForm.querySelector('.bo-select[data-name="hmo"]');
const rmCreateTagSelect = rmCreateForm.querySelector('.bo-select[data-name="tag"]');
const rmCreateUserSelect = rmCreateForm.querySelector('.bo-select[data-name="user"]');
const rmCreateScheduleSelect = rmCreateForm.querySelector('.bo-select[data-name="scheduleType"]');
let editingScheduleId = null;

function validateCreateForm() {
  const typeOk = rmCreateTypeSelect.querySelector("input[type=hidden]").value !== "";
  rmSaveCreateBtn.disabled = !(rmCreateForm.name.value.trim() !== "" && typeOk);
}

function openCreateDrawer(record) {
  rmCreateForm.reset();
  editingScheduleId = record ? record.id : null;
  document.querySelector("#rmCreateDrawerOverlay .bo-drawer-head h2").textContent = record ? "Edit Report" : "Create New Report";

  setBoSelectValue(rmCreateTypeSelect, record ? record.reportType : "", { silent: true });
  setBoSelectValue(rmCreateHmoSelect, record ? record.hmo : "", { silent: true });
  setBoSelectValue(rmCreateTagSelect, record ? (record.tag || "").split(";")[0].trim() : "", { silent: true });
  setBoSelectValue(rmCreateUserSelect, record ? record.user : "", { silent: true });
  setBoSelectValue(rmCreateScheduleSelect, record ? record.scheduleType : "", { silent: true });

  if (record) {
    rmCreateForm.name.value = record.name;
    const [hh, mm] = record.reportTime.replace("(GMT)", "").split(":");
    rmCreateForm.hh.value = hh || "0";
    rmCreateForm.mm.value = mm || "0";
  }

  validateCreateForm();
  rmCreateOverlay.classList.add("open");
}

function closeCreateDrawer() {
  rmCreateOverlay.classList.remove("open");
}

rmCreateForm.addEventListener("input", validateCreateForm);
rmCreateForm.addEventListener("change", validateCreateForm);

rmCreateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rmSaveCreateBtn.disabled) return;

  const typeKey = rmCreateTypeSelect.querySelector("input[type=hidden]").value;
  const hh = String(rmCreateForm.hh.value || "0").padStart(2, "0");
  const mm = String(rmCreateForm.mm.value || "0").padStart(2, "0");

  const record = {
    reportType: typeKey,
    name: rmCreateForm.name.value.trim(),
    hmo: rmCreateHmoSelect.querySelector("input[type=hidden]").value,
    tag: rmCreateTagSelect.querySelector("input[type=hidden]").value,
    user: rmCreateUserSelect.querySelector("input[type=hidden]").value,
    scheduleType: rmCreateScheduleSelect.querySelector("input[type=hidden]").value || "DAILY",
    daysOfWeek: "all days",
    reportTime: `${hh}:${mm}(GMT)`,
  };

  if (editingScheduleId === null) {
    rmSchedules.unshift({ ...record, id: rmSchedules.length ? Math.max(...rmSchedules.map((s) => s.id)) + 1 : 0 });
  } else {
    const existing = rmSchedules.find((s) => s.id === editingScheduleId);
    if (existing) Object.assign(existing, record);
  }

  rmExpanded.add(typeKey);
  closeCreateDrawer();
  rmGroupsPager();
});

document.getElementById("rmCreateBtn").addEventListener("click", () => openCreateDrawer(null));
document.getElementById("rmCancelCreate").addEventListener("click", closeCreateDrawer);
document.getElementById("rmCloseCreateX").addEventListener("click", closeCreateDrawer);
rmCreateOverlay.addEventListener("click", (e) => { if (e.target === rmCreateOverlay) closeCreateDrawer(); });

/* ---------------- Manual Report drawer (sends immediately, no schedule is created) ---------------- */
const rmManualOverlay = document.getElementById("rmManualDrawerOverlay");
const rmManualForm = document.getElementById("rmManualForm");
const rmSendManualBtn = document.getElementById("rmSendManualBtn");
const rmManualTypeSelect = rmManualForm.querySelector('.bo-select[data-name="reportType"]');

function validateManualForm() {
  const typeOk = rmManualTypeSelect.querySelector("input[type=hidden]").value !== "";
  rmSendManualBtn.disabled = !(typeOk && rmManualForm.email.value.trim() !== "");
}

function openManualDrawer() {
  rmManualForm.reset();
  rmManualForm.querySelectorAll(".bo-select").forEach((s) => setBoSelectValue(s, "", { silent: true }));
  validateManualForm();
  rmManualOverlay.classList.add("open");
}

function closeManualDrawer() {
  rmManualOverlay.classList.remove("open");
}

rmManualForm.addEventListener("input", validateManualForm);
rmManualForm.addEventListener("change", validateManualForm);

rmManualForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (rmSendManualBtn.disabled) return;
  closeManualDrawer();
  alert("Report sent.");
});

document.getElementById("rmManualBtn").addEventListener("click", openManualDrawer);
document.getElementById("rmCancelManual").addEventListener("click", closeManualDrawer);
document.getElementById("rmCloseManualX").addEventListener("click", closeManualDrawer);
rmManualOverlay.addEventListener("click", (e) => { if (e.target === rmManualOverlay) closeManualDrawer(); });
