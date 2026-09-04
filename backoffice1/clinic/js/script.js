/* Backoffice-safe fork of ../../js/script.js (the root Clinic Dashboard).
   Why forked instead of shared: the root file mixes patient data (real names,
   per-patient wellness/vitals deltas) together with its render functions, so
   it cannot be reused unmodified. Changes from the root file:
   - Patient names replaced with each patient's Patient ID (the `username`
     field used across the app, e.g. js/patient-list.js's patientList array).
     The dashboard's demo dataset and the Patient List's demo dataset are
     separate hardcoded mock datasets in the source app (not linked by id), so
     each entry below is keyed directly by Patient ID -- reused from
     patientList where the demo row matches, and a same-format placeholder ID
     otherwise -- rather than shipping the original demo name (even as data
     that's never rendered) down to the browser.
   - The "Wellness change last 7 days" detail block (per-patient vitals %
     deltas -- Steps/Distance/Elevation/Sleep/HR/Blood oxygen/Respiration) is
     removed entirely; that's Health Data content, out of scope for backoffice
     per the same policy that drops the Health Data tab on the patient chart.
     Only the administrative "Priority last 30 days" date history is kept.
   - All patient links now go to this folder's own patient-data.html. */

function careTeamOf(members) {
  return members.map((m) => ({ ...m }));
}

const priorityPatients = [
  { patientId: "ABC-1291", since: "2 days | 01.08.2028", priorityHistory: ["01.08.2028", "12.27.2027"], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: null, flag: false, unseen: false },
  { patientId: "ABC-1252", since: "2 days | 01.08.2028", priorityHistory: ["01.08.2028", "12.20.2027"], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }, { initials: "RC", name: "Ryan Cole", acknowledged: false }]), handling: null, flag: true, unseen: true },
  { patientId: "ABC-1251", since: "2 days | 01.08.2028", unmonitored: true, priorityHistory: ["08.01.2028", "27.12.2027"], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: true }]), handling: { status: "In Progress", name: "Dana Farber", since: "09:11" }, flag: false, unseen: true },
  { patientId: "ABC-1238", since: "3 days | 01.07.2028", priorityHistory: ["01.07.2028"], careTeam: careTeamOf([{ initials: "EC", name: "Emily Carter", acknowledged: true }]), handling: null, flag: false, unseen: false },
  { patientId: "ABC-1242", since: "4 days | 01.06.2028", priorityHistory: ["01.06.2028"], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: null, flag: false, unseen: false },
  { patientId: "ABC-1283", since: "8 days | 01.02.2028", priorityHistory: ["01.02.2028", "12.10.2027"], careTeam: careTeamOf([{ initials: "RC", name: "Ryan Cole", acknowledged: true }, { initials: "DF", name: "Dana Farber", acknowledged: false }]), handling: { status: "In Progress", name: "Dana Farber", since: "08:11" }, flag: false, unseen: false },
  { patientId: "ABC-1292", since: "8 days | 01.02.2028", priorityHistory: ["01.02.2028"], careTeam: careTeamOf([{ initials: "DF", name: "Dana Farber", acknowledged: true }]), handling: { status: "In Progress", name: "Dana Farber", since: "08:07" }, flag: false, unseen: false },
  { patientId: "ABC-1293", since: "9 days | 01.01.2028", priorityHistory: ["01.01.2028"], careTeam: careTeamOf([{ initials: "RC", name: "Ryan Cole", acknowledged: false }]), handling: null, flag: false, unseen: false },
];

const unmonitoredPatients = [
  { patientId: "ABC-1251", since: "1 days | 01.10.2028", priorityHistory: ["08.01.2028", "27.12.2027"] },
  { patientId: "ABC-1221", since: "2 days | 01.09.2028", priorityHistory: ["01.09.2028"] },
  { patientId: "ABC-1294", since: "2 days | 01.09.2028", priorityHistory: ["01.09.2028"] },
  { patientId: "ABC-1295", since: "3 days | 01.08.2028", priorityHistory: ["01.08.2028"] },
  { patientId: "ABC-1296", since: "5 days | 01.05.2028", priorityHistory: ["01.05.2028"] },
  { patientId: "ABC-1297", since: "6 days | 01.04.2028", priorityHistory: ["01.04.2028"] },
];

const heartSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const chevSvg = `<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#4A4F57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const infoSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const flagIcon = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M5 21V4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M5 4H16L13.5 8L16 12H5" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

/* Logged-in backoffice user viewing the redacted clinic view (no "Emily
   Carter" clinician identity here -- this is an internal ops user). */
const CURRENT_USER = "Backoffice";
const CURRENT_USER_INITIALS = "BO";

function patientDetailRowHtml(p) {
  return `
    <div class="p-detail-grid">
      <div class="p-detail-col">
        <div class="p-detail-title">Priority last 30 days</div>
        ${p.priorityHistory.map((d) => `<div class="p-detail-item"><span>Priority</span><span>${d}</span></div>`).join("")}
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
            <span class="p-name-text">${p.patientId}</span>
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

const openPriorityIdx = new Set();

function careAvatarsHtml(p) {
  const acknowledgedNames = p.careTeam.filter((m) => m.acknowledged).map((m) => m.name);
  return `
    <div class="care-team-cell">
      <div class="care-team-avatars">
        ${p.careTeam
          .map(
            (m) => `<span class="care-avatar-sm ${m.acknowledged ? "ack" : "pending"}" title="${m.name} · ${m.acknowledged ? "Acknowledged" : "Not yet acknowledged"}">${m.initials}</span>`
          )
          .join("")}
      </div>
      ${acknowledgedNames.length ? `<div class="care-team-ack-names">Acknowledged by ${acknowledgedNames.join(", ")}</div>` : ""}
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
          ? `<span class="priority-acknowledged-note"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#197A4E" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg> Acknowledged${mine.ackTime ? ` &middot; ${mine.ackTime}` : ""}</span>`
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
              <span class="p-name-text">${p.patientId}</span>
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
