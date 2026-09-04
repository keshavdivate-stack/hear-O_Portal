/* Backoffice-safe fork of ../../js/topbar.js.
   Why forked instead of shared: the root file's notifData embeds real patient
   names directly in notification titles (e.g. "New priority for <patient
   name>", "sent a message to <patient name>", a patient's clinical
   questionnaire answer) -- exactly the PHI this redacted view must never
   surface, even in page source. Popover open/close plumbing below is
   otherwise identical to the root file. The Support Ticket FAB from the root
   file is intentionally dropped (it was already disabled there, and it pulls
   in js/support-data.js's ticket list, which isn't needed here). */

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

const langPopoverEl = document.getElementById("langPopover");
if (langPopoverEl) {
  langPopoverEl.addEventListener("change", (e) => {
    if (e.target.name !== "lang") return;
    closeAllTopbarPopovers();
  });
}

/* ---------------- Notifications (redacted: administrative/operational only, no patient names) ---------------- */
const notifData = {
  foryou: [
    { avatar: "!", cls: "notif-av-red", title: "A new patient moved to Priority status", time: "Today", unread: true },
    { avatar: "i", cls: "notif-av-gray", title: "A care team message was sent to a patient", time: "1d", unread: false },
    { avatar: "i", cls: "notif-av-gray", title: "A care team message was sent to a patient", time: "1d", unread: false },
  ],
  team: [
    { avatar: "i", cls: "notif-av-darkgray", title: "A patient submitted a weekly questionnaire response", time: "Today", unread: false },
    { avatar: "i", cls: "notif-av-gray", title: "A care recommendation was created for a patient", time: "1d", unread: false },
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
