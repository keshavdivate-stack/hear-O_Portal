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

const sdKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function sdEsc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

function sdActions(tabKey, idx) {
  return `
    <div class="bo-row-actions">
      <button class="bo-action-icon row-menu-trigger" data-tab="${tabKey}" data-idx="${idx}" aria-label="Row actions">${sdKebabIcon}</button>
    </div>`;
}

/* ---------------- Tabs ---------------- */
const sdAddBtn = document.getElementById("sdAddConfigBtn");
const sdAddBtnLabel = document.getElementById("sdAddConfigBtnLabel");

document.querySelectorAll("#sessionDataTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#sessionDataTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    sdAddBtn.dataset.tab = tab.dataset.tab;
    sdAddBtnLabel.textContent = SD_TAB_META[tab.dataset.tab].addLabel;
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
      <tr>
        <td>${sdEsc(e.r.type)}</td>
        <td>${sdEsc(e.r.questions.EN)}</td>
        <td>${sdActions("questions", e.i)}</td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 3, emptyText: "No questions yet." }
);

const sdAnswersPager = boCreatePager(
  "rows-answers",
  () => sdEntries("answers"),
  (e) => `
      <tr>
        <td>${sdEsc(e.r.name)}</td>
        <td>${sdEsc(e.r.answers.EN || e.r.answers.AR || "")}</td>
        <td>${sdActions("answers", e.i)}</td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 3, emptyText: "No answers yet." }
);

const sdIaErrorsPager = boCreatePager(
  "rows-iaErrors",
  () => sdEntries("iaErrors"),
  (e) => `
      <tr>
        <td>${sdEsc(e.r.name)}</td>
        <td>${sdEsc(e.r.identifier)}</td>
        <td>${sdEsc(e.r.priority)}</td>
        <td>${sdEsc(e.r.rerecordAttempts)}</td>
        <td>${sdEsc(e.r.sessionRerecordAttempts)}</td>
        <td>${sdActions("iaErrors", e.i)}</td>
      </tr>`,
  { pageSize: SD_PAGE_SIZE, emptyColspan: 6, emptyText: "No IA errors yet." }
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

document.getElementById("sentenceLangFilter").addEventListener("change", (e) => {
  sentenceLangFilter = e.target.value;
  e.target.classList.toggle("has-value", e.target.value !== "");
  sdSentencesPager.resetPage();
  sdSentencesPager();
});

/* ---------------- Row action dropdown (edit / delete) ---------------- */
const sdRowMenu = document.getElementById("sdRowMenu");
let activeSdTab = null;
let activeSdIdx = null;

document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const trigger = e.target.closest(".row-menu-trigger");
    if (!trigger) return;
    e.stopPropagation();
    activeSdTab = trigger.dataset.tab;
    activeSdIdx = Number(trigger.dataset.idx);
    const rect = trigger.getBoundingClientRect();
    sdRowMenu.style.top = `${rect.bottom + 6}px`;
    sdRowMenu.style.left = `${rect.right - 190}px`;
    sdRowMenu.classList.add("open");
  });
});

document.addEventListener("click", (e) => {
  if (!sdRowMenu.contains(e.target)) sdRowMenu.classList.remove("open");
});

sdRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeSdTab === null || activeSdIdx === null) return;
  sdRowMenu.classList.remove("open");

  if (item.dataset.action === "edit") sdOpenDrawer(activeSdTab, activeSdIdx);
  if (item.dataset.action === "delete") {
    if (!confirm("Delete this entry?")) return;
    SD_DATA[activeSdTab].splice(activeSdIdx, 1);
    sdRenderAllTables();
  }
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
  if (tabKey === "questions") sdState.simple = { type: row.type, ...row.questions };
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

function sdSelectField(key, label, options) {
  const cur = sdState.simple[key] || "";
  const opts = options.map((o) => `<option value="${sdEsc(o)}" ${o === cur ? "selected" : ""}>${sdEsc(o)}</option>`).join("");
  return `<div class="bo-modal-field"><label>${label}:</label><select data-field="${key}"><option value=""></option>${opts}</select></div>`;
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

function sdLangTable(columns) {
  const head = `<div class="bo-lang-head" style="grid-template-columns:70px repeat(${columns.length},1fr);"><span>Language</span>${columns.map((c) => `<span>${c}</span>`).join("")}</div>`;
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
    ${sdSelectField("type", "Type", SD_QUESTION_TYPES)}
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
    ${sdLangTable(["Regular", "Successful", "Unsuccessful"])}
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
    ${sdLangTable(["Text"])}
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
    record = { type: s.type || "", questions: Object.fromEntries(SD_LANGS.map((l) => [l, s[l] || ""])) };
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
