/* ---------------- Notifications bell (shared across all backoffice pages) ----------------
   Surfaces support tickets that most need attention -- still open and either Critical
   severity or already Escalated -- from wherever in the app the bell is opened, not just
   the Support page. Recomputed on every click (rather than cached at page load) so it
   stays accurate on Support itself, where tickets change during the session. */
(function () {
  const notifBtn = document.getElementById("notifBtn");
  const notifList = document.getElementById("notifList");
  if (!notifBtn || !notifList || typeof patientTickets === "undefined" || typeof clinicTickets === "undefined") return;

  const notifSeverityColor = { Critical: "var(--red)", High: "var(--orange)", Medium: "var(--yellow)", Low: "var(--blue)" };

  /* createdDate is "DD/MM/YYYY HH:mm" -- parse to an actual timestamp so
     sorting is chronological rather than a lexicographic string compare. */
  function parseTicketDate(s) {
    const [datePart, timePart] = s.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);
    const [hour, minute] = (timePart || "0:0").split(":").map(Number);
    return new Date(year, month - 1, day, hour, minute).getTime();
  }

  function collectNotifications() {
    const tagged = patientTickets
      .map((t) => ({ ...t, source: "patient" }))
      .concat(clinicTickets.map((t) => ({ ...t, source: "clinic" })));
    return tagged
      .filter((t) => t.status !== "Resolved" && (t.severity === "Critical" || t.status === "Escalated"))
      .sort((a, b) => parseTicketDate(b.createdDate) - parseTicketDate(a.createdDate))
      .slice(0, 8);
  }

  function render() {
    const notifications = collectNotifications();
    notifBtn.dataset.count = notifications.length;
    notifBtn.classList.toggle("badge", notifications.length > 0);

    if (!notifications.length) {
      notifList.innerHTML = `<div class="bo-notif-empty">No urgent tickets right now.</div>`;
      return;
    }

    notifList.innerHTML = notifications
      .map(
        (t) => `
      <a class="bo-notif-item" href="support.html?ticket=${encodeURIComponent(t.ticketNo)}&source=${t.source}">
        <span class="bo-notif-dot" style="background:${notifSeverityColor[t.severity] || "var(--gray-text)"};"></span>
        <span>
          <span class="text">${t.ticketNo} — ${t.issueType}</span>
          <span class="meta">${t.organization} · ${t.status} · ${t.createdDate}</span>
        </span>
      </a>`
      )
      .join("");
  }

  notifBtn.addEventListener("click", render);
  render();
})();
