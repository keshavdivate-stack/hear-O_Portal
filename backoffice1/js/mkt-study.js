/* ---------------- Base data (baseline = "All Organizations") ---------------- */
const ringSegmentsBase = [
  { label: "Recorded", value: 21, color: "#1F3C73" },
  { label: "Did not upload", value: 11, color: "#F2994A" },
  { label: "Left study", value: 231, color: "#7FD3EE" },
];

const screenedMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const screenedSeriesBase = [252, 253, 253, 262, 263, 263];

const mktBinDataBase = {
  quality: [
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

const mktStudyHeadBase = { sites: 5, needAttention: 11 };

let screenedSeries = screenedSeriesBase;
let mktBinData = mktBinDataBase;
let activeMktBinsTab = "quality";
let activeMktOrgIds = ["all"];

/* Order matches mktBinData[tab]'s array -- used to build the Usable
   Compliance drill-down link for whichever bar was clicked. */
const MKT_BIN_KEYS = ["90-100", "80-89", "70-79", "60-69"];

/* ---------------- Ring gauge (Recorded / Did not upload / Left study) ----------------
   Each selected organization gets its own hero card + ring, built from its own
   seeded data, so picking multiple orgs shows their charts side by side rather
   than blending them into a single average. */
function heroCardHtml(title, ring, compact, orgId) {
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
    <section class="bo-card mkt-hero-card${compact ? " mkt-hero-card--compact" : ""}">
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

        <div class="mkt-gauge-wrap" data-org-id="${orgId}" data-ring='${JSON.stringify(ring.map((s) => ({ label: s.label, value: s.value })))}' title="Click a segment to view patients">
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
    .map((org) => heroCardHtml(org.name, ringFor(org.id === "all" ? 0 : mktHash(org.id)), multi, org.id))
    .join("");
}

/* ---------------- Ring segment click -> drill-down to Study Patients ----------------
   Any colored part of the donut opens the patients list, pre-filtered to the
   tab matching the segment that was clicked (whole-ring clicks outside the
   colored band, e.g. the center total, are ignored). */
const RING_LABEL_TO_TAB = { Recorded: "uploaded", "Did not upload": "didnt-upload", "Left study": "left" };

document.getElementById("mktHeroCards").addEventListener("click", (e) => {
  const wrap = e.target.closest(".mkt-gauge-wrap");
  if (!wrap) return;

  const rect = wrap.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const outerR = rect.width / 2;
  const innerR = outerR - 22;
  if (dist < innerR || dist > outerR) return;

  const angle = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
  const ring = JSON.parse(wrap.dataset.ring);
  const total = ring.reduce((s, seg) => s + seg.value, 0);
  let acc = 0;
  const seg = ring.find((s) => {
    const from = (acc / total) * 360;
    acc += s.value;
    const to = (acc / total) * 360;
    return angle >= from && angle < to;
  });
  if (!seg) return;

  const tab = RING_LABEL_TO_TAB[seg.label] || "all";
  const params = new URLSearchParams();
  params.set("tab", tab);
  params.set("org", wrap.dataset.orgId === "all" ? activeMktOrgIds.join(",") : wrap.dataset.orgId);
  window.location.href = `study-patients.html?${params.toString()}`;
});

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
function mktUsableComplianceHref(tab, bucketKey) {
  const params = new URLSearchParams();
  params.set("metric", tab);
  params.set("bucket", bucketKey);
  params.set("org", activeMktOrgIds.join(","));
  return `usable-compliance.html?${params.toString()}`;
}

function renderMktBins(tab) {
  activeMktBinsTab = tab;
  document.getElementById("mktBinsList").innerHTML = mktBinData[tab]
    .map(
      (b, i) => `
      <a class="mkt-bin-row" href="${mktUsableComplianceHref(tab, MKT_BIN_KEYS[i])}">
        <span class="mkt-bin-val">${b.val}</span>
        <div class="bo-bin-bar-track mkt-bin-track"><div class="bo-bin-bar-fill" style="width:${b.val}%; background:${i === 3 ? "var(--red)" : "var(--gray-border)"};"></div></div>
        <span class="mkt-bin-label">${b.label}</span>
      </a>`
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
  activeMktOrgIds = orgIds;
  const isAll = orgIds.length === 1 && orgIds[0] === "all";
  const seed = isAll ? 0 : mktHash(orgIds.slice().sort().join(","));

  const scope = scopeLabel(orgIds);
  document.getElementById("mktStudyScope").textContent = scope ? ` — ${scope}` : "";

  renderHeroCards(orgIds);

  screenedSeries = screenedSeriesBase.map((v, i) => mktScale(v, seed + i, 0.2));
  renderScreenedChart();

  mktBinData = {
    quality: mktBinDataBase.quality.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i, 0.4)) })),
    compliance: mktBinDataBase.compliance.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i + 4, 0.4)) })),
  };
  renderMktBins(activeMktBinsTab);

  document.getElementById("mktSitesEnrolled").textContent = isAll ? mktStudyHeadBase.sites : orgIds.length;
  document.getElementById("mktNeedAttention").textContent = mktScale(mktStudyHeadBase.needAttention, seed + 5, 0.5);
}

mktRenderOrgSelect("mktStudyOrgSelect", renderForOrg);
