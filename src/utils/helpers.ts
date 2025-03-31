import { normalizeRGBGamma } from "./RGBHelpers";
import { RGB } from "../types/color";

export function bogan(p1: number, p2: number, c: number): number {
  return p1 + (p2 - p1) * c;
}

export function contrastRatio(rgb1: RGB, rgb2: RGB) {
  const r1 = normalizeRGBGamma(rgb1);
  const r2 = normalizeRGBGamma(rgb2);
  const r1Brightness = 0.2126 * r1.red + 0.7152 * r1.green + 0.0722 * r1.blue;
  const r2Brightness = 0.2126 * r2.red + 0.7152 * r2.green + 0.0722 * r2.blue;

  return r1Brightness >= r2Brightness
    ? (r1Brightness + 0.05) / (r2Brightness + 0.05)
    : (r2Brightness + 0.05) / (r1Brightness + 0.05);
}
