/* ---------------- Popovers (shared across all backoffice pages) ---------------- */
function wirePopover(btnId, popoverId) {
  const btn = document.getElementById(btnId);
  const pop = document.getElementById(popoverId);
  if (!btn || !pop) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !pop.classList.contains("open");
    document.querySelectorAll(".bo-popover.open").forEach((p) => p.classList.remove("open"));
    pop.classList.toggle("open", willOpen);
  });
  pop.addEventListener("click", (e) => e.stopPropagation());
}
wirePopover("avatarBtn", "avatarPopover");
wirePopover("notifBtn", "notifPopover");
wirePopover("dashboardNavBtn", "dashboardPopover");
wirePopover("settingsNavBtn", "settingsPopover");
wirePopover("reportsNavBtn", "reportsPopover");
wirePopover("patientsNavBtn", "patientsPopover");
wirePopover("clinicPillBtn", "clinicPillPopover");
document.addEventListener("click", () => {
  document.querySelectorAll(".bo-popover.open").forEach((p) => p.classList.remove("open"));
});

/* Nested flyout (e.g. Settings > Config > Allocation/Components/Session Data) — toggles
   independently of the parent popover instead of closing it. */
function wireSubmenu(btnId, subId) {
  const btn = document.getElementById(btnId);
  const sub = document.getElementById(subId);
  if (!btn || !sub) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    sub.classList.toggle("open");
  });
  sub.addEventListener("click", (e) => e.stopPropagation());
}
wireSubmenu("configSubBtn", "configSubmenu");

/* Shortly after a .bo-drawer opens, drop its transform (see the
   .bo-drawer-settled CSS comment) so fixed-positioned dropdown menus
   opened from inside it anchor to the viewport, not the modal box.
   Uses a timer rather than `transitionend` because the overlay goes
   display:none -> flex in the same tick as the transform change, so
   there's no "before" frame for the browser to transition from and
   that event never fires. */
document.querySelectorAll(".bo-drawer-overlay").forEach((overlay) => {
  const drawer = overlay.querySelector(".bo-drawer");
  if (!drawer) return;
  let settleTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(settleTimer);
    if (overlay.classList.contains("open")) {
      settleTimer = setTimeout(() => drawer.classList.add("bo-drawer-settled"), 200);
    } else {
      drawer.classList.remove("bo-drawer-settled");
    }
  });
  observer.observe(overlay, { attributes: true, attributeFilter: ["class"] });
});

document.querySelectorAll(".bo-popover-item[data-val]").forEach((item) => {
  item.addEventListener("click", () => {
    const group = item.closest(".bo-popover");
    group.querySelectorAll(".bo-popover-item").forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    const pillBtn = group.previousElementSibling;
    if (pillBtn && pillBtn.classList.contains("bo-clinic-pill")) {
      pillBtn.childNodes[1].textContent = ` ${item.dataset.val} `;
    }
  });
});

/* ---------------- "View Version" modal (avatar menu) ----------------
   Built once and appended to <body> here (rather than duplicated into
   every page's HTML) since every backoffice page loads this same script. */
(function initViewVersionModal() {
  const trigger = document.getElementById("viewVersionBtn");
  if (!trigger) return;

  const SUMMARY_VERSIONS = [
    { label: "Cordio HearO™ software version", value: "3.1.0.0" },
    { label: "Portal software version", value: "3.1.0.0" },
  ];

  const VERSIONS = [
    { label: "Client", value: "2.0.62.11" },
    { label: "Server", value: "2.0.203.9" },
    { label: "Report Microservice", value: "2.0.37.21" },
    { label: "Statistic Microservice", value: "1.0.39.2" },
    { label: "Audit Log Microservice", value: "2.0.3.2" },
    { label: "Settings Service", value: "1.0.35.5" },
    { label: "Session Recording Service", value: "1.0.22.10" },
    { label: "Engine Service", value: "2.0.33.20" },
    { label: "ASR", value: "1.1.0.51" },
    { label: "Voice Engine", value: "3.0.0.0" },
    { label: "Comm Microservice", value: "1.0.1.31" },
    { label: "Clinic Microservice", value: "1.0.0.24" },
    { label: "Sensors Microservice", value: "1.1.0.1" },
  ];

  const overlay = document.createElement("div");
  overlay.className = "bo-center-modal-overlay";
  overlay.id = "viewVersionOverlay";
  /* Same content and order as the developed Versions dialog: every version as
     "Label: value", then the device labelling (MD / manufacturer / IFU) and
     the caution note. Closes from the header x (no footer button). */
  const versionRow = (v) => `<div class="bo-version-row"><span>${v.label}:</span> <b>${v.value}</b></div>`;
  overlay.innerHTML = `
    <div class="bo-center-modal bo-version-modal">
      <div class="bo-center-modal-head">
        <h2>Versions</h2>
        <button type="button" class="bo-drawer-close" id="closeViewVersionModal" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>
        </button>
      </div>
      <div class="bo-version-body">
        <div class="bo-version-list">${SUMMARY_VERSIONS.concat(VERSIONS).map(versionRow).join("")}</div>
        <div class="bo-version-label">
          <div class="bo-version-label-row">
            <span class="bo-version-icon bo-version-icon-md">MD</span>
            <span>Cordio Hearo</span>
          </div>
          <div class="bo-version-label-row">
            <svg class="bo-version-icon" width="24" height="22" viewBox="0 0 24 22" fill="currentColor" aria-hidden="true"><path d="M0 22V9l6 4V9l6 4V9l6 4V0h6v22z"/></svg>
            <span>Cordio Medical Ltd<br />6 Yoni Netanyahu Street<br />Or Yehuda 6037604<br />ISRAEL<br />Telephone: +972-3-5467163<br />www.cordio-med.com</span>
          </div>
          <div class="bo-version-label-row">
            <svg class="bo-version-icon" width="26" height="20" viewBox="0 0 26 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M1 3l12-2v18L1 17z"/><path d="M13 1l12 2v14l-12 2z"/><path d="M19 8v6"/><circle cx="19" cy="5.5" r="0.6" fill="currentColor"/></svg>
            <span>Consult the instructions for use</span>
          </div>
        </div>
        <div class="bo-version-caution">
          <b>Caution:</b>
          <p>This software is provided for demonstration, evaluation, and training purposes only.<br />It is not intended to diagnose, treat, cure, mitigate, or prevent any disease or condition.</p>
          <p class="bo-version-caution-strong">Do Not Use for Clinical Decisions</p>
        </div>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function openModal() {
    document.querySelectorAll(".bo-popover.open").forEach((p) => p.classList.remove("open"));
    overlay.classList.add("open");
  }
  function closeModal() {
    overlay.classList.remove("open");
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    openModal();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  document.getElementById("closeViewVersionModal").addEventListener("click", closeModal);
})();

/* ---------------- Change Password / Logout (avatar menu) ----------------
   This script is loaded from both backoffice1/*.html (as "js/dashboard-nav.js")
   and backoffice1/clinic/*.html (as "../js/dashboard-nav.js"), so a relative
   redirect needs to account for the extra "clinic/" path segment on the
   latter -- boBase resolves both back to backoffice1/login.html and
   backoffice1/change-password.html. */
(function initAccountMenuNav() {
  const boBase = /\/clinic\//.test(location.pathname) ? "../" : "";

  const changePasswordBtn = document.getElementById("changePasswordBtn");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      window.location.href = boBase + "change-password.html";
    });
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = boBase + "login.html?loggedOut=1";
    });
  }
})();
