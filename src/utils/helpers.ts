import { normalizeRGB, normalizeRGBGamma } from "../app/utils/RGBHelpers";
import { hexCode, RGB } from "../types/color";

export const RGBSToString = (rgbs: RGB[]): string[] => {
  return rgbs.map((rgb) => RGBToString(rgb));
};

export const RGBToString = (rgb: RGB): string => {
  return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
};

export const stringToRGBS = (str: string[]): RGB[] | undefined => {
  const rgbs: RGB[] = [];

  for (let i = 0; i < str.length; i++) {
    const rgb = stringToRGB(str[i]);

    if (rgb === undefined) return undefined;

    rgbs.push(rgb);
  }

  return rgbs;
};

export const stringToRGB = (str: string): RGB | undefined => {
  const reg = RegExp("\\d+, \\d+, \\d+").exec(str);
  if (reg) {
    const rgb = reg[0].split(",").map((v) => parseInt(v));

    return { red: rgb[0], green: rgb[1], blue: rgb[2] };
  }

  return undefined;
};

export function bogan(p1: number, p2: number, c: number): number {
  return p1 + (p2 - p1) * c;
}

export function findClosestRGB(rgb: RGB, palette: RGB[]): RGB {
  let closest = Infinity;
  let index = 0;

  for (let i = 0; i < palette.length; i++) {
    const calculate =
      Math.abs(rgb.red - palette[i].red) +
      Math.abs(rgb.green - palette[i].green) +
      Math.abs(rgb.blue - palette[i].blue);

    if (calculate < closest) {
      index = i;
      closest = calculate;
    }
  }

  return {
    red: palette[index].red,
    green: palette[index].green,
    blue: palette[index].blue,
  };
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
