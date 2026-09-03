/* ---------------- Shared custom "custom-select" dropdown plumbing ----------------
   Extracted out of support.js so any clinic page can use the same
   .custom-select / .custom-select-trigger / .custom-select-value /
   .custom-select-menu / .custom-select-option dropdown widget without
   loading all of support.js's ticket-list-specific code (e.g.
   ticket-detail.html, which never shows the ticket list). Self-invokes
   initCustomSelects() at the bottom so any page that includes this file
   gets working dropdowns with no extra wiring. */
function setCustomSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".custom-select-value");
  const option = select.querySelector(`.custom-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionCustomSelectMenu(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function resetCustomSelect(select) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
}

function initCustomSelects() {
  document.querySelectorAll(".custom-select").forEach((select) => {
    const trigger = select.querySelector(".custom-select-trigger");
    const valueEl = select.querySelector(".custom-select-value");
    const hiddenInput = select.querySelector("input[type=hidden]");

    valueEl.dataset.placeholder = valueEl.textContent.trim();
    hiddenInput.dataset.default = hiddenInput.value;

    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      if (trigger.disabled) return;
      const willOpen = !select.classList.contains("open");
      document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
      if (willOpen) positionCustomSelectMenu(select);
      select.classList.toggle("open", willOpen);
    });

    select.addEventListener("click", (e) => {
      const option = e.target.closest(".custom-select-option");
      if (!option) return;
      setCustomSelectValue(select, option.dataset.value);
      select.classList.remove("open");
    });
  });

  document.addEventListener("click", closeAllCustomSelects);
  document.addEventListener("scroll", closeAllCustomSelects, true);
  window.addEventListener("resize", closeAllCustomSelects);
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

initCustomSelects();

function buildCustomSelectOptions(values) {
  return values
    .map(
      (v) => `
      <div class="custom-select-option" data-value="${v}">${v}
        <svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
}
