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
   staffing workload and patient status views need. A handful of named
   patients are hand-authored (kept for flavor), then each member's panel
   is padded out to a realistic caseload size with generated patients so the
   CTM table's per-member counts read like a real panel instead of 0s/1s.
   Deterministically seeded so the same "random" panel renders on reload. */
const ctmPatients = [
  { name: "Alexander White", username: "ABC-1254", teamMember: "Dr. Sarah Mitchell", team: "Heart Failure Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 92, account: "Enabled" },
  { name: "Dan Volex", username: "ABC-1252", teamMember: "Amanda Lee, RN", team: "Remote Monitoring Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "monitored", compliance: 68, account: "Enabled" },
  { name: "Mike Brown", username: "ABC-1251", teamMember: "Dr. James Carter", team: "Heart Failure Team", status: "priority", since: "Since: 2d | 01.08.2028", monitoring: "unmonitored", compliance: 34, account: "Enabled" },
  { name: "Ariel Fox", username: "ABC-1238", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "priority", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 81, account: "Enabled" },
  { name: "Jeff Frank", username: "ABC-1242", teamMember: "Ayelet Er, NP", team: "Remote Monitoring Team", status: "priority", since: "Since: 4d | 01.06.2028", monitoring: "monitored", compliance: 57, account: "Enabled" },
  { name: "Aric Snow", username: "ABC-1283", teamMember: "Ayelet Er, NP", team: "Heart Failure Team", status: "priority", since: "Since: 8d | 01.02.2028", monitoring: "monitored", compliance: 76, account: "Enabled" },
  { name: "Abe Lol", username: "ABC-1222", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 88, account: "Enabled" },
  { name: "Annie Zaplin", username: "ABC-1225", teamMember: "Sandy Kohl, RN", team: "Remote Monitoring Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 45, account: "Enabled" },
  { name: "Nathan Norash", username: "ABC-1231", teamMember: "Dr. Michael Reyes", team: "Heart Failure Team", status: "active", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 63, account: "Paused" },
  { name: "Henry Fisher", username: "ABC-1220", teamMember: "Emily Carter", team: "Post-Discharge Team", status: "registered", since: "Since: 3d | 01.07.2028", monitoring: "none", compliance: 12, account: "Enabled" },
  { name: "Josh Ericson", username: "ABC-1233", teamMember: "Dr. Emily Chen", team: "Remote Monitoring Team", status: "baseline", since: "Since: 3d | 01.07.2028", monitoring: "monitored", compliance: 79, account: "Discontinued" },
  { name: "Jack Harris", username: "ABC-1221", teamMember: "Dr. Sarah Mitchell", team: "Heart Failure Team", status: "baseline", since: "Since: 5d | 01.05.2028", monitoring: "unmonitored", compliance: 24, account: "Discontinued" },
];

function ctmSeededRandom(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function ctmWeightedPick(rand, weighted) {
  const total = weighted.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [value, w] of weighted) {
    if (r < w) return value;
    r -= w;
  }
  return weighted[weighted.length - 1][0];
}

const CTM_GEN_FIRST_NAMES = ["Olivia", "Liam", "Emma", "Noah", "Ava", "Ethan", "Sophia", "Mason", "Isabella", "Lucas", "Mia", "James", "Amelia", "Benjamin", "Harper", "Elijah", "Evelyn", "William", "Grace", "Leo", "Chloe", "Owen", "Ruby", "Caleb", "Zoe", "Adam", "Nora", "Felix", "Ivy", "Marcus"];
const CTM_GEN_LAST_NAMES = ["Bennett", "Cole", "Reed", "Hayes", "Foster", "Diaz", "Morgan", "Price", "Wells", "Hart", "Ross", "Kane", "Pace", "Dunn", "Hale", "Marsh", "Vance", "Boyd", "Lowe", "Shaw", "Grant", "Fields", "Doyle", "Pratt", "Combs", "Chase", "Beck", "Winters", "Sloan", "Voss"];

const CTM_TEAM_BY_MEMBER = {
  "Dr. Sarah Mitchell": "Heart Failure Team",
  "Dr. James Carter": "Heart Failure Team",
  "Dr. Emily Chen": "Remote Monitoring Team",
  "Dr. Michael Reyes": "Heart Failure Team",
  "Amanda Lee, RN": "Remote Monitoring Team",
  "Ayelet Er, NP": "Remote Monitoring Team",
  "Sandy Kohl, RN": "Remote Monitoring Team",
  "Emily Carter": "Post-Discharge Team",
};

(function generateCtmPanels() {
  const rand = ctmSeededRandom(20260904);
  let usernameSeq = 1300;

  ctmRoster.forEach((member) => {
    const existingCount = ctmPatients.filter((p) => p.teamMember === member.name).length;
    const panelSize = 9 + Math.floor(rand() * 8); // 9-16 patients per member
    for (let i = existingCount; i < panelSize; i++) {
      const first = CTM_GEN_FIRST_NAMES[Math.floor(rand() * CTM_GEN_FIRST_NAMES.length)];
      const last = CTM_GEN_LAST_NAMES[Math.floor(rand() * CTM_GEN_LAST_NAMES.length)];
      const status = ctmWeightedPick(rand, [["priority", 2], ["active", 4], ["registered", 1], ["baseline", 2]]);
      const account = ctmWeightedPick(rand, [["Enabled", 7], ["Paused", 2], ["Discontinued", 1]]);
      const monitoring = account === "Discontinued" ? "none" : ctmWeightedPick(rand, [["monitored", 7], ["unmonitored", 2], ["none", 1]]);
      ctmPatients.push({
        name: `${first} ${last}`,
        username: `ABC-${usernameSeq++}`,
        teamMember: member.name,
        team: CTM_TEAM_BY_MEMBER[member.name],
        status,
        since: "Since: 3d | 01.07.2028",
        monitoring,
        compliance: 20 + Math.floor(rand() * 75),
        account,
      });
    }
  });
})();

ctmPatients.forEach((p, i) => (p.id = i));
