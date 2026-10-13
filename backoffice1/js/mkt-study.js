/* ---------------- Base data (baseline = "All Organizations") ---------------- */
const RING_SEGMENTS = [
  { key: "recorded", label: "Recorded", color: "var(--navy)" },
  { key: "didNotUpload", label: "Did not upload", color: "var(--orange)" },
  { key: "leftStudy", label: "Left study", color: "var(--blue)" },
];

const screenedMonths = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const screenedSeriesBase = [1002, 1006, 1030, 1044, 1062, 1118];

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

/* ---------------- Organization cards (Recorded / Did not upload / Left study) ----------------
   One card per organization -- every org of the selected type under "All
   Organizations", otherwise just the picked ones -- showing only what the
   developed Screening page shows: the org, an enrolled/target ring, To Date
   and Today compliance, and the three patient counts. */
const MKT_TARGETS = [40, 50, 50, 100, 150, 200];

/* No real per-org numbers exist yet, so each org's figures are seeded off
   its id -- stable across renders, different between orgs. */
function mktOrgCardData(org) {
  const h = mktHash(org.id);
  const target = MKT_TARGETS[h % MKT_TARGETS.length];
  const enrolled = Math.round(target * (0.3 + ((h >>> 3) % 90) / 100));
  const recorded = (h >>> 5) % 3;
  const didNotUpload = Math.min(enrolled - recorded, Math.round(enrolled * (((h >>> 7) % 60) / 100)));
  const leftStudy = Math.max(0, enrolled - recorded - didNotUpload);
  const toDate = enrolled ? 35 + ((h >>> 9) % 55) : 0;
  const today = recorded || didNotUpload ? Math.round((recorded / enrolled) * 100) : null;
  return { target, enrolled, toDate, today, counts: { recorded, didNotUpload, leftStudy } };
}

function orgCardHtml(org) {
  const d = mktOrgCardData(org);
  const total = RING_SEGMENTS.reduce((s, seg) => s + d.counts[seg.key], 0);
  let acc = 0;
  const ringBg = total
    ? `conic-gradient(${RING_SEGMENTS.map((seg) => {
        const from = (acc / total) * 360;
        acc += d.counts[seg.key];
        return `${seg.color} ${from}deg ${(acc / total) * 360}deg`;
      }).join(", ")})`
    : "var(--gray-border)";
  const pctOf = (n) => (d.enrolled ? Math.round((n / d.enrolled) * 100) : 0);
  const legend = RING_SEGMENTS.map(
    (seg) => `
      <div class="mkt-oc-row">
        <span class="mkt-oc-dot" style="background:${seg.color};"></span>
        <span class="mkt-oc-label">${seg.label}</span>
        <span class="mkt-oc-num"><b>${d.counts[seg.key]}</b> (${pctOf(d.counts[seg.key])}%)</span>
      </div>`
  ).join("");
  const ring = RING_SEGMENTS.map((seg) => ({ label: seg.label, value: d.counts[seg.key] }));

  return `
    <section class="bo-card mkt-org-card">
      <h3 class="mkt-oc-title">${org.name}</h3>
      <div class="mkt-gauge-wrap" data-org-id="${org.id}" data-ring='${JSON.stringify(ring)}'>
        <div class="mkt-ring" style="background:${ringBg}"></div>
        <div class="mkt-gauge-center">${d.enrolled}/${d.target}</div>
      </div>
      <div class="mkt-oc-rates">
        <div><b>${d.toDate}%</b><span>To Date</span></div>
        <div><b>${d.today === null ? "&mdash;" : `${d.today}%`}</b><span>Today</span></div>
      </div>
      <div class="mkt-oc-legend">${legend}</div>
    </section>`;
}

let activeMktType = "Commercial";

function renderHeroCards(orgIds) {
  const isAll = orgIds.length === 1 && orgIds[0] === "all";
  const orgs = isAll
    ? MKT_ORG_LIST.filter((o) => o.id !== "all" && o.type === activeMktType)
    : orgIds.map((id) => MKT_ORG_LIST.find((o) => o.id === id));
  document.getElementById("mktHeroCards").innerHTML = orgs.map(orgCardHtml).join("");
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
  const padL = 38;
  const padR = 10;
  const padT = 10;
  const padB = 20;
  const plotW = width - padL - padR;
  const plotH = height - padT - padB;
  /* Area chart from 0 (like the developed page), topped at a round step above the peak. */
  const step = Math.max(2, Math.ceil(Math.max(...screenedSeries) / 6 / 100) * 100);
  const yMin = 0;
  const yMax = Math.ceil(Math.max(...screenedSeries) / step) * step || step;

  const xAt = (i) => padL + (plotW * i) / (screenedSeries.length - 1);
  const yAt = (v) => padT + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const gridLines = [];
  for (let v = yMin; v <= yMax; v += step) {
    const y = yAt(v);
    gridLines.push(
      `<line x1="${padL}" y1="${y}" x2="${width - padR}" y2="${y}" stroke="#EEF1F4" stroke-width="1"/>` +
        `<text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#9AA5B1">${v.toLocaleString("en-US")}</text>`
    );
  }

  const xLabels = screenedMonths
    .map((m, i) => `<text x="${xAt(i)}" y="${height - 4}" text-anchor="middle" font-size="10" fill="#9AA5B1">${m}</text>`)
    .join("");

  const line = screenedSeries.map((v, i) => `${xAt(i)},${yAt(v)}`).join(" L ");

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="bo-area-svg" preserveAspectRatio="none">
      ${gridLines.join("")}
      <path d="M ${xAt(0)},${yAt(yMin)} L ${line} L ${xAt(screenedSeries.length - 1)},${yAt(yMin)} Z" fill="var(--blue-light)"/>
      <path d="M ${xAt(0)},${yAt(screenedSeries[0])} L ${line}" fill="none" stroke="var(--blue)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
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
        <div class="bo-bin-bar-track mkt-bin-track"><div class="bo-bin-bar-fill" style="width:${b.val}%; background:${i === 3 ? "var(--maroon)" : "var(--gray-border)"};"></div></div>
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

  screenedSeries = screenedSeriesBase.map((v) => mktScale(v, seed, 0.2));
  renderScreenedChart();

  mktBinData = {
    quality: mktBinDataBase.quality.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i, 0.4)) })),
    compliance: mktBinDataBase.compliance.map((b, i) => ({ ...b, val: Math.min(100, mktScale(b.val, seed + i + 4, 0.4)) })),
  };
  renderMktBins(activeMktBinsTab);

  // These two counters are no longer on the page; skip them rather than throw,
  // since a throw here aborts the script before the Organization Type filter is drawn.
  const sitesEl = document.getElementById("mktSitesEnrolled");
  if (sitesEl) sitesEl.textContent = isAll ? mktStudyHeadBase.sites : orgIds.length;
  const attentionEl = document.getElementById("mktNeedAttention");
  if (attentionEl) attentionEl.textContent = mktScale(mktStudyHeadBase.needAttention, seed + 5, 0.5);
}

const mktStudyOrgSelectApi = mktRenderOrgSelect("mktStudyOrgSelect", renderForOrg);
mktRenderOrgTypeSelect("mktStudyTypeSelect", (type) => {
  activeMktType = type;
  mktStudyOrgSelectApi.setTypeFilter(type);
});
