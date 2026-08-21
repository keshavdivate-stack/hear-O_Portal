/* ---------------- Data ---------------- */
const orgs = [
  { name: "120", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "052-2221836", latLng: "32.09 / 34.87", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "121", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "08-6745431", latLng: "31.66 / 34.56", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "122", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "052-4498910", latLng: "31.24 / 34.8", docPath: "", updateSent: "01/01/0001", lng: "EN" },
  { name: "240", tag: "CURRENT", study: "CHF", isHmo: true, target: 40, dateCreated: "24/04/2022", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "41.83 / -72.55", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "241", tag: "CURRENT", study: "CHF", isHmo: true, target: 40, dateCreated: "03/05/2022", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "33.976242 / -84.230833", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "242", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "25.77214 / -80.193665", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "243", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "25.77214 / -80.193665", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "244", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "26.599016 / -81.877922", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "ASF", tag: "CURRENT", study: "CHF", isHmo: true, target: 10, dateCreated: "11/03/2021", onDashboard: false, careRec: false, authType: "Patient Self Report", phone: "", latLng: "31.95977 / 34.775", docPath: "", updateSent: "01/01/0001", lng: "AR" },
  { name: "ATP", tag: "CURRENT", study: "CHF", isHmo: false, target: 0, dateCreated: "14/08/2019", onDashboard: true, careRec: true, authType: "Patient Self Report", phone: "0542199636", latLng: "0 / 0", docPath: "EU/1.0", updateSent: "01/01/0001", lng: "ES" },
  { name: "B01", tag: "CURRENT", study: "CHF", isHmo: true, target: 50, dateCreated: "26/06/2024", onDashboard: true, careRec: false, authType: "Patient Clinic Report", phone: "0545030772", latLng: "32.45105 / 34.9", docPath: "EU/1.0", updateSent: "01/01/0001", lng: "ES" },
];

orgs.forEach((o, i) => (o.id = i));

/* ---------------- State ---------------- */
const ORG_PAGE_SIZE = 20;
let orgCurrentPage = 1;
let orgSortDir = "asc";
let orgSearchTerm = "";

function filteredOrgs() {
  if (!orgSearchTerm) return orgs;
  const q = orgSearchTerm.toLowerCase();
  return orgs.filter((o) => o.name.toLowerCase().includes(q) || o.tag.toLowerCase().includes(q) || o.study.toLowerCase().includes(q));
}

function sortedOrgs() {
  const list = [...filteredOrgs()];
  list.sort((a, b) => (orgSortDir === "asc" ? a.name.localeCompare(b.name, undefined, { numeric: true }) : b.name.localeCompare(a.name, undefined, { numeric: true })));
  return list;
}

/* ---------------- Render ---------------- */
const orgCheck = (on) => `<span class="cell-checkbox${on ? " checked" : ""}"></span>`;
const sendIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 3L10.5 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 3L14.5 21L10.5 13.5L3 9.5L21 3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const orgKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function renderOrgs() {
  const list = sortedOrgs();
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / ORG_PAGE_SIZE));
  orgCurrentPage = Math.min(orgCurrentPage, totalPages);

  const start = (orgCurrentPage - 1) * ORG_PAGE_SIZE;
  const pageItems = list.slice(start, start + ORG_PAGE_SIZE);

  document.getElementById("orgsRows").innerHTML = pageItems
    .map(
      (o) => `
      <tr>
        <td><span class="lt-name org-name">${o.name}</span></td>
        <td>${o.tag}</td>
        <td>${o.study}</td>
        <td>${orgCheck(o.isHmo)}</td>
        <td>${o.target}</td>
        <td>${o.dateCreated}</td>
        <td>${orgCheck(o.onDashboard)}</td>
        <td>${orgCheck(o.careRec)}</td>
        <td>${o.authType}</td>
        <td>${o.phone}</td>
        <td class="mono">${o.latLng}</td>
        <td>${o.docPath}</td>
        <td>${o.updateSent}</td>
        <td>${o.lng}</td>
        <td>
          <div class="action-cell">
            <button class="action-icon send-icon" data-id="${o.id}" aria-label="Send">${sendIcon}</button>
            <button class="action-icon kebab row-menu-trigger" data-id="${o.id}" aria-label="Row actions">${orgKebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const rangeEnd = total === 0 ? 0 : Math.min(start + ORG_PAGE_SIZE, total);
  const rangeStart = total === 0 ? 0 : start + 1;
  document.getElementById("orgPageRangeLabel").textContent = `${rangeStart} – ${rangeEnd} of ${total}`;

  document.getElementById("orgFirstPage").disabled = orgCurrentPage === 1;
  document.getElementById("orgPrevPage").disabled = orgCurrentPage === 1;
  document.getElementById("orgNextPage").disabled = orgCurrentPage === totalPages;
  document.getElementById("orgLastPage").disabled = orgCurrentPage === totalPages;
}

renderOrgs();

/* ---------------- Search ---------------- */
document.getElementById("orgSearchInput").addEventListener("input", (e) => {
  orgSearchTerm = e.target.value.trim();
  orgCurrentPage = 1;
  renderOrgs();
});

/* ---------------- Sort ---------------- */
document.querySelector(".orgs-mgmt-table th.sortable").addEventListener("click", () => {
  orgSortDir = orgSortDir === "asc" ? "desc" : "asc";
  renderOrgs();
});

/* ---------------- Pagination ---------------- */
document.getElementById("orgFirstPage").addEventListener("click", () => { orgCurrentPage = 1; renderOrgs(); });
document.getElementById("orgPrevPage").addEventListener("click", () => { orgCurrentPage -= 1; renderOrgs(); });
document.getElementById("orgNextPage").addEventListener("click", () => { orgCurrentPage += 1; renderOrgs(); });
document.getElementById("orgLastPage").addEventListener("click", () => {
  orgCurrentPage = Math.ceil(filteredOrgs().length / ORG_PAGE_SIZE);
  renderOrgs();
});

/* ---------------- Row action dropdown (reuses shared #rowMenu) ---------------- */
const orgRowMenu = document.getElementById("rowMenu");
let activeOrgRowId = null;

document.getElementById("orgsRows").addEventListener("click", (e) => {
  const trigger = e.target.closest(".row-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  activeOrgRowId = Number(trigger.dataset.id);
  const rect = trigger.getBoundingClientRect();
  orgRowMenu.style.top = `${rect.bottom + 6}px`;
  orgRowMenu.style.left = `${rect.right - 190}px`;
  orgRowMenu.classList.add("open");
});

document.addEventListener("click", (e) => {
  if (!orgRowMenu.contains(e.target)) orgRowMenu.classList.remove("open");
});

orgRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item) return;
  orgRowMenu.classList.remove("open");
});
