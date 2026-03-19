import nodemailer from "nodemailer";

async function testConfig(name, user, pass, extraOpts = {}) {
  console.log(`--- Testing ${name} ---`);
  console.log("User:", user);
  const sanitizedPass = (pass || "").replace(/\s/g, "");
  console.log("Pass (sanitized):", sanitizedPass ? "****" : "MISSING");

  if (!user || !sanitizedPass) {
    console.error(`❌ ${name}: user or pass missing.`);
    return false;
  }

  const transporter = nodemailer.createTransport({
    ...extraOpts,
    auth: {
      user: user,
      pass: sanitizedPass,
    },
  });

  try {
    await transporter.verify();
    console.log(`✅ ${name}: Success!`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}: Failed:`, error.message);
    return false;
  }
}

async function runTests() {
  const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
  const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s/g, "");
  const SMTP_USER = (process.env.SMTP_USER || "").trim();
  const SMTP_PASS = (process.env.SMTP_PASS || "").replace(/\s/g, "");

  // Test 1: service: "gmail" with SMTP_PASS
  await testConfig("Gmail Service + SMTP_PASS", SMTP_USER, SMTP_PASS, { service: "gmail" });

  // Test 2: service: "gmail" with EMAIL_PASS
  await testConfig("Gmail Service + EMAIL_PASS", EMAIL_USER, EMAIL_PASS, { service: "gmail" });

  // Test 3: SMTP Host/Port with SMTP_PASS
  await testConfig("SMTP Host/Port + SMTP_PASS", SMTP_USER, SMTP_PASS, {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: false }
  });

  // Test 4: SMTP Host/Port with EMAIL_PASS
  await testConfig("SMTP Host/Port + EMAIL_PASS", EMAIL_USER, EMAIL_PASS, {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    tls: { rejectUnauthorized: false }
  });
}

runTests();
