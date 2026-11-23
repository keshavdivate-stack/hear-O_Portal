/* ============================================================
   Patient chart -- HearO status timeline: < > arrows move it
   ------------------------------------------------------------
   Loaded AFTER the page script (patient-data.js / nurse-view.js /
   ehr-integration patient-data.js), which builds the timeline for the
   page's 31 chartDays only. This replaces that builder with a windowed
   one over a longer (generated) history, so the arrows scroll back and
   forward by a week. The newest window (ending today) shows first; the
   right arrow stops at today and the left arrow at the oldest day.
   ============================================================ */
(() => {
  if (typeof chartDays === "undefined" || typeof buildDayScale !== "function") return;
  const card = document.getElementById("overviewChartWrap")?.closest(".overview-card");
  if (!card) return;

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const OLDER_DAYS = 63; // nine weeks of earlier history
  const STEP = 7;
  const PAD = 30;
  const H = 100;
  const LINE_Y = 65;
  const COLOR = { baseline: "#C9CFD6", active: "#3FBE84", priority: "#F16C6C" };

  /* ---------- Earlier history (made up, stable): mostly Active, one Priority episode, one no-data gap ---------- */
  const first = chartDays[0];
  const firstDate = new Date(2025, MONTHS.indexOf(first.month), Number(first.label));
  const older = [];
  for (let k = OLDER_DAYS; k >= 1; k--) {
    const d = new Date(firstDate);
    d.setDate(d.getDate() - k);
    const i = OLDER_DAYS - k; // 0 = oldest
    const day = { label: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()], status: "active" };
    if (i >= 24 && i <= 28) day.status = "priority";
    if (i === 24) day.heart = true;
    if (i >= 44 && i <= 45) day.gap = true;
    older.push(day);
  }
  const history = [...older, ...chartDays];
  const SIZE = chartDays.length;
  const MAX_OFFSET = history.length - SIZE;
  let offset = 0; // days back from today

  const windowDays = () => history.slice(history.length - SIZE - offset, history.length - offset);

  function render() {
    const wrap = document.getElementById("overviewChartWrap");
    const days = windowDays();
    const W = Math.max(400, wrap.clientWidth || 0);
    const col = (W - PAD * 2) / (days.length - 1);
    const x = (i) => PAD + i * col;

    /* Line segments: each one takes the colour of the day it leads into. */
    let lines = "";
    for (let i = 1; i < days.length; i++) {
      lines += `<line x1="${x(i - 1)}" y1="${LINE_Y}" x2="${x(i)}" y2="${LINE_Y}" stroke="${COLOR[days[i].status]}" stroke-width="2.5" />`;
    }

    /* Hatched block over each run of no-data days. */
    let hatches = "";
    for (let i = 0; i < days.length; i++) {
      if (!days[i].gap || (i > 0 && days[i - 1].gap)) continue;
      let j = i;
      while (j + 1 < days.length && days[j + 1].gap) j++;
      hatches += `<rect x="${x(i) - col / 2}" y="6" width="${x(j) - x(i) + col}" height="${H - 24}" fill="url(#hatchPan)" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />`;
    }

    let markers = "";
    days.forEach((d, i) => {
      if (d.gap) return;
      const cx = x(i);
      if (d.status === "baseline") markers += `<rect x="${cx - 4}" y="${LINE_Y - 4}" width="8" height="8" rx="2" fill="${COLOR.baseline}" />`;
      else if (d.status === "active") markers += `<circle cx="${cx}" cy="${LINE_Y}" r="4.5" fill="#fff" stroke="${COLOR.active}" stroke-width="2" />`;
      else markers += `<circle cx="${cx}" cy="${LINE_Y}" r="5.5" fill="${COLOR.priority}" />`;
      if (d.heart) {
        markers += `<path transform="translate(${cx - 9}, ${LINE_Y - 40})" d="M9 16C9 16 1 10.9 1 5.7C1 3 3.1 1.2 5.4 1.2C6.6 1.2 7.5 1.7 9 2.9C10.5 1.7 11.4 1.2 12.6 1.2C14.9 1.2 17 3 17 5.7C17 10.9 9 16 9 16Z" fill="${COLOR.priority}"/>`;
      }
    });

    wrap.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hatchPan" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
          </pattern>
        </defs>
        ${hatches}${lines}${markers}
      </svg>`;

    buildDayScale("chartDayScale", days);
    const monthRow = card.querySelector(".chart-month-row");
    if (monthRow && typeof monthRowHtml === "function") monthRow.innerHTML = monthRowHtml(days);

    prev.disabled = offset >= MAX_OFFSET;
    next.disabled = offset <= 0;
  }

  const [prev, next] = card.querySelectorAll(".chart-nav > .chart-arrow");
  if (!prev || !next) return;
  prev.addEventListener("click", () => {
    offset = Math.min(MAX_OFFSET, offset + STEP);
    render();
  });
  next.addEventListener("click", () => {
    offset = Math.max(0, offset - STEP);
    render();
  });

  /* The page's resize handler calls buildOverviewChart by name: point it at the windowed version. */
  window.buildOverviewChart = render;
  render();
})();
