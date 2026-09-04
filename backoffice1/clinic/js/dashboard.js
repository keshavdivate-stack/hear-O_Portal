/* ---------------- B01 Clinic Portal: Dashboard ---------------- */
document.getElementById("clinicOrgLabel").textContent = new URLSearchParams(location.search).get("org") || "B01";
document.getElementById("clinicHeaderDate").textContent = clinicFmtHeaderDate(new Date());

const priorityCount = clinicPatientsByStatus("Priority").length;
const activeCount = clinicPatientsByStatus("Active").length;
const monitoredTotal = priorityCount + activeCount;

document.getElementById("monitoredTotal").textContent = monitoredTotal;

/* Donut: Priority (red) then Active (green), drawn as two arcs around the
   base gray ring already in the markup. */
(function renderMonitoredDonut() {
  const svg = document.getElementById("monitoredDonut");
  const r = 50;
  const circumference = 2 * Math.PI * r;
  const priorityLen = (priorityCount / monitoredTotal) * circumference;
  const activeLen = (activeCount / monitoredTotal) * circumference;

  svg.insertAdjacentHTML(
    "beforeend",
    `
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#F16C6C" stroke-width="14"
      stroke-dasharray="${priorityLen} ${circumference}" stroke-dashoffset="0" transform="rotate(-90 60 60)" stroke-linecap="butt"/>
    <circle cx="60" cy="60" r="${r}" fill="none" stroke="#3FBE84" stroke-width="14"
      stroke-dasharray="${activeLen} ${circumference}" stroke-dashoffset="-${priorityLen}" transform="rotate(-90 60 60)" stroke-linecap="butt"/>
    <text x="60" y="66" text-anchor="middle" class="donut-num">${monitoredTotal}</text>
  `
  );
})();

/* Priority list: the most recently flagged patients first. */
const dashPriorityPatients = clinicPatientsByStatus("Priority")
  .slice()
  .sort((a, b) => b.statusSince - a.statusSince)
  .slice(0, 10);

document.getElementById("dashPriorityRows").innerHTML = dashPriorityPatients
  .map((p) => `<tr><td>${p.id}</td><td class="p-since">${clinicFmtDMY2(p.statusSince)}</td></tr>`)
  .join("");
