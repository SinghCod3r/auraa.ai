import nodemailer from "nodemailer";
import * as brevo from '@getbrevo/brevo';

async function testGmail(name, user, pass) {
  console.log(`\n--- Testing ${name} ---`);
  const sanitizedPass = (pass || "").replace(/\s/g, "");
  console.log("User:", user);
  console.log("Pass (sanitized):", sanitizedPass ? "****" : "MISSING");

  if (!user || !sanitizedPass) {
    console.error(`❌ ${name}: user or pass missing.`);
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: sanitizedPass },
  });

  try {
    await transporter.verify();
    console.log(`✅ ${name}: Connection Success!`);
  } catch (error) {
    console.error(`❌ ${name}: Failed:`, error.message);
  }
}

async function testBrevo(apiKey) {
  console.log(`\n--- Testing Brevo API ---`);
  if (!apiKey || apiKey.includes("...")) {
    console.error("❌ Brevo: API Key missing or masked.");
    return;
  }

  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = "Test Email";
  sendSmtpEmail.htmlContent = "<html><body>Testing Brevo API key</body></html>";
  sendSmtpEmail.sender = { email: "amarjeet9305@gmail.com", name: "Aura.Ai Test" };
  sendSmtpEmail.to = [{ email: "amarjeet9305@gmail.com", name: "Amarjeet" }];

  try {
    // We try to call a simple method or send a test email
    // Sending is the only way to be 100% sure the key is valid for sending
    console.log("Attempting to get account details (to verify key)...");
    const accountApi = new brevo.AccountApi();
    accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, apiKey);
    const data = await accountApi.getAccount();
    console.log(`✅ Brevo: Success! Account: ${data.email}`);
  } catch (error) {
    console.error(`❌ Brevo: Failed:`, error.message || error);
  }
}

async function runDiagnostics() {
  const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
  const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s/g, "");
  const SMTP_USER = (process.env.SMTP_USER || "").trim();
  const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s/g, "");
  const BREVO_API_KEY = process.env.BREVO_API_KEY;

  await testGmail("Gmail (SMTP_USER/PASS)", SMTP_USER, SMTP_PASS);
  await testGmail("Gmail (EMAIL_USER/PASS)", EMAIL_USER, EMAIL_PASS);
  await testBrevo(BREVO_API_KEY);
}

runDiagnostics();
