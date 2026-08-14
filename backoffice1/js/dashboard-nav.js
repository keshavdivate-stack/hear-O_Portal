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
wirePopover("dashboardNavBtn", "dashboardPopover");
wirePopover("settingsNavBtn", "settingsPopover");
wirePopover("reportsNavBtn", "reportsPopover");
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
