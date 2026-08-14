/* ---------------- System Health Summary ---------------- */
const ovHealthStats = [
  { num: 4, label: "Critical Issues", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` },
  { num: 12, label: "Active Alerts", color: "var(--orange)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>` },
  { num: 5, label: "Organizations Impacted", color: "var(--blue)", icon: `<rect width="16" height="18" x="4" y="3" rx="1"/><path d="M9 8h1"/><path d="M14 8h1"/><path d="M9 12h1"/><path d="M14 12h1"/>` },
  { num: 39, label: "Patients Affected", color: "var(--navy)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>` },
];

document.getElementById("ovHealthGrid").innerHTML = ovHealthStats
  .map(
    (s) => `
    <div class="bo-health-card">
      <span class="bo-health-icon" style="background:${s.color};">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </span>
      <span>
        <span class="bo-health-num">${s.num}</span>
        <span class="bo-health-label">${s.label}</span>
      </span>
    </div>`
  )
  .join("");

/* ---------------- Critical Issues & Alerts ---------------- */
const ovIssues = [
  { title: "Recording upload failures", severity: "critical", org: "HMO Clalit North", orgId: "clalit-north", patients: 12, status: "Open", detected: "2h ago" },
  { title: "Voice engine timeout spike", severity: "critical", org: "Assuta Cardio", orgId: "assuta-cardio", patients: 5, status: "Open", detected: "40m ago" },
  { title: "App crash on Android 14", severity: "critical", org: "B01 Pilot", orgId: "b01-pilot", patients: 2, status: "Escalated", detected: "6h ago" },
  { title: "Duplicate patient records", severity: "critical", org: "Maccabi West", orgId: "maccabi-west", patients: 1, status: "Open", detected: "1d ago" },
  { title: "Compliance drop &gt;20%", severity: "warning", org: "Clalit South", orgId: "clalit-south", patients: 9, status: "Open", detected: "3h ago" },
  { title: "Sensor disconnect (Bluetooth)", severity: "warning", org: "Maccabi West", orgId: "maccabi-west", patients: 3, status: "Investigating", detected: "1d ago" },
  { title: "Missed daily readings", severity: "warning", org: "HMO Clalit North", orgId: "clalit-north", patients: 6, status: "Monitoring", detected: "5h ago" },
  { title: "Device battery critical", severity: "warning", org: "Assuta Cardio", orgId: "assuta-cardio", patients: 1, status: "Open", detected: "20m ago" },
];

const ovStatusPillClass = { Open: "critical", Escalated: "escalated", Investigating: "warning", Monitoring: "info" };

document.getElementById("ovIssueRows").innerHTML = ovIssues
  .map(
    (i) => `
    <tr>
      <td>${i.title}</td>
      <td><span class="bo-severity-pill ${i.severity}"><span class="dot"></span>${i.severity === "critical" ? "Critical" : "Warning"}</span></td>
      <td><a class="bo-row-link" href="org-health-dashboard.html?org=${i.orgId}">${i.org}</a></td>
      <td>${i.patients}</td>
      <td><span class="bo-severity-pill ${ovStatusPillClass[i.status] || "neutral"}">${i.status}</span></td>
      <td>${i.detected}</td>
    </tr>`
  )
  .join("");

/* ---------------- Issue Categories ---------------- */
const ovCategories = [
  { label: "Recording", count: 12, color: "var(--red)", icon: `<path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M19 11a7 7 0 0 1-14 0"/><path d="M12 19v3"/>` },
  { label: "Compliance", count: 9, color: "var(--navy)", icon: `<path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/>` },
  { label: "Voice Engine", count: 7, color: "var(--blue)", icon: `<path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/>` },
  { label: "Uploading", count: 6, color: "var(--orange)", icon: `<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v12"/>` },
  { label: "Sensors", count: 4, color: "var(--cyan)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/>` },
  { label: "Device / System", count: 3, color: "var(--gray)", icon: `<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>` },
];

document.getElementById("ovCategoryChips").innerHTML = ovCategories
  .map(
    (c) => `
    <button type="button" class="bo-chip-row">
      <span class="bo-chip-left">
        <span class="bo-chip-icon" style="background:${c.color};">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${c.icon}</svg>
        </span>
        ${c.label}
      </span>
      <span class="bo-chip-count">${c.count}</span>
    </button>`
  )
  .join("");

/* ---------------- Organizations Affected ---------------- */
const ovOrgs = [
  { id: "clalit-north", name: "HMO Clalit North", severity: "critical", patients: 18 },
  { id: "assuta-cardio", name: "Assuta Cardio", severity: "critical", patients: 6 },
  { id: "clalit-south", name: "Clalit South", severity: "warning", patients: 9 },
  { id: "maccabi-west", name: "Maccabi West", severity: "warning", patients: 4 },
  { id: "b01-pilot", name: "B01 Pilot", severity: "critical", patients: 2 },
];

document.getElementById("ovOrgChips").innerHTML = ovOrgs
  .map(
    (o) => `
    <a class="bo-chip-row" href="org-health-dashboard.html?org=${o.id}">
      <span class="bo-chip-left">
        <span class="bo-severity-pill ${o.severity}"><span class="dot"></span></span>
        ${o.name}
      </span>
      <span class="bo-chip-count">${o.patients}</span>
    </a>`
  )
  .join("");

/* ---------------- Time range toggle (visual only for now) ---------------- */
document.getElementById("ovTimeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.querySelectorAll("#ovTimeToggle .bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});
