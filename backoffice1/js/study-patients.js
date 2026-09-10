/* Drill-down list opened from a Study dashboard donut segment. The live data
   endpoint for this isn't available yet -- until it is, this only wires up
   the tabs and an empty state so the flow can be reviewed end-to-end. */
const spParams = new URLSearchParams(window.location.search);
const spOrgParam = spParams.get("org") || "all";
const spInitialTab = spParams.get("tab") || "all";

document.getElementById("spBackLink").href = `mkt-study.html?org=${encodeURIComponent(spOrgParam)}`;

const spEmptyHtml = `
  <tr><td colspan="6">
    <div class="bo-empty-state">
      <svg class="bo-empty-state-icon" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9H21"/><path d="M8 2v4"/><path d="M16 2v4"/></svg>
      <p class="bo-empty-state-title">No data available</p>
      <p class="bo-empty-state-sub">Patient records for this view will appear here once available.</p>
    </div>
  </td></tr>`;

function spRenderTab(tab) {
  document.querySelectorAll("#spTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  document.getElementById("spRows").innerHTML = spEmptyHtml;
}

document.getElementById("spTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  spRenderTab(btn.dataset.tab);
});

spRenderTab(spInitialTab);
