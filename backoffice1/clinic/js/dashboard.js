/* ---------------- B01 Clinic Portal: Dashboard ---------------- */
document.getElementById("clinicOrgLabel").textContent = new URLSearchParams(location.search).get("org") || "B01";

/* "Monitored" = patients actively being tracked through the program:
   Priority, Active, Baseline and On Hold (excludes Registered, which hasn't
   started, and Discontinued/Insufficient Data, which are no longer tracked). */
const priorityCount = clinicPatientsByStatus("Priority").length;
const activeCount = clinicPatientsByStatus("Active").length;
const baselineCount = clinicPatientsByStatus("Baseline").length;
const onHoldCount = clinicPatientsByStatus("On Hold").length;
const monitoredTotal = priorityCount + activeCount + baselineCount + onHoldCount;

document.getElementById("monitoredTotal").textContent = monitoredTotal;
document.getElementById("statPriorityCount").textContent = priorityCount;
document.getElementById("statActiveCount").textContent = activeCount;
document.getElementById("statBaselineCount").textContent = baselineCount;
document.getElementById("statOnHoldCount").textContent = onHoldCount;

/* Donut: Priority (red), Active (green), Baseline (blue), On Hold (near-black),
   drawn as four arcs around the base gray ring already in the markup -- same
   multi-status donut pattern as the main clinic portal's Welcome card. */
(function renderMonitoredDonut() {
  const svg = document.getElementById("monitoredDonut");
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { count: priorityCount, color: "#F16C6C" },
    { count: activeCount, color: "#3FBE84" },
    { count: baselineCount, color: "#2AA9E0" },
    { count: onHoldCount, color: "#23272E" },
  ];

  let offset = 0;
  const arcs = segments
    .map((seg) => {
      const len = (seg.count / monitoredTotal) * circumference;
      const circle = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${seg.color}" stroke-width="14"
        stroke-dasharray="${len} ${circumference}" stroke-dashoffset="-${offset}" transform="rotate(-90 60 60)" stroke-linecap="butt"/>`;
      offset += len;
      return circle;
    })
    .join("");

  svg.insertAdjacentHTML(
    "beforeend",
    `${arcs}<text x="60" y="56" text-anchor="middle" class="donut-num">${monitoredTotal}</text>
    <text x="60" y="72" text-anchor="middle" class="donut-label">Total Patients</text>`
  );
})();

/* Priority list: the most recently flagged patients first. Each row carries
   data-status so the left accent + Status chip pick up the same color as the
   donut/pills above (all "Priority" today; the styling reads any status). */
const dashPriorityPatients = clinicPatientsByStatus("Priority")
  .slice()
  .sort((a, b) => b.statusSince - a.statusSince)
  .slice(0, 10);

document.getElementById("dashPriorityRows").innerHTML = dashPriorityPatients
  .map(
    (p) => `
    <tr data-status="${p.status}">
      <td>${p.id}</td>
      <td class="p-since">${clinicFmtDMY2(p.statusSince)}</td>
      <td class="b01-td-status">${clinicStatusBadgeHtml(p.status)}</td>
    </tr>`
  )
  .join("");
