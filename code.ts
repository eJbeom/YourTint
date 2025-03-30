figma.showUI(__html__);
figma.ui.resize(144, 507);

figma.ui.onmessage = (msg: {
  type: string;
  data: { addStyles: { name: string; rgbs: [] } };
}) => {
  switch (msg.type) {
    case "addStyles":
      createPaintStyles(msg.data.addStyles);
      createPalette(msg.data.addStyles);
      break;
    case "mouseOut":
      postSelectedColors();
      break;
  }
};

function createPaintStyles(addStyles: { name: string; rgbs: [] }) {
  const colors = addStyles.rgbs;
  const name = addStyles.name;
  const [upperName, lowerName] = [name.toUpperCase(), name.toLowerCase()];

  for (let i = 0; i < colors.length; i++) {
    const paint = figma.createPaintStyle();
    paint.name = `${upperName}/${lowerName}-${i + 1}`;
    paint.paints = [
      {
        type: "SOLID",
        color: {
          r: colors[i][0] / 255,
          g: colors[i][1] / 255,
          b: colors[i][2] / 255,
        },
      },
    ];
  }
}

function createPalette(addStyles: { rgbs: [] }) {
  const colors = addStyles.rgbs;
  const frame = figma.createFrame();
  frame.resize(colors.length * 50 + 40, 90);
  for (let i = 0; i < colors.length; i++) {
    const rect = figma.createRectangle();

    rect.x = 50 * i + 20;
    rect.y = 20;
    rect.resize(50, 50);
    rect.fills = [
      {
        type: "SOLID",
        color: {
          r: colors[i][0] / 255,
          g: colors[i][1] / 255,
          b: colors[i][2] / 255,
        },
      },
    ];
    frame.appendChild(rect);
  }
  figma.currentPage.appendChild(frame);
}

function postSelectedColors() {
  const color = figma.currentPage.selection[0]?.fills[0]?.color;
  if (color) {
    figma.ui.postMessage({
      pluginMessage: {
        type: "selectedColor",
        data: color,
      },
    });
  }
}
