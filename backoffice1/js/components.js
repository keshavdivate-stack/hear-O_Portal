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

const compKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function esc(v) { return String(v == null ? "" : v).replace(/"/g, "&quot;"); }

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/* ---------------- Tabs ---------------- */
const addConfigBtn = document.getElementById("addConfigBtn");
const addConfigBtnLabel = document.getElementById("addConfigBtnLabel");

document.querySelectorAll("#componentsTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#componentsTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    addConfigBtn.dataset.tab = tab.dataset.tab;
    addConfigBtnLabel.textContent = TAB_META[tab.dataset.tab].addLabel;
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
            <button class="bo-action-icon row-menu-trigger" data-tab="${tabKey}" data-idx="${e.i}" aria-label="Row actions">${compKebabIcon}</button>
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
        <td>${esc(e.r.sentencesConfig)}</td>
        <td>${esc(e.r.questionsConfig)}</td>
        <td>${esc(e.r.inputAssessmentConfig)}</td>
        <td>${esc(e.r.generalParamsConfig)}</td>
        <td>${esc(e.r.reminderConfig)}</td>
        <td>${esc(e.r.iaErrorsConfig)}</td>
        <td>${esc(e.r.creationDate)}</td>
        <td>
          <div class="bo-row-actions">
            <button class="bo-action-icon row-menu-trigger" data-tab="main" data-idx="${e.i}" aria-label="Row actions">${compKebabIcon}</button>
          </div>
        </td>
      </tr>`,
  { pageSize: CONFIG_PAGE_SIZE, emptyColspan: 9, emptyText: "No main configs yet." }
);

function renderAllTables() {
  Object.values(configPagers).forEach((p) => p());
}
renderAllTables();

/* ---------------- Row action dropdown (edit / delete) ---------------- */
const compRowMenu = document.getElementById("compRowMenu");
let activeCompTab = null;
let activeCompIdx = null;

document.querySelectorAll(".bo-list-table").forEach((table) => {
  table.addEventListener("click", (e) => {
    const trigger = e.target.closest(".row-menu-trigger");
    if (!trigger) return;
    e.stopPropagation();
    activeCompTab = trigger.dataset.tab;
    activeCompIdx = Number(trigger.dataset.idx);
    const rect = trigger.getBoundingClientRect();
    compRowMenu.style.top = `${rect.bottom + 6}px`;
    compRowMenu.style.left = `${rect.right - 190}px`;
    compRowMenu.classList.add("open");
  });
});

document.addEventListener("click", (e) => {
  if (!compRowMenu.contains(e.target)) compRowMenu.classList.remove("open");
});

compRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || activeCompTab === null || activeCompIdx === null) return;
  compRowMenu.classList.remove("open");

  if (item.dataset.action === "edit") openDrawer(activeCompTab, activeCompIdx);
  if (item.dataset.action === "delete") {
    if (!confirm(`Delete "${DATA[activeCompTab][activeCompIdx].name}"?`)) return;
    DATA[activeCompTab].splice(activeCompIdx, 1);
    renderAllTables();
  }
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

function selectField(key, label, options) {
  const cur = state.simple[key] || "";
  const opts = options
    .map((o) => `<option value="${esc(o)}" ${o === cur ? "selected" : ""}>${esc(o)}</option>`)
    .join("");
  return `<div class="bo-modal-field"><label>${label}:</label><select data-field="${key}"><option value=""></option>${opts}</select></div>`;
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
        <select data-dynlist="${listKey}:${i}">
          <option value="">Select ${itemLabelPrefix.toLowerCase()}</option>
          ${options.map((o) => `<option value="${esc(o)}" ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
      </div>`
    )
    .join("");
  const showError = !list.some((v) => v) ? `<p class="bo-field-error">${errorMsg}</p>` : "";
  return `${items}${showError}<button type="button" class="bo-btn-primary bo-add-dynlist" data-list="${listKey}" style="margin-bottom:18px;">${addLabel}</button>`;
}

/* ---------------- Per-tab body renderers ---------------- */
function bodyMain() {
  const existingOptions = mainConfigs.map((c) => c.name);
  return `
    <div class="bo-modal-field">
      <label>Existing main config:</label>
      <div style="display:flex; gap:10px;">
        <select data-field="existingMain" style="flex:1;">
          <option value=""></option>
          ${existingOptions.map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}
        </select>
        <button type="button" class="bo-btn-primary" id="loadMainConfigBtn" style="flex-shrink:0;">Load</button>
      </div>
    </div>
    ${textField("name", "Name")}
    ${selectField("sentencesConfig", "Sentences Config", sentencesConfigs.map((c) => c.name))}
    ${selectField("questionsConfig", "Questions Config", questionsConfigs.map((c) => c.name))}
    ${selectField("inputAssessmentConfig", "Input Assessment Config", inputAssessmentConfigs.map((c) => c.name))}
    ${selectField("generalParamsConfig", "General Config", generalParamsConfigs.map((c) => c.name))}
    ${selectField("reminderConfig", "Reminder Config", reminderConfigs.map((c) => c.name))}
    ${selectField("iaErrorsConfig", "IA Errors Config", iaErrorsConfigs.map((c) => c.name))}
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
            <select data-sentence="${l}:${i}" style="flex:1;">
              <option value="">Select sentence</option>
              ${SENTENCE_OPTIONS.map((o) => `<option value="${esc(o)}" ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}
            </select>
            ${state.sentences[l].length > 1 ? `<button type="button" class="bo-btn-text bo-remove-sentence" data-lang="${l}" data-idx="${i}" aria-label="Remove" style="font-size:18px;">&times;</button>` : ""}
          </div>
        </div>`
      )
      .join("");
    return `
      <p style="font-size:13px; font-weight:700; color:var(--ink); margin:18px 0 4px;">${l} Sentences:</p>
      ${items}
      <button type="button" class="bo-btn-primary bo-add-sentence" data-lang="${l}" style="margin:8px 0 4px;">Add Sentence</button>`;
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
        <select data-question="${active}:${i}">
          <option value="">Select question</option>
          ${QUESTION_OPTIONS.map((o) => `<option value="${esc(o)}" ${o === v ? "selected" : ""}>${esc(o)}</option>`).join("")}
        </select>
      </div>`
    )
    .join("");
  return `${textField("name", "Name")}${tabsHtml}${items}<button type="button" class="bo-btn-primary bo-add-question" style="margin-bottom:18px;">Add Question</button>`;
}

function bodyInputAssessment() {
  return `
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
    ${langTable(["Successful Session", "Unsuccessful Session"])}
  `;
}

function bodyGeneralParams() {
  return `
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
