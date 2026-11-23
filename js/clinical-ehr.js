/* ============================================================
   Patient chart -- Clinical tab EHR sections
   ------------------------------------------------------------
   Adds the EHR-synced Clinical sub-tabs (Conditions, Allergies, Care Plan,
   Goals, Documents) and the Manual / EHR Medication switch to the
   patient-data and nurse-view pages, matching ehr-integration/patient-data.
   Loaded after the page script; uses the existing rec-table / unit-toggle /
   btn-sync styles only.
   ============================================================ */
(() => {
  const panel = document.querySelector('.data-tab-panel[data-panel="clinical"]');
  if (!panel || panel.querySelector('[data-subtab="conditions"]')) return;

  const subtabsEl = panel.querySelector(".subtabs");
  const subRow = panel.querySelector(".subtab-row");
  const medPanel = panel.querySelector('.subtab-panel[data-subpanel="medication"]');
  if (!subtabsEl || !subRow || !medPanel) return;

  const EHR_TABS = [
    { key: "conditions", label: "Conditions" },
    { key: "allergies", label: "Allergies" },
    { key: "care-plan", label: "Care Plan" },
    { key: "goals", label: "Goals" },
    { key: "documents", label: "Documents" },
  ];
  const EHR_KEYS = EHR_TABS.map((t) => t.key);

  const dash = `<span class="rec-muted">-</span>`;
  const orDash = (v) => (v == null || v === "" || v === "-" ? dash : v);
  const statusText = (s) => (s ? `<span class="rec-status-chip rec-status-${s.toLowerCase()}">${s[0].toUpperCase()}${s.slice(1)}</span>` : dash);
  const sourceCell = (src) => `<span class="profile-field-source"><span class="ehr-connected-dot" style="width:6px;height:6px;"></span>${src}</span>`;
  const table = (id, cols) => `
    <div class="rec-table-wrap">
      <table class="rec-table">
        <thead><tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr></thead>
        <tbody id="${id}"></tbody>
      </table>
    </div>`;

  /* ---------- Data (Epic, synced 11/05/2026) ---------- */
  const ehrMedications = [
    {
      name: "drospirenone-ethinyl estradiol (YAZ) 3-0.02 MG per tablet",
      dosage: "Take 1 tablet by mouth 1 (one) time each day., Starting Tue 5/28/2019, Until Wed 5/27/2020, Normal",
      status: "active",
      prescribed: "05/28/2019",
      prescriber: "Physician Family Medicine, MD",
      source: "Epic",
    },
  ];

  const conditions = [
    { name: "PCOS (polycystic ovarian syndrome)", code: "E28.2", status: "active", type: "Problem List Item", onset: "09/20/2005", updated: "05/28/2019" },
    { name: "Stomach pain", code: "R10.9", type: "Encounter Diagnosis", onset: "06/02/2023" },
    { name: "Ischemic chest pain (CMS/HCC)", code: "I20.9", type: "Encounter Diagnosis", onset: "06/02/2023" },
    { name: "Ischemic chest pain (CMS/HCC)", code: "I20.9", type: "Encounter Diagnosis", onset: "06/02/2023" },
    { name: "Ischemic chest pain (CMS/HCC)", code: "I20.9", type: "Encounter Diagnosis", onset: "06/02/2023" },
    { name: "Pain aggravated by activities of daily living", code: "R52", type: "Encounter Diagnosis", onset: "05/21/2023" },
    { name: "PCOS (polycystic ovarian syndrome)", code: "E28.2", status: "active", type: "Encounter Diagnosis", onset: "09/20/2005" },
    { name: "CYP2B6 Intermediate Metabolizer", type: "Genomic Indicators", onset: "03/22/2023" },
    { name: "CYP2C9*6: AA (wildtype)", type: "Genomic Indicators", onset: "03/22/2023" },
  ].map((c) => ({ code: "", status: "", updated: "", source: "Epic", ...c }));

  const allergies = [];

  const appointments = [
    ["Nov 05, 2026", "08:00 PM", "08:30 PM"], ["Nov 09, 2026", "09:30 PM", "10:00 PM"],
    ["Nov 10, 2026", "02:00 PM", "02:30 PM"], ["Nov 11, 2026", "02:00 PM", "02:30 PM"],
    ["Nov 11, 2026", "02:30 PM", "03:00 PM"], ["Nov 11, 2026", "05:00 PM", "05:30 PM"],
    ["Nov 11, 2026", "05:30 PM", "06:00 PM"], ["Nov 11, 2026", "09:00 PM", "09:30 PM"],
    ["Nov 11, 2026", "09:30 PM", "10:00 PM"], ["Nov 12, 2026", "02:30 PM", "03:00 PM"],
    ["Nov 12, 2026", "05:15 PM", "05:45 PM"], ["Nov 12, 2026", "08:00 PM", "08:30 PM"],
    ["Nov 12, 2026", "08:30 PM", "09:00 PM"], ["Nov 12, 2026", "09:00 PM", "09:30 PM"],
    ["Nov 12, 2026", "09:30 PM", "10:00 PM"],
  ].map(([date, start, end]) => ({ date, start, end, status: "Scheduled" }));

  const carePlans = [
    {
      name: "Plan for Patient Care",
      status: "active",
      owner: "Physician Family Medicine, MD",
      source: "Epic",
      problems: ["PCOS (polycystic ovarian syndrome)"],
      goals: ["Eat 3 meals every day", "Increase physical activity"],
      orders: [{ name: "TISSUE EXAM", start: "N/A", end: "N/A", status: "Unknown" }],
      appointments,
    },
  ];

  const goals = [
    ["Food and/or Nutrient Delivery (ND)", "NUTRITION"],
    ["Nutrition Education (E)", "NUTRITION"],
    ["Nutrition Counseling (C)", "NUTRITION"],
    ["Coordination of Nutrition Care by a Nutrition Professional (RC)", "NUTRITION"],
    ["Verbalizes/displays adequate comfort level or baseline comfort level", ""],
    ["Absence of infection during hospitalization", ""],
    ["Absence of fever/infection during anticipated neutropenic period", ""],
    ["Free from fall injury", ""],
    ["Discharge to home or other facility with appropriate resources", ""],
    ["Patient's chronic conditions and co-morbidity symptoms are monitored and maintained or improved", "INTERDISCIPLINARY"],
    ["Eat 3 meals every day", "Mustafa Zaidi"],
    ["Increase physical activity", "Mustafa Zaidi"],
  ].map(([goal, owner]) => ({ goal, owner, target: "", progress: "active", due: "", source: "Epic" }));

  const DOC_GROUPS = [
    ["Progress Notes", "11/05/2026", 2], ["ED Notes", "11/05/2026", 1],
    ["Progress Notes", "11/04/2026", 21], ["Consults", "11/04/2026", 2],
    ["Progress Notes", "11/03/2026", 9], ["Consults", "11/03/2026", 4], ["Nursing Note", "11/03/2026", 2],
    ["Progress Notes", "11/02/2026", 19], ["ED Notes", "11/02/2026", 3], ["Consults", "11/02/2026", 1],
    ["Progress Notes", "05/21/2023", 1], ["Patient Instructions", "01/06/2023", 1],
    ["Progress Notes", "11/09/2020", 1], ["Nursing Note", "11/06/2020", 1],
    ["Nursing Note", "11/03/2020", 1], ["Consults", "11/02/2020", 2],
  ];
  const documents = DOC_GROUPS.flatMap(([type, date, n]) =>
    Array.from({ length: n }, () => ({ name: type, type, date, source: "Epic", added: "" })));

  /* ---------- Markup ---------- */
  EHR_TABS.forEach((t) => {
    const span = document.createElement("span");
    span.className = "subtab";
    span.dataset.subtab = t.key;
    span.textContent = t.label;
    subtabsEl.appendChild(span);
  });

  /* "Last synced + Sync" sits inline in the subtab row for EHR views */
  const syncMeta = document.createElement("div");
  syncMeta.className = "clinical-head-actions ehr-sync-meta";
  syncMeta.style.display = "none";
  syncMeta.innerHTML = `
    <span class="ehr-sync-meta-text">Last synced <strong class="ehr-sync-time">11/05/2026, 01:16 PM</strong></span>
    <button type="button" class="btn-secondary btn-sync">
      <svg class="sync-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>
      <span class="btn-sync-label">Sync</span>
    </button>`;
  subRow.appendChild(syncMeta);

  /* Manual / EHR Medication switch on the legend's row */
  const legend = medPanel.querySelector(".med-legend");
  const medList = medPanel.querySelector("#medList");
  const sourceRow = document.createElement("div");
  sourceRow.className = "med-source-row";
  sourceRow.innerHTML = `
    <div class="unit-toggle" role="group" aria-label="Medication source">
      <span class="active" role="button" tabindex="0" data-med-source="manual" aria-pressed="true">Manual</span>
      <span role="button" tabindex="0" data-med-source="ehr" aria-pressed="false">EHR Medication (${ehrMedications.length})</span>
    </div>`;
  if (legend) {
    legend.before(sourceRow);
    sourceRow.appendChild(legend);
  } else {
    medPanel.prepend(sourceRow);
  }
  const ehrMedWrap = document.createElement("div");
  ehrMedWrap.hidden = true;
  ehrMedWrap.className = "ehr-med-wrap";
  ehrMedWrap.innerHTML = table("ehrMedTableBody", ["Medication", "Dosage", "Status", "Prescribed Date", "Prescriber", "Source"]);
  (medList || sourceRow).after(ehrMedWrap);

  const COLS = {
    conditions: ["Condition", "Diagnosis Code", "Status", "Type", "Onset Date", "Source", "Last Updated"],
    allergies: ["Allergen", "Reaction", "Severity", "Onset Date", "Source", "Last Updated"],
    "care-plan": ["Care Plan", "Status", "Start Date", "Review Date", "Owner", "Source"],
    goals: ["Goal", "Target", "Progress", "Target Date", "Owner", "Source"],
    documents: ["Document", "Type", "Document Date", "Source", "Added", ""],
  };
  EHR_TABS.forEach((t) => {
    const p = document.createElement("div");
    p.className = "subtab-panel";
    p.dataset.subpanel = t.key;
    p.innerHTML = table(`ehr-${t.key}-body`, COLS[t.key]);
    panel.appendChild(p);
  });
  const body = (key) => document.getElementById(`ehr-${key}-body`);

  /* Designated Contact: the emergency contact captured when the patient was
     registered (Relationship, name, email, phone). Not EHR-synced. */
  const designatedContacts = [
    { name: "Robert White", relationship: "Spouse", phone: "+972 52 555 0199", email: "robert.white@gmail.com" },
  ];
  const dcTab = document.createElement("span");
  dcTab.className = "subtab";
  dcTab.dataset.subtab = "designated-contact";
  dcTab.textContent = "Designated Contact";
  subtabsEl.appendChild(dcTab);
  const dcPanel = document.createElement("div");
  dcPanel.className = "subtab-panel";
  dcPanel.dataset.subpanel = "designated-contact";
  dcPanel.innerHTML = table("designatedContactBody", ["Name", "Relationship", "Phone", "Email"]);
  panel.appendChild(dcPanel);
  document.getElementById("designatedContactBody").innerHTML = designatedContacts.length
    ? designatedContacts.map((c) => `
      <tr>
        <td><span class="rec-title-cell">${c.name}</span></td>
        <td>${c.relationship}</td>
        <td>${c.phone}</td>
        <td>${c.email}</td>
      </tr>`).join("")
    : `<tr><td colspan="4" class="rec-empty">No designated contact on file.</td></tr>`;

  /* ---------- Renderers ---------- */
  document.getElementById("ehrMedTableBody").innerHTML = ehrMedications
    .map((m) => `
      <tr>
        <td><span class="rec-title-cell">${m.name}</span></td>
        <td class="rec-cell-wide">${m.dosage}</td>
        <td>${statusText(m.status)}</td>
        <td>${m.prescribed}</td>
        <td>${m.prescriber}</td>
        <td>${sourceCell(m.source)}</td>
      </tr>`)
    .join("");

  body("conditions").innerHTML = conditions
    .map((c) => `
      <tr>
        <td><span class="rec-title-cell">${c.name}</span></td>
        <td>${orDash(c.code)}</td>
        <td>${statusText(c.status)}</td>
        <td>${c.type}</td>
        <td>${c.onset}</td>
        <td>${sourceCell(c.source)}</td>
        <td>${orDash(c.updated)}</td>
      </tr>`)
    .join("");

  body("allergies").innerHTML = allergies.length
    ? allergies.map((a) => `
      <tr>
        <td><span class="rec-title-cell">${a.allergen}</span></td>
        <td>${a.reaction}</td>
        <td>${statusText(a.severity)}</td>
        <td>${orDash(a.onset)}</td>
        <td>${sourceCell(a.source)}</td>
        <td>${orDash(a.updated)}</td>
      </tr>`).join("")
    : `<tr><td colspan="6" class="rec-empty">No records found.</td></tr>`;

  /* Care plan: one-line summary; details expand into a compact two-column row */
  const list = (items) => `<ul class="cp-list">${items.map((t) => `<li>${t}</li>`).join("")}</ul>`;
  body("care-plan").innerHTML = carePlans
    .map((p, i) => `
      <tr>
        <td>
          <span class="rec-title-cell">${p.name}</span>
          <span class="cp-summary">${p.problems.length} active problem · ${p.goals.length} goals · ${p.orders.length} procedure order · ${p.appointments.length} upcoming appointments</span>
          <button type="button" class="cp-toggle" aria-expanded="false" aria-controls="ehrCpDetail${i}" data-cp="${i}">Show details</button>
        </td>
        <td>${statusText(p.status)}</td>
        <td>${dash}</td>
        <td>${dash}</td>
        <td>${p.owner}</td>
        <td>${sourceCell(p.source)}</td>
      </tr>
      <tr class="cp-detail-row" id="ehrCpDetail${i}" hidden>
        <td colspan="6">
          <div class="cp-detail">
            <div class="cp-col">
              <h4 class="cp-h">Active Problems</h4>${list(p.problems)}
              <h4 class="cp-h">Goals</h4>${list(p.goals)}
              <h4 class="cp-h">Upcoming Procedure Orders</h4>
              ${list(p.orders.map((o) => `${o.name} <span class="cp-sub">Start ${o.start} · End ${o.end} · ${o.status}</span>`))}
            </div>
            <div class="cp-col">
              <h4 class="cp-h">Upcoming Appointments <span class="cp-sub">(${p.appointments.length}, UTC)</span></h4>
              <div class="cp-appts">
                ${p.appointments.map((a) => `<span class="cp-appt"><b>${a.date}</b> ${a.start} – ${a.end} <span class="cp-sub">${a.status}</span></span>`).join("")}
              </div>
            </div>
          </div>
        </td>
      </tr>`)
    .join("");
  panel.querySelectorAll(".cp-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.textContent = open ? "Show details" : "Hide details";
      document.getElementById(`ehrCpDetail${btn.dataset.cp}`).hidden = open;
    });
  });

  body("goals").innerHTML = goals
    .map((g) => `
      <tr>
        <td><span class="rec-title-cell">${g.goal}</span></td>
        <td>${orDash(g.target)}</td>
        <td>${statusText(g.progress)}</td>
        <td>${orDash(g.due)}</td>
        <td>${orDash(g.owner)}</td>
        <td>${sourceCell(g.source)}</td>
      </tr>`)
    .join("");

  /* Documents: latest 10 with a "Show all" footer instead of one very long page */
  const DOCS_PREVIEW = 10;
  let docsExpanded = false;
  function renderDocuments() {
    const rows = docsExpanded ? documents : documents.slice(0, DOCS_PREVIEW);
    body("documents").innerHTML =
      rows
        .map((d) => `
      <tr>
        <td><span class="rec-title-cell">${d.name}</span></td>
        <td>${d.type}</td>
        <td>${d.date}</td>
        <td>${sourceCell(d.source)}</td>
        <td>${orDash(d.added)}</td>
        <td><button type="button" class="btn-open">View</button></td>
      </tr>`)
        .join("") +
      (documents.length > DOCS_PREVIEW
        ? `<tr class="rec-more-row"><td colspan="6"><button type="button" class="rec-more-btn">${docsExpanded ? "Show fewer" : `Show all ${documents.length} documents`}</button></td></tr>`
        : "");
    body("documents").querySelector(".rec-more-btn")?.addEventListener("click", () => {
      docsExpanded = !docsExpanded;
      renderDocuments();
    });
  }
  renderDocuments();

  /* ---------- Behaviour ---------- */
  let medSource = "manual";
  const medActions = document.getElementById("medSubtabActions");
  const careRecActions = document.getElementById("careRecSubtabActions");

  function syncHead() {
    const active = panel.querySelector(".subtab.active")?.dataset.subtab;
    const isEhrView = EHR_KEYS.includes(active) || (active === "medication" && medSource === "ehr");
    syncMeta.style.display = isEhrView ? "flex" : "none";
    if (medActions) medActions.style.display = active === "medication" && medSource === "manual" ? "flex" : "none";
    if (careRecActions) careRecActions.style.display = active === "care-rec" ? "flex" : "none";
  }

  function applyMedSource() {
    const isEhr = medSource === "ehr";
    sourceRow.querySelectorAll("[data-med-source]").forEach((b) => {
      b.classList.toggle("active", b.dataset.medSource === medSource);
      b.setAttribute("aria-pressed", String(b.dataset.medSource === medSource));
    });
    if (medList) medList.hidden = isEhr;
    if (legend) legend.hidden = isEhr;
    ehrMedWrap.hidden = !isEhr;
    syncHead();
  }
  const commercialNote = document.createElement("p");
  commercialNote.className = "med-commercial-note";
  commercialNote.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M12 11v5.5M12 7.6v.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    The medication information in this area was entered by the patient. The clinic has not verified it.`;
  sourceRow.prepend(commercialNote);
  document.addEventListener("orgtypechange", () => {
    if (window.isCommercialOrg && isCommercialOrg() && medSource !== "manual") {
      medSource = "manual";
      applyMedSource();
    }
  });

  sourceRow.querySelectorAll("[data-med-source]").forEach((b) => {
    const pick = () => { medSource = b.dataset.medSource; applyMedSource(); };
    b.addEventListener("click", pick);
    b.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
    });
  });

  /* The page script wired its own handler onto the original subtabs before
     these were added, so the new ones get the same open/close behaviour here. */
  panel.querySelectorAll(".subtab").forEach((tab) => {
    if (EHR_KEYS.includes(tab.dataset.subtab) || tab.dataset.subtab === "designated-contact") {
      tab.addEventListener("click", () => {
        panel.querySelectorAll(".subtab").forEach((t) => t.classList.remove("active"));
        panel.querySelectorAll(".subtab-panel").forEach((p) => p.classList.remove("open"));
        tab.classList.add("active");
        panel.querySelector(`.subtab-panel[data-subpanel="${tab.dataset.subtab}"]`).classList.add("open");
        syncHead();
      });
    } else {
      /* runs after the page's own handler resets the head actions */
      tab.addEventListener("click", () => setTimeout(syncHead, 0));
    }
  });

  const syncBtn = syncMeta.querySelector(".btn-sync");
  syncBtn.addEventListener("click", () => {
    if (syncBtn.classList.contains("is-syncing")) return;
    syncBtn.classList.add("is-syncing");
    syncBtn.querySelector(".btn-sync-label").textContent = "Syncing…";
    setTimeout(() => {
      syncBtn.classList.remove("is-syncing");
      syncBtn.querySelector(".btn-sync-label").textContent = "Sync";
      syncMeta.querySelector(".ehr-sync-time").textContent = "Just now";
    }, 900);
  });
})();
