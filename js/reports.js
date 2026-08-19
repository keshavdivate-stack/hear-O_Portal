const SCHEDULED_REPORTS = [
  { report: "Patient Events", recipients: "care-team@cordio-med.com", frequency: "Daily", nextRun: "08/19/2026, 9:00 AM", status: "active" },
  { report: "Audit Log", recipients: "compliance@cordio-med.com", frequency: "Weekly", nextRun: "08/24/2026, 9:00 AM", status: "active" },
  { report: "Billing Summary", recipients: "billing@cordio-med.com", frequency: "Monthly", nextRun: "09/01/2026, 9:00 AM", status: "active" },
  { report: "Session Data", recipients: "ops@cordio-med.com", frequency: "Weekly", nextRun: "08/24/2026, 9:00 AM", status: "paused" },
];

const REPORT_HISTORY = [
  { report: "Patient Events", sentOn: "08/18/2026, 9:00 AM", recipients: "care-team@cordio-med.com", status: "delivered" },
  { report: "Audit Log", sentOn: "08/17/2026, 9:00 AM", recipients: "compliance@cordio-med.com", status: "delivered" },
  { report: "Billing Summary", sentOn: "08/01/2026, 9:00 AM", recipients: "billing@cordio-med.com", status: "delivered" },
  { report: "Session Data", sentOn: "08/10/2026, 9:00 AM", recipients: "ops@cordio-med.com", status: "failed" },
];

function reportStatusCell(status) {
  if (status === "active") return `<span class="status-line status-active">Active</span>`;
  if (status === "paused") return `<span class="status-line status-muted">Paused</span>`;
  if (status === "delivered") return `<span class="status-line status-active">Delivered</span>`;
  return `<span class="status-line" style="color:var(--red);">Failed</span>`;
}

function renderScheduledReports(list = SCHEDULED_REPORTS) {
  document.getElementById("reportsScheduleRows").innerHTML = list
    .map(
      (r) => `
    <tr>
      <td><a class="lt-name active-name" href="#">${r.report}</a></td>
      <td>${r.recipients}</td>
      <td>${r.frequency}</td>
      <td>${r.nextRun}</td>
      <td>${reportStatusCell(r.status)}</td>
      <td>
        <div class="action-cell">
          <button class="action-icon kebab" aria-label="More"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg></button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

function renderReportHistory(list = REPORT_HISTORY) {
  document.getElementById("reportsHistoryRows").innerHTML = list
    .map(
      (r) => `
    <tr>
      <td><a class="lt-name active-name" href="#">${r.report}</a></td>
      <td>${r.sentOn}</td>
      <td>${r.recipients}</td>
      <td>${reportStatusCell(r.status)}</td>
      <td>
        <div class="action-cell">
          <button class="action-icon kebab" aria-label="More"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg></button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

renderScheduledReports();
renderReportHistory();

document.querySelectorAll("#reportsTabs .reg-mode-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#reportsTabs .reg-mode-tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById("reportsPanelScheduled").style.display = target === "scheduled" ? "block" : "none";
    document.getElementById("reportsPanelHistory").style.display = target === "history" ? "block" : "none";
  });
});

document.getElementById("reportsSearchInput").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  renderScheduledReports(SCHEDULED_REPORTS.filter((r) => r.report.toLowerCase().includes(q) || r.recipients.toLowerCase().includes(q)));
});

document.getElementById("reportsHistorySearchInput").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  renderReportHistory(REPORT_HISTORY.filter((r) => r.report.toLowerCase().includes(q) || r.recipients.toLowerCase().includes(q)));
});

document.getElementById("reportsClearFilters").addEventListener("click", () => {
  document.getElementById("reportsSearchInput").value = "";
  renderScheduledReports();
});

document.getElementById("reportsHistoryClearFilters").addEventListener("click", () => {
  document.getElementById("reportsHistorySearchInput").value = "";
  renderReportHistory();
});
