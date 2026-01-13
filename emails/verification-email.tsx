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
  Tailwind,
  Text,
} from "@react-email/components";

import { emailTailwindConfig } from "./tailwind.config";

export interface VerificationEmailProps {
  userName?: string;
  verificationUrl: string;
  verificationToken?: string;
  expiresIn?: string;
}

export function VerificationEmail({
  userName = "there",
  verificationUrl,
  verificationToken,
  expiresIn = "24 hours",
}: VerificationEmailProps) {
  return (
    <Html>
      <Preview>Verify your email address</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Head />
        <Body className="mx-auto my-auto bg-background px-2 font-sans antialiased">
          <Container className="mx-auto my-16 max-w-[480px]">
            {/* Header Section */}
            <Section className="mb-12">
              <Heading className="mx-0 mt-0 mb-4 p-0 text-left font-semibold text-[26px] text-foreground tracking-tight">
                Verify your email
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-10">
              <Text className="m-0 mb-4 text-[17px] text-foreground leading-[1.6]">
                Hi {userName},
              </Text>
              <Text className="m-0 mb-4 text-[17px] text-foreground leading-[1.6]">
                Thanks for signing up. Click the button below to verify your
                email address. Link expires in <strong>{expiresIn}</strong>.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="mb-10">
              <table
                className="w-full"
                align="center"
                role="presentation"
                cellPadding="0"
                cellSpacing="0"
              >
                <tbody>
                  <tr>
                    <td className="text-center">
                      <Button
                        href={verificationUrl}
                        className="inline-block w-full max-w-full rounded-lg bg-primary px-6 py-4 text-center font-medium text-base text-primary-foreground no-underline sm:w-auto"
                        style={{
                          minWidth: "160px",
                          boxSizing: "border-box",
                          maxWidth: "100%",
                        }}
                      >
                        Verify email
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Section>

            {/* Fallback Link */}
            <Section className="mb-10">
              <Text className="m-0 mb-2 text-[13px] text-muted-foreground leading-[1.6]">
                Button not working? Copy this link into your browser:
              </Text>
              <Link
                href={verificationUrl}
                className="break-all text-[13px] text-primary underline"
              >
                {verificationUrl}
              </Link>
            </Section>

            {/* Token Section (optional) */}
            {verificationToken && (
              <Section className="mb-10">
                <Text className="m-0 mb-3 text-[13px] text-muted-foreground leading-[1.6]">
                  Or use this verification code:
                </Text>
                <Text className="m-0 inline-block rounded-lg bg-secondary px-4 py-3 font-mono text-foreground text-sm">
                  {verificationToken}
                </Text>
              </Section>
            )}

            {/* Security Notice */}
            <Section className="mb-0">
              <Text className="m-0 text-[13px] text-muted-foreground leading-[1.6]">
                Didn&apos;t create an account? You can safely ignore this email.
              </Text>
            </Section>

            {/* Footer */}
            <Section className="mt-16 border-border border-t pt-6">
              <Text className="m-0 text-center text-[12px] text-muted-foreground/60 leading-normal">
                Automated message — no replies please.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default VerificationEmail;

VerificationEmail.PreviewProps = {
  userName: "Alex",
  verificationUrl: "https://example.com/auth/verify-email?token=abc123xyz789",
  verificationToken: "ABC123XYZ789",
  expiresIn: "24 hours",
} satisfies VerificationEmailProps;
