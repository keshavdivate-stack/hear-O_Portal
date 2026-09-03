function getTicketIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  return Number.isFinite(id) ? id : null;
}

const ticket = ticketList.find((t) => t.id === getTicketIdFromUrl());
const ticketDetailBody = document.getElementById("ticketDetailBody");

if (!ticket) {
  ticketDetailBody.innerHTML = `<div class="ticket-detail-card"><h2>Ticket not found</h2><p style="color:var(--gray-text);">This ticket doesn't exist or has been removed. <a href="support.html">Back to Support</a></p></div>`;
} else {
  document.getElementById("ticketDetailTitle").textContent = ticket.ticketId;
  document.getElementById("ticketDetailPills").innerHTML = `
    <span class="ticket-pill ${typeCellClass(ticket.type)}">${ticket.type}</span>
    <span class="ticket-pill ${stateCellClass(ticket.state)}" id="ticketStatePill">${ticket.state}</span>
    <span class="ticket-pill ${severityCellClass(ticket.severity)}">${ticket.severity}</span>
  `;

  function renderBody() {
    const alreadyResolved = ticket.state === "Resolved";

    const summaryCard = `
      <div class="ticket-detail-card">
        <h2>Ticket Info</h2>
        <div class="ticket-detail-grid">
          <div class="ticket-detail-field"><label>Source</label><span>${ticket.type}</span></div>
          <div class="ticket-detail-field"><label>Status</label><span class="ticket-pill ${stateCellClass(ticket.state)}">${ticket.state}</span></div>
          <div class="ticket-detail-field"><label>Severity</label><span class="ticket-pill ${severityCellClass(ticket.severity)}">${ticket.severity}</span></div>
          <div class="ticket-detail-field"><label>Organization</label><span>${ticket.organization}</span></div>
          <div class="ticket-detail-field"><label>${ticket.type === "Patient" ? "Patient" : "Raised By"}</label><span>${
            ticket.type === "Patient"
              ? `<a class="ticket-view-link" href="patient-data.html">${ticket.patientName || ticket.who}</a>`
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

      <div class="ticket-detail-card">
        <h2>History</h2>
        <div class="ticket-history" style="margin-top:14px;">
          ${ticket.history.map((h) => `<div class="ticket-history-item"><b>${h.date}</b> — ${h.text}</div>`).join("")}
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

    if (alreadyResolved) return;

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
      document.getElementById("ticketStatePill").className = `ticket-pill ${stateCellClass(ticket.state)}`;
      document.getElementById("ticketStatePill").textContent = ticket.state;
      renderBody();
    });
  }

  renderBody();
}
