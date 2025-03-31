import { RGB } from "./color";

export interface FigmaPayload {
  type: string;
  data?: AddStyles | RGB;
}

export interface AddStyles {
  name: string;
  rgbs: RGB[];
}
