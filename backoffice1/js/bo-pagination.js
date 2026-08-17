/* ---------------- Generic table pagination helper (shared across config pages) ---------------- */
function boCreatePager(tbodyId, getItems, renderRow, opts) {
  opts = opts || {};
  var pageSize = opts.pageSize || 10;
  var emptyColspan = opts.emptyColspan || 6;
  var emptyText = opts.emptyText || "No records yet.";

  var tbody = document.getElementById(tbodyId);
  var card = tbody.closest(".bo-table-card");
  var page = 1;

  var footer = document.createElement("div");
  footer.className = "bo-list-footer";
  footer.innerHTML =
    '<span>Items per page: <b>' + pageSize + '</b></span>' +
    '<span class="bo-pager-range">1 – 0 of 0</span>' +
    '<div class="bo-pager">' +
    '<button type="button" class="bo-pager-btn" data-p="first" aria-label="First page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M18 6L12 12L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 6L5 12L11 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="bo-pager-btn" data-p="prev" aria-label="Previous page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 6L9 12L15 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="bo-pager-btn" data-p="next" aria-label="Next page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '<button type="button" class="bo-pager-btn" data-p="last" aria-label="Last page"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6L12 12L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 6L19 12L13 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
    '</div>';
  card.appendChild(footer);

  var rangeEl = footer.querySelector(".bo-pager-range");
  var firstBtn = footer.querySelector('[data-p="first"]');
  var prevBtn = footer.querySelector('[data-p="prev"]');
  var nextBtn = footer.querySelector('[data-p="next"]');
  var lastBtn = footer.querySelector('[data-p="last"]');

  function render() {
    var items = getItems();
    var total = items.length;
    var totalPages = Math.max(1, Math.ceil(total / pageSize));
    page = Math.min(Math.max(1, page), totalPages);
    var start = (page - 1) * pageSize;
    var pageItems = items.slice(start, start + pageSize);

    var emptyHtml = opts.emptyHtml ||
      '<tr><td colspan="' + emptyColspan + '" style="text-align:center; color:var(--gray-text); padding:28px;">' + emptyText + '</td></tr>';

    tbody.innerHTML = pageItems.length ? pageItems.map(renderRow).join("") : emptyHtml;

    var rangeStart = total === 0 ? 0 : start + 1;
    var rangeEnd = total === 0 ? 0 : Math.min(start + pageSize, total);
    rangeEl.textContent = rangeStart + " – " + rangeEnd + " of " + total;

    firstBtn.disabled = page === 1;
    prevBtn.disabled = page === 1;
    nextBtn.disabled = page === totalPages;
    lastBtn.disabled = page === totalPages;
  }

  firstBtn.addEventListener("click", function () { page = 1; render(); });
  prevBtn.addEventListener("click", function () { page -= 1; render(); });
  nextBtn.addEventListener("click", function () { page += 1; render(); });
  lastBtn.addEventListener("click", function () {
    page = Math.max(1, Math.ceil(getItems().length / pageSize));
    render();
  });

  render.resetPage = function () { page = 1; };
  return render;
}
