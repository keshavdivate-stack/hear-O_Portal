/* ---------------- Care Team Member roster (one row per member, counts of
   their patients across status/account/monitoring) ---------------- */
function memberInitials(name) {
  const clean = name.replace(/^Dr\.\s*/, "").replace(/,\s*(RN|NP)$/, "");
  const parts = clean.trim().split(/\s+/);
  return ((parts[0] || "")[0] + (parts[parts.length - 1] || "")[0]).toUpperCase();
}

let ctmSearchTerm = "";
const ctmSelectedMembers = new Set();

function filteredCtmMembers() {
  const q = ctmSearchTerm.toLowerCase();
  return ctmRoster.filter((m) => {
    if (ctmSelectedMembers.size && !ctmSelectedMembers.has(m.name)) return false;
    if (!q) return true;
    if (m.name.toLowerCase().includes(q)) return true;
    return ctmPatients.some((p) => p.teamMember === m.name && p.name.toLowerCase().includes(q));
  });
}

function renderCtmMembers() {
  const list = filteredCtmMembers();
  document.getElementById("ctmMemberRows").innerHTML = list
    .map((m) => {
      const patients = ctmPatients.filter((p) => p.teamMember === m.name);
      const count = (pred) => patients.filter(pred).length;
      return `
      <tr>
        <td>
          <div class="ctm-card-top">
            <span class="ctm-card-avatar">${memberInitials(m.name)}</span>
            <div>
              <div class="ctm-card-name">${m.name}</div>
              <div class="ctm-card-role">${m.role}</div>
            </div>
          </div>
        </td>
        <td class="ctm-count-col">${count((p) => p.status === "priority")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "active")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "registered")}</td>
        <td class="ctm-count-col">${count((p) => p.status === "baseline")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Enabled")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Paused")}</td>
        <td class="ctm-count-col">${count((p) => p.account === "Discontinued")}</td>
        <td class="ctm-count-col">${count((p) => p.monitoring === "monitored")}</td>
        <td class="ctm-count-col">${count((p) => p.monitoring === "unmonitored")}</td>
      </tr>`;
    })
    .join("");

  const total = list.length;
  document.getElementById("ctmPageRangeLabel").textContent = total ? `1 – ${total} of ${total}` : "0 of 0";
}

renderCtmMembers();

/* ---------------- Search ---------------- */
document.getElementById("ctmSearchInput").addEventListener("input", (e) => {
  ctmSearchTerm = e.target.value.trim();
  renderCtmMembers();
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
  renderCtmMembers();
});

document.getElementById("ctmClearFilters").addEventListener("click", () => {
  document.getElementById("ctmSearchInput").value = "";
  ctmSearchTerm = "";
  ctmSelectedMembers.clear();
  ctmTeamMemberMenu.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = false));
  ctmTeamMemberLabel.textContent = ctmTeamMemberBaseLabel;
  renderCtmMembers();
});
