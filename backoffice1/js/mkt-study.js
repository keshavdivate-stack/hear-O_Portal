/* ---------------- Base data (baseline = "All Organizations") ---------------- */
const ringSegmentsBase = [
  { label: "Recorded", value: 21, color: "#1F3C73" },
  { label: "Did not upload", value: 11, color: "#F2994A" },
  { label: "Left study", value: 231, color: "#7FD3EE" },
];

const screenedMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const screenedSeriesBase = [252, 253, 253, 262, 263, 263];

const mktBinDataBase = {
  usable: [
    { label: "90%-100%", val: 32 },
    { label: "80%-89%", val: 24 },
    { label: "70%-79%", val: 18 },
    { label: "60%-69%", val: 9 },
  ],
  compliance: [
    { label: "90%-100%", val: 28 },
    { label: "80%-89%", val: 21 },
    { label: "70%-79%", val: 15 },
    { label: "60%-69%", val: 12 },
  ],
};

const mktStudyHeadBase = { sites: 5, avgDays: 42, needAttention: 11 };

let screenedSeries = screenedSeriesBase;
let mktBinData = mktBinDataBase;
let activeMktBinsTab = "usable";

/* ---------------- Ring gauge (Recorded / Did not upload / Left study) ----------------
   Each selected organization gets its own hero card + ring, built from its own
   seeded data, so picking multiple orgs shows their charts side by side rather
   than blending them into a single average. */
function heroCardHtml(title, ring) {
  const total = ring.reduce((s, seg) => s + seg.value, 0);
  let acc = 0;
  const stops = ring
    .map((seg) => {
      const from = (acc / total) * 360;
      acc += seg.value;
      const to = (acc / total) * 360;
      return `${seg.color} ${from}deg ${to}deg`;
    })
    .join(", ");
  const breakdown = ring
    .map((seg) => {
      const pct = total ? Math.round((seg.value / total) * 100) : 0;
      return `
        <div class="mkt-rb-row">
          <span class="mkt-rb-dot" style="background:${seg.color};"></span>
          <span class="mkt-rb-label">${seg.label}</span>
          <span class="mkt-rb-num">${seg.value}</span>
          <span class="mkt-rb-pct">${pct}%</span>
        </div>`;
    })
    .join("");
  const topTick = Math.max(...ring.map((seg) => seg.value));

  return `
    <section class="bo-card mkt-hero-card">
      <div class="mkt-hero">
        <div class="mkt-hero-label">
          <h2>${title}</h2>
          <div class="mkt-compliance">
            <p class="mkt-compliance-title">Compliance</p>
            <div class="mkt-compliance-row">
              <span class="mkt-compliance-val">0%</span>
              <span class="mkt-compliance-none">None</span>
            </div>
            <div class="mkt-compliance-tabs">
              <span class="active">To Date</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        <div class="mkt-gauge-wrap">
          <span class="mkt-tick mkt-tick-top">${topTick}</span>
          <div class="mkt-ring" style="background:conic-gradient(${stops})"></div>
          <div class="mkt-gauge-center"><span>${total}</span><b>/0</b></div>
          <span class="mkt-tick mkt-tick-bottom">1</span>
        </div>

        <div class="mkt-ring-breakdown">${breakdown}</div>
      </div>
    </section>`;
}

function ringFor(seed) {
  return ringSegmentsBase.map((seg, i) => ({ ...seg, value: mktScale(seg.value, seed + i, 0.4) }));
}

function renderHeroCards(orgIds) {
  const isAll = orgIds.length === 1 && orgIds[0] === "all";
  const orgs = isAll ? [MKT_ORG_LIST[0]] : orgIds.map((id) => MKT_ORG_LIST.find((o) => o.id === id));
  const multi = orgs.length > 1;

  document.getElementById("mktHeroRow").classList.toggle("mkt-hero-row--multi", multi);
  document.getElementById("mktHeroCards").innerHTML = orgs
    .map((org) => heroCardHtml(org.name, ringFor(org.id === "all" ? 0 : mktHash(org.id))))
    .join("");
}

function scopeLabel(orgIds) {
  if (orgIds.length === 1 && orgIds[0] === "all") return "";
  return mktOrgsLabel(orgIds);
}

/* ---------------- Screened Over Time chart ---------------- */
function renderScreenedChart() {
  const container = document.getElementById("screenedChart");
  const width = container.clientWidth || 320;
  const height = container.clientHeight || 200;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 20;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  const yMin = Math.min(...screenedSeries) - 2;
  const yMax = Math.max(...screenedSeries) + 2;

  const xAt = (i) => padL + (plotW * i) / (screenedSeries.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  const step = Math.max(2, Math.ceil((yMax - yMin) / 4 / 2) * 2);
  for (let v = Math.ceil(yMin / step) * step; v <= yMax; v += step) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#9AA5B1">${v}</text>`
    );
  }

  const xLabels = screenedMonths
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 4}" text-anchor="middle" font-size="10" fill="#9AA5B1">${m}</text>`)
    .join("");

  const line = screenedSeries.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      <path d="M ${xAt(0)},${yAt(screenedSeries[0])} L ${line}" fill="none" stroke="var(--cyan)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      ${xLabels}
    </svg>`;
}
window.addEventListener("resize", renderScreenedChart);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderScreenedChart);

/* ---------------- Compliance bins ---------------- */
function renderMktBins(tab) {
  activeMktBinsTab = tab;
  document.getElementById("mktBinsList").innerHTML = mktBinData[tab]
    .map(
      (b, i) => `
      <div class="mkt-bin-row">
        <span class="mkt-bin-val">${b.val}</span>
        <div class="bo-bin-bar-track mkt-bin-track"><div class="bo-bin-bar-fill" style="width:${b.val}%; background:${i === 3 ? "var(--red)" : "var(--gray-border)"};"></div></div>
        <span class="mkt-bin-label">${b.label}</span>
      </div>`
    )
    .join("");
}

document.getElementById("mktBinsTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.getElementById("mktBinsTabs").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderMktBins(btn.dataset.tab);
});

/* ---------------- Wire everything to the organization selector ---------------- */
function renderForOrg(orgIds) {
  const isAll = orgIds.length === 1 && orgIds[0] === "all";
  const seed = isAll ? 0 : mktHash(orgIds.slice().sort().join(","));

  const scope = scopeLabel(orgIds);
  document.getElementById("mktStudyScope").textContent = scope ? ` — ${scope}` : "";

  renderHeroCards(orgIds);

  screenedSeries = screenedSeriesBase.map((v, i) => mktScale(v, seed + i, 0.2));
  renderScreenedChart();

  mktBinData = {
    usable: mktBinDataBase.usable.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i, 0.4)) })),
    compliance: mktBinDataBase.compliance.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i + 4, 0.4)) })),
  };
  renderMktBins(activeMktBinsTab);

  document.getElementById("mktSitesEnrolled").textContent = isAll ? mktStudyHeadBase.sites : orgIds.length;
  document.getElementById("mktAvgDays").textContent = mktScale(mktStudyHeadBase.avgDays, seed + 2, 0.3);
  document.getElementById("mktNeedAttention").textContent = mktScale(mktStudyHeadBase.needAttention, seed + 5, 0.5);
}

mktRenderOrgSelect("mktStudyOrgSelect", renderForOrg);
