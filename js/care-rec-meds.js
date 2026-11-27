/* ---------------- Care Recommendation medications ----------------
   A care recommendation holds one or more medications, each with the same
   fields as the Add Medication popup. Create, View and Edit all use this:
     careRecMeds(rec)            -> the medications (older records are mapped)
     applyCareRecMeds(rec, meds) -> stores them + the summary fields list cards use
     renderCareRecMedsView(rec)  -> read-only cards for the View popup
     wireCareRecMedRows(rows, addBtn) -> add / remove / fill / read the editable cards
   Needs med-dose-times.js (dose times, how often, end date) and the page's
   wireCustomSelect / setCustomSelectValue. */
(function () {
  const SPECIFIC = "On specific days of the week";
  const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function addDays(iso, n) {
    if (!iso || !n) return "";
    const d = new Date(`${iso.slice(0, 10)}T00:00`);
    if (Number.isNaN(d.getTime())) return "";
    d.setDate(d.getDate() + Number(n));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  /* RxNorm codes for the sample medications */
  const RXNORM = { Furosemide: "4603", Carvedilol: "20352", Spironolactone: "9997", Ibuprofen: "5640", Atorvastatin: "83367" };

  window.careRecMeds = function (rec) {
    if (rec.meds && rec.meds.length) return rec.meds;
    // Older records: one medication from the dose-change fields
    return [{
      name: rec.medication || "",
      drugCodeType: "RxNorm",
      drugCodeValue: RXNORM[rec.medication] || "",
      status: "Active",
      doseForm: "Tablet",
      amount: rec.newDose ? `${rec.newDose} mg` : "",
      dose: "",
      route: "Oral",
      howOften: "Every day",
      days: [],
      effectiveDateTime: rec.startDate || "",
      endDate: addDays(rec.startDate, rec.duration),
      frequency: rec.frequency || "",
      doseTimes: [],
      sig: "",
    }];
  };

  window.applyCareRecMeds = function (rec, meds) {
    rec.meds = meds;
    const first = meds[0] || {};
    const names = meds.map((m) => m.name).filter(Boolean);
    rec.medication = names.join(", ");
    rec.title = names.length > 1 ? `Medication changes: ${names.join(", ")}` : `${names[0] || "Medication"} dose change`;
    rec.currentDose = "";
    rec.newDose = (first.amount || "").replace(/\s*mg$/i, "");
    rec.frequency = first.frequency || "";
    rec.startDate = (first.effectiveDateTime || "").slice(0, 10);
    rec.duration = "";
    return rec;
  };

  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(`${iso.slice(0, 10)}T00:00`);
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  const fmtTime = (t) => {
    const [h, mi] = String(t).split(":").map(Number);
    return Number.isNaN(h) ? t : `${h % 12 || 12}:${String(mi || 0).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };

  window.renderCareRecMedsView = function (rec) {
    const meds = careRecMeds(rec);
    /* Same fields as the Create form, disabled */
    const cell = (label, value, full) =>
      `<div class="form-field rec-view-field${full ? " full" : ""}"><label>${label}</label>${full
        ? `<textarea rows="2" disabled>${esc(value)}</textarea>`
        : `<input type="text" value="${esc(value)}" placeholder="—" disabled />`}</div>`;
    return `
      <div class="drawer-label rec-view-meds-title">Medication Details</div>
      ${meds.map((m, i) => {
        const days = Array.isArray(m.days) ? m.days : String(m.days || "").split(",").filter(Boolean);
        const howOften = m.howOften === SPECIFIC && days.length ? `${m.howOften} (${days.join(", ")})` : m.howOften;
        return `
        <div class="rec-med-row rec-med-view">
          ${meds.length > 1 ? `<div class="rec-med-row-title">Medication ${i + 1}</div>` : ""}
          <div class="form-grid rec-view-grid">
            ${cell("Medication", m.name)}
            ${cell("Drug Code", m.drugCodeValue ? `${m.drugCodeType || ""} ${m.drugCodeValue}`.trim() : "")}
            ${cell("Status", m.status)}
            ${cell("Dose Form", m.doseForm)}
            ${cell("Amount", m.amount)}
            ${cell("Dose", m.dose)}
            ${cell("Route", m.route)}
            ${cell("How Often", howOften)}
            ${cell("Effective Date", fmtDate(m.effectiveDateTime))}
            ${cell("End Date", m.endDate ? fmtDate(m.endDate) : "Ongoing")}
            ${cell("Frequency", m.frequency)}
            ${cell("Dose Times", (m.doseTimes || []).filter(Boolean).map(fmtTime).join(", "))}
            ${cell("Note", m.sig, true)}
          </div>
        </div>`;
      }).join("")}`;
  };

  function val(row, name) {
    const el = row.querySelector(`[name="${name}"]`);
    return el ? el.value : "";
  }

  function readRow(row) {
    return {
      name: val(row, "name").trim(),
      drugCodeType: val(row, "drugCodeType"),
      drugCodeValue: val(row, "drugCodeValue").trim(),
      status: val(row, "status"),
      doseForm: val(row, "doseForm"),
      amount: val(row, "amount").trim(),
      dose: val(row, "dose").trim(),
      route: val(row, "route"),
      howOften: val(row, "howOften"),
      days: val(row, "days").split(",").filter(Boolean),
      effectiveDateTime: val(row, "effectiveDateTime"),
      endDate: val(row, "endMode") === "date" ? val(row, "endDate") : "",
      frequency: val(row, "frequency"),
      doseTimes: [...row.querySelectorAll('input[name="doseTime"]')].map((i) => i.value),
      sig: val(row, "sig").trim(),
    };
  }
  window.readCareRecMedRow = readRow;
  window.fillCareRecMedRow = (row, m) => fillRow(row, m);

  function fillRow(row, m) {
    const setText = (name, v) => { const el = row.querySelector(`[name="${name}"]`); if (el) el.value = v || ""; };
    setText("name", m.name);
    setText("drugCodeValue", m.drugCodeValue);
    setText("amount", m.amount);
    setText("dose", m.dose);
    setText("effectiveDateTime", (m.effectiveDateTime || "").slice(0, 10));
    setText("sig", m.sig);
    ["drugCodeType", "status", "doseForm", "route", "frequency"].forEach((n) => {
      const s = row.querySelector(`.custom-select[data-name="${n}"]`);
      if (s && m[n] !== undefined) setCustomSelectValue(s, m[n] || (n === "drugCodeType" ? "RxNorm" : ""), { silent: true });
    });
    if (window.setMedSchedule) setMedSchedule(row, { howOften: m.howOften, days: m.days, endDate: m.endDate });
    if (window.setDoseTimes) setDoseTimes(row, m.frequency, m.doseTimes);
  }

  /* Editable medication cards. Call once the page has wired its own
     custom selects (the first card is used as the template). */
  window.wireCareRecMedRows = function (container, addBtn) {
    const template = container.querySelector(".rec-med-row").cloneNode(true);
    template.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
    container.innerHTML = "";

    const rows = () => [...container.querySelectorAll(".rec-med-row")];
    function sync() {
      rows().forEach((row, i) => { row.querySelector(".rec-med-row-title").textContent = `Medication ${i + 1}`; });
      container.classList.toggle("is-multi", rows().length > 1);
    }
    function add(med) {
      const row = template.cloneNode(true);
      container.appendChild(row);
      row.querySelectorAll(".custom-select").forEach(wireCustomSelect);
      if (window.wireMedFields) wireMedFields(row);
      if (med) fillRow(row, med);
      sync();
      return row;
    }
    addBtn.addEventListener("click", () => add().querySelector("input, button")?.focus());
    container.addEventListener("click", (e) => {
      const btn = e.target.closest(".rec-med-remove");
      if (!btn || rows().length < 2) return;
      btn.closest(".rec-med-row").remove();
      sync();
    });
    add();

    return {
      set(meds) {
        container.innerHTML = "";
        (meds && meds.length ? meds : [null]).forEach((m) => add(m));
      },
      read: () => rows().map(readRow),
      valid: () => rows().map((r) => !window.medScheduleValid || window.medScheduleValid(r)).every(Boolean),
    };
  };
})();

/* ---------------- View / Edit on the full Care Recommendation screen ----------------
   The charts (and the nurse view) no longer open popups: View and Edit go to
   care-recommendation.html, the same screen used to create one.
     openCareRecScreen(rec, mode, from) -> carries the record across
     applyCareRecOverrides(recs, from)  -> on return, applies saved changes
     initCareRecScreen(pageRecs)        -> on care-recommendation.html */
(function () {
  const OPEN_KEY = "hearo.careRecOpen";
  const OVR_KEY = "hearo.careRecOverrides";
  const BACK = {
    chart: "patient-data.html?openTab=clinical&openSubtab=care-rec",
    ehr: "patient-data.html?openTab=clinical&openSubtab=care-rec",
    nurse: "nurse-view.html?openTab=clinical&openSubtab=care-rec",
    self: "care-recommendation.html",
  };
  const store = {
    get(k) { try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  window.openCareRecScreen = function (rec, mode, from) {
    if (!rec) return;
    store.set(OPEN_KEY, { from, rec });
    location.href = `care-recommendation.html?mode=${mode}&rec=${encodeURIComponent(rec.id)}&from=${from}`;
  };

  function saveOverride(from, rec) {
    const all = store.get(OVR_KEY) || {};
    all[`${from}|${rec.id}`] = rec;
    store.set(OVR_KEY, all);
  }

  window.applyCareRecOverrides = function (recs, from) {
    const all = store.get(OVR_KEY) || {};
    recs.forEach((r) => { const o = all[`${from}|${r.id}`]; if (o) Object.assign(r, o); });
  };

  const STATUS = {
    recommended: { label: "New", cls: "rec-status-recommended" },
    "in-progress": { label: "In Progress", cls: "rec-status-progress" },
    completed: { label: "Completed", cls: "rec-status-completed" },
    archived: { label: "Archived", cls: "rec-status-archived" },
  };
  const CHECK = `<svg class="option-check" width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CARET = `<svg class="custom-select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`;
  const select = (id, name, placeholder, options, value) => `
    <div class="custom-select" data-name="${name}" id="${id}">
      <button type="button" class="custom-select-trigger"><span class="custom-select-value placeholder">${placeholder}</span>${CARET}</button>
      <div class="custom-select-menu">${options.map(([v, l]) => `<div class="custom-select-option" data-value="${esc(v)}">${esc(l)}${CHECK}</div>`).join("")}</div>
      <input type="hidden" name="${name}" value="${esc(value || "")}" />
    </div>`;

  function nowLabel() {
    const d = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let h = d.getHours(); const ampm = h >= 12 ? "PM" : "AM"; h = h % 12 || 12;
    const m = String(d.getMinutes()).padStart(2, "0"); const dd = String(d.getDate()).padStart(2, "0");
    return { short: `${dd} ${months[d.getMonth()]} · ${h}:${m} ${ampm}`, full: `${dd} ${months[d.getMonth()]} ${d.getFullYear()}, ${h}:${m} ${ampm}` };
  }

  function detailsHTML(rec, from) {
    const st = STATUS[rec.status] || STATUS.recommended;
    const activity = (rec.activity || []).map((a) => `
      <div class="rec-timeline-item">
        <div class="rec-timeline-dot"></div>
        <div class="rec-timeline-content">
          <div class="rec-timeline-when">${esc(a.when)}</div>
          <div class="rec-timeline-who">${esc(a.who)}</div>
          <div class="rec-timeline-text${a.label ? " rec-timeline-label" : ""}">${esc(a.label || a.text || "")}</div>
          ${a.note ? `<div class="rec-timeline-note">${esc(a.note)}</div>` : ""}
        </div>
      </div>`).join("");
    const canAct = from === "nurse" && rec.status !== "completed" && rec.status !== "archived";
    return `
      <div class="rec-form-section rec-screen-details">
        <h3 class="rec-form-section-title">Status &amp; Activity</h3>
        <div class="rec-screen-meta">
          <div><div class="drawer-label">Status</div><span class="rec-status-chip ${st.cls}">${st.label}</span></div>
          <div><div class="drawer-label">Created By</div><div class="rec-info-value">${esc(rec.createdBy || "—")}</div></div>
          <div><div class="drawer-label">Created</div><div class="rec-info-value">${esc(rec.createdAt || "—")}</div></div>
          <div><div class="drawer-label">Picked Up By</div><div class="rec-info-value">${esc(rec.pickedUpBy || "Not yet picked up")}</div></div>
        </div>
        <div class="drawer-label" style="margin-top:18px;">Activity History</div>
        <div class="rec-timeline">${activity || `<div class="rec-completed-note">No activity yet.</div>`}</div>
        ${canAct ? `
        <div class="rec-add-note rec-screen-action">
          <div class="form-grid">
            <div class="form-field"><label>Action Taken By<span class="required-star">*</span></label>
              ${select("recActionTakenBy", "actionTakenBy", "Select your name", [["Amanda Lee, RN", "Amanda Lee, RN"], ["Ayelet Er, NP", "Ayelet Er, NP"], ["Sandy Kohl, Care Coordinator", "Sandy Kohl, Care Coordinator"]], rec.pickedUpBy)}
            </div>
            <div class="form-field"><label>Status<span class="required-star">*</span></label>
              ${select("recStatusSelect", "recStatus", "In Progress", [["in-progress", "In Progress"], ["completed", "Completed"]], "in-progress")}
            </div>
            <div class="form-field full"><label>Note for Provider</label>
              <textarea id="recNoteInput" rows="3" placeholder="Add a note the provider will see..."></textarea>
            </div>
          </div>
          <div class="rec-footer-actions">
            <span class="rec-completed-note">Set the status, add a note if needed, then save.</span>
            <div class="rec-footer-actions-right">
              <button type="button" class="btn-save enabled" id="recAddNote">Save</button>
              <button type="button" class="btn-complete" id="recMarkComplete" hidden>Complete</button>
            </div>
          </div>
        </div>` : rec.status === "completed" ? `<div class="rec-completed-note" style="margin-top:12px;">This recommendation is completed.</div>` : ""}
      </div>`;
  }

  window.initCareRecScreen = function (pageRecs) {
    const q = new URLSearchParams(location.search);
    const mode = q.get("mode");
    if (mode !== "view" && mode !== "edit") return;
    const payload = store.get(OPEN_KEY);
    const id = q.get("rec");
    const fromPayload = payload && payload.rec && String(payload.rec.id) === id;
    const rec = fromPayload ? payload.rec : (pageRecs || []).find((r) => String(r.id) === id);
    if (!rec) return;
    const from = (fromPayload && payload.from) || q.get("from") || "chart";
    const back = BACK[from] || BACK.chart;

    document.body.classList.add(`rec-screen-${mode}`);
    const tabsRow = document.querySelector(".rec-tabs-row");
    if (tabsRow) tabsRow.style.display = "none";
    document.querySelectorAll(".rec-tab-panel").forEach((p) => p.classList.toggle("open", p.dataset.recPanel === "create"));
    const title = document.querySelector(".rec-page-title");
    if (title) title.textContent = mode === "edit" ? "Edit Care Recommendation" : "View Care Recommendation";
    document.querySelectorAll(".rec-page-back, .rec-page-breadcrumb a").forEach((a) => { a.href = back; });

    const form = document.getElementById("careRecCreateForm");
    const rows = document.getElementById("careRecMedRows");
    const addBtn = document.getElementById("addCareRecMedRow");

    // Fill the same form used for Create
    const meds = careRecMeds(rec);
    for (let i = rows.querySelectorAll(".rec-med-row").length; i < meds.length; i++) addBtn.click();
    rows.querySelectorAll(".rec-med-row").forEach((row, i) => { if (meds[i]) fillCareRecMedRow(row, meds[i]); });
    form.instructionsPatient.value = rec.instructionsPatient || "";
    form.instructionsCareTeam.value = rec.instructionsCareTeam || "";
    if (form.invitePatient) form.invitePatient.checked = !!rec.invitePatient;
    const team = document.getElementById("careRecCareTeamField");
    if (team) {
      team.querySelectorAll('input[type="checkbox"]').forEach((cb) => { cb.checked = (rec.assignedCareTeam || []).includes(cb.value); });
      team.querySelector(".care-team-menu")?.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const submit = form.querySelector('[type="submit"]');
    const cancel = document.getElementById("cancelCareRecCreate");
    cancel.addEventListener("click", (e) => { e.stopImmediatePropagation(); location.href = back; }, true);

    if (mode === "edit") {
      submit.textContent = "Save Changes";
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const medRows = [...rows.querySelectorAll(".rec-med-row")];
        if (!medRows.every((r) => !window.medScheduleValid || window.medScheduleValid(r))) return;
        const fd = new FormData(form);
        applyCareRecMeds(rec, medRows.map(readCareRecMedRow));
        rec.instructionsPatient = fd.get("instructionsPatient");
        rec.instructionsCareTeam = fd.get("instructionsCareTeam");
        rec.invitePatient = fd.get("invitePatient") === "on";
        rec.assignedCareTeam = (fd.get("careTeam") || "").split(", ").filter(Boolean);
        const t = nowLabel();
        rec.updatedAt = t.full;
        (rec.activity = rec.activity || []).push({ who: rec.createdBy || "Dr. Sarah Mitchell", when: t.short, label: "Updated care recommendation.", short: "Updated" });
        if (from !== "self") saveOverride(from, rec);
        location.href = back;
      }, true);
      return;
    }

    // View: the same fields, disabled, plus status and activity history
    form.querySelectorAll("input, textarea, select, button").forEach((el) => { if (el !== cancel) el.disabled = true; });
    [submit, addBtn, ...rows.querySelectorAll(".rec-med-remove")].forEach((b) => { b.style.display = "none"; });
    cancel.textContent = "Back";
    cancel.disabled = false;

    const holder = document.createElement("div");
    form.querySelector(".rec-create-actions").before(holder);
    function render() {
      holder.innerHTML = detailsHTML(rec, from);
      const statusSel = document.getElementById("recStatusSelect");
      if (!statusSel) return;
      [statusSel, document.getElementById("recActionTakenBy")].forEach((s) => {
        wireCustomSelect(s);
        const v = s.querySelector("input[type=hidden]").value;
        if (v) setCustomSelectValue(s, v, { silent: true });
      });
      const sync = () => {
        const done = statusSel.querySelector("input[type=hidden]").value === "completed";
        document.getElementById("recAddNote").hidden = done;
        document.getElementById("recMarkComplete").hidden = !done;
      };
      statusSel.querySelector("input[type=hidden]").addEventListener("change", sync);
      sync();
    }
    holder.addEventListener("click", (e) => {
      const btn = e.target.closest("#recAddNote, #recMarkComplete");
      if (!btn) return;
      const whoSel = document.getElementById("recActionTakenBy");
      const who = whoSel.querySelector("input[type=hidden]").value;
      if (!who) { whoSel.querySelector(".custom-select-trigger").click(); return; }
      const note = document.getElementById("recNoteInput").value.trim();
      const t = nowLabel();
      rec.activity = rec.activity || [];
      if (btn.id === "recMarkComplete") {
        rec.status = "completed";
        rec.completedBy = who;
        rec.completedOn = t.full;
        rec.activity.push({ who, when: t.short, label: "Marked recommendation as Completed.", short: "Completed", note: note || undefined });
      } else {
        const changed = rec.status !== "in-progress";
        if (!changed && !note) { document.getElementById("recNoteInput").focus(); return; }
        rec.status = "in-progress";
        rec.activity.push(changed
          ? { who, when: t.short, label: "Marked recommendation as In Progress.", short: "In Progress", note: note || undefined }
          : { who, when: t.short, label: "Note added for provider", short: "Note added for provider", note });
      }
      if (!rec.pickedUpBy) rec.pickedUpBy = who;
      rec.updatedAt = t.full;
      if (from !== "self") saveOverride(from, rec);
      render();
    });
    render();
  };
})();
