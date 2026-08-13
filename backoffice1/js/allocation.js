/* ---------------- Tabs ---------------- */
document.querySelectorAll("#allocTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#allocTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* ---------------- Filter options ---------------- */
const allocSites = ["B01", "101", "104", "B03", "105"];
document.getElementById("allocSiteFilter").insertAdjacentHTML(
  "beforeend",
  allocSites.map((s) => `<option value="${s}">${s}</option>`).join("")
);

const allocConfigs = ["Main New8 no HQ Sensors Train 4.0 Zaza", "Main New8 HQ Sensors Train 4.0", "Legacy Config 3.2"];
document.getElementById("allocConfigFilter").insertAdjacentHTML(
  "beforeend",
  allocConfigs.map((c) => `<option value="${c}">${c}</option>`).join("")
);

const allocLangs = ["EN", "HE", "AR", "ES"];
document.getElementById("allocLangFilter").insertAdjacentHTML(
  "beforeend",
  allocLangs.map((l) => `<option value="${l}">${l}</option>`).join("")
);

/* ---------------- Future patients ---------------- */
const editIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;

const futurePatients = [
  { id: 0, name: "MKT", isHmo: false, dateCreated: "14/08/2019", appConfig: "Main New8 no HQ Sensors Train 4.0 Zaza", lastModified: "09/02/2025 21:20:14" },
];

document.getElementById("allocFutureRows").innerHTML = futurePatients
  .map(
    (p) => `
    <tr>
      <td>${p.name}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-id="${p.id}" ${p.isHmo ? "checked" : ""} /></td>
      <td>${p.dateCreated}</td>
      <td>${p.appConfig}</td>
      <td>${p.lastModified}</td>
      <td>
        <div class="bo-row-actions">
          <button class="bo-action-icon" data-id="${p.id}" aria-label="Edit">${editIcon}</button>
        </div>
      </td>
    </tr>`
  )
  .join("");

document.getElementById("allocFutureRows").addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  const row = futurePatients.find((p) => p.id === Number(box.dataset.id));
  if (row) row.isHmo = box.checked;
});

/* ---------------- Update configs ---------------- */
document.getElementById("allocUpdateBtn").addEventListener("click", () => {
  const rows = document.querySelectorAll("#allocCurrentRows tr");
  if (!rows.length) return;
});
