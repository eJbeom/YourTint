import * as Generator from "../app/core/palette-generator";
import { RGB } from "../types/color";

export function generatePalette(code: RGB): RGB[] {
  const normRGB: RGB = Generator.hsb2rgb(
    Generator.rgb2hsb(Generator.hex2rgb(Generator.rgb2hex(code)))
  );

  return Generator.generateAccentPalette(normRGB);
}

export function denormalizeRGBS(rgbs: RGB[]): RGB[] {
  return rgbs.map((rgb: RGB, i: number) => {
    return denormalizeRGB(rgb);
  });
}

export function denormalizeRGB(rgb: RGB): RGB {
  return {
    red: Math.round(rgb.red * 255),
    green: Math.round(rgb.green * 255),
    blue: Math.round(rgb.blue * 255),
  };
}

export function normalizeRGBS(rgbs: RGB[]): RGB[] {
  return rgbs.map((rgb) => normalizeRGB(rgb));
}

export function normalizeRGB(rgb: RGB): RGB {
  return {
    red: rgb.red / 255,
    green: rgb.green / 255,
    blue: rgb.blue / 255,
  };
}

export function normalizeRGBGamma(rgb: RGB) {
  function applyGammaCorrection(value: number) {
    let normalized = value / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  }

  return {
    red: applyGammaCorrection(rgb.red),
    green: applyGammaCorrection(rgb.green),
    blue: applyGammaCorrection(rgb.blue),
  };
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
