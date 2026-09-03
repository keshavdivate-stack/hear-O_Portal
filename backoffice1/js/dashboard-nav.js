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

  const VERSIONS = [
    { label: "Client", value: "2.0.62.11" },
    { label: "Server", value: "2.0.203.9" },
    { label: "Report Microservice", value: "2.0.37.21" },
    { label: "Statistic Microservice", value: "1.0.39.2" },
    { label: "Audit Log Microservice", value: "2.0.3.2" },
    { label: "Settings Service", value: "1.0.35.5" },
    { label: "Session Recording Service", value: "1.0.22.10" },
    { label: "Engine Service", value: "2.0.33.19" },
    { label: "ASR", value: "1.1.0.51" },
    { label: "Voice Engine", value: "3.0.0.0" },
    { label: "Comm Microservice", value: "1.0.1.31" },
    { label: "Clinic Microservice", value: "1.0.0.24" },
    { label: "Sensors Microservice", value: "1.1.0.1" },
  ];

  const overlay = document.createElement("div");
  overlay.className = "bo-center-modal-overlay";
  overlay.id = "viewVersionOverlay";
  overlay.innerHTML = `
    <div class="bo-center-modal">
      <h2>Versions</h2>
      <div class="bo-version-list">
        ${VERSIONS.map((v) => `<div class="bo-version-row"><span>${v.label}</span><span>${v.value}</span></div>`).join("")}
      </div>
      <div class="bo-center-modal-foot">
        <button type="button" class="bo-btn-primary" id="closeViewVersionModal">Close</button>
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
