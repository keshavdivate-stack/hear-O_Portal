/* Shared by the identity-check screens (Face ID, fingerprint, code).
   Entering the flow from "My Measurements" (measure-auth.html) stores where to
   go once the user is verified; every screen that ends a successful check
   calls completeAuth() instead of hard-coding a destination. */
const AUTH_NEXT_KEY = "hearo_auth_next";

function authGateActive() {
  return !!sessionStorage.getItem(AUTH_NEXT_KEY);
}

function completeAuth(fallbackUrl) {
  const next = sessionStorage.getItem(AUTH_NEXT_KEY);
  sessionStorage.removeItem(AUTH_NEXT_KEY);
  ["hearo_face_fail", "hearo_face_attempts", "hearo_fp_attempts"].forEach((k) => sessionStorage.removeItem(k));
  window.location.href = next || fallbackUrl;
}
