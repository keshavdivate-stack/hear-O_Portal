/* ---------------- Settings > Config > Session Data > Archived ----------------
   Mirrors session-data.html's own tabs/columns, filtered to archived rows only
   (see the sd-archive-trigger handler in session-data.js, which pushes here
   instead of deleting -- record._label is the display name computed there).
   Unarchive puts a row back into its original tab's live array. */
const ARCH_SD_TARGETS = {
  sentences: sentencesData,
  questions: questionsData,
  answers: answersData,
  iaErrors: iaErrorsData,
  reminderTimeRange: reminderTimeRangeData,
};
const ARCH_SD_TABS = Object.keys(ARCH_SD_TARGETS);

function archSdEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }
function archSdVal(v) { return v === undefined || v === null || v === "" ? "--" : archSdEsc(v); }

const archSdUnarchiveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v6h6"/><path d="M3 9a9 9 0 1 0 2.6-6.35"/></svg>`;
const archSdUnarchiveBtn = (idx) => `<button type="button" class="bo-unarchive-link arch-sd-unarchive" data-idx="${idx}" aria-label="Unarchive">${archSdUnarchiveIcon}</button>`;

let archSdSearch = "";
function archSdEntries(tabKey) {
  return archivedSessionData
    .map((r, i) => ({ r, i }))
    .filter((e) => e.r._tabKey === tabKey && (!archSdSearch || e.r._label.toLowerCase().includes(archSdSearch)));
}

const ARCH_SD_ROW_RENDERERS = {
  sentences: (e) => `
      <tr>
        <td>${archSdEsc(e.r.identifier)}</td>
        <td>${archSdEsc(e.r.language)}</td>
        <td>${archSdEsc(e.r.sentence)}</td>
        <td>${archSdUnarchiveBtn(e.i)}</td>
      </tr>`,
  questions: (e) => `
      <tr>
        <td>${archSdEsc(e.r.type)}</td>
        <td>${archSdVal(e.r.decimal)}</td>
        <td>${archSdVal(e.r.min)}</td>
        <td>${archSdVal(e.r.max)}</td>
        <td>${archSdEsc(e.r.questions.EN)}</td>
        <td>${archSdUnarchiveBtn(e.i)}</td>
      </tr>`,
  answers: (e) => `
      <tr>
        <td>${archSdEsc(e.r.name)}</td>
        <td>${archSdEsc(e.r.answers.EN || e.r.answers.AR || "")}</td>
        <td>${archSdUnarchiveBtn(e.i)}</td>
      </tr>`,
  iaErrors: (e) => `
      <tr>
        <td>${archSdEsc(e.r.name)}</td>
        <td>${archSdEsc(e.r.identifier)}</td>
        <td>${archSdEsc(e.r.priority)}</td>
        <td>${archSdEsc(e.r.rerecordAttempts)}</td>
        <td>${archSdEsc(e.r.sessionRerecordAttempts)}</td>
        <td>${archSdUnarchiveBtn(e.i)}</td>
      </tr>`,
  reminderTimeRange: (e) => `
      <tr>
        <td>${archSdEsc(e.r.name)}</td>
        <td>${archSdEsc(e.r.start)}</td>
        <td>${archSdEsc(e.r.end)}</td>
        <td>${archSdEsc(e.r.defaultTime)}</td>
        <td>${archSdUnarchiveBtn(e.i)}</td>
      </tr>`,
};
const ARCH_SD_COLSPAN = { sentences: 4, questions: 6, answers: 3, iaErrors: 6, reminderTimeRange: 5 };

const archSdPagers = {};
ARCH_SD_TABS.forEach((tabKey) => {
  archSdPagers[tabKey] = boCreatePager(
    `arch-sd-rows-${tabKey}`,
    () => archSdEntries(tabKey),
    ARCH_SD_ROW_RENDERERS[tabKey],
    { pageSize: 10, emptyColspan: ARCH_SD_COLSPAN[tabKey], emptyText: "No archived entries." }
  );
});

function archSdRenderAll() {
  Object.values(archSdPagers).forEach((p) => p());
}
archSdRenderAll();

document.getElementById("archSdSearchInput").addEventListener("input", (e) => {
  archSdSearch = e.target.value.trim().toLowerCase();
  Object.values(archSdPagers).forEach((p) => p.resetPage());
  archSdRenderAll();
});

document.querySelectorAll("#archSdTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#archSdTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`archsdtab-${tab.dataset.tab}`).classList.add("active");
  });
});

document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const btn = e.target.closest(".arch-sd-unarchive");
    if (!btn) return;
    const idx = Number(btn.dataset.idx);
    const [record] = archivedSessionData.splice(idx, 1);
    const { _tabKey, _type, _label, archivedDate, ...clean } = record;
    (ARCH_SD_TARGETS[_tabKey] || []).push(clean);
    archSdRenderAll();
  });
});

(function openTabFromUrl() {
  const tabKey = new URLSearchParams(location.search).get("tab");
  if (!tabKey || !ARCH_SD_TABS.includes(tabKey)) return;
  const tabBtn = document.querySelector(`#archSdTabs .bo-tab[data-tab="${tabKey}"]`);
  if (tabBtn) tabBtn.click();
})();
