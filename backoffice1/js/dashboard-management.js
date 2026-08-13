/* ---------------- Settings > Dashboard Management ---------------- */
const dashboards = [
  { name: "Open Study", hmo: ["BRZ", "BSM", "BSV", "BYM", "HYA", "NHR", "240", "241", "242", "244", "BLN"], tags: ["NEW", "CURRENT"], type: "STUDY DASHBOARD" },
  { name: "ATP & MKT", hmo: ["ATP", "MKT"], tags: ["CURRENT", "NEW"], type: "CLINIC SUMMARY DASHBOARD" },
  { name: "R&D USA", hmo: ["241", "240", "242", "243", "244"], tags: ["CURRENT", "NEW"], type: "STUDY DASHBOARD" },
  { name: "R&D IL", hmo: ["122", "120", "121"], tags: ["CURRENT"], type: "STUDY DASHBOARD" },
  { name: "Zaza", hmo: ["B01"], tags: ["CURRENT"], type: "CLINIC SUMMARY DASHBOARD" },
  { name: "automation", hmo: ["ZTS", "TSS"], tags: ["NEW", "CURRENT"], type: "STUDY DASHBOARD" },
  { name: "automation_TSS", hmo: ["TSS"], tags: ["NEW", "CURRENT"], type: "STUDY DASHBOARD" },
  { name: "automation_ZTS", hmo: ["ZTS"], tags: ["NEW", "CURRENT"], type: "STUDY DASHBOARD" },
  { name: "122", hmo: ["122"], tags: ["NEW", "CURRENT"], type: "CLINIC SUMMARY DASHBOARD" },
  { name: "B01", hmo: ["B01"], tags: ["CURRENT", "NEW"], type: "CLINIC SUMMARY DASHBOARD" },
  { name: "Test Dashboard MKT Study", hmo: ["MKT", "IGO", "TS1", "TSS", "TST"], tags: ["CURRENT", "NEW"], type: "STUDY DASHBOARD" },
];

dashboards.forEach((d, i) => (d.id = i));

const dashEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const dashTrashIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 7H20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M9 7V4.5C9 4 9.4 3.6 9.9 3.6H14.1C14.6 3.6 15 4 15 4.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 7L6.8 19.2C6.9 19.9 7.5 20.4 8.2 20.4H15.8C16.5 20.4 17.1 19.9 17.2 19.2L18 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function dashEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

/* ---------------- Table rendering ---------------- */
const dashboardPager = boCreatePager(
  "dashboardRows",
  () => dashboards,
  (d) => `
    <tr>
      <td>${dashEsc(d.name)}</td>
      <td>${dashEsc(d.hmo.join(", "))}</td>
      <td>${dashEsc(d.tags.join(", "))}</td>
      <td>${dashEsc(d.type)}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon" data-id="${d.id}" data-act="edit" aria-label="Edit">${dashEditIcon}</button>
          <button class="bo-action-icon" data-id="${d.id}" data-act="delete" aria-label="Delete">${dashTrashIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: 20, emptyColspan: 5, emptyText: "No dashboards yet." }
);
dashboardPager();

document.getElementById("dashboardRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-action-icon");
  if (!btn) return;
  const dashboard = dashboards.find((d) => d.id === Number(btn.dataset.id));
  if (!dashboard) return;
  if (btn.dataset.act === "edit") openDashboardModal(dashboard);
  if (btn.dataset.act === "delete") {
    if (!confirm(`Delete "${dashboard.name}"?`)) return;
    dashboards.splice(dashboards.indexOf(dashboard), 1);
    dashboardPager();
  }
});

/* ---------------- Single select (Type) ---------------- */
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

function positionFloatingMenu(trigger, menu) {
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

function closeAllFloatingMenus() {
  document.querySelectorAll(".bo-select.open, .bo-msel.open").forEach((s) => s.classList.remove("open"));
}

document.querySelectorAll(".bo-select").forEach((select) => {
  const trigger = select.querySelector(".bo-select-trigger");
  const valueEl = select.querySelector(".bo-select-value");
  valueEl.dataset.placeholder = valueEl.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    closeAllFloatingMenus();
    if (willOpen) {
      select.classList.add("open");
      positionFloatingMenu(trigger, select.querySelector(".bo-select-menu"));
    }
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-select-option");
    if (!option) return;
    setBoSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
});

/* ---------------- Multi-select (HMO / Tag) ---------------- */
function mselValues(msel) {
  return Array.from(msel.querySelectorAll(".bo-msel-option.checked")).map((o) => o.dataset.value);
}

function setMselValues(msel, values, placeholder) {
  msel.querySelectorAll(".bo-msel-option").forEach((o) => o.classList.toggle("checked", values.includes(o.dataset.value)));
  const trigger = msel.querySelector(".bo-msel-value");
  if (values.length) {
    trigger.textContent = values.join(", ");
    trigger.classList.add("has-value");
  } else {
    trigger.textContent = placeholder;
    trigger.classList.remove("has-value");
  }
}

document.querySelectorAll(".bo-msel").forEach((msel) => {
  const trigger = msel.querySelector(".bo-msel-trigger");
  const valueEl = msel.querySelector(".bo-msel-value");
  valueEl.dataset.placeholder = valueEl.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !msel.classList.contains("open");
    closeAllFloatingMenus();
    if (willOpen) {
      msel.classList.add("open");
      positionFloatingMenu(trigger, msel.querySelector(".bo-msel-menu"));
    }
  });

  msel.addEventListener("click", (e) => {
    const option = e.target.closest(".bo-msel-option");
    if (!option) return;
    option.classList.toggle("checked");
    setMselValues(msel, mselValues(msel), valueEl.dataset.placeholder);
    validateDashboardForm();
  });
});

document.addEventListener("click", closeAllFloatingMenus);
document.addEventListener("scroll", closeAllFloatingMenus, true);
window.addEventListener("resize", closeAllFloatingMenus);

/* ---------------- Add / Edit Dashboard modal ---------------- */
const dashboardModalOverlay = document.getElementById("dashboardModalOverlay");
const dashboardForm = document.getElementById("dashboardForm");
const dashboardModalTitle = document.getElementById("dashboardModalTitle");
const saveDashboardBtn = document.getElementById("saveDashboardBtn");
const tagError = document.getElementById("tagError");
const hmoMsel = dashboardForm.querySelector('.bo-msel[data-name="hmo"]');
const tagMsel = dashboardForm.querySelector('.bo-msel[data-name="tag"]');
const typeSelect = dashboardForm.querySelector('.bo-select[data-name="type"]');
let editingDashboardId = null;

function validateDashboardForm() {
  const tagsOk = mselValues(tagMsel).length > 0;
  tagError.hidden = tagsOk;
  const nameOk = dashboardForm.name.value.trim() !== "";
  const typeOk = typeSelect.querySelector("input[type=hidden]").value !== "";
  saveDashboardBtn.disabled = !(nameOk && tagsOk && typeOk);
}

function openDashboardModal(dashboard) {
  dashboardForm.reset();
  editingDashboardId = dashboard ? dashboard.id : null;
  dashboardModalTitle.textContent = editingDashboardId === null ? "Add Dashboard" : "Edit Dashboard";

  setMselValues(hmoMsel, dashboard ? dashboard.hmo : [], hmoMsel.querySelector(".bo-msel-value").dataset.placeholder);
  setMselValues(tagMsel, dashboard ? dashboard.tags : [], tagMsel.querySelector(".bo-msel-value").dataset.placeholder);
  setBoSelectValue(typeSelect, dashboard ? dashboard.type : "", { silent: true });
  tagError.hidden = true;

  if (dashboard) dashboardForm.name.value = dashboard.name;

  validateDashboardForm();
  dashboardModalOverlay.classList.add("open");
}

function closeDashboardModal() {
  dashboardModalOverlay.classList.remove("open");
}

dashboardForm.addEventListener("input", validateDashboardForm);
dashboardForm.addEventListener("change", validateDashboardForm);

dashboardForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (saveDashboardBtn.disabled) return;

  const record = {
    name: dashboardForm.name.value.trim(),
    hmo: mselValues(hmoMsel),
    tags: mselValues(tagMsel),
    type: typeSelect.querySelector("input[type=hidden]").value,
  };

  if (editingDashboardId === null) {
    dashboards.push({ ...record, id: dashboards.length ? Math.max(...dashboards.map((d) => d.id)) + 1 : 0 });
  } else {
    const existing = dashboards.find((d) => d.id === editingDashboardId);
    if (existing) Object.assign(existing, record);
  }

  closeDashboardModal();
  dashboardPager();
});

document.getElementById("openAddDashboardBtn").addEventListener("click", () => openDashboardModal(null));
document.getElementById("cancelDashboardModal").addEventListener("click", closeDashboardModal);
dashboardModalOverlay.addEventListener("click", (e) => { if (e.target === dashboardModalOverlay) closeDashboardModal(); });
