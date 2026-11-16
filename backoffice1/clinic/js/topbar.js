/* Backoffice-safe fork of ../../js/topbar.js.
   Why forked instead of shared: the root file's notifData / messagesData embed
   real patient names in their titles (e.g. "New priority for <patient name>",
   "sent a message to <patient name>") -- exactly what this redacted view must
   never surface, even in page source. Patients are referred to by their user
   number (e.g. ABC-1254) instead. Popover open/close plumbing is otherwise
   identical to the root file.

   Backoffice-only additions (every page in this folder loads this script, so
   they live here instead of being copy-pasted into each page's HTML):
   - "Back to Backoffice" button injected at the start of the top navbar.
   - The clinic picked from Backoffice's CLINIC dropdown (?org=<code>) is
     remembered for the session and shown as the selected org. */

/* ---------------- Back to Backoffice + current clinic ---------------- */
(function initBackofficeReturn() {
  const RETURN_KEY = "boClinicReturnUrl";
  const ORG_KEY = "boClinicOrg";
  const FALLBACK = "../overview-dashboard.html";

  function safeGet(key) { try { return sessionStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { sessionStorage.setItem(key, val); } catch (e) {} }

  /* Remember the Backoffice page the user came from (any backoffice1 page
     outside this clinic folder), so "Back" returns there instead of always
     landing on the overview dashboard. */
  try {
    if (document.referrer) {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin && /\/backoffice1\//.test(ref.pathname) && !/\/backoffice1\/clinic\//.test(ref.pathname)) {
        safeSet(RETURN_KEY, ref.href);
      }
    }
  } catch (e) {}

  const params = new URLSearchParams(location.search);
  const orgParam = params.get("org");
  if (orgParam) safeSet(ORG_KEY, orgParam.toUpperCase());
  const org = safeGet(ORG_KEY) || "B01";

  /* Styles live here (not in ../../css/style.css) so the shared clinic
     portal stylesheet stays untouched by Backoffice-only chrome. */
  if (!document.getElementById("boClinicChromeStyles")) {
    const style = document.createElement("style");
    style.id = "boClinicChromeStyles";
    style.textContent = `
      .bo-back-btn {
        display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0;
        height: 38px; padding: 0 14px 0 10px;
        background: #fff; border: 1.5px solid var(--gray-border, #E2E6EB); border-radius: 10px;
        font: inherit; font-size: 14px; font-weight: 700; color: var(--gray-text, #44403C);
        text-decoration: none; cursor: pointer; white-space: nowrap;
      }
      .bo-back-btn:hover { background: var(--bg, #F4F6F8); }
      .bo-back-btn svg { flex-shrink: 0; }
      .bo-back-org {
        display: inline-flex; align-items: center; height: 22px; padding: 0 8px; margin-left: 2px;
        border-radius: 6px; background: var(--bg, #F4F6F8); font-size: 12px; font-weight: 700; color: #6B7684;
      }
    `;
    document.head.appendChild(style);
  }

  const topbar = document.querySelector(".topbar");
  if (topbar && !topbar.querySelector(".bo-back-btn")) {
    const back = document.createElement("a");
    back.className = "bo-back-btn";
    back.href = safeGet(RETURN_KEY) || FALLBACK;
    back.title = "Back to Backoffice";
    back.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>Back to Backoffice<span class="bo-back-org">${org}</span>`;
    topbar.insertBefore(back, topbar.firstChild);
  }

  /* Org switcher: make sure the clinic opened from Backoffice is listed and selected. */
  const orgPopover = document.getElementById("orgPopover");
  if (orgPopover) {
    const value = org.toLowerCase();
    let input = orgPopover.querySelector(`input[name="org"][value="${value}"]`);
    if (!input) {
      const label = document.createElement("label");
      label.className = "org-radio-item";
      label.innerHTML = `<input type="radio" name="org" value="${value}" /><span class="radio-dot"></span>${org}`;
      orgPopover.insertBefore(label, orgPopover.firstChild);
      input = label.querySelector("input");
    }
    input.checked = true;
  }
})();

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
wireTopbarToggle("messagesBtn", "messagesPopover");
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

/* ---------------- Notifications (patients by user number, never by name) ---------------- */
const notifData = {
  foryou: [
    { avatar: "!", cls: "notif-av-red", title: "New priority for patient ABC-1254", time: "Today", unread: true },
    { avatar: "i", cls: "notif-av-gray", title: "Dr. Ellen sent a message to patient ABC-1242", time: "1d", unread: false },
    { avatar: "i", cls: "notif-av-gray", title: "Dr. Ellen sent a message to patient ABC-1242", time: "1d", unread: false },
    { avatar: "i", cls: "notif-av-gray", title: "Dr. Ellen sent a message to patient ABC-1242", time: "1d", unread: false },
  ],
  team: [
    { avatar: "i", cls: "notif-av-darkgray", title: "Patient ABC-1251 responded to at least one of the clinical questions in the app", time: "Today", unread: false },
    { avatar: "i", cls: "notif-av-gray", title: "Dr. Ellen created a care recommendation for patient ABC-1242", time: "1d", unread: false },
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

/* ---------------- Messages (care team members are staff, so named; patients by user number) ---------------- */
const messagesData = [
  { avatar: "SM", cls: "notif-av-red", title: "Dr. Sarah Mitchell: Can you check patient ABC-1242's latest reading?", time: "10m", unread: true },
  { avatar: "JC", cls: "notif-av-gray", title: "Dr. James Carter: Thanks, following up with the patient now.", time: "1h", unread: true },
  { avatar: "AL", cls: "notif-av-darkgray", title: "Amanda Lee, RN: Care plan updated for patient ABC-1254.", time: "3h", unread: false },
  { avatar: "EC", cls: "notif-av-gray", title: "Dr. Emily Chen: Shared a note on the compliance dashboard.", time: "1d", unread: false },
];

function renderMessages() {
  const list = document.getElementById("messagesList");
  if (!list) return;
  list.innerHTML = messagesData.length
    ? messagesData
        .map(
          (m) => `
      <div class="notif-item">
        <span class="notif-avatar ${m.cls}">${m.avatar}</span>
        <div class="notif-body">
          <p class="notif-item-title">${m.title}</p>
          <div class="notif-item-time">${m.time}</div>
        </div>
        <span class="notif-dot ${m.unread ? "unread" : "read"}"></span>
      </div>`
        )
        .join("")
    : `<p class="notif-empty">No messages.</p>`;
}

renderMessages();

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
        <p>Use the sidebar to navigate between the Dashboard, Patient List, Reports, Billing, Audit Trail, Manage Users, CTM, EHR and Support sections.</p>
        <p>For step-by-step device setup and monitoring guidance, see the Patient Onboarding Guide from the profile menu.</p>
      </div>`
    )
  );
})();
