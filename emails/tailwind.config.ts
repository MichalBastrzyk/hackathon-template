import { pixelBasedPreset } from "@react-email/components";
import type { Config } from "tailwindcss";

const colors = {
  background: "#FFFFFF",
  foreground: "#0C0A09",
  destructive: "#E7000B",
  border: "#E7E5E4",
  input: "#E7E5E4",
  ring: "#A6A09B",

  primary: {
    DEFAULT: "#1C1917",
    foreground: "#FAFAF9",
  },
  secondary: {
    DEFAULT: "#F5F5F4",
    foreground: "#1C1917",
  },
  muted: {
    DEFAULT: "#F5F5F4",
    foreground: "#79716B",
  },
  accent: {
    DEFAULT: "#F5F5F4",
    foreground: "#1C1917",
  },
} as const;

const borderRadius = {
  sm: "6px",
  md: "8px",
  lg: "10px",
  xl: "14px",
} as const;

/**
 * Shared Tailwind configuration for React Email templates
 *
 * Usage in email templates:
 * ```tsx
 * import { Tailwind } from "@react-email/components";
 * import { emailTailwindConfig } from "./tailwind.config";
 *
 * <Tailwind config={emailTailwindConfig}>
 *   {/* Your email content *\/}
 * </Tailwind>
 * ```
 */
export const emailTailwindConfig: Omit<Config, "content"> = {
  presets: [pixelBasedPreset],

  theme: {
    extend: {
      colors,
      borderRadius,
    },
  },
} as const;
