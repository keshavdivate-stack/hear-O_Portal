/* ---------------- Shared patient directory (used by Patient Management + Patient Dashboard) ---------------- */
const patients = [
  { username: "120-2001", lang: "HE", tag: "CUR", status: "Registered", statusStart: "31/10/2023", lastSession: "25/09/2024", usableCompliance: 91.82, compliance: 92.12 },
  { username: "120-2002", lang: "EN", tag: "CUR", status: "Registered", statusStart: "02/11/2023", lastSession: "25/09/2024", usableCompliance: 72.26, compliance: 72.26 },
  { username: "120-2003", lang: "HE", tag: "CUR", status: "Registered", statusStart: "12/11/2023", lastSession: "12/11/2023", usableCompliance: null, compliance: null },
  { username: "120-2004", lang: "HE", tag: "CUR", status: "Active", statusStart: "13/11/2023", lastSession: "11/02/2024", usableCompliance: 100, compliance: 100 },
  { username: "120-2005", lang: "HE", tag: "CUR", status: "Active", statusStart: "20/11/2023", lastSession: "18/12/2023", usableCompliance: 67.86, compliance: 67.86 },
  { username: "120-2006", lang: "HE", tag: "CUR", status: "Paused", statusStart: "20/11/2023", lastSession: "05/12/2023", usableCompliance: 0, compliance: null },
  { username: "120-2007", lang: "HE", tag: "CUR", status: "Priority", statusStart: "23/11/2023", lastSession: "10/07/2024", usableCompliance: 56.23, compliance: 57.74 },
  { username: "121-2001", lang: "AR", tag: "CUR", status: "Active", statusStart: "05/01/2024", lastSession: "20/09/2024", usableCompliance: 88.4, compliance: 89.1 },
  { username: "121-2002", lang: "AR", tag: "CUR", status: "Registered", statusStart: "07/01/2024", lastSession: "07/01/2024", usableCompliance: null, compliance: null },
  { username: "122-2001", lang: "EN", tag: "CUR", status: "Priority", statusStart: "11/02/2024", lastSession: "21/09/2024", usableCompliance: 41.3, compliance: 44.9 },
];

patients.forEach((p, i) => (p.id = i));
