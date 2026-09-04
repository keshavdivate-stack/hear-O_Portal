const guideIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6C2 4.9 2.9 4 4 4H10C11.1 4 12 4.9 12 6V20C12 19.4 11.1 19 10 19H4C2.9 19 2 18.4 2 17.8V6Z"/><path d="M22 6C22 4.9 21.1 4 20 4H14C12.9 4 12 4.9 12 6V20C12 19.4 12.9 19 14 19H20C21.1 19 22 18.4 22 17.8V6Z"/></svg>`;
const chevronIcon = `<svg class="study-card-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;

function renderGuides() {
  const grid = document.getElementById("studyGuideGrid");
  grid.innerHTML = studyGuides
    .map(
      (g, i) => `
      <div class="study-card">
        <span class="study-card-icon">${guideIcon}</span>
        <h3 class="study-card-title">${g.title}</h3>
        <p class="study-card-desc">${g.summary}</p>
        <p class="study-card-body" id="studyGuideBody${i}" hidden>${g.body}</p>
        <button type="button" class="study-card-link" data-guide="${i}">
          <span class="study-card-link-label">Read guide</span>
          ${chevronIcon}
        </button>
      </div>`
    )
    .join("");
}

renderGuides();

document.getElementById("studyGuideGrid").addEventListener("click", (e) => {
  const btn = e.target.closest("[data-guide]");
  if (!btn) return;
  const i = btn.dataset.guide;
  const body = document.getElementById(`studyGuideBody${i}`);
  const expanded = !body.hidden;
  body.hidden = expanded;
  btn.classList.toggle("open", !expanded);
  btn.querySelector(".study-card-link-label").textContent = expanded ? "Read guide" : "Show less";
});
