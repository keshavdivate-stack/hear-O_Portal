/* ---------------- Config data (Settings > Config > Session Data) ---------------- */
const SD_LANGS = ["AR", "EN", "HE", "RU", "ES", "DE"];
const SD_QUESTION_TYPES = ["YES NO", "OPINION", "FREE TEXT"];

let sentencesData = [
  { identifier: "ar1", language: "AR", sentence: "مرحبا" },
  { identifier: "S0001", language: "AR", sentence: "عفيف, دلال, جمال, فوزي, شادي, سيف, حنان" },
  { identifier: "S0002", language: "AR", sentence: "بدي اشرب مي" },
  { identifier: "S0003", language: "AR", sentence: "بعدين منفكر بالموضوع" },
  { identifier: "S0004", language: "AR", sentence: "في كمان مخدة وحرام؟" },
  { identifier: "S0005", language: "AR", sentence: "خلينا نشوف ابتسامتك الحلوه" },
  { identifier: "S0006", language: "AR", sentence: "نزل على الشغل اليوم" },
  { identifier: "S0007", language: "AR", sentence: "كوخ بادي دافي" },
  { identifier: "S0008", language: "AR", sentence: "فاتنة شايفة ديب" },
];

let questionsData = [];

let answersData = [
  { name: "EN Answer", answers: { AR: "", EN: "Strongly agree,Agree,No opinion, Disagree,Strongly disagree", HE: "", RU: "", ES: "", DE: "" } },
];

let iaErrorsData = [
  {
    name: "Default 19.9.21+DE", identifier: "R007,R008", priority: "1", rerecordAttempts: "1", sessionRerecordAttempts: "10",
    messages: {
      AR: { regular: "لم يتم تسجيل الجملة. الرجاء تجنب أي ضجيج في الخلفية والمحاولة من جديد", successful: "None", unsuccessful: "None" },
      EN: { regular: "The phrase was not received. Please verify no background noise and record again in a loud and clear voice.", successful: "None", unsuccessful: "None" },
      HE: { regular: "משפט לא נקלט. יש לודא שאין רעש שאין רקע, ולהקליט שוב בקול ברור", successful: "None", unsuccessful: "None" },
      RU: { regular: "Запись предложения не удалась. Убедитесь, что в помещении нет шума и произведите запись снова громким и чистым голосом.", successful: "None", unsuccessful: "None" },
      ES: { regular: "La frase no fue recibida. Verifique que no haya ruido de fondo y vuelva a grabarla con voz clara.", successful: "None", unsuccessful: "None" },
      DE: { regular: "Der Satz wurde nicht empfangen. Bitte vergewissern Sie sich, dass keine Hintergrundgeräusche vorhanden sind, und nehmen Sie mit lauter und klarer Stimme erneut auf.", successful: "None", unsuccessful: "None" },
    },
  },
  {
    name: "Error200Test - need to be replaced", identifier: "R200", priority: "2", rerecordAttempts: "1", sessionRerecordAttempts: "12",
    messages: {
      AR: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
      EN: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
      HE: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
      RU: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
      ES: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
      DE: { regular: "Partial Recording, please record again", successful: "None", unsuccessful: "None" },
    },
  },
];

let reminderTimeRangeData = [
  { name: "Morning", start: "04:00:00", end: "14:00:00", defaultTime: "11:00:00" },
  { name: "Evening", start: "16:00:00", end: "23:59:00", defaultTime: "21:00:00" },
  { name: "All Day", start: "04:00:00", end: "23:59:00", defaultTime: "11:00:00" },
];
