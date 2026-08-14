/* ---------------- Shared organization list for the MKT Study/Summary dashboards ---------------- */
const MKT_ORG_LIST = [
  { id: "all", name: "All Organizations", code: "MKT" },
  { id: "clalit-north", name: "HMO Clalit North", code: "CLN" },
  { id: "assuta-cardio", name: "Assuta Cardio", code: "ASC" },
  { id: "clalit-south", name: "Clalit South", code: "CLS" },
  { id: "maccabi-west", name: "Maccabi West", code: "MCW" },
  { id: "maccabi-east", name: "Maccabi East", code: "MCE" },
  { id: "b01-pilot", name: "B01 Pilot", code: "B01" },
];

function mktHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function mktScale(base, seed, spread = 0.5) {
  if (seed === 0) return base;
  const factor = 1 + (((seed % 100) / 100) * 2 - 1) * spread;
  return Math.max(0, Math.round(base * factor));
}

/* "A", "A & B", "A, B & C" ... falls back to a count once the list gets too long to read as a label. */
function mktOrgsLabel(sel) {
  if (sel.length === 1) return MKT_ORG_LIST.find((o) => o.id === sel[0]).name;
  if (sel.length > 3) return `${sel.length} organizations`;
  const names = sel.map((id) => MKT_ORG_LIST.find((o) => o.id === id).name);
  return names.length === 2 ? names.join(" & ") : `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/* Multi-select dropdown: "MKT" (the aggregate entry) is exclusive with the rest —
   picking a specific organization drops "MKT", and clearing every specific pick
   falls back to "MKT" so the widget is never left with an empty selection. */
function mktRenderOrgSelect(elId, onChange) {
  const root = document.getElementById(elId);
  let selected = ["all"];

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mkt-org-ms-btn";

  const panel = document.createElement("div");
  panel.className = "mkt-org-ms-panel";

  function labelFor(sel) {
    return mktOrgsLabel(sel);
  }

  function renderBtn() {
    btn.innerHTML = `
      <span class="mkt-org-ms-label">${labelFor(selected)}</span>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#6B7684" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  function renderPanel() {
    panel.innerHTML = MKT_ORG_LIST.map((o) => {
      const checked = selected.includes(o.id);
      return `
        <label class="mkt-org-ms-item${checked ? " checked" : ""}" data-id="${o.id}">
          <span class="mkt-org-ms-check">${
            checked
              ? '<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
              : ""
          }</span>
          <span class="mkt-org-ms-name">${o.name}</span>
        </label>`;
    }).join("");
  }

  function setSelected(next) {
    selected = next.length ? next : ["all"];
    renderBtn();
    renderPanel();
    onChange(selected);
  }

  panel.addEventListener("click", (e) => {
    // Stop here so the document-level "click outside" listener below never sees this click —
    // selecting an item re-renders the panel (replacing the clicked node), which would make
    // `root.contains(e.target)` false for the now-detached node and close the dropdown early.
    e.stopPropagation();
    const item = e.target.closest(".mkt-org-ms-item");
    if (!item) return;
    const id = item.dataset.id;
    if (id === "all") {
      setSelected(["all"]);
      return;
    }
    const withoutAll = selected.filter((s) => s !== "all");
    const next = withoutAll.includes(id) ? withoutAll.filter((s) => s !== id) : [...withoutAll, id];
    setSelected(next);
  });

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    root.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) root.classList.remove("open");
  });

  renderBtn();
  renderPanel();
  root.append(btn, panel);
  onChange(selected);
}
