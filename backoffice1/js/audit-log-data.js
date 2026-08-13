/* ---------------- Audit Log sample data ---------------- */
const AL_ACTIONS = ["Sign In", "Sign Out", "Status Change", "Create Organization", "Edit Organization"];
const AL_ROLES = ["CLINIC USER", "SUPERVISOR", "CLINIC SUPERVISOR", "ADMIN"];
const AL_ORGS = ["120", "121", "122", "ATP", "B01"];

const auditLog = [
  { action: "Sign In", description: "Dr_Pranali Signed in Successfully", user: "Dr_Pranali", role: "CLINIC USER", org: "", usercode: "", time: "2026-08-13T19:43:00" },
  { action: "Sign In", description: "Pranali_supervisor Signed in Successfully", user: "Pranali_supervisor", role: "SUPERVISOR", org: "", usercode: "", time: "2026-08-13T19:35:00" },
  { action: "Sign In", description: "Pranali_supervisor Signed in Successfully", user: "Pranali_supervisor", role: "SUPERVISOR", org: "", usercode: "", time: "2026-08-13T19:35:00" },
  { action: "Sign Out", description: "user name : Dr_Pranali", user: "Dr_Pranali", role: "CLINIC USER", org: "", usercode: "", time: "2026-08-13T19:33:00" },
  { action: "Sign In", description: "Dr_Pranali Signed in Successfully", user: "Dr_Pranali", role: "CLINIC USER", org: "", usercode: "", time: "2026-08-13T19:32:00" },
  { action: "Sign In", description: "pranali_clinic Signed in Successfully", user: "pranali_clinic", role: "CLINIC SUPERVISOR", org: "", usercode: "", time: "2026-08-13T19:26:00" },
  { action: "Sign Out", description: "user name : Pranali_supervisor", user: "Pranali_supervisor", role: "SUPERVISOR", org: "", usercode: "", time: "2026-08-13T19:26:00" },
  { action: "Sign In", description: "Dr_Pranali Signed in Successfully", user: "Dr_Pranali", role: "CLINIC USER", org: "", usercode: "", time: "2026-08-13T19:26:00" },
  { action: "Sign In", description: "Pranali_supervisor Signed in Successfully", user: "Pranali_supervisor", role: "SUPERVISOR", org: "", usercode: "", time: "2026-08-13T19:18:00" },
  { action: "Status Change", description: "ABC-0044 status changed to Priority", user: "Dr_Pranali", role: "CLINIC USER", org: "120", usercode: "ABC-0044", time: "2026-08-13T18:52:00" },
  { action: "Edit Organization", description: "Organization 120 details updated", user: "pranali_clinic", role: "CLINIC SUPERVISOR", org: "120", usercode: "", time: "2026-08-13T18:40:00" },
  { action: "Create Organization", description: "Organization B01 created", user: "pranali_clinic", role: "CLINIC SUPERVISOR", org: "B01", usercode: "", time: "2026-08-13T18:10:00" },
];
