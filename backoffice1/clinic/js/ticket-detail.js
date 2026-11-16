/* Backoffice-safe fork of ../../js/ticket-detail.js (re-synced with the
   root file). Why forked instead of shared: the root file shows the patient
   name on Patient tickets, adds the patient e-mail / mobile to the meta line,
   and renders the Recording tab (a patient voice recording). Changes from the
   root file:
   - "Created For" on Patient tickets shows only `ticket.who` (the patient's
     user number) -- there is no patientName on this copy's ticketList (see
     js/support-data.js). The patient e-mail / mobile (patientContactInfo) are
     dropped entirely.
   - The Recording tab (renderRecording, the play/pause wiring and the
     microphone-permission alert) is removed; its markup is gone from
     ticket-detail.html too.
   Header, Clinic Info, Issue, History and Patient Log (device / app version /
   permissions / session log -- operational, no clinical content) match the
   root file and still call into the shared ../../js/support-tickets-common.js. */

function getTicketIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isFinite(id) ? id : null;
}

const ticket = ticketList.find((t) => t.id === getTicketIdFromUrl());

/* The Back arrow returns to wherever the user actually came from (Support
   list, a notification, etc.) instead of always landing on the Tickets tab.
   When the referring page is part of this app, that page's URL wins --
   history.back() is used on click for a true back-nav, and the link's href
   falls back to that same URL for reload/new-tab cases with no history entry
   to go back to. With no usable in-app referrer, the link keeps its default
   "Support" destination. */
(function initTicketDetailBackLink() {
  const backLink = document.getElementById("ticketDetailBack");
  if (!backLink) return;
  const ref = document.referrer;
  if (!ref) return;
  try {
    const refUrl = new URL(ref);
    if (refUrl.origin !== location.origin) return;
    backLink.setAttribute("href", refUrl.pathname + refUrl.search);
    backLink.addEventListener("click", (e) => {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    });
  } catch (e) {}
})();

if (!ticket) {
  document.getElementById("ticketDetailTitle").textContent = "Ticket not found";
  document.getElementById("ticketDetailLayout").innerHTML = `<div class="ticket-detail-card"><p style="margin:0; color:var(--gray-text);">This ticket doesn't exist or has been removed. <a href="support.html">Back to Support</a></p></div>`;
} else {
  ensureTicketHistory(ticket);
  deriveDefaultTier(ticket);

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- Header ---------------- */
  function renderHeader() {
    document.getElementById("ticketDetailTitle").textContent = ticket.ticketId;
    const badge = (label, pill) => `<span class="ticket-detail-badge-group"><span class="ticket-detail-badge-label">${label}</span>${pill}</span>`;
    document.getElementById("ticketDetailBadges").innerHTML = [
      badge("Status", `<span class="ticket-pill ${stateCellClass(ticket.state)}">${ticket.state}</span>`),
      ticket.tier ? badge("Level", `<span class="ticket-detail-badge-text">${ticket.tier}</span>`) : "",
      badge("Type", `<span class="ticket-pill ${typeCellClass(ticket.type)}">${ticket.type}</span>`),
    ].join("");

    /* Patient tickets link the patient's user number through to their chart;
       clinic tickets were raised by a clinic user. No name, e-mail or mobile. */
    const createdFor = ticket.type === "Patient"
      ? `<a class="ticket-view-link" href="patient-data.html">${ticket.who}</a>`
      : ticket.who;
    const sep = `<span class="ticket-detail-meta-sep">&middot;</span>`;
    document.getElementById("ticketDetailMeta").innerHTML =
      `Created ${ticket.created}${sep}Origin: ${ticket.origin}${sep}Organization: ${ticket.organization}${sep}Created For: ${createdFor}`;
    document.title = `HearO | ${ticket.ticketId} (Backoffice)`;
  }

  /* ---------------- Clinic Info ----------------
     The clinic/organization the ticket belongs to (ticket.organization is its
     org code). Values mirror the Organizations page's list
     (js/organizations.js: 121 / ATP / B01) and, for codes that list doesn't
     have, the HMO flag and date created from backoffice's org allocation list
     (backoffice1/js/allocation.js: 104 / B03 / 105). Anything still missing
     (phone, language) is seeded off the org code, so the same clinic always
     shows the same details on every one of its tickets. */
  const CLINIC_DIRECTORY = {
    "121": { study: "CHF", isHmo: true, phone: "08-6745431", lng: "AR", dateCreated: "06/06/2023" },
    "ATP": { study: "CHF", isHmo: false, phone: "0542199636", lng: "ES", dateCreated: "14/08/2019" },
    "B01": { study: "CHF", isHmo: true, phone: "0545030772", lng: "ES", dateCreated: "26/06/2024" },
    "104": { isHmo: false, dateCreated: "12/06/2023" },
    "B03": { isHmo: true, dateCreated: "24/04/2022" },
    "105": { isHmo: false, dateCreated: "03/05/2022" },
  };
  const CLINIC_LANGUAGES = { AR: "Arabic", EN: "English", ES: "Spanish" };

  function clinicInfoFor(orgCode) {
    const rand = seededRandom(`clinic-${orgCode}`);
    const digits = (n) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join("");
    const seeded = {
      study: "CHF",
      isHmo: rand() < 0.5,
      phone: `05${Math.floor(rand() * 10)}-${digits(7)}`,
      lng: pickFrom(rand, Object.keys(CLINIC_LANGUAGES)),
      dateCreated: `${String(1 + Math.floor(rand() * 28)).padStart(2, "0")}/${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}/${2019 + Math.floor(rand() * 6)}`,
    };
    return { ...seeded, ...CLINIC_DIRECTORY[orgCode] };
  }

  /* Software versions the clinic user was running when they raised a clinic
     ticket -- seeded off the ticket ID so a ticket always shows the same ones. */
  const CORDIO_SYSTEM_VERSIONS = ["3.1.5", "3.2.0", "3.2.7", "3.3.0", "3.4.1"];
  const CLINIC_PORTAL_VERSIONS = ["2.4.0", "2.5.1", "2.6.0", "2.6.3", "2.7.0"];

  function renderClinicInfo() {
    const info = clinicInfoFor(ticket.organization);
    const isClinicTicket = ticket.type === "Clinic";
    document.getElementById("ticketClinicCordioField").hidden = !isClinicTicket;
    document.getElementById("ticketClinicPortalField").hidden = !isClinicTicket;
    if (isClinicTicket) {
      const rand = seededRandom(`${ticket.ticketId}-versions`);
      document.getElementById("ticketClinicCordioVersion").textContent = ticket.cordioVersion || pickFrom(rand, CORDIO_SYSTEM_VERSIONS);
      document.getElementById("ticketClinicPortalVersion").textContent = ticket.portalVersion || pickFrom(rand, CLINIC_PORTAL_VERSIONS);
    }
    document.getElementById("ticketClinicOrg").textContent = ticket.organization || "—";
    document.getElementById("ticketClinicStudy").textContent = info.study || "—";
    document.getElementById("ticketClinicHmo").textContent = info.isHmo ? "Yes" : "No";
    document.getElementById("ticketClinicPhone").textContent = info.phone || "—";
    document.getElementById("ticketClinicLanguage").textContent = CLINIC_LANGUAGES[info.lng] || info.lng || "—";
    document.getElementById("ticketClinicSince").textContent = info.dateCreated || "—";
  }

  /* ---------------- Issue ---------------- */
  function renderIssue() {
    /* Category is plain text, same as the Support list. */
    document.getElementById("ticketDetailCategory").innerHTML = ticket.category
      ? ticket.category
      : "—";
    document.getElementById("ticketDetailIssueType").textContent = ticket.issueType || "—";
    document.getElementById("ticketDetailDescription").textContent = ticket.description;
  }

  /* Recording tab (Voice Engine tickets) removed -- see file header. */

  /* ---------------- History ---------------- */
  function renderHistory() {
    document.getElementById("ticketDetailHistory").innerHTML = ticket.history
      .slice()
      .reverse()
      .map(
        (h) => `
        <div class="ticket-history-item">
          <span class="ticket-history-title">${h.title}</span>
          ${h.detail ? `<div class="ticket-history-detail">${escapeHtml(h.detail)}</div>` : ""}
          <span class="ticket-history-date">${h.date}</span>
        </div>`
      )
      .join("");
  }

  /* ---------------- Patient Log (patient-sourced tickets only) ---------------- */
  let currentPatientLog = null;

  function renderPatientLogSection(elId, rows) {
    document.getElementById(elId).innerHTML = rows
      .map((r) => `<div class="patient-log-chip"><span class="label">${r.label}</span><span class="value${r.value === "Disabled" ? " is-disabled" : ""}">${r.value}</span></div>`)
      .join("");
  }

  function renderPatientLogHistory(elId, lines) {
    document.getElementById(elId).innerHTML = lines
      .map((l) => `<div class="patient-log-line"><span class="ts">${l.ts}</span><span class="msg">${l.msg}</span></div>`)
      .join("");
  }

  /* ---------------- Log History: date-range filter ----------------
     From/To dates (a small self-contained calendar rather than native
     <input type="date">) pick which sessions the log shows. Defaults to the
     latest session's day. Download Log saves exactly what the filter shows. */
  function formatDisplayDate(d) {
    return d ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` : "—";
  }
  function sameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  let patientLogFromDate = null;
  let patientLogToDate = null;
  let patientLogCalendarField = null;
  let patientLogCalendarViewDate = new Date();

  /* Sessions whose day falls inside From..To (either end may be empty = open). */
  function patientLogSessionsInRange() {
    if (!currentPatientLog) return [];
    const from = patientLogFromDate;
    const to = patientLogToDate ? new Date(patientLogToDate.getFullYear(), patientLogToDate.getMonth(), patientLogToDate.getDate(), 23, 59, 59) : null;
    return currentPatientLog.sessions
      .filter((s) => (!from || s.dateObj >= from) && (!to || s.dateObj <= to))
      .sort((a, b) => a.dateObj - b.dateObj);
  }

  function renderPatientLogRange() {
    const el = document.getElementById("patientLogHistory");
    if (patientLogFromDate && patientLogToDate && patientLogFromDate > patientLogToDate) {
      el.innerHTML = `<div class="patient-log-empty">From date must be on or before the To date.</div>`;
      return;
    }
    const sessions = patientLogSessionsInRange();
    if (!sessions.length) {
      el.innerHTML = `<div class="patient-log-empty">No logs found for this date range.</div>`;
      return;
    }
    renderPatientLogHistory("patientLogHistory", sessions.flatMap((s) => s.lines));
  }

  function updatePatientLogDateFieldDisplay(field) {
    const date = field === "from" ? patientLogFromDate : patientLogToDate;
    document.getElementById(field === "from" ? "patientLogDownloadFromValue" : "patientLogDownloadToValue").textContent = formatDisplayDate(date);
    document.getElementById(field === "from" ? "patientLogDownloadFromField" : "patientLogDownloadToField").classList.toggle("placeholder", !date);
  }

  function renderPatientLog() {
    const section = document.getElementById("patientLog");
    if (ticket.type !== "Patient") {
      section.hidden = true;
      currentPatientLog = null;
      return;
    }
    section.hidden = false;
    currentPatientLog = buildPatientLog(ticket);
    renderPatientLogSection("patientLogAppVersion", currentPatientLog.appVersion);
    renderPatientLogSection("patientLogDeviceInfo", currentPatientLog.deviceInfo);
    renderPatientLogSection("patientLogPermissions", currentPatientLog.permissions);

    const latest = currentPatientLog.sessions.map((s) => s.dateObj).sort((a, b) => b - a)[0];
    const latestDay = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());
    patientLogFromDate = latestDay;
    patientLogToDate = latestDay;
    updatePatientLogDateFieldDisplay("from");
    updatePatientLogDateFieldDisplay("to");
    renderPatientLogRange();
  }

  const patientLogCalendarEl = document.getElementById("patientLogDownloadCalendar");

  function renderPatientLogCalendar() {
    const viewYear = patientLogCalendarViewDate.getFullYear();
    const viewMonth = patientLogCalendarViewDate.getMonth();
    document.getElementById("patientLogCalendarMonthLabel").textContent = patientLogCalendarViewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstOfMonth.getDay(); i++) cells.push({ date: new Date(viewYear, viewMonth, i - firstOfMonth.getDay() + 1), muted: true });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(viewYear, viewMonth, d), muted: false });
    while (cells.length % 7 !== 0) {
      const last = cells[cells.length - 1].date;
      cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), muted: true });
    }

    document.getElementById("patientLogCalendarDays").innerHTML = cells
      .map(({ date, muted }) => {
        const classes = ["ticket-mini-calendar-day"];
        if (muted) classes.push("muted");
        const isFrom = sameDay(date, patientLogFromDate);
        const isTo = sameDay(date, patientLogToDate);
        if (isFrom || isTo) classes.push("selected");
        else if (patientLogFromDate && patientLogToDate && date > patientLogFromDate && date < patientLogToDate) classes.push("in-range");
        if (isFrom && patientLogToDate) classes.push("range-start");
        if (isTo && patientLogFromDate) classes.push("range-end");
        return `<button type="button" class="${classes.join(" ")}" data-time="${date.getTime()}">${date.getDate()}</button>`;
      })
      .join("");
  }

  function openPatientLogCalendar(field) {
    patientLogCalendarField = field;
    const date = field === "from" ? patientLogFromDate : patientLogToDate;
    patientLogCalendarViewDate = date ? new Date(date.getFullYear(), date.getMonth(), 1) : new Date();
    document.getElementById("patientLogDownloadFromField").classList.toggle("active", field === "from");
    document.getElementById("patientLogDownloadToField").classList.toggle("active", field === "to");
    patientLogCalendarEl.hidden = false;
    renderPatientLogCalendar();
  }
  function closePatientLogCalendar() {
    patientLogCalendarField = null;
    document.getElementById("patientLogDownloadFromField").classList.remove("active");
    document.getElementById("patientLogDownloadToField").classList.remove("active");
    patientLogCalendarEl.hidden = true;
  }

  /* Every date change re-filters the log right away. */
  function setPatientLogDate(field, date) {
    if (field === "from") patientLogFromDate = date;
    else if (field === "to") patientLogToDate = date;
    updatePatientLogDateFieldDisplay(field);
    renderPatientLogRange();
  }

  document.getElementById("patientLogDownloadFromField").addEventListener("click", (e) => { e.stopPropagation(); openPatientLogCalendar("from"); });
  document.getElementById("patientLogDownloadToField").addEventListener("click", (e) => { e.stopPropagation(); openPatientLogCalendar("to"); });
  document.getElementById("patientLogCalendarPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() - 1, 1);
    renderPatientLogCalendar();
  });
  document.getElementById("patientLogCalendarNext").addEventListener("click", (e) => {
    e.stopPropagation();
    patientLogCalendarViewDate = new Date(patientLogCalendarViewDate.getFullYear(), patientLogCalendarViewDate.getMonth() + 1, 1);
    renderPatientLogCalendar();
  });
  document.getElementById("patientLogCalendarDays").addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.target.closest(".ticket-mini-calendar-day");
    if (!btn || !patientLogCalendarField) return;
    setPatientLogDate(patientLogCalendarField, new Date(Number(btn.dataset.time)));
    closePatientLogCalendar();
  });
  document.getElementById("patientLogCalendarClear").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!patientLogCalendarField) return;
    setPatientLogDate(patientLogCalendarField, null);
    renderPatientLogCalendar();
  });
  document.getElementById("patientLogCalendarToday").addEventListener("click", (e) => {
    e.stopPropagation();
    if (!patientLogCalendarField) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setPatientLogDate(patientLogCalendarField, today);
    closePatientLogCalendar();
  });
  document.addEventListener("click", (e) => {
    if (!patientLogCalendarEl.hidden && !e.target.closest(".ticket-mini-calendar") && !e.target.closest(".ticket-date-field")) closePatientLogCalendar();
  });

  /* Download Log saves the sessions the date-range filter currently shows. */
  document.getElementById("downloadPatientLogBtn").addEventListener("click", () => {
    const sessionsInRange = patientLogSessionsInRange();
    if (!currentPatientLog || !sessionsInRange.length) return;

    const section = (title, rows) => `${title}\n${rows.map((r) => `  ${r.label}: ${r.value}`).join("\n")}\n`;
    const historySection = sessionsInRange
      .map((s) => `Session ${s.date}\n${s.lines.map((l) => `  ${l.ts}: ${l.msg}`).join("\n")}\n`)
      .join("\n");
    const text = [
      `Patient Log - ${ticket.ticketId} (${ticket.who})`,
      `Date range: ${sessionsInRange[0].date} - ${sessionsInRange[sessionsInRange.length - 1].date}`,
      "",
      section("App Version", currentPatientLog.appVersion),
      section("Device Info", currentPatientLog.deviceInfo),
      section("Permissions Info", currentPatientLog.permissions),
      historySection,
    ].join("\n");

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ticket.ticketId}-patient-log.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  /* ---------------- History / Patient Log tabs ----------------
     Patient Log only exists for patient-sourced tickets, so its tab follows
     its panel's visibility. (No Recording tab in this copy.) */
  function selectDetailTab(name) {
    document.querySelectorAll(".ticket-detail-tab").forEach((t) => t.classList.toggle("active", t.dataset.tdTab === name));
    document.querySelectorAll(".ticket-detail-tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.tdPanel === name));
  }
  document.querySelectorAll(".ticket-detail-tab").forEach((tab) => tab.addEventListener("click", () => selectDetailTab(tab.dataset.tdTab)));

  function syncDetailTabs() {
    document.querySelector('.ticket-detail-tab[data-td-tab="patientLog"]').hidden = document.getElementById("patientLog").hidden;
  }

  function renderAll() {
    renderHeader();
    renderClinicInfo();
    renderIssue();
    renderPatientLog();
    renderHistory();
    syncDetailTabs();
  }
  renderAll();
}
