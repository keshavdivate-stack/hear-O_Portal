/* ---------------- Settings > Config > Components > Archived ----------------
   Mirrors components.html's own tabs/columns exactly, filtered to archived
   rows only (see archiveConfig() in components.js, which pushes here instead
   of deleting). Unarchive puts a row back into its original tab's array. */
const ARCH_CONFIG_TARGETS = {
  main: mainConfigs,
  sentences: sentencesConfigs,
  questions: questionsConfigs,
  inputAssessment: inputAssessmentConfigs,
  generalParams: generalParamsConfigs,
  reminder: reminderConfigs,
  iaErrors: iaErrorsConfigs,
};
const ARCH_CONFIG_TABS = Object.keys(ARCH_CONFIG_TARGETS);

function archEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }
function archEscOrDash(v) { return v ? archEsc(v) : "—"; }

const archUnarchiveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M12 17v-6"/><path d="M9 14l3-3 3 3"/></svg>`;
const archUnarchiveBtn = (idx) => `<button type="button" class="bo-unarchive-link arch-config-unarchive" data-idx="${idx}" aria-label="Unarchive">${archUnarchiveIcon}</button>`;

let archConfigSearch = "";
function archConfigEntries(tabKey) {
  return archivedConfigs
    .map((r, i) => ({ r, i }))
    .filter((e) => e.r._tabKey === tabKey && (!archConfigSearch || e.r.name.toLowerCase().includes(archConfigSearch)));
}

const archConfigPagers = {};
ARCH_CONFIG_TABS.filter((t) => t !== "main").forEach((tabKey) => {
  archConfigPagers[tabKey] = boCreatePager(
    `arch-rows-${tabKey}`,
    () => archConfigEntries(tabKey),
    (e) => `
      <tr>
        <td>${archEsc(e.r.name)}</td>
        <td>${archEsc(e.r.archivedDate)}</td>
        <td>${archUnarchiveBtn(e.i)}</td>
      </tr>`,
    { pageSize: 10, emptyColspan: 3, emptyText: "No archived configs." }
  );
});
archConfigPagers.main = boCreatePager(
  "arch-rows-main",
  () => archConfigEntries("main"),
  (e) => `
      <tr>
        <td>${archEsc(e.r.name)}</td>
        <td>${archEscOrDash(e.r.sentencesConfig)}</td>
        <td>${archEscOrDash(e.r.questionsConfig)}</td>
        <td>${archEscOrDash(e.r.inputAssessmentConfig)}</td>
        <td>${archEscOrDash(e.r.generalParamsConfig)}</td>
        <td>${archEscOrDash(e.r.reminderConfig)}</td>
        <td>${archEscOrDash(e.r.iaErrorsConfig)}</td>
        <td>${archEsc(e.r.archivedDate)}</td>
        <td>${archUnarchiveBtn(e.i)}</td>
      </tr>`,
  { pageSize: 10, emptyColspan: 9, emptyText: "No archived main configs." }
);

function archConfigRenderAll() {
  Object.values(archConfigPagers).forEach((p) => p());
}
archConfigRenderAll();

document.getElementById("archConfigSearchInput").addEventListener("input", (e) => {
  archConfigSearch = e.target.value.trim().toLowerCase();
  Object.values(archConfigPagers).forEach((p) => p.resetPage());
  archConfigRenderAll();
});

document.querySelectorAll("#archConfigTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#archConfigTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`archtab-${tab.dataset.tab}`).classList.add("active");
  });
});

/* Unarchive: read the row, drop the archive-only fields, push it back into
   its original tab's live array. */
document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const btn = e.target.closest(".arch-config-unarchive");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const [record] = archivedConfigs.splice(idx, 1);
    const { _tabKey, _type, archivedDate, ...clean } = record;
    (ARCH_CONFIG_TARGETS[_tabKey] || []).push(clean);
    archConfigRenderAll();
  });
});

/* Open on whichever tab was active on the main page when "View Archived" was clicked. */
(function openTabFromUrl() {
  const tabKey = new URLSearchParams(location.search).get("tab");
  if (!tabKey || !ARCH_CONFIG_TABS.includes(tabKey)) return;
  const tabBtn = document.querySelector(`#archConfigTabs .bo-tab[data-tab="${tabKey}"]`);
  if (tabBtn) tabBtn.click();
})();
