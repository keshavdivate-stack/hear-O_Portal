/* Commercial organisations: the Medication tab shows only what the patient
   added in the app (view only), and the clinic has one filter -- by medication.
   Loaded after the page script (patient-data.js / nurse-view.js), which reads
   window.COMMERCIAL_MEDS and window.medNameFilter through orgMeds() / filteredMeds(). */
(function () {
  // Sample patient-added medications (adherence = one entry per chart day:
  // true taken, false skipped, null not recorded; partialIdx = days with only some doses).
  const meds = [
    { name: "Atorvastatin", cls: "Statin", freq: "Daily", dose: "40 mg", schedule: "Once daily, 9:00 PM · Since Sep 2, no end date",
      adherence: dailyAdherence([4, 17], [9, 25]), doseTimes: ["21:00"] },
    { name: "Carvedilol", cls: "Beta blocker", freq: "Twice daily", dose: "6.25 mg", schedule: "Twice daily, 8:00 AM, 9:00 PM · Since Sep 14, no end date",
      adherence: dailyAdherence([5], [27]), partialIdx: [9, 17, 23, 30], doseTimes: ["08:00", "21:00"] },
    { name: "Dapagliflozin", cls: "SGLT2 inhibitor", freq: "Daily", dose: "10 mg", schedule: "Once daily, 8:00 AM · Since Oct 5, no end date",
      adherence: dailyAdherence([12], [3, 21]), doseTimes: ["08:00"] },
    { name: "Enalapril", cls: "ACE inhibitor", freq: "Twice daily", dose: "5 mg", schedule: "Twice daily, 8:00 AM, 8:00 PM · Since Aug 20, no end date",
      adherence: dailyAdherence([8, 19], []), partialIdx: [2, 14, 26], doseTimes: ["08:00", "20:00"] },
    { name: "Furosemide", cls: "Loop diuretic", freq: "Daily", dose: "40 mg", schedule: "Once daily, 8:00 AM · Since Oct 2, no end date",
      adherence: dailyAdherence([8, 21], [30]), doseTimes: ["08:00"], hf: true },
    { name: "Ibuprofen", cls: "NSAID (OTC)", freq: "As needed", dose: "200 mg", schedule: "As needed · Since Dec 12, no end date",
      adherence: dailyAdherence([1, 3, 5, 7, 9, 11, 13], [15, 17, 19, 21, 23, 25, 27, 29]), partialIdx: [2, 6, 10, 16, 22, 26],
      warning: "NSAIDs may worsen fluid retention in HF",
      patientReason: "I took this medication because I had a headache and joint pain. It helped with the pain and I felt better after taking it.",
      patientReasonDate: "2026-12-12" },
    { name: "Metformin", cls: "Biguanide", freq: "Twice daily", dose: "500 mg", schedule: "Twice daily, 8:00 AM, 8:00 PM · Since Nov 1, no end date",
      adherence: dailyAdherence([11], [24]), partialIdx: [6, 20, 28], doseTimes: ["08:00", "20:00"] },
    { name: "Prednisone", cls: "Corticosteroid", freq: "Daily", dose: "10 mg", schedule: "Once daily, 8:00 AM · Dec 11 – Dec 30",
      // Removed by the patient on Dec 30: nothing is recorded after that.
      adherence: dailyAdherence([6], [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]), doseTimes: ["08:00"], removedByPatient: "Dec 30" },
    { name: "Spironolactone", cls: "MRA", freq: "Daily", dose: "25 mg", schedule: "Once daily, 8:00 AM · Since Sep 2, no end date",
      adherence: dailyAdherence([15], [2]), doseTimes: ["08:00"] },
  ];
  window.COMMERCIAL_MEDS = meds.map((m, i) => Object.assign({
    id: 900 + i, hf: false, warning: null, source: "Patient", srcClass: "src-patient",
    status: m.removedByPatient ? "past" : "active", ehrStatus: m.removedByPatient ? "Inactive" : "Active",
  }, m));

  /* ---------- Filter by medication (Commercial only) ---------- */
  window.medNameFilter = new Set(); // empty = all medications
  const anchor = document.getElementById("medStatusFilter");
  if (!anchor) return;

  const check = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 12L9 17L20 6" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const wrap = document.createElement("div");
  wrap.className = "ehr-multiselect med-name-filter";
  wrap.innerHTML = `
    <button type="button" class="med-name-filter-trigger" aria-haspopup="true" aria-expanded="false">
      <span class="med-name-filter-value">All medications</span>
      <svg class="ehr-multiselect-caret" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div class="ehr-multiselect-menu med-name-filter-menu" role="group" aria-label="Show only these medications">
      <div class="med-name-filter-head"><span>Show only</span><button type="button" class="med-name-filter-clear">Clear</button></div>
      <div class="med-name-filter-options"></div>
    </div>`;
  anchor.after(wrap);

  const trigger = wrap.querySelector(".med-name-filter-trigger");
  const optionsEl = wrap.querySelector(".med-name-filter-options");

  function names() {
    return [...new Set(window.COMMERCIAL_MEDS.map((m) => m.name))].sort((a, b) => a.localeCompare(b));
  }
  function sync() {
    const n = window.medNameFilter.size;
    wrap.querySelector(".med-name-filter-value").textContent =
      n === 0 ? "All medications" : n === 1 ? [...window.medNameFilter][0] : `${n} medications`;
    optionsEl.querySelectorAll("[data-med-name]").forEach((o) => {
      const on = window.medNameFilter.has(o.dataset.medName);
      o.classList.toggle("checked", on);
      o.setAttribute("aria-checked", String(on));
    });
    wrap.querySelector(".med-name-filter-clear").disabled = n === 0;
  }
  function build() {
    optionsEl.innerHTML = names().map((n) => `
      <div class="ehr-multiselect-option" role="checkbox" tabindex="0" data-med-name="${n}" aria-checked="false">
        <span class="ehr-multiselect-checkbox">${check}</span>${n}
      </div>`).join("");
    sync();
  }
  const apply = () => { sync(); if (typeof renderMeds === "function") renderMeds(); };
  const setOpen = (open) => { wrap.classList.toggle("open", open); trigger.setAttribute("aria-expanded", String(open)); };

  trigger.addEventListener("click", (e) => { e.stopPropagation(); setOpen(!wrap.classList.contains("open")); });
  wrap.querySelector(".med-name-filter-menu").addEventListener("click", (e) => e.stopPropagation());
  optionsEl.addEventListener("click", (e) => {
    const o = e.target.closest("[data-med-name]");
    if (!o) return;
    const n = o.dataset.medName;
    window.medNameFilter.has(n) ? window.medNameFilter.delete(n) : window.medNameFilter.add(n);
    apply();
  });
  optionsEl.addEventListener("keydown", (e) => {
    if ((e.key === " " || e.key === "Enter") && e.target.matches("[data-med-name]")) { e.preventDefault(); e.target.click(); }
  });
  wrap.querySelector(".med-name-filter-clear").addEventListener("click", () => { window.medNameFilter.clear(); apply(); });
  document.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  document.addEventListener("orgtypechange", () => { window.medNameFilter.clear(); build(); });

  build();
  if (typeof renderMeds === "function") renderMeds();
})();
