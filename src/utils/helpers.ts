import { RGB } from "../types/color";

export const RGBSToString = (rgbs: RGB[]): string[] => {
  return rgbs.map((rgb) => RGBToString(rgb));
};

export const RGBToString = (rgb: RGB): string => {
  return `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue})`;
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
