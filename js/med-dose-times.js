/* Add / Edit Medication: dose times follow the chosen frequency.
   Once Daily shows one time, Twice Daily two, Three Times Daily three, and so on.
   The page scripts read the times with fd.getAll("doseTime") and build the
   effective date-time from the date plus the first dose time (medEffective). */
(function () {
  const DEFAULT_TIMES = {
    "Once Daily": ["08:00"],
    "Twice Daily": ["08:00", "20:00"],
    "Three Times Daily": ["08:00", "14:00", "20:00"],
    "Four Times Daily": ["08:00", "12:00", "16:00", "20:00"],
    "Every Morning": ["08:00"],
    "Every Night": ["21:00"],
    "Every X Hours": ["08:00"],
  };
  const ORDINAL = ["1st", "2nd", "3rd", "4th"];

  function timesFor(freq, keep) {
    const base = DEFAULT_TIMES[freq];
    if (!base) return [];
    return base.map((t, i) => (keep && keep[i]) || t);
  }

  function render(form, times) {
    const field = form.querySelector(".dose-times-field");
    if (!field) return;
    const freq = form.querySelector('input[name="frequency"]').value;
    const list = field.querySelector(".dose-times-list");
    if (!times) times = timesFor(freq, [...list.querySelectorAll("input")].map((i) => i.value));
    field.hidden = !times.length;
    const label = field.querySelector(".dose-times-label");
    label.textContent = freq === "Every X Hours" ? "First Dose Time" : times.length > 1 ? `Dose Times (${times.length} a day)` : "Dose Time";
    list.innerHTML = times.map((t, i) => `
      <label class="dose-time-item">
        <span class="dose-time-name">${times.length > 1 ? `${ORDINAL[i]} dose` : "Time"}</span>
        <input type="time" name="doseTime" value="${t}" required aria-label="${ORDINAL[i]} dose time" />
      </label>`).join("");
  }

  window.setDoseTimes = function (form, freq, times) {
    const clean = (times || []).filter(Boolean);
    render(form, timesFor(freq, clean));
  };

  // Effective date (date input) + first dose time -> "YYYY-MM-DDTHH:MM"
  window.medEffective = function (fd) {
    const date = fd.get("effectiveDateTime");
    if (!date) return "";
    return `${date.slice(0, 10)}T${fd.getAll("doseTime")[0] || "00:00"}`;
  };

  window.fmtDoseTimes = function (m) {
    const times = m.doseTimes && m.doseTimes.length ? m.doseTimes : null;
    if (!times) return null;
    return times.map((t) => {
      const [h, mi] = t.split(":").map(Number);
      return `${h % 12 || 12}:${String(mi).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
    }).join(", ");
  };

  ["addMedForm", "editMedForm"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form || !form.querySelector(".dose-times-field")) return;
    form.querySelector('input[name="frequency"]').addEventListener("change", () => render(form));
    form.addEventListener("reset", () => setTimeout(() => render(form, null), 0));
    render(form);
  });
})();
