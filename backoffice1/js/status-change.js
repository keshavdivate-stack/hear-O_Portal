/* ---------------- Data ---------------- */
/* rows come from js/status-change-data.js (STATUS_CHANGE_ROWS, newest first, `since` as MM/DD/YYYY);
   sinceIso is added so the From/To date inputs (YYYY-MM-DD) compare correctly */
const toIsoDate = (mdy) => {
  const [month, day, year] = mdy.split("/");
  return `${year}-${month}-${day}`;
};

const statusChanges = STATUS_CHANGE_ROWS.map((s, i) => ({ ...s, id: i, sinceIso: toIsoDate(s.since) }));

/* ---------------- State ---------------- */
const SC_PAGE_SIZE = 20;
const SC_STATUS_TO_OPTIONS = ["Registered", "Baseline", "Active", "Priority"];
let scCurrentPage = 1;
let scStatusToFilter = "";
let scAccountFilter = "";
let scMonitoringFilter = "";
let scSearchTerm = "";
let scFromDate = "";
let scToDate = "";

/* ---------------- Multi-select checkbox filter (Clinical site) ---------------- */
const scCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function wireMultiSelect(containerId, values, onChange) {
  const container = document.getElementById(containerId);
  const trigger = container.querySelector(".bo-multiselect-trigger");
  const valueEl = container.querySelector(".bo-multiselect-value");
  const placeholderLabel = valueEl.textContent.trim();
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
      valueEl.textContent = placeholderLabel;
      valueEl.classList.add("placeholder");
    } else {
      valueEl.textContent = values.filter((v) => selected.has(v)).join(", ");
      valueEl.classList.remove("placeholder");
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
    if (onChange) onChange(selected);
  });

  return {
    getSelected: () => selected,
    reset() {
      selected.clear();
      values.forEach((v) => selected.add(v));
      renderMenu();
      renderTrigger();
    },
  };
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) {
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
  }
});

const scSiteCodes = [...new Set(statusChanges.map((s) => s.site))].sort();
let scSiteFilter = new Set(scSiteCodes);
const scSiteMultiSelect = wireMultiSelect("scSiteFilter", scSiteCodes, (selected) => {
  scSiteFilter = selected;
});

/* ---------------- Status Change To (single-select) ---------------- */
const scStatusToSelect = document.querySelector('.bo-select[data-name="scStatusTo"]');
document.getElementById("scStatusToMenu").innerHTML =
  `<div class="bo-select-option" data-value="">All<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>` +
  SC_STATUS_TO_OPTIONS.map(
    (s) => `<div class="bo-select-option" data-value="${s}">${s}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
  ).join("");

/* ---------------- Account / Monitoring status (single-selects) ---------------- */
const scAccountSelect = document.querySelector('.bo-select[data-name="scAccount"]');
const scMonitoringSelect = document.querySelector('.bo-select[data-name="scMonitoring"]');
const scOptionHtml = (value, label) => `<div class="bo-select-option" data-value="${value}">${label}<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
const scOptionsHtml = (values) => scOptionHtml("", "All") + values.map((v) => scOptionHtml(v, v)).join("");
document.getElementById("scAccountMenu").innerHTML = scOptionsHtml(["Enabled", "Paused", "Discontinued"]);
document.getElementById("scMonitoringMenu").innerHTML = scOptionsHtml(["Monitored", "Unmonitored", "Nearly Unmonitored"]);

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
      if (!scSiteFilter.has(s.site)) return false;
    }
    if (scStatusToFilter && s.changedTo !== scStatusToFilter) return false;
    if (scAccountFilter && s.account !== scAccountFilter) return false;
    if (scMonitoringFilter && s.monitoring !== scMonitoringFilter) return false;
    if (scSearchTerm && !s.username.toLowerCase().includes(scSearchTerm)) return false;
    if (scFromDate && s.sinceIso < scFromDate) return false;
    if (scToDate && s.sinceIso > scToDate) return false;
    return true;
  });
}

/* ---------------- Render ---------------- */
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
        <td>${s.previous ? `<span class="bo-sc-badge ${s.previous.toLowerCase()}">${s.previous}</span>` : "&mdash;"}</td>
        <td><span class="bo-sc-badge ${s.changedTo.toLowerCase()}">${s.changedTo}</span></td>
        <td><span class="bo-status-pill ${s.account.toLowerCase()}">${s.account}</span></td>
        <td><span class="bo-status-pill ${s.monitoring.toLowerCase().replace(/ /g, "-")}">${s.monitoring}</span></td>
        <td>${s.since}</td>
        <td>${s.days}</td>
        <td>${s.changedBy}</td>
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

/* ---------------- Filters (staged; applied when the Apply button is clicked) ---------------- */
document.getElementById("scSearchInput").addEventListener("input", (e) => {
  scSearchTerm = e.target.value.trim().toLowerCase();
});

document.getElementById("scFromDate").addEventListener("change", (e) => {
  scFromDate = e.target.value;
});
document.getElementById("scToDate").addEventListener("change", (e) => {
  scToDate = e.target.value;
});

document.getElementById("scStatusToFilter").addEventListener("change", (e) => {
  scStatusToFilter = e.target.value;
});
document.getElementById("scAccountFilter").addEventListener("change", (e) => {
  scAccountFilter = e.target.value;
});
document.getElementById("scMonitoringFilter").addEventListener("change", (e) => {
  scMonitoringFilter = e.target.value;
});

document.getElementById("scApplyBtn").addEventListener("click", () => {
  scCurrentPage = 1;
  renderStatusChanges();
});

document.getElementById("scClearFiltersBtn").addEventListener("click", () => {
  scSiteMultiSelect.reset();
  scSiteFilter = new Set(scSiteCodes);
  scStatusToFilter = "";
  scAccountFilter = "";
  scMonitoringFilter = "";
  scSearchTerm = "";
  scFromDate = "";
  scToDate = "";

  setBoSelectValue(scStatusToSelect, "", { silent: true });
  setBoSelectValue(scAccountSelect, "", { silent: true });
  setBoSelectValue(scMonitoringSelect, "", { silent: true });
  document.getElementById("scSearchInput").value = "";
  const fromDateEl = document.getElementById("scFromDate");
  const toDateEl = document.getElementById("scToDate");
  fromDateEl.value = "";
  fromDateEl.type = "text";
  toDateEl.value = "";
  toDateEl.type = "text";

  scCurrentPage = 1;
  renderStatusChanges();
});

/* ---------------- Deep link: ?statusChange=<Status>&patient=<username> ----------------
   A Summary dashboard row opens this page narrowed to that patient and the
   status they changed to; both show in the filter controls, and Clear
   filters goes back to the defaults as usual. */
(function applyIncomingStatusChangeFilters() {
  const params = new URLSearchParams(location.search);
  const status = params.get("statusChange");
  const patient = (params.get("patient") || "").trim();
  if (status && scStatusToSelect.querySelector(`.bo-select-option[data-value="${CSS.escape(status)}"]`)) {
    setBoSelectValue(scStatusToSelect, status, { silent: true });
    scStatusToFilter = status;
  }
  if (patient) {
    document.getElementById("scSearchInput").value = patient;
    scSearchTerm = patient.toLowerCase();
  }
  if (status || patient) renderStatusChanges();
})();

/* ---------------- Pagination ---------------- */
document.getElementById("scFirstPage").addEventListener("click", () => { scCurrentPage = 1; renderStatusChanges(); });
document.getElementById("scPrevPage").addEventListener("click", () => { scCurrentPage -= 1; renderStatusChanges(); });
document.getElementById("scNextPage").addEventListener("click", () => { scCurrentPage += 1; renderStatusChanges(); });
document.getElementById("scLastPage").addEventListener("click", () => {
  scCurrentPage = Math.ceil(scFilteredRows().length / SC_PAGE_SIZE);
  renderStatusChanges();
});
