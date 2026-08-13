const warnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#23272E"/><rect x="11" y="7" width="2" height="7" rx="1" fill="#fff"/><rect x="11" y="15.5" width="2" height="2" rx="1" fill="#fff"/></svg>`;
const pencilIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 20H21" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16.5 3.5C17.3 2.7 18.6 2.7 19.4 3.5C20.2 4.3 20.2 5.6 19.4 6.4L7 18.8L3 20L4.2 16L16.5 3.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
const kebabIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="5" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="19" r="1.7" fill="currentColor"/></svg>`;

const billingList = [
  { name: "Sara White",    id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Dan Vax",       id: "857 125 968", enrolled: "05.14.2023", time: "40 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { name: "Marik Shmil",   id: "857 125 968", enrolled: "05.14.2023", time: "25 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Alex Martin",   id: "857 125 968", enrolled: "05.14.2023", time: "43 Min", status: "ready",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"} ] },
  { name: "Jonathan Flux", id: "857 125 968", enrolled: "05.14.2023", time: "20 Min", status: "not",
    codes: [ {t:"pending"}, {t:"not", sub:"Complete on 01.01.2026", warn:true}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Igor Moris",    id: "857 125 968", enrolled: "05.14.2023", time: "23 Min", status: "not",
    codes: [ {t:"na"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sara Apple",    id: "857 125 968", enrolled: "05.14.2023", time: "12 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Abe Lol",       id: "857 125 968", enrolled: "05.14.2023", time: "15 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Annie Jow",     id: "857 125 968", enrolled: "05.14.2023", time: "16 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sandra Sade",   id: "857 125 968", enrolled: "05.14.2023", time: "8 Min",  status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "John Dillan",   id: "857 125 968", enrolled: "05.14.2023", time: "11 Min", status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
  { name: "Sara Prker",    id: "857 125 968", enrolled: "05.14.2023", time: "9 Min",  status: "not",
    codes: [ {t:"eligible", sub:"Setup on 01.01.2026"}, {t:"eligible", sub:"Complete on 01.01.2026"}, {t:"not", sub:"Insufficient time log"}, {t:"not", sub:"Insufficient time log"} ] },
];

function codeCell(c) {
  if (c.t === "eligible") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-eligible">Eligible</span><span class="elig-sub">${c.sub}</span></div>`;
  }
  if (c.t === "not") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-not">${c.warn ? warnIcon + " " : ""}Not Eligible</span><span class="elig-sub">${c.sub}</span></div>`;
  }
  if (c.t === "pending") {
    return `<div class="bill-elig-cell"><span class="elig-label elig-pending">Pending</span></div>`;
  }
  return `<div class="bill-elig-cell"><span class="elig-label elig-pending">N/A</span></div>`;
}

function statusCell(status) {
  return status === "ready"
    ? `<span class="bill-status bill-status-ready">Ready for billing</span>`
    : `<span class="bill-status bill-status-not">Not eligible</span>`;
}

const rowsEl = document.getElementById("billingRows");
rowsEl.innerHTML = billingList
  .map(
    (b) => `
    <tr>
      <td><span class="bill-checkbox row-check"></span></td>
      <td><span class="lt-name active-name">${b.name}</span></td>
      <td>${b.id}</td>
      <td>${b.enrolled}</td>
      <td>${codeCell(b.codes[0])}</td>
      <td>${codeCell(b.codes[1])}</td>
      <td>${codeCell(b.codes[2])}</td>
      <td>${codeCell(b.codes[3])}</td>
      <td>${b.time}</td>
      <td>${statusCell(b.status)}</td>
      <td>
        <div class="action-cell">
          <button class="action-icon" aria-label="Edit">${pencilIcon}</button>
          <button class="action-icon kebab" aria-label="More">${kebabIcon}</button>
        </div>
      </td>
    </tr>`
  )
  .join("");

document.querySelectorAll(".bill-checkbox").forEach((box) => {
  box.addEventListener("click", () => box.classList.toggle("checked"));
});

document.getElementById("selectAllBox").addEventListener("click", function () {
  const checked = this.classList.contains("checked");
  document.querySelectorAll(".row-check").forEach((box) => box.classList.toggle("checked", checked));
});

document.getElementById("clearFilters").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
});
