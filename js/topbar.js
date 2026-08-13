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
