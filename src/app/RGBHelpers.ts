import * as Generator from "./core/palette-generator";
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

export function normalizeRGB(rgb: RGB): RGB {
  return {
    red: rgb.red / 255,
    green: rgb.green / 255,
    blue: rgb.blue / 255,
  };
}
