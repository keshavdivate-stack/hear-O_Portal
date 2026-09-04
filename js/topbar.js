/* ---------------- Shared topbar popovers: Org switcher + Notifications ---------------- */

function closeAllTopbarPopovers(except) {
  document.querySelectorAll(".topbar-popover.open").forEach((p) => {
    if (p !== except) p.classList.remove("open");
  });
}

function wireTopbarToggle(btnId, popoverId) {
  const btn = document.getElementById(btnId);
  const popover = document.getElementById(popoverId);
  if (!btn || !popover) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !popover.classList.contains("open");
    closeAllTopbarPopovers();
    popover.classList.toggle("open", willOpen);
  });
  popover.addEventListener("click", (e) => e.stopPropagation());
}

document.addEventListener("click", () => closeAllTopbarPopovers());

wireTopbarToggle("orgSwitchBtn", "orgPopover");
wireTopbarToggle("notifBtn", "notifPopover");
wireTopbarToggle("langBtn", "langPopover");
wireTopbarToggle("moreBtn", "morePopover");
wireTopbarToggle("profileBtn", "profilePopover");

const langPopoverEl = document.getElementById("langPopover");
if (langPopoverEl) {
  langPopoverEl.addEventListener("change", (e) => {
    if (e.target.name !== "lang") return;
    closeAllTopbarPopovers();
  });
}

/* ---------------- Notifications ---------------- */
const notifData = {
  foryou: [
    { avatar: "ER", cls: "notif-av-red", title: "New priority for Eric Rosso", time: "Today", unread: true },
    { avatar: "JH", cls: "notif-av-gray", title: "Dr. Ellen sent a message to John Hill", time: "1d", unread: false },
    { avatar: "JH", cls: "notif-av-gray", title: "Dr. Ellen sent a message to John Hill", time: "1d", unread: false },
    { avatar: "JH", cls: "notif-av-gray", title: "Dr. Ellen sent a message to John Hill", time: "1d", unread: false },
    { avatar: "JH", cls: "notif-av-gray", title: "Dr. Ellen sent a message to John Hill", time: "1d", unread: false },
  ],
  team: [
    { avatar: "AW", cls: "notif-av-darkgray", title: 'Abe Wong responded "Yes" to at least one of the clinical questions in the app', time: "Today", unread: false },
    { avatar: "JH", cls: "notif-av-gray", title: "Dr. Ellen created a care recommendation for John Hill", time: "1d", unread: false },
  ],
};

const notifUnreadTabCount = { team: 1, foryou: 1 };
let activeNotifTab = "foryou";

function renderNotifTabs() {
  const tabs = document.getElementById("notifTabs");
  if (!tabs) return;
  tabs.querySelectorAll(".notif-tab").forEach((tab) => {
    const key = tab.dataset.tab;
    const count = notifUnreadTabCount[key];
    const label = key === "team" ? "Team" : "For you";
    tab.textContent = count ? `${label} (${count} new)` : label;
    tab.classList.toggle("active", key === activeNotifTab);
  });
}

function renderNotifList() {
  const list = document.getElementById("notifList");
  if (!list) return;
  list.innerHTML = notifData[activeNotifTab]
    .map(
      (n) => `
      <div class="notif-item">
        <span class="notif-avatar ${n.cls}">${n.avatar}</span>
        <div class="notif-body">
          <p class="notif-item-title">${n.title}</p>
          <div class="notif-item-time">${n.time}</div>
        </div>
        <span class="notif-dot ${n.unread ? "unread" : "read"}"></span>
      </div>`
    )
    .join("");
}

function renderNotifications() {
  renderNotifTabs();
  renderNotifList();
}

renderNotifications();

const notifTabsEl = document.getElementById("notifTabs");
if (notifTabsEl) {
  notifTabsEl.addEventListener("click", (e) => {
    const tab = e.target.closest(".notif-tab");
    if (!tab) return;
    activeNotifTab = tab.dataset.tab;
    notifUnreadTabCount[activeNotifTab] = 0;
    renderNotifications();
  });
}

/* ---------------- Support Ticket floating button ----------------
   Bottom-right floating shortcut to this clinic's own tickets (transcript:
   "if it is escalated we need a link to related support ticket" -- clinic
   staff need the same kind of quick access, scoped to tickets raised for
   their clinic rather than assigned to a patient). Skipped on support.html/
   ticket-detail.html since it would just be a shortcut to the page you're
   already on. Requires js/support-data.js (ticketList) loaded before this
   file. */
(function initSupportTicketFab() {
  return; // Disabled for now -- remove this line to bring the FAB back.
  if (typeof ticketList === "undefined") return;
  if (document.getElementById("supportTicketFab")) return;
  const page = location.pathname.split("/").pop();
  if (page === "support.html" || page === "ticket-detail.html") return;

  function currentOrg() {
    const checked = document.querySelector('input[name="org"]:checked');
    return (checked ? checked.value : "b01").toUpperCase();
  }

  function clinicTickets() {
    const org = currentOrg();
    return ticketList.filter((t) => t.type === "Clinic" && t.organization.toUpperCase() === org);
  }

  const fabIcon = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3v-7a9 9 0 0 1 18 0v7h-3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/><path d="M21 16v2a4 4 0 0 1-4 4h-5"/></svg>`;

  const wrap = document.createElement("div");
  wrap.className = "support-fab-wrap";
  wrap.id = "supportTicketFab";
  wrap.innerHTML = `
    <div class="support-fab-panel" id="supportFabPanel">
      <div class="support-fab-panel-head">
        <span>Clinic Support Tickets</span>
        <a href="support.html">View All</a>
      </div>
      <div class="support-fab-panel-list" id="supportFabList"></div>
    </div>
    <button type="button" class="support-fab" id="supportFabBtn" aria-label="Clinic support tickets">${fabIcon}</button>
  `;
  /* nurse-view.html and patient-data.html already have a bottom-right
     floating "+ Add Event" button -- stack this one above it instead of
     overlapping. */
  if (document.querySelector(".add-event-btn")) wrap.classList.add("support-fab-wrap-raised");

  document.body.appendChild(wrap);

  const fabBtn = document.getElementById("supportFabBtn");
  const fabList = document.getElementById("supportFabList");

  function renderFab() {
    const tickets = clinicTickets();
    const openCount = tickets.filter((t) => t.state !== "Resolved").length;
    fabBtn.classList.toggle("badge", openCount > 0);
    if (openCount > 0) fabBtn.dataset.count = openCount;
    else delete fabBtn.dataset.count;

    fabList.innerHTML = tickets.length
      ? tickets
          .slice(0, 5)
          .map(
            (t) => `
        <a class="support-fab-item" href="ticket-detail.html?id=${t.id}">
          <span class="support-fab-item-top">
            <span class="support-fab-item-id">${t.ticketId}</span>
            <span class="ticket-pill ${stateCellClass(t.state)}">${t.state}</span>
          </span>
          <span class="support-fab-item-issue">${t.issueType}</span>
        </a>`
          )
          .join("")
      : `<p class="support-fab-empty">No support tickets for this clinic.</p>`;
  }

  fabBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeAllTopbarPopovers();
    document.getElementById("supportFabPanel").classList.toggle("open");
  });
  wrap.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => document.getElementById("supportFabPanel").classList.remove("open"));

  const orgPopoverEl = document.getElementById("orgPopover");
  if (orgPopoverEl) orgPopoverEl.addEventListener("change", (e) => { if (e.target.name === "org") renderFab(); });

  renderFab();
})();
