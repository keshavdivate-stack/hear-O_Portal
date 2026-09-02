/* ---------------- Shared custom-select helpers ----------------
   Equivalent to the ones support.js already defines/calls for support.html
   (Tickets/Rules) -- duplicated here (rather than shared as a single file)
   so incident-detail.html, which never loads support.js, still gets working
   dropdowns. On support.html this file only *redefines* the functions
   (identical behavior) and never calls initBoSelects() again, so the
   Tickets/Rules selects support.js already wired don't get double-bound. */
function setBoSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".bo-select-value");
  const options = Array.from(select.querySelectorAll(".bo-select-option"));
  const option = options.find((o) => o.dataset.value === value);

  options.forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionBoSelectMenu(select) {
  const trigger = select.querySelector(".bo-select-trigger");
  const menu = select.querySelector(".bo-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function resetBoSelect(select) {
  setBoSelectValue(select, "", { silent: true });
}

function closeAllBoSelects() {
  document.querySelectorAll(".bo-select.open").forEach((s) => s.classList.remove("open"));
}

function initBoSelects() {
  document.querySelectorAll(".bo-select").forEach((select) => {
    const trigger = select.querySelector(".bo-select-trigger");
    const valueEl = select.querySelector(".bo-select-value");

    valueEl.dataset.placeholder = valueEl.textContent.trim();

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !select.classList.contains("open");
      closeAllBoSelects();
      if (willOpen) positionBoSelectMenu(select);
      select.classList.toggle("open", willOpen);
    });

    select.addEventListener("click", (e) => {
      const option = e.target.closest(".bo-select-option");
      if (!option) return;
      setBoSelectValue(select, option.dataset.value);
      select.classList.remove("open");
    });
  });

  document.addEventListener("click", closeAllBoSelects);
  document.addEventListener("scroll", closeAllBoSelects, true);
  window.addEventListener("resize", closeAllBoSelects);
}

function buildSelectOptions(values) {
  return values
    .map(
      (v) => `
      <div class="bo-select-option" data-value="${v}">${v}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}

function buildFilterSelectOptions(values, clearLabel) {
  const clearOption = `
      <div class="bo-select-option" data-value="">${clearLabel}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
  return clearOption + buildSelectOptions(values);
}

/* Named distinctly from support.js's ticketKebabIcon -- both this file and
   support.js load together on support.html, and redeclaring the same
   `const` name across separate <script> tags throws a SyntaxError. */
const incKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* ---------------- Shared render helpers (used by both the Incidents tab
   inside support.html and the standalone incident-detail.html page) ---------------- */
function incSeverityPill(sev) {
  return `<span class="bo-pill ${INC_SEVERITY_CLASS[sev] || ""}">${INC_SEVERITY_LABEL[sev] || sev}</span>`;
}
function incStatusPill(status) {
  return `<span class="bo-pill ${INC_STATUS_CLASS[status] || ""}">${status}</span>`;
}
function incImpactLabel(incident) {
  return `${incident.orgs.length} orgs · ${incident.patients.length} patients`;
}

/* Escalated incidents get a Ticket created via "Escalate & Create Ticket";
   once that link exists we surface it everywhere the incident is shown so
   support staff can jump straight to the related ticket. */
function incTicketHref(relatedTicket) {
  return `ticket-detail.html?ticket=${encodeURIComponent(relatedTicket.ticketNo)}&source=${encodeURIComponent(relatedTicket.source)}`;
}
/* Icon-only (not a text label) so it sits next to the status pill without
   fighting it for width in the compact STATUS column -- the ticket number(s)
   show as a native tooltip on hover instead. */
function incRelatedTicketLink(incident) {
  const tickets = incident.relatedTickets || [];
  if (!tickets.length) return "";
  const tooltip = tickets.length > 1 ? `Related tickets: ${tickets.map((t) => t.ticketNo).join(", ")}` : `Related ticket: ${tickets[0].ticketNo}`;
  return `<a class="bo-related-ticket-link" href="${incTicketHref(tickets[0])}" title="${tooltip}" aria-label="${tooltip}">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5"/></svg>
  </a>`;
}

function incImpactChips(list) {
  return list.map((v) => `<span class="bo-impact-chip">${v}</span>`).join("");
}

/* Fixed-position popover shared by the Incidents table (Impact column) and
   the Incident Detail page's Impact card ("View Organizations"/"View Patients"). */
const incImpactPopover = (function () {
  let el = null;
  function ensure() {
    if (el) return el;
    el = document.createElement("div");
    el.className = "bo-impact-popover";
    el.id = "incidentImpactPopover";
    document.body.appendChild(el);
    document.addEventListener("click", (e) => {
      if (el && !el.contains(e.target) && !e.target.closest("[data-impact-trigger]")) el.classList.remove("open");
    });
    document.addEventListener("scroll", () => el && el.classList.remove("open"), true);
    return el;
  }
  function open(anchorEl, incident, mode) {
    const popover = ensure();
    const showOrgs = mode !== "patients";
    const showPatients = mode !== "orgs";
    popover.innerHTML = `
      ${showOrgs ? `
      <p class="bo-impact-popover-title">Affected Organizations</p>
      <div class="bo-impact-chip-list">${incImpactChips(incident.orgs)}</div>` : ""}
      ${showPatients ? `
      <p class="bo-impact-popover-title${showOrgs ? " second" : ""}">Affected Patients</p>
      <div class="bo-impact-chip-list">${incImpactChips(incident.patients)}</div>` : ""}
    `;
    const rect = anchorEl.getBoundingClientRect();
    const width = 280;
    let left = rect.left;
    if (left + width > window.innerWidth - 12) left = window.innerWidth - width - 12;
    popover.style.left = `${left}px`;
    popover.style.top = `${rect.bottom + 6}px`;
    popover.classList.add("open");
  }
  function close() {
    if (el) el.classList.remove("open");
  }
  return { open, close };
})();
