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

export interface YourEmailProps {
  userName?: string;
  actionUrl: string;
  description?: string;
}

export function YourEmail({
  userName = "there",
  actionUrl,
  description,
}: YourEmailProps) {
  return (
    <Html>
      <Preview>Preview text shown in email inbox (max 100 chars)</Preview>
      <Tailwind config={emailTailwindConfig}>
        <Head />
        <Body className="mx-auto my-auto bg-background px-2 font-sans antialiased">
          <Container className="mx-auto my-16 max-w-[480px]">
            {/* Header Section */}
            <Section className="mb-12">
              <Heading className="mx-0 mt-0 mb-4 p-0 text-left font-semibold text-[26px] text-foreground tracking-tight">
                Email heading
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="mb-10">
              <Text className="m-0 mb-4 text-[17px] text-foreground leading-[1.6]">
                Hi {userName},
              </Text>
              <Text className="m-0 mb-4 text-[17px] text-foreground leading-[1.6]">
                Your email content goes here. Use multiple Text components for
                paragraphs.
              </Text>
              {description && (
                <Text className="m-0 mb-4 text-[17px] text-foreground leading-[1.6]">
                  {description}
                </Text>
              )}
            </Section>

            {/* CTA Button (optional) */}
            <Section className="mb-10 text-center">
              <Button
                href={actionUrl}
                className="inline-block w-full rounded-lg bg-primary px-6 py-4 text-center font-medium text-base text-primary-foreground no-underline sm:w-auto"
              >
                Action button text
              </Button>
            </Section>

            {/* Fallback Link (if button is used) */}
            <Section className="mb-10">
              <Text className="m-0 mb-2 text-[13px] text-muted-foreground leading-[1.6]">
                Button not working? Copy this link into your browser:
              </Text>
              <Link
                href={actionUrl}
                className="break-all text-[13px] text-primary underline"
              >
                {actionUrl}
              </Link>
            </Section>

            {/* Additional Information (optional) */}
            <Section className="mb-0">
              <Text className="m-0 text-[13px] text-muted-foreground leading-[1.6]">
                Additional context or security notice goes here.
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

export default YourEmail;

YourEmail.PreviewProps = {
  userName: "Alex",
  actionUrl: "https://example.com/action",
  description: "Optional additional context",
} satisfies YourEmailProps;
