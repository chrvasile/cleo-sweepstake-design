figma.showUI(__html__, {
  width: 480,
  height: 560,
  themeColors: true,
});

const FALLBACK_FONT = { family: 'Inter', style: 'Regular' };
const ENABLE_AUTO_LAYOUT_RECONSTRUCTION = false;
const IMPORTED_SCREEN_CORNER_RADIUS = 32;
const GENERIC_CSS_FAMILIES = new Set(['system-ui', '-apple-system', 'sans-serif', 'serif', 'monospace']);

const asNumber = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);

const round = (value) => Math.round(value * 100) / 100;

const limitName = (value) => String(value || 'Layer').slice(0, 80);

const readPath = (value, path, fallback) => {
  let current = value;
  for (const key of path) {
    if (current == null) return fallback;
    current = current[key];
  }
  return current == null ? fallback : current;
};

const spacingValue = (payload, token, fallback) => asNumber(readPath(payload, ['tokens', 'spacing', token], undefined), fallback);

const parseCssColor = (value) => {
  if (!value || value === 'transparent') return null;

  const hex = String(value).trim().match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hex) {
    const raw = hex[1];
    const red = Number.parseInt(raw.slice(0, 2), 16) / 255;
    const green = Number.parseInt(raw.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(raw.slice(4, 6), 16) / 255;
    const opacity = raw.length === 8 ? Number.parseInt(raw.slice(6, 8), 16) / 255 : 1;
    return { color: { r: red, g: green, b: blue }, opacity };
  }

  const rgba = String(value)
    .trim()
    .match(/^rgba?\(([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)(?:[,\s/]+([-\d.]+%?))?\)$/i);

  if (!rgba) return null;

  const red = Number(rgba[1]);
  const green = Number(rgba[2]);
  const blue = Number(rgba[3]);
  const rawAlpha = rgba[4];
  const alpha = rawAlpha == null ? 1 : rawAlpha.endsWith('%') ? Number.parseFloat(rawAlpha) / 100 : Number(rawAlpha);

  if ([red, green, blue, alpha].some((part) => Number.isNaN(part))) return null;

  return {
    color: {
      r: Math.max(0, Math.min(1, red / 255)),
      g: Math.max(0, Math.min(1, green / 255)),
      b: Math.max(0, Math.min(1, blue / 255)),
    },
    opacity: Math.max(0, Math.min(1, alpha)),
  };
};

const textBoxWidth = (layer, parentBounds) => {
  const textStyle = layer.textStyle || {};
  const relativeX = layer.bounds.x - parentBounds.x;
  const availableWidth = Math.max(layer.bounds.width, parentBounds.width - relativeX);
  const cushion = Math.max(8, asNumber(textStyle.fontSize, 12) * 0.4);

  if (textStyle.textAlign && textStyle.textAlign !== 'left' && textStyle.textAlign !== 'start') {
    return layer.bounds.width + cushion;
  }

  if (textStyle.lineCount <= 1 || textStyle.whiteSpace === 'nowrap') {
    return availableWidth + cushion;
  }

  return Math.max(layer.bounds.width + cushion, availableWidth);
};

const importedTextBoxWidth = (layer, parentBounds, useAutoLayoutParent) => {
  if (useAutoLayoutParent) return Math.max(0.01, layer.bounds.width);
  return textBoxWidth(layer, parentBounds);
};

const solidPaint = (value) => {
  const parsed = parseCssColor(value);
  if (!parsed || parsed.opacity === 0) return null;
  return {
    type: 'SOLID',
    color: parsed.color,
    opacity: parsed.opacity,
  };
};

const setFills = (node, color) => {
  const paint = solidPaint(color);
  if ('fills' in node) node.fills = paint ? [paint] : [];
};

const setStroke = (node, layer) => {
  const visual = layer.visual || {};
  const borderWidth = asNumber(visual.borderWidth, 0);
  const paint = solidPaint(visual.borderColor);
  if (!paint || borderWidth <= 0 || !('strokes' in node)) return;

  node.strokes = [paint];
  node.strokeWeight = borderWidth;
};

const applyBounds = (node, layer, parentBounds, useAutoLayoutParent) => {
  if (!useAutoLayoutParent) {
    node.x = round(layer.bounds.x - parentBounds.x);
    node.y = round(layer.bounds.y - parentBounds.y);
  }

  if ('resize' in node) {
    node.resize(Math.max(0.01, layer.bounds.width), Math.max(0.01, layer.bounds.height));
  }
};

const applyCommonNodeProps = (node, layer, parentBounds, useAutoLayoutParent) => {
  const visual = layer.visual || {};
  node.name = limitName(layer.name);
  applyBounds(node, layer, parentBounds, useAutoLayoutParent);

  if ('opacity' in node && visual.opacity != null) {
    node.opacity = visual.opacity;
  }

  if ('cornerRadius' in node && visual.borderRadius != null) {
    node.cornerRadius = visual.borderRadius;
  }

  setStroke(node, layer);
  node.setPluginData('cleoLayerPath', layer.path);
  node.setPluginData('cleoLayerType', layer.type);
  node.setPluginData('cleoTokens', JSON.stringify(layer.tokens || {}));
  if (layer.warnings && layer.warnings.length) node.setPluginData('cleoWarnings', JSON.stringify(layer.warnings));
};

const fontStyleFromWeight = (weight) => {
  if (weight >= 700) return 'Bold';
  if (weight >= 600) return 'SemiBold';
  if (weight >= 500) return 'Medium';
  return 'Regular';
};

const normalizeFontName = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const stripStyleSuffix = (family) =>
  String(family || '')
    .replace(/[-\s]+(bold|semibold|semi bold|medium|regular|book)$/i, '')
    .trim();

const fontFamilyCandidates = (fontFamily) => {
  const cssFamilies = String(fontFamily || FALLBACK_FONT.family)
    .split(',')
    .map((part) => part.replace(/["']/g, '').trim())
    .filter((part) => !GENERIC_CSS_FAMILIES.has(part.toLowerCase()))
    .filter(Boolean);

  const candidates = cssFamilies.flatMap((family) => {
    const stripped = stripStyleSuffix(family);
    const spaced = stripped.replace(/PPNeueMontreal/gi, 'PP Neue Montreal');
    const spacedOriginal = family.replace(/PPNeueMontreal/gi, 'PP Neue Montreal');

    return [
      family,
      stripped,
      spacedOriginal,
      spaced,
      spaced.replace(/([a-z])([A-Z])/g, '$1 $2'),
      'PP Neue Montreal',
      'PPNeueMontreal',
    ];
  });

  return Array.from(new Set(candidates)).filter(Boolean);
};

const fontStyleCandidates = (weight) => {
  if (weight >= 700) return ['Bold', 'Semibold', 'SemiBold', 'Semi Bold', 'Medium', 'Regular', 'Book'];
  if (weight >= 600) return ['Semibold', 'SemiBold', 'Semi Bold', 'Bold', 'Medium', 'Regular', 'Book'];
  if (weight >= 500) return ['Medium', 'Regular', 'Book', 'Semibold', 'SemiBold', 'Bold'];
  return ['Regular', 'Book', 'Normal', 'Medium'];
};

let availableFontsPromise = null;
const fontFallbackDiagnostics = [];

const availableFonts = async () => {
  if (!availableFontsPromise) {
    availableFontsPromise = figma.listAvailableFontsAsync().catch(() => []);
  }
  return availableFontsPromise;
};

const findAvailableFont = async (families, styles) => {
  const fonts = await availableFonts();
  const normalizedFamilies = families.map(normalizeFontName);
  const normalizedStyles = styles.map(normalizeFontName);

  return fonts.find((entry) => {
    const family = normalizeFontName(entry.fontName.family);
    const style = normalizeFontName(entry.fontName.style);
    return normalizedFamilies.includes(family) && normalizedStyles.includes(style);
  });
};

const loadCandidateFont = async (families, styles) => {
  for (const family of families) {
    for (const styleCandidate of styles) {
      const font = { family, style: styleCandidate };
      try {
        await figma.loadFontAsync(font);
        return font;
      } catch (_error) {
        // Try the next candidate.
      }
    }
  }

  return null;
};

const nearAvailableFontNames = async (families) => {
  const fonts = await availableFonts();
  const normalizedFamilies = families.map(normalizeFontName);
  const near = fonts
    .filter((entry) => {
      const family = normalizeFontName(entry.fontName.family);
      return normalizedFamilies.some((candidate) => family.includes(candidate) || candidate.includes(family));
    })
    .map((entry) => `${entry.fontName.family} ${entry.fontName.style}`);

  return Array.from(new Set(near)).slice(0, 12);
};

const loadBestFont = async (textStyle) => {
  const resolvedTextStyle = textStyle || {};
  const weight = asNumber(resolvedTextStyle.fontWeight, 400);
  const style = fontStyleFromWeight(weight);
  const families = fontFamilyCandidates(resolvedTextStyle.fontFamily);
  const styles = fontStyleCandidates(weight);

  const direct = await loadCandidateFont(families, styles);
  if (direct) return direct;

  const available = await findAvailableFont(families, styles);
  if (available) {
    await figma.loadFontAsync(available.fontName);
    return available.fontName;
  }

  await figma.loadFontAsync(FALLBACK_FONT);
  fontFallbackDiagnostics.push({
    exportedFontFamily: resolvedTextStyle.fontFamily || '',
    exportedFontWeight: weight,
    triedFamilies: families,
    triedStyles: styles,
    expectedStyle: style,
    nearbyAvailableFonts: await nearAvailableFontNames(families),
  });
  return FALLBACK_FONT;
};

const textAlign = (value) => {
  if (value === 'center') return 'CENTER';
  if (value === 'right' || value === 'end') return 'RIGHT';
  if (value === 'justify') return 'JUSTIFIED';
  return 'LEFT';
};

const createTextNode = async (layer, parentBounds, useAutoLayoutParent) => {
  const node = figma.createText();
  const textStyle = layer.textStyle || {};
  const visual = layer.visual || {};
  const width = importedTextBoxWidth(layer, parentBounds, useAutoLayoutParent);
  const isSingleLine = textStyle.lineCount <= 1 || textStyle.whiteSpace === 'nowrap';
  const font = await loadBestFont(layer.textStyle);
  node.fontName = font;
  node.characters = layer.text || '';
  node.fontSize = asNumber(textStyle.fontSize, 12);
  node.lineHeight =
    textStyle.lineHeight != null
      ? { unit: 'PIXELS', value: textStyle.lineHeight }
      : { unit: 'AUTO' };
  node.textAlignHorizontal = textAlign(textStyle.textAlign);
  const paint = solidPaint(visual.color);
  if (paint) node.fills = [paint];
  node.textAutoResize = 'HEIGHT';
  applyCommonNodeProps(
    node,
    Object.assign({}, layer, {
      bounds: Object.assign({}, layer.bounds, {
        width,
        height: Math.max(layer.bounds.height, asNumber(textStyle.lineHeight, asNumber(textStyle.fontSize, 12))),
      }),
    }),
    parentBounds,
    useAutoLayoutParent,
  );
  if (isSingleLine) node.textAutoResize = 'WIDTH_AND_HEIGHT';
  return node;
};

const imageBytesFromDataUrl = (src) => {
  const match = String(src).match(/^data:image\/(?:png|jpeg|jpg|gif);base64,(.+)$/i);
  return match ? figma.base64Decode(match[1]) : null;
};

const createImageNode = async (layer, parentBounds, useAutoLayoutParent) => {
  const node = figma.createRectangle();
  const imageLayer = layer.image || {};
  const visual = layer.visual || {};
  applyCommonNodeProps(node, layer, parentBounds, useAutoLayoutParent);

  try {
    const bytes = imageBytesFromDataUrl(imageLayer.src);
    const image = bytes ? figma.createImage(bytes) : await figma.createImageAsync(imageLayer.src);
    node.fills = [
      {
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: imageLayer.objectFit === 'contain' ? 'FIT' : 'FILL',
      },
    ];
  } catch (error) {
    setFills(node, visual.backgroundColor);
    node.setPluginData('cleoWarnings', JSON.stringify([`Unable to import image: ${String(error)}`]));
  }

  return node;
};

const createSvgNode = (layer, parentBounds, useAutoLayoutParent) => {
  try {
    const node = figma.createNodeFromSvg(layer.svg || '<svg />');
    applyCommonNodeProps(node, layer, parentBounds, useAutoLayoutParent);
    return node;
  } catch (error) {
    const fallback = figma.createFrame();
    applyCommonNodeProps(fallback, layer, parentBounds, useAutoLayoutParent);
    fallback.setPluginData('cleoWarnings', JSON.stringify([`Unable to import SVG: ${String(error)}`]));
    return fallback;
  }
};

const canUseAutoLayout = (layer) => {
  if (!ENABLE_AUTO_LAYOUT_RECONSTRUCTION) return false;

  const layout = layer.layout || {};
  if (layout.display !== 'flex' && layout.display !== 'inline-flex') return false;
  if (layout.flexWrap && layout.flexWrap !== 'nowrap') return false;
  return (layer.children || []).every((child) => {
    const childLayout = child.layout || {};
    const position = childLayout.position;
    const grow = asNumber(childLayout.flexGrow, 0);
    return position !== 'absolute' && position !== 'fixed' && grow === 0;
  });
};

const applyAutoLayout = (node, layer) => {
  if (!canUseAutoLayout(layer)) return false;

  const layout = layer.layout || {};
  const spacing = layer.spacing || {};
  const padding = spacing.padding || {};
  node.layoutMode = layout.flexDirection === 'row' ? 'HORIZONTAL' : 'VERTICAL';
  node.primaryAxisSizingMode = 'FIXED';
  node.counterAxisSizingMode = 'FIXED';
  node.itemSpacing = asNumber(layout.gap, asNumber(layout.rowGap, 0));
  node.paddingTop = asNumber(padding.top, 0);
  node.paddingRight = asNumber(padding.right, 0);
  node.paddingBottom = asNumber(padding.bottom, 0);
  node.paddingLeft = asNumber(padding.left, 0);

  const alignItems = layout.alignItems;
  if (alignItems === 'center') node.counterAxisAlignItems = 'CENTER';
  else if (alignItems === 'flex-end') node.counterAxisAlignItems = 'MAX';
  else if (alignItems === 'stretch') node.counterAxisAlignItems = 'MIN';
  else node.counterAxisAlignItems = 'MIN';

  const justify = layout.justifyContent;
  if (justify === 'center') node.primaryAxisAlignItems = 'CENTER';
  else if (justify === 'flex-end') node.primaryAxisAlignItems = 'MAX';
  else if (justify === 'space-between') node.primaryAxisAlignItems = 'SPACE_BETWEEN';
  else node.primaryAxisAlignItems = 'MIN';

  return true;
};

const createFrameNode = async (layer, parentBounds, useAutoLayoutParent) => {
  const node = figma.createFrame();
  const visual = layer.visual || {};
  const layout = layer.layout || {};
  applyCommonNodeProps(node, layer, parentBounds, useAutoLayoutParent);
  setFills(node, visual.backgroundColor);
  node.clipsContent = layout.overflow === 'hidden';

  const isAutoLayout = applyAutoLayout(node, layer);
  for (const child of layer.children || []) {
    const childNode = await createLayerNode(child, layer.bounds, isAutoLayout);
    node.appendChild(childNode);
  }

  return node;
};

const createLayerNode = async (layer, parentBounds, useAutoLayoutParent) => {
  if (layer.type === 'text') return createTextNode(layer, parentBounds, useAutoLayoutParent);
  if (layer.type === 'image') return createImageNode(layer, parentBounds, useAutoLayoutParent);
  if (layer.type === 'svg') return createSvgNode(layer, parentBounds, useAutoLayoutParent);
  return createFrameNode(layer, parentBounds, useAutoLayoutParent);
};

const semanticDimensionValue = (dimension, fallback) => asNumber(dimension && dimension.value, fallback);

const semanticPaint = (payload, node, fallbackColor) => {
  const visual = node.visual || {};
  const roleColor =
    visual.backgroundRole && readPath(payload, ['tokens', 'colorRoles', 'background', visual.backgroundRole], undefined);
  return solidPaint(roleColor || fallbackColor || (node.visualStyle && node.visualStyle.backgroundColor));
};

const semanticTextPaint = (payload, node) => {
  const text = node.text || {};
  const roleColor = text.colorRole && readPath(payload, ['tokens', 'colorRoles', 'content', text.colorRole], undefined);
  return solidPaint(roleColor || (node.visualStyle && node.visualStyle.color));
};

const applySemanticBounds = (figmaNode, semanticNode, parentBounds, useAutoLayoutParent) => {
  if (!useAutoLayoutParent) {
    figmaNode.x = round(semanticNode.bounds.x - parentBounds.x);
    figmaNode.y = round(semanticNode.bounds.y - parentBounds.y);
  }

  if ('resize' in figmaNode) {
    figmaNode.resize(Math.max(0.01, semanticNode.bounds.width), Math.max(0.01, semanticNode.bounds.height));
  }
};

const semanticAxisSizing = (value) => {
  if (value === 'fill') return 'FILL';
  if (value === 'hug') return 'HUG';
  return 'FIXED';
};

const applySemanticLayoutSizing = (figmaNode, semanticNode, parentDirection) => {
  const layout = semanticNode.layout || {};

  if (semanticNode.kind === 'button') {
    if ('layoutSizingHorizontal' in figmaNode) {
      figmaNode.layoutSizingHorizontal = layout.width === 'fill' ? 'FILL' : 'FIXED';
    }

    if ('layoutSizingVertical' in figmaNode) {
      figmaNode.layoutSizingVertical = 'FIXED';
    }

    return;
  }

  if ('layoutSizingHorizontal' in figmaNode && layout.width) {
    figmaNode.layoutSizingHorizontal = semanticAxisSizing(layout.width);
  }

  if ('layoutSizingVertical' in figmaNode && layout.height) {
    figmaNode.layoutSizingVertical = semanticAxisSizing(layout.height);
  }

  if (semanticNode.kind === 'spacer') {
    if ('layoutSizingHorizontal' in figmaNode) {
      figmaNode.layoutSizingHorizontal = parentDirection === 'horizontal' ? 'FILL' : 'FILL';
    }
    if ('layoutSizingVertical' in figmaNode) {
      figmaNode.layoutSizingVertical = parentDirection === 'vertical' ? 'FILL' : 'FILL';
    }
    if ('layoutGrow' in figmaNode) {
      figmaNode.layoutGrow = asNumber(layout.grow, 1);
    }
  }
};

const applySemanticLayoutSizingSafely = (figmaNode, semanticNode, parentDirection) => {
  try {
    applySemanticLayoutSizing(figmaNode, semanticNode, parentDirection);
  } catch (error) {
    figmaNode.setPluginData(
      'cleoWarnings',
      JSON.stringify([`Unable to apply semantic layout sizing before parent append: ${String(error)}`]),
    );
  }
};

const semanticCounterAlign = (align) => {
  if (align === 'center') return 'CENTER';
  if (align === 'end') return 'MAX';
  if (align === 'stretch') return 'STRETCH';
  return 'MIN';
};

const semanticPrimaryAlign = (justify) => {
  if (justify === 'center') return 'CENTER';
  if (justify === 'end') return 'MAX';
  if (justify === 'between') return 'SPACE_BETWEEN';
  return 'MIN';
};

const applySemanticStackLayout = (figmaNode, semanticNode) => {
  const layout = semanticNode.layout || {};
  const padding = layout.padding || {};
  const direction = layout.direction || 'vertical';

  figmaNode.layoutMode = direction === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
  figmaNode.primaryAxisSizingMode =
    (direction === 'vertical' ? layout.height : layout.width) === 'hug' ? 'AUTO' : 'FIXED';
  figmaNode.counterAxisSizingMode =
    (direction === 'vertical' ? layout.width : layout.height) === 'hug' ? 'AUTO' : 'FIXED';
  figmaNode.itemSpacing = semanticDimensionValue(layout.gap, 0);
  figmaNode.paddingTop = semanticDimensionValue(padding.top, 0);
  figmaNode.paddingRight = semanticDimensionValue(padding.right, 0);
  figmaNode.paddingBottom = semanticDimensionValue(padding.bottom, 0);
  figmaNode.paddingLeft = semanticDimensionValue(padding.left, 0);
  figmaNode.counterAxisAlignItems = semanticCounterAlign(layout.align);
  figmaNode.primaryAxisAlignItems = semanticPrimaryAlign(layout.justify);
};

const createSemanticTextNode = async (payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent) => {
  const textNode = figma.createText();
  const text = semanticNode.text || {};
  const textStyle = semanticNode.textStyle || {};
  const font = await loadBestFont(textStyle);
  textNode.fontName = font;
  textNode.characters = text.value || '';
  textNode.fontSize = asNumber(textStyle.fontSize, 12);
  textNode.lineHeight =
    textStyle.lineHeight != null
      ? { unit: 'PIXELS', value: textStyle.lineHeight }
      : { unit: 'AUTO' };
  textNode.textAlignHorizontal = textAlign(textStyle.textAlign);
  textNode.textAutoResize = 'HEIGHT';

  const paint = semanticTextPaint(payload, semanticNode);
  if (paint) textNode.fills = [paint];

  applySemanticBounds(textNode, semanticNode, parentBounds, useAutoLayoutParent);
  textNode.name = limitName(semanticNode.name);
  textNode.setPluginData('cleoSemanticKind', semanticNode.kind);
  textNode.setPluginData('cleoSemanticDefinition', JSON.stringify(semanticNode));
  return textNode;
};

const createSemanticSpacerNode = (semanticNode, parentBounds, parentDirection, useAutoLayoutParent) => {
  const spacer = figma.createFrame();
  spacer.name = limitName(semanticNode.name);
  spacer.fills = [];
  applySemanticBounds(spacer, semanticNode, parentBounds, useAutoLayoutParent);
  spacer.setPluginData('cleoSemanticKind', semanticNode.kind);
  spacer.setPluginData('cleoSemanticDefinition', JSON.stringify(semanticNode));
  return spacer;
};

const semanticButtonFill = (payload, button) => {
  if (button.variant === 'secondary') return null;
  if (button.variant === 'tertiary') return solidPaint(readPath(payload, ['tokens', 'colorRoles', 'background', 'accentLight'], undefined));
  if (button.variant === 'text' || button.variant === 'link') return null;
  return solidPaint(readPath(payload, ['tokens', 'colorRoles', 'background', 'primaryInverse'], undefined));
};

const semanticButtonTextPaint = (payload, button) => {
  if (button.variant === 'primary') {
    return solidPaint(readPath(payload, ['tokens', 'colorRoles', 'content', 'primaryInverse'], undefined));
  }
  return solidPaint(readPath(payload, ['tokens', 'colorRoles', 'content', 'secondary'], undefined));
};

const createSemanticButtonNode = async (payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent) => {
  const button = semanticNode.button || {};
  const frame = figma.createFrame();
  const textStyle = semanticNode.textStyle || {};
  const visualStyle = semanticNode.visualStyle || {};
  const layout = semanticNode.layout || {};
  const spacing = semanticNode.spacing || {};
  const padding = spacing.padding || {};
  frame.name = limitName(semanticNode.name);
  applySemanticBounds(frame, semanticNode, parentBounds, useAutoLayoutParent);
  frame.layoutMode = 'HORIZONTAL';
  frame.primaryAxisAlignItems = 'CENTER';
  frame.counterAxisAlignItems = 'CENTER';
  frame.primaryAxisSizingMode = 'FIXED';
  frame.counterAxisSizingMode = 'FIXED';
  frame.itemSpacing = semanticDimensionValue(layout.gap, 0);
  frame.paddingLeft = asNumber(padding.left, 0);
  frame.paddingRight = asNumber(padding.right, 0);
  frame.paddingTop = asNumber(padding.top, 0);
  frame.paddingBottom = asNumber(padding.bottom, 0);
  frame.cornerRadius = readPath(payload, ['tokens', 'radii', 'BUTTON'], 999);
  const fill = solidPaint(visualStyle.backgroundColor) || semanticButtonFill(payload, button);
  frame.fills = fill ? [fill] : [];
  const stroke = solidPaint(visualStyle.borderColor);
  const strokeWeight = asNumber(visualStyle.borderWidth, 0);
  if (stroke && strokeWeight > 0) {
    frame.strokes = [stroke];
    frame.strokeWeight = strokeWeight;
  }

  const label = figma.createText();
  const font = await loadBestFont(textStyle);
  label.fontName = font;
  label.characters = button.label || '';
  label.fontSize = asNumber(textStyle.fontSize, 14);
  label.lineHeight =
    textStyle.lineHeight != null
      ? { unit: 'PIXELS', value: textStyle.lineHeight }
      : { unit: 'AUTO' };
  label.textAlignHorizontal = 'CENTER';
  label.textAlignVertical = 'CENTER';
  label.textAutoResize = 'WIDTH_AND_HEIGHT';
  const textFill = solidPaint(visualStyle.color) || semanticButtonTextPaint(payload, button);
  if (textFill) label.fills = [textFill];
  frame.appendChild(label);

  frame.setPluginData('cleoSemanticKind', semanticNode.kind);
  frame.setPluginData('cleoSemanticDefinition', JSON.stringify(semanticNode));
  return frame;
};

const createSemanticStackNode = async (payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent) => {
  const frame = figma.createFrame();
  const layout = semanticNode.layout || {};
  frame.name = limitName(semanticNode.name);
  applySemanticBounds(frame, semanticNode, parentBounds, useAutoLayoutParent);

  const paint = semanticPaint(payload, semanticNode);
  frame.fills = paint ? [paint] : [];
  frame.clipsContent = false;
  applySemanticStackLayout(frame, semanticNode);
  frame.setPluginData('cleoSemanticKind', semanticNode.kind);
  frame.setPluginData('cleoSemanticDefinition', JSON.stringify(semanticNode));

  for (const child of semanticNode.children || []) {
    const childNode = await createSemanticNode(payload, child, semanticNode.bounds, layout.direction || 'vertical', true);
    frame.appendChild(childNode);
    applySemanticLayoutSizingSafely(childNode, child, layout.direction || 'vertical');
  }

  return frame;
};

const createSemanticNode = async (payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent) => {
  if (semanticNode.kind === 'text') {
    return createSemanticTextNode(payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent);
  }

  if (semanticNode.kind === 'spacer') {
    return createSemanticSpacerNode(semanticNode, parentBounds, parentDirection, useAutoLayoutParent);
  }

  if (semanticNode.kind === 'button') {
    return createSemanticButtonNode(payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent);
  }

  return createSemanticStackNode(payload, semanticNode, parentBounds, parentDirection, useAutoLayoutParent);
};

const resolveColumns = (nodes, edges) => {
  const columns = new Map();
  const incoming = new Set(edges.map((edge) => edge.to));
  const queue = nodes.filter((node) => !incoming.has(node.id)).map((node) => node.id);
  const byId = new Map(nodes.map((node) => [node.id, node]));

  nodes.forEach((node) => {
    if (typeof node.column === 'number') columns.set(node.id, node.column);
  });

  queue.forEach((id) => {
    if (!columns.has(id)) columns.set(id, 0);
  });

  while (queue.length) {
    const id = queue.shift();
    const column = columns.get(id) || 0;
    edges
      .filter((edge) => edge.from === id && byId.has(edge.to))
      .forEach((edge) => {
        const nextColumn = Math.max(columns.get(edge.to) || 0, column + 1);
        columns.set(edge.to, nextColumn);
        queue.push(edge.to);
      });
  }

  nodes.forEach((node) => {
    if (!columns.has(node.id)) columns.set(node.id, 0);
  });

  return columns;
};

const screenPositions = (payload) => {
  const nodes = payload.contentMapGraph.nodes || [];
  const edges = payload.contentMapGraph.edges || [];
  const columns = resolveColumns(nodes, edges);
  const firstScreen = payload.screens && payload.screens[0];
  const screenWidth = readPath(firstScreen, ['viewport', 'width'], payload.framePreset.spec.width);
  const screenHeight = readPath(firstScreen, ['viewport', 'height'], payload.framePreset.spec.height);
  const columnGap = spacingValue(payload, 'XXL', 64) + spacingValue(payload, 'L', 32);
  const rowGap = spacingValue(payload, 'XL', 40);
  const rowCounts = new Map();
  const positions = new Map();

  [...nodes]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((node) => {
      const column = columns.get(node.id) || 0;
      const row = rowCounts.get(column) || 0;
      rowCounts.set(column, row + 1);
      positions.set(node.id, {
        x: column * (screenWidth + columnGap),
        y: row * (screenHeight + rowGap),
      });
    });

  return positions;
};

const createScreenFrame = async (payload, screen, position) => {
  const frame = figma.createFrame();
  frame.name = limitName(screen.label || screen.id);
  frame.x = position.x;
  frame.y = position.y;
  frame.resize(screen.viewport.width, screen.viewport.height);
  frame.cornerRadius = IMPORTED_SCREEN_CORNER_RADIUS;
  frame.clipsContent = true;
  frame.setPluginData('cleoScreenId', screen.id);
  frame.setPluginData('cleoRoutePath', screen.routePath);

  const root = screen.layers && screen.layers[0];
  const rootVisual = (root && root.visual) || {};
  setFills(frame, rootVisual.backgroundColor || readPath(payload, ['tokens', 'colorRoles', 'background', 'primary'], undefined));

  if (screen.designTree && screen.designTree.length) {
    for (const semanticNode of screen.designTree) {
      const childNode = await createSemanticNode(payload, semanticNode, { x: 0, y: 0 }, 'vertical', false);
      frame.appendChild(childNode);
    }
  } else {
    for (const child of (root && root.children) || []) {
      const childNode = await createLayerNode(child, { x: 0, y: 0 }, false);
      frame.appendChild(childNode);
    }
  }

  return frame;
};

const createLineArrowFallback = (name, start, end, strokePaint, strokeWeight) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
  const line = figma.createLine();
  line.name = name;
  line.x = start.x;
  line.y = start.y;
  line.resize(length, 0);
  line.rotation = Math.atan2(dy, dx) * (180 / Math.PI);
  line.strokeWeight = strokeWeight;
  if (strokePaint) line.strokes = [strokePaint];
  try {
    line.strokeCap = 'ARROW_LINES';
  } catch (_error) {
    try {
      line.strokeCap = 'ARROW_EQUILATERAL';
    } catch (_fallbackError) {
      // Figma runtimes without arrow caps will still get the directional line.
    }
  }
  return line;
};

const setVectorNetwork = async (node, vectorNetwork) => {
  if (typeof node.setVectorNetworkAsync === 'function') {
    await node.setVectorNetworkAsync(vectorNetwork);
    return;
  }

  node.vectorNetwork = vectorNetwork;
};

const createArrowNode = async (payload, edge, start, end) => {
  const edgeName = limitName(`${edge.from} to ${edge.to}`);
  const edgeColor =
    readPath(payload, ['tokens', 'colorRoles', 'border', 'selected'], undefined) ||
    readPath(payload, ['tokens', 'colorRoles', 'content', 'secondary'], undefined) ||
    '#5B3935';
  const strokeWeight = spacingValue(payload, 'XXXXS', 2);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(0.01, Math.sqrt(dx * dx + dy * dy));
  const strokePaint = solidPaint(edgeColor);

  if (!Number.isFinite(length) || length <= 0.01) {
    return createLineArrowFallback(edgeName, start, end, strokePaint, strokeWeight);
  }

  try {
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const localStart = {
      x: start.x - minX,
      y: start.y - minY,
    };
    const localEnd = {
      x: end.x - minX,
      y: end.y - minY,
    };
    const arrow = figma.createVector();
    arrow.name = edgeName;
    arrow.x = minX;
    arrow.y = minY;
    arrow.strokeCap = 'NONE';
    arrow.strokeWeight = strokeWeight;
    if (strokePaint) arrow.strokes = [strokePaint];
    arrow.fills = [];
    await setVectorNetwork(arrow, {
      vertices: [
        { x: localStart.x, y: localStart.y, strokeCap: 'NONE' },
        { x: localEnd.x, y: localEnd.y, strokeCap: 'ARROW_LINES' },
      ],
      segments: [{ start: 0, end: 1 }],
      regions: [],
    });
    arrow.setPluginData('cleoEdgeFrom', edge.from);
    arrow.setPluginData('cleoEdgeTo', edge.to);
    return arrow;
  } catch (_error) {
    return createLineArrowFallback(edgeName, start, end, strokePaint, strokeWeight);
  }
};

const drawEdges = async (payload, flowFrame, screenFrames, positions) => {
  for (const edge of payload.contentMapGraph.edges || []) {
    const from = screenFrames.get(edge.from);
    const to = screenFrames.get(edge.to);
    const fromPos = positions.get(edge.from);
    const toPos = positions.get(edge.to);
    if (!from || !to || !fromPos || !toPos) continue;

    const start = {
      x: fromPos.x + from.width,
      y: fromPos.y + from.height / 2,
    };
    const end = {
      x: toPos.x,
      y: toPos.y + to.height / 2,
    };
    flowFrame.appendChild(await createArrowNode(payload, edge, start, end));
  }
};

const importFlow = async (payload) => {
  if (!payload || payload.schemaVersion !== 1) {
    throw new Error('Unsupported or missing Cleo Figma export schema.');
  }

  fontFallbackDiagnostics.length = 0;

  const firstScreen = payload.screens && payload.screens[0];
  const screenWidth = readPath(firstScreen, ['viewport', 'width'], payload.framePreset.spec.width);
  const screenHeight = readPath(firstScreen, ['viewport', 'height'], payload.framePreset.spec.height);
  const positions = screenPositions(payload);
  const screens = payload.screens || [];
  const screenFrames = new Map();
  const flowFrame = figma.createFrame();
  flowFrame.name = limitName(`${readPath(payload, ['app', 'name'], 'Cleo')} editable flow`);
  flowFrame.x = figma.viewport.center.x;
  flowFrame.y = figma.viewport.center.y;
  flowFrame.clipsContent = false;
  flowFrame.fills = [];
  flowFrame.setPluginData('cleoFigmaExport', JSON.stringify({
    schemaVersion: payload.schemaVersion,
    exportedAt: readPath(payload, ['app', 'exportedAt'], undefined),
    sourceUrl: readPath(payload, ['app', 'sourceUrl'], undefined),
  }));

  for (const screen of screens) {
    const position = positions.get(screen.id) || { x: 0, y: 0 };
    const frame = await createScreenFrame(payload, screen, position);
    screenFrames.set(screen.id, frame);
    flowFrame.appendChild(frame);
  }

  await drawEdges(payload, flowFrame, screenFrames, positions);

  const maxX = screens.reduce((largest, screen) => {
    const position = positions.get(screen.id);
    return Math.max(largest, ((position && position.x) || 0) + screenWidth);
  }, screenWidth);
  const maxY = screens.reduce((largest, screen) => {
    const position = positions.get(screen.id);
    return Math.max(largest, ((position && position.y) || 0) + screenHeight);
  }, screenHeight);
  flowFrame.resize(maxX + spacingValue(payload, 'L', 32), maxY + spacingValue(payload, 'L', 32));

  figma.currentPage.appendChild(flowFrame);
  figma.currentPage.selection = [flowFrame];
  figma.viewport.scrollAndZoomIntoView([flowFrame]);

  return {
    screens: screens.length,
    layers: screens.reduce((count, screen) => count + countLayers(screen.layers || []), 0),
    fontFallbacks: fontFallbackDiagnostics,
  };
};

const countLayers = (layers) =>
  layers.reduce((count, layer) => count + 1 + countLayers(layer.children || []), 0);

figma.ui.onmessage = async (message) => {
  if (message.type === 'cancel') {
    figma.closePlugin();
    return;
  }

  if (message.type !== 'import-flow') return;

  try {
    const payload = typeof message.payload === 'string' ? JSON.parse(message.payload) : message.payload;
    const result = await importFlow(payload);
    if (result.fontFallbacks.length) {
      figma.notify(`Imported ${result.screens} screens, but ${result.fontFallbacks.length} text styles fell back to Inter`, {
        error: true,
      });
    } else {
      figma.notify(`Imported ${result.screens} Cleo screens`);
    }
    figma.ui.postMessage({ type: 'import-complete', result });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : String(error);
    figma.notify(messageText, { error: true });
    figma.ui.postMessage({ type: 'import-error', error: messageText });
  }
};
