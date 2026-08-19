const heartIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const flagIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#F16C6C" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#F16C6C" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const infoIconBlue = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const infoIconGray = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#C9CFD6"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const patientList = [
  { name: "Alexander White", username: "ABC-1254", mrn: "857452365", phone: "054-857 15423", account: "Enabled", status: "priority", flag: true, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92, gender: "M" },
  { name: "Dan Volex",        username: "ABC-1252", mrn: "854745856", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68, gender: "M" },
  { name: "Mike Brown",       username: "ABC-1251", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", monSince: "Since: 1d | 01.09.2028", compliance: 34, gender: "M" },
  { name: "Ariel Fox",        username: "ABC-1238", mrn: "854123658", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81, gender: "F" },
  { name: "Jeff Frank",       username: "ABC-1242", mrn: "854123658", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 4d | 01.06.2028", monitoring: "monitored", compliance: 57, gender: "M" },
  { name: "Aric Snow",        username: "ABC-1283", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "priority", flag: false, since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76, gender: "M" },
  { name: "Abe Lol",          username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88, gender: "M" },
  { name: "Annie Zaplin",     username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45, gender: "F" },
  { name: "Nathan Norash",    username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63, gender: "M" },
  { name: "Henry Fisher",     username: "ABC-1220", mrn: "965412589", phone: "054-857 15423", account: "Enabled", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12, gender: "M" },
  { name: "Josh Ericson",     username: "ABC-1222", mrn: "854125632", phone: "054-857 15423", account: "Enabled", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", monInfo: true, compliance: 79, gender: "Other" },
  { name: "Jack Harris",      username: "ABC-1221", mrn: "854125698", phone: "054-857 15423", account: "Enabled", status: "none", monitoring: "unmonitored", monSince: "Since: 5d | 01.05.2028", compliance: 24, gender: "M" },
];

const complianceRanges = [
  { key: "76-100", label: "76-100%", min: 76, max: 100 },
  { key: "51-75", label: "51-75%", min: 51, max: 75 },
  { key: "26-50", label: "26-50%", min: 26, max: 50 },
  { key: "0-25", label: "0-25%", min: 0, max: 25 },
];

const genderOptions = [
  { key: "M", label: "Male (M)" },
  { key: "F", label: "Female (F)" },
  { key: "Other", label: "Other" },
];

const selectedComplianceRanges = new Set();
const selectedGenders = new Set();

function statusCell(p) {
  if (p.status === "priority") {
    return `
      <div class="status-cell">
        <span class="status-line status-priority">${heartIcon} Priority ${p.flag ? flagIcon : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#9AA5B1" stroke-width="1.8"/><path d="M12 8V13" stroke="#9AA5B1" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16" r="1" fill="#9AA5B1"/></svg>`}</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "active") {
    return `
      <div class="status-cell">
        <span class="status-line status-active">Active</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "registered") {
    return `
      <div class="status-cell">
        <span class="status-line status-muted">Registered</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  if (p.status === "baseline") {
    return `
      <div class="status-cell">
        <span class="status-line status-muted">Baseline</span>
        <span class="status-since">${p.since}</span>
      </div>`;
  }
  return `
    <div class="status-cell">
      <span class="status-line status-muted">None ${infoIconGray}</span>
    </div>`;
}

function monitoringCell(p) {
  if (p.monitoring === "monitored") {
    return `
      <div class="mon-cell">
        <span class="mon-line mon-monitored">Monitored ${p.monInfo ? infoIconBlue : ""}</span>
      </div>`;
  }
  if (p.monitoring === "unmonitored") {
    return `
      <div class="mon-cell">
        <span class="mon-line mon-unmonitored">${infoIconBlue} Unmonitored</span>
        <span class="status-since">${p.monSince || ""}</span>
      </div>`;
  }
  return `<div class="mon-cell"><span class="mon-line mon-none">None</span></div>`;
}

function complianceCell(p) {
  const cls = p.compliance >= 76 ? "status-active" : p.compliance >= 51 ? "mon-unmonitored" : "status-priority";
  return `<div class="mon-cell"><span class="mon-line ${cls}">${p.compliance}%</span></div>`;
}

function complianceInRange(value) {
  if (!selectedComplianceRanges.size) return true;
  return [...selectedComplianceRanges].some((key) => {
    const range = complianceRanges.find((r) => r.key === key);
    return range && value >= range.min && value <= range.max;
  });
}

function genderLabel(gender) {
  return gender === "M" ? "(M)" : gender === "F" ? "(F)" : "(Other)";
}

function filteredPatientList() {
  return patientList.filter(
    (p) => complianceInRange(p.compliance) && (!selectedGenders.size || selectedGenders.has(p.gender))
  );
}

const rows = document.getElementById("patientListRows");

function renderPatientList() {
  rows.innerHTML = filteredPatientList()
    .map(
      (p) => `
      <tr>
        <td><a class="lt-name ${p.status === "priority" ? "priority" : "active-name"}" href="patient-data.html">${p.name} ${genderLabel(p.gender)}</a></td>
        <td>${p.username}</td>
        <td>${p.mrn}</td>
        <td>${p.phone}</td>
        <td>${p.account}</td>
        <td>${statusCell(p)}</td>
        <td>${monitoringCell(p)}</td>
        <td>${complianceCell(p)}</td>
        <td>
          <div class="action-cell">
            <button class="action-icon" aria-label="Edit">${pencilIcon}</button>
            <button class="action-icon kebab" aria-label="More">${kebabIcon}</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

renderPatientList();

/* ---------------- Compliance filter ---------------- */
const complianceMenu = document.getElementById("complianceMenu");
complianceMenu.innerHTML = complianceRanges
  .map(
    (r) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${r.key}" />
      ${r.label}
    </label>`
  )
  .join("");

function wireCheckboxFilter(wrapEl, menuEl, selectedSet, onChange) {
  const trigger = wrapEl.querySelector(".filter-btn");
  const label = wrapEl.querySelector(".checkbox-filter-label");
  const baseLabel = label.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrapEl.classList.contains("open");
    closeAllFilterPopovers();
    wrapEl.classList.toggle("open", willOpen);
  });

  menuEl.addEventListener("click", (e) => e.stopPropagation());

  menuEl.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selectedSet.add(checkbox.value);
    else selectedSet.delete(checkbox.value);

    label.textContent = selectedSet.size ? `${baseLabel} (${selectedSet.size})` : baseLabel;
    onChange();
  });
}

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="compliance"]'),
  complianceMenu,
  selectedComplianceRanges,
  renderPatientList
);

/* ---------------- Gender filter ---------------- */
const genderMenu = document.getElementById("genderMenu");
genderMenu.innerHTML = genderOptions
  .map(
    (g) => `
    <label class="checkbox-filter-option">
      <input type="checkbox" value="${g.key}" />
      ${g.label}
    </label>`
  )
  .join("");

wireCheckboxFilter(
  document.querySelector('.checkbox-filter[data-name="gender"]'),
  genderMenu,
  selectedGenders,
  renderPatientList
);

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
}

document.addEventListener("click", closeAllFilterPopovers);

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  selectedComplianceRanges.clear();
  complianceMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  document.querySelector('.checkbox-filter[data-name="compliance"] .checkbox-filter-label').textContent = "Compliance";
  selectedGenders.clear();
  genderMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  document.querySelector('.checkbox-filter[data-name="gender"] .checkbox-filter-label').textContent = "Gender";
  renderPatientList();
});
