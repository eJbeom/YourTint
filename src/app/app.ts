import * as Generator from "./core/palette-generator";
import { bogan, RGBToString, RGBSToString } from "../utils/helpers";
import {
  generatePalette,
  denormalizeRGBS,
  denormalizeRGB,
  normalizeRGB,
} from "./RGBHelpers";
import { RGB } from "../types/color";
import { FigmaPayload } from "../types/data";

export default class App {
  input: HTMLInputElement;
  preview: HTMLButtonElement;
  tints: HTMLOListElement;
  addStylesBtn: HTMLButtonElement;
  borderManager: number[];
  colorManager: RGB[];
  mainColorIndex: number;
  denormMainRGB: RGB;
  palette: RGB[];

  constructor() {
    this.input = document.getElementById("hexInput") as HTMLInputElement;
    this.preview = document.querySelector(".preview") as HTMLButtonElement;
    this.tints = document.querySelector(".tints") as HTMLOListElement;
    this.addStylesBtn = document.getElementById(
      "addStylesBtn"
    ) as HTMLButtonElement;

    this.borderManager = Array(10).fill(0);
    this.colorManager = Array.from({ length: 10 }, () => {
      return { red: 255, green: 255, blue: 255 };
    });
    this.mainColorIndex = 0;
    this.denormMainRGB = {
      red: 255,
      green: 255,
      blue: 255,
    };
    this.palette = Array.from({ length: 10 }, () => {
      return { red: 255, green: 255, blue: 255 };
    });

    this.input.addEventListener("change", this.handleInputChange.bind(this));
    this.addStylesBtn.addEventListener(
      "click",
      this.handleAddStylesClick.bind(this)
    );

    this.update();

    window.addEventListener("message", this.handleMessage.bind(this));
  }

  update() {
    window.requestAnimationFrame(this.update.bind(this));

    this.postMessageToFigma({ type: "mouseOut" });

    // color animation
    for (let i = 0; i < this.palette.length; i++) {
      const curColor = this.colorManager[i];
      const targetColor = this.palette[i];
      const tint = this.tints.children[i] as HTMLLIElement;

      const red = bogan(curColor.red, targetColor.red, 0.11);
      const green = bogan(curColor.green, targetColor.green, 0.11);
      const blue = bogan(curColor.blue, targetColor.blue, 0.11);

      tint.style.backgroundColor = RGBToString({
        red: red,
        green: green,
        blue: blue,
      });

      this.colorManager[i].red = red;
      this.colorManager[i].green = green;
      this.colorManager[i].blue = blue;
    }

    // border animation
    const curTint = this.tints.children[this.mainColorIndex] as HTMLLIElement;

    this.borderManager[this.mainColorIndex] = bogan(
      this.borderManager[this.mainColorIndex],
      20,
      0.28
    );
    curTint.style.borderRadius = this.borderManager[this.mainColorIndex] + "px";

    for (let i = 0; i < this.borderManager.length; i++) {
      if (this.mainColorIndex === i) continue;
      const clearTint = this.tints.children[i] as HTMLLIElement;

      this.borderManager[i] = bogan(this.borderManager[i], 0, 0.28);
      if (i === 0) {
        clearTint.style.borderBottomLeftRadius = this.borderManager[i] + "px";
        clearTint.style.borderBottomRightRadius = this.borderManager[i] + "px";
      } else if (i === this.borderManager.length - 1) {
        clearTint.style.borderTopLeftRadius = this.borderManager[i] + "px";
        clearTint.style.borderTopRightRadius = this.borderManager[i] + "px";
      } else {
        clearTint.style.borderRadius = this.borderManager[i] + "px";
      }
    }
  }

  handleInputChange(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;

    const mainRGB = Generator.hex2rgb(String(e.target.value));
    this.palette = denormalizeRGBS(generatePalette(mainRGB));

    this.denormMainRGB = denormalizeRGB(mainRGB);
    this.palette.forEach((rgb: RGB, i: number) => {
      if (
        rgb.red === this.denormMainRGB.red &&
        rgb.green === this.denormMainRGB.green &&
        rgb.blue === this.denormMainRGB.blue
      ) {
        this.mainColorIndex = i;
      }
    });

    // this.setPaletteToDOM(RGBSToString(this.palette));

    this.input.blur();
    this.preview.style.backgroundColor = e.target.value;
  }

  handleAddStylesClick() {
    const reg = new RegExp("\\d+, \\d+, \\d+");
    const tints = this.getTints().map((rgbStr: string) => {
      const matched = reg.exec(rgbStr);

      if (matched) {
        const numRGB = matched[0].split(",").map((v) => parseInt(v));

        return normalizeRGB({
          red: numRGB[0],
          green: numRGB[1],
          blue: numRGB[2],
        });
      }

      return { red: 0, green: 0, blue: 0 };
    });

    this.postMessageToFigma({
      type: "addStyles",
      data: {
        name: "test",
        rgbs: tints,
      },
    });
  }

  handleMessage(msg: MessageEvent) {
    const pluginMessage = msg.data.pluginMessage.pluginMessage;
    const type = pluginMessage.type;

    switch (type) {
      case "selectedColor":
        const mainRGB = pluginMessage.data as RGB;
        const checkRGB = denormalizeRGB(mainRGB);
        if (
          mainRGB === undefined ||
          (this.denormMainRGB.red === checkRGB.red &&
            this.denormMainRGB.green === checkRGB.green &&
            this.denormMainRGB.blue === checkRGB.blue)
        )
          break;

        this.denormMainRGB = checkRGB;

        this.palette = denormalizeRGBS(generatePalette(mainRGB));

        this.palette.forEach((rgb: RGB, i: number) => {
          if (
            rgb.red === this.denormMainRGB.red &&
            rgb.green === this.denormMainRGB.green &&
            rgb.blue === this.denormMainRGB.blue
          ) {
            this.mainColorIndex = i;
          }
        });

        // this.setPaletteToDOM(RGBSToString(this.palette));

        this.input.value = Generator.rgb2hex(mainRGB);
        this.preview.style.backgroundColor = RGBToString(this.denormMainRGB);
        break;
    }
  }

  setPaletteToDOM(palette: string[]) {
    for (let i = 0; i < this.tints.children.length; i++) {
      const tint = this.tints.children[i];

      if (tint instanceof HTMLLIElement) {
        tint.style.backgroundColor = palette[i];
      }
    }
  }

  postMessageToFigma(payload: FigmaPayload) {
    parent.postMessage(
      {
        pluginMessage: payload,
      },
      "*"
    );
  }

  getTints(): string[] {
    const data: string[] = [];

    for (let i = 0; i < this.tints.children.length; i++) {
      const tint = this.tints.children[i];

      if (tint instanceof HTMLLIElement) {
        data.push(tint.style.backgroundColor);
      }
    }
    return data;
  }
}
