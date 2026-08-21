/* Sizes a scrollable table wrapper to exactly N whole rows (header + the
   actual height of the first N rows), so the box never shows a partial
   empty gap below the last visible row. Rows can have different heights
   (e.g. a 1-line "Active" cell vs a 2-line "Priority + Since date" cell),
   so this sums the real height of each visible row instead of assuming a
   uniform row height.
   Re-fits automatically via ResizeObserver whenever a row's rendered size
   changes (e.g. web font swap-in after initial paint), so callers don't
   need to manually re-run this after fonts/layout settle. */
const fitTableObservers = new WeakMap();

function fitTableToRows(selector, visibleRows) {
  const scrollEl = document.querySelector(selector);
  if (!scrollEl) return;
  const table = scrollEl.querySelector("table");
  if (!table) return;
  const thead = table.querySelector("thead");
  const allRows = Array.from(table.querySelectorAll("tbody tr"));

  if (!thead || allRows.length === 0) {
    scrollEl.style.maxHeight = "none";
    return;
  }

  // Rows can be paired with a secondary "detail" row that expands/collapses
  // in place (e.g. .p-detail-row). Count only primary rows toward
  // `visibleRows`, but still include any detail rows in between so an
  // expanded one is reflected in the measured height (it reports 0 while
  // hidden anyway).
  const visible = [];
  let primaryCount = 0;
  for (const row of allRows) {
    if (primaryCount >= visibleRows) break;
    visible.push(row);
    if (!row.classList.contains("p-detail-row")) primaryCount++;
  }
  const primaryTotal = allRows.filter((row) => !row.classList.contains("p-detail-row")).length;

  const recompute = () => {
    if (primaryTotal <= visibleRows) {
      scrollEl.style.maxHeight = "none";
      return;
    }
    const headH = thead.getBoundingClientRect().height;
    const rowsH = visible.reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);
    if (rowsH === 0) {
      scrollEl.style.maxHeight = "none";
      return;
    }
    scrollEl.style.maxHeight = `${Math.ceil(headH + rowsH)}px`;
  };

  recompute();

  if (window.ResizeObserver) {
    const existing = fitTableObservers.get(scrollEl);
    if (existing) existing.disconnect();

    const observer = new ResizeObserver(recompute);
    observer.observe(thead);
    visible.forEach((row) => observer.observe(row));
    fitTableObservers.set(scrollEl, observer);
  }
}

/* Only shows the sticky-column depth-cue shadow (see .list-table th:first-child
   etc. in css/style.css) once a table actually overflows its wrapper — a
   table that already fits the viewport has nothing to scroll to. */
(function watchHorizontalTableScroll() {
  function refresh(el) {
    const hasScroll = el.scrollWidth > el.clientWidth + 1;
    el.classList.toggle("has-h-scroll", hasScroll);
  }

  function watch(el) {
    refresh(el);
    if (!window.ResizeObserver) return;
    const observer = new ResizeObserver(() => refresh(el));
    observer.observe(el);
    const table = el.querySelector("table");
    if (table) observer.observe(table);
    new MutationObserver(() => refresh(el)).observe(el, { childList: true, subtree: true });
  }

  document.querySelectorAll(".table-scroll").forEach(watch);
})();
