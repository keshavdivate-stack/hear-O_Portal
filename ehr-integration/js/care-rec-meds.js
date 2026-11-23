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
            ${cell("Directions", m.sig, true)}
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
