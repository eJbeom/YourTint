import { FigmaPayload } from "../types/data";
import { AddStyles } from "../types/data";

figma.showUI(__html__);
figma.ui.resize(144, 507);

figma.ui.onmessage = (msg: FigmaPayload) => {
  switch (msg.type) {
    case "addStyles":
      const data = msg.data as AddStyles;

      if (msg.data !== undefined) {
        createStyles(data);
        createPalette(data);
        figma.viewport.scrollAndZoomIntoView(figma.currentPage.selection);
      }

      break;
    case "mouseOut":
      postSelectedColors();

      break;
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

function createPalette(addStyles: AddStyles) {
  const colors = addStyles.rgbs;
  const frame = figma.createFrame();
  frame.resize(colors.length * 50 + 40, 90);
  for (let i = 0; i < colors.length; i++) {
    const color = colors[i];
    const rect = figma.createRectangle();

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
    frame.appendChild(rect);
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
