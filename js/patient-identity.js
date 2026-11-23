/* ---------------- Prototype: which patient is this chart for? ----------------
   The chart pages (patient-data.html, nurse-view.html, ehr-integration/patient-data.html) and the
   Care Recommendation pages are static demo pages written for one patient. Links from the patient list,
   dashboard, reports and support pass the clicked patient in the URL:
     ?patient=<name>&pid=<username>&mrn=<mrn>&enrolled=<dd.mm.yyyy>
   (only `patient` is required). This script swaps the demo patient's name, ID, MRN and onboarding date
   for those, and remembers the patient in sessionStorage so links inside the chart (tabs, Care
   Recommendation, chart switcher) keep showing the same person. */
(function () {
  const KEY = "protoChartPatient";
  const DEMO = { name: "Sarah White", pid: "ABC-123", mrn: "857 152 365", enrolled: "12.01.2025" };

  /* Stable made-up ID/MRN for patients whose link carries only a name (dashboard, reports). */
  function hash(s) {
    let h = 7;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  function formatMrn(m) {
    const d = String(m).replace(/\D/g, "").padStart(9, "0").slice(-9);
    return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  }

  function readPatient() {
    const q = new URLSearchParams(location.search);
    const name = q.get("patient");
    if (name) {
      const h = hash(name);
      const p = {
        name,
        pid: q.get("pid") || `ABC-${1200 + (h % 90)}`,
        mrn: formatMrn(q.get("mrn") || 850000000 + (h % 9999999)),
        enrolled: q.get("enrolled") || DEMO.enrolled,
      };
      try { sessionStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
      return p;
    }
    try {
      const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (saved && saved.name) return saved;
    } catch (e) {}
    return null;
  }

  /* Replace text in text nodes only, so icons and markup stay untouched. */
  function replaceText(root, from, to) {
    if (!from || from === to) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) if (n.nodeValue.includes(from)) n.nodeValue = n.nodeValue.split(from).join(to);
    root.querySelectorAll(`[title*="${from}"]`).forEach((el) => el.setAttribute("title", el.getAttribute("title").split(from).join(to)));
  }

  function apply() {
    const p = readPatient();
    if (!p) return;
    const scope = document.querySelector(".patient-card") || document.body;
    document.querySelectorAll(".patient-name").forEach((el) => (el.textContent = p.name));
    document.querySelectorAll(".patient-mrn").forEach((el) => (el.textContent = p.pid));
    replaceText(scope, DEMO.mrn, p.mrn);
    replaceText(scope, `Onboarding ${DEMO.enrolled}`, `Onboarding ${p.enrolled}`);
    /* Care Recommendation breadcrumb: "Sarah White (ABC-123)" */
    replaceText(document.body, `${DEMO.name} (${DEMO.pid})`, `${p.name} (${p.pid})`);
  }

  /* Build a chart link for a patient (used by list/dashboard/report pages that load this script). */
  window.protoPatientQuery = function (p) {
    const q = new URLSearchParams();
    if (p && p.name) q.set("patient", p.name);
    if (p && p.username) q.set("pid", p.username);
    if (p && p.mrn) q.set("mrn", p.mrn);
    if (p && p.enrolledDate) q.set("enrolled", p.enrolledDate);
    return q;
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
  else apply();
})();
