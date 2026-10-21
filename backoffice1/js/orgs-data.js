/* ---------------- Shared Organizations data (used by organizations.html + org-profile.html) ---------------- */
const orgs = [
  { name: "120", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "052-2221836", latLng: "32.09 / 34.87", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["Epic"] },
  { name: "121", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "08-6745431", latLng: "31.66 / 34.56", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["Athena", "ECW"] },
  { name: "122", tag: "CURRENT", study: "CHF", isHmo: true, type: "Study", target: 50, dateCreated: "06/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "052-4498910", latLng: "31.24 / 34.8", docPath: "", updateSent: "01/01/0001", lng: "EN", ehr: [] },
  { name: "240", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 40, dateCreated: "24/04/2022", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "41.83 / -72.55", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["Epic"] },
  { name: "241", tag: "CURRENT", study: "CHF", isHmo: true, type: "R&D", target: 40, dateCreated: "03/05/2022", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "33.976242 / -84.230833", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["Athena"] },
  { name: "242", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "25.77214 / -80.193665", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["ECW", "Epic"] },
  { name: "243", tag: "CURRENT", study: "CHF", isHmo: true, type: "Study", target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "25.77214 / -80.193665", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: [] },
  { name: "244", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 50, dateCreated: "12/06/2023", onDashboard: true, careRec: false, authType: "Patient Self Report", phone: "+18778990636", latLng: "26.599016 / -81.877922", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: ["Athena", "Epic"] },
  { name: "ASF", tag: "CURRENT", study: "CHF", isHmo: true, type: "R&D", target: 10, dateCreated: "11/03/2021", onDashboard: false, careRec: false, authType: "Patient Self Report", phone: "", latLng: "31.95977 / 34.775", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: [] },
  { name: "ATP", tag: "CURRENT", study: "CHF", isHmo: false, type: "Study", target: 0, dateCreated: "14/08/2019", onDashboard: true, careRec: true, authType: "Patient Self Report", phone: "0542199636", latLng: "0 / 0", docPath: "EU/1.0", updateSent: "01/01/0001", lng: "ES", ehr: ["Athena", "ECW", "Epic"] },
  { name: "B01", tag: "CURRENT", study: "CHF", isHmo: true, type: "Commercial", target: 50, dateCreated: "26/06/2024", onDashboard: true, careRec: false, authType: "Patient Clinic Report", phone: "0545030772", latLng: "32.45105 / 34.9", docPath: "EU/1.0", updateSent: "01/01/0001", lng: "ES", ehr: ["ECW"] },
  { name: "B02", tag: "LEGACY", study: "CHF", isHmo: true, type: "Study", target: 30, dateCreated: "18/02/2020", onDashboard: false, careRec: false, authType: "Patient Self Report", phone: "052-7714420", latLng: "32.08 / 34.78", docPath: "", updateSent: "01/01/0001", lng: "AR", ehr: [], archived: true },
  { name: "DEV", tag: "TEST", study: "CHF", isHmo: false, type: "R&D", target: 5, dateCreated: "09/11/2019", onDashboard: false, careRec: false, authType: "Patient Self Report", phone: "", latLng: "0 / 0", docPath: "", updateSent: "01/01/0001", lng: "EN", ehr: [], archived: true },
  { name: "IGO", tag: "LEGACY", study: "CHF", isHmo: true, type: "Commercial", target: 20, dateCreated: "22/07/2021", onDashboard: false, careRec: false, authType: "Patient Clinic Report", phone: "03-6091200", latLng: "32.06 / 34.77", docPath: "EU/1.0", updateSent: "01/01/0001", lng: "AR", ehr: ["Athena"], archived: true },
];

orgs.forEach((o, i) => (o.id = i));

/* Organization Time Zone (IANA id) -- each org's own zone, used for
   algorithm-related processing (daily recording windows, compliance
   calculations). Offsets shown are standard time (no DST); Israel is
   listed first since most organizations are Israeli. */
const ORG_TIME_ZONES = [
  ["Asia/Jerusalem", "+02:00"],
  ["Pacific/Honolulu", "-10:00"],
  ["America/Anchorage", "-09:00"],
  ["America/Los_Angeles", "-08:00"],
  ["America/Denver", "-07:00"],
  ["America/Phoenix", "-07:00"],
  ["America/Chicago", "-06:00"],
  ["America/Mexico_City", "-06:00"],
  ["America/New_York", "-05:00"],
  ["America/Toronto", "-05:00"],
  ["America/Bogota", "-05:00"],
  ["America/Halifax", "-04:00"],
  ["America/Sao_Paulo", "-03:00"],
  ["America/Argentina/Buenos_Aires", "-03:00"],
  ["UTC", "+00:00"],
  ["Europe/London", "+00:00"],
  ["Europe/Lisbon", "+00:00"],
  ["Africa/Lagos", "+01:00"],
  ["Europe/Berlin", "+01:00"],
  ["Europe/Madrid", "+01:00"],
  ["Europe/Paris", "+01:00"],
  ["Europe/Rome", "+01:00"],
  ["Africa/Cairo", "+02:00"],
  ["Africa/Johannesburg", "+02:00"],
  ["Europe/Athens", "+02:00"],
  ["Europe/Kyiv", "+02:00"],
  ["Asia/Riyadh", "+03:00"],
  ["Europe/Istanbul", "+03:00"],
  ["Europe/Moscow", "+03:00"],
  ["Asia/Dubai", "+04:00"],
  ["Asia/Karachi", "+05:00"],
  ["Asia/Kolkata", "+05:30"],
  ["Asia/Dhaka", "+06:00"],
  ["Asia/Bangkok", "+07:00"],
  ["Asia/Shanghai", "+08:00"],
  ["Asia/Singapore", "+08:00"],
  ["Asia/Tokyo", "+09:00"],
  ["Australia/Sydney", "+10:00"],
  ["Pacific/Auckland", "+12:00"],
].map(([id, offset]) => ({ id, label: `(UTC${offset}) ${id}` }));

