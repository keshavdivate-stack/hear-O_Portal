/* ---------------- Nurse View: Care Recommendations ----------------
   Standalone page — not linked from the main portal shell. Uses its own
   local data (not synced with patient-data.js) since this prototype has
   no shared backend/state layer; every page in the app keeps its own
   demo data the same way. */

const CARE_REC_STATUS = {
  recommended: { label: "Recommended", cls: "rec-status-recommended" },
  "in-progress": { label: "In Progress", cls: "rec-status-progress" },
  completed: { label: "Completed", cls: "rec-status-completed" },
  archived: { label: "Archived", cls: "rec-status-archived" },
};

function timeLabel(d) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const m = String(d.getMinutes()).padStart(2, "0");
  return {
    short: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} · ${h}:${m} ${ampm}`,
    full: `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}`,
  };
}

const careRecs = [
  {
    id: 1,
    title: "Furosemide dose change",
    medication: "Furosemide",
    currentDose: "40 mg",
    newDose: "60",
    frequency: "Once Daily",
    duration: "3",
    startDate: "2026-08-19",
    instructionsPatient: "Take with breakfast. Weigh yourself each morning and record it in the app.",
    instructionsCareTeam: "Patient shows a 2.1 kg weight gain over 3 days. Please increase Furosemide and monitor daily weight closely.",
    invitePatient: false,
    status: "recommended",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "19 Aug 2026, 09:05 AM",
    updatedAt: "19 Aug 2026, 09:05 AM",
    pickedUpBy: null,
    activity: [{ who: "Dr. Sarah Mitchell", when: "19 Aug · 09:05 AM", text: "Created care recommendation." }],
  },
  {
    id: 2,
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
    status: "completed",
    createdBy: "Dr. Sarah Mitchell",
    createdAt: "07 Aug 2026, 09:00 AM",
    updatedAt: "07 Aug 2026, 04:10 PM",
    pickedUpBy: "Amanda Lee, RN",
    activity: [
      { who: "Dr. Sarah Mitchell", when: "07 Aug · 09:00 AM", text: "Created care recommendation." },
      { who: "Amanda Lee, RN", when: "07 Aug · 09:40 AM", text: "Picked up recommendation." },
      { who: "Amanda Lee, RN", when: "07 Aug · 11:15 AM", label: "Action taken: Patient contacted", short: "Patient contacted", note: "Patient confirmed the missed doses; reported confusion about the evening dose schedule." },
      { who: "Amanda Lee, RN", when: "07 Aug · 04:10 PM", label: "Marked recommendation as Completed.", short: "Completed" },
    ],
  },
];

/* ---------------- Custom select (same pattern as the rest of the app) ---------------- */
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

document.addEventListener("click", () => {
  document.querySelectorAll(".custom-select.open").forEach((s) => s.classList.remove("open"));
});

/* ---------------- Render ---------------- */
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

const template = document.getElementById("nurseRecTemplate");
const listEl = document.getElementById("nurseRecList");

function renderRecList() {
  listEl.innerHTML = "";
  careRecs.forEach((rec) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.recId = rec.id;

    const meta = CARE_REC_STATUS[rec.status];
    node.querySelector('[data-field="title"]').textContent = rec.title;
    const statusEl = node.querySelector('[data-field="status"]');
    statusEl.textContent = meta.label;
    statusEl.classList.add(meta.cls);

    node.querySelector('[data-field="medication"]').textContent = rec.medication || "—";
    node.querySelector('[data-field="doseChange"]').textContent = rec.currentDose ? `${rec.currentDose} → ${rec.newDose} mg` : `${rec.newDose} mg`;
    node.querySelector('[data-field="frequency"]').textContent = rec.frequency || "—";
    node.querySelector('[data-field="duration"]').textContent = rec.duration ? `${rec.duration} days` : "—";
    node.querySelector('[data-field="startDate"]').textContent = rec.startDate || "—";
    node.querySelector('[data-field="invite"]').textContent = rec.invitePatient ? "Yes" : "No";
    node.querySelector('[data-field="instructionsPatient"]').textContent = rec.instructionsPatient || "—";
    node.querySelector('[data-field="instructionsCareTeam"]').textContent = rec.instructionsCareTeam || "—";
    node.querySelector('[data-field="timeline"]').innerHTML = renderRecTimeline(rec);

    const actionPanel = node.querySelector('[data-field="actionPanel"]');
    const editable = rec.status === "recommended" || rec.status === "in-progress";
    if (editable) {
      const select = actionPanel.querySelector(".custom-select");
      wireCustomSelect(select);
      if (rec.pickedUpBy) setCustomSelectValue(select, rec.pickedUpBy, { silent: true });
    } else {
      actionPanel.remove();
    }

    listEl.appendChild(node);
  });
}

renderRecList();

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-action]");
  if (!btn) return;

  const card = e.target.closest(".nurse-rec-card");
  const rec = careRecs.find((r) => r.id === Number(card.dataset.recId));
  if (!rec) return;

  const select = card.querySelector('.custom-select[data-name="actionTakenBy"]');
  const actionTakenBy = select.querySelector('input[type=hidden]').value;
  const noteInput = card.querySelector('[data-field="noteInput"]');
  const note = noteInput.value.trim();
  const t = timeLabel(new Date());

  if (!actionTakenBy) {
    positionCustomSelectMenu(select);
    select.classList.add("open");
    return;
  }

  if (btn.dataset.action === "save") {
    if (!note) {
      noteInput.focus();
      return;
    }
    if (rec.status === "recommended") rec.status = "in-progress";
    if (!rec.pickedUpBy) rec.pickedUpBy = actionTakenBy;
    rec.activity.push({ who: actionTakenBy, when: t.short, label: "Action taken", short: "Note added for provider", note });
    rec.updatedAt = t.full;
    noteInput.value = "";
    renderRecList();
  }

  if (btn.dataset.action === "complete") {
    rec.status = "completed";
    if (!rec.pickedUpBy) rec.pickedUpBy = actionTakenBy;
    rec.activity.push({ who: actionTakenBy, when: t.short, label: "Marked recommendation as Completed.", short: "Completed", note: note || undefined });
    rec.updatedAt = t.full;
    renderRecList();
  }
});
