/**
 * Convert OKLCH string to Hex
 * @param oklchString - OKLCH color string (e.g., "oklch(70% 0.15 30)" or "oklch(0.7 0.15 30deg)")
 * @returns Hex color string (e.g., "#ff5733") or 8-char hex with alpha (e.g., "#ff573380")
 */
export function oklchToHex(oklchString: string): string {
  const match = oklchString.match(
    /oklch\s*\(\s*([0-9.]+)(%?)\s+([0-9.]+)\s+([0-9.]+)(deg)?(?:\s*\/\s*([0-9.]+)(%?))?\s*\)/i,
  );

  if (!match) {
    throw new Error(`Invalid OKLCH string format: "${oklchString}"`);
  }

  let l = parseFloat(match[1]);
  const lIsPercent = match[2] === "%";
  const c = parseFloat(match[3]);
  const h = parseFloat(match[4]);
  let alpha: number | null = match[6] ? parseFloat(match[6]) : null;
  const alphaIsPercent = match[7] === "%";

  if (lIsPercent) {
    l = l / 100;
  }
  if (alpha !== null && alphaIsPercent) {
    alpha = alpha / 100;
  }

  const hRad = (h * Math.PI) / 180;
  const a_lab = c * Math.cos(hRad);
  const b_lab = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a_lab + 0.2158037573 * b_lab;
  const m_ = l - 0.1055613458 * a_lab - 0.0638541728 * b_lab;
  const s_ = l - 0.0894841775 * a_lab - 1.291485548 * b_lab;

  const lms_l = l_ * l_ * l_;
  const lms_m = m_ * m_ * m_;
  const lms_s = s_ * s_ * s_;

  let r = +4.0767416621 * lms_l - 3.3077115913 * lms_m + 0.2309699292 * lms_s;
  let g = -1.2684380046 * lms_l + 2.6097574011 * lms_m - 0.3413193965 * lms_s;
  let b = -0.0041960863 * lms_l - 0.7034186147 * lms_m + 1.707614701 * lms_s;

  r = linearToSrgb(r);
  g = linearToSrgb(g);
  b = linearToSrgb(b);

  const r8 = Math.max(0, Math.min(255, Math.round(r * 255)));
  const g8 = Math.max(0, Math.min(255, Math.round(g * 255)));
  const b8 = Math.max(0, Math.min(255, Math.round(b * 255)));

  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  let hex = `#${toHex(r8)}${toHex(g8)}${toHex(b8)}`;

  if (alpha !== null) {
    const a8 = Math.max(0, Math.min(255, Math.round(alpha * 255)));
    hex += toHex(a8);
  }

  return hex;
}

function linearToSrgb(val: number): number {
  if (val <= 0) {
    return 0;
  }
  if (val <= 0.0031308) {
    return 12.92 * val;
  }
  return 1.055 * val ** (1 / 2.4) - 0.055;
}
