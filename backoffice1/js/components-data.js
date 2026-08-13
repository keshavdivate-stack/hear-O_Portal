/* ---------------- Config data (Settings > Config > Components) ---------------- */
const LANGS = ["AR", "EN", "HE", "RU", "ES", "DE"];
const YES_NO = ["Yes", "No"];
const IA_ERROR_OPTIONS = ["No Speech Detected", "Low SNR", "Early Stop", "Late Start", "Network Timeout", "Recording Too Short"];
const REMINDER_TIME_RANGE_OPTIONS = ["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00", "20:00 - 23:00"];
const QUESTION_OPTIONS = ["How are you feeling today?", "Did you take your medication?", "Have you gained weight recently?", "Are you short of breath?", "Do you have chest pain?"];
const SENTENCE_OPTIONS = ["Please take a deep breath", "Hold your breath for 3 seconds", "Say the following sentence clearly", "Please repeat after the tone", "Speak slowly and clearly"];

let sentencesConfigs = [
  { name: "Spanish Test 1.6.20", creationDate: "01/06/2020 14:26:24" },
  { name: "CordioMedLanguages_New6", creationDate: "07/07/2020 07:49:41" },
  { name: "CordioMedLanguages_New4", creationDate: "07/07/2020 07:57:18" },
  { name: "CordioMedLanguages_New2_ES", creationDate: "07/07/2020 08:05:01" },
  { name: "CordioMedLanguages", creationDate: "07/07/2020 08:23:15" },
  { name: "CordioMedLanguages_Corona", creationDate: "15/07/2020 16:31:25" },
  { name: "CordioMedLanguages_New6_no sentence with names", creationDate: "10/08/2020 07:58:00" },
  { name: "BYM-0013", creationDate: "10/08/2020 08:40:14" },
  { name: "RAM-0085", creationDate: "10/08/2020 08:52:52" },
  { name: "Spanish ATP 4.1.21", creationDate: "04/01/2021 11:30:36" },
];

let questionsConfigs = [
  { name: "MedicalQuestions 21.5.20", creationDate: "21/05/2020 15:34:05" },
  { name: "MedicalQuestions_Corona 16.7.20", creationDate: "16/07/2020 06:17:35" },
  { name: "Spanish ATP 4.1.21", creationDate: "04/01/2021 06:25:58" },
  { name: "radioTest", creationDate: "26/07/2021 09:26:39" },
  { name: "No questions at all 19.9.21", creationDate: "19/09/2021 09:17:06" },
  { name: "HQx3", creationDate: "11/11/2021 16:00:02" },
  { name: "HQx3_Feel_Breathe", creationDate: "24/04/2022 08:40:40" },
  { name: "HQx3 Update Text", creationDate: "03/01/2023 09:55:40" },
];

let inputAssessmentConfigs = [
  { name: "DefaultInputAssessmentConfig 21.05.20", creationDate: "14/08/2019 07:35:41" },
  { name: "InputAssessmentConfig_Pre_Zero 07.07.20", creationDate: "14/08/2019 07:35:41" },
  { name: "ATP Spanish Config no IA 5.01.21", creationDate: "14/08/2019 07:35:41" },
  { name: "DefaultInputAssessmentConfig 19.09.21", creationDate: "19/09/2021 09:18:17" },
  { name: "Bat Test no IA 5.01.21", creationDate: "29/11/2021 08:16:56" },
  { name: "Pre_Post_Zero", creationDate: "21/11/2022 13:38:59" },
  { name: "Pre_Post_2000", creationDate: "22/11/2022 12:20:46" },
  { name: "GermanATP_DefaultInputAssessmentConfig 19.09.21", creationDate: "08/12/2022 13:38:41" },
  { name: "GermanATP_DefaultInputAssessmentConfig 19.09.21- with IA errors messages", creationDate: "09/04/2024 09:29:00" },
  { name: "Mic Test Pre_Post_Zero", creationDate: "10/04/2024 08:44:45" },
];

let generalParamsConfigs = [
  { name: "DefaultGeneralConfig 16.01.20", creationDate: "14/08/2019 07:35:41" },
  { name: "General Params 21.5.20", creationDate: "21/05/2020 12:07:55" },
  { name: "General Params with Alerts19.9.21", creationDate: "19/09/2021 09:19:50" },
  { name: "General Params with Alerts 5.10.21", creationDate: "05/10/2021 13:02:49" },
  { name: "General Params with Alerts 11.11.21", creationDate: "11/11/2021 16:08:32" },
  { name: "Test Params with Alerts 5 min system timer 23.1.22", creationDate: "23/01/2022 07:23:30" },
  { name: "General Params with Alerts HQ every day 19.2.22", creationDate: "19/02/2022 10:25:06" },
  { name: "General Params no HQ 31.5.22", creationDate: "31/05/2022 13:01:24" },
  { name: "Test Params with Alerts 4 min system timer 18.10.22", creationDate: "19/10/2022 10:30:01" },
  { name: "animation +long_press_enabled", creationDate: "31/10/2022 09:36:27" },
];

let reminderConfigs = [
  { name: "Reminder 31.05.20", creationDate: "16/01/2020 09:44:23" },
  { name: "Reminder Spanish ATP 4.1.21", creationDate: "16/01/2020 09:44:23" },
  { name: "Reminder 20.01.21 (90 days; Stiff 1)", creationDate: "16/01/2020 09:44:23" },
  { name: "Reminder 19.09.21 (90 days; Stiff 1)", creationDate: "19/09/2021 09:25:07" },
  { name: "Reminder 19.09.21 (90 days; Stiff 1) - no reminder", creationDate: "16/11/2023 17:44:44" },
  { name: "Reminder 19.09.21 (90 days; Stiff 1) + German", creationDate: "29/01/2024 16:46:56" },
  { name: "Reminder 30.06.26 (90 days; Stiff 1) test", creationDate: "19/09/2021 09:25:07" },
  { name: "test", creationDate: "05/07/2026 12:17:12" },
];

let iaErrorsConfigs = [
  { name: "Default", creationDate: "19/09/2021 09:31:07" },
  { name: "testigor4", creationDate: "07/07/2026 13:23:55" },
  { name: "New R200", creationDate: "07/07/2026 13:38:11" },
];

let mainConfigs = [
  { name: "DefaultAppConfig", iaErrorsConfig: "Default", creationDate: "14/08/2019 07:35:41" },
  { name: "NewDefault", iaErrorsConfig: "Default", creationDate: "16/01/2020 12:23:01" },
  { name: "Default Main 16.01.20", iaErrorsConfig: "Default", creationDate: "16/01/2020 12:59:22" },
  { name: "Main Short 22.01.20", iaErrorsConfig: "Default", creationDate: "22/01/2020 09:31:38" },
  { name: "Main Based on New2 sentences 02.02.20", iaErrorsConfig: "Default", creationDate: "02/02/2020 12:42:19" },
  { name: "Short Sentences_Pre_Zero 04.02.20", iaErrorsConfig: "Default", creationDate: "04/02/2020 08:59:06" },
  { name: "Default Main 13.2.20", iaErrorsConfig: "Default", creationDate: "13/02/2020 10:35:40" },
];
