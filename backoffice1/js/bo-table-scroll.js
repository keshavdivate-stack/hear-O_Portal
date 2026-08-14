/* Only shows the sticky-column depth-cue shadow (see .bo-list-table
   th:first-child etc. in css/style.css) once a table actually overflows
   its wrapper — a table that already fits the viewport has nothing to
   scroll to. */
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

  document.querySelectorAll(".bo-table-scroll").forEach(watch);
})();
