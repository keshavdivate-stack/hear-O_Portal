/* ---------------- Prototype control: patient chart view ----------------
   Prototype only. Adds a "Patient chart" section to the profile avatar's
   Prototype controls so a client can switch between the three chart designs
   without hunting for the right patient in the list:
     - Per patient    : the list decides (EHR org -> EHR chart, nurse flag -> nurse view)
     - Patient chart  : patient-data.html
     - Nurse view     : nurse-view.html
     - EHR patient chart : ehr-integration/patient-data.html
   Saved in localStorage ("protoChartView"). On a chart page, picking a view
   opens that chart straight away; on the patient list every name then opens
   the picked chart (the list listens for "chartviewchange"). */
(function () {
  const KEY = "protoChartView";
  const inEhr = /\/ehr-integration\//.test(location.pathname);
  const root = inEhr ? "../" : "";
  const VIEWS = [
    { value: "auto", label: "Per patient", page: null },
    { value: "standard", label: "Patient chart", page: "patient-data.html" },
    { value: "nurse", label: "Nurse view", page: "nurse-view.html" },
    { value: "ehr", label: "EHR patient chart", page: "ehr-integration/patient-data.html" },
  ];

  function getChartView() {
    let v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    return VIEWS.some((x) => x.value === v) ? v : "auto";
  }
  /* Page (relative to the clinic root) for the picked view, or null for "per patient". */
  window.protoChartPage = () => (VIEWS.find((x) => x.value === getChartView()) || {}).page || null;

  /* Which chart is this page? */
  const path = location.pathname.replace(/\.html$/, "");
  const current = inEhr && /\/patient-data$/.test(path) ? "ehr"
    : /\/nurse-view$/.test(path) ? "nurse"
    : /\/patient-data$/.test(path) ? "standard"
    : null;

  const btn = document.getElementById("profileBtn");
  if (!btn) return;
  let pop = document.getElementById("profilePopover");
  if (!pop) {
    /* Pages without the organisation-type control (EHR chart) get their own popover. */
    pop = document.createElement("div");
    pop.className = "topbar-popover org-popover proto-popover";
    pop.id = "profilePopover";
    pop.innerHTML = `<p class="proto-popover-title">Prototype controls</p>`;
    btn.after(pop);
    if (typeof wireTopbarToggle === "function") wireTopbarToggle("profileBtn", "profilePopover");
  }

  /* On a chart page the radio shows the chart you're on. */
  const checked = current || getChartView();
  const section = document.createElement("div");
  section.className = "proto-popover-section";
  section.innerHTML = `
    <p class="proto-popover-sub">Patient chart</p>
    ${VIEWS.filter((v) => !(current && v.value === "auto")).map((v) => `
      <label class="org-radio-item">
        <input type="radio" name="protoChartView" value="${v.value}" ${v.value === checked ? "checked" : ""} />
        <span class="radio-dot"></span>
        ${v.label}
      </label>`).join("")}`;
  pop.appendChild(section);

  section.addEventListener("change", (e) => {
    if (e.target.name !== "protoChartView") return;
    const value = e.target.value;
    try { localStorage.setItem(KEY, value); } catch (err) {}
    document.dispatchEvent(new CustomEvent("chartviewchange", { detail: { view: value } }));
    const view = VIEWS.find((x) => x.value === value);
    if (current && view.page && value !== current) {
      location.href = root + view.page + location.search;
      return;
    }
    if (typeof closeAllTopbarPopovers === "function") closeAllTopbarPopovers();
  });
})();
