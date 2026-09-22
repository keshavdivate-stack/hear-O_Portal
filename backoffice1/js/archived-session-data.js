/* ---------------- Settings > Config > Session Data > Archived ----------------
   Lists every archived entry across all Session Data tabs (see the
   sd-archive-trigger handler in session-data.js, which pushes here instead
   of deleting). Unarchive puts the row back into its original tab's array. */
const ARCH_SD_TARGETS = {
  sentences: sentencesData,
  questions: questionsData,
  answers: answersData,
  iaErrors: iaErrorsData,
  reminderTimeRange: reminderTimeRangeData,
};

function archSdEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

const archSdUnarchiveIcon = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v6h6"/><path d="M3 9a9 9 0 1 0 2.6-6.35"/></svg>`;

let archSdSearch = "";

const archSdPager = boCreatePager(
  "archSdRows",
  () => archivedSessionData
    .map((r, i) => ({ r, i }))
    .filter((e) => !archSdSearch || e.r._label.toLowerCase().includes(archSdSearch)),
  (e) => `
    <tr>
      <td><strong>${archSdEsc(e.r._label)}</strong></td>
      <td><span class="bo-pill bo-pill-archive-type">${archSdEsc(e.r._type)}</span></td>
      <td>${archSdEsc(e.r.archivedDate)}</td>
      <td><button type="button" class="bo-unarchive-link" data-idx="${e.i}">${archSdUnarchiveIcon} Unarchive</button></td>
    </tr>`,
  { pageSize: 10, emptyColspan: 4, emptyText: "No archived entries." }
);
archSdPager();

document.getElementById("archSdSearchInput").addEventListener("input", (e) => {
  archSdSearch = e.target.value.trim().toLowerCase();
  archSdPager.resetPage();
  archSdPager();
});

document.getElementById("archSdRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-unarchive-link");
  if (!btn) return;
  const idx = Number(btn.dataset.idx);
  const [record] = archivedSessionData.splice(idx, 1);
  const { _tabKey, _type, _label, archivedDate, ...clean } = record;
  (ARCH_SD_TARGETS[_tabKey] || []).push(clean);
  archSdPager();
});
