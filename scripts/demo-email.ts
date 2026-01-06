/**
 * Email Demo Script
 * Sends a test verification email to demonstrate the email pipeline
 * Run with: npm run demo:email or node --import tsx scripts/demo-email.ts
 */

import { VerificationEmail } from "../emails/verification-email";
import { emailClient } from "../src/server/email";

async function main() {
  console.log("=== Email Demo Script ===\n");

  // Display current configuration
  const config = emailClient.getConfig();
  console.log("SMTP Configuration:");
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Secure: ${config.secure}`);
  console.log(`  From: ${config.from.name} <${config.from.email}>\n`);

  // Verify SMTP connection
  console.log("Verifying SMTP connection...");
  const isConnected = await emailClient.verifyConnection();
  if (!isConnected) {
    console.error("❌ Failed to connect to SMTP server");
    console.error(
      "Make sure MailHog is running: docker-compose up -d mailhog",
    );
    process.exit(1);
  }
  console.log("✅ SMTP connection verified\n");

  // Send test verification email
  console.log("Sending test verification email...");
  const verificationUrl = "http://localhost:3000/auth/verify?token=demo-token-123";
  const result = await emailClient.sendEmail({
    to: "test@example.com",
    subject: "Verify Your Email Address - Demo",
    reactEmailTemplate: VerificationEmail({
      userName: "Demo User",
      verificationUrl,
      verificationToken: "demo-token-123",
      expiresIn: "24 hours",
    }),
  });

  if (result.success) {
    console.log("✅ Email sent successfully!");
    console.log(`   Message ID: ${result.messageId}`);
    if (result.previewUrl) {
      console.log(`   Preview URL: ${result.previewUrl}`);
      console.log("\n📧 Open MailHog to view the email:");
      console.log(`   ${result.previewUrl}\n`);
    }
  } else {
    console.error("❌ Failed to send email:");
    console.error(`   ${result.error}\n`);
    process.exit(1);
  }

  console.log("=== Demo Complete ===");
}

// Run the demo
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
