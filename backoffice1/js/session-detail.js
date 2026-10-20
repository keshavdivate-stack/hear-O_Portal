/* ---------------- Session detail ----------------
   Opened from a row of the patient page's Sessions tab:
     session-detail.html?patient=<username>&session=<index in ph.sessions>
   (plus the patient page's own ?org= / ?return= context, carried through so
   going back lands on the patient exactly as it was opened). Shows one
   session's recordings and the clinical questions answered in it. None of
   it is real telemetry -- rows are seeded off patient + session so the same
   session always shows the same recordings. */
const sdParams = new URLSearchParams(location.search);
const sdUsername = sdParams.get("patient") || PATIENT_HEALTH_DEFAULT;
const sdPatient = buildPatientProfile(sdUsername);
const sdOrgContext = sdParams.get("org");
const sdReturnTo = sdParams.get("return");

const sdRequested = parseInt(sdParams.get("session"), 10);
let sdIndex = Math.min(Math.max(Number.isNaN(sdRequested) ? 0 : sdRequested, 0), sdPatient.sessions.length - 1);

function sdPatientUrl(tab) {
  const params = new URLSearchParams({ patient: sdPatient.username, tab });
  if (sdOrgContext) params.set("org", sdOrgContext);
  if (sdReturnTo) params.set("return", sdReturnTo);
  return `patient-health-dashboard.html?${params}`;
}

function sdEsc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ---------------- Header (same as the patient page) ---------------- */
const sdStatusClass = { Active: "healthy", Registered: "warning", Priority: "critical", Paused: "neutral" };

document.title = `HearO Backoffice | ${sdPatient.username} | Session`;
document.getElementById("sdPatientName").textContent = sdPatient.username;
document.getElementById("sdPatientName").href = sdPatientUrl("sessions");
document.getElementById("sdBackLink").href = sdPatientUrl("sessions");
document.getElementById("sdPatientSub").textContent = `${sdPatient.org} · ${sdPatient.langName}`;

const sdSevEl = document.getElementById("sdPatientSeverity");
sdSevEl.classList.add(sdStatusClass[sdPatient.status] || "neutral");
sdSevEl.innerHTML = `<span class="dot"></span>${sdPatient.status}`;

/* Every tab lives on the patient page -- clicking one goes back there on it. */
document.querySelectorAll("#sdPatientTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    location.href = sdPatientUrl(tab.dataset.tab);
  });
});

/* ---------------- Seeded data ---------------- */
function sdSeededRandom(key) {
  let a = phHash(key) || 1;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SD_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const SD_IA_ERRORS = ["R063", "R200", "R101", "R017", "R045"];
const SD_ERROR_NOTES = ["Background noise", "Clipped at start", "Low volume", ""];

const sdPad = (n) => String(n).padStart(2, "0");
const sdToSec = (hms) => hms.split(":").reduce((sum, part) => sum * 60 + Number(part), 0);
const sdFromSec = (sec) => `${sdPad(Math.floor(sec / 3600) % 24)}:${sdPad(Math.floor(sec / 60) % 60)}:${sdPad(sec % 60)}`;

/* Session dates are dd/mm/yyyy; the bar shows "11 Oct, 2026". */
function sdDisplayDate(dmy) {
  const [d, m, y] = dmy.split("/");
  return `${Number(d)} ${SD_MONTHS[Number(m) - 1]}, ${y}`;
}

/* 6-8 recordings recorded back to back from the session's start time. A
   session with N errors (the Sessions table's ERRORS column) gets N of them
   flagged -- IA Error code(s) + Is Error -- so both screens agree. */
function sdBuildRecordings(session, index) {
  const rand = sdSeededRandom(`${sdPatient.username}#session${index}#recordings`);
  const count = 6 + Math.floor(rand() * 3);
  const [d, m, y] = session.date.split("/");
  const firstId = 10 + Math.floor(rand() * 40);

  const errorSlots = new Set();
  while (errorSlots.size < Math.min(session.errors, count)) errorSlots.add(Math.floor(rand() * count));

  let at = sdToSec(session.startTime) + 2;
  return Array.from({ length: count }, (_, i) => {
    const duration = 4 + Math.floor(rand() * 6); // 4-9 s
    const hasError = errorSlots.has(i);
    const codes = hasError ? [SD_IA_ERRORS[Math.floor(rand() * SD_IA_ERRORS.length)]] : [];
    if (hasError && rand() < 0.5) codes.push("R200");
    const rec = {
      identifier: `S${String(firstId + i).padStart(4, "0")}`,
      language: sdPatient.lang,
      time: sdFromSec(at),
      notes: hasError ? SD_ERROR_NOTES[Math.floor(rand() * SD_ERROR_NOTES.length)] : "",
      iaError: [...new Set(codes)].join(","),
      uploaded: `${m}/${d}/${y} ${sdFromSec(at + duration + 3 + Math.floor(rand() * 15))}`,
      iaVersion: "IA v2.0",
      isError: hasError,
      asrError: hasError && rand() < 0.5,
      duration,
    };
    at += duration + 1 + Math.floor(rand() * 4);
    return rec;
  });
}

const SD_QUESTIONS = [
  { type: "Symptom", question: "Did you feel shortness of breath today?", answers: ["No", "No", "Yes"] },
  { type: "Symptom", question: "Did you notice swelling in your legs or ankles?", answers: ["No", "No", "Yes"] },
  { type: "Symptom", question: "Did you wake up at night short of breath?", answers: ["No", "Yes"] },
  { type: "Symptom", question: "How many pillows did you sleep on last night?", answers: ["1", "2", "2", "3"] },
  { type: "Medication", question: "Did you take all your prescribed medication today?", answers: ["Yes", "Yes", "No"] },
  { type: "Weight", question: "What is your weight today (kg)?", answers: null },
  { type: "Wellbeing", question: "How do you feel compared to yesterday?", answers: ["Same", "Better", "Worse"] },
];

/* 4-6 of the questions above, in their usual order. */
function sdBuildQuestions(index) {
  const rand = sdSeededRandom(`${sdPatient.username}#session${index}#questions`);
  const keep = 4 + Math.floor(rand() * 3);
  const picked = SD_QUESTIONS.map((q) => ({ q, r: rand() }))
    .sort((a, b) => a.r - b.r)
    .slice(0, keep)
    .map((x) => x.q)
    .sort((a, b) => SD_QUESTIONS.indexOf(a) - SD_QUESTIONS.indexOf(b));
  const baseWeight = parseInt(sdPatient.registration.weight, 10);
  return picked.map((q) => ({
    type: q.type,
    question: q.question,
    answer: q.answers ? q.answers[Math.floor(rand() * q.answers.length)] : `${(baseWeight + (rand() * 2 - 1)).toFixed(1)}`,
  }));
}

/* Built once per session and kept, so Edit mode changes survive stepping
   to another session and back (in-memory only, like the rest of the
   prototype). */
const sdSessionCache = {};
function sdSessionData(index) {
  if (!sdSessionCache[index]) {
    const session = sdPatient.sessions[index];
    sdSessionCache[index] = { recordings: sdBuildRecordings(session, index), questions: sdBuildQuestions(index) };
  }
  return sdSessionCache[index];
}

/* ---------------- Session bar ---------------- */
function renderSessionBar() {
  const s = sdPatient.sessions[sdIndex];
  const total = sdPatient.sessions.length;
  document.getElementById("sdSessionDate").textContent = sdDisplayDate(s.date);
  document.getElementById("sdSessionTime").textContent = `${s.startTime} – ${s.endTime || "—"}`;
  document.getElementById("sdSessionMeta").innerHTML =
    `${sdEsc(s.os)} · ${sdEsc(s.mobileModel)} · App ${sdEsc(s.appVersion)}` +
    (s.errors ? ` <span class="bo-severity-pill critical">${s.errors} ${s.errors === 1 ? "error" : "errors"}</span>` : "");
  document.getElementById("sdSessionPos").textContent = `Session ${sdIndex + 1} of ${total}`;
  document.getElementById("sdPrevSession").disabled = sdIndex === 0;
  document.getElementById("sdNextSession").disabled = sdIndex === total - 1;
}

/* Steps follow the Sessions table's row order. The page re-renders in
   place; the URL keeps ?session= in step so a reload stays put. */
function goToSession(index) {
  if (index < 0 || index >= sdPatient.sessions.length || index === sdIndex) return;
  sdIndex = index;
  const url = new URL(location.href);
  url.searchParams.set("session", index);
  history.replaceState(null, "", url);
  renderSession();
}

document.getElementById("sdPrevSession").addEventListener("click", () => goToSession(sdIndex - 1));
document.getElementById("sdNextSession").addEventListener("click", () => goToSession(sdIndex + 1));

/* ---------------- Recordings ---------------- */
const sdPlayIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4L20 12L6 20Z"/></svg>`;
const sdPauseIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
const sdKebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function sdFormatTime(sec) {
  const s = Math.floor(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const sdEditToggle = document.getElementById("sdEditMode");
const sdRecRows = document.getElementById("sdRecordingRows");

/* Notes and the two checkboxes are only editable in Edit mode; otherwise
   Notes is plain text and the checkboxes are read-only. */
function renderRecordings() {
  sdRecPlayer.stop();
  const edit = sdEditToggle.checked;
  const { recordings } = sdSessionData(sdIndex);
  document.getElementById("sdRecordingCount").textContent = `(${recordings.length})`;
  sdRecRows.innerHTML = recordings
    .map(
      (r, i) => `
    <tr>
      <td><strong>${sdEsc(r.identifier)}</strong></td>
      <td>${sdEsc(r.language)}</td>
      <td>${sdEsc(r.time)}</td>
      <td>${edit
        ? `<input type="text" class="sd-note-input" data-index="${i}" value="${sdEsc(r.notes)}" placeholder="Add a note" aria-label="Notes for ${sdEsc(r.identifier)}" />`
        : sdEsc(r.notes) || "—"}</td>
      <td>${r.iaError ? `<span class="sd-ia-error">${sdEsc(r.iaError)}</span>` : "—"}</td>
      <td>${sdEsc(r.uploaded)}</td>
      <td>${sdEsc(r.iaVersion)}</td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-index="${i}" data-field="isError" aria-label="Is Error" ${r.isError ? "checked" : ""} ${edit ? "" : "disabled"} /></td>
      <td><input type="checkbox" class="bo-cell-checkbox" data-index="${i}" data-field="asrError" aria-label="ASR Error" ${r.asrError ? "checked" : ""} ${edit ? "" : "disabled"} /></td>
      <td>
        <div class="sd-audio">
          <div class="bo-rec-part" data-duration-ms="${r.duration * 1000}" data-elapsed-ms="0">
            <button type="button" class="bo-rec-play" aria-label="Play">${sdPlayIcon}</button>
            <span class="bo-rec-time">0:00 / ${sdFormatTime(r.duration)}</span>
            <div class="bo-rec-track"><div class="bo-rec-fill"></div></div>
          </div>
          <button type="button" class="bo-action-icon sd-rec-menu-trigger" data-index="${i}" aria-label="Recording actions">${sdKebabIcon}</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

sdEditToggle.addEventListener("change", renderRecordings);

sdRecRows.addEventListener("input", (e) => {
  const input = e.target.closest(".sd-note-input");
  if (!input) return;
  sdSessionData(sdIndex).recordings[Number(input.dataset.index)].notes = input.value;
});

sdRecRows.addEventListener("change", (e) => {
  const box = e.target.closest(".bo-cell-checkbox");
  if (!box) return;
  sdSessionData(sdIndex).recordings[Number(box.dataset.index)][box.dataset.field] = box.checked;
});

/* Fake playback (no real audio in the prototype) -- same behaviour as the
   ticket page's recording parts: play animates the time + progress line,
   pause keeps the position, and playing one recording stops any other. */
function createSessionRecordingPlayer(listEl) {
  let timer = null;

  function resetIcon(btn) {
    btn.classList.remove("playing");
    btn.innerHTML = sdPlayIcon;
    btn.setAttribute("aria-label", "Play");
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    listEl.querySelectorAll(".bo-rec-part").forEach((row) => {
      resetIcon(row.querySelector(".bo-rec-play"));
      row.dataset.elapsedMs = 0;
      row.querySelector(".bo-rec-fill").style.width = "0%";
      row.querySelector(".bo-rec-time").textContent = `0:00 / ${sdFormatTime(Number(row.dataset.durationMs) / 1000)}`;
    });
  }

  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".bo-rec-play");
    if (!btn) return;
    const row = btn.closest(".bo-rec-part");
    const wasPlaying = btn.classList.contains("playing");
    const resumeFromMs = Number(row.dataset.elapsedMs) || 0;

    clearInterval(timer);
    if (wasPlaying) {
      resetIcon(btn);
      return;
    }
    stop();
    row.dataset.elapsedMs = resumeFromMs;

    const durationMs = Number(row.dataset.durationMs);
    const fillEl = row.querySelector(".bo-rec-fill");
    const timeEl = row.querySelector(".bo-rec-time");
    btn.classList.add("playing");
    btn.innerHTML = sdPauseIcon;
    btn.setAttribute("aria-label", "Pause");

    const startedAt = Date.now() - resumeFromMs;
    timer = setInterval(() => {
      const elapsedMs = Math.min(Date.now() - startedAt, durationMs);
      row.dataset.elapsedMs = elapsedMs;
      fillEl.style.width = `${(elapsedMs / durationMs) * 100}%`;
      timeEl.textContent = `${sdFormatTime(elapsedMs / 1000)} / ${sdFormatTime(durationMs / 1000)}`;
      if (elapsedMs >= durationMs) stop();
    }, 100);
  });

  return { stop };
}

const sdRecPlayer = createSessionRecordingPlayer(sdRecRows);

/* ---------------- Recording row menu (Download) ---------------- */
const sdRecRowMenu = document.getElementById("sdRecRowMenu");
let sdMenuRecIndex = null;

function closeSdRecRowMenu() {
  sdRecRowMenu.classList.remove("open");
  sdMenuRecIndex = null;
}

sdRecRows.addEventListener("click", (e) => {
  const trigger = e.target.closest(".sd-rec-menu-trigger");
  if (!trigger) return;
  e.stopPropagation();
  sdMenuRecIndex = Number(trigger.dataset.index);
  const rect = trigger.getBoundingClientRect();
  sdRecRowMenu.classList.add("open");
  const openUpward = window.innerHeight - rect.bottom < sdRecRowMenu.offsetHeight + 12;
  sdRecRowMenu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  sdRecRowMenu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
  sdRecRowMenu.style.left = `${rect.right - 190}px`;
});

sdRecRowMenu.addEventListener("click", (e) => {
  const item = e.target.closest(".bo-row-menu-item");
  if (!item || sdMenuRecIndex === null) return;
  const rec = sdSessionData(sdIndex).recordings[sdMenuRecIndex];
  closeSdRecRowMenu();
  if (item.dataset.action === "download") {
    alert(`Downloading ${rec.identifier}.wav is not available in this preview.`);
  }
});

document.addEventListener("click", (e) => {
  if (!sdRecRowMenu.contains(e.target)) closeSdRecRowMenu();
});
document.addEventListener("scroll", closeSdRecRowMenu, true);
window.addEventListener("resize", closeSdRecRowMenu);

/* ---------------- Clinical Questions ---------------- */
function renderQuestions() {
  document.getElementById("sdQuestionRows").innerHTML = sdSessionData(sdIndex)
    .questions.map(
      (q, i) => `
    <tr>
      <td>${i + 1}</td>
      <td><span class="bo-pill bo-pill-archive-type">${sdEsc(q.type)}</span></td>
      <td class="sd-question-text">${sdEsc(q.question)}</td>
      <td><strong>${sdEsc(q.answer)}</strong></td>
    </tr>`
    )
    .join("");
}

/* ---------------- Render ---------------- */
function renderSession() {
  closeSdRecRowMenu();
  renderSessionBar();
  renderRecordings();
  renderQuestions();
}
renderSession();
