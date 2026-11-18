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
    // Keep typed times only while the dose count stays the same; a new frequency gets its own defaults.
    if (keep && keep.length === base.length && keep.every(Boolean)) return keep;
    return base.map((t, i) => (keep && keep.length === 1 && i === 0 && keep[0]) || t);
  }

  function render(form, times) {
    const field = form.querySelector(".dose-times-field");
    if (!field) return;
    const freq = form.querySelector('input[name="frequency"]').value;
    const list = field.querySelector(".dose-times-list");
    if (!times) times = timesFor(freq, [...list.querySelectorAll("input")].map((i) => i.value));
    field.hidden = !times.length;
    // One dose time sits in the same row as Frequency (one grid cell);
    // two or more get their own full-width row right below it.
    const many = times.length > 1;
    field.classList.toggle("full", many);
    const label = field.querySelector(".dose-times-label");
    label.textContent = freq === "Every X Hours" ? "First Dose Time" : many ? `Dose Times (${times.length} a day)` : "Dose Time";
    list.innerHTML = times.map((t, i) => `
      <label class="dose-time-item">
        ${many ? `<span class="dose-time-name">${ORDINAL[i]} dose</span>` : ""}
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

  /* ---------- How often (every day / every other day / specific days) and End date ---------- */
  const SPECIFIC = "On specific days of the week";
  const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const plus30 = (iso) => {
    const d = iso ? new Date(`${iso}T00:00`) : new Date();
    d.setDate(d.getDate() + 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  function syncSchedule(form) {
    const howOften = form.querySelector('input[name="howOften"]').value;
    const daysField = form.querySelector(".med-days-field");
    daysField.hidden = howOften !== SPECIFIC;
    const days = form.querySelector('input[name="days"]').value.split(",").filter(Boolean);
    daysField.querySelectorAll('.med-days-option input').forEach((c) => { c.checked = days.includes(c.value); });
    const value = daysField.querySelector(".med-days-trigger .custom-select-value");
    value.textContent = days.length === 7 ? "Every day of the week" : days.length ? days.join(", ") : "Select days";
    value.classList.toggle("placeholder", !days.length);
    if (days.length) daysField.querySelector('[data-error="days"]').hidden = true;
    if (daysField.hidden) setDaysOpen(form, false);

    const mode = form.querySelector('input[name="endMode"]').value;
    form.querySelector(".med-ongoing-check").checked = mode !== "date";
    const endInput = form.querySelector('input[name="endDate"]');
    endInput.disabled = mode !== "date";
    endInput.required = mode === "date";
    if (mode !== "date") endInput.value = "";
    checkEnd(form, false);
  }

  function setDaysOpen(form, open) {
    const wrap = form.querySelector(".med-days-select");
    wrap.classList.toggle("open", open);
    wrap.querySelector(".med-days-trigger").setAttribute("aria-expanded", String(open));
  }

  // End date must not be before the effective date. Returns true when valid.
  function checkEnd(form, show) {
    const start = form.querySelector('input[name="effectiveDateTime"]').value;
    const mode = form.querySelector('input[name="endMode"]').value;
    const end = form.querySelector('input[name="endDate"]').value;
    const bad = mode === "date" && !!end && !!start && end < start;
    const err = form.querySelector('[data-error="end"]');
    if (show || !bad) err.hidden = !bad;
    return !bad;
  }

  window.setMedSchedule = function (form, s) {
    if (typeof setCustomSelectValue === "function") {
      setCustomSelectValue(form.querySelector('.custom-select[data-name="howOften"]'), s.howOften || "Every day", { silent: true });
    }
    form.querySelector('input[name="days"]').value = (s.days || []).join(",");
    form.querySelector('input[name="endMode"]').value = s.endDate ? "date" : "ongoing";
    form.querySelector('input[name="endDate"]').value = s.endDate || "";
    syncSchedule(form);
  };

  // Values for the page scripts' save handlers.
  window.medSchedule = function (fd) {
    const howOften = fd.get("howOften") || "Every day";
    return {
      howOften,
      days: howOften === SPECIFIC ? (fd.get("days") || "").split(",").filter(Boolean) : [],
      endDate: fd.get("endMode") === "date" ? fd.get("endDate") || "" : "",
    };
  };

  // Popover text: "Every day" / "Mon, Wed, Fri" and "Ongoing" / "Jan 30, 2027".
  window.fmtHowOften = function (m) {
    if (!m.howOften) return null;
    return m.howOften === SPECIFIC && m.days && m.days.length ? m.days.join(", ") : m.howOften;
  };
  window.fmtEndDate = function (m) {
    if (!m.howOften && !m.endDate) return null;
    if (!m.endDate) return "Ongoing";
    return new Date(`${m.endDate}T00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  ["addMedForm", "editMedForm"].forEach((id) => {
    const form = document.getElementById(id);
    if (!form || !form.querySelector(".med-days-field")) return;
    form.querySelector('input[name="howOften"]').addEventListener("change", () => syncSchedule(form));

    // Days: a dropdown of checkboxes; the trigger shows the picked days ("Mon, Wed, Fri").
    const daysWrap = form.querySelector(".med-days-select");
    daysWrap.querySelector(".med-days-trigger").addEventListener("click", () => setDaysOpen(form, !daysWrap.classList.contains("open")));
    daysWrap.querySelector(".med-days-menu").addEventListener("change", () => {
      const picked = [...daysWrap.querySelectorAll(".med-days-option input:checked")].map((c) => c.value);
      form.querySelector('input[name="days"]').value = DAY_ORDER.filter((d) => picked.includes(d)).join(",");
      syncSchedule(form);
    });
    document.addEventListener("click", (e) => { if (!daysWrap.contains(e.target)) setDaysOpen(form, false); });
    daysWrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && daysWrap.classList.contains("open")) { e.stopPropagation(); setDaysOpen(form, false); daysWrap.querySelector(".med-days-trigger").focus(); }
    });

    // End date: "Ongoing" (default) disables the date; unticking it opens the date, pre-filled 30 days on.
    form.querySelector(".med-ongoing-check").addEventListener("change", (e) => {
      const ongoing = e.target.checked;
      form.querySelector('input[name="endMode"]').value = ongoing ? "ongoing" : "date";
      syncSchedule(form);
      const endInput = form.querySelector('input[name="endDate"]');
      if (!ongoing) {
        if (!endInput.value) endInput.value = plus30(form.querySelector('input[name="effectiveDateTime"]').value);
        endInput.focus();
      }
    });
    form.querySelector('input[name="endDate"]').addEventListener("input", () => checkEnd(form, true));
    form.querySelector('input[name="effectiveDateTime"]').addEventListener("input", () => checkEnd(form, true));

    // Runs before the page's own submit handler (capture), and stops it when the schedule is incomplete.
    form.addEventListener("submit", (e) => {
      const needDays = form.querySelector('input[name="howOften"]').value === SPECIFIC && !form.querySelector('input[name="days"]').value;
      form.querySelector('[data-error="days"]').hidden = !needDays;
      const endOk = checkEnd(form, true);
      if (needDays || !endOk) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);

    // A new Add form starts on "Every day" and "Ongoing" (Edit is filled by openEditMedModal).
    if (id === "addMedForm") form.addEventListener("reset", () => setTimeout(() => window.setMedSchedule(form, {}), 0));
    window.setMedSchedule(form, {});
  });
})();
