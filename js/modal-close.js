/* ---------------- Close (X) on every centred popup ----------------
   Adds the round X to the top-right of each .modal-overlay > .modal that
   doesn't already have one. Clicking it does what the popup's own Cancel
   button does (so any reset logic still runs); popups without a Cancel
   simply close. */
(function () {
  const ICON = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg>`;

  function close(overlay, xBtn) {
    const modal = overlay.querySelector(".modal");
    const cancel = [...modal.querySelectorAll("button")].find(
      (b) => b !== xBtn && !b.hidden && (/^cancel/i.test(b.id) || /^\s*cancel\s*$/i.test(b.textContent))
    );
    if (cancel) cancel.click();
    else overlay.classList.remove("open", "show", "active");
  }

  function addX(overlay) {
    const modal = overlay.querySelector(":scope > .modal");
    if (!modal || modal.querySelector(".modal-close-x")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "modal-close-x modal-close-x-top modal-close-x-auto";
    btn.setAttribute("aria-label", "Close");
    btn.innerHTML = ICON;
    btn.addEventListener("click", () => close(overlay, btn));
    modal.prepend(btn);
  }

  document.querySelectorAll(".modal-overlay").forEach(addX);
  // Popups added to the page later get one too
  new MutationObserver((records) => {
    records.forEach((r) => r.addedNodes.forEach((n) => {
      if (n.nodeType !== 1) return;
      if (n.matches(".modal-overlay")) addX(n);
      n.querySelectorAll?.(".modal-overlay").forEach(addX);
    }));
  }).observe(document.body, { childList: true, subtree: true });
})();
