/* ============================================================
   Patient chart -- Recordings + Health Data time window
   ------------------------------------------------------------
   Loaded AFTER the page script (patient-data.js / nurse-view.js /
   ehr-integration patient-data.js). Those pages share the same chart
   builder names, so this file swaps the Recordings and Health Data
   builders for windowed versions:

   - Health Data gets its own "Week / 30 days / 90 days" filter (next to
     Add measurement); the old global Week/Month toggle is hidden there.
   - Every Health Data chart and the Recordings row can be scrolled back
     through history by dragging on the graph or with the < > arrows.
     All Health Data charts pan together so dates line up across cards.
   ============================================================ */
(() => {
  if (typeof chartDays === "undefined") return;

  const HISTORY_DAYS = 180;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  /* Seeded RNG so the generated older history is stable while panning */
  let seed = 20260110;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  /* ---------- History axis: older generated days + the page's chartDays ---------- */
  const lastDay = chartDays[chartDays.length - 1];
  const todayDate = new Date(2026, MONTHS.indexOf(lastDay.month), Number(lastDay.label));
  const older = [];
  for (let k = HISTORY_DAYS - 1; k >= chartDays.length; k--) {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - k);
    older.push({ label: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] });
  }
  const historyDays = [...older, ...chartDays];
  const TOTAL = historyDays.length;

  /* Pads a page data array (aligned to chartDays) back to the full history */
  const extCache = new Map();
  function ext(arr) {
    if (arr.length >= TOTAL) return arr;
    if (extCache.has(arr)) return extCache.get(arr);
    const samples = arr.filter((v) => v != null);
    const pad = Array.from({ length: TOTAL - arr.length }, () => {
      if (!samples.length) return null;
      const s = samples[Math.floor(rnd() * samples.length)];
      if (typeof s === "number") {
        const v = s + (rnd() - 0.5) * s * 0.05;
        return Number.isInteger(s) ? Math.round(v) : Math.round(v * 10) / 10;
      }
      return s && typeof s === "object" ? { ...s } : s;
    });
    const out = [...pad, ...arr];
    extCache.set(arr, out);
    return out;
  }

  /* ---------- Views (window size + how many days back from today) ---------- */
  const hdView = { size: 30, offset: 0 };
  const recView = { size: 30, offset: 0 };
  const maxOffset = (v) => TOTAL - v.size;
  const clampOffset = (v, o) => Math.min(maxOffset(v), Math.max(0, o));
  function win(v, arr) {
    const end = TOTAL - v.offset;
    return arr.slice(end - v.size, end);
  }
  const winDays = (v) => win(v, historyDays);
  const winData = (v, arr) => win(v, ext(arr));

  /* Day label: every day up to 31 days, every 5th day (counted back from the
     newest visible day) for 90 days; month shown under the first labelled day
     and wherever the month changes. */
  function dayLabel(days, i) {
    const n = days.length;
    const step = n <= 31 ? 1 : 5;
    if ((n - 1 - i) % step !== 0) return "";
    const d = days[i];
    const prev = i - step;
    const showMonth = prev < 0 || days[prev].month !== d.month;
    const day = d.today ? `<span class="today">${d.label}</span>` : d.label;
    return `${day}${showMonth ? `<span class="pan-month">${d.month}</span>` : ""}`;
  }

  function renderDayScale(id, days) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = days.map((d, i) => `<span>${dayLabel(days, i)}</span>`).join("");
  }

  /* Months now sit under the day labels, so the old separate month rows stay empty */
  function clearMonthRow(id) {
    const el = id && document.getElementById(id);
    if (el) el.innerHTML = "";
  }

  const hatchDefs = (id) => `
    <defs>
      <pattern id="${id}" width="7" height="7" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" stroke="#D8DCE2" stroke-width="3" />
      </pattern>
    </defs>`;

  function gapRect(days, x, colW, patternId, y, h) {
    const gi = gapIndicesOf(days);
    if (!gi.length) return "";
    const hx = x(gi[0]) - colW / 2;
    const hw = x(gi[gi.length - 1]) - x(gi[0]) + colW;
    return `<rect x="${hx}" y="${y}" width="${hw}" height="${h}" fill="url(#${patternId})" stroke="#C9CFD6" stroke-width="1" stroke-dasharray="4 3" rx="4" />`;
  }

  /* ---------- Recordings ---------- */
  const CHECK_ICON = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  window.buildRecordings = function () {
    const row = document.getElementById("recordingsRow");
    if (!row) return;
    const days = winDays(recView);
    const status = winData(recView, recordingStatus);
    row.innerHTML = days
      .map((d, i) => {
        const s = status[i];
        let icon = "";
        let cls = "rec-none";
        if (s === "valid") { cls = "rec-valid"; icon = CHECK_ICON; }
        else if (s === "low") { cls = "rec-low"; icon = "!"; }
        return `
          <div class="rec-day">
            <div class="rec-icon ${cls}">${icon}</div>
            <span class="rec-day-label">${dayLabel(days, i)}</span>
          </div>`;
      })
      .join("");
    clearMonthRow("recMonthRow");
    queueArrowLayout();
  };

  /* ---------- Health Data: line charts (BP / Weight / Heart Rate / SpO2) ---------- */
  let lineSeq = 0;

  window.buildAxisLineChart = function (wrapId, dayScaleId, seriesList, domainMin, domainMax, H, monthRowId) {
    const wrapEl = document.getElementById(wrapId);
    if (!wrapEl) return;
    const days = winDays(hdView);
    const n = days.length;
    const width = Math.max(300, wrapEl.clientWidth || 0);
    const colW = width / n;
    const x = (i) => (i + 0.5) * colW;
    const span = domainMax - domainMin;
    const r = n > 31 ? 2.5 : n > 7 ? 4 : 5;
    const patternId = `panHatch${lineSeq++}`;

    let inner = gapRect(days, x, colW, patternId, 2, H - 4);
    seriesList.forEach((s) => {
      const vals = winData(hdView, s.data);
      const pts = [];
      vals.forEach((v, i) => {
        if (v == null) return;
        const y = Math.min(H - 5, Math.max(5, H - ((v - domainMin) / span) * H));
        pts.push({ x: x(i), y });
      });
      inner += `<polyline points="${pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")}" fill="none" stroke="${s.color}" stroke-width="2.5" />`;
      inner += pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${s.color}" />`).join("");
    });

    wrapEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${H}" width="${width}" height="${H}" xmlns="http://www.w3.org/2000/svg">
        ${hatchDefs(patternId)}
        ${inner}
      </svg>`;
    renderDayScale(dayScaleId, days);
    clearMonthRow(monthRowId);
    queueArrowLayout();
  };

  window.renderWeightChart = function () {
    const isLbs = weightUnit === "lbs";
    const data = ext(weightKgData).map((v) => (v == null ? null : isLbs ? kgToLbs(v) : v));
    document.getElementById("weightYAxis").innerHTML = isLbs
      ? "<span>220</span><span>198</span><span>176</span>"
      : "<span>100</span><span>90</span><span>80</span>";
    document.getElementById("weightLegendLabel").textContent = isLbs ? "lbs" : "kg";
    buildAxisLineChart("weightChartWrap", "weightDayScale", [{ data, color: "#2E5AAC" }], isLbs ? 176 : 80, isLbs ? 220 : 100, 150, "weightMonthRow");
  };

  /* ---------- Health Data: Activity ---------- */
  window.buildActivityChart = function () {
    const wrapEl = document.getElementById("activityChartWrap");
    if (!wrapEl) return;
    const days = winDays(hdView);
    const data = winData(hdView, activityData);
    const n = days.length;
    const H = 150;
    const top = 10;
    const bottom = top + H;
    const width = Math.max(300, wrapEl.clientWidth || 0);
    const colW = width / n;
    const x = (i) => (i + 0.5) * colW;
    const r = n > 31 ? 2 : 3;

    const toPts = (key) => {
      const vals = data.filter(Boolean).map((v) => v[key]);
      const max = Math.max(...vals);
      const min = Math.min(...vals);
      const pts = [];
      data.forEach((v, i) => {
        if (!v) return;
        pts.push({ x: x(i), y: bottom - ((v[key] - min) / (max - min || 1)) * H });
      });
      return pts;
    };
    const poly = (pts) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const dots = (pts, c) => pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${c}" />`).join("");
    const stepsPts = toPts("steps");
    const distPts = toPts("distance");
    const elevPts = toPts("elevation");

    wrapEl.innerHTML = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${top + H + 20}" width="${width}" height="${top + H + 20}" xmlns="http://www.w3.org/2000/svg">
        ${hatchDefs("panHatchA")}
        ${gapRect(days, x, colW, "panHatchA", 2, top + H + 12)}
        <polyline points="${poly(stepsPts)}" fill="none" stroke="#9B7FE8" stroke-width="2" />
        <polyline points="${poly(distPts)}" fill="none" stroke="#1CBFA6" stroke-width="2" />
        <polyline points="${poly(elevPts)}" fill="none" stroke="#B23FD8" stroke-width="2" stroke-dasharray="4 3" />
        ${dots(stepsPts, "#9B7FE8")}
        ${dots(distPts, "#1CBFA6")}
      </svg>`;
    renderDayScale("activityDayScale", days);
    clearMonthRow("activityMonthRow");
    queueArrowLayout();
  };

  /* ---------- Health Data: Sleep ---------- */
  window.buildSleepChart = function () {
    const wrap = document.getElementById("sleepChart");
    if (!wrap) return;
    const days = winDays(hdView);
    const data = winData(hdView, sleepData);
    const dense = days.length > 31;
    wrap.style.gap = dense ? "1px" : "";
    wrap.innerHTML = days
      .map((d, i) => {
        const s = data[i];
        const label = `<span class="sleep-col-label">${dayLabel(days, i)}</span>`;
        if (!s) return `<div class="sleep-col"><div class="sleep-bars gap"></div>${label}</div>`;
        const total = 220;
        return `
          <div class="sleep-col">
            <div class="sleep-tooltip">
              <div class="tt-time">${d.label} ${d.month}<br/>${fmtMins(s.mins)}</div>
              <div class="tt-awake">${s.awake}% Awake</div>
              <div class="tt-rem">${s.rem}% REM</div>
              <div class="tt-light">${s.light}% Light</div>
              <div class="tt-deep">${s.deep}% Deep</div>
            </div>
            <div class="sleep-bars"${dense ? ' style="width:6px;"' : ""}>
              <div class="seg" style="height:${(s.deep / 100) * total}px; background:#2E5AAC;"></div>
              <div class="seg" style="height:${(s.light / 100) * total}px; background:#3FBE84;"></div>
              <div class="seg" style="height:${(s.rem / 100) * total}px; background:#8B6BD1;"></div>
              <div class="seg" style="height:${(s.awake / 100) * total}px; background:#EA580C;"></div>
            </div>
            ${label}
          </div>`;
      })
      .join("");
    clearMonthRow("sleepMonthRow");
    queueArrowLayout();
  };

  /* ---------- Health Data: min/max range bars (Heart / Oxygen / Respiration) ---------- */
  window.buildRangeChart = function (containerId, data, domainMin, domainMax, trackH, color, monthRowId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const days = winDays(hdView);
    const vals = winData(hdView, data);
    const dense = days.length > 31;
    const span = domainMax - domainMin;
    el.style.gap = dense ? "1px" : "";
    el.innerHTML = days
      .map((d, i) => {
        const v = vals[i];
        const label = `<span class="range-col-label">${dayLabel(days, i)}</span>`;
        if (!v) return `<div class="range-col"><div class="range-gap-hatch"></div>${label}</div>`;
        const top = trackH * (1 - (v.max - domainMin) / span);
        const h = Math.max(10, trackH * ((v.max - v.min) / span));
        return `
          <div class="range-col">
            <div class="range-bar" style="top:${top.toFixed(1)}px; height:${h.toFixed(1)}px; background:${color};${dense ? " width:6px;" : ""}"></div>
            ${label}
          </div>`;
      })
      .join("");
    clearMonthRow(monthRowId);
    queueArrowLayout();
  };

  function renderHealth() {
    buildActivityChart();
    buildBpChart();
    buildHrmChart();
    buildSpo2Chart();
    renderWeightChart();
    buildSleepChart();
    buildHeartChart();
    buildOxygenChart();
    buildRespirationChart();
  }

  /* ---------- Pan regions: wrap the graph area, add < > arrows, drag ---------- */
  const regions = [];
  const ARROW = (d) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="${d}"/></svg>`;

  function makeRegion(nodes, view, rerender) {
    if (!nodes.length) return;
    const region = document.createElement("div");
    region.className = "pan-region";
    nodes[0].before(region);
    nodes.forEach((n) => region.appendChild(n));

    const prev = document.createElement("button");
    prev.type = "button";
    prev.className = "pan-arrow pan-prev";
    prev.setAttribute("aria-label", "Show earlier days");
    prev.innerHTML = ARROW("15 18 9 12 15 6");
    const next = document.createElement("button");
    next.type = "button";
    next.className = "pan-arrow pan-next";
    next.setAttribute("aria-label", "Show later days");
    next.innerHTML = ARROW("9 18 15 12 9 6");
    region.append(prev, next);

    const pan = (o) => {
      const v = clampOffset(view, o);
      if (v === view.offset) return;
      view.offset = v;
      rerender();
    };
    prev.addEventListener("click", () => pan(view.offset + view.size));
    next.addEventListener("click", () => pan(view.offset - view.size));
    attachDrag(region, view, pan, () => region.clientWidth - 68);

    regions.push({ region, prev, next, view });
  }

  /* Drag: moving right reveals earlier days. A 4px threshold keeps clicks
     (tooltips, unit toggle, edit buttons) working. */
  function attachDrag(el, view, pan, plotWidth) {
    el.classList.add("pan-draggable");
    let startX = null;
    let startOffset = 0;
    let dragging = false;
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("button, input, select, a, .unit-toggle")) return;
      startX = e.clientX;
      startOffset = view.offset;
      dragging = false;
    });
    el.addEventListener("pointermove", (e) => {
      if (startX == null) return;
      const dx = e.clientX - startX;
      if (!dragging) {
        if (Math.abs(dx) < 4) return;
        dragging = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add("is-dragging");
      }
      const colW = Math.max(1, plotWidth()) / view.size;
      pan(startOffset + Math.round(dx / colW));
    });
    const endDrag = () => {
      startX = null;
      dragging = false;
      el.classList.remove("is-dragging");
    };
    el.addEventListener("pointerup", endDrag);
    el.addEventListener("pointercancel", endDrag);
    el.addEventListener("lostpointercapture", endDrag);
  }

  /* Arrows sit level with the day numbers and disable at either end of history */
  let arrowFrame = 0;
  function queueArrowLayout() {
    cancelAnimationFrame(arrowFrame);
    arrowFrame = requestAnimationFrame(() => {
      regions.forEach(({ region, prev, next, view }) => {
        prev.disabled = view.offset >= maxOffset(view);
        next.disabled = view.offset <= 0;
        if (!region.offsetParent) return;
        const label = region.querySelector(".chart-day-scale, .range-col-label, .sleep-col-label, .rec-day-label");
        if (!label) return;
        const top = label.getBoundingClientRect().top - region.getBoundingClientRect().top + 9 - 14;
        prev.style.top = next.style.top = `${Math.max(0, top)}px`;
      });
    });
  }

  /* Health Data cards: everything below the title + legend is the graph area */
  document.querySelectorAll('.data-tab-panel[data-panel="health-data"] .wellness-card').forEach((card) => {
    const nodes = [...card.children].filter((c) => !c.matches(".wellness-head-row, .sleep-legend"));
    makeRegion(nodes, hdView, renderHealth);
  });

  /* Recordings row */
  const recRow = document.querySelector('.data-tab-panel[data-panel="recordings"] .recordings-row');
  if (recRow) makeRegion([recRow, document.getElementById("recMonthRow")].filter(Boolean), recView, buildRecordings);

  /* ---------- Questionnaire: shared "< Oct 18 – Nov 16 >" bar + synced drag ----------
     Window size follows the page's Week/Month toggle. Every question renders
     from the same view, so dragging any one question scrolls all of them. */
  const questView = { size: 30, offset: 0 };

  /* Questionnaire answers are weekly, so older history keeps the same weekday cadence */
  const questCache = new Map();
  function questExt(arr) {
    if (!arr || arr.length >= TOTAL) return arr;
    if (questCache.has(arr)) return questCache.get(arr);
    const padLen = TOTAL - arr.length;
    const first = arr.findIndex((v) => v != null);
    const samples = arr.filter((v) => v != null);
    const pad = Array.from({ length: padLen }, (_, p) =>
      first >= 0 && (padLen + first - p) % 7 === 0 ? samples[Math.floor(rnd() * samples.length)] : null);
    const out = [...pad, ...arr];
    questCache.set(arr, out);
    return out;
  }

  const questList = document.getElementById("questList");
  let questNav = null;

  function updateQuestNav(days) {
    if (!questNav) return;
    const a = days[0];
    const b = days[days.length - 1];
    questNav.querySelector(".quest-range-label").textContent = `${a.month} ${a.label} – ${b.month} ${b.label}`;
    questNav.querySelector(".pan-prev").disabled = questView.offset >= maxOffset(questView);
    questNav.querySelector(".pan-next").disabled = questView.offset <= 0;
  }

  window.renderQuestionnaire = function () {
    if (!questList) return;
    questView.size = typeof rangeMode !== "undefined" && rangeMode === "week" ? 7 : 30;
    questView.offset = clampOffset(questView, questView.offset);
    const days = winDays(questView);
    const w = (arr) => (arr ? win(questView, questExt(arr)) : null);
    const dayScaleHtml = days.map((d, i) => `<span>${dayLabel(days, i)}</span>`).join("");

    questList.innerHTML = questions
      .map((q, qi) => {
        const ans = w(q.answers);
        const vals = w(q.values);
        const noVals = w(q.noValues);
        const iconsHtml = days
          .map((d, i) => {
            const a = ans[i];
            const cls = a === true ? "quest-ans-yes" : a === false ? "quest-ans-no" : "quest-ans-none";
            const icon = a === true ? adhCheckIcon : a === false ? questXIcon : "";
            const val = a === true ? (vals ? vals[i] : null) : a === false ? (noVals ? noVals[i] : null) : null;
            const valLabel = a === true ? q.valueLabel : q.noValueLabel;
            const tooltip = val ? `<span class="quest-weight-tooltip">${valLabel}: ${val}</span>` : "";
            return `<div class="med-adh-day"><span class="quest-ans-icon ${cls}">${icon}${tooltip}</span></div>`;
          })
          .join("");

        const tags = [];
        if (q.answerType === "value") {
          const unitsNote = q.units?.length ? ` (${q.units.join(" / ")})` : "";
          tags.push(`Value entry${q.valueLabel ? ` — ${q.valueLabel}` : ""}${unitsNote}`);
        }
        const tagsHtml = tags.length
          ? `<div class="quest-config-tags">${tags.map((t) => `<span class="quest-config-tag">${t}</span>`).join("")}</div>`
          : "";

        return `
        <div class="med-block">
          <div class="quest-block-head">
            <span class="quest-label">${q.label}</span>
            <span class="quest-text">${q.text}</span>
            ${tagsHtml}
          </div>
          <div class="med-adherence-row">
            <div class="med-adh-scroll" id="questAdh${qi}">${iconsHtml}</div>
          </div>
          <div class="med-day-scale-wrap">
            <div class="chart-day-scale">${dayScaleHtml}</div>
          </div>
        </div>`;
      })
      .join("");

    if (typeof wireQuestTooltips === "function") wireQuestTooltips();
    updateQuestNav(days);
  };

  if (questList) {
    const panQuest = (o) => {
      const v = clampOffset(questView, o);
      if (v === questView.offset) return;
      questView.offset = v;
      renderQuestionnaire();
    };
    questNav = document.createElement("div");
    questNav.className = "quest-range-nav";
    questNav.innerHTML = `
      <button type="button" class="pan-arrow pan-prev" aria-label="Show earlier days">${ARROW("15 18 9 12 15 6")}</button>
      <span class="quest-range-label" aria-live="polite"></span>
      <button type="button" class="pan-arrow pan-next" aria-label="Show later days">${ARROW("9 18 15 12 9 6")}</button>`;
    const head = document.querySelector('.data-tab-panel[data-panel="questionnaire"] .quest-panel-head');
    if (head) head.appendChild(questNav);
    else questList.before(questNav);
    questNav.querySelector(".pan-prev").addEventListener("click", () => panQuest(questView.offset + questView.size));
    questNav.querySelector(".pan-next").addEventListener("click", () => panQuest(questView.offset - questView.size));
    attachDrag(questList, questView, panQuest, () => questList.clientWidth);
    renderQuestionnaire();
  }

  /* ---------- Week / 30 days / 90 days filter in the Health Data subtab row ---------- */
  const subRow = document.querySelector('.data-tab-panel[data-panel="health-data"] .subtab-row');
  if (subRow) {
    const actions = document.createElement("div");
    actions.className = "hd-subtab-actions";
    actions.innerHTML = `
      <div class="hd-range-filter" role="group" aria-label="Date range">
        <button type="button" data-size="7" aria-pressed="false">Week</button>
        <button type="button" data-size="30" aria-pressed="true" class="active">30 days</button>
        <button type="button" data-size="90" aria-pressed="false">90 days</button>
      </div>`;
    const addBtn = subRow.querySelector("#openAddMeasurementBtn");
    subRow.appendChild(actions);
    if (addBtn) actions.appendChild(addBtn);

    actions.querySelectorAll(".hd-range-filter button").forEach((btn) => {
      btn.addEventListener("click", () => {
        actions.querySelectorAll(".hd-range-filter button").forEach((b) => {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });
        hdView.size = Number(btn.dataset.size);
        hdView.offset = clampOffset(hdView, hdView.offset);
        renderHealth();
      });
    });
  }

  /* The page's global Week/Month toggle no longer applies to Health Data */
  const globalToggle = document.querySelector(".range-toggle");
  const healthTab = document.querySelector('.data-tab[data-tab="health-data"]');
  function syncGlobalToggle() {
    if (globalToggle && healthTab?.classList.contains("open")) globalToggle.style.display = "none";
  }
  document.querySelectorAll(".data-tab").forEach((t) => t.addEventListener("click", () => {
    syncGlobalToggle();
    queueArrowLayout();
  }));
  document.querySelectorAll(".subtab").forEach((t) => t.addEventListener("click", queueArrowLayout));
  syncGlobalToggle();

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      buildRecordings();
      renderHealth();
    }, 150);
  });

  buildRecordings();
  renderHealth();
})();
