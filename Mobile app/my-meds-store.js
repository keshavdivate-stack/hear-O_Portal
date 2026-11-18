/* The patient's own medications ("My Meds"), shared by the Medications list,
   Medication details and the Add / Edit Medication stepper so that adding,
   editing and removing a medication sticks across screens.
   Prototype only: kept in this browser's localStorage, seeded with three
   sample supplements. Records use the Add Medication answers as-is:
   { uid, name, form, strength, amt, freq, days, start, count, more, times, end, food } */
(function () {
  var KEY = "hearo_my_meds_v1";
  var SEED = {
    "vitamin-d3": { uid: 1, name: "Vitamin D3", form: "pill", strength: "1000 IU", amt: 1, freq: "daily", days: [], start: "2026-07-01", count: 1, more: false, times: ["08:00"], end: "", food: "after" },
    calcium: { uid: 2, name: "Calcium", form: "pill", strength: "500 mg", amt: 1, freq: "daily", days: [], start: "2026-07-01", count: 1, more: false, times: ["21:00"], end: "", food: "after" },
    vitamin: { uid: 3, name: "Vitamin", form: "pill", strength: "", amt: 1, freq: "daily", days: [], start: "2026-07-01", count: 1, more: false, times: ["21:00"], end: "", food: "after" },
  };

  // Add Medication form keys -> the labels the Medications list uses.
  var FORM_LABEL = { pill: "Tablet", liquid: "Liquid", drops: "Drops", inhaler: "Inhaler", injection: "Injection", cream: "Cream", patch: "Patch", other: "Other" };

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return JSON.parse(JSON.stringify(SEED));
  }
  function write(all) {
    try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (e) {}
  }
  function slugify(name) {
    return String(name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "medication";
  }
  function fmtTime(hhmm) {
    var p = hhmm.split(":").map(Number);
    return (p[0] % 12 || 12) + ":" + String(p[1]).padStart(2, "0") + " " + (p[0] < 12 ? "AM" : "PM");
  }

  window.MyMeds = {
    FORM_LABEL: FORM_LABEL,
    all: read,
    get: function (slug) { return read()[slug] || null; },

    /* Saves a new medication; returns its slug. */
    add: function (rec) {
      var all = read();
      var base = slugify(rec.name), slug = base, n = 2;
      while (all[slug]) slug = base + "-" + n++;
      var uid = Object.keys(all).reduce(function (m, k) { return Math.max(m, all[k].uid || 0); }, 0) + 1;
      rec.uid = uid;
      all[slug] = rec;
      write(all);
      return slug;
    },
    update: function (slug, rec) {
      var all = read();
      if (!all[slug]) return;
      rec.uid = all[slug].uid;
      all[slug] = rec;
      write(all);
    },
    remove: function (slug) {
      var all = read();
      delete all[slug];
      write(all);
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
    },

    /* One row per dose time, in the shape the Medications list renders.
       Dose ids are uid * 10 + index so they stay stable when other meds are removed. */
    doses: function () {
      var all = read(), out = [];
      Object.keys(all).forEach(function (slug) {
        var m = all[slug];
        (m.times || []).forEach(function (t, i) {
          var p = t.split(":").map(Number);
          out.push({
            id: m.uid * 10 + i, med: slug, name: m.name, form: FORM_LABEL[m.form] || "Tablet", amt: m.amt || 1,
            time: fmtTime(t), sortKey: p[0] * 60 + p[1], food: m.food || undefined,
          });
        });
      });
      return out.sort(function (a, b) { return a.sortKey - b.sortKey; });
    },

    /* "Every day", "Every other day" or "Mon, Wed, Fri". */
    howOften: function (m) {
      if (m.freq === "other") return "Every other day";
      if (m.freq === "days") return (m.days || []).join(", ");
      return "Every day";
    },
    fmtTime: fmtTime,
  };
})();
