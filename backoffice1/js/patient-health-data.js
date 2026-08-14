/* ---------------- Patient profile builder ---------------- */
const PATIENT_HEALTH_DEFAULT = "120-2001";

function phHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

const PH_GENDERS = ["Male", "Female"];
const PH_LANG_NAMES = { HE: "Hebrew", EN: "English", AR: "Arabic" };
const PH_DEVICE_MODELS = ["SMA346E", "SMN985F", "SMA525F", "Redmi8", "SMA720F"];
const PH_MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const PH_WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const PH_OS_VERSIONS = ["Android33", "Android29", "Android31", "iOS17", "Android30"];
const PH_MOBILE_MODELS = ["Pixel6", "SMA307FN", "SMA505F", "SMN985F", "Redmi8"];

function buildPatientProfile(username) {
  const base = (typeof patients !== "undefined" && patients.find((p) => p.username === username)) || null;
  const seed = phHash(username);

  const lang = base ? base.lang : ["HE", "EN", "AR"][seed % 3];
  const status = base ? base.status : "Registered";
  const usableCompliance = base && base.usableCompliance != null ? base.usableCompliance : Math.round((40 + (seed % 55)) * 100) / 100;
  const compliance = base && base.compliance != null ? base.compliance : Math.round((40 + (seed % 55)) * 100) / 100;

  const totalAvailableDays = 250 + (seed % 120);
  const unrecordedDays = 5 + (seed % 30);
  const totalRecordedDays = totalAvailableDays - unrecordedDays;

  const monthlyCompliance = PH_MONTHS.map((m, i) => ({
    month: m,
    compliance: Math.max(50, Math.min(100, Math.round(compliance + Math.sin((seed + i) / 2) * 8))),
    usable: Math.max(45, Math.min(100, Math.round(usableCompliance + Math.cos((seed + i) / 2) * 8))),
  }));

  const sessions = Array.from({ length: 6 }, (_, i) => {
    const hasErrors = (seed + i * 7) % 5 === 0;
    const pad = (n) => String(n).padStart(2, "0");
    const day = 28 - i * 3;
    const month = ((seed + i) % 12) + 1;
    const year = 2021 + ((seed + i * 3) % 4);
    const startH = 8 + ((seed + i) % 10);
    const hasEnd = i % 3 !== 0;
    return {
      date: `${pad(day)}/${pad(month)}/${year}`,
      startTime: `${pad(startH)}:${pad((seed * (i + 1)) % 60)}:${pad((seed + i * 5) % 60)}`,
      endTime: hasEnd ? `${pad(startH + 1)}:${pad((seed * (i + 2)) % 60)}:${pad((seed + i * 3) % 60)}` : "",
      errors: hasErrors ? 1 + (seed % 3) : 0,
      vEngineNote: hasErrors ? "Low confidence flagged" : "",
      os: PH_OS_VERSIONS[(seed + i) % PH_OS_VERSIONS.length],
      mobileModel: PH_MOBILE_MODELS[(seed + i) % PH_MOBILE_MODELS.length],
      appVersion: ["1.169", "1.169", "2.1.2.0"][(seed + i) % 3],
    };
  });

  const errorSessions = sessions.filter((s) => s.errors > 0).length;
  const totalRecordings = sessions.length + (seed % 30);
  const recordingErrors = sessions.reduce((sum, s) => sum + s.errors, 0);
  const recordsQuality = totalRecordings ? Math.round(((totalRecordings - errorSessions) / totalRecordings) * 100) : 0;

  const nonRecordedByWeekday = PH_WEEKDAYS.map((d, i) => ({ label: d, value: (seed + i * 5) % 6 }));
  const errorsHistogram = Array.from({ length: 6 }, (_, i) => ({ label: `${i}`, value: (seed + i * 4) % 8 }));
  const recordedHoursHistogram = PH_WEEKDAYS.map((d, i) => ({ label: d, value: 1 + ((seed + i * 6) % 9) }));

  const voiceEngine = [
    { date: "2028-01-27", check: "ASR confidence", result: seed % 4 === 0 ? "Below threshold" : "Pass", notes: seed % 4 === 0 ? "Flagged for manual review" : "No action needed" },
    { date: "2028-01-20", check: "Noise cancellation", result: "Pass", notes: "No action needed" },
    { date: "2028-01-13", check: "Wake-word detection", result: seed % 5 === 0 ? "Below threshold" : "Pass", notes: seed % 5 === 0 ? "Retrained on latest sample" : "No action needed" },
  ];

  const events = (typeof peEvents !== "undefined" ? peEvents.filter((e) => e.username === username) : []);

  return {
    username,
    lang,
    langName: PH_LANG_NAMES[lang] || lang,
    tag: base ? base.tag : "CUR",
    status,
    usableCompliance,
    compliance,
    org: username.split("-")[0],

    registration: {
      gender: PH_GENDERS[seed % 2],
      motherTongue: PH_LANG_NAMES[lang] || lang,
      weight: `${58 + (seed % 40)} kg`,
      country: "Israel",
      creationDate: (base && base.statusStart) || "01/01/2024",
      lastHospitalized: seed % 6 === 0 ? "12/05/2024" : "--",
    },

    usage: {
      phone: `+972-5${String(10000000 + (seed % 89999999)).slice(0, 8)}`,
      version: "1.0.1.0",
      language: lang,
      reminderMode: seed % 2 === 0 ? "MANUAL" : "AUTO",
      autoManualTime: "06:23 / 06:00",
    },

    statusOverview: {
      account: status === "Paused" ? "Disabled" : "Enabled",
      accountSince: (base && base.statusStart) || "01/01/2024",
      status,
      statusSince: (base && base.statusStart) || "01/01/2024",
      monitoring: seed % 3 === 0 ? "Unmonitored" : "Monitored",
      monitoringSince: (base && base.statusStart) || "01/01/2024",
    },

    complianceInfo: {
      firstSignIn: (base && base.statusStart) || "01/01/2024",
      lastSignIn: (base && base.lastSession) || "--",
      lastSession: (base && base.lastSession) || "--",
      startedAt: (base && base.statusStart) || "01/01/2024",
      baselineComplete: seed % 2 === 0 ? "15/11/2023" : "--",
      leavingDate: status === "Paused" ? "--" : "",
      totalAvailableDays,
      totalRecordedDays,
      unrecordedDays,
      nonValidAsrDays: seed % 4,
      totalCompliance: compliance,
      usableComplianceInfo: usableCompliance,
    },

    recordsInfo: {
      totalRecordings,
      recordingsWithErrors: errorSessions,
      recordingErrors,
      recordsQuality,
    },

    histograms: {
      errors: errorsHistogram,
      nonRecordedByWeekday,
      recordedHours: recordedHoursHistogram,
    },

    monthlyCompliance,
    sessions,
    voiceEngine,
    events,
  };
}
