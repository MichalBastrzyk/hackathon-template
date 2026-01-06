import type { ReactElement } from "react";

/**
 * Email send options
 * Defines the structure for sending emails through the email client
 */
export interface SendEmailOptions {
  /** Recipient email address */
  to: string;
  /** Email subject line */
  subject: string;
  /** React Email component to render as HTML */
  reactEmailTemplate: ReactElement;
  /** Optional plain text version (auto-generated if not provided) */
  text?: string;
  /** Optional reply-to address */
  replyTo?: string;
}

/**
 * Email send result
 * Contains information about the email sending operation
 */
export interface EmailSendResult {
  /** Whether the email was sent successfully */
  success: boolean;
  /** Unique message ID from the SMTP server */
  messageId?: string;
  /** Error message if sending failed */
  error?: string;
  /** Preview URL for email (e.g., from Ethereal or MailHog) */
  previewUrl?: string;
}
