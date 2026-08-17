/* Generic wiring for the "filter icon -> popover" toolbar pattern: toggles
   the popover open/closed, shows a badge on the trigger for how many
   filters are currently set, and wires an optional "Clear all" link.
   Load this AFTER the page's own script so setBoSelectValue (defined per
   page alongside its bo-select components) is already on window. */
(function () {
  function countActive(popover) {
    let count = 0;
    popover.querySelectorAll(".bo-select").forEach((select) => {
      const hidden = select.querySelector("input[type=hidden]");
      if (hidden && hidden.value) count++;
    });
    popover.querySelectorAll("select").forEach((select) => {
      if (select.value) count++;
    });
    popover.querySelectorAll('input[type="text"], input[type="search"], input[type="date"]').forEach((input) => {
      if (input.value.trim()) count++;
    });
    return count;
  }

  function refreshBadge(trigger, popover) {
    const count = countActive(popover);
    let badge = trigger.querySelector(".bo-filter-badge");
    if (count > 0) {
      trigger.classList.add("has-active");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "bo-filter-badge";
        trigger.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      trigger.classList.remove("has-active");
      if (badge) badge.remove();
    }
  }

  document.querySelectorAll(".bo-filter-trigger[data-filter-target]").forEach((trigger) => {
    const popover = document.getElementById(trigger.dataset.filterTarget);
    if (!popover) return;

    refreshBadge(trigger, popover);

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = !popover.classList.contains("open");
      document.querySelectorAll(".bo-filter-popover.open").forEach((p) => p.classList.remove("open"));
      popover.classList.toggle("open", willOpen);
    });

    popover.addEventListener("click", (e) => e.stopPropagation());
    popover.addEventListener("change", () => refreshBadge(trigger, popover));
    popover.addEventListener("input", () => refreshBadge(trigger, popover));

    const clearBtn = popover.querySelector(".bo-filter-popover-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        popover.querySelectorAll(".bo-select").forEach((select) => {
          if (typeof setBoSelectValue === "function") setBoSelectValue(select, "");
        });
        popover.querySelectorAll("select").forEach((select) => {
          if (!select.value) return;
          select.value = "";
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
        popover.querySelectorAll('input[type="text"], input[type="search"], input[type="date"]').forEach((input) => {
          if (!input.value) return;
          input.value = "";
          input.type = "text";
          input.dispatchEvent(new Event("input", { bubbles: true }));
        });
        refreshBadge(trigger, popover);
        const applyBtn = popover.querySelector('[id$="ApplyBtn"]');
        if (applyBtn) applyBtn.click();
      });
    }
  });

  document.addEventListener("click", () => {
    document.querySelectorAll(".bo-filter-popover.open").forEach((p) => p.classList.remove("open"));
  });
})();
