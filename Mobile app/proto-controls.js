/* Prototype control (not part of the app UI): the App version switch,
   Demo / Commercial, pinned to the top-right of the laptop screen outside
   the phone frame. Saved in localStorage ("hearo_app_version"); switching
   reloads the screen so it re-renders for that version. Hidden on phone-
   sized viewports, where the phone frame fills the screen. */
(function () {
  var KEY = "hearo_app_version";
  var VERSIONS = [["demo", "Demo"], ["commercial", "Commercial"]];

  function current() {
    try { return localStorage.getItem(KEY) === "commercial" ? "commercial" : "demo"; } catch (e) { return "demo"; }
  }

  var css =
    ".proto-ctl{position:fixed;top:16px;right:16px;z-index:1000;padding:12px 14px;border-radius:14px;background:#fff;" +
    "box-shadow:0 8px 24px rgba(20,30,50,.16);font-family:Inter,system-ui,sans-serif;}" +
    ".proto-ctl-title{margin:0 0 2px;font-size:13px;font-weight:700;color:#252424;}" +
    ".proto-ctl-sub{margin:0 0 10px;font-size:12px;color:#57626D;}" +
    ".proto-ctl-seg{display:flex;gap:4px;padding:4px;border-radius:10px;background:#F0F1F1;}" +
    ".proto-ctl-seg button{flex:1;min-width:92px;height:34px;padding:0 12px;border:none;border-radius:8px;background:transparent;" +
    "font-family:inherit;font-size:14px;font-weight:600;color:#3D3B3B;cursor:pointer;}" +
    ".proto-ctl-seg button[aria-checked=true]{background:#186DCE;color:#fff;}" +
    ".proto-ctl-reset{display:block;width:100%;margin-top:10px;padding:0;border:none;background:none;font-family:inherit;font-size:12px;font-weight:600;color:#186DCE;text-align:left;cursor:pointer;}" +
    "@media (max-width:600px){.proto-ctl{display:none;}}";

  function mount() {
    var style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);

    var box = document.createElement("div");
    box.className = "proto-ctl";
    box.innerHTML =
      '<p class="proto-ctl-title">Prototype controls</p>' +
      '<p class="proto-ctl-sub">App version</p>' +
      '<div class="proto-ctl-seg" role="radiogroup" aria-label="App version">' +
      VERSIONS.map(function (v) {
        return '<button type="button" role="radio" data-version="' + v[0] + '" aria-checked="' + (v[0] === current()) + '">' + v[1] + "</button>";
      }).join("") +
      "</div>" +
      "<button type=\"button\" class=\"proto-ctl-reset\" data-reset-meds>Reset My Meds to sample data</button>";
    box.addEventListener("click", function (e) {
      if (e.target.closest("[data-reset-meds]")) {
        try { localStorage.removeItem("hearo_my_meds_v1"); } catch (err) {}
        location.reload();
        return;
      }
      var b = e.target.closest("[data-version]");
      if (!b || b.dataset.version === current()) return;
      try { localStorage.setItem(KEY, b.dataset.version); } catch (err) {}
      location.reload();
    });
    document.body.appendChild(box);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
