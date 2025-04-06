import { FigmaPayload } from "../types/data";
import { AddStyles } from "../types/data";
import { denormalizeRGB } from "../utils/RGBHelpers";

figma.showUI(__html__);
figma.ui.resize(144, 507);

figma.ui.onmessage = async (msg: FigmaPayload) => {
  switch (msg.type) {
    case "addStyles":
      if (msg.data !== undefined) {
        const data = msg.data as AddStyles;

        if (data.name !== "") {
          createStyles(data);
          await createPalette(data);
          figma.viewport.scrollAndZoomIntoView(figma.currentPage.children);
        }
      }

      break;
    case "update":
      postSelectedColors();

      break;
    // case "clickTint":
    //   if (msg.data !== undefined) {
    //     const data = msg.data as unknown as RGB;

    // createObject(data);
    //   }
    //   break;
  }
};

function createStyles(data: AddStyles) {
  const name = data.name;
  const colors = data.rgbs;
  const [upperName, lowerName] = [name.toUpperCase(), name.toLowerCase()];

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const paint = figma.createPaintStyle();

    paint.name = `${upperName}/${lowerName}-${i + 1}`;
    paint.paints = [
      {
        type: "SOLID",
        color: {
          r: color.red,
          g: color.green,
          b: color.blue,
        },
      },
    ];
  }
}

async function createPalette(addStyles: AddStyles) {
  const colors = addStyles.rgbs;
  const frame = figma.createFrame();
  frame.resize(colors.length * 50 + 40, 90);

  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const rect = figma.createRectangle();
    const text = figma.createText();

    rect.x = 50 * i + 20;
    rect.y = 20;
    rect.resize(50, 50);
    rect.fills = [
      {
        type: "SOLID",
        color: {
          r: color.red,
          g: color.green,
          b: color.blue,
        },
      },
    ];

    text.x = 50 * i + 20;
    text.y = 70;
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    text.fontSize = 10;
    text.fills = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 } }];
    const denormRGB = denormalizeRGB(color);

    text.characters = `#${denormRGB.red.toString(16)}${denormRGB.green.toString(
      16
    )}${denormRGB.blue.toString(16)}`;

    frame.appendChild(rect);
    frame.appendChild(text);
  }
  figma.currentPage.appendChild(frame);
}

function postSelectedColors() {
  const selection = figma.currentPage.selection[0];
  //@ts-ignore
  if (selection && selection.fills[0]) {
    //@ts-ignore
    const color = selection.fills[0].color;

    if (color) {
      figma.ui.postMessage({
        pluginMessage: {
          type: "selectedColor",
          data: { red: color.r, green: color.g, blue: color.b },
        },
      });
    }
  }
}
