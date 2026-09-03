(function () {
  var scale = localStorage.getItem("hearo_font_scale") || "1";
  document.documentElement.style.setProperty("--font-scale", scale);
})();
