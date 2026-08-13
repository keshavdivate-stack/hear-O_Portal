/* ---------------- Shared Users data (used by manage-users.html) ---------------- */
const boUsers = [
  { username: "2413214ewr", firstName: "Igor", lastName: "Minyaylo", email: "igor@cordio-med.com", phone: "+972-538726747", role: "CLINIC DOCTOR", dateCreated: "08/02/2026", allowedOrgs: "B01", mfa: false, locked: false },
  { username: "895447", firstName: "Yoni", lastName: "Bloch", email: "ayelet@cordio-med.com", phone: "+972-548654123", role: "CLINIC USER", dateCreated: "08/02/2026", allowedOrgs: "B01", mfa: false, locked: false },
  { username: "admin_clinic", firstName: "Vasyl", lastName: "Adsds", email: "igor@cordio-med.com", phone: "+380-538726747", role: "CLINIC SUPERVISOR", dateCreated: "27/08/2025", allowedOrgs: "MKT B01", mfa: false, locked: false },
  { username: "admin_igor_clinic", firstName: "Igor", lastName: "Miniailo", email: "igor@cordio-med.com", phone: "+972-538726747", role: "CLINIC MANAGER", dateCreated: "09/09/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "adminatp", firstName: "Igor", lastName: "Minyayloooo", email: "igor@cordio-med.com", phone: "+972-538726747", role: "CLINIC MANAGER", dateCreated: "15/01/2026", allowedOrgs: "120", mfa: false, locked: false },
  { username: "anuragsinghh", firstName: "Anuraggg", lastName: "Singhh", email: "anurag.singh@quality.com", phone: "+91-7011996968", role: "CLINIC MANAGER", dateCreated: "05/02/2025", allowedOrgs: "B01", mfa: false, locked: false },
  { username: "ashish_dev3", firstName: "Ashish", lastName: "K", email: "ashish.kulkarni@think.com", phone: "+91-8806785358", role: "CLINIC SUPERVISOR", dateCreated: "04/08/2025", allowedOrgs: "ATP B01", mfa: false, locked: false },
  { username: "ashish_supervisor_dev3", firstName: "ashish", lastName: "k", email: "ashish.kulkarni@think.com", phone: "+972-546666666", role: "SUPERVISOR", dateCreated: "25/08/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "auto_clinic_supervisor2", firstName: "", lastName: "", email: "", phone: "", role: "CLINIC SUPERVISOR", dateCreated: "09/01/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "auto_test", firstName: "", lastName: "", email: "", phone: "", role: "SUPERVISOR", dateCreated: "09/01/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "clara_admin", firstName: "Clara", lastName: "Diaz", email: "clara.diaz@cordio-med.com", phone: "+34-611223344", role: "CLINIC MANAGER", dateCreated: "12/03/2025", allowedOrgs: "121", mfa: true, locked: false },
  { username: "dan_supervisor", firstName: "Dan", lastName: "Ofer", email: "dan.ofer@cordio-med.com", phone: "+972-521234567", role: "SUPERVISOR", dateCreated: "18/03/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "emily_carter", firstName: "Emily", lastName: "Carter", email: "emily.carter@cordio-med.com", phone: "+1-2125550110", role: "CLINIC MANAGER", dateCreated: "22/03/2025", allowedOrgs: "240", mfa: true, locked: false },
  { username: "george_lin", firstName: "George", lastName: "Lin", email: "george.lin@cordio-med.com", phone: "+44-7911123456", role: "CLINIC DOCTOR", dateCreated: "30/03/2025", allowedOrgs: "241", mfa: false, locked: true },
  { username: "hila_ben", firstName: "Hila", lastName: "Ben David", email: "hila.ben@cordio-med.com", phone: "+972-544455667", role: "CLINIC USER", dateCreated: "02/04/2025", allowedOrgs: "B01", mfa: false, locked: false },
  { username: "ivan_petrov", firstName: "Ivan", lastName: "Petrov", email: "ivan.petrov@cordio-med.com", phone: "+380-671122334", role: "CLINIC SUPERVISOR", dateCreated: "09/04/2025", allowedOrgs: "ATP", mfa: false, locked: false },
  { username: "jenny_wu", firstName: "Jenny", lastName: "Wu", email: "jenny.wu@cordio-med.com", phone: "+1-4155550199", role: "CLINIC MANAGER", dateCreated: "14/04/2025", allowedOrgs: "242", mfa: true, locked: false },
  { username: "kobi_azran", firstName: "Kobi", lastName: "Azran", email: "kobi.azran@cordio-med.com", phone: "+972-528889900", role: "CLINIC USER", dateCreated: "21/04/2025", allowedOrgs: "243", mfa: false, locked: false },
  { username: "lior_shalev", firstName: "Lior", lastName: "Shalev", email: "lior.shalev@cordio-med.com", phone: "+972-533344556", role: "SUPERVISOR", dateCreated: "28/04/2025", allowedOrgs: "All Organizations", mfa: false, locked: false },
  { username: "maria_santos", firstName: "Maria", lastName: "Santos", email: "maria.santos@cordio-med.com", phone: "+34-622334455", role: "CLINIC DOCTOR", dateCreated: "05/05/2025", allowedOrgs: "244", mfa: false, locked: false },
  { username: "noa_peretz", firstName: "Noa", lastName: "Peretz", email: "noa.peretz@cordio-med.com", phone: "+972-541122334", role: "CLINIC USER", dateCreated: "11/05/2025", allowedOrgs: "B01", mfa: true, locked: false },
  { username: "omer_katz", firstName: "Omer", lastName: "Katz", email: "omer.katz@cordio-med.com", phone: "+972-529988776", role: "CLINIC MANAGER", dateCreated: "17/05/2025", allowedOrgs: "ASF", mfa: false, locked: false },
  { username: "priya_nair", firstName: "Priya", lastName: "Nair", email: "priya.nair@think.com", phone: "+91-9820012345", role: "CLINIC SUPERVISOR", dateCreated: "23/05/2025", allowedOrgs: "ATP B01", mfa: false, locked: false },
  { username: "qasim_raza", firstName: "Qasim", lastName: "Raza", email: "qasim.raza@think.com", phone: "+91-9812233445", role: "CLINIC USER", dateCreated: "29/05/2025", allowedOrgs: "120", mfa: false, locked: true },
];

boUsers.forEach((u, i) => (u.id = i));
