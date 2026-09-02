/* ---------------- Shared patient directory (used by Patient Management + Patient Dashboard) ----------------
   creationDate/startDate/baselineCompletedDate/followUpDate/leavingDate mirror
   the lifecycle milestones tracked on the legacy patient list; baseline/follow-up
   are left blank for patients who never completed baseline (usableCompliance null),
   matching that older screen's behavior. */
const patients = [
  { username: "120-2001", algo: "", lang: "HE", tag: "CUR", creationDate: "31/10/2023", startDate: "01/11/2023", baselineCompletedDate: "15/11/2023", followUpDate: "16/11/2023", leavingDate: "25/09/2024", status: "Registered", statusStart: "31/10/2023", lastAppVersion: "1.0.1.0", lastPhoneModel: "22101316UC", lastSession: "25/09/2024", lastSignIn: "25/09/2024", usableCompliance: 91.82, compliance: 92.12, active: true, appVersion: "3.4.1", phoneModel: "iPhone 13", environment: "Production" },
  { username: "120-2002", algo: "", lang: "EN", tag: "CUR", creationDate: "02/11/2023", startDate: "03/11/2023", baselineCompletedDate: "21/11/2023", followUpDate: "22/11/2023", leavingDate: "25/09/2024", status: "Registered", statusStart: "02/11/2023", lastAppVersion: "1.0.1.0", lastPhoneModel: "SMA346E", lastSession: "25/09/2024", lastSignIn: "25/09/2024", usableCompliance: 72.26, compliance: 72.26, active: true, appVersion: "3.4.1", phoneModel: "Galaxy S21", environment: "Production" },
  { username: "120-2003", algo: "", lang: "HE", tag: "CUR", creationDate: "12/11/2023", startDate: "", baselineCompletedDate: "", followUpDate: "", leavingDate: "13/11/2023", status: "Registered", statusStart: "12/11/2023", lastAppVersion: "2.1.2.0", lastPhoneModel: "M2101K9AG", lastSession: "12/11/2023", lastSignIn: "12/11/2023", usableCompliance: null, compliance: null, active: true, appVersion: "3.3.0", phoneModel: "iPhone 12", environment: "Production" },
  { username: "120-2004", algo: "", lang: "HE", tag: "CUR", creationDate: "13/11/2023", startDate: "14/11/2023", baselineCompletedDate: "27/11/2023", followUpDate: "", leavingDate: "28/11/2023", status: "Registered", statusStart: "13/11/2023", lastAppVersion: "2.1.2.0", lastPhoneModel: "SMA525F", lastSession: "28/11/2023", lastSignIn: "11/02/2024", usableCompliance: 100, compliance: 100, active: true, appVersion: "3.4.1", phoneModel: "iPhone 14", environment: "Production" },
  { username: "120-2005", algo: "", lang: "HE", tag: "CUR", creationDate: "20/11/2023", startDate: "21/11/2023", baselineCompletedDate: "11/12/2023", followUpDate: "", leavingDate: "18/12/2023", status: "Registered", statusStart: "20/11/2023", lastAppVersion: "2.1.3.0", lastPhoneModel: "Redmi8", lastSession: "18/12/2023", lastSignIn: "18/12/2023", usableCompliance: 67.86, compliance: 67.86, active: true, appVersion: "3.2.7", phoneModel: "Galaxy S20", environment: "Production" },
  { username: "120-2006", algo: "", lang: "HE", tag: "CUR", creationDate: "20/11/2023", startDate: "21/11/2023", baselineCompletedDate: "", followUpDate: "", leavingDate: "28/11/2023", status: "Registered", statusStart: "20/11/2023", lastAppVersion: "2.1.2.0", lastPhoneModel: "SMA720F", lastSession: "20/11/2023", lastSignIn: "05/12/2023", usableCompliance: 0, compliance: null, active: false, appVersion: "3.2.7", phoneModel: "iPhone 11", environment: "Production" },
  { username: "120-2007", algo: "", lang: "HE", tag: "CUR", creationDate: "23/11/2023", startDate: "24/11/2023", baselineCompletedDate: "13/12/2023", followUpDate: "14/12/2023", leavingDate: "14/08/2024", status: "Registered", statusStart: "23/11/2023", lastAppVersion: "1.0.1.0", lastPhoneModel: "SMN985F", lastSession: "10/07/2024", lastSignIn: "10/07/2024", usableCompliance: 56.23, compliance: 57.74, active: true, appVersion: "3.4.1", phoneModel: "Pixel 7", environment: "Production" },
  { username: "121-2001", algo: "", lang: "AR", tag: "CUR", creationDate: "05/01/2024", startDate: "06/01/2024", baselineCompletedDate: "20/01/2024", followUpDate: "21/01/2024", leavingDate: "20/09/2024", status: "Active", statusStart: "05/01/2024", lastAppVersion: "1.0.1.0", lastPhoneModel: "iPhone 13", lastSession: "20/09/2024", lastSignIn: "20/09/2024", usableCompliance: 88.4, compliance: 89.1, active: true, appVersion: "3.4.1", phoneModel: "iPhone 13", environment: "Production" },
  { username: "121-2002", algo: "", lang: "AR", tag: "NEW", creationDate: "07/01/2024", startDate: "", baselineCompletedDate: "", followUpDate: "", leavingDate: "", status: "Registered", statusStart: "07/01/2024", lastAppVersion: "1.0.0.0", lastPhoneModel: "Galaxy S22", lastSession: "07/01/2024", lastSignIn: "07/01/2024", usableCompliance: null, compliance: null, active: true, appVersion: "3.4.0", phoneModel: "Galaxy S22", environment: "Staging" },
  { username: "122-2001", algo: "", lang: "EN", tag: "CUR", creationDate: "11/02/2024", startDate: "12/02/2024", baselineCompletedDate: "26/02/2024", followUpDate: "27/02/2024", leavingDate: "21/09/2024", status: "Priority", statusStart: "11/02/2024", lastAppVersion: "1.0.0.0", lastPhoneModel: "iPhone 12", lastSession: "21/09/2024", lastSignIn: "21/09/2024", usableCompliance: 41.3, compliance: 44.9, active: false, appVersion: "3.1.5", phoneModel: "iPhone 12", environment: "Staging" },
];

patients.forEach((p, i) => (p.id = i));

const PATIENT_TAGS = ["CUR", "NEW"];
const PATIENT_LANGUAGES = ["EN", "HE", "AR", "RU"];

/* Organization type replaces the old binary HMO/Non-HMO classification with
   three values -- Commercial, R&D, Study -- per client feedback. Keyed by
   the clinical site code (the prefix of a patient's username). */
const SITE_ORG_TYPE = { "120": "Commercial", "121": "Study", "122": "R&D" };
function patientOrgType(p) {
  return SITE_ORG_TYPE[p.username.split("-")[0]] || "Commercial";
}
