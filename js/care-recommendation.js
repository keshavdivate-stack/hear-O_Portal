/* ---------------- Care Recommendation — full-screen page ---------------- */

/* Per-patient form customization: patient-data.html forwards this flag for
   the one patient whose Care Recommendation form should skip Medication
   Details entirely. Fields inside are un-required so the rest of the form
   can still be submitted without them. */
(() => {
  if (new URLSearchParams(window.location.search).get("hideMedDetails") !== "1") return;
  const section = document.getElementById("medicationDetailsSection");
  if (!section) return;
  section.style.display = "none";
  section.querySelectorAll("[required]").forEach((el) => el.removeAttribute("required"));
})();

const CARE_REC_STATUS = {
  recommended: { label: "Recommended", cls: "rec-status-recommended" },
  "in-progress": { label: "In Progress", cls: "rec-status-progress" },
  completed: { label: "Completed", cls: "rec-status-completed" },
};

function timeLabel(d) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return { short: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} · ${h}:${m} ${ampm}`, full: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}` };
}

const medications = [
  { name: "Furosemide", dose: "40 mg" },
  { name: "Carvedilol", dose: "6.25 mg" },
  { name: "Spironolactone", dose: "25 mg" },
  { name: "Ibuprofen", dose: "200 mg" },
  { name: "Atorvastatin", dose: "20 mg" },
];

let careRecIdSeq = 4;
const careRecs = [
  {
    id: 1,
    title: "Increase Furosemide dose",
    medication: "Furosemide",
    currentDose: "40 mg",
    newDose: "60",
    frequency: "Once Daily",
    duration: "3",
    startDate: "2026-08-05",
    instructionsPatient: "Take with breakfast. Weigh yourself each morning and record it in the app.",
    instructionsCareTeam: "Titrate Furosemide up and monitor the patient for tolerability and any signs of dehydration or low blood pressure.",
    invitePatient: false,
    assignedCareTeam: ["Amanda Lee"],
    status: "in-progress",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "05 Aug 2026, 09:10 AM",
    updatedAt: "06 Aug 2026, 10:05 AM",
    pickedUpBy: "Amanda Lee, RN",
    actionTaken: "Contacted patient to confirm the new dose is tolerated; monitoring for dizziness and weight changes over the next few days.",
    completedBy: null,
    completedOn: null,
    adherenceValue: null,
    activity: [
      { who: "Dr. Sarah Mitchell", when: "05 Aug · 09:10 AM", text: "Created care recommendation." },
      { who: "Amanda Lee, RN", when: "05 Aug · 09:40 AM", text: "Picked up recommendation." },
      { who: "Amanda Lee, RN", when: "06 Aug · 10:05 AM", label: "Action taken: Patient contacted", short: "Patient contacted", note: "Confirmed new dose is tolerated so far; monitoring for dizziness and weight changes over the next few days." },
    ],
  },
  {
    id: 2,
    title: "Review Carvedilol titration",
    medication: "Carvedilol",
    currentDose: "6.25 mg",
    newDose: "12.5",
    frequency: "Twice Daily",
    duration: "14",
    startDate: "2026-08-08",
    instructionsPatient: "Take with food, morning and evening. Report any dizziness right away.",
    instructionsCareTeam: "Please review the patient's tolerance to the current Carvedilol dose and report any dizziness, fatigue, or low heart rate readings.",
    invitePatient: false,
    assignedCareTeam: ["Amanda Lee", "Ayelet Er"],
    status: "completed",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "08 Aug 2026, 11:00 AM",
    updatedAt: "08 Aug 2026, 02:15 PM",
    pickedUpBy: "Amanda Lee, RN",
    actionTaken: "Patient contacted — mild dizziness reported on standing, no other symptoms. Heart rate readings within range.",
    completedBy: "Amanda Lee, RN",
    completedOn: "08 Aug 2026, 02:15 PM",
    adherenceValue: null,
    activity: [
      { who: "Dr. Sarah Mitchell", when: "08 Aug · 11:00 AM", text: "Created care recommendation." },
      { who: "Amanda Lee, RN", when: "08 Aug · 11:20 AM", text: "Picked up recommendation." },
      { who: "Amanda Lee, RN", when: "08 Aug · 02:15 PM", label: "Action taken: Patient contacted", short: "Patient contacted", note: "Patient reports mild dizziness on standing; no other symptoms. Heart rate readings within range." },
      { who: "Amanda Lee, RN", when: "08 Aug · 02:15 PM", label: "Marked recommendation as Completed.", short: "Completed" },
    ],
  },
  {
    id: 3,
    title: "Review Furosemide adherence",
    medication: "Furosemide",
    currentDose: "40 mg",
    newDose: "40",
    frequency: "Once Daily",
    duration: "7",
    startDate: "2026-07-30",
    instructionsPatient: "Take every morning with breakfast. Set a daily reminder in the app.",
    instructionsCareTeam: "Review Furosemide adherence with the patient following two missed doses this week.",
    invitePatient: true,
    assignedCareTeam: ["Amanda Lee", "Sandy Kohl"],
    status: "recommended",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "18 Aug 2026, 09:00 AM",
    updatedAt: "18 Aug 2026, 09:00 AM",
    pickedUpBy: null,
    actionTaken: null,
    completedBy: null,
    completedOn: null,
    adherenceValue: "62% recording compliance (last 30 days)",
    activity: [{ who: "Dr. Sarah Mitchell", when: "18 Aug · 09:00 AM", text: "Created care recommendation." }],
  },
];

function newCareRec(fields, createdBy = "Dr. Sarah Mitchell") {
  const t = timeLabel(new Date());
  return {
    id: careRecIdSeq++,
    title: `${fields.medication} dose change`,
    medication: fields.medication,
    currentDose: fields.currentDose,
    newDose: fields.newDose,
    frequency: fields.frequency,
    duration: fields.duration,
    startDate: fields.startDate,
    instructionsPatient: fields.instructionsPatient,
    instructionsCareTeam: fields.instructionsCareTeam,
    invitePatient: fields.invitePatient,
    assignedCareTeam: fields.assignedCareTeam,
    status: "recommended",
    createdBy,
    createdAt: t.full,
    updatedAt: t.full,
    pickedUpBy: null,
    actionTaken: null,
    completedBy: null,
    completedOn: null,
    adherenceValue: null,
    activity: [{ who: createdBy, when: t.short, text: "Created care recommendation." }],
  };
}

/* ---------------- Custom dropdowns (same pattern as Patient Data) ---------------- */
function setCustomSelectValue(select, value, { silent = false } = {}) {
  const hiddenInput = select.querySelector("input[type=hidden]");
  const trigger = select.querySelector(".custom-select-value");
  const option = select.querySelector(`.custom-select-option[data-value="${CSS.escape(value)}"]`);

  select.querySelectorAll(".custom-select-option").forEach((o) => o.classList.remove("selected"));

  if (option) {
    option.classList.add("selected");
    trigger.textContent = option.textContent.trim();
    trigger.classList.remove("placeholder");
  } else {
    trigger.textContent = trigger.dataset.placeholder || trigger.textContent;
    trigger.classList.add("placeholder");
  }

  hiddenInput.value = value || "";
  if (!silent) hiddenInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function positionCustomSelectMenu(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight, 220) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.width = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function wireCustomSelect(select) {
  const trigger = select.querySelector(".custom-select-trigger");
  const valueEl = select.querySelector(".custom-select-value");
  const hiddenInput = select.querySelector("input[type=hidden]");

  valueEl.dataset.placeholder = valueEl.textContent.trim();
  hiddenInput.dataset.default = hiddenInput.value;

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !select.classList.contains("open");
    document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
    if (willOpen) positionCustomSelectMenu(select);
    select.classList.toggle("open", willOpen);
  });

  select.addEventListener("click", (e) => {
    const option = e.target.closest(".custom-select-option");
    if (!option) return;
    setCustomSelectValue(select, option.dataset.value);
    select.classList.remove("open");
  });
}

function closeAllCustomSelects() {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
}

document.querySelectorAll(".custom-select").forEach(wireCustomSelect);
document.addEventListener("click", closeAllCustomSelects);
document.addEventListener("scroll", closeAllCustomSelects, true);
window.addEventListener("resize", closeAllCustomSelects);

function resetCustomSelectsIn(root) {
  root.querySelectorAll(".custom-select").forEach((select) => {
    const hiddenInput = select.querySelector("input[type=hidden]");
    setCustomSelectValue(select, hiddenInput.dataset.default || "", { silent: true });
  });
}

/* ---------------- Top-level tabs: Summary / Create New ---------------- */
document.getElementById("recTabs").addEventListener("click", (e) => {
  const btn = e.target.closest(".rec-tab");
  if (!btn) return;
  const target = btn.dataset.recTab;
  document.querySelectorAll(".rec-tab").forEach((t) => t.classList.toggle("active", t === btn));
  document.querySelectorAll(".rec-tab-panel").forEach((p) => p.classList.toggle("open", p.dataset.recPanel === target));
});

/* ---------------- Summary tab: Recent Care Recommendations ---------------- */
let careRecFilter = "all";

function careRecMatchesFilter(rec) {
  if (careRecFilter === "all") return true;
  return rec.status === careRecFilter;
}

function renderSummaryList() {
  const list = careRecs
    .filter(careRecMatchesFilter)
    .slice()
    .sort((a, b) => b.id - a.id);

  document.getElementById("recSummaryList").innerHTML = list.length
    ? list
        .map((rec) => {
          const meta = CARE_REC_STATUS[rec.status];
          const completedMeta =
            rec.status === "completed"
              ? `
              <div>
                <div class="rec-summary-meta-label">Completed By</div>
                <div class="rec-summary-meta-value">${rec.completedBy || "—"}</div>
              </div>
              <div>
                <div class="rec-summary-meta-label">Completed On</div>
                <div class="rec-summary-meta-value">${rec.completedOn || "—"}</div>
              </div>`
              : "";

          return `
          <div class="rec-summary-card">
            <div class="rec-summary-head">
              <div>
                <div class="rec-summary-title">${rec.title}</div>
                <div class="rec-summary-sub-row">
                  <span class="rec-summary-sub">${rec.medication}</span>
                  ${rec.adherenceValue ? `<span class="rec-adherence-chip">${rec.adherenceValue}</span>` : ""}
                </div>
              </div>
              <span class="rec-status-chip ${meta.cls}">${meta.label}</span>
            </div>
            <div class="rec-summary-meta">
              <div>
                <div class="rec-summary-meta-label">Dose Change</div>
                <div class="rec-summary-meta-value">${rec.currentDose ? `${rec.currentDose} → ${rec.newDose} mg` : `${rec.newDose} mg`}</div>
              </div>
              <div>
                <div class="rec-summary-meta-label">Frequency</div>
                <div class="rec-summary-meta-value">${rec.frequency || "—"}</div>
              </div>
              <div>
                <div class="rec-summary-meta-label">Start Date</div>
                <div class="rec-summary-meta-value">${rec.startDate || "—"}</div>
              </div>
              <div>
                <div class="rec-summary-meta-label">Duration</div>
                <div class="rec-summary-meta-value">${rec.duration ? `${rec.duration} days` : "—"}</div>
              </div>
              <div>
                <div class="rec-summary-meta-label">Action Owner</div>
                <div class="rec-summary-meta-value${rec.pickedUpBy ? "" : " rec-summary-meta-muted"}">${rec.pickedUpBy || "Unassigned"}</div>
              </div>
              ${completedMeta}
            </div>
            ${rec.actionTaken ? `
            <div class="rec-action-taken">
              <div class="rec-action-taken-label">Action Taken</div>
              <div class="rec-action-taken-text">${rec.actionTaken}</div>
            </div>` : ""}
            <div class="rec-summary-foot">
              <span class="rec-summary-foot-meta">Created by ${rec.createdBy} · ${rec.createdAt}</span>
              <button type="button" class="btn-open rec-view-btn" data-rec-id="${rec.id}">View details</button>
            </div>
          </div>`;
        })
        .join("")
    : `<div class="rec-empty">No care recommendations in this view.</div>`;
}

document.getElementById("recSummaryList").addEventListener("click", (e) => {
  const btn = e.target.closest(".rec-view-btn");
  if (!btn) return;
  openRecDrawer(Number(btn.dataset.recId));
});

document.getElementById("careRecStatusFilter").addEventListener("change", (e) => {
  careRecFilter = e.target.value;
  renderSummaryList();
});

/* ---------------- Care Recommendation detail modal ---------------- */
function renderRecTimeline(rec) {
  return rec.activity
    .map(
      (a) => `
      <div class="rec-timeline-item">
        <div class="rec-timeline-dot"></div>
        <div class="rec-timeline-content">
          <div class="rec-timeline-when">${a.when}</div>
          <div class="rec-timeline-who">${a.who}</div>
          <div class="rec-timeline-text${a.label ? " rec-timeline-label" : ""}">${a.label || a.text || ""}</div>
          ${a.note ? `<div class="rec-timeline-note">${a.note}</div>` : ""}
        </div>
      </div>`
    )
    .join("");
}

function openRecDrawer(id) {
  const rec = careRecs.find((r) => r.id === id);
  if (!rec) return;
  const meta = CARE_REC_STATUS[rec.status];

  document.getElementById("recDrawerTitle").textContent = rec.title;
  const statusEl = document.getElementById("recDrawerStatus");
  statusEl.textContent = meta.label;
  statusEl.className = `rec-status-chip ${meta.cls}`;

  document.getElementById("recDrawerMedication").textContent = rec.medication || "—";
  document.getElementById("recDrawerDoseChange").textContent = rec.currentDose ? `${rec.currentDose} → ${rec.newDose} mg` : `${rec.newDose} mg`;
  document.getElementById("recDrawerFrequency").textContent = rec.frequency || "—";
  document.getElementById("recDrawerDuration").textContent = rec.duration ? `${rec.duration} days` : "—";
  document.getElementById("recDrawerStartDate").textContent = rec.startDate || "—";
  document.getElementById("recDrawerInvite").textContent = rec.invitePatient ? "Yes" : "No";
  document.getElementById("recDrawerCareTeam").textContent = rec.assignedCareTeam && rec.assignedCareTeam.length ? rec.assignedCareTeam.join(", ") : "—";

  document.getElementById("recDrawerInstructionPatient").textContent = rec.instructionsPatient || "—";
  document.getElementById("recDrawerInstructionCareTeam").textContent = rec.instructionsCareTeam || "—";

  document.getElementById("recDrawerCreatedBy").textContent = rec.createdBy;
  document.getElementById("recDrawerCreatedAt").textContent = rec.createdAt;
  document.getElementById("recDrawerPickedUp").textContent = rec.pickedUpBy || "Not yet picked up";

  document.getElementById("recDrawerTimeline").innerHTML = renderRecTimeline(rec);
  document.getElementById("recDrawerFooter").innerHTML = "";

  document.getElementById("recDrawerOverlay").classList.add("open");
}

function closeRecDrawer() {
  document.getElementById("recDrawerOverlay").classList.remove("open");
}

document.getElementById("closeRecDrawer").addEventListener("click", closeRecDrawer);
document.getElementById("recDrawerOverlay").addEventListener("click", (e) => {
  if (e.target.id === "recDrawerOverlay") closeRecDrawer();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeRecDrawer();
});

/* ---------------- Create New tab ---------------- */
const careRecMedicationMenu = document.getElementById("careRecMedicationMenu");
careRecMedicationMenu.innerHTML = medications
  .map(
    (m) => `
    <div class="custom-select-option" data-value="${m.name}">${m.name}<svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
  )
  .join("");

document.getElementById("careRecMedicationSelect").addEventListener("change", (e) => {
  const med = medications.find((m) => m.name === e.target.value);
  document.getElementById("careRecCurrentDose").value = med ? med.dose : "—";
});

/* ---------------- Care Team multiselect ---------------- */
const careRecCareTeamField = document.getElementById("careRecCareTeamField");
const careRecCareTeamTrigger = careRecCareTeamField.querySelector(".care-team-trigger");
const careRecCareTeamValueEl = careRecCareTeamField.querySelector(".care-team-trigger-value");
const careRecCareTeamMenu = careRecCareTeamField.querySelector(".care-team-menu");
const careRecCareTeamHidden = careRecCareTeamField.querySelector('input[name="careTeam"]');
const careRecCareTeamPlaceholder = "Select care team";

careRecCareTeamTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !careRecCareTeamField.classList.contains("open");
  document.querySelectorAll(".checkbox-filter.open, .care-team-field.open").forEach((el) => el.classList.remove("open"));
  careRecCareTeamField.classList.toggle("open", willOpen);
});
careRecCareTeamMenu.addEventListener("click", (e) => e.stopPropagation());
document.addEventListener("click", () => careRecCareTeamField.classList.remove("open"));

function syncCareRecCareTeam() {
  const selected = Array.from(careRecCareTeamMenu.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
  careRecCareTeamHidden.value = selected.join(", ");
  careRecCareTeamValueEl.textContent = selected.length ? `${selected.length} selected` : careRecCareTeamPlaceholder;
  careRecCareTeamValueEl.classList.toggle("placeholder", !selected.length);
}
careRecCareTeamMenu.addEventListener("change", syncCareRecCareTeam);
syncCareRecCareTeam();

/* ---------------- Create form submit ---------------- */
const careRecCreateForm = document.getElementById("careRecCreateForm");

careRecCreateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(careRecCreateForm);

  careRecs.unshift(
    newCareRec({
      medication: fd.get("medication"),
      currentDose: document.getElementById("careRecCurrentDose").value,
      newDose: fd.get("newDose"),
      frequency: fd.get("frequency"),
      duration: fd.get("duration"),
      startDate: fd.get("startDate"),
      instructionsPatient: fd.get("instructionsPatient"),
      instructionsCareTeam: fd.get("instructionsCareTeam"),
      invitePatient: fd.get("invitePatient") === "on",
      assignedCareTeam: (fd.get("careTeam") || "").split(", ").filter(Boolean),
    })
  );

  careRecCreateForm.reset();
  resetCustomSelectsIn(careRecCreateForm);
  document.getElementById("careRecCurrentDose").value = "—";
  syncCareRecCareTeam();

  renderSummaryList();

  document.querySelector('.rec-tab[data-rec-tab="summary"]').click();
});

document.getElementById("cancelCareRecCreate").addEventListener("click", () => {
  window.location.href = "patient-data.html";
});

renderSummaryList();
