/* ---------------- Data ---------------- */
const auditActionTemplates = [
  { type: "User Login", description: "User logged into the system", relatedPrefix: "User" },
  { type: "User Logout", description: "User logged out of the system", relatedPrefix: "User" },
  { type: "Patient Weight Manually Entered", description: "", relatedPrefix: "Patient" },
  { type: "Patient Blood Pressure Manually Entered", description: "", relatedPrefix: "Patient" },
];

const auditUserPool = ["Shekhar Manwar", "pranali tanpure", "Pranali Tanpure", "Igor Minyaylo", "Yoni Bloch", "Ayelet Er"];
const auditPatientPool = ["Orangee Maskk", "John Carter", "Maria Gomez", "David Lee"];

function pad(n) { return String(n).padStart(2, "0"); }

const auditTrail = Array.from({ length: 1629 }, (_, i) => {
  const template = auditActionTemplates[i % auditActionTemplates.length];
  const madeBy = auditUserPool[i % auditUserPool.length];
  const related = template.relatedPrefix === "Patient"
    ? `Patient: ${auditPatientPool[i % auditPatientPool.length]}`
    : `User: ${madeBy}`;

  const daysAgo = Math.floor(i / 20);
  const date = new Date(2026, 7, 18 - daysAgo, 23 - (i % 20), 59 - ((i * 7) % 60));

  return {
    id: i,
    actionType: template.type,
    description: template.description,
    relatedTo: related,
    madeBy,
    timestamp: date,
    timestampLabel: `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}, ${(() => {
      let h = date.getHours();
      const suffix = h >= 12 ? "PM" : "AM";
      h = h % 12 || 12;
      return `${pad(h)}:${pad(date.getMinutes())} ${suffix}`;
    })()}`,
  };
});
