/* ---------------- Settings > Config > Session Data ---------------- */
const SD_DATA = {
  sentences: sentencesData,
  questions: questionsData,
  answers: answersData,
  iaErrors: iaErrorsData,
  reminderTimeRange: reminderTimeRangeData,
};

const SD_TAB_META = {
  sentences: { title: "Add/Edit Sentence", addLabel: "Sentence" },
  questions: { title: "Add/Edit Question", addLabel: "Question" },
  answers: { title: "Add/Edit Answer", addLabel: "Answer" },
  iaErrors: { title: "Add/Edit IA Error", addLabel: "IA Error" },
  reminderTimeRange: { title: "Add/Edit Reminder Time Range", addLabel: "Reminder Time Range" },
};

const sdEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`;
const sdTrashIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
const sdArchiveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 13h4"/></svg>`;
const SD_TAB_LABEL = { sentences: "Sentence", questions: "Question", answers: "Answer", iaErrors: "IA Error", reminderTimeRange: "Reminder Time Range" };

function sdNowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function sdEsc(v) {
  return String(v == null ? "" : v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const sdChevronIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const sdQuestionLanguageLabels = { AR: "Arabic", EN: "English", HE: "Hebrew", RU: "Russian", ES: "Spanish", DE: "German" };

function sdQuestionValue(value) {
  return value === undefined || value === null || value === "" ? "--" : sdEsc(value);
}

function sdQuestionDetails(row) {
  return SD_LANGS.map((lang) => `
    <div class="sd-question-detail-item">
      <span class="sd-question-detail-label">${lang} Question</span>
      <span class="sd-question-detail-value"${lang === "AR" || lang === "HE" ? ' dir="auto"' : ""}>${sdQuestionValue(row.questions[lang])}</span>
    </div>`).join("");
}

function sdAnswerDetails(row) {
  return SD_LANGS.map((lang) => `
    <div class="sd-question-detail-item">
      <span class="sd-question-detail-label">${lang} Answer</span>
      <span class="sd-question-detail-value"${lang === "AR" || lang === "HE" ? ' dir="auto"' : ""}>${sdQuestionValue(row.answers[lang])}</span>
    </div>`).join("");
}

/* Every language carries its own Rerecord/Successful/Unsuccessful message
   triple, same shape as sdQuestionDetails/sdAnswerDetails -- the main row
   only shows the EN copy so the table stays scannable. */
function sdIaErrorDetails(row) {
  return SD_LANGS.map((lang) => {
    const m = row.messages[lang] || {};
    const dir = lang === "AR" || lang === "HE" ? ' dir="auto"' : "";
    return `
    <div class="sd-question-detail-item">
      <span class="sd-question-detail-label">${lang} Rerecord Message</span>
      <span class="sd-question-detail-value"${dir}>${sdQuestionValue(m.regular)}</span>
    </div>
    <div class="sd-question-detail-item">
      <span class="sd-question-detail-label">${lang} Successful Rerecord Message</span>
      <span class="sd-question-detail-value"${dir}>${sdQuestionValue(m.successful)}</span>
    </div>
    <div class="sd-question-detail-item">
      <span class="sd-question-detail-label">${lang} Unsuccessful Rerecord Message</span>
      <span class="sd-question-detail-value"${dir}>${sdQuestionValue(m.unsuccessful)}</span>
    </div>`;
  }).join("");
}

function sdActions(tabKey, idx) {
  return `
    <div class="bo-row-actions">
      <button class="bo-action-icon blue sd-edit-trigger" data-tab="${tabKey}" data-idx="${idx}" aria-label="Edit">${sdEditIcon}</button>
      <button class="bo-action-icon archive sd-archive-trigger" data-tab="${tabKey}" data-idx="${idx}" aria-label="Archive">${sdArchiveIcon}</button>
    </div>`;
}

/* Each tab's row shape carries its "name" under a different key -- this
   picks whichever one that tab actually uses, for the archive list's
   Configuration column. */
function sdRecordLabel(tabKey, r) {
  if (tabKey === "sentences") return r.identifier || r.sentence || "—";
  if (tabKey === "questions") return r.questions?.EN || r.type || "—";
  return r.name || "—";
}

/* ---------------- Tabs ---------------- */
const sdAddBtn = document.getElementById("sdAddConfigBtn");
const sdAddBtnLabel = document.getElementById("sdAddConfigBtnLabel");

const sdViewArchivedLink = document.getElementById("sdViewArchivedLink");

document.querySelectorAll("#sessionDataTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#sessionDataTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    sdAddBtn.dataset.tab = tab.dataset.tab;
    sdAddBtnLabel.textContent = SD_TAB_META[tab.dataset.tab].addLabel;
    sdViewArchivedLink.href = `archived-session-data.html?tab=${tab.dataset.tab}`;
  });
});

sdAddBtn.addEventListener("click", () => sdOpenDrawer(sdAddBtn.dataset.tab, null));

/* ---------------- Table rendering ---------------- */
const SD_PAGE_SIZE = 10;
let sentenceLangFilter = "";

function sdEntries(tabKey, filterFn) {
  return SD_DATA[tabKey].map((r, i) => ({ r, i })).filter(filterFn || (() => true));
}

const sdSentencesPager = boCreatePager(
  "rows-sentences",
  () => sdEntries("sentences", (e) => !sentenceLangFilter || e.r.language === sentenceLangFilter),
  (e) => `
      <tr>
        <td>${sdEsc(e.r.identifier)}</td>
        <td>${sdEsc(e.r.language)}</td>
        <td>${sdEsc(e.r.sentence)}</td>
        <td>${sdActions("sentences", e.i)}</td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 4, emptyText: "No sentences yet." }
);

const sdQuestionsPager = boCreatePager(
  "rows-questions",
  () => sdEntries("questions"),
  (e) => `
      <tr class="sd-question-row" data-question-row="${e.i}">
        <td class="sd-question-expand-cell"><button type="button" class="sd-question-expand" data-question-expand="${e.i}" aria-expanded="false" aria-controls="question-details-${e.i}" aria-label="Show question translations">${sdChevronIcon}</button></td>
        <td>${sdEsc(e.r.type)}</td>
        <td class="sd-question-meta">${sdQuestionValue(e.r.decimal)}</td>
        <td class="sd-question-meta">${sdQuestionValue(e.r.min)}</td>
        <td class="sd-question-meta">${sdQuestionValue(e.r.max)}</td>
        <td>${sdEsc(e.r.questions.EN)}</td>
        <td>${sdActions("questions", e.i)}</td>
      </tr>
      <tr class="sd-question-details-row" id="question-details-${e.i}" hidden>
        <td colspan="7"><div class="sd-question-details">${sdQuestionDetails(e.r)}</div></td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 7, emptyText: "No questions yet." }
);

const sdAnswersPager = boCreatePager(
  "rows-answers",
  () => sdEntries("answers"),
  (e) => `
      <tr class="sd-question-row" data-answer-row="${e.i}">
        <td class="sd-question-expand-cell"><button type="button" class="sd-question-expand" data-answer-expand="${e.i}" aria-expanded="false" aria-controls="answer-details-${e.i}" aria-label="Show answer translations">${sdChevronIcon}</button></td>
        <td>${sdEsc(e.r.name)}</td>
        <td>${sdEsc(e.r.answers.EN || e.r.answers.AR || "")}</td>
        <td>${sdActions("answers", e.i)}</td>
      </tr>
      <tr class="sd-question-details-row" id="answer-details-${e.i}" hidden>
        <td colspan="4"><div class="sd-question-details">${sdAnswerDetails(e.r)}</div></td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 4, emptyText: "No answers yet." }
);

const sdIaErrorsPager = boCreatePager(
  "rows-iaErrors",
  () => sdEntries("iaErrors"),
  (e) => `
      <tr class="sd-question-row" data-iaerror-row="${e.i}">
        <td class="sd-question-expand-cell"><button type="button" class="sd-question-expand" data-iaerror-expand="${e.i}" aria-expanded="false" aria-controls="iaerror-details-${e.i}" aria-label="Show IA error translations">${sdChevronIcon}</button></td>
        <td>${sdEsc(e.r.name)}</td>
        <td>${sdEsc(e.r.identifier)}</td>
        <td>${sdEsc(e.r.priority)}</td>
        <td>${sdEsc(e.r.rerecordAttempts)}</td>
        <td>${sdEsc(e.r.sessionRerecordAttempts)}</td>
        <td>${sdQuestionValue(e.r.messages.EN && e.r.messages.EN.regular)}</td>
        <td>${sdQuestionValue(e.r.messages.EN && e.r.messages.EN.successful)}</td>
        <td>${sdQuestionValue(e.r.messages.EN && e.r.messages.EN.unsuccessful)}</td>
        <td>${sdActions("iaErrors", e.i)}</td>
      </tr>
      <tr class="sd-question-details-row" id="iaerror-details-${e.i}" hidden>
        <td colspan="10"><div class="sd-question-details">${sdIaErrorDetails(e.r)}</div></td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 10, emptyText: "No IA errors yet." }
);

const sdReminderTimeRangePager = boCreatePager(
  "rows-reminderTimeRange",
  () => sdEntries("reminderTimeRange"),
  (e) => `
      <tr>
        <td>${sdEsc(e.r.name)}</td>
        <td>${sdEsc(e.r.start)}</td>
        <td>${sdEsc(e.r.end)}</td>
        <td>${sdEsc(e.r.defaultTime)}</td>
        <td>${sdActions("reminderTimeRange", e.i)}</td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 5, emptyText: "No reminder time ranges yet." }
);

const SD_PAGERS = {
  sentences: sdSentencesPager,
  questions: sdQuestionsPager,
  answers: sdAnswersPager,
  iaErrors: sdIaErrorsPager,
  reminderTimeRange: sdReminderTimeRangePager,
};

function sdRenderAllTables() {
  Object.values(SD_PAGERS).forEach((p) => p());
}
sdRenderAllTables();

document.getElementById("sentenceLangFilterMenu").innerHTML = buildBoSelectOptions(["AR", "EN", "HE", "RU", "ES", "DE"]);
document.getElementById("sentenceLangFilter").addEventListener("change", (e) => {
  sentenceLangFilter = e.target.value;
  sdSentencesPager.resetPage();
  sdSentencesPager();
});

/* ---------------- Row actions (edit / delete) ---------------- */
document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const expand = e.target.closest(".sd-question-expand");
    if (expand) {
      const expanded = expand.getAttribute("aria-expanded") === "true";
      const details = document.getElementById(expand.getAttribute("aria-controls"));
      expand.setAttribute("aria-expanded", String(!expanded));
      const itemType = expand.dataset.answerExpand !== undefined ? "answer" : expand.dataset.iaerrorExpand !== undefined ? "IA error" : "question";
      expand.setAttribute("aria-label", expanded ? `Show ${itemType} translations` : `Hide ${itemType} translations`);
      details.hidden = expanded;
      expand.closest("tr").classList.toggle("is-expanded", !expanded);
      return;
    }

    const editTrigger = e.target.closest(".sd-edit-trigger");
    if (editTrigger) {
      sdOpenDrawer(editTrigger.dataset.tab, Number(editTrigger.dataset.idx));
      return;
    }

    const archiveTrigger = e.target.closest(".sd-archive-trigger");
    if (archiveTrigger) {
      const tabKey = archiveTrigger.dataset.tab;
      const idx = Number(archiveTrigger.dataset.idx);
      const [record] = SD_DATA[tabKey].splice(idx, 1);
      archivedSessionData.push({ ...record, _tabKey: tabKey, _type: SD_TAB_LABEL[tabKey], _label: sdRecordLabel(tabKey, record), archivedDate: sdNowStamp() });
      sdRenderAllTables();
    }
  });
});

/* ---------------- Drawer state ---------------- */
let sdCurrentTab = null;
let sdCurrentEditIdx = null;
let sdState = {};

function sdFreshState() {
  return { simple: {} };
}

function sdInitState(tabKey, editIdx) {
  sdState = sdFreshState();
  if (editIdx === null) return;
  const row = SD_DATA[tabKey][editIdx];
  if (tabKey === "questions") sdState.simple = { type: row.type, decimal: row.decimal || "", min: row.min || "", max: row.max || "", ...row.questions };
  else if (tabKey === "answers") sdState.simple = { name: row.name, ...row.answers };
  else if (tabKey === "iaErrors") sdState.simple = { name: row.name, identifier: row.identifier, priority: row.priority, rerecordAttempts: row.rerecordAttempts, sessionRerecordAttempts: row.sessionRerecordAttempts, langTable: Object.fromEntries(SD_LANGS.map((l) => [l, [row.messages[l].regular, row.messages[l].successful, row.messages[l].unsuccessful]])) };
  else if (tabKey === "reminderTimeRange") sdState.simple = { name: row.name, start: sdSplitTime(row.start), end: sdSplitTime(row.end), defaultTime: sdSplitTime(row.defaultTime), langTable: Object.fromEntries(SD_LANGS.map((l) => [l, [row.text ? row.text[l] || "" : ""]])) };
  else sdState.simple = { ...row };
}

function sdSplitTime(t) {
  const [hh, mm] = (t || "").split(":");
  return { hh: hh || "", mm: mm || "" };
}

/* ---------------- Field builders ---------------- */
function sdTextField(key, label) {
  const v = sdEsc(sdState.simple[key] || "");
  return `<div class="bo-modal-field"><label>${label}:</label><input type="text" data-field="${key}" value="${v}" placeholder="${label}" /></div>`;
}

function sdNumberField(key, label) {
  const v = sdEsc(sdState.simple[key] || "");
  return `<div class="bo-modal-field"><label>${label}:</label><input type="number" step="any" data-field="${key}" value="${v}" placeholder="${label}" /></div>`;
}

function sdSelectField(key, label, options) {
  const cur = sdState.simple[key] || "";
  const opts = options
    .map(
      (o) => `<div class="bo-select-option${o === cur ? " selected" : ""}" data-value="${sdEsc(o)}">${sdEsc(o)}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
  return `
    <div class="bo-modal-field">
      <label>${label}:</label>
      <div class="bo-select" data-name="${key}">
        <button type="button" class="bo-select-trigger">
          <span class="bo-select-value${cur ? "" : " placeholder"}">${cur ? sdEsc(cur) : label}</span>
          <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div class="bo-select-menu">${opts}</div>
        <input type="hidden" data-field="${key}" value="${sdEsc(cur)}" />
      </div>
    </div>`;
}

function sdTimePairField(key, label) {
  const hh = sdEsc((sdState.simple[key] || {}).hh || "");
  const mm = sdEsc((sdState.simple[key] || {}).mm || "");
  return `
    <div class="bo-modal-field">
      <label>${label}:</label>
      <div class="bo-time-pair">
        <input type="number" min="0" max="23" placeholder="HH" data-timepart="${key}:hh" value="${hh}" />
        <span>:</span>
        <input type="number" min="0" max="59" placeholder="MM" data-timepart="${key}:mm" value="${mm}" />
      </div>
    </div>`;
}

function sdLangTable(columns, headLabel = "Language") {
  const head = `<div class="bo-lang-head" style="grid-template-columns:70px repeat(${columns.length},1fr);"><span>${headLabel}</span>${columns.map((c) => `<span>${c}</span>`).join("")}</div>`;
  const rows = SD_LANGS.map(
    (l) => `
    <div class="bo-lang-row" style="grid-template-columns:70px repeat(${columns.length},1fr);">
      <span class="bo-lang-code">${l}</span>
      ${columns.map((c, ci) => `<input type="text" data-langfield="${l}:${ci}" value="${sdEsc((((sdState.simple.langTable || {})[l] || [])[ci]) || "")}" />`).join("")}
    </div>`
  ).join("");
  return `<div class="bo-lang-table">${head}${rows}</div>`;
}

/* ---------------- Per-tab body renderers (simplified vs. the legacy screens) ---------------- */
function sdBodySentences() {
  return `
    ${sdSelectField("language", "Language", SD_LANGS)}
    ${sdTextField("identifier", "Identifier")}
    ${sdTextField("sentence", "Sentence")}
  `;
}

function sdBodyQuestions() {
  return `
    <div class="bo-modal-grid">
      ${sdSelectField("type", "Type", SD_QUESTION_TYPES)}
      ${sdNumberField("decimal", "Decimal")}
      ${sdNumberField("min", "Min")}
      ${sdNumberField("max", "Max")}
    </div>
    <div class="bo-modal-grid">
      ${sdTextField("AR", "AR Question")}
      ${sdTextField("EN", "EN Question")}
      ${sdTextField("HE", "HE Question")}
      ${sdTextField("RU", "RU Question")}
      ${sdTextField("ES", "ES Question")}
      ${sdTextField("DE", "DE Question")}
    </div>
  `;
}

function sdBodyAnswers() {
  return `
    ${sdTextField("name", "Name")}
    <div class="bo-modal-grid">
      ${sdTextField("AR", "AR Answers")}
      ${sdTextField("EN", "EN Answers")}
      ${sdTextField("HE", "HE Answers")}
      ${sdTextField("RU", "RU Answers")}
      ${sdTextField("ES", "ES Answers")}
      ${sdTextField("DE", "DE Answers")}
    </div>
  `;
}

function sdBodyIaErrors() {
  return `
    <div class="bo-modal-grid">
      ${sdTextField("name", "Name")}
      ${sdTextField("rerecordAttempts", "Rerecord Attempts")}
      ${sdTextField("identifier", "Identifier")}
      ${sdTextField("sessionRerecordAttempts", "Session Rerecord Attempts")}
      ${sdTextField("priority", "Priority")}
    </div>
    ${sdLangTable(["Regular", "Successful", "Unsuccessful"], "Language / Message")}
  `;
}

function sdBodyReminderTimeRange() {
  return `
    <div class="bo-modal-grid">
      ${sdTextField("name", "Name")}
    </div>
    <div class="bo-modal-grid">
      ${sdTimePairField("start", "Start Hour")}
      ${sdTimePairField("end", "End Hour")}
      ${sdTimePairField("defaultTime", "Default Reminder Time")}
    </div>
    ${sdLangTable(["Text"], "Language / Message")}
  `;
}

const SD_BODY_RENDERERS = {
  sentences: sdBodySentences,
  questions: sdBodyQuestions,
  answers: sdBodyAnswers,
  iaErrors: sdBodyIaErrors,
  reminderTimeRange: sdBodyReminderTimeRange,
};

/* ---------------- Drawer render / open / close ---------------- */
const sdDrawerOverlay = document.getElementById("sdDrawerOverlay");
const sdDrawerBody = document.getElementById("sdDrawerBody");
const sdDrawerTitle = document.getElementById("sdDrawerTitle");
const sdDrawerSaveBtn = document.getElementById("sdSaveDrawer");

function sdRender() {
  sdDrawerBody.innerHTML = SD_BODY_RENDERERS[sdCurrentTab]();
  sdDrawerBody.querySelectorAll(".bo-select").forEach(wireBoSelect);
  sdValidate();
}

function sdValidate() {
  const key = sdCurrentTab === "sentences" ? "sentence" : sdCurrentTab === "iaErrors" || sdCurrentTab === "reminderTimeRange" || sdCurrentTab === "answers" ? "name" : "EN";
  sdDrawerSaveBtn.disabled = !(sdState.simple[key] && String(sdState.simple[key]).trim());
}

function sdOpenDrawer(tabKey, editIdx) {
  sdCurrentTab = tabKey;
  sdCurrentEditIdx = editIdx;
  sdInitState(tabKey, editIdx);
  sdDrawerTitle.textContent = SD_TAB_META[tabKey].title;
  sdRender();
  sdDrawerOverlay.classList.add("open");
}

function sdCloseDrawer() {
  sdDrawerOverlay.classList.remove("open");
}

document.getElementById("sdCloseDrawerX").addEventListener("click", sdCloseDrawer);
document.getElementById("sdCancelDrawer").addEventListener("click", sdCloseDrawer);
sdDrawerOverlay.addEventListener("click", (e) => { if (e.target === sdDrawerOverlay) sdCloseDrawer(); });

/* ---------------- Drawer body interaction (delegated) ---------------- */
sdDrawerBody.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.field) { sdState.simple[t.dataset.field] = t.value; sdValidate(); }
  else if (t.dataset.timepart) {
    const [key, part] = t.dataset.timepart.split(":");
    sdState.simple[key] = sdState.simple[key] || {};
    sdState.simple[key][part] = t.value;
  } else if (t.dataset.langfield) {
    const [lang, ci] = t.dataset.langfield.split(":");
    sdState.simple.langTable = sdState.simple.langTable || {};
    sdState.simple.langTable[lang] = sdState.simple.langTable[lang] || [];
    sdState.simple.langTable[lang][Number(ci)] = t.value;
  }
});

sdDrawerBody.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.field) { sdState.simple[t.dataset.field] = t.value; sdValidate(); }
});

/* ---------------- Save ---------------- */
document.getElementById("sdDrawerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (sdDrawerSaveBtn.disabled) return;

  const s = sdState.simple;
  let record;
  if (sdCurrentTab === "sentences") {
    record = { identifier: s.identifier || "", language: s.language || "", sentence: s.sentence || "" };
  } else if (sdCurrentTab === "questions") {
    record = { type: s.type || "", decimal: s.decimal || "", min: s.min || "", max: s.max || "", questions: Object.fromEntries(SD_LANGS.map((l) => [l, s[l] || ""])) };
  } else if (sdCurrentTab === "answers") {
    record = { name: s.name || "", answers: Object.fromEntries(SD_LANGS.map((l) => [l, s[l] || ""])) };
  } else if (sdCurrentTab === "iaErrors") {
    const lt = s.langTable || {};
    record = {
      name: s.name || "", identifier: s.identifier || "", priority: s.priority || "",
      rerecordAttempts: s.rerecordAttempts || "", sessionRerecordAttempts: s.sessionRerecordAttempts || "",
      messages: Object.fromEntries(SD_LANGS.map((l) => [l, { regular: (lt[l] || [])[0] || "", successful: (lt[l] || [])[1] || "", unsuccessful: (lt[l] || [])[2] || "" }])),
    };
  } else if (sdCurrentTab === "reminderTimeRange") {
    const lt = s.langTable || {};
    const fmt = (p) => `${(p && p.hh) || "00"}:${(p && p.mm) || "00"}:00`;
    record = {
      name: s.name || "", start: fmt(s.start), end: fmt(s.end), defaultTime: fmt(s.defaultTime),
      text: Object.fromEntries(SD_LANGS.map((l) => [l, (lt[l] || [])[0] || ""])),
    };
  }

  if (sdCurrentEditIdx === null) SD_DATA[sdCurrentTab].push(record);
  else SD_DATA[sdCurrentTab][sdCurrentEditIdx] = record;

  sdRenderAllTables();
  sdCloseDrawer();
});
