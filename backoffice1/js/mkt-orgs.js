/* ---------------- Shared organization list for the MKT Study/Summary dashboards ---------------- */
const MKT_ORG_LIST = [
  { id: "all", name: "MKT", code: "MKT" },
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

function mktRenderOrgSelect(elId, onChange) {
  const el = document.getElementById(elId);
  el.innerHTML = MKT_ORG_LIST.map((o) => `<option value="${o.id}">${o.name}</option>`).join("");
  el.addEventListener("change", () => onChange(el.value));
}
