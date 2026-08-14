/* ---------------- Resolve current patient from ?patient= ---------------- */
const phParams = new URLSearchParams(location.search);
const phPatientId = phParams.get("patient") || PATIENT_HEALTH_DEFAULT;
const ph = buildPatientHealthDetail(phPatientId);

document.title = `HearO Backoffice | ${ph.name}`;
document.getElementById("patientName").textContent = ph.name;
document.getElementById("patientSub").textContent = `${ph.id.toUpperCase()} · ${ph.orgName}`;
document.getElementById("patientAvatar").textContent = ph.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
document.getElementById("patientOrgLink").href = `org-health-dashboard.html?org=${ph.orgId}`;

const phSevLabel = { critical: "Critical", warning: "Warning", healthy: "Healthy" };
const phSevEl = document.getElementById("patientSeverity");
phSevEl.classList.add(ph.severity);
phSevEl.innerHTML = `<span class="dot"></span>${phSevLabel[ph.severity]}`;

/* ---------------- Device / status KPI row ---------------- */
const phStats = [
  { num: ph.device, label: "Device Model", color: "var(--navy)", icon: `<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 18h.01"/>` },
  { num: `${ph.battery}%`, label: "Battery", color: ph.battery < 30 ? "var(--red)" : "var(--green)", icon: `<rect x="2" y="7" width="18" height="10" rx="2"/><path d="M22 11v2"/><path d="M6 10v4"/>` },
  { num: ph.lastSync, label: "Last Sync", color: "var(--blue)", icon: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>` },
  { num: ph.issues.length, label: "Active Issues", color: "var(--red)", icon: `<path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.73 3h16.9a2 2 0 0 0 1.73-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>` },
];

document.getElementById("patientHealthGrid").innerHTML = phStats
  .map(
    (s) => `
    <div class="bo-health-card">
      <span class="bo-health-icon" style="background:${s.color};">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${s.icon}</svg>
      </span>
      <span>
        <span class="bo-health-num">${s.num}</span>
        <span class="bo-health-label">${s.label}</span>
      </span>
    </div>`
  )
  .join("");

/* ---------------- Recordings ---------------- */
document.getElementById("patientRecordingRows").innerHTML = ph.recordings
  .map(
    (r) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.time}</td>
      <td>${r.duration}</td>
      <td>${r.quality}</td>
      <td><span class="bo-severity-pill ${r.uploaded === "Failed" ? "critical" : "healthy"}">${r.uploaded}</span></td>
    </tr>`
  )
  .join("");

/* ---------------- Encounters ---------------- */
document.getElementById("patientEncounterRows").innerHTML = ph.encounters
  .map((e) => `<tr><td>${e.date}</td><td>${e.type}</td><td>${e.provider}</td><td>${e.notes}</td></tr>`)
  .join("");

/* ---------------- Readings ---------------- */
document.getElementById("patientReadingRows").innerHTML = ph.readings
  .map(
    (r) => `
    <tr>
      <td>${r.date}</td>
      <td>${r.metric}</td>
      <td>${r.value}</td>
      <td><span class="bo-severity-pill ${r.status === "Below Target" ? "warning" : "healthy"}">${r.status}</span></td>
    </tr>`
  )
  .join("");

/* ---------------- Issues ---------------- */
document.getElementById("patientIssueRows").innerHTML = ph.issues
  .map(
    (i) => `
    <tr>
      <td>${i.title}</td>
      <td><span class="bo-severity-pill ${i.severity}"><span class="dot"></span>${i.severity === "critical" ? "Critical" : "Warning"}</span></td>
      <td><span class="bo-severity-pill ${i.status === "Escalated" ? "escalated" : i.status === "Open" ? "critical" : "info"}">${i.status}</span></td>
      <td>${i.detected}</td>
    </tr>`
  )
  .join("");

/* ---------------- Tabs ---------------- */
document.querySelectorAll("#patientTabs .bo-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("#patientTabs .bo-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".bo-tab-panel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
  });
});
