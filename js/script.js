/* Care team acknowledgment on a priority: each member is tracked separately
   (not one shared "handling" name) so a colleague's ack doesn't hide whether
   *I* still need to look at this -- see CURRENT_USER below. */
function careTeamOf(members) {
  return members.map((m) => ({ ...m }));
}

const priorityPatients = [
  { name: "Dan Gildon", since: "2 days | 01.08.2028", priorityHistory: ["01.08.2028", "12.27.2027"], wellness: [{ label: "Steps", value: -5.5 }, { label: "Distance", value: -7 }, { label: "Elevation", value: -1.1 }, { label: "Sleep", value: -3 }, { label: "HR", value: 0.5 }, { label: "Blood oxygen", value: 1.1 }, { label: "Respiration rate", value: -0.7 }], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: null, flag: false, unseen: false },
  { name: "Dan Volex", since: "2 days | 01.08.2028", priorityHistory: ["01.08.2028", "12.20.2027"], wellness: [{ label: "Steps", value: -3.2 }, { label: "Distance", value: -4.5 }, { label: "Elevation", value: 0.4 }, { label: "Sleep", value: -1.8 }, { label: "HR", value: 1.2 }, { label: "Blood oxygen", value: -0.3 }, { label: "Respiration rate", value: 0.6 }], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }, { initials: "RC", name: "Ryan Cole", acknowledged: false }]), handling: null, flag: true, unseen: true },
  { name: "Mike Brown", since: "2 days | 01.08.2028", unmonitored: true, priorityHistory: ["08.01.2028", "27.12.2027"], wellness: [{ label: "Steps", value: -5.5 }, { label: "Distance", value: -7 }, { label: "Elevation", value: -1.1 }, { label: "Sleep", value: -3 }, { label: "HR", value: 0.5 }, { label: "Blood oxygen", value: 1.1 }, { label: "Respiration rate", value: -0.7 }], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: true }]), handling: { status: "In Progress", name: "Dana Farber", since: "09:11" }, flag: false, unseen: true },
  { name: "Ariel Fox", since: "3 days | 01.07.2028", priorityHistory: ["01.07.2028"], wellness: [{ label: "Steps", value: -2.1 }, { label: "Distance", value: -2.8 }, { label: "Elevation", value: 0.2 }, { label: "Sleep", value: -0.9 }, { label: "HR", value: 0.3 }, { label: "Blood oxygen", value: 0.4 }, { label: "Respiration rate", value: -0.2 }], careTeam: careTeamOf([{ initials: "EC", name: "Emily Carter", acknowledged: true }]), handling: null, flag: false, unseen: false },
  { name: "Jeff Frank", since: "4 days | 01.06.2028", priorityHistory: ["01.06.2028"], wellness: [{ label: "Steps", value: -6.4 }, { label: "Distance", value: -5.9 }, { label: "Elevation", value: -2.3 }, { label: "Sleep", value: -4.1 }, { label: "HR", value: 1.6 }, { label: "Blood oxygen", value: -0.8 }, { label: "Respiration rate", value: 1.0 }], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: null, flag: false, unseen: false },
  { name: "Aric Snow", since: "8 days | 01.02.2028", priorityHistory: ["01.02.2028", "12.10.2027"], wellness: [{ label: "Steps", value: -1.5 }, { label: "Distance", value: -1.9 }, { label: "Elevation", value: 0.6 }, { label: "Sleep", value: -0.5 }, { label: "HR", value: 0.2 }, { label: "Blood oxygen", value: 0.6 }, { label: "Respiration rate", value: -0.1 }], careTeam: careTeamOf([{ initials: "RC", name: "Ryan Cole", acknowledged: true }, { initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: { status: "In Progress", name: "Dana Farber", since: "08:11" }, flag: false, unseen: false },
  { name: "Jeff Bright", since: "8 days | 01.02.2028", priorityHistory: ["01.02.2028"], wellness: [{ label: "Steps", value: -4.8 }, { label: "Distance", value: -3.7 }, { label: "Elevation", value: -1.4 }, { label: "Sleep", value: -2.2 }, { label: "HR", value: 0.9 }, { label: "Blood oxygen", value: -0.5 }, { label: "Respiration rate", value: 0.3 }], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: true }]), handling: { status: "In Progress", name: "Dana Farber", since: "08:07" }, flag: false, unseen: false },
  { name: "Sara Ericson", since: "9 days | 01.01.2028", priorityHistory: ["01.01.2028"], wellness: [{ label: "Steps", value: -2.6 }, { label: "Distance", value: -3.1 }, { label: "Elevation", value: 0.1 }, { label: "Sleep", value: -1.2 }, { label: "HR", value: 0.4 }, { label: "Blood oxygen", value: 0.2 }, { label: "Respiration rate", value: -0.4 }], careTeam: careTeamOf([{ initials: "RC", name: "Ryan Cole", acknowledged: false }]), handling: null, flag: false, unseen: false },
];

const unmonitoredPatients = [
  { name: "Mike Brown", since: "1 days | 01.10.2028", priorityHistory: ["08.01.2028", "27.12.2027"], wellness: [{ label: "Steps", value: -5.5 }, { label: "Distance", value: -7 }, { label: "Elevation", value: -1.1 }, { label: "Sleep", value: -3 }, { label: "HR", value: 0.5 }, { label: "Blood oxygen", value: 1.1 }, { label: "Respiration rate", value: -0.7 }] },
  { name: "Jack Harris", since: "2 days | 01.09.2028", priorityHistory: ["01.09.2028"], wellness: [{ label: "Steps", value: -3.9 }, { label: "Distance", value: -4.2 }, { label: "Elevation", value: -0.6 }, { label: "Sleep", value: -2.0 }, { label: "HR", value: 0.7 }, { label: "Blood oxygen", value: -0.4 }, { label: "Respiration rate", value: 0.5 }] },
  { name: "Abraham Snow", since: "2 days | 01.09.2028", priorityHistory: ["01.09.2028"], wellness: [{ label: "Steps", value: -1.8 }, { label: "Distance", value: -2.2 }, { label: "Elevation", value: 0.3 }, { label: "Sleep", value: -0.7 }, { label: "HR", value: 0.2 }, { label: "Blood oxygen", value: 0.3 }, { label: "Respiration rate", value: -0.3 }] },
  { name: "Victor Fisher", since: "3 days | 01.08.2028", priorityHistory: ["01.08.2028"], wellness: [{ label: "Steps", value: -4.3 }, { label: "Distance", value: -3.4 }, { label: "Elevation", value: -1.0 }, { label: "Sleep", value: -1.9 }, { label: "HR", value: 0.6 }, { label: "Blood oxygen", value: -0.2 }, { label: "Respiration rate", value: 0.4 }] },
  { name: "Eric Roso", since: "5 days | 01.05.2028", priorityHistory: ["01.05.2028"], wellness: [{ label: "Steps", value: -2.9 }, { label: "Distance", value: -3.6 }, { label: "Elevation", value: 0.5 }, { label: "Sleep", value: -1.1 }, { label: "HR", value: 0.3 }, { label: "Blood oxygen", value: 0.5 }, { label: "Respiration rate", value: -0.5 }] },
  { name: "Ellen Boss", since: "6 days | 01.04.2028", priorityHistory: ["01.04.2028"], wellness: [{ label: "Steps", value: -1.2 }, { label: "Distance", value: -1.5 }, { label: "Elevation", value: 0.8 }, { label: "Sleep", value: -0.3 }, { label: "HR", value: 0.1 }, { label: "Blood oxygen", value: 0.7 }, { label: "Respiration rate", value: -0.1 }] },
];

const heartSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const chevSvg = `<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#4A4F57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const infoSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="currentColor"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;

/* Logged-in clinician (matches the "EC" topbar avatar / "Welcome Emily").
   Drives which priorities show as unseen-by-me and whose name the
   "Acknowledge" action records against. */
const CURRENT_USER = "Emily Carter";

function patientDetailRowHtml(p) {
  return `
    <div class="p-detail-grid">
      <div class="p-detail-col">
        <div class="p-detail-title">Priority last 30 days</div>
        ${p.priorityHistory.map((d) => `<div class="p-detail-item"><span>Priority</span><span>${d}</span></div>`).join("")}
      </div>
      <div class="p-detail-col">
        <div class="p-detail-title">Wellness change last 7 days</div>
        ${p.wellness
          .map(
            (w) => `<div class="p-detail-item"><span>${w.label}</span><span class="${w.value >= 0 ? "p-detail-pos" : "p-detail-neg"}">${w.value > 0 ? "+" : ""}${w.value}%</span></div>`
          )
          .join("")}
      </div>
    </div>`;
}

function renderPatientRows(elId, items, iconSvg) {
  document.getElementById(elId).innerHTML = items
    .map(
      (p, i) => `
      <tr class="p-row">
        <td>
          <button type="button" class="p-expand-btn" data-idx="${i}" aria-expanded="false" aria-label="Expand details">${chevSvg}</button>
          <a class="p-name" href="patient-data.html" style="text-decoration:none;">
            ${iconSvg}
            <span class="p-name-text">${p.name}</span>
          </a>
        </td>
        <td class="p-since">${p.since}</td>
      </tr>
      <tr class="p-detail-row" data-idx="${i}" hidden>
        <td colspan="2">${patientDetailRowHtml(p)}</td>
      </tr>`
    )
    .join("");

  document.getElementById(elId).addEventListener("click", (e) => {
    const btn = e.target.closest(".p-expand-btn");
    if (!btn) return;
    const willOpen = btn.getAttribute("aria-expanded") !== "true";
    btn.setAttribute("aria-expanded", String(willOpen));
    const detailRow = document.querySelector(`#${elId} .p-detail-row[data-idx="${btn.dataset.idx}"]`);
    if (detailRow) detailRow.hidden = !willOpen;
  });
}

/* ---------------- Priority table: per-user unseen state + care-team acknowledgment ----------------
   Unlike the plain Unmonitored table, Priority also needs to answer "is this
   new to *me*" and "which care-team members have acknowledged it" separately
   from the shared Handling status -- see careTeamOf() above. Row-open state
   is kept across re-renders (openPriorityIdx) so acknowledging one row
   doesn't collapse another the clinician already had open. */
const openPriorityIdx = new Set();

/* Care Team cell: the members' avatars (filled = acknowledged, dashed = not
   yet). Until anyone acknowledges, a "✓ Ack" button sits beside them
   (acknowledges as the signed-in user); after that, "Acknowledged by
   <names>" shows under the avatars. */
const ackCheckSvg = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* Care Team cell -- one compact pattern that reads the same at any width:
   - avatars stacked with a slight overlap (white ring keeps each readable):
     filled blue = acknowledged, dashed white = not yet; at most 3
     shown, the rest as "+N" (everyone listed in its tooltip);
   - before anyone acknowledges: a small "✓ Ack" button, avatar height,
     in front of the avatars;
   - after: one short line, "Acknowledged by <first>" (+N when more have),
     with the full list and times in its tooltip, and for a few seconds
     after acknowledging, an "Undo" on that same line. */
const CARE_TEAM_MAX_AVATARS = 3;

function careAvatarsHtml(p, i) {
  const team = p.careTeam;
  const memberLabel = (m) => `${m.name} · ${m.acknowledged ? `Acknowledged${m.ackTime ? ` ${m.ackTime}` : ""}` : "Not yet acknowledged"}`;
  const shown = team.length > CARE_TEAM_MAX_AVATARS ? team.slice(0, CARE_TEAM_MAX_AVATARS - 1) : team;
  const hidden = team.slice(shown.length);
  const avatars = `
      <div class="care-team-avatars">
        ${shown.map((m) => `<span class="care-avatar-sm ${m.acknowledged ? "ack" : "pending"}" title="${memberLabel(m)}">${m.initials}</span>`).join("")}
        ${hidden.length ? `<span class="care-avatar-sm more" title="${hidden.map(memberLabel).join("&#10;")}">+${hidden.length}</span>` : ""}
      </div>`;

  const acknowledged = team.filter((m) => m.acknowledged);
  if (!acknowledged.length) {
    return `
    <div class="care-team-cell care-team-cell--pending">
      <button type="button" class="care-ack-btn" data-idx="${i}" aria-label="Acknowledge priority for ${p.name}" data-tooltip="Acknowledge this priority">${ackCheckSvg} Ack</button>${avatars}
    </div>`;
  }
  const undoOpen = p.lastAck && p.lastAck.until > Date.now();
  const extra = acknowledged.length - 1;
  return `
    <div class="care-team-cell">${avatars}
      <div class="care-team-ack-names" title="${acknowledged.map(memberLabel).join("&#10;")}">
        <span class="care-team-ack-text">Acknowledged by ${acknowledged[0].name}${extra ? ` +${extra}` : ""}</span>${undoOpen ? `<button type="button" class="care-ack-undo" data-idx="${i}">Undo</button>` : ""}
      </div>
    </div>`;
}

function priorityDetailRowHtml(p) {
  return patientDetailRowHtml(p);
}

function updatePriorityNewBadges() {
  const newCount = priorityPatients.filter((p) => p.unseen).length;
  const label = `+${newCount} New`;
  document.querySelectorAll("#priorityToggleBtn .acc-new, #priorityToggleBtn .acc-banner-new").forEach((el) => {
    el.textContent = label;
    el.style.display = newCount ? "" : "none";
  });
}

function renderPriorityRows(elId, items) {
  document.getElementById(elId).innerHTML = items
    .map(
      (p, i) => `
      <tr class="p-row priority-row ${p.unseen ? "is-new" : ""}">
        <td>
          <div class="p-name-cell">
            <button type="button" class="p-expand-btn" data-idx="${i}" aria-expanded="${openPriorityIdx.has(i)}" aria-label="Expand details">${chevSvg}</button>
            <a class="p-name" href="patient-data.html" style="text-decoration:none;">
              ${heartSvg}
              <span class="p-name-text">${p.name}</span>
            </a>
            ${p.unmonitored ? `<span class="priority-unmon-badge">${infoSvg} Unmonitored</span>` : ""}
          </div>
        </td>
        <td class="p-since">${p.since}</td>
        <td>${careAvatarsHtml(p, i)}</td>
      </tr>
      <tr class="p-detail-row" data-idx="${i}" ${openPriorityIdx.has(i) ? "" : "hidden"}>
        <td colspan="3">${priorityDetailRowHtml(p)}</td>
      </tr>`
    )
    .join("");

  updatePriorityNewBadges();
}

function acknowledgePriority(i) {
  const p = priorityPatients[i];
  const now = new Date();
  const ackTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  /* Ack marks one of the patient's own care team members as acknowledged
     (the signed-in user if they're on the team, otherwise the first member
     who hasn't yet) -- it never adds anyone to the team. That member's
     avatar turns blue; the rest stay white. */
  const member =
    p.careTeam.find((m) => m.name === CURRENT_USER && !m.acknowledged) ||
    p.careTeam.find((m) => !m.acknowledged);
  if (!member) return;
  p.lastAck = { member, handlingSet: !p.handling, until: Date.now() + ACK_UNDO_MS };
  member.acknowledged = true;
  member.ackTime = ackTime;

  if (!p.handling) p.handling = { status: "In Progress", name: member.name, since: ackTime };
  p.unseen = false;

  renderPriorityRows("priorityRows", priorityPatients);
  announcePriority(`${p.name}: acknowledged by ${member.name}.`);
  focusPriorityControl(i, ".care-ack-undo");
  /* Close the undo window: drop the Undo link once it has passed. */
  setTimeout(() => {
    if (p.lastAck && p.lastAck.until <= Date.now()) {
      p.lastAck = null;
      renderPriorityRows("priorityRows", priorityPatients);
    }
  }, ACK_UNDO_MS + 50);
}

/* Undo puts the member back to not-acknowledged (and clears the Handling it
   started), bringing the Ack button back. */
function undoAcknowledgePriority(i) {
  const p = priorityPatients[i];
  const last = p.lastAck;
  if (!last) return;
  last.member.acknowledged = false;
  delete last.member.ackTime;
  if (last.handlingSet) p.handling = null;
  p.lastAck = null;
  renderPriorityRows("priorityRows", priorityPatients);
  announcePriority(`${p.name}: acknowledgment undone.`);
  focusPriorityControl(i, ".care-ack-btn");
}

const ACK_UNDO_MS = 6000;

/* Ack tooltip: a small dark label above the button on hover / keyboard
   focus. Fixed-positioned so the table's scroll area can't clip it. */
let ackTooltip = null;
function showAckTooltip(btn) {
  hideAckTooltip();
  ackTooltip = Object.assign(document.createElement("div"), { className: "care-ack-tooltip", textContent: btn.dataset.tooltip });
  ackTooltip.setAttribute("role", "tooltip");
  document.body.appendChild(ackTooltip);
  const r = btn.getBoundingClientRect();
  const t = ackTooltip.getBoundingClientRect();
  ackTooltip.style.left = `${Math.max(8, r.left + r.width / 2 - t.width / 2)}px`;
  ackTooltip.style.top = `${r.top - t.height - 8}px`;
}
function hideAckTooltip() {
  if (ackTooltip) ackTooltip.remove();
  ackTooltip = null;
}
const priorityRowsEl = document.getElementById("priorityRows");
priorityRowsEl.addEventListener("mouseover", (e) => { const b = e.target.closest(".care-ack-btn"); if (b) showAckTooltip(b); });
priorityRowsEl.addEventListener("mouseout", (e) => { const b = e.target.closest(".care-ack-btn"); if (b && !b.contains(e.relatedTarget)) hideAckTooltip(); });
priorityRowsEl.addEventListener("focusin", (e) => { const b = e.target.closest(".care-ack-btn"); if (b && b.matches(":focus-visible")) showAckTooltip(b); });
priorityRowsEl.addEventListener("focusout", hideAckTooltip);
priorityRowsEl.addEventListener("click", hideAckTooltip, true);
window.addEventListener("scroll", hideAckTooltip, true);

/* Screen readers hear the change, since the button itself disappears. */
function announcePriority(text) {
  let live = document.getElementById("priorityLiveRegion");
  if (!live) {
    live = Object.assign(document.createElement("div"), { id: "priorityLiveRegion", className: "sr-only" });
    live.setAttribute("aria-live", "polite");
    document.body.appendChild(live);
  }
  live.textContent = text;
}

/* Keep keyboard focus on the row's control after it re-renders. */
function focusPriorityControl(i, selector) {
  const el = document.querySelector(`#priorityRows ${selector}[data-idx="${i}"]`);
  if (el) el.focus();
}

document.getElementById("priorityRows").addEventListener("click", (e) => {
  const expandBtn = e.target.closest(".p-expand-btn");
  if (expandBtn) {
    const i = Number(expandBtn.dataset.idx);
    const willOpen = !openPriorityIdx.has(i);
    if (willOpen) openPriorityIdx.add(i);
    else openPriorityIdx.delete(i);
    /* Opening a priority marks it seen for this user -- independent of
       whether anyone has acknowledged/handled it yet. */
    priorityPatients[i].unseen = false;
    renderPriorityRows("priorityRows", priorityPatients);
    return;
  }

  const ackBtn = e.target.closest(".care-ack-btn");
  if (ackBtn) {
    acknowledgePriority(Number(ackBtn.dataset.idx));
    return;
  }

  const undoBtn = e.target.closest(".care-ack-undo");
  if (undoBtn) {
    undoAcknowledgePriority(Number(undoBtn.dataset.idx));
    return;
  }
});

renderPriorityRows("priorityRows", priorityPatients);
renderPatientRows("unmonitoredRows", unmonitoredPatients, infoSvg);

/* Priority / Unmonitored accordion: only one panel open at a time */
const accordionItems = [
  { btn: document.getElementById("priorityToggleBtn"), panel: document.getElementById("priorityPanel"), scrollId: "#priorityTableScroll", rows: 6 },
  { btn: document.getElementById("unmonToggleBtn"), panel: document.getElementById("unmonPanel"), scrollId: "#unmonTableScroll", rows: 6 },
];

function setAccordionExpanded(item, expanded) {
  item.btn.setAttribute("aria-expanded", String(expanded));
  item.panel.hidden = !expanded;
  if (expanded) fitTableToRows(item.scrollId, item.rows);
}

accordionItems.forEach((item) => {
  item.btn.addEventListener("click", () => {
    const wasExpanded = item.btn.getAttribute("aria-expanded") === "true";
    accordionItems.forEach((other) => setAccordionExpanded(other, other === item ? !wasExpanded : false));
  });
});

function refitExpandedAccordion() {
  const open = accordionItems.find((item) => item.btn.getAttribute("aria-expanded") === "true");
  if (open) fitTableToRows(open.scrollId, open.rows);
}

refitExpandedAccordion();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(refitExpandedAccordion);
}
window.addEventListener("load", refitExpandedAccordion);
