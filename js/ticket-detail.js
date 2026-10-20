/* ---------------- Ticket Detail page ----------------
   Full-screen deep dive for a single Ticket, laid out like backoffice1's
   ticket-detail.html: a header card (ID, Status / Priority / Level / Type,
   created/origin/organization/created-for meta line), then Clinic Info,
   Issue and a History / Patient Log / Recording tab card. View-only: clinic
   users don't handle tickets here (no Handling panel) -- status, level,
   priority and assignment are managed in the back office. Ported from
   backoffice1/js/ticket-detail.js and adapted to the clinic portal's ticket
   shape (ticketList: ticketId, type, who, patientName, severity, state,
   created "dd.mm.yyyy", ...). */

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
      badge("Priority", `<span class="ticket-pill ${severityCellClass(ticket.severity)}">${ticket.severity}</span>`),
      ticket.tier ? badge("Level", `<span class="ticket-pill ticket-pill-level">${ticket.tier}</span>`) : "",
      badge("Type", `<span class="ticket-pill ${typeCellClass(ticket.type)}">${ticket.type}</span>`),
    ].join("");

    /* Patient tickets link the patient's name through to their chart (with
       the patient ID alongside); clinic tickets were raised by a clinic user. */
    const createdFor = ticket.type === "Patient"
      ? `<a class="ticket-view-link" href="patient-data.html">${ticket.patientName || ticket.who}</a>${ticket.patientName ? ` (${ticket.who})` : ""}`
      : ticket.who;
    const sep = `<span class="ticket-detail-meta-sep">&middot;</span>`;
    document.getElementById("ticketDetailMeta").innerHTML =
      `Created ${ticket.created}${sep}Origin: ${ticket.origin}${sep}Organization: ${ticket.organization}${sep}Created For: ${createdFor}`;
    document.title = `HearO | ${ticket.ticketId}`;
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

  function renderClinicInfo() {
    const info = clinicInfoFor(ticket.organization);
    document.getElementById("ticketClinicOrg").textContent = ticket.organization || "—";
    document.getElementById("ticketClinicStudy").textContent = info.study || "—";
    document.getElementById("ticketClinicHmo").textContent = info.isHmo ? "Yes" : "No";
    document.getElementById("ticketClinicPhone").textContent = info.phone || "—";
    document.getElementById("ticketClinicLanguage").textContent = CLINIC_LANGUAGES[info.lng] || info.lng || "—";
    document.getElementById("ticketClinicSince").textContent = info.dateCreated || "—";
  }

  /* ---------------- Issue ---------------- */
  function renderIssue() {
    /* Same Category pill as the Support list. */
    document.getElementById("ticketDetailCategory").innerHTML = ticket.category
      ? `<span class="ticket-pill ticket-pill-category">${ticket.category}</span>`
      : "—";
    document.getElementById("ticketDetailIssueType").textContent = ticket.issueType || "—";
    document.getElementById("ticketDetailDescription").textContent = ticket.description;
  }

  /* ---------------- Recording (Voice Engine tickets only) ----------------
     The recording is shown as its separate parts (Part 1, Part 2, ...), each
     with its own play button, time and progress line. Part count and lengths
     are seeded off the ticket ID so the same ticket always shows the same
     parts. Only one part plays at a time. */
  const lrPlayIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4L20 12L6 20Z"/></svg>`;
  const lrPauseIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  let ticketRecordingTimer = null;

  function isRecordingIssue(t) {
    return t.category === "Voice Engine";
  }

  function formatRecordingTime(sec) {
    const s = Math.floor(sec);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }

  function stopTicketRecording() {
    clearInterval(ticketRecordingTimer);
    ticketRecordingTimer = null;
    document.querySelectorAll("#ticketDetailRecordingParts .ticket-rec-part").forEach((row) => {
      const btn = row.querySelector(".ticket-rec-play");
      btn.classList.remove("playing");
      btn.innerHTML = lrPlayIcon;
      btn.setAttribute("aria-label", "Play");
      row.dataset.elapsedMs = 0;
      row.querySelector(".ticket-rec-fill").style.width = "0%";
      row.querySelector(".ticket-rec-time").textContent = `0:00 / ${formatRecordingTime(Number(row.dataset.durationMs) / 1000)}`;
    });
  }

  function renderRecording() {
    const wrap = document.getElementById("ticketDetailRecordingWrap");
    const micAlert = document.getElementById("ticketDetailMicAlert");
    const partsEl = document.getElementById("ticketDetailRecordingParts");

    stopTicketRecording();
    micAlert.hidden = true;

    if (!isRecordingIssue(ticket)) {
      wrap.hidden = true;
      partsEl.innerHTML = "";
      return;
    }

    wrap.hidden = false;
    const rand = seededRandom(ticket.ticketId);
    const partCount = 4 + Math.floor(rand() * 3); // 4-6 parts
    partsEl.innerHTML = Array.from({ length: partCount }, (_, i) => {
      const durationSec = 2 + Math.floor(rand() * 8); // 2-9 s
      return `
        <div class="ticket-rec-part" data-duration-ms="${durationSec * 1000}" data-elapsed-ms="0">
          <button type="button" class="ticket-rec-play" aria-label="Play">${lrPlayIcon}</button>
          <span class="ticket-rec-time">0:00 / ${formatRecordingTime(durationSec)}</span>
          <div class="ticket-rec-track"><div class="ticket-rec-fill"></div></div>
          <span class="ticket-rec-label">Part ${i + 1}</span>
        </div>`;
    }).join("");

    /* Root-cause check: same seeded permissions data the Patient Log's
       App & Device Info shows -- Patient-sourced tickets only, since
       clinic-raised tickets have no patient device to check permissions on. */
    if (ticket.type === "Patient") {
      const micPermission = buildPatientLog(ticket).permissions.find((p) => p.label === "Microphone");
      micAlert.hidden = !micPermission || micPermission.value !== "Disabled";
    }
  }

  document.getElementById("ticketDetailRecordingParts").addEventListener("click", (e) => {
    const btn = e.target.closest(".ticket-rec-play");
    if (!btn) return;
    const row = btn.closest(".ticket-rec-part");
    const wasPlaying = btn.classList.contains("playing");
    const resumeFromMs = Number(row.dataset.elapsedMs) || 0;

    /* Pausing keeps this part's position; playing a part stops any other. */
    clearInterval(ticketRecordingTimer);
    if (wasPlaying) {
      btn.classList.remove("playing");
      btn.innerHTML = lrPlayIcon;
      btn.setAttribute("aria-label", "Play");
      return;
    }
    stopTicketRecording();
    row.dataset.elapsedMs = resumeFromMs;

    const durationMs = Number(row.dataset.durationMs);
    const fillEl = row.querySelector(".ticket-rec-fill");
    const timeEl = row.querySelector(".ticket-rec-time");
    btn.classList.add("playing");
    btn.innerHTML = lrPauseIcon;
    btn.setAttribute("aria-label", "Pause");

    const startedAt = Date.now() - resumeFromMs;
    ticketRecordingTimer = setInterval(() => {
      const elapsedMs = Math.min(Date.now() - startedAt, durationMs);
      row.dataset.elapsedMs = elapsedMs;
      fillEl.style.width = `${(elapsedMs / durationMs) * 100}%`;
      timeEl.textContent = `${formatRecordingTime(elapsedMs / 1000)} / ${formatRecordingTime(durationMs / 1000)}`;
      if (elapsedMs >= durationMs) stopTicketRecording();
    }, 100);
  });

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

  /* ---------------- History / Patient Log / Recording tabs ----------------
     Patient Log only exists for patient-sourced tickets and Recording only
     for Voice Engine tickets, so each tab follows its panel's visibility. */
  function selectDetailTab(name) {
    document.querySelectorAll(".ticket-detail-tab").forEach((t) => t.classList.toggle("active", t.dataset.tdTab === name));
    document.querySelectorAll(".ticket-detail-tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.tdPanel === name));
  }
  document.querySelectorAll(".ticket-detail-tab").forEach((tab) => tab.addEventListener("click", () => selectDetailTab(tab.dataset.tdTab)));

  function syncDetailTabs() {
    document.querySelector('.ticket-detail-tab[data-td-tab="patientLog"]').hidden = document.getElementById("patientLog").hidden;
    document.querySelector('.ticket-detail-tab[data-td-tab="recording"]').hidden = document.getElementById("ticketDetailRecordingWrap").hidden;
  }

  function renderAll() {
    renderHeader();
    renderClinicInfo();
    renderIssue();
    renderRecording();
    renderPatientLog();
    renderHistory();
    syncDetailTabs();
  }
  renderAll();
}
