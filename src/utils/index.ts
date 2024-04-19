export function isJSON(str: string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}


// 全局log 方法。通过制定环境变量来控制是否打印，仅在开发环境打印
export const log = (...args: any[]) => {
  if (process.env.NODE_ENV === "development") {
    console.log(
      `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      ...args
    )
  }
}

export function nodeToCSS(name, css) {
  return `.${name} {
  ${Object.keys(css).map(k => `${k}: ${css[k]};`).join('\n  ')}
  }`
}

export function arrayBufferToBase64(bytes: Uint8Array) {
  let base64 = "";
  const encodings =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  const byteLength = bytes.byteLength;
  const byteRemainder = byteLength % 3;
  const mainLength = byteLength - byteRemainder;

  let a, b, c, d;
  let chunk;

  // Main loop deals with bytes in chunks of 3
  for (let i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
    d = chunk & 63; // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];

    a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3) << 4; // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

    a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15) << 2; // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + "=";
  }

  return base64;
}


export const generateTree = async (node: SceneNode, resolve?: (value: unknown) => void): Promise<any> => {
  const css = await node.getCSSAsync();
  const cssString = JSON.stringify(css, null, 2);
  const tree = {
    name: node.name,
    type: node.type,
    css: cssString,
    children: [],
  };
  if ('children' in node) {
    for (const child of node.children) {
      const childTree = await generateTree(child);
      tree.children.push(childTree);
    }
    resolve?.(tree);
  } else {
    resolve?.(tree);
  }
  return tree;
}

// 判断当前 网页 是 figma || MasterGo
export const appTitle = () => {
  const href = document.location.href;
  if (href.includes('figma.com')) {
    return 'figma';
  } else if (href.includes('mastergo.com')) {
    return 'mastergo';
  }
  return '';
}
// 获取 window 全局变量
export const globalKey = (): "figma" | "mg" => {
  const href = document.location.href;
  if (href.includes('figma.com')) {
    return 'figma';
  } else if (href.includes('mastergo.com')) {
    return 'mg';
  }
  return 'figma';
}

export const nodeToCSSForMG = (node) => {
    let css = '';

    // 背景颜色
    if (node.fills && node.fills.length > 0) {
        css += `background-color: ${node.fills[0].color};`;
    }

    // 透明度
    if (node.opacity) {
        css += `opacity: ${node.opacity};`;
    }

    // 边框样式
    if (node.strokes && node.strokes.length > 0) {
        const stroke = node.strokes[0];
        css += `border: ${node.strokeWeight}px solid ${stroke.color};`;
        if (stroke.style !== 'SOLID') {
            css += `border-style: ${stroke.style === 'DASH' ? 'dashed' : 'dotted'};`;
        }
    }

    // 边框圆角
    if (node.cornerRadius) {
        css += `border-radius: ${node.cornerRadius}px;`;
    }

    // 宽度和高度
    css += `width: ${node.width}px;`;
    css += `height: ${node.height}px;`;

    // 文本样式
    if (node.componentPropertyReferences && node.componentPropertyReferences.characters) {
        const textProperties = node.componentPropertyReferences.characters;
        if (textProperties.fontFamily) {
            css += `font-family: ${textProperties.fontFamily};`;
        }
        if (textProperties.fontSize) {
            css += `font-size: ${textProperties.fontSize}px;`;
        }
        if (textProperties.fontWeight) {
            css += `font-weight: ${textProperties.fontWeight};`;
        }
        if (textProperties.fontStyle) {
            css += `font-style: ${textProperties.fontStyle === 'ITALIC' ? 'italic' : 'normal'};`;
        }
        if (textProperties.textAlign) {
            css += `text-align: ${textProperties.textAlign};`;
        }
        if (textProperties.lineHeight) {
            css += `line-height: ${textProperties.lineHeight}px;`;
        }
        if (textProperties.color) {
            css += `color: ${textProperties.color};`;
        }
    }

    // 位置（根据绝对变换矩阵计算）
    if (node.absoluteTransform) {
        const transform = node.absoluteTransform;
        css += `position: absolute;`;
        css += `left: ${transform[0][2]}px;`;
        css += `top: ${transform[1][2]}px;`;
    }

    // 旋转角度
    if (node.rotation) {
        css += `transform: rotate(${node.rotation}deg);`;
    }

    // 其他样式属性...
    // ...
    return css;
}