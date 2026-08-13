const priorityPatients = [
  { name: "Dan Gildon", since: "2 days | 01.08.2028" },
  { name: "Dan Volex", since: "2 days | 01.08.2028" },
  { name: "Mike Brown", since: "2 days | 01.08.2028" },
  { name: "Ariel Fox", since: "3 days | 01.07.2028" },
  { name: "Jeff Frank", since: "4 days | 01.06.2028" },
  { name: "Aric Snow", since: "8 days | 01.02.2028" },
  { name: "Jeff Bright", since: "8 days | 01.02.2028" },
  { name: "Sara Ericson", since: "9 days | 01.01.2028" },
];

const unmonitoredPatients = [
  { name: "Mike Brown", since: "1 days | 01.10.2028" },
  { name: "Jack Harris", since: "2 days | 01.09.2028" },
  { name: "Abraham Snow", since: "2 days | 01.09.2028" },
  { name: "Victor Fisher", since: "3 days | 01.08.2028" },
  { name: "Eric Roso", since: "5 days | 01.05.2028" },
  { name: "Ellen Boss", since: "6 days | 01.04.2028" },
];

const heartSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="#F16C6C"><path d="M12 21C12 21 4 15.5 4 9.8C4 6.6 6.5 4.5 9.2 4.5C10.6 4.5 11.6 5.1 12 5.7C12.4 5.1 13.4 4.5 14.8 4.5C17.5 4.5 20 6.6 20 9.8C20 15.5 12 21 12 21Z"/></svg>`;
const chevSvg = `<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#4A4F57" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const infoSvg = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#2AA9E0"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;

function renderPatientRows(elId, items, iconSvg) {
  document.getElementById(elId).innerHTML = items
    .map(
      (p) => `
      <tr>
        <td>
          <a class="p-name" href="patient-data.html" style="text-decoration:none;">
            ${chevSvg}
            ${iconSvg}
            <span class="p-name-text">${p.name}</span>
          </a>
        </td>
        <td class="p-since">${p.since}</td>
      </tr>`
    )
    .join("");
}

renderPatientRows("priorityRows", priorityPatients, heartSvg);
renderPatientRows("unmonitoredRows", unmonitoredPatients, infoSvg);

/* Priority / Unmonitored accordion: only one panel open at a time */
const accordionItems = [
  { btn: document.getElementById("priorityToggleBtn"), panel: document.getElementById("priorityPanel"), scrollId: "#priorityTableScroll", rows: 5 },
  { btn: document.getElementById("unmonToggleBtn"), panel: document.getElementById("unmonPanel"), scrollId: "#unmonTableScroll", rows: 6 },
];

function setAccordionExpanded(item, expanded) {
  item.btn.setAttribute("aria-expanded", String(expanded));
  item.panel.hidden = !expanded;
  if (expanded) fitTableToRows(item.scrollId, item.rows);
}

accordionItems.forEach((item) => {
  item.btn.addEventListener("click", () => {
    const wasExpanded = item.btn.getAttribute("aria-expanded") === "true";
    accordionItems.forEach((other) => setAccordionExpanded(other, other === item ? !wasExpanded : false));
  });
});

function refitExpandedAccordion() {
  const open = accordionItems.find((item) => item.btn.getAttribute("aria-expanded") === "true");
  if (open) fitTableToRows(open.scrollId, open.rows);
}

refitExpandedAccordion();
if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(refitExpandedAccordion);
}
window.addEventListener("load", refitExpandedAccordion);
