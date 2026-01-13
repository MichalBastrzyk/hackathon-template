#!/usr/bin/env bun

import { oklchToHex } from "@/lib/color";

const GLOBALS_PATH = "src/styles/globals.css";
const CONFIG_PATH = "emails/tailwind.config.ts";

const COLOR_MAP = {
  background: "background",
  foreground: "foreground",
  primary: "primary.DEFAULT",
  "primary-foreground": "primary.foreground",
  secondary: "secondary.DEFAULT",
  "secondary-foreground": "secondary.foreground",
  muted: "muted.DEFAULT",
  "muted-foreground": "muted.foreground",
  accent: "accent.DEFAULT",
  "accent-foreground": "accent.foreground",
  destructive: "destructive",
  border: "border",
  input: "input",
  ring: "ring",
} as const;

async function main() {
  const css = await Bun.file(GLOBALS_PATH).text();

  // Extract :root block (light theme only)
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootMatch) {
    throw new Error("Could not find :root block in globals.css");
  }
  const rootBlock = rootMatch[1];

  // --- Colors ---
  const colors = extractColors(rootBlock);
  const colorsCode = generateColorsCode(colors);

  // --- Border Radius ---
  const borderRadius = extractBorderRadius(rootBlock);
  const borderRadiusCode = generateBorderRadiusCode(borderRadius);

  // Read and update config
  let config = await Bun.file(CONFIG_PATH).text();

  // Replace colors block
  const colorsBlockRegex = /const colors = \{[\s\S]*?\} as const;/;
  if (!colorsBlockRegex.test(config)) {
    throw new Error("Could not find colors block in tailwind.config.ts");
  }
  config = config.replace(colorsBlockRegex, colorsCode);

  // Replace borderRadius block
  const radiusBlockRegex = /const borderRadius = \{[\s\S]*?\} as const;/;
  if (!radiusBlockRegex.test(config)) {
    throw new Error("Could not find borderRadius block in tailwind.config.ts");
  }
  config = config.replace(radiusBlockRegex, borderRadiusCode);

  await Bun.write(CONFIG_PATH, config);

  console.log("✅ Updated emails/tailwind.config.ts");
  console.log("\nColors:");
  console.log(JSON.stringify(colors, null, 2));
  console.log("\nBorder Radius:");
  console.log(JSON.stringify(borderRadius, null, 2));
}

function extractColors(
  rootBlock: string,
): Record<string, string | Record<string, string>> {
  const varRegex = /--([a-z-]+):\s*(oklch\([^)]+\))/gi;
  const cssVars: Record<string, string> = {};

  for (const match of rootBlock.matchAll(varRegex)) {
    const [, name, value] = match;
    cssVars[name] = value;
  }

  const colors: Record<string, string | Record<string, string>> = {};

  for (const [cssVar, configPath] of Object.entries(COLOR_MAP)) {
    const oklchValue = cssVars[cssVar];
    if (!oklchValue) {
      console.warn(`⚠️  Missing CSS var: --${cssVar}`);
      continue;
    }

    const hex = oklchToHex(oklchValue).toUpperCase();

    if (configPath.includes(".")) {
      const [parent, child] = configPath.split(".");
      if (!colors[parent]) colors[parent] = {};
      (colors[parent] as Record<string, string>)[child] = hex;
    } else {
      colors[configPath] = hex;
    }
  }

  return colors;
}

function extractBorderRadius(rootBlock: string): Record<string, string> {
  const radiusMatch = rootBlock.match(/--radius:\s*([0-9.]+)rem/);
  if (!radiusMatch) {
    console.warn("⚠️  Could not find --radius in :root, using defaults");
    return { sm: "6px", md: "8px", lg: "10px", xl: "14px" };
  }

  const baseRem = parseFloat(radiusMatch[1]);
  const basePx = Math.round(baseRem * 16); // 1rem = 16px

  return {
    sm: `${Math.max(0, basePx - 4)}px`,
    md: `${Math.max(0, basePx - 2)}px`,
    lg: `${basePx}px`,
    xl: `${basePx + 4}px`,
  };
}

function generateColorsCode(
  colors: Record<string, string | Record<string, string>>,
): string {
  const lines: string[] = ["const colors = {"];

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      lines.push(`  ${key}: "${value}",`);
    }
  }

  lines.push("");

  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "object") {
      lines.push(`  ${key}: {`);
      for (const [subKey, subValue] of Object.entries(value)) {
        lines.push(`    ${subKey}: "${subValue}",`);
      }
      lines.push("  },");
    }
  }

  lines.push("} as const;");
  return lines.join("\n");
}

function generateBorderRadiusCode(radius: Record<string, string>): string {
  const lines: string[] = ["const borderRadius = {"];
  for (const [key, value] of Object.entries(radius)) {
    lines.push(`  ${key}: "${value}",`);
  }
  lines.push("} as const;");
  return lines.join("\n");
}

main().catch(console.error);
