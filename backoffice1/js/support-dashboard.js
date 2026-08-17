/* ---------------- Pill class lookups (mirrors js/support.js) ---------------- */
const statusPillClass = { "Open": "bo-pill-status-open", "In Progress": "bo-pill-status-inprogress", "Escalated": "bo-pill-status-escalated", "Resolved": "bo-pill-status-resolved" };
const priorityPillClass = { "Warning": "bo-pill-priority-warning", "Critical": "bo-pill-priority-critical" };

/* ---------------- Combine patient + clinic tickets ---------------- */
const supDashTickets = [
  ...patientTickets.map((t) => ({ ...t, source: "Patient", raisedBy: t.patientId })),
  ...clinicTickets.map((t) => ({ ...t, source: "Clinic" })),
];

/* ---------------- KPI row ---------------- */
const openCount = supDashTickets.filter((t) => t.status === "Open").length;
const urgentCount = supDashTickets.filter((t) => t.priority === "Critical").length;
const escalatedCount = supDashTickets.filter((t) => t.status === "Escalated").length;
const inProgressCount = supDashTickets.filter((t) => t.status === "In Progress").length;
const resolvedCount = supDashTickets.filter((t) => t.status === "Resolved").length;

const supDashStats = [
  { num: openCount, label: "Open Tickets", color: "var(--blue)", icon: `<path d="M18 9.5C18 7.7 17.3 6 16 4.8C14.7 3.6 13 3 11.3 3.1C8.1 3.3 5.6 6.1 5.6 9.4V12.5C5.6 13.1 5.4 13.7 5 14.2L4 15.5C3.4 16.3 4 17.5 5 17.5H19C20 17.5 20.6 16.3 20 15.5L19 14.2C18.6 13.7 18.4 13.1 18.4 12.5"/>` },
  { num: urgentCount, label: "Critical Priority", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` },
  { num: escalatedCount, label: "Escalated", color: "var(--navy)", icon: `<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>` },
  { num: inProgressCount, label: "Awaiting Action", color: "var(--orange)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>` },
  { num: resolvedCount, label: "Resolved (7d)", color: "var(--green)", icon: `<path d="M4 12L9 17L20 6"/>` },
];

document.getElementById("supDashHealthGrid").innerHTML = supDashStats
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

/* ---------------- Critical & Escalated Tickets ---------------- */
const supDashCritical = supDashTickets
  .filter((t) => t.priority === "Critical" || t.status === "Escalated")
  .sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1))
  .slice(0, 10);

document.getElementById("supDashCriticalRows").innerHTML = supDashCritical.length
  ? supDashCritical
      .map(
        (t) => `
      <tr>
        <td><a class="bo-row-link" href="support.html?ticket=${encodeURIComponent(t.ticketNo)}&source=${t.source.toLowerCase()}">${t.ticketNo}</a></td>
        <td>${t.raisedBy}</td>
        <td>${t.organization}</td>
        <td>${t.issueType}</td>
        <td><span class="bo-pill bo-pill-tier">${t.tier}</span></td>
        <td><span class="bo-pill ${priorityPillClass[t.priority] || ""}">${t.priority}</span></td>
        <td><span class="bo-pill ${statusPillClass[t.status] || ""}">${t.status}</span></td>
        <td>${t.createdDate}</td>
      </tr>`
      )
      .join("")
  : `<tr><td colspan="8" style="text-align:center; color:var(--gray-text); padding:24px;">No critical or escalated tickets right now.</td></tr>`;

/* ---------------- Tickets by Priority ---------------- */
document.getElementById("supDashPriorityChips").innerHTML = PRIORITIES.map((p) => {
  const count = supDashTickets.filter((t) => t.priority === p).length;
  return `
    <div class="bo-chip-row">
      <span class="bo-chip-left"><span class="bo-pill ${priorityPillClass[p] || ""}">${p}</span></span>
      <span class="bo-chip-count">${count}</span>
    </div>`;
}).join("");

/* ---------------- Tickets by Issue Type ---------------- */
const supDashIssueColors = {
  "Recording Problem": "var(--red)",
  "Voice Engine Issue": "var(--orange)",
  "Sensor Issue": "#F2C94C",
  "Uploading Problem": "var(--green)",
  "Device/System Issue": "var(--blue)",
  "Compliance Issue": "var(--purple)",
  "Other Software Issue": "var(--gray)",
};

document.getElementById("supDashIssueChips").innerHTML = ISSUE_TYPES.map((issue) => {
  const count = supDashTickets.filter((t) => t.issueType === issue).length;
  return `
    <div class="bo-chip-row">
      <span class="bo-chip-left">
        <span class="bo-chip-icon" style="background:${supDashIssueColors[issue] || "var(--gray)"};"></span>
        ${issue}
      </span>
      <span class="bo-chip-count">${count}</span>
    </div>`;
}).join("");

/* ---------------- Time range toggle (visual only for now) ---------------- */
document.getElementById("supDashTimeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-seg-btn");
  if (!btn) return;
  document.querySelectorAll("#supDashTimeToggle .bo-seg-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
});
