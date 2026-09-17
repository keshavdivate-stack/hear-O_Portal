/* ---------------- Language Resources ---------------- */
const LR_PAGE_SIZE = 20;

document.getElementById("lrSiteFilterMenu").innerHTML = buildBoSelectOptions(LR_SITES);
document.getElementById("lrLangFilterMenu").innerHTML = buildBoSelectOptions(LR_LANGS);

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
const lrVolumeMutedIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M17 9l5 5"/><path d="M22 9l-5 5"/></svg>`;
const lrKebabIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;
const lrSpeedIcon = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21a9 9 0 1 1 6.36-2.64"/><path d="M12 7v5l3 2"/><path d="M21 3v5h-5"/></svg>`;
const lrChevronIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>`;
const lrBackChevronIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>`;
const lrCheckIcon = `<svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const LR_SPEEDS = ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"];

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
          <button class="bo-action-icon lr-volume-btn" type="button" data-id="${e.r.id}" aria-label="${e.r.muted || lrVolumeOf(e.r) === 0 ? "Unmute" : "Mute"}">${e.r.muted || lrVolumeOf(e.r) === 0 ? lrVolumeMutedIcon : lrVolumeIcon}</button>
          <button class="bo-action-icon lr-more-btn" type="button" data-id="${e.r.id}" aria-label="Playback options">${lrKebabIcon}</button>
        </div>
      </td>
    </tr>`,
  { pageSize: LR_PAGE_SIZE, emptyColspan: 9, emptyText: "No recordings found for the selected filters." }
);
lrPager();

/* Play a recording: toggle its play/pause icon and stamp the Notes column with
   the username of whoever played it (the currently signed-in backoffice user). */
document.getElementById("lrRows").addEventListener("click", (e) => {
  const playBtn = e.target.closest(".bo-audio-play");
  if (playBtn) {
    const id = Number(playBtn.dataset.id);
    const rec = lrRecordings.find((r) => r.id === id);
    if (!rec) return;

    const playing = playBtn.classList.toggle("playing");
    playBtn.innerHTML = playing ? lrPauseIcon : lrPlayIcon;

    if (playing) {
      rec.notes = lrCurrentUserName();
      const row = playBtn.closest("tr");
      const notesCell = row && row.querySelector(".lr-notes-cell");
      if (notesCell) notesCell.textContent = rec.notes;
    }
    return;
  }

  const volumeBtn = e.target.closest(".lr-volume-btn");
  if (volumeBtn) {
    e.stopPropagation();
    openLrVolumeMenu(Number(volumeBtn.dataset.id), volumeBtn);
    return;
  }

  const moreBtn = e.target.closest(".lr-more-btn");
  if (moreBtn) {
    e.stopPropagation();
    openLrSpeedMenu(Number(moreBtn.dataset.id), moreBtn);
  }
});

/* ---------------- "More" popover: Playback speed ----------------
   Opens straight to a single "Playback speed" row; clicking it drills the
   same popover into the speed list with a check on the active value and a
   back row to return, instead of popping a second menu next to the first. */
const lrSpeedMenu = document.getElementById("lrSpeedMenu");
let lrSpeedMenuRecId = null;

function lrSpeedMenuRootHtml() {
  return `
    <button type="button" class="bo-row-menu-item" data-step="speed" style="display:flex; align-items:center; gap:8px;">
      ${lrSpeedIcon}
      <span style="flex:1;">Playback speed</span>
      ${lrChevronIcon}
    </button>`;
}

function lrSpeedMenuListHtml(rec) {
  const current = rec.speed || "1x";
  return `
    <button type="button" class="bo-row-menu-back" data-step="back">
      ${lrBackChevronIcon}
      <span>Playback speed</span>
    </button>
    <div class="bo-row-menu-divider"></div>
    <div class="bo-row-menu-scroll">
      ${LR_SPEEDS.map(
        (v) => `<div class="bo-select-option${v === current ? " selected" : ""}" data-speed="${v}">${v}${lrCheckIcon}</div>`
      ).join("")}
    </div>`;
}

let lrSpeedMenuAnchor = null;

function lrPositionSpeedMenu() {
  if (!lrSpeedMenuAnchor) return;
  const rect = lrSpeedMenuAnchor.getBoundingClientRect();
  const margin = 12;
  const menuHeight = lrSpeedMenu.offsetHeight;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight + margin && rect.top > spaceBelow;
  lrSpeedMenu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  lrSpeedMenu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
  lrSpeedMenu.style.left = `${rect.right - 190}px`;
}

function openLrSpeedMenu(id, anchorBtn) {
  const rec = lrRecordings.find((r) => r.id === id);
  if (!rec) return;
  closeLrVolumeMenu();
  lrSpeedMenuRecId = id;
  lrSpeedMenuAnchor = anchorBtn;
  lrSpeedMenu.innerHTML = lrSpeedMenuRootHtml();
  lrSpeedMenu.classList.add("open");
  lrPositionSpeedMenu();
}

function closeLrSpeedMenu() {
  lrSpeedMenu.classList.remove("open");
  lrSpeedMenuRecId = null;
  lrSpeedMenuAnchor = null;
}

lrSpeedMenu.addEventListener("click", (e) => {
  const rec = lrRecordings.find((r) => r.id === lrSpeedMenuRecId);
  if (!rec) return;

  const backBtn = e.target.closest('[data-step="back"]');
  if (backBtn) {
    lrSpeedMenu.innerHTML = lrSpeedMenuRootHtml();
    lrPositionSpeedMenu();
    return;
  }

  const stepBtn = e.target.closest('[data-step="speed"]');
  if (stepBtn) {
    lrSpeedMenu.innerHTML = lrSpeedMenuListHtml(rec);
    lrPositionSpeedMenu();
    return;
  }

  const speedOption = e.target.closest("[data-speed]");
  if (speedOption) {
    rec.speed = speedOption.dataset.speed;
    closeLrSpeedMenu();
  }
});

/* ---------------- Volume popover ----------------
   Opens on the volume icon, holds a slider (0-100) plus a mute toggle so the
   level itself can be adjusted rather than only muting/unmuting. */
const lrVolumeMenu = document.getElementById("lrVolumeMenu");
let lrVolumeMenuRecId = null;

function lrVolumeOf(rec) {
  return typeof rec.volume === "number" ? rec.volume : 100;
}

function lrRowVolumeBtn(id) {
  return document.querySelector(`.lr-volume-btn[data-id="${id}"]`);
}

function lrRefreshVolumeBtnIcon(rec) {
  const btn = lrRowVolumeBtn(rec.id);
  if (!btn) return;
  const isMuted = rec.muted || lrVolumeOf(rec) === 0;
  btn.innerHTML = isMuted ? lrVolumeMutedIcon : lrVolumeIcon;
  btn.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
}

function lrVolumeMenuHtml(rec) {
  const vol = rec.muted ? 0 : lrVolumeOf(rec);
  const isMuted = rec.muted || lrVolumeOf(rec) === 0;
  return `
    <div class="bo-volume-menu-row">
      <button type="button" class="bo-action-icon" id="lrVolumeMuteToggle" aria-label="${isMuted ? "Unmute" : "Mute"}">${isMuted ? lrVolumeMutedIcon : lrVolumeIcon}</button>
      <input type="range" class="bo-volume-slider" id="lrVolumeSlider" min="0" max="100" value="${vol}" />
      <span class="bo-volume-value" id="lrVolumeValue">${vol}%</span>
    </div>`;
}

function openLrVolumeMenu(id, anchorBtn) {
  const rec = lrRecordings.find((r) => r.id === id);
  if (!rec) return;
  closeLrSpeedMenu();
  lrVolumeMenuRecId = id;
  lrVolumeMenu.innerHTML = lrVolumeMenuHtml(rec);

  const rect = anchorBtn.getBoundingClientRect();
  lrVolumeMenu.style.top = `${rect.bottom + 6}px`;
  lrVolumeMenu.style.left = `${rect.right - 190}px`;
  lrVolumeMenu.classList.add("open");
}

function closeLrVolumeMenu() {
  lrVolumeMenu.classList.remove("open");
  lrVolumeMenuRecId = null;
}

lrVolumeMenu.addEventListener("click", (e) => {
  if (e.target.id !== "lrVolumeMuteToggle") return;
  const rec = lrRecordings.find((r) => r.id === lrVolumeMenuRecId);
  if (!rec) return;
  rec.muted = !rec.muted;
  lrVolumeMenu.innerHTML = lrVolumeMenuHtml(rec);
  lrRefreshVolumeBtnIcon(rec);
});

lrVolumeMenu.addEventListener("input", (e) => {
  if (e.target.id !== "lrVolumeSlider") return;
  const rec = lrRecordings.find((r) => r.id === lrVolumeMenuRecId);
  if (!rec) return;
  rec.volume = Number(e.target.value);
  rec.muted = rec.volume === 0;
  document.getElementById("lrVolumeValue").textContent = `${rec.volume}%`;
  const muteBtn = document.getElementById("lrVolumeMuteToggle");
  muteBtn.innerHTML = rec.muted ? lrVolumeMutedIcon : lrVolumeIcon;
  muteBtn.setAttribute("aria-label", rec.muted ? "Unmute" : "Mute");
  lrRefreshVolumeBtnIcon(rec);
});

document.addEventListener("click", (e) => {
  if (!lrSpeedMenu.contains(e.target)) closeLrSpeedMenu();
  if (!lrVolumeMenu.contains(e.target)) closeLrVolumeMenu();
});

/* Filters apply as soon as a field changes -- no Apply button to batch them. */
document.getElementById("lrSiteFilter").addEventListener("change", (e) => {
  lrSiteFilter = e.target.value;
  lrPager.resetPage();
  lrPager();
});
document.getElementById("lrLangFilter").addEventListener("change", (e) => {
  lrLangFilter = e.target.value;
  lrPager.resetPage();
  lrPager();
});
document.getElementById("lrIdentifierFilter").addEventListener("input", (e) => {
  lrIdentifierFilter = e.target.value;
  lrPager.resetPage();
  lrPager();
});
document.getElementById("lrUsernameFilter").addEventListener("input", (e) => {
  lrUsernameFilter = e.target.value;
  lrPager.resetPage();
  lrPager();
});

/* ---------------- Commercial / Non Commercial toggle ----------------
   On = Commercial, off = Non Commercial -- the label swaps with the
   switch instead of staying fixed on one word regardless of state. */
const lrHmoToggle = document.getElementById("lrHmoToggle");
const lrHmoToggleLabel = document.getElementById("lrHmoToggleLabel");
function syncLrHmoToggleLabel() {
  lrHmoToggleLabel.textContent = lrHmoToggle.checked ? "Commercial" : "Non Commercial";
}
lrHmoToggle.addEventListener("change", syncLrHmoToggleLabel);
syncLrHmoToggleLabel();

document.getElementById("lrClearFiltersBtn").addEventListener("click", () => {
  lrSiteFilter = "";
  lrLangFilter = "";
  lrIdentifierFilter = "";
  lrUsernameFilter = "";

  resetBoSelect(document.querySelector('.bo-select[data-name="lrSite"]'));
  resetBoSelect(document.querySelector('.bo-select[data-name="lrLang"]'));
  document.getElementById("lrIdentifierFilter").value = "";
  document.getElementById("lrUsernameFilter").value = "";
  const fromDateEl = document.getElementById("lrFromDate");
  const toDateEl = document.getElementById("lrToDate");
  fromDateEl.value = "";
  fromDateEl.type = "text";
  toDateEl.value = "";
  toDateEl.type = "text";

  lrPager.resetPage();
  lrPager();
});
