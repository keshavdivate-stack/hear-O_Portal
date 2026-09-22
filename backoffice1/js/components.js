/* ---------------- Settings > Config > Components ---------------- */
const DATA = {
  main: mainConfigs,
  sentences: sentencesConfigs,
  questions: questionsConfigs,
  inputAssessment: inputAssessmentConfigs,
  generalParams: generalParamsConfigs,
  reminder: reminderConfigs,
  iaErrors: iaErrorsConfigs,
};

const TAB_META = {
  main: { title: "Create Main Config", addLabel: "Main Config" },
  sentences: { title: "Create/Edit Sentences Config", addLabel: "Sentences" },
  questions: { title: "Create/Edit Questions Config", addLabel: "Questions" },
  inputAssessment: { title: "Create/Edit Input Assessment Config", addLabel: "Input Assessment" },
  generalParams: { title: "Create/Edit General Config", addLabel: "General Params" },
  reminder: { title: "Create/Edit Reminder Config", addLabel: "Reminder Params" },
  iaErrors: { title: "Create/Edit IA Errors Config", addLabel: "IA Error" },
};

const compEditIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>`;
const compTrashIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`;
const compArchiveIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 13h4"/></svg>`;
const compPlusIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

function esc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }
function escOrDash(v) { return v ? esc(v) : "—"; }

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ---------------- Tabs ---------------- */
const addConfigBtn = document.getElementById("addConfigBtn");
const addConfigBtnLabel = document.getElementById("addConfigBtnLabel");

const viewArchivedLink = document.getElementById("viewArchivedLink");

document.querySelectorAll("#componentsTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#componentsTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    addConfigBtn.dataset.tab = tab.dataset.tab;
    addConfigBtnLabel.textContent = TAB_META[tab.dataset.tab].addLabel;
    /* View Archived should open on whichever tab you were looking at, since
       each tab's archive shows that tab's own columns. */
    viewArchivedLink.href = `archived-configs.html?tab=${tab.dataset.tab}`;
  });
});

/* ---------------- Table rendering ---------------- */
const CONFIG_PAGE_SIZE = 10;
const configPagers = {};

function makeSimplePager(tabKey) {
  return boCreatePager(
    `rows-${tabKey}`,
    () => DATA[tabKey].map((r, i) => ({ r, i })),
    (e) => `
      <tr>
        <td>${esc(e.r.name)}</td>
        <td>${esc(e.r.creationDate)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon config-edit-trigger" data-tab="${tabKey}" data-idx="${e.i}" aria-label="Edit">${compEditIcon}</button>
            <button class="bo-action-icon archive config-archive-trigger" data-tab="${tabKey}" data-idx="${e.i}" aria-label="Archive">${compArchiveIcon}</button>
          </div>
        </td>
      </tr>`,
    { pageSize: CONFIG_PAGE_SIZE, emptyColspan: 3, emptyText: "No configs yet." }
  );
}

["sentences", "questions", "inputAssessment", "generalParams", "reminder", "iaErrors"].forEach((tabKey) => {
  configPagers[tabKey] = makeSimplePager(tabKey);
});

configPagers.main = boCreatePager(
  "rows-main",
  () => mainConfigs.map((r, i) => ({ r, i })),
  (e) => `
      <tr>
        <td>${esc(e.r.name)}</td>
        <td>${escOrDash(e.r.sentencesConfig)}</td>
        <td>${escOrDash(e.r.questionsConfig)}</td>
        <td>${escOrDash(e.r.inputAssessmentConfig)}</td>
        <td>${escOrDash(e.r.generalParamsConfig)}</td>
        <td>${escOrDash(e.r.reminderConfig)}</td>
        <td>${escOrDash(e.r.iaErrorsConfig)}</td>
        <td>${esc(e.r.creationDate)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon archive main-archive-trigger" data-idx="${e.i}" aria-label="Archive">${compArchiveIcon}</button>
          </div>
        </td>
      </tr>`,
  { pageSize: CONFIG_PAGE_SIZE, emptyColspan: 9, emptyText: "No main configs yet." }
);

function renderAllTables() {
  Object.values(configPagers).forEach((p) => p());
}
renderAllTables();

/* ---------------- Row actions (edit / archive) ----------------
   Main Config only ever offers Archive (there's no in-place edit -- the
   drawer's own "Existing main config" + Load lets you start a new one
   from an old one's values, and Save always adds a new row), so it gets
   a direct icon instead of a menu. Every other tab offers two actions
   (Edit, Archive) shown as direct icon buttons rather than a kebab
   dropdown. Archiving moves the row into archivedConfigs (see
   components-data.js) instead of deleting it outright, so it can be
   restored from the "View Archived" page without redoing the config. */
function archiveConfig(tabKey, idx) {
  const [record] = DATA[tabKey].splice(idx, 1);
  archivedConfigs.push({ ...record, _tabKey: tabKey, _type: TAB_META[tabKey].addLabel, archivedDate: nowStamp() });
  renderAllTables();
}

document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const mainArchiveTrigger = e.target.closest(".main-archive-trigger");
    if (mainArchiveTrigger) {
      archiveConfig("main", Number(mainArchiveTrigger.dataset.idx));
      return;
    }

    const editTrigger = e.target.closest(".config-edit-trigger");
    if (editTrigger) {
      openDrawer(editTrigger.dataset.tab, Number(editTrigger.dataset.idx));
      return;
    }

    const archiveTrigger = e.target.closest(".config-archive-trigger");
    if (archiveTrigger) {
      archiveConfig(archiveTrigger.dataset.tab, Number(archiveTrigger.dataset.idx));
    }
  });
});

document.querySelectorAll(".bo-add-config-btn").forEach((btn) => {
  btn.addEventListener("click", () => openDrawer(btn.dataset.tab, null));
});

/* ---------------- Drawer state ---------------- */
let currentTab = null;
let currentEditIdx = null;
let state = {};

function freshState() {
  return {
    simple: {},
    sentences: Object.fromEntries(LANGS.map((l) => [l, [""]])),
    questionsActiveTab: "Questions",
    questionsLists: { Questions: [""], HealthQuestions: [""] },
    iaErrorsList: [""],
    reminderTimeRanges: [""],
  };
}

function initState(tabKey, editIdx) {
  state = freshState();
  if (editIdx === null) return;
  const row = DATA[tabKey][editIdx];
  state.simple = { ...row };
  if (tabKey === "iaErrors" && Array.isArray(row.iaErrorsList) && row.iaErrorsList.length) {
    state.iaErrorsList = [...row.iaErrorsList];
  }
  if (tabKey === "reminder" && Array.isArray(row.timeRanges) && row.timeRanges.length) {
    state.reminderTimeRanges = [...row.timeRanges];
  }
}

/* ---------------- Field builders ---------------- */
function textField(key, label) {
  const v = esc(state.simple[key] || "");
  return `<div class="bo-modal-field"><label>${label}:</label><input type="text" data-field="${key}" value="${v}" placeholder="${label}" /></div>`;
}

/* Builds the app's styled .bo-select dropdown instead of a native <select> --
   dataAttr/dataValue become the hidden input's data-* attribute (data-field,
   data-dynlist, data-sentence, data-question, ...) so the existing delegated
   input/change listeners on drawerBody keep working unchanged: setBoSelectValue
   dispatches "change" on that same hidden input when an option is picked. */
function customSelect(dataAttr, dataValue, current, options, placeholder) {
  const opts = options
    .map(
      (o) => `<div class="bo-select-option${o === current ? " selected" : ""}" data-value="${esc(o)}">${esc(o)}
        <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`
    )
    .join("");
  return `
    <div class="bo-select" data-name="${esc(dataValue)}">
      <button type="button" class="bo-select-trigger">
        <span class="bo-select-value${current ? "" : " placeholder"}">${current ? esc(current) : placeholder}</span>
        <svg class="bo-select-caret" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="bo-select-menu">${opts}</div>
      <input type="hidden" ${dataAttr}="${esc(dataValue)}" value="${esc(current)}" />
    </div>`;
}

function selectField(key, label, options) {
  const cur = state.simple[key] || "";
  return `<div class="bo-modal-field"><label>${label}:</label>${customSelect("data-field", key, cur, options, label)}</div>`;
}

function timePairField(key, label) {
  const hh = esc((state.simple[key] || {}).hh || "");
  const mm = esc((state.simple[key] || {}).mm || "");
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

function langTable(columns) {
  const head = `<div class="bo-lang-head" style="grid-template-columns:70px repeat(${columns.length},1fr);"><span>Language / Message</span>${columns.map((c) => `<span>${c}</span>`).join("")}</div>`;
  const rows = LANGS.map(
    (l) => `
    <div class="bo-lang-row" style="grid-template-columns:70px repeat(${columns.length},1fr);">
      <span class="bo-lang-code">${l}</span>
      ${columns.map((c, ci) => `<input type="text" data-langfield="${l}:${ci}" value="${esc((((state.simple.langTable || {})[l] || [])[ci]) || "")}" />`).join("")}
    </div>`
  ).join("");
  return `<div class="bo-lang-table">${head}${rows}</div>`;
}

function dynamicList(listKey, itemLabelPrefix, options, addLabel, errorMsg) {
  const list = state[listKey];
  const items = list
    .map(
      (v, i) => `
      <div class="bo-dyn-list-item">
        <label>${itemLabelPrefix} ${i + 1}</label>
        ${customSelect("data-dynlist", `${listKey}:${i}`, v || "", options, `Select ${itemLabelPrefix.toLowerCase()}`)}
      </div>`
    )
    .join("");
  const showError = !list.some((v) => v) ? `<p class="bo-field-error">${errorMsg}</p>` : "";
  return `${items}${showError}<button type="button" class="bo-btn-add-org bo-add-dynlist" data-list="${listKey}" style="margin-bottom:18px;">${compPlusIcon}${addLabel}</button>`;
}

/* ---------------- Per-tab body renderers ---------------- */
function bodyMain() {
  const existingOptions = mainConfigs.map((c) => c.name);
  return `
    <div class="bo-modal-grid">
      <div class="bo-modal-field full">
        <label>Existing main config:</label>
        <div style="display:flex; gap:10px; align-items:flex-start;">
          <div style="flex:1;">${customSelect("data-field", "existingMain", "", existingOptions, "Select a config")}</div>
          <button type="button" class="bo-btn-secondary" id="loadMainConfigBtn" style="flex-shrink:0;">Load</button>
        </div>
      </div>
      ${textField("name", "Name")}
      ${selectField("sentencesConfig", "Sentences Config", sentencesConfigs.map((c) => c.name))}
      ${selectField("questionsConfig", "Questions Config", questionsConfigs.map((c) => c.name))}
      ${selectField("inputAssessmentConfig", "Input Assessment Config", inputAssessmentConfigs.map((c) => c.name))}
      ${selectField("generalParamsConfig", "General Config", generalParamsConfigs.map((c) => c.name))}
      ${selectField("reminderConfig", "Reminder Config", reminderConfigs.map((c) => c.name))}
      ${selectField("iaErrorsConfig", "IA Errors Config", iaErrorsConfigs.map((c) => c.name))}
    </div>
  `;
}

function bodySentences() {
  const sections = LANGS.map((l) => {
    const items = state.sentences[l]
      .map(
        (v, i) => `
        <div class="bo-dyn-list-item" style="margin-bottom:4px;">
          <label>Sentence ${i + 1}</label>
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="flex:1;">${customSelect("data-sentence", `${l}:${i}`, v || "", SENTENCE_OPTIONS, "Select sentence")}</div>
            ${state.sentences[l].length > 1 ? `<button type="button" class="bo-remove-field-btn bo-remove-sentence" data-lang="${l}" data-idx="${i}" aria-label="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6L18 18M6 18L18 6"/></svg></button>` : ""}
          </div>
        </div>`
      )
      .join("");
    return `
      <p style="font-size:13px; font-weight:700; color:var(--ink); margin:18px 0 4px;">${l} Sentences:</p>
      ${items}
      <button type="button" class="bo-btn-add-org bo-add-sentence" data-lang="${l}" style="margin:8px 0 4px;">${compPlusIcon}Add Sentence</button>`;
  }).join("");
  return `${textField("name", "Name")}${sections}`;
}

function bodyQuestions() {
  const tabs = ["Questions", "HealthQuestions"];
  const tabsHtml = `
    <div class="bo-secondary-tabs" style="margin:16px 0;">
      ${tabs.map((t) => `<button type="button" class="bo-secondary-tab bo-question-subtab ${state.questionsActiveTab === t ? "active" : ""}" data-sub="${t}">${t}</button>`).join("")}
    </div>`;
  const active = state.questionsActiveTab;
  const items = state.questionsLists[active]
    .map(
      (v, i) => `
      <div class="bo-dyn-list-item">
        <label>${active === "Questions" ? "Question" : "HealthQuestion"} ${i + 1}</label>
        ${customSelect("data-question", `${active}:${i}`, v || "", QUESTION_OPTIONS, "Select question")}
      </div>`
    )
    .join("");
  return `${textField("name", "Name")}${tabsHtml}${items}<button type="button" class="bo-btn-add-org bo-add-question" style="margin-bottom:18px;">${compPlusIcon}Add Question</button>`;
}

function bodyInputAssessment() {
  return `
    <div class="bo-modal-grid">
      ${textField("name", "Name")}
      ${textField("noSpeechAfterStart", "No Speech After Start Threshold")}
      ${textField("noStopAfterSpeech", "No Stop After Speech Threshold")}
      ${textField("earlySpeech", "Early Speech Threshold")}
      ${textField("lateSpeech", "Late Speech Threshold")}
      ${textField("avgNoise", "Avg Noise Threshold")}
      ${textField("postNoSpeech", "Post No Speech Threshold")}
      ${textField("preNoSpeech", "Pre No Speech Threshold")}
      ${textField("noiseBufferLength", "Noise Buffer Length")}
      ${textField("snrThreshold", "SNR Threshold")}
      ${textField("softSpeaking", "Soft Speaking Threshold")}
      ${textField("loadSpeaking", "Load Speaking Threshold")}
      ${textField("totalNoise", "Total Noise Threshold")}
      ${textField("variance", "Variance Threshold")}
      ${textField("postMargin", "Post Margin")}
      ${textField("preMargin", "Pre Margin")}
      ${textField("asrTimeout", "ASR Timeout")}
      ${textField("androidMicModel", "Android Mic Model")}
      ${selectField("reportIaErrors", "Report IA Errors", YES_NO)}
      ${selectField("showPatientIaErrors", "Show Patient IA Errors", YES_NO)}
      ${selectField("showMessageAtLast", "Show Message At Last", YES_NO)}
    </div>
    ${langTable(["Successful Session", "Unsuccessful Session"])}
  `;
}

function bodyGeneralParams() {
  return `
    <div class="bo-modal-grid">
      ${textField("name", "Name")}
      ${textField("appTimeout", "App Timeout (min)")}
      ${textField("recordingTimeout", "Recording Timeout (sec)")}
      ${textField("recordButtonAnimTimeout", "Record Button Animation Timeout (sec)")}
      ${textField("uploadMessageTimeout", "Upload Message Timeout (sec)")}
      ${textField("uploadCompleteMessageTimeout", "Upload Complete Message Timeout (sec)")}
      ${textField("chatMessageTimeout", "Chat Message Time Out")}
      ${textField("maxVideoDuration", "Maximum Video Recording Duration (sec)")}
      ${selectField("getLocation", "Get Location", YES_NO)}
      ${selectField("enableMessages", "Enable Messages", YES_NO)}
      ${selectField("longPressAlert", "Is Long Press Alert Enabled", YES_NO)}
      ${selectField("sensorsDataEnabled", "Is Sensors Data Enabled", YES_NO)}
      ${selectField("notificationsOffAlarm", "Is Notifications Off Alarm Enabled", YES_NO)}
      ${selectField("flightModeAlarm", "Is Flight Mode Alarm Enabled", YES_NO)}
      ${selectField("networkSettingsOffAlarm", "Is Network Settings Off Alarm Enabled", YES_NO)}
      ${selectField("filesNotUploadedAlarm", "Is Files Is Not Uploaded Alarm Enabled", YES_NO)}
      ${selectField("noInternetAlarm", "Is No Internet Alarm Enabled", YES_NO)}
      ${selectField("healthQuestionsEnabled", "Is Health Questions Enabled", YES_NO)}
      ${textField("healthQuestionsInterval", "Health Questions Interval (days)")}
      ${textField("commIssueFilesCount", "Comm Issue Files Count")}
      ${textField("trainingVersion", "Training Version")}
      ${textField("lexiconsVersion", "Lexicons Version")}
      ${textField("translationVersion", "Translation Version")}
    </div>
  `;
}

function bodyReminder() {
  return `
    <div class="bo-modal-grid">
      ${textField("name", "Name")}
      ${textField("sessionSeparatorsHours", "Session Separators Hours")}
      ${textField("reminderStiffness", "Reminder Stiffness")}
      ${textField("daysBackConsideration", "Days Back Consideration")}
      ${textField("daysBackCalc", "Days Back Calc")}
      ${textField("minSessionCalc", "Min Session Calc")}
      ${timePairField("startBlackout", "Start BlackOut Period")}
      ${timePairField("endBlackout", "End BlackOut Period")}
    </div>
    ${langTable(["First Day", "Second Day", "Following Second Day"])}
    ${dynamicList("reminderTimeRanges", "Reminder Time Range", REMINDER_TIME_RANGE_OPTIONS, "Add Reminder Time Range", "At least one reminder time range is required")}
  `;
}

function bodyIaErrors() {
  return `
    ${textField("name", "Name")}
    ${dynamicList("iaErrorsList", "IAError", IA_ERROR_OPTIONS, "Add IAError", "At least one IA error is required")}
  `;
}

const BODY_RENDERERS = {
  main: bodyMain,
  sentences: bodySentences,
  questions: bodyQuestions,
  inputAssessment: bodyInputAssessment,
  generalParams: bodyGeneralParams,
  reminder: bodyReminder,
  iaErrors: bodyIaErrors,
};

/* ---------------- Drawer render / open / close ---------------- */
const drawerOverlay = document.getElementById("configDrawerOverlay");
const drawerBody = document.getElementById("configDrawerBody");
const drawerTitle = document.getElementById("configDrawerTitle");
const drawerSaveBtn = document.getElementById("saveConfigDrawer");

function render() {
  drawerBody.innerHTML = BODY_RENDERERS[currentTab]();
  drawerBody.querySelectorAll(".bo-select").forEach(wireBoSelect);
  validateDrawer();
}

function validateDrawer() {
  const nameOk = !!(state.simple.name && state.simple.name.trim());
  let extraOk = true;
  if (currentTab === "reminder") extraOk = state.reminderTimeRanges.some((v) => v);
  if (currentTab === "iaErrors") extraOk = state.iaErrorsList.some((v) => v);
  drawerSaveBtn.disabled = !(nameOk && extraOk);
}

function openDrawer(tabKey, editIdx) {
  currentTab = tabKey;
  currentEditIdx = editIdx;
  initState(tabKey, editIdx);
  drawerTitle.textContent = editIdx === null ? TAB_META[tabKey].title : TAB_META[tabKey].title.replace("Create", "Edit").replace("Create/Edit", "Edit");
  render();
  drawerOverlay.classList.add("open");
}

function closeDrawer() {
  drawerOverlay.classList.remove("open");
}

document.getElementById("closeConfigDrawerX").addEventListener("click", closeDrawer);
document.getElementById("cancelConfigDrawer").addEventListener("click", closeDrawer);
drawerOverlay.addEventListener("click", (e) => { if (e.target === drawerOverlay) closeDrawer(); });

/* ---------------- Drawer body interaction (delegated) ---------------- */
drawerBody.addEventListener("input", (e) => {
  const t = e.target;
  if (t.dataset.field) { state.simple[t.dataset.field] = t.value; validateDrawer(); }
  else if (t.dataset.timepart) {
    const [key, part] = t.dataset.timepart.split(":");
    state.simple[key] = state.simple[key] || {};
    state.simple[key][part] = t.value;
  }
  else if (t.dataset.langfield) {
    const [lang, ci] = t.dataset.langfield.split(":");
    state.simple.langTable = state.simple.langTable || {};
    state.simple.langTable[lang] = state.simple.langTable[lang] || [];
    state.simple.langTable[lang][Number(ci)] = t.value;
  }
});

drawerBody.addEventListener("change", (e) => {
  const t = e.target;
  if (t.dataset.field) { state.simple[t.dataset.field] = t.value; validateDrawer(); }
  else if (t.dataset.sentence) {
    const [lang, idx] = t.dataset.sentence.split(":");
    state.sentences[lang][Number(idx)] = t.value;
  }
  else if (t.dataset.question) {
    const [sub, idx] = t.dataset.question.split(":");
    state.questionsLists[sub][Number(idx)] = t.value;
  }
  else if (t.dataset.dynlist) {
    const [listKey, idx] = t.dataset.dynlist.split(":");
    state[listKey][Number(idx)] = t.value;
    validateDrawer();
  }
});

drawerBody.addEventListener("click", (e) => {
  const addSentence = e.target.closest(".bo-add-sentence");
  if (addSentence) { state.sentences[addSentence.dataset.lang].push(""); render(); return; }

  const removeSentence = e.target.closest(".bo-remove-sentence");
  if (removeSentence) {
    const arr = state.sentences[removeSentence.dataset.lang];
    arr.splice(Number(removeSentence.dataset.idx), 1);
    if (!arr.length) arr.push("");
    render();
    return;
  }

  const subTab = e.target.closest(".bo-question-subtab");
  if (subTab) { state.questionsActiveTab = subTab.dataset.sub; render(); return; }

  const addQuestion = e.target.closest(".bo-add-question");
  if (addQuestion) { state.questionsLists[state.questionsActiveTab].push(""); render(); return; }

  const addDyn = e.target.closest(".bo-add-dynlist");
  if (addDyn) { state[addDyn.dataset.list].push(""); render(); return; }

  const loadBtn = e.target.closest("#loadMainConfigBtn");
  if (loadBtn) {
    const select = drawerBody.querySelector('[data-field="existingMain"]');
    const found = mainConfigs.find((c) => c.name === select.value);
    if (found) {
      state.simple = { ...found };
      render();
    }
    return;
  }
});

/* ---------------- Save ---------------- */
document.getElementById("configDrawerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (drawerSaveBtn.disabled) return;

  const record = { ...state.simple, creationDate: nowStamp() };
  if (currentTab === "iaErrors") record.iaErrorsList = state.iaErrorsList.filter((v) => v);
  if (currentTab === "reminder") record.timeRanges = state.reminderTimeRanges.filter((v) => v);

  DATA[currentTab].push(record);
  renderAllTables();
  closeDrawer();
});
