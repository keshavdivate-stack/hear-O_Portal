/* ---------------- Data ---------------- */
/* start dates stored ISO (YYYY-MM-DD) so From/To date filters compare correctly */
const statusChanges = [
  { username: "ABC-1252", type: "Status", prev: "Active", next: "Priority", start: "2026-07-04", days: 3, by: "System" },
  { username: "ABC-1254", type: "Monitoring", prev: "Monitored", next: "Unmonitored", start: "2026-06-30", days: 7, by: "ayelet_clinic" },
  { username: "ABC-1254", type: "Account", prev: "Enabled", next: "Paused", start: "2026-06-30", days: 7, by: "ayelet_clinic" },
  { username: "ABC-1238", type: "Monitoring", prev: "Monitored", next: "Unmonitored", start: "2026-06-25", days: 6, by: "System" },
  { username: "ABC-1242", type: "Status", prev: "Registered", next: "Baseline", start: "2026-06-24", days: 2, by: "System" },
  { username: "ABC-1283", type: "Account", prev: "Enabled", next: "Discontinued", start: "2026-06-24", days: 13, by: "ayelet_clinic" },
  { username: "ABC-1283", type: "Status", prev: "Priority", next: "Active", start: "2026-06-23", days: 2, by: "System" },
];

const formatDate = (iso) => iso.split("-").reverse().join("/");

statusChanges.forEach((s, i) => (s.id = i));

/* ---------------- State ---------------- */
const SC_PAGE_SIZE = 20;
const SC_STATUS_TO_OPTIONS = ["Registered", "Active", "Priority", "Baseline"];
let scCurrentPage = 1;
let scStatusToFilter = "";
let scSearchTerm = "";
let scFromDate = "";
let scToDate = "";

/* ---------------- Multi-select checkbox filter (Clinical site) ---------------- */
const scCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

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
        <span class="bo-multiselect-checkbox">${scCheckIcon}</span> All
      </label>` +
      values
        .map(
          (v) => `<label class="bo-multiselect-option${selected.has(v) ? " checked" : ""}" data-value="${v}">
            <span class="bo-multiselect-checkbox">${scCheckIcon}</span> ${v}
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

const scSiteCodes = [...new Set(statusChanges.map((s) => s.username.split("-")[0]))];
const scSiteMultiSelect = wireMultiSelect("scSiteFilter", scSiteCodes);
let scSiteFilter = new Set(scSiteCodes);

/* ---------------- Status Change To (single-select) ---------------- */
const scStatusToSelect = document.querySelector('.bo-select[data-name="scStatusTo"]');
document.getElementById("scStatusToMenu").innerHTML =
  `<div class="bo-select-option" data-value="">All<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` +
  SC_STATUS_TO_OPTIONS.map(
    (s) => `<div class="bo-select-option" data-value="${s}">${s}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
  ).join("");

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

function scFilteredRows() {
  return statusChanges.filter((s) => {
    if (scSiteFilter.size && scSiteFilter.size < scSiteCodes.length) {
      if (![...scSiteFilter].some((c) => s.username.startsWith(c))) return false;
    }
    if (scStatusToFilter && s.next !== scStatusToFilter) return false;
    if (scSearchTerm && !s.username.toLowerCase().includes(scSearchTerm)) return false;
    if (scFromDate && s.start < scFromDate) return false;
    if (scToDate && s.start > scToDate) return false;
    return true;
  });
}

/* ---------------- Render ---------------- */
function scStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-").replace("insufficient-data", "insufficient");
}

function scCell(type, value) {
  if (!value) return "";
  return type === "Status"
    ? `<span class="bo-sc-badge ${scStatusClass(value)}">${value}</span>`
    : value;
}

function renderStatusChanges() {
  const list = scFilteredRows();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / SC_PAGE_SIZE));
  scCurrentPage = Math.min(scCurrentPage, totalPages);

  const start = (scCurrentPage - 1) * SC_PAGE_SIZE;
  const pageItems = list.slice(start, start + SC_PAGE_SIZE);

  document.getElementById("statusChangeRows").innerHTML = pageItems
    .map(
      (s) => `
      <tr>
        <td><span class="bo-name-link">${s.username}</span></td>
        <td>${s.type}</td>
        <td>${scCell(s.type, s.prev)}</td>
        <td>${scCell(s.type, s.next)}</td>
        <td>${formatDate(s.start)}</td>
        <td>${s.days}</td>
        <td>${s.by}</td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + SC_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("scPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("scFirstPage").disabled = scCurrentPage === 1;
  document.getElementById("scPrevPage").disabled = scCurrentPage === 1;
  document.getElementById("scNextPage").disabled = scCurrentPage === totalPages;
  document.getElementById("scLastPage").disabled = scCurrentPage === totalPages;
}

renderStatusChanges();

/* ---------------- Filters ---------------- */
document.getElementById("scSearchInput").addEventListener("input", (e) => {
  scSearchTerm = e.target.value.trim().toLowerCase();
});

document.getElementById("scFromDate").addEventListener("change", (e) => { scFromDate = e.target.value; });
document.getElementById("scToDate").addEventListener("change", (e) => { scToDate = e.target.value; });

document.getElementById("scApplyBtn").addEventListener("click", () => {
  scSiteFilter = scSiteMultiSelect.getSelected();
  scStatusToFilter = scStatusToSelect.querySelector("input[type=hidden]").value;
  scCurrentPage = 1;
  renderStatusChanges();
});

/* ---------------- Pagination ---------------- */
document.getElementById("scFirstPage").addEventListener("click", () => { scCurrentPage = 1; renderStatusChanges(); });
document.getElementById("scPrevPage").addEventListener("click", () => { scCurrentPage -= 1; renderStatusChanges(); });
document.getElementById("scNextPage").addEventListener("click", () => { scCurrentPage += 1; renderStatusChanges(); });
document.getElementById("scLastPage").addEventListener("click", () => {
  scCurrentPage = Math.ceil(scFilteredRows().length / SC_PAGE_SIZE);
  renderStatusChanges();
});
