/* ---------------- Shared patient directory (used by Patient Management + Patient Dashboard) ---------------- */
const patients = [
  { username: "120-2001", lang: "HE", tag: "CUR", status: "Registered", statusStart: "31/10/2023", lastSession: "25/09/2024", usableCompliance: 91.82, compliance: 92.12, active: true, appVersion: "3.4.1", phoneModel: "iPhone 13", environment: "Production" },
  { username: "120-2002", lang: "EN", tag: "CUR", status: "Registered", statusStart: "02/11/2023", lastSession: "25/09/2024", usableCompliance: 72.26, compliance: 72.26, active: true, appVersion: "3.4.1", phoneModel: "Galaxy S21", environment: "Production" },
  { username: "120-2003", lang: "HE", tag: "NEW", status: "Registered", statusStart: "12/11/2023", lastSession: "12/11/2023", usableCompliance: null, compliance: null, active: true, appVersion: "3.3.0", phoneModel: "iPhone 12", environment: "Production" },
  { username: "120-2004", lang: "HE", tag: "CUR", status: "Active", statusStart: "13/11/2023", lastSession: "11/02/2024", usableCompliance: 100, compliance: 100, active: true, appVersion: "3.4.1", phoneModel: "iPhone 14", environment: "Production" },
  { username: "120-2005", lang: "HE", tag: "CUR", status: "Active", statusStart: "20/11/2023", lastSession: "18/12/2023", usableCompliance: 67.86, compliance: 67.86, active: true, appVersion: "3.2.7", phoneModel: "Galaxy S20", environment: "Production" },
  { username: "120-2006", lang: "HE", tag: "CUR", status: "Paused", statusStart: "20/11/2023", lastSession: "05/12/2023", usableCompliance: 0, compliance: null, active: false, appVersion: "3.2.7", phoneModel: "iPhone 11", environment: "Production" },
  { username: "120-2007", lang: "HE", tag: "CUR", status: "Priority", statusStart: "23/11/2023", lastSession: "10/07/2024", usableCompliance: 56.23, compliance: 57.74, active: true, appVersion: "3.4.1", phoneModel: "Pixel 7", environment: "Production" },
  { username: "121-2001", lang: "AR", tag: "CUR", status: "Active", statusStart: "05/01/2024", lastSession: "20/09/2024", usableCompliance: 88.4, compliance: 89.1, active: true, appVersion: "3.4.1", phoneModel: "iPhone 13", environment: "Production" },
  { username: "121-2002", lang: "AR", tag: "NEW", status: "Registered", statusStart: "07/01/2024", lastSession: "07/01/2024", usableCompliance: null, compliance: null, active: true, appVersion: "3.4.0", phoneModel: "Galaxy S22", environment: "Staging" },
  { username: "122-2001", lang: "EN", tag: "CUR", status: "Priority", statusStart: "11/02/2024", lastSession: "21/09/2024", usableCompliance: 41.3, compliance: 44.9, active: false, appVersion: "3.1.5", phoneModel: "iPhone 12", environment: "Staging" },
];

patients.forEach((p, i) => (p.id = i));

const PATIENT_TAGS = ["CUR", "NEW"];
const PATIENT_LANGUAGES = ["EN", "HE", "AR", "RU"];
