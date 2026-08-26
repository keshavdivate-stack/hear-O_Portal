/* Current logged-in clinician (matches the "EC" topbar avatar) -- tickets
   assigned to this person are what "Support" shows by default. */
const CURRENT_ASSIGNEE = "Emily Carter";

const ticketCategories = [
  { key: "Compliance", label: "Compliance" },
  { key: "Voice Engine", label: "Voice Engine" },
  { key: "Sensors", label: "Sensors" },
  { key: "Patient App", label: "Patient App" },
  { key: "Clinic User Security", label: "Clinic User Security" },
  { key: "Scheduling Engine", label: "Scheduling Engine" },
];

const issueTypesByCategory = {
  "Compliance": ["Non-compliance Alert", "Compliance Score Mismatch"],
  "Voice Engine": ["Missing ASR Results", "Recording Failed to Process"],
  "Sensors": ["Sensor Data Gap", "Device Sync Failure"],
  "Patient App": ["Paused Too Long", "Stuck In Baseline", "App Crash On Login"],
  "Clinic User Security": ["Suspicious Login Attempt", "MFA Reset Request"],
  "Scheduling Engine": ["Missing Run: Start Date Engine", "Schedule Conflict"],
};

const ticketOrigins = [
  { key: "System Generated", label: "System Generated" },
  { key: "User Created", label: "User Created" },
];

const ticketSeverities = [
  { key: "Critical", label: "Critical" },
  { key: "High", label: "High" },
  { key: "Medium", label: "Medium" },
  { key: "Low", label: "Low" },
];

const ticketStates = [
  { key: "Open", label: "Open" },
  { key: "In Progress", label: "In Progress" },
  { key: "Escalated", label: "Escalated" },
  { key: "Resolved", label: "Resolved" },
];

const ticketTypes = [
  { key: "Patient", label: "Patient" },
  { key: "Clinic", label: "Clinic" },
];

function issueType(category, index) {
  return issueTypesByCategory[category][index % issueTypesByCategory[category].length];
}

const ticketList = [
  { ticketId: "TCK-1050", organization: "121", type: "Patient", who: "121-2010", category: "Voice Engine", issueType: issueType("Voice Engine", 0), origin: "System Generated", severity: "Critical", state: "Open", assignedTo: "Emily Carter", created: "18.08.2028", description: "The voice engine failed to return ASR results for the patient's daily recording. No transcript was generated for the last 3 sessions." },
  { ticketId: "TCK-1207", organization: "B03", type: "Patient", who: "B03-5107", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "System Generated", severity: "Critical", state: "In Progress", assignedTo: "Emily Carter", created: "17.08.2028", description: "Scheduled recording run did not trigger for the patient's start date. Baseline window is at risk of expiring." },
  { ticketId: "TCK-1315", organization: "ATP", type: "Patient", who: "ATP-5215", category: "Patient App", issueType: issueType("Patient App", 0), origin: "System Generated", severity: "Critical", state: "Resolved", assignedTo: "Emily Carter", created: "12.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-1339", organization: "ATP", type: "Patient", who: "ATP-5239", category: "Patient App", issueType: issueType("Patient App", 1), origin: "System Generated", severity: "Critical", state: "Open", assignedTo: "Emily Carter", created: "20.08.2028", description: "Patient onboarding is stuck in baseline collection with no valid recordings for 6 days." },
  { ticketId: "TCK-1401", organization: "B01", type: "Patient", who: "B01-3312", category: "Compliance", issueType: issueType("Compliance", 0), origin: "System Generated", severity: "Medium", state: "Escalated", assignedTo: "Emily Carter", created: "19.08.2028", description: "Patient compliance score dropped below the configured threshold for two consecutive weeks." },
  { ticketId: "TCK-1422", organization: "B01", type: "Clinic", who: "Ariel Fox", category: "Clinic User Security", issueType: issueType("Clinic User Security", 0), origin: "System Generated", severity: "High", state: "Open", assignedTo: "Emily Carter", created: "21.08.2028", description: "Multiple failed login attempts detected for a clinic user account outside of normal usage hours." },
  { ticketId: "TCK-1478", organization: "105", type: "Patient", who: "105-4471", category: "Sensors", issueType: issueType("Sensors", 0), origin: "System Generated", severity: "Low", state: "In Progress", assignedTo: "Emily Carter", created: "16.08.2028", description: "No sensor readings received from the patient's connected device for the past 24 hours." },
  { ticketId: "TCK-1502", organization: "B01", type: "Clinic", who: "Dr. Sarah Mitchell", category: "Clinic User Security", issueType: issueType("Clinic User Security", 1), origin: "User Created", severity: "Medium", state: "Resolved", assignedTo: "Emily Carter", created: "10.08.2028", description: "Clinic user requested an MFA reset after losing access to their authenticator app." },
  { ticketId: "TCK-1231", organization: "B03", type: "Patient", who: "B03-5131", category: "Patient App", issueType: issueType("Patient App", 0), origin: "System Generated", severity: "Critical", state: "In Progress", assignedTo: "Daniel Roy", created: "18.08.2028", description: "Patient app remained paused beyond the expected threshold, blocking new recordings." },
  { ticketId: "TCK-2207", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "User Created", severity: "Critical", state: "In Progress", assignedTo: "Maya Cohen", created: "17.08.2028", description: "Clinic reported the scheduling engine did not start the patient's monitoring run on the agreed date." },
  { ticketId: "TCK-2231", organization: "B03", type: "Clinic", who: "Omer Peretz", category: "Patient App", issueType: issueType("Patient App", 0), origin: "User Created", severity: "Critical", state: "Resolved", assignedTo: "Daniel Roy", created: "13.08.2028", description: "Clinic reported patient app pause issue, since resolved after a forced re-sync." },
  { ticketId: "TCK-1123", organization: "ATP", type: "Patient", who: "ATP-5023", category: "Scheduling Engine", issueType: issueType("Scheduling Engine", 0), origin: "User Created", severity: "Medium", state: "Escalated", assignedTo: "Tomer Levi", created: "14.08.2028", description: "Scheduled run missing a start date, escalated after repeated occurrence for this organization." },
  { ticketId: "TCK-1560", organization: "104", type: "Patient", who: "104-2290", category: "Voice Engine", issueType: issueType("Voice Engine", 1), origin: "System Generated", severity: "High", state: "Open", assignedTo: "Sarah Cline", created: "21.08.2028", description: "Recording uploaded but failed to process through the voice engine pipeline." },
  { ticketId: "TCK-1588", organization: "B01", type: "Patient", who: "B01-3390", category: "Sensors", issueType: issueType("Sensors", 1), origin: "System Generated", severity: "Low", state: "Resolved", assignedTo: "Maya Cohen", created: "09.08.2028", description: "Connected device failed to sync after a firmware update; resolved by re-pairing the device." },
];

ticketList.forEach((t, i) => (t.id = i));
ticketList.forEach((t) => (t.history = [
  { date: t.created, text: `Ticket created (${t.origin}).` },
]));

const selectedTypes = new Set();
const selectedCategories = new Set();
const selectedIssueTypes = new Set();
const selectedOrigins = new Set();
const selectedSeverities = new Set();
const selectedStates = new Set();
let ticketSearchTerm = "";

function stateCellClass(state) {
  return { Open: "ticket-pill-state-open", "In Progress": "ticket-pill-state-inprogress", Escalated: "ticket-pill-state-escalated", Resolved: "ticket-pill-state-resolved" }[state];
}
function severityCellClass(severity) {
  return { Critical: "ticket-pill-severity-critical", High: "ticket-pill-severity-high", Medium: "ticket-pill-severity-medium", Low: "ticket-pill-severity-low" }[severity];
}
function originCellClass(origin) {
  return origin === "System Generated" ? "ticket-pill-origin-system" : "ticket-pill-origin-user";
}
function typeCellClass(type) {
  return type === "Patient" ? "ticket-pill-type-patient" : "ticket-pill-type-clinic";
}

function filteredTicketList() {
  const term = ticketSearchTerm.trim().toLowerCase();
  return ticketList.filter((t) => {
    if (t.assignedTo !== CURRENT_ASSIGNEE) return false;
    if (selectedTypes.size && !selectedTypes.has(t.type)) return false;
    if (selectedCategories.size && !selectedCategories.has(t.category)) return false;
    if (selectedIssueTypes.size && !selectedIssueTypes.has(t.issueType)) return false;
    if (selectedOrigins.size && !selectedOrigins.has(t.origin)) return false;
    if (selectedSeverities.size && !selectedSeverities.has(t.severity)) return false;
    if (selectedStates.size && !selectedStates.has(t.state)) return false;
    if (term && !`${t.ticketId} ${t.who} ${t.organization}`.toLowerCase().includes(term)) return false;
    return true;
  });
}

const ticketRows = document.getElementById("ticketListRows");
const ticketRangeLabel = document.getElementById("ticketRangeLabel");

function renderTicketList() {
  const list = filteredTicketList();
  ticketRows.innerHTML = list
    .map(
      (t) => `
      <tr>
        <td><b>${t.ticketId}</b></td>
        <td>${t.organization}</td>
        <td><span class="ticket-pill ${typeCellClass(t.type)}">${t.type}</span></td>
        <td>${t.who}</td>
        <td><span class="ticket-pill ticket-pill-category">${t.category}</span></td>
        <td>${t.issueType}</td>
        <td><span class="ticket-pill ${originCellClass(t.origin)}">${t.origin}</span></td>
        <td><span class="ticket-pill ${severityCellClass(t.severity)}">${t.severity}</span></td>
        <td><span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span></td>
        <td>${t.created}</td>
        <td><button type="button" class="ticket-view-link" data-id="${t.id}">View</button></td>
      </tr>`
    )
    .join("");
  ticketRangeLabel.textContent = list.length ? `1-${list.length} of ${list.length}` : "";
  if (!list.length) {
    ticketRows.innerHTML = `<tr><td colspan="11" style="text-align:center; color:var(--gray-text); padding:24px;">No tickets match the current filters.</td></tr>`;
  }
}

renderTicketList();

/* ---------------- Filter menu portaling (matches patient-list.js) ---------------- */
const portaledFilterMenus = new Map();

function positionFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function openFilterMenu(wrapEl, menuEl) {
  if (!portaledFilterMenus.has(menuEl)) {
    portaledFilterMenus.set(menuEl, { parent: menuEl.parentNode, next: menuEl.nextSibling });
  }
  document.body.appendChild(menuEl);
  menuEl.classList.add("checkbox-filter-menu-portaled");
  positionFilterMenu(wrapEl.querySelector(".filter-btn"), menuEl);
}

function closeFilterMenu(menuEl) {
  const original = portaledFilterMenus.get(menuEl);
  if (original && menuEl.parentNode === document.body) {
    if (original.next && original.next.parentNode === original.parent) {
      original.parent.insertBefore(menuEl, original.next);
    } else {
      original.parent.appendChild(menuEl);
    }
  }
  menuEl.classList.remove("checkbox-filter-menu-portaled");
  menuEl.style.position = "";
  menuEl.style.left = "";
  menuEl.style.top = "";
  menuEl.style.bottom = "";
  menuEl.style.minWidth = "";
}

function wireCheckboxFilter(wrapEl, menuEl, selectedSet, onChange) {
  const trigger = wrapEl.querySelector(".filter-btn");
  const label = wrapEl.querySelector(".checkbox-filter-label");
  const baseLabel = label.textContent.trim();

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !wrapEl.classList.contains("open");
    closeAllFilterPopovers();
    wrapEl.classList.toggle("open", willOpen);
    if (willOpen) openFilterMenu(wrapEl, menuEl);
  });

  menuEl.addEventListener("click", (e) => e.stopPropagation());

  menuEl.addEventListener("change", (e) => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;
    if (checkbox.checked) selectedSet.add(checkbox.value);
    else selectedSet.delete(checkbox.value);

    label.textContent = selectedSet.size ? `${baseLabel} (${selectedSet.size})` : baseLabel;
    onChange();
  });
}

function closeAllFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeFilterMenu(menuEl));
}

document.addEventListener("click", closeAllFilterPopovers);

/* ---------------- Filter menus ---------------- */
function buildOptionsHtml(options) {
  return options.map((o) => `<label class="checkbox-filter-option"><input type="checkbox" value="${o.key}" />${o.label}</label>`).join("");
}

const ticketTypeMenu = document.getElementById("ticketTypeMenu");
ticketTypeMenu.innerHTML = buildOptionsHtml(ticketTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="type"]'), ticketTypeMenu, selectedTypes, renderTicketList);

const ticketCategoryMenu = document.getElementById("ticketCategoryMenu");
ticketCategoryMenu.innerHTML = buildOptionsHtml(ticketCategories);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="category"]'), ticketCategoryMenu, selectedCategories, renderTicketList);

const allIssueTypes = [...new Set(ticketList.map((t) => t.issueType))].map((v) => ({ key: v, label: v }));
const ticketIssueMenu = document.getElementById("ticketIssueMenu");
ticketIssueMenu.innerHTML = buildOptionsHtml(allIssueTypes);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="issueType"]'), ticketIssueMenu, selectedIssueTypes, renderTicketList);

const ticketOriginMenu = document.getElementById("ticketOriginMenu");
ticketOriginMenu.innerHTML = buildOptionsHtml(ticketOrigins);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="origin"]'), ticketOriginMenu, selectedOrigins, renderTicketList);

const ticketSeverityMenu = document.getElementById("ticketSeverityMenu");
ticketSeverityMenu.innerHTML = buildOptionsHtml(ticketSeverities);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="severity"]'), ticketSeverityMenu, selectedSeverities, renderTicketList);

const ticketStateMenu = document.getElementById("ticketStateMenu");
ticketStateMenu.innerHTML = buildOptionsHtml(ticketStates);
wireCheckboxFilter(document.querySelector('.checkbox-filter[data-name="state"]'), ticketStateMenu, selectedStates, renderTicketList);

/* ---------------- Search ---------------- */
document.getElementById("ticketSearchInput").addEventListener("input", (e) => {
  ticketSearchTerm = e.target.value;
  renderTicketList();
});

/* ---------------- Clear all filters ---------------- */
const clearableTicketFilters = [
  { name: "type", menu: ticketTypeMenu, set: selectedTypes, label: "Type" },
  { name: "category", menu: ticketCategoryMenu, set: selectedCategories, label: "Category" },
  { name: "issueType", menu: ticketIssueMenu, set: selectedIssueTypes, label: "Issue Type" },
  { name: "origin", menu: ticketOriginMenu, set: selectedOrigins, label: "Origin" },
  { name: "severity", menu: ticketSeverityMenu, set: selectedSeverities, label: "Severity" },
  { name: "state", menu: ticketStateMenu, set: selectedStates, label: "State" },
];

document.getElementById("clearTicketFilters").addEventListener("click", () => {
  document.getElementById("ticketSearchInput").value = "";
  ticketSearchTerm = "";
  clearableTicketFilters.forEach(({ name, menu, set, label }) => {
    set.clear();
    menu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
    document.querySelector(`.checkbox-filter[data-name="${name}"] .checkbox-filter-label`).textContent = label;
  });
  renderTicketList();
});

/* ---------------- View / Resolve ticket ---------------- */
const ticketDetailOverlay = document.getElementById("ticketDetailOverlay");
const ticketDetailBody = document.getElementById("ticketDetailBody");
const ticketResolutionNote = document.getElementById("ticketResolutionNote");
const resolveTicketBtn = document.getElementById("resolveTicketBtn");
let openTicketId = null;

function openTicketDetail(id) {
  const t = ticketList.find((x) => x.id === id);
  if (!t) return;
  openTicketId = id;

  ticketDetailBody.innerHTML = `
    <h2>${t.ticketId}</h2>
    <div style="display:flex; gap:8px; margin-top:6px;">
      <span class="ticket-pill ${typeCellClass(t.type)}">${t.type}</span>
      <span class="ticket-pill ${severityCellClass(t.severity)}">${t.severity}</span>
      <span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span>
    </div>

    <div class="ticket-detail-grid">
      <div class="ticket-detail-field"><label>Organization</label><span>${t.organization}</span></div>
      <div class="ticket-detail-field"><label>${t.type === "Patient" ? "Patient" : "Raised By"}</label><span>${t.who}</span></div>
      <div class="ticket-detail-field"><label>Category</label><span>${t.category}</span></div>
      <div class="ticket-detail-field"><label>Issue Type</label><span>${t.issueType}</span></div>
      <div class="ticket-detail-field"><label>Origin</label><span>${t.origin}</span></div>
      <div class="ticket-detail-field"><label>Assigned To</label><span>${t.assignedTo}</span></div>
      <div class="ticket-detail-field"><label>Created</label><span>${t.created}</span></div>
    </div>

    <div class="ticket-detail-description">${t.description}</div>

    <h3 style="margin-top:22px; margin-bottom:0; font-size:15px;">History</h3>
    <div class="ticket-history">
      ${t.history.map((h) => `<div class="ticket-history-item"><b>${h.date}</b> — ${h.text}</div>`).join("")}
    </div>
  `;

  const alreadyResolved = t.state === "Resolved";
  ticketResolutionNote.value = "";
  ticketResolutionNote.disabled = alreadyResolved;
  ticketResolutionNote.placeholder = alreadyResolved ? "This ticket is already resolved." : "Describe how this ticket was resolved";
  resolveTicketBtn.disabled = true;
  resolveTicketBtn.textContent = alreadyResolved ? "Already resolved" : "Resolve ticket";
  resolveTicketBtn.classList.toggle("enabled", false);

  ticketDetailOverlay.classList.add("open");
}

function closeTicketDetail() {
  ticketDetailOverlay.classList.remove("open");
  openTicketId = null;
}

ticketRows.addEventListener("click", (e) => {
  const link = e.target.closest(".ticket-view-link");
  if (!link) return;
  openTicketDetail(Number(link.dataset.id));
});

document.getElementById("closeTicketDetail").addEventListener("click", closeTicketDetail);
ticketDetailOverlay.addEventListener("click", (e) => {
  if (e.target === ticketDetailOverlay) closeTicketDetail();
});

ticketResolutionNote.addEventListener("input", () => {
  const t = ticketList.find((x) => x.id === openTicketId);
  const hasNote = ticketResolutionNote.value.trim().length > 0;
  const canResolve = hasNote && t && t.state !== "Resolved";
  resolveTicketBtn.disabled = !canResolve;
  resolveTicketBtn.classList.toggle("enabled", canResolve);
});

resolveTicketBtn.addEventListener("click", () => {
  const t = ticketList.find((x) => x.id === openTicketId);
  if (!t || resolveTicketBtn.disabled) return;
  const note = ticketResolutionNote.value.trim();
  if (!note) return;

  t.state = "Resolved";
  t.history.push({ date: "Today", text: `Resolved: ${note}` });
  renderTicketList();
  closeTicketDetail();
});
