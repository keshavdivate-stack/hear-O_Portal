/* ---------------- Terms & Conditions sample data ---------------- */
const TC_USER_TYPES = ["Patient", "Clinic User"];
const TC_DOC_TYPES = ["User Privacy", "User Terms"];
const TC_ORGS = ["120", "241", "ATP", "B01"];

const termsConditionsLog = [
  { user: "Yaaer", userType: "Patient", docType: "User Privacy", docPath: "EU/1.0/ES/UserPrivacy.pdf", org: "B01", signedAt: "2026-02-10T11:16:00" },
  { user: "Yaaer", userType: "Patient", docType: "User Terms", docPath: "EU/1.0/ES/UserTerms.pdf", org: "B01", signedAt: "2026-02-10T11:16:00" },
  { user: "vicky999", userType: "Patient", docType: "User Privacy", docPath: "Israel/1.0/EN/UserPrivacy.pdf", org: "B01", signedAt: "2025-01-27T14:21:00" },
  { user: "vicky999", userType: "Patient", docType: "User Terms", docPath: "Israel/1.0/EN/UserTerms.pdf", org: "B01", signedAt: "2025-01-27T14:21:00" },
  { user: "vicky_dev3_clinic", userType: "Clinic User", docType: "User Privacy", docPath: "EU/1.0/ES/UserPrivacy.pdf", org: "B01", signedAt: "2025-08-17T10:51:00" },
  { user: "vicky_dev3_clinic", userType: "Clinic User", docType: "User Terms", docPath: "EU/1.0/ES/UserTerms.pdf", org: "B01", signedAt: "2025-08-17T10:51:00" },
  { user: "Test2", userType: "Patient", docType: "User Privacy", docPath: "EU/1.0/ES/UserPrivacy.pdf", org: "ATP", signedAt: "2025-02-17T13:48:00" },
  { user: "Test2", userType: "Patient", docType: "User Terms", docPath: "EU/1.0/ES/UserTerms.pdf", org: "ATP", signedAt: "2025-02-17T13:48:00" },
  { user: "Dr_Pranali", userType: "Clinic User", docType: "User Privacy", docPath: "EU/1.0/EN/UserPrivacy.pdf", org: "120", signedAt: "2025-08-13T19:32:00" },
  { user: "Dr_Pranali", userType: "Clinic User", docType: "User Terms", docPath: "EU/1.0/EN/UserTerms.pdf", org: "120", signedAt: "2025-08-13T19:32:00" },
  { user: "sara_patient1", userType: "Patient", docType: "User Privacy", docPath: "EU/1.0/EN/UserPrivacy.pdf", org: "241", signedAt: "2025-05-03T09:10:00" },
  { user: "sara_patient1", userType: "Patient", docType: "User Terms", docPath: "EU/1.0/EN/UserTerms.pdf", org: "241", signedAt: "2025-05-03T09:10:00" },
];

/* Document bodies are keyed by doc type only (not per-org/language) --
   this is a design prototype, so the point is to show the reviewer what
   the "view" action looks like, not to ship real legal copy per locale. */
const TC_DOCUMENT_BODY = {
  "User Privacy": `
    <h3>Privacy Notice</h3>
    <p class="bo-doc-updated">Last updated: January 2026</p>

    <p>You deserve to know how your personal data is used. This Privacy Notice explains what personal data Cordio Medical Ltd. ("Cordio", "we", "us") collects about you through the HearO™ app, why we collect it, and how you can control it.</p>

    <ol>
      <li><a href="#s1">Who we are</a></li>
      <li><a href="#s2">Personal data we collect</a></li>
      <li><a href="#s3">How we use your data</a></li>
      <li><a href="#s4">Who we share your data with</a></li>
      <li><a href="#s5">International transfers</a></li>
      <li><a href="#s6">Security</a></li>
      <li><a href="#s7">Your rights</a></li>
      <li><a href="#s8">Data retention</a></li>
      <li><a href="#s9">Cookies and similar technologies</a></li>
      <li><a href="#s10">Children</a></li>
      <li><a href="#s11">Changes to this notice</a></li>
    </ol>

    <h4 id="s1">1. Who we are</h4>
    <p>Cordio Medical Ltd. offers technology that monitors health conditions by analyzing voice and speech samples using proprietary algorithms, available through its flagship mobile app, HearO™. If you have any questions about our company or your privacy, you can write to us at <a href="mailto:info@cordio-med.com">info@cordio-med.com</a>.</p>

    <h4 id="s2">2. Personal data we collect</h4>
    <p>We collect the information you provide during registration (name, date of birth, phone number, email), the voice recordings you submit through the app, and technical data about your device needed to run the app reliably.</p>

    <h4 id="s3">3. How we use your data</h4>
    <p>Your data is used to operate the app, generate the health insights your care team relies on, send you reminders and notifications, and improve the accuracy of our monitoring algorithms.</p>

    <h4 id="s4">4. Who we share your data with</h4>
    <p>We share data only with your care team and the service providers that help us run the platform, under contracts that require them to protect your data to the same standard we do.</p>

    <h4 id="s5">5. International transfers</h4>
    <p>Where data is transferred outside your country, we apply appropriate safeguards required by applicable data protection law.</p>

    <h4 id="s6">6. Security</h4>
    <p>We apply administrative, technical, and physical safeguards designed to protect your personal data against unauthorized access, alteration, or loss.</p>

    <h4 id="s7">7. Your rights</h4>
    <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data, and to object to certain uses of it. Contact us to exercise these rights.</p>

    <h4 id="s8">8. Data retention</h4>
    <p>We retain your data only for as long as necessary for the purposes described in this notice, or as required by law.</p>

    <h4 id="s9">9. Cookies and similar technologies</h4>
    <p>The app may use similar technologies to remember your preferences and keep you signed in.</p>

    <h4 id="s10">10. Children</h4>
    <p>The app is not directed at children, and we do not knowingly collect personal data from them without appropriate consent.</p>

    <h4 id="s11">11. Changes to this notice</h4>
    <p>We may update this notice from time to time. We will notify you of material changes through the app.</p>
  `,
  "User Terms": `
    <h3>Terms of Use</h3>
    <p class="bo-doc-updated">Last updated: January 2026</p>

    <p>These Terms of Use govern your access to and use of the HearO™ app, provided by Cordio Medical Ltd. ("Cordio", "we", "us"). By creating an account or using the app, you agree to these terms.</p>

    <ol>
      <li><a href="#t1">Eligibility</a></li>
      <li><a href="#t2">Your account</a></li>
      <li><a href="#t3">Acceptable use</a></li>
      <li><a href="#t4">Not a substitute for medical advice</a></li>
      <li><a href="#t5">Intellectual property</a></li>
      <li><a href="#t6">Termination</a></li>
      <li><a href="#t7">Disclaimers and liability</a></li>
      <li><a href="#t8">Governing law</a></li>
      <li><a href="#t9">Changes to these terms</a></li>
    </ol>

    <h4 id="t1">1. Eligibility</h4>
    <p>You must be enrolled by a participating clinic or care team to use the app, and you must provide accurate registration information.</p>

    <h4 id="t2">2. Your account</h4>
    <p>You are responsible for keeping your login credentials confidential and for all activity that occurs under your account.</p>

    <h4 id="t3">3. Acceptable use</h4>
    <p>You agree to use the app only for its intended purpose of submitting voice readings and receiving related guidance from your care team, and not to misuse, reverse-engineer, or interfere with the app.</p>

    <h4 id="t4">4. Not a substitute for medical advice</h4>
    <p>The app supports your care team's monitoring of your condition but does not replace professional medical advice, diagnosis, or treatment. Always consult your care team with questions about your health.</p>

    <h4 id="t5">5. Intellectual property</h4>
    <p>All content, trademarks, and technology in the app remain the property of Cordio or its licensors.</p>

    <h4 id="t6">6. Termination</h4>
    <p>Your care team or Cordio may suspend or end your access to the app in accordance with your enrollment agreement.</p>

    <h4 id="t7">7. Disclaimers and liability</h4>
    <p>The app is provided "as is." To the extent permitted by law, Cordio disclaims liability for indirect or consequential damages arising from your use of the app.</p>

    <h4 id="t8">8. Governing law</h4>
    <p>These terms are governed by the laws applicable in the jurisdiction where your enrolling clinic operates.</p>

    <h4 id="t9">9. Changes to these terms</h4>
    <p>We may update these terms from time to time. Continued use of the app after an update constitutes acceptance of the revised terms.</p>
  `,
};
