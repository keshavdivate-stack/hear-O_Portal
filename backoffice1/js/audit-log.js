/* ---------------- Audit Log ---------------- */
const AL_PAGE_SIZE = 20;

document.getElementById("alActionFilter").insertAdjacentHTML(
  "beforeend",
  AL_ACTIONS.map((a) => `<option value="${a}">${a}</option>`).join("")
);
document.getElementById("alRoleFilter").insertAdjacentHTML(
  "beforeend",
  AL_ROLES.map((r) => `<option value="${r}">${r}</option>`).join("")
);
document.getElementById("alOrgFilter").insertAdjacentHTML(
  "beforeend",
  AL_ORGS.map((o) => `<option value="${o}">${o}</option>`).join("")
);

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

document.querySelectorAll(".bo-filter-select").forEach((select) => {
  select.addEventListener("change", () => select.classList.toggle("has-value", select.value !== ""));
});

document.getElementById("alApplyBtn").addEventListener("click", () => {
  alActionFilter = document.getElementById("alActionFilter").value;
  alDescriptionFilter = document.getElementById("alDescriptionFilter").value;
  alUserFilter = document.getElementById("alUserFilter").value;
  alRoleFilter = document.getElementById("alRoleFilter").value;
  alOrgFilter = document.getElementById("alOrgFilter").value;
  alUsercodeFilter = document.getElementById("alUsercodeFilter").value;
  alFromDate = document.getElementById("alFromDate").value;
  alToDate = document.getElementById("alToDate").value;
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
