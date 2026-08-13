/* ---------------- Language Resources ---------------- */
const LR_PAGE_SIZE = 20;

document.getElementById("lrSiteFilter").insertAdjacentHTML(
  "beforeend",
  LR_SITES.map((s) => `<option value="${s}">${s}</option>`).join("")
);
document.getElementById("lrLangFilter").insertAdjacentHTML(
  "beforeend",
  LR_LANGS.map((l) => `<option value="${l}">${l}</option>`).join("")
);

let lrSiteFilter = "";
let lrLangFilter = "";
let lrIdentifierFilter = "";
let lrUsernameFilter = "";

function lrFiltered() {
  return lrRecordings.filter((r) => {
    if (lrSiteFilter && !r.username.startsWith(lrSiteFilter)) return false;
    if (lrLangFilter && r.language !== lrLangFilter) return false;

    if (lrIdentifierFilter) {
      const ids = lrIdentifierFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (ids.length && !ids.some((id) => r.identifier.toLowerCase().includes(id))) return false;
    }

    if (lrUsernameFilter) {
      const names = lrUsernameFilter.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (names.length && !names.some((n) => r.username.toLowerCase().includes(n))) return false;
    }

    return true;
  });
}

const lrPlayIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4L20 12L6 20Z"/></svg>`;
const lrPauseIcon = `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
const lrVolumeIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9a4 4 0 0 1 0 6"/></svg>`;
const lrKebabIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

function lrCurrentUserName() {
  const el = document.querySelector(".bo-user-name");
  return el ? el.textContent.trim() : "Unknown User";
}

function lrDuration(sec) {
  return `0:00 / 0:${String(sec).padStart(2, "0")}`;
}

const lrPager = boCreatePager(
  "lrRows",
  () => lrFiltered().map((r, idx) => ({ r, num: idx + 1 })),
  (e) => `
    <tr data-row-id="${e.r.id}">
      <td>${e.num}</td>
      <td>${e.r.username}</td>
      <td>${e.r.date}</td>
      <td>${e.r.time}</td>
      <td>${e.r.language}</td>
      <td>${e.r.identifier}</td>
      <td class="lr-notes-cell">${e.r.notes || ""}</td>
      <td>${e.r.voiceInput || ""}</td>
      <td>
        <div class="bo-audio-player">
          <button class="bo-audio-play" data-id="${e.r.id}" aria-label="Play">${lrPlayIcon}</button>
          <span class="bo-audio-time">${lrDuration(e.r.duration)}</span>
          <div class="bo-audio-track"><div class="bo-audio-fill"></div></div>
          <button class="bo-action-icon" type="button" aria-label="Volume">${lrVolumeIcon}</button>
          <button class="bo-action-icon" type="button" aria-label="More">${lrKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: LR_PAGE_SIZE, emptyColspan: 9, emptyText: "No recordings found for the selected filters." }
);
lrPager();

/* Play a recording: toggle its play/pause icon and stamp the Notes column with
   the username of whoever played it (the currently signed-in backoffice user). */
document.getElementById("lrRows").addEventListener("click", (e) => {
  const btn = e.target.closest(".bo-audio-play");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const rec = lrRecordings.find((r) => r.id === id);
  if (!rec) return;

  const playing = btn.classList.toggle("playing");
  btn.innerHTML = playing ? lrPauseIcon : lrPlayIcon;

  if (playing) {
    rec.notes = lrCurrentUserName();
    const row = btn.closest("tr");
    const notesCell = row && row.querySelector(".lr-notes-cell");
    if (notesCell) notesCell.textContent = rec.notes;
  }
});

document.getElementById("lrApplyBtn").addEventListener("click", () => {
  lrSiteFilter = document.getElementById("lrSiteFilter").value;
  lrLangFilter = document.getElementById("lrLangFilter").value;
  lrIdentifierFilter = document.getElementById("lrIdentifierFilter").value;
  lrUsernameFilter = document.getElementById("lrUsernameFilter").value;
  lrPager.resetPage();
  lrPager();
});
