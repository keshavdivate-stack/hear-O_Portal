/* ---------------- Shared organization health data ---------------- */
const orgHealthData = {
  "clalit-north": {
    name: "HMO Clalit North",
    severity: "critical",
    patients: 82,
    providers: 14,
    openIssues: 9,
    criticalIssues: 4,
    lastIncident: "2h ago",
    categories: [
      { label: "Patient (Mobile/Web)", count: 6, color: "var(--blue)" },
      { label: "Compliance", count: 3, color: "var(--purple)" },
      { label: "System Schedule Engine", count: 2, color: "var(--gray)" },
      { label: "Voice Engine", count: 0, color: "var(--orange)" },
      { label: "Sensors", count: 0, color: "var(--yellow)" },
    ],
    patientsAffected: [
      { id: "p-4471", name: "David Cohen", issue: "Recording upload failure", severity: "critical", lastRecording: "2h ago", status: "Open" },
      { id: "p-4402", name: "Miriam Levi", issue: "Missed daily reading", severity: "warning", lastRecording: "1d ago", status: "Monitoring" },
      { id: "p-4318", name: "Yosef Katz", issue: "Recording upload failure", severity: "critical", lastRecording: "3h ago", status: "Open" },
      { id: "p-4290", name: "Rivka Azoulay", issue: "Compliance drop", severity: "warning", lastRecording: "5h ago", status: "Open" },
      { id: "p-4177", name: "Amos Peretz", issue: "Missed daily reading", severity: "warning", lastRecording: "12h ago", status: "Monitoring" },
      { id: "p-4098", name: "Noa Barak", issue: "Recording upload failure", severity: "critical", lastRecording: "40m ago", status: "Escalated" },
    ],
  },
  "assuta-cardio": {
    name: "Assuta Cardio",
    severity: "critical",
    patients: 54,
    providers: 9,
    openIssues: 5,
    criticalIssues: 2,
    lastIncident: "20m ago",
    categories: [
      { label: "Voice Engine", count: 4, color: "var(--orange)" },
      { label: "Patient (Mobile/Web)", count: 1, color: "var(--blue)" },
    ],
    patientsAffected: [
      { id: "p-2231", name: "Itai Ben-David", issue: "Voice engine timeout", severity: "critical", lastRecording: "40m ago", status: "Open" },
      { id: "p-2205", name: "Shira Mizrahi", issue: "Device battery critical", severity: "warning", lastRecording: "20m ago", status: "Open" },
      { id: "p-2166", name: "Eli Shapiro", issue: "Voice engine timeout", severity: "critical", lastRecording: "1h ago", status: "Investigating" },
    ],
  },
  "clalit-south": {
    name: "Clalit South",
    severity: "warning",
    patients: 61,
    providers: 11,
    openIssues: 3,
    criticalIssues: 0,
    lastIncident: "3h ago",
    categories: [
      { label: "Compliance", count: 3, color: "var(--purple)" },
      { label: "System Schedule Engine", count: 1, color: "var(--gray)" },
      { label: "Sensors", count: 0, color: "var(--yellow)" },
    ],
    patientsAffected: [
      { id: "p-1187", name: "Tamar Ohana", issue: "Compliance drop", severity: "warning", lastRecording: "3h ago", status: "Open" },
      { id: "p-1142", name: "Boaz Gefen", issue: "Compliance drop", severity: "warning", lastRecording: "6h ago", status: "Monitoring" },
    ],
  },
  "maccabi-west": {
    name: "Maccabi West",
    severity: "warning",
    patients: 47,
    providers: 8,
    openIssues: 4,
    criticalIssues: 1,
    lastIncident: "1d ago",
    categories: [
      { label: "Sensors", count: 3, color: "var(--yellow)" },
      { label: "Patient (Mobile/Web)", count: 1, color: "var(--blue)" },
    ],
    patientsAffected: [
      { id: "p-3390", name: "Roni Segal", issue: "Sensor disconnect (Bluetooth)", severity: "warning", lastRecording: "1d ago", status: "Investigating" },
      { id: "p-3355", name: "Gil Nahum", issue: "Duplicate patient record", severity: "critical", lastRecording: "1d ago", status: "Open" },
    ],
  },
  "b01-pilot": {
    name: "B01 Pilot",
    severity: "critical",
    patients: 12,
    providers: 3,
    openIssues: 2,
    criticalIssues: 1,
    lastIncident: "6h ago",
    categories: [
      { label: "Patient (Mobile/Web)", count: 2, color: "var(--blue)" },
    ],
    patientsAffected: [
      { id: "p-8801", name: "Lior Adler", issue: "App crash on Android 14", severity: "critical", lastRecording: "6h ago", status: "Escalated" },
    ],
  },
  "maccabi-east": {
    name: "Maccabi East",
    severity: "healthy",
    patients: 68,
    providers: 10,
    openIssues: 0,
    criticalIssues: 0,
    lastIncident: "—",
    categories: [],
    patientsAffected: [],
  },
};

const ORG_HEALTH_DEFAULT = "clalit-north";
