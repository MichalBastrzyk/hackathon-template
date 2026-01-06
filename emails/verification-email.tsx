/**
 * Email Verification Template
 * Uses React Email with TailwindCSS v4 utility classes
 * Supports dark mode and includes plaintext fallback
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

export interface VerificationEmailProps {
  /** User's name or email for personalized greeting */
  userName?: string;
  /** Verification URL with token */
  verificationUrl: string;
  /** Verification token (shown as fallback) */
  verificationToken?: string;
  /** Expiration time for the verification link */
  expiresIn?: string;
}

/**
 * Email Verification Component
 * Renders a professional verification email with CTA button
 */
export function VerificationEmail({
  userName = "there",
  verificationUrl,
  verificationToken,
  expiresIn = "24 hours",
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address to complete your registration</Preview>
      <Tailwind>
        <Body className="mx-auto my-auto bg-white px-2 font-sans">
          <Container className="mx-auto my-10 max-w-[500px] rounded-lg border border-solid border-gray-200 p-5">
            {/* Header Section */}
            <Section className="mt-8">
              <Heading className="mx-0 my-7 p-0 text-center text-2xl font-semibold text-gray-900">
                Verify Your Email Address
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Text className="text-base leading-6 text-gray-700">
                Hello {userName},
              </Text>
              <Text className="text-base leading-6 text-gray-700">
                Thank you for signing up! Please verify your email address by
                clicking the button below. This link will expire in{" "}
                <strong>{expiresIn}</strong>.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="mb-8 text-center">
              <Button
                href={verificationUrl}
                className="rounded-md bg-blue-600 px-5 py-3 text-center text-base font-semibold text-white no-underline"
              >
                Verify Email Address
              </Button>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-8">
              <Text className="text-sm leading-6 text-gray-600">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Link
                href={verificationUrl}
                className="break-all text-sm text-blue-600 underline"
              >
                {verificationUrl}
              </Link>
            </Section>

            {/* Token Section (optional) */}
            {verificationToken && (
              <Section className="mb-8">
                <Text className="text-sm leading-6 text-gray-600">
                  Alternatively, you can use this verification code:
                </Text>
                <Text className="rounded-md bg-gray-100 px-4 py-2 font-mono text-sm text-gray-900">
                  {verificationToken}
                </Text>
              </Section>
            )}

            {/* Security Notice */}
            <Section className="mb-4">
              <Text className="text-sm leading-6 text-gray-600">
                If you didn&apos;t create an account, you can safely ignore this
                email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-8 border-t border-solid border-gray-200 pt-4">
              <Text className="text-center text-xs leading-6 text-gray-500">
                This is an automated message, please do not reply.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

// Default export for React Email preview
export default VerificationEmail;
