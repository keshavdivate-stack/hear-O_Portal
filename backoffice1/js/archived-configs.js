/* ---------------- Settings > Config > Components > Archived ----------------
   Lists every archived config across all Components tabs (see
   archiveConfig() in components.js, which pushes here instead of deleting).
   Unarchive puts the row back into its original tab's array. */
const ARCH_CONFIG_TARGETS = {
  main: mainConfigs,
  sentences: sentencesConfigs,
  questions: questionsConfigs,
  inputAssessment: inputAssessmentConfigs,
  generalParams: generalParamsConfigs,
  reminder: reminderConfigs,
  iaErrors: iaErrorsConfigs,
};

function archEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

const archUnarchiveIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v6h6"/><path d="M3 9a9 9 0 1 0 2.6-6.35"/></svg>`;

let archConfigSearch = "";

const archConfigPager = boCreatePager(
  "archConfigRows",
  () => archivedConfigs
    .map((r, i) => ({ r, i }))
    .filter((e) => !archConfigSearch || e.r.name.toLowerCase().includes(archConfigSearch)),
  (e) => `
    <tr>
      <td><strong>${archEsc(e.r.name)}</strong></td>
      <td><span class="bo-pill bo-pill-archive-type">${archEsc(e.r._type)}</span></td>
      <td>${archEsc(e.r.archivedDate)}</td>
      <td><button type="button" class="bo-unarchive-link" data-idx="${e.i}">${archUnarchiveIcon} Unarchive</button></td>
    </tr>`,
  { pageSize: 10, emptyColspan: 4, emptyText: "No archived configurations." }
);
archConfigPager();

document.getElementById("archConfigSearchInput").addEventListener("input", (e) => {
  archConfigSearch = e.target.value.trim().toLowerCase();
  archConfigPager.resetPage();
  archConfigPager();
});

document.getElementById("archConfigRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-unarchive-link");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const [record] = archivedConfigs.splice(idx, 1);
  const { _tabKey, _type, archivedDate, ...clean } = record;
  (ARCH_CONFIG_TARGETS[_tabKey] || []).push(clean);
  archConfigPager();
});
