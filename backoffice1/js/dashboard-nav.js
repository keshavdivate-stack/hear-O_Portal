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
wirePopover("settingsNavBtn", "settingsPopover");
wirePopover("patientsNavBtn", "patientsPopover");
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
