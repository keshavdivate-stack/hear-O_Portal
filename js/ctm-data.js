/* Care Team Member roster -- same names used by Patient List's "Care Team"
   filter and the Register Patient "Care Team" field. `capacity` is the
   reference caseload used to compute each member's workload percentage. */
const ctmRoster = [
  { name: "Dr. Sarah Mitchell", role: "Doctor", capacity: 3 },
  { name: "Dr. James Carter", role: "Doctor", capacity: 3 },
  { name: "Dr. Emily Chen", role: "Doctor", capacity: 3 },
  { name: "Dr. Michael Reyes", role: "Doctor", capacity: 3 },
  { name: "Amanda Lee, RN", role: "Nurse", capacity: 3 },
  { name: "Ayelet Er, NP", role: "Nurse Practitioner", capacity: 3 },
  { name: "Sandy Kohl, RN", role: "Nurse", capacity: 3 },
  { name: "Emily Carter", role: "Care Coordinator", capacity: 4 },
];

/* Same patient set shown on Patient List, trimmed to the fields the
   staffing workload and patient status views need. */
const ctmPatients = [
  { name: "Alexander White", username: "ABC-1254", teamMember: "Dr. Sarah Mitchell", team: "Heart Failure Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92 },
  { name: "Dan Volex", username: "ABC-1252", teamMember: "Amanda Lee, RN", team: "Remote Monitoring Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68 },
  { name: "Mike Brown", username: "ABC-1251", teamMember: "Dr. James Carter", team: "Heart Failure Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", compliance: 34 },
  { name: "Ariel Fox", username: "ABC-1238", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "priority", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81 },
  { name: "Jeff Frank", username: "ABC-1242", teamMember: "Ayelet Er, NP", team: "Remote Monitoring Team", status: "priority", since: "Since: 4d | 01.06.2028", monitoring: "monitored", compliance: 57 },
  { name: "Aric Snow", username: "ABC-1283", teamMember: "Ayelet Er, NP", team: "Heart Failure Team", status: "priority", since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76 },
  { name: "Abe Lol", username: "ABC-1222", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88 },
  { name: "Annie Zaplin", username: "ABC-1225", teamMember: "Sandy Kohl, RN", team: "Remote Monitoring Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45 },
  { name: "Nathan Norash", username: "ABC-1231", teamMember: "Dr. Michael Reyes", team: "Heart Failure Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63 },
  { name: "Henry Fisher", username: "ABC-1220", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12 },
  { name: "Josh Ericson", username: "ABC-1233", teamMember: "Dr. Emily Chen", team: "Remote Monitoring Team", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 79 },
  { name: "Jack Harris", username: "ABC-1221", teamMember: "Dr. Sarah Mitchell", team: "Heart Failure Team", status: "baseline", since: "Since: 5d | 01.05.2028", monitoring: "unmonitored", compliance: 24 },
];

ctmPatients.forEach((p, i) => (p.id = i));
