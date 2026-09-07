/* ---------------- Audit Log ---------------- */
const AL_PAGE_SIZE = 20;

document.getElementById("alActionFilterMenu").innerHTML = buildBoSelectOptions(AL_ACTIONS);
document.getElementById("alRoleFilterMenu").innerHTML = buildBoSelectOptions(AL_ROLES);
document.getElementById("alOrgFilterMenu").innerHTML = buildBoSelectOptions(AL_ORGS);

let alActionFilter = "";
let alDescriptionFilter = "";
let alUserFilter = "";
let alRoleFilter = "";
let alOrgFilter = "";
let alUsercodeFilter = "";
let alFromDate = "";
let alToDate = "";

function alFormatTime(iso) {
  const [datePart, timePart] = iso.split("T");
  const [y, m, d] = datePart.split("-");
  return `${d}/${m}/${y.slice(2)}, ${timePart.slice(0, 5)}`;
}

function alFiltered() {
  return auditLog.filter((e) => {
    if (alActionFilter && e.action !== alActionFilter) return false;
    if (alRoleFilter && e.role !== alRoleFilter) return false;
    if (alOrgFilter && e.org !== alOrgFilter) return false;
    if (alDescriptionFilter && !e.description.toLowerCase().includes(alDescriptionFilter.toLowerCase())) return false;
    if (alUserFilter && !e.user.toLowerCase().includes(alUserFilter.toLowerCase())) return false;
    if (alUsercodeFilter && !e.usercode.toLowerCase().includes(alUsercodeFilter.toLowerCase())) return false;
    if (alFromDate && e.time.slice(0, 10) < alFromDate) return false;
    if (alToDate && e.time.slice(0, 10) > alToDate) return false;
    return true;
  }).sort((a, b) => (a.time < b.time ? 1 : -1));
}

const alPager = boCreatePager(
  "alRows",
  alFiltered,
  (e) => `
    <tr>
      <td>${e.action}</td>
      <td>${e.description}</td>
      <td>${e.user}</td>
      <td>${e.role}</td>
      <td>${e.org || "—"}</td>
      <td>${e.usercode || "—"}</td>
      <td>${alFormatTime(e.time)}</td>
    </tr>`,
  { pageSize: AL_PAGE_SIZE, emptyColspan: 7, emptyText: "No audit log entries found for the selected filters." }
);
alPager();

/* Filters apply as soon as a field changes -- no Apply button to batch them. */
document.getElementById("alActionFilter").addEventListener("change", (e) => {
  alActionFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alDescriptionFilter").addEventListener("input", (e) => {
  alDescriptionFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alUserFilter").addEventListener("input", (e) => {
  alUserFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alRoleFilter").addEventListener("change", (e) => {
  alRoleFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alOrgFilter").addEventListener("change", (e) => {
  alOrgFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alUsercodeFilter").addEventListener("input", (e) => {
  alUsercodeFilter = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alFromDate").addEventListener("change", (e) => {
  alFromDate = e.target.value;
  alPager.resetPage();
  alPager();
});
document.getElementById("alToDate").addEventListener("change", (e) => {
  alToDate = e.target.value;
  alPager.resetPage();
  alPager();
});

document.getElementById("alClearFiltersBtn").addEventListener("click", () => {
  alActionFilter = "";
  alDescriptionFilter = "";
  alUserFilter = "";
  alRoleFilter = "";
  alOrgFilter = "";
  alUsercodeFilter = "";
  alFromDate = "";
  alToDate = "";

  resetBoSelect(document.querySelector('.bo-select[data-name="alAction"]'));
  document.getElementById("alDescriptionFilter").value = "";
  document.getElementById("alUserFilter").value = "";
  resetBoSelect(document.querySelector('.bo-select[data-name="alRole"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="alOrg"]'));
  document.getElementById("alUsercodeFilter").value = "";
  const fromDateEl = document.getElementById("alFromDate");
  const toDateEl = document.getElementById("alToDate");
  fromDateEl.value = "";
  fromDateEl.type = "text";
  toDateEl.value = "";
  toDateEl.type = "text";

  alPager.resetPage();
  alPager();
});

function alCsvCell(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

document.getElementById("alExportBtn").addEventListener("click", () => {
  const header = ["Action", "Description", "User", "Role", "Organization", "Patient Usercode", "Time"];
  const rows = alFiltered().map((e) => [e.action, e.description, e.user, e.role, e.org || "", e.usercode || "", alFormatTime(e.time)]);
  const csv = [header, ...rows].map((row) => row.map(alCsvCell).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "audit-log.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
});
