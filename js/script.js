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
const infoSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const flagIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="#F16C6C" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="#F16C6C" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* Logged-in clinician (matches the "EC" topbar avatar / "Welcome Emily").
   Drives which priorities show as unseen-by-me and whose name the
   "Acknowledge" action records against. */
const CURRENT_USER = "Emily Carter";
const CURRENT_USER_INITIALS = "EC";

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

function careAvatarsHtml(p) {
  return `
    <div class="care-team-avatars">
      ${p.careTeam
        .map(
          (m) => `<span class="care-avatar-sm ${m.acknowledged ? "ack" : "pending"}" title="${m.name} · ${m.acknowledged ? "Acknowledged" : "Not yet acknowledged"}">${m.initials}</span>`
        )
        .join("")}
    </div>`;
}

function priorityDetailRowHtml(p, i) {
  const mine = p.careTeam.find((m) => m.name === CURRENT_USER);
  const iAcknowledged = mine && mine.acknowledged;
  return `
    ${patientDetailRowHtml(p)}
    <div class="priority-ack-row">
      ${
        iAcknowledged
          ? `<span class="priority-acknowledged-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#197A4E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> You acknowledged this${mine.ackTime ? ` &middot; ${mine.ackTime}` : ""}</span>`
          : `<button type="button" class="priority-acknowledge-btn" data-idx="${i}">+ Acknowledge</button>`
      }
    </div>`;
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
        <td>${careAvatarsHtml(p)}</td>
        <td class="priority-row-actions">
          <button type="button" class="priority-flag-btn ${p.flag ? "active" : ""}" data-idx="${i}" title="${p.flag ? "Remove flag" : "Flag for follow-up"}" aria-pressed="${p.flag}">${flagIcon}</button>
          <button type="button" class="action-icon kebab priority-row-menu-trigger" data-idx="${i}" aria-label="Row actions">${kebabIcon}</button>
        </td>
      </tr>
      <tr class="p-detail-row" data-idx="${i}" ${openPriorityIdx.has(i) ? "" : "hidden"}>
        <td colspan="4">${priorityDetailRowHtml(p, i)}</td>
      </tr>`
    )
    .join("");

  updatePriorityNewBadges();
}

function acknowledgePriority(i) {
  const p = priorityPatients[i];
  const now = new Date();
  const ackTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  let mine = p.careTeam.find((m) => m.name === CURRENT_USER);
  if (!mine) {
    mine = { initials: CURRENT_USER_INITIALS, name: CURRENT_USER, acknowledged: false };
    p.careTeam.push(mine);
  }
  mine.acknowledged = true;
  mine.ackTime = ackTime;

  if (!p.handling) p.handling = { status: "In Progress", name: CURRENT_USER, since: ackTime };
  p.unseen = false;

  openPriorityIdx.add(i);
  renderPriorityRows("priorityRows", priorityPatients);
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

  const ackBtn = e.target.closest(".priority-acknowledge-btn");
  if (ackBtn) {
    acknowledgePriority(Number(ackBtn.dataset.idx));
    return;
  }

  const flagBtn = e.target.closest(".priority-flag-btn");
  if (flagBtn) {
    const i = Number(flagBtn.dataset.idx);
    priorityPatients[i].flag = !priorityPatients[i].flag;
    renderPriorityRows("priorityRows", priorityPatients);
    return;
  }

  const menuTrigger = e.target.closest(".priority-row-menu-trigger");
  if (menuTrigger) {
    e.stopPropagation();
    const menu = document.getElementById("priorityRowMenu");
    menu.dataset.idx = menuTrigger.dataset.idx;
    const rect = menuTrigger.getBoundingClientRect();
    menu.style.top = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.right - 190}px`;
    menu.classList.add("open");
  }
});

const priorityRowMenu = document.getElementById("priorityRowMenu");
document.addEventListener("click", (e) => {
  if (!priorityRowMenu.contains(e.target)) priorityRowMenu.classList.remove("open");
});

priorityRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".row-menu-item");
  if (!item) return;
  const i = Number(priorityRowMenu.dataset.idx);
  priorityRowMenu.classList.remove("open");

  if (item.dataset.action === "acknowledge") acknowledgePriority(i);
  if (item.dataset.action === "view") window.location.href = "patient-data.html";
});

renderPriorityRows("priorityRows", priorityPatients);
renderPatientRows("unmonitoredRows", unmonitoredPatients, infoSvg);

/* Priority / Unmonitored accordion: only one panel open at a time */
const accordionItems = [
  { btn: document.getElementById("priorityToggleBtn"), panel: document.getElementById("priorityPanel"), scrollId: "#priorityTableScroll", rows: 5 },
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
