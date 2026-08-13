/* ---------------- Page date ---------------- */
document.getElementById("mktDate").textContent = "13 Aug, 2026";

/* ---------------- Ring gauge (Recorded / Did not upload / Left study) ---------------- */
const ringSegments = [
  { label: "Recorded", value: 21, color: "#1F3C73" },
  { label: "Did not upload", value: 11, color: "#F2994A" },
  { label: "Left study", value: 231, color: "#7FD3EE" },
];

function renderRing() {
  const total = ringSegments.reduce((s, seg) => s + seg.value, 0);
  let acc = 0;
  const stops = ringSegments
    .map((seg) => {
      const from = (acc / total) * 360;
      acc += seg.value;
      const to = (acc / total) * 360;
      return `${seg.color} ${from}deg ${to}deg`;
    })
    .join(", ");
  document.getElementById("mktRing").style.background = `conic-gradient(${stops})`;
}
renderRing();

function renderRingBreakdown() {
  const total = ringSegments.reduce((s, seg) => s + seg.value, 0);
  document.getElementById("mktRingBreakdown").innerHTML = ringSegments
    .map((seg) => {
      const pct = Math.round((seg.value / total) * 100);
      return `
        <div class="mkt-rb-row">
          <span class="mkt-rb-dot" style="background:${seg.color};"></span>
          <span class="mkt-rb-label">${seg.label}</span>
          <span class="mkt-rb-num">${seg.value}</span>
          <span class="mkt-rb-pct">${pct}%</span>
        </div>`;
    })
    .join("");
}
renderRingBreakdown();

/* ---------------- Screened Over Time chart ---------------- */
const screenedMonths = ["Mar", "Apr", "May", "Jun", "Jul", "Aug"];
const screenedSeries = [252, 253, 253, 262, 263, 263];

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
  const step = Math.ceil((yMax - yMin) / 4 / 2) * 2;
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
renderScreenedChart();
window.addEventListener("resize", renderScreenedChart);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(renderScreenedChart);

/* ---------------- Compliance bins ---------------- */
const mktBinData = {
  usable: [
    { label: "90%-100%", val: 0 },
    { label: "80%-89%", val: 0 },
    { label: "70%-79%", val: 0 },
    { label: "60%-69%", val: 0 },
  ],
  compliance: [
    { label: "90%-100%", val: 0 },
    { label: "80%-89%", val: 0 },
    { label: "70%-79%", val: 0 },
    { label: "60%-69%", val: 0 },
  ],
};

function renderMktBins(tab) {
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
renderMktBins("usable");

document.getElementById("mktBinsTabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  document.getElementById("mktBinsTabs").querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  renderMktBins(btn.dataset.tab);
});
