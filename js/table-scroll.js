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
  const rows = table.querySelectorAll("tbody tr");

  if (!thead || rows.length === 0) {
    scrollEl.style.maxHeight = "none";
    return;
  }

  const visible = Array.from(rows).slice(0, visibleRows);

  const recompute = () => {
    const count = table.querySelectorAll("tbody tr").length;
    if (count <= visibleRows) {
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
