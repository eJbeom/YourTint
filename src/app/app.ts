import * as Generator from "./core/palette-generator";
import { bogan, contrastRatio } from "../utils/helpers";
import {
  RGBToString,
  findClosestRGB,
  stringToRGBS,
  stringToRGB,
  generatePalette,
  denormalizeRGBS,
  denormalizeRGB,
  normalizeRGBS,
  normalizeRGB,
} from "../utils/RGBHelpers";
import { RGB } from "../types/color";
import { FigmaPayload } from "../types/data";

export default class App {
  input: HTMLInputElement;
  preview: HTMLButtonElement;
  tints: HTMLOListElement;
  ratioText: NodeListOf<HTMLParagraphElement>;
  addStylesBtn: HTMLButtonElement;
  borderManager: number[];
  colorManager: RGB[];
  mainColorIndex: number;
  denormCurRGB: RGB;
  denormPalette: RGB[];

  constructor() {
    this.input = document.getElementById("hexInput") as HTMLInputElement;
    this.preview = document.querySelector(".preview") as HTMLButtonElement;
    this.tints = document.querySelector(".tints") as HTMLOListElement;
    this.ratioText = document.querySelectorAll(
      ".ratio"
    ) as NodeListOf<HTMLParagraphElement>;
    this.addStylesBtn = document.getElementById(
      "addStylesBtn"
    ) as HTMLButtonElement;

    this.borderManager = Array(10).fill(0);
    this.colorManager = Array.from({ length: 10 }, () => {
      return { red: 241, green: 241, blue: 241 };
    });
    this.mainColorIndex = 4;
    this.denormCurRGB = {
      red: 255,
      green: 255,
      blue: 255,
    };
    this.denormPalette = Array.from({ length: 10 }, () => {
      return { red: 241, green: 241, blue: 241 };
    });

    this.tints.addEventListener("click", this.handleTintsClick.bind(this));
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

    this.postMessageToFigma({ type: "update" });

    this.updateColor();
    this.updateBorder();
    this.updateContrastRatio();
  }

  updateContrastRatio() {
    for (let i = 0; i < this.denormPalette.length; i++) {
      const whiteRatio = contrastRatio(this.denormPalette[i], {
        red: 255,
        green: 255,
        blue: 255,
      });
      const blackRatio = contrastRatio(this.denormPalette[i], {
        red: 0,
        green: 0,
        blue: 0,
      });

      if (whiteRatio >= blackRatio) {
        this.ratioText[i].style.color = "white";
        this.ratioText[i].textContent = String(whiteRatio.toFixed(1));
      } else {
        this.ratioText[i].style.color = "black";
        this.ratioText[i].textContent = String(blackRatio.toFixed(1));
      }
    }
  }

  updateColor() {
    for (let i = 0; i < this.denormPalette.length; i++) {
      const curColor = this.colorManager[i];
      const targetColor = this.denormPalette[i];
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
  }

  updateBorder() {
    this.borderManager[this.mainColorIndex] = bogan(
      this.borderManager[this.mainColorIndex],
      20,
      0.28
    );
    const curTint = this.tints.children[this.mainColorIndex] as HTMLLIElement;

    if (this.mainColorIndex === 0) {
      curTint.style.borderBottomLeftRadius =
        curTint.style.borderBottomRightRadius =
          this.borderManager[this.mainColorIndex] + "px";
      curTint.style.borderBottomRightRadius =
        this.borderManager[this.mainColorIndex] + "px";
    } else if (this.mainColorIndex === this.borderManager.length - 1) {
      curTint.style.borderTopLeftRadius =
        this.borderManager[this.mainColorIndex] + "px";
      curTint.style.borderTopRightRadius =
        this.borderManager[this.mainColorIndex] + "px";
    } else {
      curTint.style.borderRadius =
        this.borderManager[this.mainColorIndex] + "px";
    }

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

  handleTintsClick(e: PointerEvent) {
    const target = e.target as HTMLLIElement;

    if (target) {
      const rgb = stringToRGB(target.style.backgroundColor);

      if (rgb !== undefined) {
        this.postMessageToFigma({
          type: "clickTint",
          data: normalizeRGB(rgb),
        });
      }
    }
  }

  handleInputChange(e: Event) {
    if (!(e.target instanceof HTMLInputElement)) return;

    const normRGB = Generator.hex2rgb(String(e.target.value));
    this.denormPalette = denormalizeRGBS(generatePalette(normRGB));
    this.denormCurRGB = denormalizeRGB(normRGB);

    const closestRGB = findClosestRGB(this.denormCurRGB, this.denormPalette);

    this.denormPalette.forEach((rgb: RGB, i: number) => {
      if (
        rgb.red === closestRGB.red &&
        rgb.green === closestRGB.green &&
        rgb.blue === closestRGB.blue
      ) {
        console.log(rgb, closestRGB);
        this.mainColorIndex = i;
      }
    });

    this.input.blur();
    this.preview.style.backgroundColor = e.target.value;
  }

  handleAddStylesClick() {
    const rgbs = stringToRGBS(this.getTints());

    if (rgbs) {
      const tints = normalizeRGBS(rgbs);

      if (tints) {
        this.postMessageToFigma({
          type: "addStyles",
          data: {
            name: String(this.input.value),
            rgbs: tints,
          },
        });
      }
    }
  }

  handleMessage(msg: MessageEvent) {
    const pluginMessage = msg.data.pluginMessage.pluginMessage;
    const type = pluginMessage.type;

    switch (type) {
      case "selectedColor":
        const normRGB = pluginMessage.data as RGB;
        const denormRGB = denormalizeRGB(normRGB);
        if (
          normRGB === undefined ||
          (this.denormCurRGB.red === denormRGB.red &&
            this.denormCurRGB.green === denormRGB.green &&
            this.denormCurRGB.blue === denormRGB.blue)
        )
          break;

        this.denormCurRGB = denormRGB;
        this.denormPalette = denormalizeRGBS(generatePalette(normRGB));

        const closestRGB = findClosestRGB(
          this.denormCurRGB,
          this.denormPalette
        );

        this.denormPalette.forEach((rgb: RGB, i: number) => {
          if (
            rgb.red === closestRGB.red &&
            rgb.green === closestRGB.green &&
            rgb.blue === closestRGB.blue
          ) {
            this.mainColorIndex = i;
          }
        });

        this.input.value = Generator.rgb2hex(normRGB);
        this.preview.style.backgroundColor = RGBToString(this.denormCurRGB);
        break;
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
