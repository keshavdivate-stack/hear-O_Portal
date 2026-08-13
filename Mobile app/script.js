document.addEventListener("DOMContentLoaded", () => {
  // Password visibility toggle
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const iconEye = togglePassword.querySelector(".icon-eye");
  const iconEyeOff = togglePassword.querySelector(".icon-eye-off");

  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    iconEye.style.display = isHidden ? "none" : "block";
    iconEyeOff.style.display = isHidden ? "block" : "none";
  });

  // Custom language select
  const selectWrapper = document.getElementById("languageSelect");
  const selectTrigger = document.getElementById("selectTrigger");
  const selectedLanguage = document.getElementById("selectedLanguage");
  const selectOptions = document.getElementById("selectOptions");
  const options = selectOptions.querySelectorAll("li");

  selectTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    selectWrapper.classList.toggle("open");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const value = option.getAttribute("data-value");
      selectedLanguage.textContent = value;

      options.forEach((o) => {
        o.classList.remove("selected");
        const checkSpan = o.querySelector(".check-space");
        if (checkSpan) checkSpan.outerHTML = '<span class="check-space"></span>';
      });

      option.classList.add("selected");
      const checkSpace = option.querySelector(".check-space");
      if (checkSpace) {
        checkSpace.outerHTML = `<svg class="check" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 8.5L6.2 11.5L13 4.5" stroke="#2f6fed" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      }

      selectWrapper.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (!selectWrapper.contains(e.target)) {
      selectWrapper.classList.remove("open");
    }
  });

  // Login form submit (demo) - any filled username/password succeeds
  const loginForm = document.querySelector(".login-form");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value.trim();
    const language = selectedLanguage.textContent;
    console.log("Login attempt:", { username, password, language });

    if (!username || !password) {
      window.location.href = "error.html";
      return;
    }

    if (!localStorage.getItem("hearo_privacy_accepted")) {
      window.location.href = "privacy.html";
    } else {
      window.location.href = "home.html";
    }
  });
});
