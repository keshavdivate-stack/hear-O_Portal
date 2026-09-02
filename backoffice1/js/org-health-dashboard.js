/* ---------------- Resolve current org from ?org= ---------------- */
const orgHealthParams = new URLSearchParams(location.search);
const orgHealthId = orgHealthData[orgHealthParams.get("org")] ? orgHealthParams.get("org") : ORG_HEALTH_DEFAULT;
const orgHealth = orgHealthData[orgHealthId];
const orgHealthIssueContext = orgHealthParams.get("issue") || "";

document.title = `HearO Backoffice | ${orgHealth.name}`;
document.getElementById("orgDashName").textContent = orgHealth.name;

const orgSevLabel = { critical: "Critical", warning: "Warning", healthy: "Healthy" };
const orgSevEl = document.getElementById("orgDashSeverity");
orgSevEl.classList.add(orgHealth.severity);
orgSevEl.innerHTML = `<span class="dot"></span>${orgSevLabel[orgHealth.severity]}`;

/* ---------------- Organization switcher ---------------- */
const orgSwitcher = document.getElementById("orgDashSwitcher");
orgSwitcher.innerHTML = Object.keys(orgHealthData)
  .map((id) => `<option value="${id}" ${id === orgHealthId ? "selected" : ""}>${orgHealthData[id].name}</option>`)
  .join("");
orgSwitcher.addEventListener("change", (e) => {
  location.href = `org-health-dashboard.html?org=${e.target.value}`;
});

/* ---------------- KPI row ----------------
   Arriving with an ?issue= context (clicked from a Critical Issue row on
   Overview) adds a leading "Tickets" card counting how many tickets are
   open for that specific issue category at this org, so the number the
   user came to check is visible immediately alongside the org's totals. */
const orgHealthGridEl = document.getElementById("orgHealthGrid");
const orgIssueTicketCount = orgHealthIssueContext
  ? (orgHealth.categories.find((c) => c.label === orgHealthIssueContext)?.count ?? 0)
  : null;

const orgHealthStats = [];
if (orgHealthIssueContext) {
  orgHealthStats.push({
    num: orgIssueTicketCount,
    label: `Tickets — ${orgHealthIssueContext}`,
    color: "var(--red)",
    accent: true,
    icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>`,
  });
}
orgHealthStats.push(
  { num: orgHealth.patients, label: "Patients", color: "var(--navy)", icon: `<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>` },
  { num: orgHealth.providers, label: "Providers / Users", color: "var(--blue)", icon: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83"/>` },
  { num: orgHealth.openIssues, label: "Open Issues", color: "var(--orange)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5"/><path d="M9.5 20.5C10 21.3 10.9 21.8 12 21.8"/>` },
  { num: orgHealth.criticalIssues, label: "Critical Issues", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` }
);

orgHealthGridEl.classList.toggle("bo-health-grid--5", orgHealthStats.length === 5);
orgHealthGridEl.innerHTML = orgHealthStats
  .map(
    (s) => `
    <div class="bo-health-card${s.accent ? " bo-health-card--accent" : ""}">
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

/* ---------------- Issue breakdown ---------------- */
document.getElementById("orgCategoryChips").innerHTML = orgHealth.categories.length
  ? orgHealth.categories
      .map(
        (c) => `
      <div class="bo-chip-row${c.label === orgHealthIssueContext ? " active" : ""}">
        <span class="bo-chip-left">
          <span class="bo-chip-icon" style="background:${c.color};"></span>
          ${c.label}
        </span>
        <span class="bo-chip-count">${c.count}</span>
      </div>`
      )
      .join("")
  : `<p class="bo-mini-title" style="margin:0;">No open issue categories.</p>`;

/* ---------------- Organization context ---------------- */
document.getElementById("orgContextList").innerHTML = `
  <div class="bo-chip-row" style="cursor:default;">
    <span class="bo-chip-left">Last incident</span>
    <span class="bo-chip-count" style="font-size:13px;">${orgHealth.lastIncident}</span>
  </div>`;

/* ---------------- Affected patients / issue tickets ----------------
   Arriving with an ?issue= context (e.g. clicked from a Critical Issue
   row on Overview) is an investigation into that specific issue, not a
   browse of the org's whole patient roster — so the table switches to a
   ticket list scoped to that category (one row per affected patient's
   open ticket) instead of the org's full unordered patient list. */
const orgPatientPanelTitleEl = document.getElementById("orgPatientPanelTitle");
const orgPatientHeadEl = document.getElementById("orgPatientHead");
const orgPatientRowsEl = document.getElementById("orgPatientRows");

if (orgHealthIssueContext) {
  const orgIssueTickets = orgHealth.patientsAffected.filter((p) =>
    p.issue.toLowerCase().includes(orgHealthIssueContext.toLowerCase())
  );

  orgPatientPanelTitleEl.textContent = `Tickets — ${orgHealthIssueContext} (${orgIssueTickets.length})`;
  orgPatientHeadEl.innerHTML = `<tr><th>Ticket</th><th>Patient</th><th>Issue Type</th><th>Severity</th><th>Raised</th><th>Status</th></tr>`;

  orgPatientRowsEl.innerHTML = orgIssueTickets.length
    ? orgIssueTickets
        .map(
          (p) => `
      <tr>
        <td>TCK-${p.id.replace(/\D/g, "")}</td>
        <td><a class="bo-row-link" href="patient-health-dashboard.html?patient=${p.id}&org=${orgHealthId}">${p.name}</a></td>
        <td>${p.issue}</td>
        <td><span class="bo-severity-pill ${p.severity}"><span class="dot"></span>${p.severity === "critical" ? "Critical" : "Warning"}</span></td>
        <td>${p.lastRecording}</td>
        <td><span class="bo-severity-pill ${p.status === "Escalated" ? "escalated" : p.status === "Open" ? "critical" : "info"}">${p.status}</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="6" style="text-align:center; color:var(--gray-text); padding:24px;">No open tickets for this issue.</td></tr>`;
} else {
  orgPatientRowsEl.innerHTML = orgHealth.patientsAffected.length
    ? orgHealth.patientsAffected
        .map(
          (p) => `
      <tr>
        <td><a class="bo-row-link" href="patient-health-dashboard.html?patient=${p.id}&org=${orgHealthId}">${p.name}</a></td>
        <td>${p.issue}</td>
        <td><span class="bo-severity-pill ${p.severity}"><span class="dot"></span>${p.severity === "critical" ? "Critical" : "Warning"}</span></td>
        <td>${p.lastRecording}</td>
        <td><span class="bo-severity-pill ${p.status === "Escalated" ? "escalated" : p.status === "Open" ? "critical" : "info"}">${p.status}</span></td>
      </tr>`
        )
        .join("")
    : `<tr><td colspan="5" style="text-align:center; color:var(--gray-text); padding:24px;">No patients currently affected.</td></tr>`;
}

/* ---------------- Time range toggle (visual only for now) ---------------- */
document.getElementById("orgTimeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.querySelectorAll("#orgTimeToggle .bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});
