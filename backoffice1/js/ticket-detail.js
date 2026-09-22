/* ---------------- Ticket Detail: Handling card ----------------
   This file previously had no content at all, so the Edit button under
   "Handling" had nothing wired to it and never opened the popup. This adds
   just the Handling section: populating its Status/Level/Priority/
   Organization/Assigned To dropdowns and wiring Edit to move the form into
   the modal (per the HTML's own comment: "the Handling form above is moved
   in here while editing ... and moved back on close").
   Ticket Info / Issue / Patient Log / History still need their own
   population logic -- out of scope for this fix. */

const ticketStates = ["Open", "In Progress", "Escalated", "Resolved"];
const ticketLevels = ["Level 1", "Level 2", "Level 3"];
const ticketPriorities = ["Low", "Medium", "High", "Critical"];
const TICKET_ORG_CODES = (typeof orgs !== "undefined" ? orgs : []).map((o) => o.name);

function defaultAssigneeForTier(tier) {
  const names = TIER_AGENTS[tier] || SUPPORT_AGENTS;
  return names[0];
}

function populateTicketDetailAssignees(tier) {
  const names = TIER_AGENTS[tier] || SUPPORT_AGENTS;
  document.querySelector('.bo-select[data-name="ticketAssignedTo"] .bo-select-menu').innerHTML = buildAgentSelectOptions(names);
}

function updateTicketOrgFieldVisibility(tier) {
  const orgField = document.getElementById("ticketDetailOrgField");
  const orgSelect = orgField.querySelector(".bo-select");
  orgField.hidden = tier !== "Level 3";
  if (tier !== "Level 3") resetBoSelect(orgSelect);
}

function wireTicketHandling() {
  const form = document.getElementById("ticketDetailForm");
  const inlineSlot = document.getElementById("ticketHandlingInlineSlot");
  const modalSlot = document.getElementById("ticketHandlingModalSlot");
  const overlay = document.getElementById("ticketHandlingOverlay");
  const editBtn = document.getElementById("editTicketHandlingBtn");
  const closeX = document.getElementById("closeTicketHandlingX");
  const cancelBtn = document.getElementById("cancelTicketHandling");
  const saveBtn = document.getElementById("saveTicketDetail");
  if (!form || !overlay || !editBtn) return;

  document.querySelector('.bo-select[data-name="ticketStatus"] .bo-select-menu').innerHTML = buildSelectOptions(ticketStates);
  document.querySelector('.bo-select[data-name="ticketLevel"] .bo-select-menu').innerHTML = buildSelectOptions(ticketLevels);
  document.querySelector('.bo-select[data-name="ticketPriorityHandling"] .bo-select-menu').innerHTML = buildSelectOptions(ticketPriorities);
  document.querySelector('.bo-select[data-name="ticketOrgHandling"] .bo-select-menu').innerHTML = buildSelectOptions(TICKET_ORG_CODES);
  populateTicketDetailAssignees("Level 1");

  initBoSelects();

  function validateForm() {
    const requiredSelects = [document.querySelector('.bo-select[data-name="ticketAssignedTo"]')];
    const orgField = document.getElementById("ticketDetailOrgField");
    if (!orgField.hidden) requiredSelects.push(orgField.querySelector(".bo-select"));
    const valid = requiredSelects.every((s) => s.querySelector("input[type=hidden]").value);
    if (saveBtn) saveBtn.disabled = !valid;
  }

  document.querySelector('.bo-select[data-name="ticketLevel"] input[type=hidden]').addEventListener("change", (e) => {
    const tier = e.target.value;
    populateTicketDetailAssignees(tier);
    setBoSelectValue(document.querySelector('.bo-select[data-name="ticketAssignedTo"]'), defaultAssigneeForTier(tier), { silent: true });
    updateTicketOrgFieldVisibility(tier);
    validateForm();
  });
  document.querySelector('.bo-select[data-name="ticketOrgHandling"] input[type=hidden]').addEventListener("change", validateForm);
  document.querySelector('.bo-select[data-name="ticketAssignedTo"] input[type=hidden]').addEventListener("change", validateForm);

  function setFormDisabled(disabled) {
    form.querySelectorAll(".bo-select-trigger, textarea").forEach((el) => { el.disabled = disabled; });
  }

  function openHandlingModal() {
    form.classList.remove("is-readonly");
    setFormDisabled(false);
    modalSlot.appendChild(form);
    overlay.classList.add("open");
    validateForm();
  }
  function closeHandlingModal() {
    form.classList.add("is-readonly");
    setFormDisabled(true);
    inlineSlot.appendChild(form);
    overlay.classList.remove("open");
  }

  setFormDisabled(true);

  editBtn.addEventListener("click", openHandlingModal);
  if (closeX) closeX.addEventListener("click", closeHandlingModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeHandlingModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeHandlingModal(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    closeHandlingModal();
  });
}

wireTicketHandling();
