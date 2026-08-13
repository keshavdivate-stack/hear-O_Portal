/* ---------------- Language Resources: sample recordings data ---------------- */
const LR_SITES = ["MKT-0219", "120", "121", "B01", "ATP"];
const LR_LANGS = ["EN", "HE", "AR", "ES", "RU", "DE"];

let lrRecordings = [
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:26", language: "EN", identifier: "S0010", notes: "", voiceInput: "", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:22", language: "EN", identifier: "S0012", notes: "", voiceInput: "", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:18", language: "EN", identifier: "S0008", notes: "", voiceInput: "", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:14", language: "EN", identifier: "S0013", notes: "", voiceInput: "", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:10", language: "EN", identifier: "S0006", notes: "", voiceInput: "", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "15:53:05", language: "EN", identifier: "S0011", notes: "", voiceInput: "R063", duration: 2 },
  { username: "MKT-0219", date: "01/07/2026", time: "14:10:27", language: "HE", identifier: "S0007", notes: "", voiceInput: "R010,R051,R200", duration: 3 },
  { username: "120-2001", date: "30/06/2026", time: "11:22:04", language: "EN", identifier: "S0002", notes: "", voiceInput: "", duration: 4 },
  { username: "120-2002", date: "30/06/2026", time: "10:05:51", language: "HE", identifier: "S0003", notes: "", voiceInput: "", duration: 3 },
  { username: "121-2001", date: "29/06/2026", time: "16:40:12", language: "AR", identifier: "S0004", notes: "", voiceInput: "", duration: 2 },
  { username: "B01-3001", date: "29/06/2026", time: "09:15:30", language: "ES", identifier: "S0005", notes: "", voiceInput: "", duration: 5 },
  { username: "ATP-4001", date: "28/06/2026", time: "13:48:02", language: "EN", identifier: "S0001", notes: "", voiceInput: "", duration: 2 },
  { username: "ATP-4002", date: "28/06/2026", time: "12:02:47", language: "RU", identifier: "S0009", notes: "", voiceInput: "", duration: 3 },
  { username: "120-2003", date: "27/06/2026", time: "17:33:19", language: "DE", identifier: "S0014", notes: "", voiceInput: "", duration: 2 },
  { username: "121-2002", date: "27/06/2026", time: "08:55:41", language: "HE", identifier: "S0015", notes: "", voiceInput: "", duration: 4 },
  { username: "121-2002", date: "27/06/2026", time: "08:50:03", language: "HE", identifier: "S0016", notes: "", voiceInput: "", duration: 2 },
  { username: "B01-3002", date: "26/06/2026", time: "15:12:38", language: "EN", identifier: "S0017", notes: "", voiceInput: "", duration: 3 },
  { username: "B01-3002", date: "26/06/2026", time: "15:08:20", language: "EN", identifier: "S0018", notes: "", voiceInput: "", duration: 2 },
  { username: "ATP-4003", date: "25/06/2026", time: "10:44:59", language: "ES", identifier: "S0019", notes: "", voiceInput: "", duration: 4 },
  { username: "MKT-0219", date: "25/06/2026", time: "09:30:00", language: "EN", identifier: "S0020", notes: "", voiceInput: "", duration: 2 },
];

lrRecordings.forEach((r, i) => (r.id = i));
