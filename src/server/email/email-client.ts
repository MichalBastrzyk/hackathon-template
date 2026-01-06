import { render } from "@react-email/components";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

import { env } from "@/env";

import type { EmailSendResult, SendEmailOptions } from "./types";

/**
 * Email Client Service
 * Handles all email operations using Nodemailer with React Email templates
 * Configured via environment variables for easy provider switching
 */
class EmailClient {
  private transporter: Transporter;

  constructor() {
    this.transporter = this.createTransporter();
  }

  /**
   * Creates and configures the Nodemailer transporter
   * Uses SMTP settings from environment variables
   * Supports switching between providers (MailHog, Gmail, SendGrid, etc.)
   */
  private createTransporter(): Transporter {
    const config = {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      ...(env.SMTP_USER &&
        env.SMTP_PASSWORD && {
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD,
          },
        }),
    };

    // Log configuration in development (excluding sensitive data)
    if (env.NODE_ENV === "development") {
      console.log("[EmailClient] SMTP Configuration:", {
        host: config.host,
        port: config.port,
        secure: config.secure,
        hasAuth: Boolean(config.auth),
      });
    }

    return nodemailer.createTransport(config);
  }

  /**
   * Verify SMTP connection
   * Tests the connection to the SMTP server
   * @returns Promise that resolves if connection is successful
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      if (env.NODE_ENV === "development") {
        console.log("[EmailClient] SMTP connection verified successfully");
      }
      return true;
    } catch (error) {
      console.error(
        "[EmailClient] SMTP connection verification failed:",
        error,
      );
      return false;
    }
  }

  /**
   * Send an email using React Email template
   * @param options - Email options including recipient, subject, and template
   * @returns Result object with success status and details
   */
  async sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
    try {
      // Render React Email component to HTML
      const html = await render(options.reactEmailTemplate, {
        pretty: env.NODE_ENV === "development",
      });

      // Render plain text version if not provided
      const text =
        options.text ??
        (await render(options.reactEmailTemplate, {
          plainText: true,
        }));

      // Prepare email payload
      const mailOptions = {
        from: {
          name: env.SMTP_FROM_NAME,
          address: env.SMTP_FROM_EMAIL,
        },
        to: options.to,
        subject: options.subject,
        html,
        text,
        ...(options.replyTo && { replyTo: options.replyTo }),
      };

      // Log email payload in development
      if (env.NODE_ENV === "development") {
        console.log("[EmailClient] Sending email:", {
          to: mailOptions.to,
          subject: mailOptions.subject,
          from: mailOptions.from,
        });
      }

      // Send email
      const info = await this.transporter.sendMail(mailOptions);

      // Log success
      if (env.NODE_ENV === "development") {
        console.log("[EmailClient] Email sent successfully:", {
          messageId: info.messageId,
          response: info.response,
        });
      }

      // Generate preview URL for MailHog
      const previewUrl =
        env.SMTP_HOST === "localhost" && env.SMTP_PORT === 1025
          ? `http://localhost:8025`
          : undefined;

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      console.error("[EmailClient] Failed to send email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current transporter configuration
   * Useful for debugging and testing
   */
  getConfig() {
    return {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      from: {
        email: env.SMTP_FROM_EMAIL,
        name: env.SMTP_FROM_NAME,
      },
    };
  }
}

// Export singleton instance
export const emailClient = new EmailClient();

// Export class for testing or custom instances
export { EmailClient };
