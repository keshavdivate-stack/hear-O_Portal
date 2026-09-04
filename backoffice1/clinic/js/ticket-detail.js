/* Backoffice-safe fork of ../../js/ticket-detail.js. Why forked instead of
   shared: this file renders the Recording player (an actual patient voice
   recording -- clinical PHI) and a Chat-with-Patient panel (patient-authored
   conversation content), and shows the ticket's real patient name. Changes
   from the root file:
   - recordingMarkup()/wireRecording() and every reference to them are
     removed -- Voice Engine tickets now show Issue + Handling + Patient Log
     + History + Resolution with no Recording section at all.
   - The Patient field always shows `ticket.who` (already an anonymous
     per-org patient identifier, e.g. "121-2010") instead of
     `ticket.patientName || ticket.who` -- there is no patientName field on
     this backoffice copy's ticketList (see js/support-data.js) to fall back
     from.
   - The entire Chat-with-Patient block (chatMessages seed data, panel
     open/close, send/attachment wiring) is removed -- its markup is already
     gone from ticket-detail.html.
   Handling, Patient Log (device/app-version/permissions/session-log
   history -- all operational, no clinical content), and History are
   unchanged, and still call into the unmodified, reused
   js/support-tickets-common.js. */

function getTicketIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isFinite(id) ? id : null;
}

const ticket = ticketList.find((t) => t.id === getTicketIdFromUrl());
const ticketDetailBody = document.getElementById("ticketDetailBody");
const ticketDetailActions = document.getElementById("ticketDetailActions");
const saveTicketDetailBtn = document.getElementById("saveTicketDetailBtn");

if (!ticket) {
  ticketDetailBody.innerHTML = `<div class="ticket-detail-card"><h2>Ticket not found</h2><p style="color:var(--gray-text);">This ticket doesn't exist or has been removed. <a href="support.html">Back to Support</a></p></div>`;
} else {
  ensureTicketHistory(ticket);
  deriveDefaultTier(ticket);
  ticketDetailActions.hidden = false;

  function renderHeader() {
    document.getElementById("ticketDetailTitle").textContent = ticket.ticketId;
    document.getElementById("ticketDetailPills").innerHTML = `
      <span class="ticket-pill ${typeCellClass(ticket.type)}">${ticket.type}</span>
      <span class="ticket-pill ${stateCellClass(ticket.state)}">${ticket.state}</span>
      <span class="ticket-pill ${severityCellClass(ticket.severity)}">${ticket.severity}</span>
    `;
    document.title = `HearO | ${ticket.ticketId}`;
  }

  /* Recording player (Voice Engine tickets) removed entirely -- see file
     header comment. recordingMarkup()/wireRecording() no longer exist;
     renderBody()/renderAll() below call neither. */

  /* ---------------- Handling form ---------------- */
  function populateTicketDetailAssignees(tier) {
    const menu = document.querySelector('.custom-select[data-name="ticketAssignedTo"] .custom-select-menu');
    menu.innerHTML = buildAgentSelectOptions(TIER_AGENTS[tier] || SUPPORT_TEAM_MEMBERS);
  }

  function defaultAssigneeForTier(tier) {
    return (TIER_AGENTS[tier] || SUPPORT_TEAM_MEMBERS)[0] || "";
  }

  function applyTicketDetailStatusVisibility(status) {
    const resolved = status === "Resolved";
    document.getElementById("ticketDetailLevelField").hidden = resolved;
    document.getElementById("ticketDetailSeverityField").hidden = resolved;
    document.getElementById("ticketDetailAssignedToField").hidden = resolved;
    const tier = document.querySelector('.custom-select[data-name="ticketLevel"] input[type=hidden]').value;
    document.getElementById("ticketDetailOrgField").hidden = resolved || tier !== "Level 3";
  }

  function updateAssignedOrgNote(orgName) {
    const note = document.getElementById("ticketDetailAssignedOrgNote");
    note.textContent = orgName ? `Organization: ${orgName}` : "";
    note.hidden = !orgName;
  }

  function validateTicketDetailForm() {
    const status = document.querySelector('.custom-select[data-name="ticketStatus"] input[type=hidden]').value;
    applyTicketDetailStatusVisibility(status);
    const orgFieldVisible = !document.getElementById("ticketDetailOrgField").hidden;
    const orgFilled = !orgFieldVisible || document.querySelector('.custom-select[data-name="ticketOrgHandling"] input[type=hidden]').value !== "";
    const assigneeFilled = status === "Resolved" || document.querySelector('.custom-select[data-name="ticketAssignedTo"] input[type=hidden]').value !== "";
    saveTicketDetailBtn.disabled = !assigneeFilled || !orgFilled;
    saveTicketDetailBtn.classList.toggle("enabled", !saveTicketDetailBtn.disabled);
  }

  function handlingMarkup() {
    return `
      <div class="ticket-detail-card">
        <h2>Handling</h2>
        <form id="ticketDetailForm">
          <div class="ticket-handling-row">
            <div class="form-field" style="margin-bottom:0;">
              <label>Status</label>
              <div class="custom-select" data-name="ticketStatus">
                <button type="button" class="custom-select-trigger">
                  <span class="custom-select-value placeholder">Select status</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
            </div>
            <div class="form-field" style="margin-bottom:0;" id="ticketDetailLevelField">
              <label>Level</label>
              <div class="custom-select" data-name="ticketLevel">
                <button type="button" class="custom-select-trigger">
                  <span class="custom-select-value placeholder">Select level</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
            </div>
            <div class="form-field" style="margin-bottom:0;" id="ticketDetailSeverityField">
              <label>Severity</label>
              <div class="custom-select" data-name="ticketSeverityHandling">
                <button type="button" class="custom-select-trigger">
                  <span class="custom-select-value placeholder">Select severity</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
            </div>
            <div class="form-field" style="margin-bottom:0;" id="ticketDetailOrgField" hidden>
              <label>Organization<span class="required-star">*</span></label>
              <div class="custom-select" data-name="ticketOrgHandling">
                <button type="button" class="custom-select-trigger">
                  <span class="custom-select-value placeholder">Select organization</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
            </div>
            <div class="form-field" style="margin-bottom:0;" id="ticketDetailAssignedToField">
              <label>Assigned To<span class="required-star">*</span></label>
              <div class="custom-select" data-name="ticketAssignedTo">
                <button type="button" class="custom-select-trigger">
                  <span class="custom-select-value placeholder">Select team member</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
              <div class="ticket-assigned-org-note" id="ticketDetailAssignedOrgNote" hidden></div>
            </div>
          </div>
          <div class="form-field" style="margin-top:16px; margin-bottom:0;">
            <label>Description</label>
            <textarea id="ticketDetailRootCause" placeholder="What caused this issue? (optional)"></textarea>
          </div>
        </form>
      </div>`;
  }

  function wireHandling() {
    document.querySelector('.custom-select[data-name="ticketStatus"] .custom-select-menu').innerHTML = buildCustomSelectOptions(ticketStates.map((s) => s.label));
    document.querySelector('.custom-select[data-name="ticketLevel"] .custom-select-menu').innerHTML = buildCustomSelectOptions(ticketLevels.map((l) => l.label));
    document.querySelector('.custom-select[data-name="ticketSeverityHandling"] .custom-select-menu').innerHTML = buildCustomSelectOptions(ticketSeverities.map((s) => s.label));
    document.querySelector('.custom-select[data-name="ticketOrgHandling"] .custom-select-menu').innerHTML = buildCustomSelectOptions(TICKET_ORG_CODES);

    initCustomSelects();

    document.getElementById("ticketDetailRootCause").value = ticket.rootCause || "";
    setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketStatus"]'), ticket.state, { silent: true });
    setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketLevel"]'), ticket.tier, { silent: true });
    setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketSeverityHandling"]'), ticket.severity, { silent: true });

    populateTicketDetailAssignees(ticket.tier);
    const tierAgents = TIER_AGENTS[ticket.tier] || SUPPORT_TEAM_MEMBERS;
    const assignee = tierAgents.includes(ticket.assignedTo) ? ticket.assignedTo : defaultAssigneeForTier(ticket.tier);
    setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketAssignedTo"]'), assignee, { silent: true });

    if (ticket.tier === "Level 3") {
      setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketOrgHandling"]'), ticket.organization, { silent: true });
      updateAssignedOrgNote(ticket.organization);
    } else {
      updateAssignedOrgNote("");
    }
    validateTicketDetailForm();

    document.querySelector('.custom-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
      const tier = e.target.value;
      populateTicketDetailAssignees(tier);
      setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketAssignedTo"]'), defaultAssigneeForTier(tier), { silent: true });
      if (tier === "Level 3") {
        setCustomSelectValue(document.querySelector('.custom-select[data-name="ticketOrgHandling"]'), ticket.organization, { silent: true });
        updateAssignedOrgNote(ticket.organization);
      } else {
        resetCustomSelect(document.querySelector('.custom-select[data-name="ticketOrgHandling"]'));
        updateAssignedOrgNote("");
      }
      validateTicketDetailForm();
    });

    document.querySelector('.custom-select[data-name="ticketOrgHandling"] input[type=hidden]').addEventListener("change", (e) => {
      updateAssignedOrgNote(e.target.value);
      validateTicketDetailForm();
    });

    const form = document.getElementById("ticketDetailForm");
    form.addEventListener("input", validateTicketDetailForm);
    form.addEventListener("change", validateTicketDetailForm);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (saveTicketDetailBtn.disabled) return;

      const changeDate = new Date().toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).replace(",", "");

      const rootCause = document.getElementById("ticketDetailRootCause").value.trim();
      const nextAssignee = document.querySelector('.custom-select[data-name="ticketAssignedTo"] input[type=hidden]').value;
      const nextTier = document.querySelector('.custom-select[data-name="ticketLevel"] input[type=hidden]').value || ticket.tier;
      const nextSeverity = document.querySelector('.custom-select[data-name="ticketSeverityHandling"] input[type=hidden]').value || ticket.severity;
      const nextStatus = document.querySelector('.custom-select[data-name="ticketStatus"] input[type=hidden]').value || ticket.state;

      if (rootCause !== (ticket.rootCause || "")) ticket.history.push({ date: changeDate, text: `Root cause recorded: ${rootCause}` });
      if (nextAssignee && nextAssignee !== (ticket.assignedTo || "")) ticket.history.push({ date: changeDate, text: `Reassigned from ${ticket.assignedTo || "Unassigned"} to ${nextAssignee}.` });
      if (nextTier !== ticket.tier) ticket.history.push({ date: changeDate, text: `Level changed from ${ticket.tier} to ${nextTier}.` });
      if (nextSeverity !== ticket.severity) ticket.history.push({ date: changeDate, text: `Severity changed from ${ticket.severity} to ${nextSeverity}.` });
      if (nextStatus !== ticket.state) ticket.history.push({ date: changeDate, text: `Status changed from ${ticket.state} to ${nextStatus}.` });

      ticket.rootCause = rootCause;
      if (nextAssignee) ticket.assignedTo = nextAssignee;
      ticket.tier = nextTier;
      ticket.severity = nextSeverity;
      ticket.state = nextStatus;

      renderAll();
    });
  }

  /* ---------------- Patient Log (patient-sourced tickets only) ---------------- */
  let currentPatientLog = null;
  let currentPatientLogSessionId = null;
  let patientLogFromDate = null;
  let patientLogToDate = null;
  let patientLogCalendarField = null;
  let patientLogCalendarViewDate = new Date();

  function currentPatientLogSession() {
    return currentPatientLog && currentPatientLog.sessions.find((s) => s.id === currentPatientLogSessionId);
  }

  function patientLogMarkup() {
    if (ticket.type !== "Patient") return "";
    return `
      <div class="ticket-detail-card" id="patientLog">
        <h2>Patient Log</h2>
        <div class="patient-log-snapshot">
          <div class="patient-log-snapshot-group">
            <div class="ticket-detail-section-title">App Version</div>
            <div class="patient-log-chip-row" id="patientLogAppVersion"></div>
          </div>
          <div class="patient-log-snapshot-group">
            <div class="ticket-detail-section-title">Device Info</div>
            <div class="patient-log-chip-row" id="patientLogDeviceInfo"></div>
          </div>
          <div class="patient-log-snapshot-group">
            <div class="ticket-detail-section-title">Permissions Info</div>
            <div class="patient-log-chip-row" id="patientLogPermissions"></div>
          </div>
        </div>
        <div class="patient-log-history">
          <div class="ticket-detail-section-title patient-log-history-title">
            Log History
            <div class="patient-log-history-actions">
              <div class="custom-select" id="patientLogSessionSelect" data-name="patientLogSession">
                <button type="button" class="custom-select-trigger" aria-label="Log session">
                  <span class="custom-select-value placeholder">Select session</span>
                  <svg class="custom-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div class="custom-select-menu"></div>
                <input type="hidden" />
              </div>
              <div class="patient-log-download-wrap">
                <button type="button" class="btn-secondary" id="downloadPatientLogBtn">Download Log</button>
                <div class="patient-log-download-popover" id="patientLogDownloadPopover" hidden>
                  <p class="patient-log-download-popover-title">Download logs for date range</p>
                  <div class="patient-log-download-popover-row">
                    <button type="button" class="ticket-date-field" id="patientLogDownloadFromField" data-field="from" aria-label="From date">
                      <span id="patientLogDownloadFromValue" class="ticket-date-field-value">&mdash;</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9H21" stroke="currentColor" stroke-width="1.8"/></svg>
                    </button>
                    <button type="button" class="ticket-date-field" id="patientLogDownloadToField" data-field="to" aria-label="To date">
                      <span id="patientLogDownloadToValue" class="ticket-date-field-value">&mdash;</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" stroke-width="1.8"/><path d="M3 9H21" stroke="currentColor" stroke-width="1.8"/></svg>
                    </button>
                  </div>
                  <div class="ticket-mini-calendar" id="patientLogDownloadCalendar" hidden>
                    <div class="ticket-mini-calendar-head">
                      <span class="ticket-mini-calendar-month" id="patientLogCalendarMonthLabel">&mdash;</span>
                      <div class="ticket-mini-calendar-nav">
                        <button type="button" id="patientLogCalendarPrev" aria-label="Previous month">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <button type="button" id="patientLogCalendarNext" aria-label="Next month">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                    <div class="ticket-mini-calendar-weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
                    <div class="ticket-mini-calendar-days" id="patientLogCalendarDays"></div>
                    <div class="ticket-mini-calendar-footer">
                      <button type="button" id="patientLogCalendarClear">Clear</button>
                      <button type="button" id="patientLogCalendarToday">Today</button>
                    </div>
                  </div>
                  <p class="patient-log-download-popover-hint" id="patientLogDownloadHint"></p>
                  <div class="patient-log-download-popover-actions">
                    <button type="button" class="btn-secondary" id="patientLogDownloadCancel">Cancel</button>
                    <button type="button" class="btn-save enabled" id="patientLogDownloadConfirm">Download</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="patient-log-console" id="patientLogHistory"></div>
        </div>
      </div>`;
  }

  function renderPatientLogSection(elId, rows) {
    document.getElementById(elId).innerHTML = rows
      .map((r) => `<div class="patient-log-chip"><span class="label">${r.label}</span><span class="value">${r.value}</span></div>`)
      .join("");
  }

  function renderPatientLogHistory(elId, lines) {
    document.getElementById(elId).innerHTML = lines
      .map((l) => `<div class="patient-log-line"><span class="ts">${l.ts}</span><span class="msg">${l.msg}</span></div>`)
      .join("");
  }

  function formatDisplayDate(d) {
    return d ? `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}` : "—";
  }
  function sameDay(a, b) {
    return !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function updatePatientLogDateFieldDisplay(field) {
    const date = field === "from" ? patientLogFromDate : patientLogToDate;
    document.getElementById(field === "from" ? "patientLogDownloadFromValue" : "patientLogDownloadToValue").textContent = formatDisplayDate(date);
    document.getElementById(field === "from" ? "patientLogDownloadFromField" : "patientLogDownloadToField").classList.toggle("placeholder", !date);
  }

  function renderPatientLogCalendar() {
    const calendarEl = document.getElementById("patientLogDownloadCalendar");
    if (!calendarEl) return;
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
    document.getElementById("patientLogDownloadCalendar").hidden = false;
    renderPatientLogCalendar();
  }
  function closePatientLogCalendar() {
    patientLogCalendarField = null;
    const fromField = document.getElementById("patientLogDownloadFromField");
    const toField = document.getElementById("patientLogDownloadToField");
    if (fromField) fromField.classList.remove("active");
    if (toField) toField.classList.remove("active");
    const cal = document.getElementById("patientLogDownloadCalendar");
    if (cal) cal.hidden = true;
  }

  function openPatientLogDownloadPopover() {
    document.getElementById("patientLogDownloadHint").textContent = "";
    document.getElementById("patientLogDownloadPopover").hidden = false;
  }
  function closePatientLogDownloadPopover() {
    const pop = document.getElementById("patientLogDownloadPopover");
    if (pop) pop.hidden = true;
    closePatientLogCalendar();
  }

  function wirePatientLog() {
    if (ticket.type !== "Patient") return;

    currentPatientLog = buildPatientLog(ticket);
    renderPatientLogSection("patientLogAppVersion", currentPatientLog.appVersion);
    renderPatientLogSection("patientLogDeviceInfo", currentPatientLog.deviceInfo);
    renderPatientLogSection("patientLogPermissions", currentPatientLog.permissions);

    const sessionSelect = document.getElementById("patientLogSessionSelect");
    sessionSelect.querySelector(".custom-select-menu").innerHTML = currentPatientLog.sessions
      .map(
        (s, i) => `
        <div class="custom-select-option" data-value="${s.id}">${s.date}${i === 0 ? " (latest)" : ""}
          <svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>`
      )
      .join("");

    initCustomSelects();

    currentPatientLogSessionId = currentPatientLog.sessions[0].id;
    setCustomSelectValue(sessionSelect, currentPatientLogSessionId, { silent: true });
    renderPatientLogHistory("patientLogHistory", currentPatientLogSession().lines);

    sessionSelect.querySelector('input[type=hidden]').addEventListener("change", (e) => {
      currentPatientLogSessionId = e.target.value;
      const session = currentPatientLogSession();
      if (session) renderPatientLogHistory("patientLogHistory", session.lines);
    });

    const sessionDates = currentPatientLog.sessions.map((s) => s.dateObj).sort((a, b) => a - b);
    patientLogFromDate = sessionDates[0];
    patientLogToDate = sessionDates[sessionDates.length - 1];
    updatePatientLogDateFieldDisplay("from");
    updatePatientLogDateFieldDisplay("to");

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
      const picked = new Date(Number(btn.dataset.time));
      if (patientLogCalendarField === "from") patientLogFromDate = picked;
      else patientLogToDate = picked;
      updatePatientLogDateFieldDisplay(patientLogCalendarField);
      closePatientLogCalendar();
    });
    document.getElementById("patientLogCalendarClear").addEventListener("click", (e) => {
      e.stopPropagation();
      if (patientLogCalendarField === "from") patientLogFromDate = null;
      else if (patientLogCalendarField === "to") patientLogToDate = null;
      updatePatientLogDateFieldDisplay(patientLogCalendarField);
      renderPatientLogCalendar();
    });
    document.getElementById("patientLogCalendarToday").addEventListener("click", (e) => {
      e.stopPropagation();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (patientLogCalendarField === "from") patientLogFromDate = today;
      else if (patientLogCalendarField === "to") patientLogToDate = today;
      updatePatientLogDateFieldDisplay(patientLogCalendarField);
      closePatientLogCalendar();
    });

    document.getElementById("downloadPatientLogBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      if (!currentPatientLog) return;
      const pop = document.getElementById("patientLogDownloadPopover");
      if (pop.hidden) openPatientLogDownloadPopover();
      else closePatientLogDownloadPopover();
    });
    document.getElementById("patientLogDownloadCancel").addEventListener("click", closePatientLogDownloadPopover);

    document.getElementById("patientLogDownloadConfirm").addEventListener("click", () => {
      if (!currentPatientLog) return;
      const hint = document.getElementById("patientLogDownloadHint");
      if (!patientLogFromDate || !patientLogToDate) {
        hint.textContent = "Pick both a from and to date.";
        return;
      }
      const from = patientLogFromDate;
      const to = patientLogToDate;
      if (from > to) {
        hint.textContent = "From date must be before the to date.";
        return;
      }

      const sessionsInRange = currentPatientLog.sessions
        .filter((s) => s.dateObj >= from && s.dateObj <= to)
        .sort((a, b) => a.dateObj - b.dateObj);
      if (!sessionsInRange.length) {
        hint.textContent = "No sessions found in that date range.";
        return;
      }

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
      closePatientLogDownloadPopover();
    });

    document.addEventListener("click", (e) => {
      const pop = document.getElementById("patientLogDownloadPopover");
      const cal = document.getElementById("patientLogDownloadCalendar");
      if (pop && !pop.hidden && !e.target.closest(".patient-log-download-wrap")) closePatientLogDownloadPopover();
      else if (cal && !cal.hidden && !e.target.closest(".ticket-mini-calendar") && !e.target.closest(".ticket-date-field")) closePatientLogCalendar();
    });
  }

  /* ---------------- Full body render ---------------- */
  function renderBody() {
    const alreadyResolved = ticket.state === "Resolved";

    const summaryCard = `
      <div class="ticket-detail-card">
        <h2>Ticket Info</h2>
        <div class="ticket-detail-grid">
          <div class="ticket-detail-field"><label>Source</label><span>${ticket.type}</span></div>
          <div class="ticket-detail-field"><label>Status</label><span class="ticket-pill ${stateCellClass(ticket.state)}">${ticket.state}</span></div>
          <div class="ticket-detail-field"><label>Severity</label><span class="ticket-pill ${severityCellClass(ticket.severity)}">${ticket.severity}</span></div>
          <div class="ticket-detail-field"><label>${ticket.type === "Patient" ? "Patient" : "Raised By"}</label><span>${
            ticket.type === "Patient"
              ? `<a class="ticket-view-link" href="patient-data.html">${ticket.who}</a>`
              : ticket.who
          }</span></div>
          <div class="ticket-detail-field"><label>Origin</label><span>${ticket.origin}</span></div>
          <div class="ticket-detail-field"><label>Scope</label><span>${ticket.scope}</span></div>
          <div class="ticket-detail-field"><label>Assigned To</label><span>${ticket.assignedTo}</span></div>
          <div class="ticket-detail-field"><label>Created</label><span>${ticket.created}</span></div>
        </div>
      </div>

      <div class="ticket-detail-card">
        <h2>Issue</h2>
        <div class="ticket-detail-grid" style="grid-template-columns: 1fr 1fr;">
          <div class="ticket-detail-field"><label>Category</label><span>${ticket.category}</span></div>
          <div class="ticket-detail-field"><label>Issue Type</label><span>${ticket.issueType}</span></div>
        </div>
        <div class="ticket-detail-description">${ticket.description}</div>
      </div>

      ${handlingMarkup()}

      ${patientLogMarkup()}

      <div class="ticket-detail-card">
        <h2>History</h2>
        <div class="ticket-history" style="margin-top:14px;">
          ${ticket.history.map((h) => `<div class="ticket-history-item"><b>${h.date}</b> &mdash; ${h.text}</div>`).join("")}
        </div>
      </div>`;

    ticketDetailBody.innerHTML = `
      ${summaryCard}

      <div class="ticket-detail-card">
        <h2>Resolution</h2>
        <div class="form-field" style="margin-top:14px;">
          <label>Resolution note${alreadyResolved ? "" : '<span class="required-star">*</span>'}</label>
          <textarea id="ticketResolutionNote" ${alreadyResolved ? "disabled" : ""} placeholder="${alreadyResolved ? "This ticket is already resolved." : "Describe how this ticket was resolved"}"></textarea>
        </div>
        <div class="modal-actions" style="padding-top:0; border-top:none;">
          <button type="button" class="btn-save" id="resolveTicketBtn" disabled>${alreadyResolved ? "Already resolved" : "Resolve ticket"}</button>
        </div>
      </div>
    `;

    wireHandling();
    wirePatientLog();

    if (!alreadyResolved) {
      const note = document.getElementById("ticketResolutionNote");
      const resolveBtn = document.getElementById("resolveTicketBtn");

      note.addEventListener("input", () => {
        const canResolve = note.value.trim().length > 0;
        resolveBtn.disabled = !canResolve;
        resolveBtn.classList.toggle("enabled", canResolve);
      });

      resolveBtn.addEventListener("click", () => {
        const text = note.value.trim();
        if (!text || resolveBtn.disabled) return;
        ticket.state = "Resolved";
        ticket.history.push({ date: "Today", text: `Resolved: ${text}` });
        renderAll();
      });
    }
  }

  function renderAll() {
    renderHeader();
    renderBody();
  }
  renderAll();

  /* Chat-with-Patient panel removed entirely -- see file header comment.
     Its markup is already gone from ticket-detail.html, so there is nothing
     left here to wire up. */
}
