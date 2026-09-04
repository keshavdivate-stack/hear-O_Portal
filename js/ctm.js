/* ---------------- Patient Status list ---------------- */
const statusLabels = {
  priority: { text: "Priority", cls: "status-priority" },
  active: { text: "Active", cls: "status-active" },
  registered: { text: "Registered", cls: "status-muted" },
  baseline: { text: "Baseline", cls: "status-muted" },
};

function ctmStatusCell(p) {
  const s = statusLabels[p.status];
  if (!s) return `<div class="status-cell"><span class="status-line status-muted">—</span></div>`;
  return `
    <div class="status-cell">
      <span class="status-line ${s.cls}">${s.text}</span>
      ${p.since ? `<span class="status-since">${p.since}</span>` : ""}
    </div>`;
}

function ctmMonitoringCell(p) {
  if (p.monitoring === "monitored") return `<div class="mon-cell"><span class="mon-line mon-monitored">Monitored</span></div>`;
  if (p.monitoring === "unmonitored") return `<div class="mon-cell"><span class="mon-line mon-unmonitored">Unmonitored</span></div>`;
  return `<div class="mon-cell"><span class="mon-line mon-none">None</span></div>`;
}

function ctmComplianceCell(p) {
  const cls = p.compliance >= 76 ? "status-active" : p.compliance >= 51 ? "mon-unmonitored" : "status-priority";
  return `<div class="mon-cell"><span class="mon-line ${cls}">${p.compliance}%</span></div>`;
}

let ctmSearchTerm = "";
const ctmSelectedMembers = new Set();

function filteredCtmPatients() {
  const q = ctmSearchTerm.toLowerCase();
  return ctmPatients.filter(
    (p) =>
      (!ctmSelectedMembers.size || ctmSelectedMembers.has(p.teamMember)) &&
      (!q || p.name.toLowerCase().includes(q) || p.teamMember.toLowerCase().includes(q))
  );
}

function renderCtmPatients() {
  const list = filteredCtmPatients();
  document.getElementById("ctmPatientRows").innerHTML = list
    .map(
      (p) => `
      <tr>
        <td>${p.name}</td>
        <td>${p.teamMember}</td>
        <td>${p.team}</td>
        <td>${ctmStatusCell(p)}</td>
        <td>${ctmMonitoringCell(p)}</td>
        <td>${ctmComplianceCell(p)}</td>
      </tr>`
    )
    .join("");

  const total = list.length;
  document.getElementById("ctmPageRangeLabel").textContent = total ? `1 – ${total} of ${total}` : "0 of 0";
}

renderCtmPatients();

/* ---------------- Search ---------------- */
document.getElementById("ctmSearchInput").addEventListener("input", (e) => {
  ctmSearchTerm = e.target.value.trim();
  renderCtmPatients();
});

/* ---------------- Care Team Member filter (portaled checkbox menu, mirrors patient-list.js) ---------------- */
const ctmTeamMemberMenu = document.getElementById("ctmTeamMemberMenu");
ctmTeamMemberMenu.innerHTML = ctmRoster
  .map((m) => `<label class="checkbox-filter-option"><input type="checkbox" value="${m.name}" />${m.name}</label>`)
  .join("");

const ctmPortaledMenus = new Map();

function positionCtmFilterMenu(trigger, menu) {
  const rect = trigger.getBoundingClientRect();
  const menuHeight = Math.min(menu.scrollHeight || 280, 280) + 12;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openUpward = spaceBelow < menuHeight && rect.top > menuHeight;

  menu.style.position = "fixed";
  menu.style.left = `${rect.left}px`;
  menu.style.minWidth = `${rect.width}px`;
  menu.style.top = openUpward ? "auto" : `${rect.bottom + 6}px`;
  menu.style.bottom = openUpward ? `${window.innerHeight - rect.top + 6}px` : "auto";
}

function openCtmFilterMenu(wrapEl, menuEl) {
  if (!ctmPortaledMenus.has(menuEl)) {
    ctmPortaledMenus.set(menuEl, { parent: menuEl.parentNode, next: menuEl.nextSibling });
  }
  document.body.appendChild(menuEl);
  menuEl.classList.add("checkbox-filter-menu-portaled");
  positionCtmFilterMenu(wrapEl.querySelector(".filter-btn"), menuEl);
}

function closeCtmFilterMenu(menuEl) {
  const original = ctmPortaledMenus.get(menuEl);
  if (original && menuEl.parentNode === document.body) {
    if (original.next && original.next.parentNode === original.parent) {
      original.parent.insertBefore(menuEl, original.next);
    } else {
      original.parent.appendChild(menuEl);
    }
  }
  menuEl.classList.remove("checkbox-filter-menu-portaled");
  menuEl.style.position = "";
  menuEl.style.left = "";
  menuEl.style.top = "";
  menuEl.style.bottom = "";
  menuEl.style.minWidth = "";
}

function closeAllCtmFilterPopovers() {
  document.querySelectorAll(".checkbox-filter.open").forEach((el) => el.classList.remove("open"));
  document.querySelectorAll(".checkbox-filter-menu-portaled").forEach((menuEl) => closeCtmFilterMenu(menuEl));
}

document.addEventListener("click", closeAllCtmFilterPopovers);

const ctmTeamMemberWrap = document.querySelector('.checkbox-filter[data-name="ctmTeamMember"]');
const ctmTeamMemberTrigger = ctmTeamMemberWrap.querySelector(".filter-btn");
const ctmTeamMemberLabel = ctmTeamMemberWrap.querySelector(".checkbox-filter-label");
const ctmTeamMemberBaseLabel = ctmTeamMemberLabel.textContent.trim();

ctmTeamMemberTrigger.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = !ctmTeamMemberWrap.classList.contains("open");
  closeAllCtmFilterPopovers();
  ctmTeamMemberWrap.classList.toggle("open", willOpen);
  if (willOpen) openCtmFilterMenu(ctmTeamMemberWrap, ctmTeamMemberMenu);
});

ctmTeamMemberMenu.addEventListener("click", (e) => e.stopPropagation());

ctmTeamMemberMenu.addEventListener("change", (e) => {
  const checkbox = e.target.closest('input[type="checkbox"]');
  if (!checkbox) return;
  if (checkbox.checked) ctmSelectedMembers.add(checkbox.value);
  else ctmSelectedMembers.delete(checkbox.value);
  ctmTeamMemberLabel.textContent = ctmSelectedMembers.size ? `${ctmTeamMemberBaseLabel} (${ctmSelectedMembers.size})` : ctmTeamMemberBaseLabel;
  renderCtmPatients();
});

document.getElementById("ctmClearFilters").addEventListener("click", () => {
  document.getElementById("ctmSearchInput").value = "";
  ctmSearchTerm = "";
  ctmSelectedMembers.clear();
  ctmTeamMemberMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  ctmTeamMemberLabel.textContent = ctmTeamMemberBaseLabel;
  renderCtmPatients();
});
