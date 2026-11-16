/* Backoffice-safe fork of ../../js/audit-trail-data.js (re-synced with the
   root file). Why forked instead of shared: the root file's auditPatientPool
   embeds real patient names, which also end up in the generated description
   text ("... for <patient name>"). Changes from the root file:
   - auditPatientPool uses patient user numbers (ABC-14xx) instead of names.
   - The "Patient Weight / Blood Pressure Manually Entered" descriptions keep
     the root wording but drop the actual measurement value (weight in lbs,
     BP in mmHg) -- that's clinical content.
   The action-type list, user pool (staff names) and generation loop are
   otherwise identical to the root file. */

/* ---------------- Data ---------------- */
const auditActionTemplates = [
  { type: "User Login", relatedPrefix: "User", describe: (madeBy) => `${madeBy} logged into the system` },
  { type: "User Logout", relatedPrefix: "User", describe: (madeBy) => `${madeBy} logged out of the system` },
  {
    type: "Patient Weight Manually Entered",
    relatedPrefix: "Patient",
    describe: (madeBy, relatedName) => `${madeBy} manually entered a weight for ${relatedName}`,
  },
  {
    type: "Patient Blood Pressure Manually Entered",
    relatedPrefix: "Patient",
    describe: (madeBy, relatedName) => `${madeBy} manually entered a blood pressure reading for ${relatedName}`,
  },
];

const auditUserPool = ["Shekhar Manwar", "pranali tanpure", "Pranali Tanpure", "Igor Minyaylo", "Yoni Bloch", "Ayelet Er"];
const auditPatientPool = ["ABC-1401", "ABC-1402", "ABC-1403", "ABC-1404"];

function pad(n) { return String(n).padStart(2, "0"); }

const auditTrail = Array.from({ length: 1629 }, (_, i) => {
  const template = auditActionTemplates[i % auditActionTemplates.length];
  const madeBy = auditUserPool[i % auditUserPool.length];
  const relatedName = template.relatedPrefix === "Patient"
    ? auditPatientPool[i % auditPatientPool.length]
    : madeBy;
  const related = `${template.relatedPrefix}: ${relatedName}`;

  const daysAgo = Math.floor(i / 20);
  const date = new Date(2026, 7, 18 - daysAgo, 23 - (i % 20), 59 - ((i * 7) % 60));

  return {
    id: i,
    actionType: template.type,
    description: template.describe(madeBy, relatedName, i),
    relatedTo: related,
    relatedType: template.relatedPrefix,
    relatedName,
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
