/* ---------------- Status Change: sample data ---------------- */
/* Shared by status-change.html and the Summary dashboard's "Status Change" card.
   Newest first. `since` is display-ready MM/DD/YYYY; `previous` is "" for a patient's first status;
   `days` = days since the change (as of 10/13/2026); `site` = username prefix (clinical site);
   `category` = which status changed: Account, Status (clinical) or Monitoring. */
const STATUS_CHANGE_ROWS = [
  { username: "Q01-0036", category: "Account", previous: "Enabled", changedTo: "Paused", since: "10/13/2026", days: 0, changedBy: "q01_clinicadmin", site: "Q01", account: "Paused", monitoring: "Monitored" },
  { username: "Q01-0033", previous: "", changedTo: "Registered", since: "10/13/2026", days: 0, changedBy: "System", site: "Q01" },
  { username: "KMC-0009", category: "Monitoring", previous: "Monitored", changedTo: "Low Compliance", since: "10/12/2026", days: 1, changedBy: "System", site: "KMC", account: "Enabled", monitoring: "Low Compliance" },
  { username: "B01-0345", previous: "Priority", changedTo: "Active", since: "10/12/2026", days: 1, changedBy: "b01_supervisor", site: "B01" },
  { username: "B01-0347", previous: "Baseline", changedTo: "Active", since: "10/12/2026", days: 1, changedBy: "kaustubh_clinicdoc", site: "B01" },
  { username: "KMC-0007", previous: "", changedTo: "Registered", since: "10/12/2026", days: 1, changedBy: "System", site: "KMC" },
  { username: "B01-0352", category: "Monitoring", previous: "Low Compliance", changedTo: "Unmonitored", since: "10/11/2026", days: 2, changedBy: "System", site: "B01", account: "Enabled", monitoring: "Unmonitored" },
  { username: "Q01-0029", previous: "Active", changedTo: "Priority", since: "10/11/2026", days: 2, changedBy: "kaustubh_clinicdoc", site: "Q01" },
  { username: "007-0018", previous: "Registered", changedTo: "Baseline", since: "10/11/2026", days: 2, changedBy: "System", site: "007" },
  { username: "007-0016", previous: "Baseline", changedTo: "Active", since: "10/10/2026", days: 3, changedBy: "dr_mehta_007", site: "007" },
  { username: "B01-0349", previous: "", changedTo: "Registered", since: "10/10/2026", days: 3, changedBy: "System", site: "B01" },
  { username: "007-0021", category: "Account", previous: "Paused", changedTo: "Enabled", since: "10/09/2026", days: 4, changedBy: "dr_mehta_007", site: "007", account: "Enabled", monitoring: "Monitored" },
  { username: "007-0018", previous: "", changedTo: "Registered", since: "10/09/2026", days: 4, changedBy: "System", site: "007" },
  { username: "KMC-0002", previous: "Baseline", changedTo: "Active", since: "10/08/2026", days: 5, changedBy: "kaustubh_clinicdoc", site: "KMC" },
  { username: "Q01-0031", previous: "Registered", changedTo: "Baseline", since: "10/08/2026", days: 5, changedBy: "System", site: "Q01" },
  { username: "NTS-0008", category: "Account", previous: "Enabled", changedTo: "Discontinued", since: "10/07/2026", days: 6, changedBy: "nts_clinicdoc", site: "NTS", account: "Discontinued", monitoring: "Unmonitored" },
  { username: "B01-0345", previous: "Active", changedTo: "Priority", since: "10/07/2026", days: 6, changedBy: "System", site: "B01" },
  { username: "NTS-0006", previous: "Baseline", changedTo: "Active", since: "10/06/2026", days: 7, changedBy: "nts_clinicdoc", site: "NTS" },
  { username: "Q01-0031", previous: "", changedTo: "Registered", since: "10/06/2026", days: 7, changedBy: "System", site: "Q01" },
  { username: "Q01-0038", category: "Monitoring", previous: "Unmonitored", changedTo: "Monitored", since: "10/05/2026", days: 8, changedBy: "System", site: "Q01", account: "Enabled", monitoring: "Monitored" },
  { username: "B01-0347", previous: "Registered", changedTo: "Baseline", since: "10/05/2026", days: 8, changedBy: "System", site: "B01" },
  { username: "B01-0345", previous: "Baseline", changedTo: "Active", since: "10/04/2026", days: 9, changedBy: "b01_supervisor", site: "B01" },
  { username: "KMC-0005", previous: "Registered", changedTo: "Baseline", since: "10/03/2026", days: 10, changedBy: "System", site: "KMC" },
  { username: "B01-0347", previous: "", changedTo: "Registered", since: "10/02/2026", days: 11, changedBy: "System", site: "B01" },
  { username: "Q01-0029", previous: "Baseline", changedTo: "Active", since: "10/01/2026", days: 12, changedBy: "q01_clinicadmin", site: "Q01" },
  { username: "KMC-0005", previous: "", changedTo: "Registered", since: "10/01/2026", days: 12, changedBy: "System", site: "KMC" },
  { username: "007-0016", previous: "Registered", changedTo: "Baseline", since: "09/30/2026", days: 13, changedBy: "System", site: "007" },
  { username: "007-0016", previous: "", changedTo: "Registered", since: "09/28/2026", days: 15, changedBy: "System", site: "007" },
  { username: "B01-0345", previous: "Registered", changedTo: "Baseline", since: "09/27/2026", days: 16, changedBy: "System", site: "B01" },
  { username: "B01-0345", previous: "", changedTo: "Registered", since: "09/25/2026", days: 18, changedBy: "System", site: "B01" },
  { username: "KMC-0002", previous: "Registered", changedTo: "Baseline", since: "09/24/2026", days: 19, changedBy: "System", site: "KMC" },
  { username: "KMC-0002", previous: "", changedTo: "Registered", since: "09/22/2026", days: 21, changedBy: "System", site: "KMC" },
  { username: "Q01-0029", previous: "Registered", changedTo: "Baseline", since: "09/17/2026", days: 26, changedBy: "System", site: "Q01" },
  { username: "Q01-0029", previous: "", changedTo: "Registered", since: "09/15/2026", days: 28, changedBy: "System", site: "Q01" },
  { username: "NTS-0006", previous: "Registered", changedTo: "Baseline", since: "09/10/2026", days: 33, changedBy: "System", site: "NTS" },
  { username: "NTS-0006", previous: "", changedTo: "Registered", since: "09/08/2026", days: 35, changedBy: "System", site: "NTS" },
];

/* Account Status / Monitoring Status: the patient's current state, so every row for the same
   username shows the same values. Sample data, derived from the username (mostly Enabled and
   Monitored). Monitoring is Monitored, Unmonitored or Low Compliance. */
(function addPatientStates() {
  const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  STATUS_CHANGE_ROWS.forEach((r) => {
    r.category = r.category || "Status";
    if (r.account) return; // Account / Monitoring change rows carry their own current state
    const h = hash(r.username);
    r.account = h % 10 < 8 ? "Enabled" : h % 10 < 9 ? "Paused" : "Discontinued";
    const m = (h >> 4) % 20;
    r.monitoring = m < 12 ? "Monitored" : m < 17 ? "Unmonitored" : "Low Compliance";
  });
})();
