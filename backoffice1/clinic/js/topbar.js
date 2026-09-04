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

/* ---------------- "More" menu info modals: View Version / Terms of Service /
   Privacy Notice / Instructions for Use. Built once and appended to <body>
   here (rather than duplicated into every page's HTML) since every clinic
   portal page loads this same script. */
(function initMoreMenuModals() {
  function buildModal(id, title, bodyHtml) {
    const overlay = document.createElement("div");
    overlay.className = "info-modal-overlay";
    overlay.id = id;
    overlay.innerHTML = `
      <div class="info-modal">
        <h2>${title}</h2>
        ${bodyHtml}
        <div class="info-modal-foot">
          <button type="button" class="btn-save enabled" data-close-info-modal>Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target.closest("[data-close-info-modal]")) overlay.classList.remove("open");
    });
    return overlay;
  }

  function wireInfoModal(triggerId, overlay) {
    const trigger = document.getElementById(triggerId);
    if (!trigger) return;
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllTopbarPopovers();
      overlay.classList.add("open");
    });
  }

  const VERSIONS = [
    { label: "Client", value: "2.0.62.11" },
    { label: "Server", value: "2.0.203.9" },
    { label: "Report Microservice", value: "2.0.37.21" },
    { label: "Statistic Microservice", value: "1.0.39.2" },
    { label: "Audit Log Microservice", value: "2.0.3.2" },
    { label: "Settings Service", value: "1.0.35.5" },
    { label: "Session Recording Service", value: "1.0.22.10" },
    { label: "Engine Service", value: "2.0.33.19" },
    { label: "Clinic Microservice", value: "1.0.0.24" },
  ];

  wireInfoModal(
    "viewVersionBtn",
    buildModal(
      "viewVersionOverlay",
      "Versions",
      `<div class="version-list">${VERSIONS.map((v) => `<div class="version-row"><span>${v.label}</span><span>${v.value}</span></div>`).join("")}</div>`
    )
  );

  wireInfoModal(
    "termsOfServiceBtn",
    buildModal(
      "termsOfServiceOverlay",
      "Terms of Service",
      `<div class="info-modal-body">
        <p>By using the HearO clinic portal you agree to use it only for authorized patient care and administrative purposes, and to protect the confidentiality of any patient information you access.</p>
        <p>Full terms are provided to your organization at onboarding and are available from your account administrator.</p>
      </div>`
    )
  );

  wireInfoModal(
    "privacyNoticeBtn",
    buildModal(
      "privacyNoticeOverlay",
      "Privacy Notice",
      `<div class="info-modal-body">
        <p>Patient data in this portal is collected and processed solely to support clinical monitoring and care coordination, in line with applicable healthcare privacy regulations.</p>
        <p>Access is logged and limited to authorized care team members. Contact your privacy officer for the full policy.</p>
      </div>`
    )
  );

  wireInfoModal(
    "instructionsForUseBtn",
    buildModal(
      "instructionsForUseOverlay",
      "Instructions for Use",
      `<div class="info-modal-body">
        <p>Use the sidebar to navigate between the Dashboard, Patient List, Billing, Audit Trail, Manage Users, CTM and Support sections.</p>
        <p>For step-by-step device setup and monitoring guidance, see the Patient Onboarding Guide from the profile menu.</p>
      </div>`
    )
  );
})();
