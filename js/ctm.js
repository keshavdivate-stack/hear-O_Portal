/* ---------------- Care Team Member roster (one row per member, counts of
   their patients across status/account/monitoring) ---------------- */
function memberInitials(name) {
  const clean = name.replace(/^Dr\.\s*/, "").replace(/,\s*(RN|NP)$/, "");
  const parts = clean.trim().split(/\s+/);
  return ((parts[0] || "")[0] + (parts[parts.length - 1] || "")[0]).toUpperCase();
}

let ctmSearchTerm = "";
const ctmSelectedMembers = new Set();

function filteredCtmMembers() {
  const q = ctmSearchTerm.toLowerCase();
  return ctmRoster.filter((m) => {
    if (ctmSelectedMembers.size && !ctmSelectedMembers.has(m.name)) return false;
    if (!q) return true;
    if (m.name.toLowerCase().includes(q)) return true;
    return ctmPatients.some((p) => p.teamMember === m.name && p.name.toLowerCase().includes(q));
  });
}

function renderCtmMembers() {
  const list = filteredCtmMembers();
  document.getElementById("ctmMemberRows").innerHTML = list
    .map((m) => {
      const patients = ctmPatients.filter((p) => p.teamMember === m.name);
      const count = (pred) => patients.filter(pred).length;
      return `
      <tr class="ctm-row" data-member="${encodeURIComponent(m.name)}">
        <td>
          <div class="ctm-card-top">
            <span class="ctm-card-avatar">${memberInitials(m.name)}</span>
            <div>
              <div class="ctm-card-name">${m.name}</div>
              <div class="ctm-card-role">${m.role}</div>
            </div>
          </div>
        </td>
        <td class="ctm-count-col"><strong>${patients.length}</strong></td>
        <td class="ctm-count-col">${count((p) => p.status === "priority")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "active")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "registered")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "baseline")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Enabled")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Paused")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Discontinued")}</td>
        <td class="ctm-count-col">${count((p) => p.monitoring === "monitored")}</td>
        <td class="ctm-count-col">${count((p) => p.monitoring === "unmonitored")}</td>
      </tr>`;
    })
    .join("");

  const total = list.length;
  document.getElementById("ctmPageRangeLabel").textContent = total ? `1 – ${total} of ${total}` : "0 of 0";
}

renderCtmMembers();

/* ---------------- Row click -> Patient List filtered to this member ----------------
   Delegated on the tbody (not per-row) so it keeps working after every
   renderCtmMembers() re-render replaces the rows' innerHTML. */
document.getElementById("ctmMemberRows").addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-member]");
  if (!row) return;
  location.href = `patient-list.html?careTeam=${row.dataset.member}`;
});

/* ---------------- Search ---------------- */
document.getElementById("ctmSearchInput").addEventListener("input", (e) => {
  ctmSearchTerm = e.target.value.trim();
  renderCtmMembers();
});

/* ---------------- Care Team Member filter (portaled checkbox menu, mirrors patient-list.js) ---------------- */
const ctmTeamMemberMenu = document.getElementById("ctmTeamMemberMenu");
ctmTeamMemberMenu.innerHTML = ctmRoster
  .map((m) => `<label class="checkbox-filter-option"><input type="checkbox" value="${m.name}" />${m.name}</label>`)
  .join("");

const ctmPortaledMenus = new Map();

function positionCtmFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function openCtmFilterMenu(wrapEl, menuEl) {
  if (!ctmPortaledMenus.has(menuEl)) {
    ctmPortaledMenus.set(menuEl, { parent: menuEl.parentNode, next: menuEl.nextSibling });
  }
  document.body.appendChild(menuEl);
  menuEl.classList.add("checkbox-filter-menu-portaled");
  positionCtmFilterMenu(wrapEl.querySelector(".filter-btn"), menuEl);
}

function closeCtmFilterMenu(menuEl) {
  const original = ctmPortaledMenus.get(menuEl);
  if (original && menuEl.parentNode === document.body) {
    if (original.next && original.next.parentNode === original.parent) {
      original.parent.insertBefore(menuEl, original.next);
    } else {
      original.parent.appendChild(menuEl);
    }
  }
  menuEl.classList.remove("checkbox-filter-menu-portaled");
  menuEl.style.position = "";
  menuEl.style.left = "";
  menuEl.style.top = "";
  menuEl.style.bottom = "";
  menuEl.style.minWidth = "";
}

function closeAllCtmFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeCtmFilterMenu(menuEl));
}

document.addEventListener("click", closeAllCtmFilterPopovers);

const ctmTeamMemberWrap = document.querySelector('.checkbox-filter[data-name="ctmTeamMember"]');
const ctmTeamMemberTrigger = ctmTeamMemberWrap.querySelector(".filter-btn");
const ctmTeamMemberLabel = ctmTeamMemberWrap.querySelector(".checkbox-filter-label");
const ctmTeamMemberBaseLabel = ctmTeamMemberLabel.textContent.trim();

ctmTeamMemberTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !ctmTeamMemberWrap.classList.contains("open");
  closeAllCtmFilterPopovers();
  ctmTeamMemberWrap.classList.toggle("open", willOpen);
  if (willOpen) openCtmFilterMenu(ctmTeamMemberWrap, ctmTeamMemberMenu);
});

ctmTeamMemberMenu.addEventListener("click", (e) => e.stopPropagation());

ctmTeamMemberMenu.addEventListener("change", (e) => {
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  if (checkbox.checked) ctmSelectedMembers.add(checkbox.value);
  else ctmSelectedMembers.delete(checkbox.value);
  ctmTeamMemberLabel.textContent = ctmSelectedMembers.size ? `${ctmTeamMemberBaseLabel} (${ctmSelectedMembers.size})` : ctmTeamMemberBaseLabel;
  renderCtmMembers();
});

document.getElementById("ctmClearFilters").addEventListener("click", () => {
  document.getElementById("ctmSearchInput").value = "";
  ctmSearchTerm = "";
  ctmSelectedMembers.clear();
  ctmTeamMemberMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  ctmTeamMemberLabel.textContent = ctmTeamMemberBaseLabel;
  renderCtmMembers();
});

/* ---------------- Export Report ---------------- */
function ctmMemberCounts(m) {
  const patients = ctmPatients.filter((p) => p.teamMember === m.name);
  const count = (pred) => patients.filter(pred).length;
  return {
    total: patients.length,
    priority: count((p) => p.status === "priority"),
    active: count((p) => p.status === "active"),
    registered: count((p) => p.status === "registered"),
    baseline: count((p) => p.status === "baseline"),
    enabled: count((p) => p.account === "Enabled"),
    paused: count((p) => p.account === "Paused"),
    disabled: count((p) => p.account === "Discontinued"),
    monitored: count((p) => p.monitoring === "monitored"),
    unmonitored: count((p) => p.monitoring === "unmonitored"),
  };
}

const CTM_EXPORT_COLUMNS = [
  { label: "Care Team Member", value: (m) => m.name },
  { label: "Role", value: (m) => m.role },
  { label: "Total Patients", value: (m) => ctmMemberCounts(m).total },
  { label: "Priority", value: (m) => ctmMemberCounts(m).priority },
  { label: "Active", value: (m) => ctmMemberCounts(m).active },
  { label: "Registered", value: (m) => ctmMemberCounts(m).registered },
  { label: "Baseline", value: (m) => ctmMemberCounts(m).baseline },
  { label: "Enabled", value: (m) => ctmMemberCounts(m).enabled },
  { label: "Paused", value: (m) => ctmMemberCounts(m).paused },
  { label: "Disabled", value: (m) => ctmMemberCounts(m).disabled },
  { label: "Monitored", value: (m) => ctmMemberCounts(m).monitored },
  { label: "Unmonitored", value: (m) => ctmMemberCounts(m).unmonitored },
];

function describeCtmFilters() {
  const parts = [];
  if (ctmSearchTerm) parts.push(`Search = "${ctmSearchTerm}"`);
  if (ctmSelectedMembers.size) parts.push(`Care Team Member = ${[...ctmSelectedMembers].join(", ")}`);
  return parts.length ? parts.join(", ") : "None";
}

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function downloadCsv(prefix, columns, rowsData) {
  const header = columns.map((c) => c.label);
  const lines = [header.join(",")].concat(rowsData.map((r) => columns.map((c) => csvEscape(c.value(r))).join(",")));
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const exportReportOverlay = document.getElementById("exportReportOverlay");
let pendingCtmExport = null;

function openExportReportModal(context) {
  pendingCtmExport = context;
  document.getElementById("exportSummaryBox").innerHTML = `
    <div><b>Report:</b> ${context.reportLabel}</div>
    <div><b>Filters:</b> ${context.filtersLabel}</div>
    <div><b>${context.countLabel || "Records"}:</b> ${context.count}</div>
  `;
  exportReportOverlay.classList.add("open");
}

document.getElementById("cancelExportReport").addEventListener("click", () => exportReportOverlay.classList.remove("open"));
exportReportOverlay.addEventListener("click", (e) => { if (e.target === exportReportOverlay) exportReportOverlay.classList.remove("open"); });

document.getElementById("confirmExportReport").addEventListener("click", () => {
  if (!pendingCtmExport) return;
  const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "CSV";
  if (format === "CSV") {
    downloadCsv(pendingCtmExport.filenamePrefix || "report", pendingCtmExport.columns, pendingCtmExport.rows);
  } else {
    alert(`${format} export is coming soon — please use CSV for now.`);
    return;
  }
  exportReportOverlay.classList.remove("open");
});

document.getElementById("exportCtmReportBtn").addEventListener("click", () => {
  const list = filteredCtmMembers();
  openExportReportModal({
    reportLabel: "Care Team Members",
    filtersLabel: describeCtmFilters(),
    count: list.length,
    countLabel: "Care Team Members",
    rows: list,
    columns: CTM_EXPORT_COLUMNS,
    filenamePrefix: "care-team-members",
  });
});
