/* ---------------- Patient lookup (built on top of org-health-data.js) ---------------- */
const PATIENT_HEALTH_DEFAULT = "p-4471";

function phHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function findPatientHealthRecord(patientId) {
  for (const orgId of Object.keys(orgHealthData)) {
    const found = orgHealthData[orgId].patientsAffected.find((p) => p.id === patientId);
    if (found) return { orgId, patient: found };
  }
  const fallbackOrgId = ORG_HEALTH_DEFAULT;
  return { orgId: fallbackOrgId, patient: orgHealthData[fallbackOrgId].patientsAffected[0] };
}

const PATIENT_DEVICE_MODELS = ["SMA346E", "SMN985F", "SMA525F", "Redmi8", "SMA720F"];

function buildPatientHealthDetail(patientId) {
  const { orgId, patient } = findPatientHealthRecord(patientId);
  const seed = phHash(patientId);
  const battery = 20 + (seed % 75);
  const device = PATIENT_DEVICE_MODELS[seed % PATIENT_DEVICE_MODELS.length];

  const recordings = Array.from({ length: 6 }, (_, i) => {
    const daySeed = (seed + i * 7) % 30;
    const durationSec = 40 + ((seed + i * 13) % 90);
    const quality = ["Good", "Good", "Good", "Fair", "Low"][(seed + i) % 5];
    return {
      date: `2028-01-${String(28 - i).padStart(2, "0")}`,
      time: `${8 + ((seed + i) % 10)}:${String((seed * i) % 60).padStart(2, "0")}`,
      duration: `0:${String(durationSec).padStart(2, "0")}`,
      quality,
      uploaded: i === 0 && patient.status !== "Escalated" ? "Failed" : "Uploaded",
    };
  });

  const encounters = [
    { date: "2028-01-24", type: "Scheduled Check-in", provider: "Dr. Levi", notes: "Routine review, no changes to plan." },
    { date: "2028-01-10", type: "Compliance Follow-up", provider: "Dr. Amrani", notes: "Discussed missed recordings, patient re-educated on device use." },
    { date: "2027-12-19", type: "Onboarding", provider: "Dr. Levi", notes: "Initial device setup and baseline recording." },
  ];

  const readings = [
    { date: "2028-01-28", metric: "Usable Compliance", value: `${60 + (seed % 35)}%`, status: seed % 3 === 0 ? "Below Target" : "On Target" },
    { date: "2028-01-27", metric: "Compliance", value: `${65 + (seed % 30)}%`, status: "On Target" },
    { date: "2028-01-21", metric: "Usable Compliance", value: `${55 + (seed % 30)}%`, status: "Below Target" },
    { date: "2028-01-14", metric: "Compliance", value: `${70 + (seed % 25)}%`, status: "On Target" },
  ];

  const issues = [
    { title: patient.issue, severity: patient.severity, status: patient.status, detected: "Today" },
  ];
  if (seed % 4 === 0) {
    issues.push({ title: "Notification permissions disabled", severity: "warning", status: "Open", detected: "3d ago" });
  }

  return {
    id: patientId,
    name: patient.name,
    orgId,
    orgName: orgHealthData[orgId].name,
    severity: patient.severity,
    status: patient.status,
    device,
    battery,
    lastSync: patient.lastRecording,
    firmware: "2.1.3",
    recordings,
    encounters,
    readings,
    issues,
  };
}
