/* ---------------- Support filter-bar controls (Tickets + Incidents tabs) ----------------
   Matches how the developed Support filters behave, using our own
   .bo-multiselect checkbox component for the look:
   - every list filter is a multi-select with an "All" row;
   - the trigger shows the placeholder when nothing is picked, the option's
     name when one is picked, "All" when every option is picked, otherwise
     "N selected";
   - a dependent filter (Issue Type, Assigned To) stays disabled with a
     "Select a ... first" placeholder until its parent filter has a value;
   - long lists get a search box at the top of the menu.
   Picking values only stages them -- the page applies them on "Apply". */

const supFilterCheckIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function supFilterEsc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/* The filter row sits inside scrolling page content, so menus float with
   position: fixed under their trigger instead of being clipped. */
function positionSupFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 300) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

/* options: [{ value, label, group? }]. Options carrying a `group` get a
   small caption per group when more than one group is listed (Issue Type
   with several categories picked, where "Other" exists in each). allLabel
   names the "select every option" row and the trigger text when everything
   is picked. */
function wireSupportMultiFilter(containerId, { options = [], selected = [], disabledPlaceholder = "", searchPlaceholder = "", allLabel = "All" } = {}) {
  const container = document.getElementById(containerId);
  const trigger = container.querySelector(".bo-multiselect-trigger");
  const valueEl = container.querySelector(".bo-multiselect-value");
  const menu = container.querySelector(".bo-multiselect-menu");
  const placeholder = valueEl.textContent.trim();
  let opts = options.slice();
  let picked = new Set(selected);
  let disabled = false;
  let query = "";

  function renderTrigger() {
    const chosen = opts.filter((o) => picked.has(o.value));
    trigger.disabled = disabled;
    valueEl.classList.toggle("placeholder", disabled || chosen.length === 0);
    if (disabled) valueEl.textContent = disabledPlaceholder || placeholder;
    else if (chosen.length === 0) valueEl.textContent = placeholder;
    else if (chosen.length === opts.length && opts.length > 1) valueEl.textContent = allLabel;
    else if (chosen.length === 1) valueEl.textContent = chosen[0].label;
    else valueEl.textContent = `${chosen.length} selected`;
  }

  function optionRow(o) {
    return `<label class="bo-multiselect-option${picked.has(o.value) ? " checked" : ""}" data-value="${supFilterEsc(o.value)}">
        <span class="bo-multiselect-checkbox">${supFilterCheckIcon}</span> ${supFilterEsc(o.label)}
      </label>`;
  }

  function renderList() {
    const list = menu.querySelector(".bo-multiselect-list");
    const q = query.trim().toLowerCase();
    const visible = q ? opts.filter((o) => o.label.toLowerCase().includes(q)) : opts;
    const allChecked = opts.length > 0 && opts.every((o) => picked.has(o.value));
    let html = q ? "" : `<label class="bo-multiselect-option all${allChecked ? " checked" : ""}" data-all="1">
        <span class="bo-multiselect-checkbox">${supFilterCheckIcon}</span> ${supFilterEsc(allLabel)}
      </label>`;
    const groups = Array.from(new Set(visible.map((o) => o.group).filter(Boolean)));
    if (groups.length > 1) {
      groups.forEach((g) => {
        html += `<div class="bo-multiselect-group">${supFilterEsc(g)}</div>` + visible.filter((o) => o.group === g).map(optionRow).join("");
      });
    } else {
      html += visible.map(optionRow).join("");
    }
    if (!visible.length) html += `<div class="bo-multiselect-empty">No matches</div>`;
    list.innerHTML = html;
  }

  function renderMenu() {
    menu.innerHTML =
      (searchPlaceholder ? `<div class="bo-multiselect-search"><input type="text" placeholder="${supFilterEsc(searchPlaceholder)}" /></div>` : "") +
      `<div class="bo-multiselect-list"></div>`;
    const search = menu.querySelector(".bo-multiselect-search input");
    if (search) {
      search.value = query;
      search.addEventListener("input", () => { query = search.value; renderList(); });
    }
    renderList();
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (disabled) return;
    const willOpen = !container.classList.contains("open");
    document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
    closeAllBoSelects();
    if (!willOpen) return;
    query = "";
    renderMenu();
    container.classList.add("open");
    positionSupFilterMenu(trigger, menu);
    const search = menu.querySelector(".bo-multiselect-search input");
    if (search) search.focus();
  });

  menu.addEventListener("click", (e) => {
    e.stopPropagation();
    const option = e.target.closest(".bo-multiselect-option");
    if (!option) return;
    e.preventDefault();
    if (option.dataset.all) {
      const allChecked = opts.every((o) => picked.has(o.value));
      picked = allChecked ? new Set() : new Set(opts.map((o) => o.value));
    } else {
      const v = option.dataset.value;
      if (picked.has(v)) picked.delete(v);
      else picked.add(v);
    }
    renderList();
    renderTrigger();
    container.dispatchEvent(new Event("change"));
  });

  renderTrigger();

  return {
    getSelected: () => opts.filter((o) => picked.has(o.value)).map((o) => o.value),
    setSelected(values) {
      picked = new Set(values);
      renderTrigger();
    },
    /* Replaces the option list (e.g. Issue Types for the picked
       categories); picks that no longer exist are dropped. */
    setOptions(next) {
      opts = next.slice();
      const valid = new Set(opts.map((o) => o.value));
      picked = new Set(Array.from(picked).filter((v) => valid.has(v)));
      renderTrigger();
    },
    setDisabled(next) {
      disabled = next;
      if (disabled) container.classList.remove("open");
      renderTrigger();
    },
  };
}

/* Search box at the top of a single-select .bo-select menu (Organization,
   Create For): typing narrows the options; an "All ..." row always stays.
   Safe to call again after the menu's options are re-rendered. */
function addBoSelectSearch(select, placeholder) {
  const menu = select.querySelector(".bo-select-menu");
  if (!menu.querySelector(".bo-multiselect-search")) {
    const box = document.createElement("div");
    box.className = "bo-multiselect-search";
    box.innerHTML = `<input type="text" placeholder="${supFilterEsc(placeholder)}" />`;
    menu.prepend(box);
    const input = box.querySelector("input");
    box.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      menu.querySelectorAll(".bo-select-option").forEach((o) => {
        o.hidden = !!o.dataset.value && !o.textContent.trim().toLowerCase().includes(q);
      });
    });
  }
  if (select.dataset.searchWired) return;
  select.dataset.searchWired = "1";
  select.querySelector(".bo-select-trigger").addEventListener("click", () => {
    const input = menu.querySelector(".bo-multiselect-search input");
    if (!input) return;
    input.value = "";
    menu.querySelectorAll(".bo-select-option").forEach((o) => { o.hidden = false; });
    setTimeout(() => { if (select.classList.contains("open")) input.focus(); }, 0);
  });
}

/* Issue Type options for the picked categories, in category order. Values
   are "Category|Issue Type" since every category has its own "Other". */
function issueTypeFilterOptions(categories) {
  return categories.flatMap((c) => (ISSUE_TYPES_BY_CATEGORY[c] || []).map((type) => ({ value: `${c}|${type}`, label: type, group: c })));
}

/* Keeps an Issue Type filter in step with its Category filter: disabled
   until a category is picked, then listing only those categories' types. */
function linkIssueTypeToCategory(categoryContainerId, categoryFilter, issueFilter) {
  const sync = () => {
    const categories = categoryFilter.getSelected();
    issueFilter.setOptions(issueTypeFilterOptions(categories));
    issueFilter.setDisabled(!categories.length);
  };
  document.getElementById(categoryContainerId).addEventListener("change", sync);
  sync();
  return sync;
}

const asFilterOptions = (values, labels = {}) => values.map((v) => ({ value: v, label: labels[v] || v }));
const inFilterList = (list, value) => !list.length || list.includes(value);

/* Scrolling inside an open menu (a long Issue Type list) must not close it;
   scrolling the page still does, since the menu is fixed to the trigger. */
document.addEventListener("scroll", (e) => {
  if (e.target instanceof Element && e.target.closest(".bo-multiselect-menu, .bo-select-menu")) return;
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
}, true);
window.addEventListener("resize", () => {
  document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".bo-multiselect")) document.querySelectorAll(".bo-multiselect.open").forEach((el) => el.classList.remove("open"));
});
