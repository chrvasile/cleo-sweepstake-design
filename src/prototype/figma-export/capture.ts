import { config } from '../../config';
import {
  BorderWidth,
  Radii,
  Spacing,
  colorRoles,
  colors,
  darkModeColorRoles,
  typography,
} from '../../design-system/tokens';
import type { FramePreset, FrameSpec } from '../../shell';
import type { ContentMapGraph, ContentMapNode } from '../content-map/types';
import { FIGMA_EXPORT_SCHEMA_VERSION } from './types';
import type {
  FigmaExportLayer,
  FigmaExportScreen,
  FigmaExportSpacingStyle,
  FigmaExportTokenMatches,
  FigmaSemanticNode,
  FigmaSemanticNodeDefinition,
  FlowFigmaExportV1,
} from './types';
import {
  SEMANTIC_NODE_ATTRIBUTE,
  getSemanticNodeDefinition,
} from './semanticRegistry';
import { createTokenMatcher } from './tokenMatching';

const SCREEN_CAPTURE_SELECTOR = '[data-screenshot-target="prototype-screen"]';
const SCREEN_PAINT_FRAME_COUNT = 2;
const GENERATED_FILE_PREFIX = 'cleo-figma-flow';
const EMPTY_CSS_COLOR = 'rgba(0, 0, 0, 0)';

type CapturePrototypeFlowOptions = {
  graph: ContentMapGraph;
  framePreset: FramePreset;
  frameSpec: FrameSpec;
  navigate: (routePath: string) => void;
};

type CaptureMetrics = {
  rootRect: DOMRect;
  scaleX: number;
  scaleY: number;
};

const round = (value: number) => Math.round(value * 100) / 100;

const numericStyle = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? round(parsed) : undefined;
};

const cleanCssValue = (value: string | undefined, emptyValue?: string) => {
  if (!value || value === emptyValue) return undefined;
  return value;
};

const readSpacing = (
  style: CSSStyleDeclaration,
  prefix: 'padding' | 'margin',
): FigmaExportSpacingStyle => ({
  top: numericStyle(style.getPropertyValue(`${prefix}-top`)),
  right: numericStyle(style.getPropertyValue(`${prefix}-right`)),
  bottom: numericStyle(style.getPropertyValue(`${prefix}-bottom`)),
  left: numericStyle(style.getPropertyValue(`${prefix}-left`)),
});

const getDirectText = (element: Element) =>
  Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const getTextLineCount = (element: Element) => {
  const range = document.createRange();
  range.selectNodeContents(element);
  const lineTops = new Set<number>();

  Array.from(range.getClientRects()).forEach((rect) => {
    if (rect.width > 0 && rect.height > 0) lineTops.add(Math.round(rect.top));
  });

  range.detach();
  return Math.max(1, lineTops.size);
};

const getTextStyleElement = (element: Element) => {
  const descendantTextElement = Array.from(
    element.querySelectorAll('h1,h2,h3,h4,h5,h6,p,span,label,strong,em,a'),
  ).find((candidate) => getDirectText(candidate));

  if (descendantTextElement && !getDirectText(element)) return descendantTextElement;
  if (isTextElement(element)) return element;
  return descendantTextElement ?? element;
};

const getTextStyle = (element: Element) => {
  const styleElement = getTextStyleElement(element);
  const style = window.getComputedStyle(styleElement);

  return {
    fontFamily: cleanCssValue(style.fontFamily),
    fontSize: numericStyle(style.fontSize),
    fontWeight: numericStyle(style.fontWeight),
    lineHeight: numericStyle(style.lineHeight),
    letterSpacing: numericStyle(style.letterSpacing),
    textAlign: cleanCssValue(style.textAlign),
    textDecoration: cleanCssValue(style.textDecorationLine, 'none'),
    textTransform: cleanCssValue(style.textTransform, 'none'),
    whiteSpace: cleanCssValue(style.whiteSpace),
    lineCount: getTextLineCount(styleElement),
  };
};

const getSemanticStyleElement = (element: Element, definition: FigmaSemanticNodeDefinition): Element => {
  if (definition.kind === 'button') return element.querySelector('button') ?? element;
  return element;
};

const getLayerName = (element: Element, layerType: FigmaExportLayer['type'], path: string) => {
  const explicitLabel = element.getAttribute('aria-label') ?? element.getAttribute('alt');
  if (explicitLabel) return explicitLabel;

  const directText = getDirectText(element);
  if (directText) return directText.slice(0, Spacing.XXL);

  return `${layerType}:${element.tagName.toLowerCase()}:${path}`;
};

const isTextElement = (element: Element) =>
  ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'label', 'strong', 'em', 'a'].includes(
    element.tagName.toLowerCase(),
  );

const getLayerType = (
  element: Element,
  path: string,
  style: CSSStyleDeclaration,
): FigmaExportLayer['type'] => {
  if (path === '0') return 'root';
  if (element instanceof HTMLImageElement) return 'image';
  if (element instanceof SVGSVGElement) return 'svg';
  if (isTextElement(element) && getDirectText(element)) return 'text';
  if (element.children.length === 0 && style.backgroundColor !== EMPTY_CSS_COLOR) return 'shape';
  return 'container';
};

const getWarnings = (style: CSSStyleDeclaration) => {
  const warnings: string[] = [];
  const backgroundImage = cleanCssValue(style.backgroundImage, 'none');
  const boxShadow = cleanCssValue(style.boxShadow, 'none');
  const transform = cleanCssValue(style.transform, 'none');
  const filter = cleanCssValue(style.filter, 'none');
  const backdropFilter = cleanCssValue(style.backdropFilter, 'none');

  if (backgroundImage) warnings.push(`Unsupported background image: ${backgroundImage}`);
  if (boxShadow) warnings.push(`Unsupported shadow: ${boxShadow}`);
  if (transform) warnings.push(`Unsupported transform: ${transform}`);
  if (filter) warnings.push(`Unsupported filter: ${filter}`);
  if (backdropFilter) warnings.push(`Unsupported backdrop filter: ${backdropFilter}`);

  return warnings;
};

const getTokenMatches = (
  style: CSSStyleDeclaration,
  padding: FigmaExportSpacingStyle,
  margin: FigmaExportSpacingStyle,
): FigmaExportTokenMatches => {
  const matcher = createTokenMatcher();
  const fontSize = numericStyle(style.fontSize);
  const lineHeight = numericStyle(style.lineHeight);
  const fontWeight = numericStyle(style.fontWeight);
  const borderRadius = numericStyle(style.borderTopLeftRadius);
  const borderWidth = numericStyle(style.borderTopWidth);

  return {
    backgroundColor: matcher.color(style.backgroundColor),
    color: matcher.color(style.color),
    borderColor: matcher.color(style.borderTopColor),
    borderWidth: matcher.borderWidth(borderWidth),
    borderRadius: matcher.radius(borderRadius),
    paddingTop: matcher.spacing(padding.top),
    paddingRight: matcher.spacing(padding.right),
    paddingBottom: matcher.spacing(padding.bottom),
    paddingLeft: matcher.spacing(padding.left),
    marginTop: matcher.spacing(margin.top),
    marginRight: matcher.spacing(margin.right),
    marginBottom: matcher.spacing(margin.bottom),
    marginLeft: matcher.spacing(margin.left),
    gap: matcher.spacing(numericStyle(style.gap)),
    rowGap: matcher.spacing(numericStyle(style.rowGap)),
    columnGap: matcher.spacing(numericStyle(style.columnGap)),
    fontSize: matcher.fontSize(fontSize),
    lineHeight: matcher.lineHeight(lineHeight),
    fontWeight: matcher.fontWeight(fontWeight),
  };
};

const hasUsableBounds = (bounds: DOMRect) => bounds.width > 0 && bounds.height > 0;

const getCaptureMetrics = (root: HTMLElement): CaptureMetrics => {
  const rootRect = root.getBoundingClientRect();
  const scaleX = rootRect.width > 0 && root.clientWidth > 0 ? rootRect.width / root.clientWidth : 1;
  const scaleY = rootRect.height > 0 && root.clientHeight > 0 ? rootRect.height / root.clientHeight : 1;

  return {
    rootRect,
    scaleX,
    scaleY,
  };
};

const captureElement = (element: Element, metrics: CaptureMetrics, path: string): FigmaExportLayer | null => {
  const style = window.getComputedStyle(element);
  const bounds = element.getBoundingClientRect();
  const layerType = getLayerType(element, path, style);

  if (path !== '0' && (!hasUsableBounds(bounds) || style.display === 'none' || style.visibility === 'hidden')) {
    return null;
  }

  const padding = readSpacing(style, 'padding');
  const margin = readSpacing(style, 'margin');
  const tokens = getTokenMatches(style, padding, margin);
  const warnings = getWarnings(style);
  const directText = getDirectText(element);
  const children =
    layerType === 'svg'
      ? []
      : Array.from(element.children)
          .map((child, index) => captureElement(child, metrics, `${path}.${index}`))
          .filter((child): child is FigmaExportLayer => child != null);

  const layer: FigmaExportLayer = {
    id: `${element.tagName.toLowerCase()}-${path}`,
    path,
    name: getLayerName(element, layerType, path),
    type: layerType,
    tagName: element.tagName.toLowerCase(),
    bounds: {
      x: round((bounds.left - metrics.rootRect.left) / metrics.scaleX),
      y: round((bounds.top - metrics.rootRect.top) / metrics.scaleY),
      width: round(bounds.width / metrics.scaleX),
      height: round(bounds.height / metrics.scaleY),
    },
    layout: {
      display: cleanCssValue(style.display),
      position: cleanCssValue(style.position, 'static'),
      overflow: cleanCssValue(style.overflow, 'visible'),
      flexDirection: cleanCssValue(style.flexDirection),
      flexWrap: cleanCssValue(style.flexWrap),
      alignItems: cleanCssValue(style.alignItems),
      justifyContent: cleanCssValue(style.justifyContent),
      gap: numericStyle(style.gap),
      rowGap: numericStyle(style.rowGap),
      columnGap: numericStyle(style.columnGap),
      flexGrow: numericStyle(style.flexGrow),
      flexShrink: numericStyle(style.flexShrink),
    },
    visual: {
      backgroundColor: cleanCssValue(style.backgroundColor, EMPTY_CSS_COLOR),
      backgroundImage: cleanCssValue(style.backgroundImage, 'none'),
      color: cleanCssValue(style.color),
      opacity: numericStyle(style.opacity),
      borderColor: cleanCssValue(style.borderTopColor, EMPTY_CSS_COLOR),
      borderWidth: numericStyle(style.borderTopWidth),
      borderRadius: numericStyle(style.borderTopLeftRadius),
      boxShadow: cleanCssValue(style.boxShadow, 'none'),
      transform: cleanCssValue(style.transform, 'none'),
    },
    spacing: { padding, margin },
    tokens,
    warnings,
    children,
  };

  if (layerType === 'text') {
    layer.text = directText;
    layer.textStyle = getTextStyle(element);
  }

  if (element instanceof HTMLImageElement) {
    layer.image = {
      src: element.currentSrc || element.src,
      alt: element.alt || undefined,
      objectFit: cleanCssValue(style.objectFit),
    };
  }

  if (element instanceof SVGSVGElement) {
    layer.svg = element.outerHTML;
  }

  return layer;
};

const captureSemanticElement = (element: Element, metrics: CaptureMetrics): FigmaSemanticNode[] => {
  const semanticId = element.getAttribute(SEMANTIC_NODE_ATTRIBUTE);
  const definition = semanticId ? getSemanticNodeDefinition(semanticId) : undefined;

  if (!definition) {
    return Array.from(element.children).flatMap((child) => captureSemanticElement(child, metrics));
  }

  const bounds = element.getBoundingClientRect();
  const styleElement = getSemanticStyleElement(element, definition);
  const style = window.getComputedStyle(styleElement);
  const textStyle =
    definition.kind === 'text' || definition.kind === 'button' ? getTextStyle(styleElement) : undefined;
  const padding = readSpacing(style, 'padding');
  const margin = readSpacing(style, 'margin');
  const computedGap = numericStyle(style.gap);
  const layout =
    definition.kind === 'button' && computedGap != null
      ? {
          ...definition.layout,
          gap: {
            value: computedGap,
            expression: 'computed gap',
          },
        }
      : definition.layout;

  return [
    {
      ...definition,
      layout,
      bounds: {
        x: round((bounds.left - metrics.rootRect.left) / metrics.scaleX),
        y: round((bounds.top - metrics.rootRect.top) / metrics.scaleY),
        width: round(bounds.width / metrics.scaleX),
        height: round(bounds.height / metrics.scaleY),
      },
      visualStyle: {
        backgroundColor: cleanCssValue(style.backgroundColor, EMPTY_CSS_COLOR),
        color: cleanCssValue(style.color),
        opacity: numericStyle(style.opacity),
        borderColor: cleanCssValue(style.borderTopColor, EMPTY_CSS_COLOR),
        borderWidth: numericStyle(style.borderTopWidth),
        borderRadius: numericStyle(style.borderTopLeftRadius),
      },
      spacing: { padding, margin },
      textStyle,
      children: Array.from(element.children).flatMap((child) => captureSemanticElement(child, metrics)),
    },
  ];
};

const waitForPaint = async () => {
  await document.fonts.ready;
  for (let index = 0; index < SCREEN_PAINT_FRAME_COUNT; index += 1) {
    await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));
  }
};

const getCaptureRoot = () => {
  const root = document.querySelector<HTMLDivElement>(SCREEN_CAPTURE_SELECTOR);
  if (!root) throw new Error(`Unable to find ${SCREEN_CAPTURE_SELECTOR}`);
  return root;
};

const captureScreen = (node: ContentMapNode, frameSpec: FrameSpec): FigmaExportScreen => {
  const root = getCaptureRoot();
  const metrics = getCaptureMetrics(root);
  const rootLayer = captureElement(root, metrics, '0');
  const warnings = rootLayer ? rootLayer.warnings : [];

  return {
    id: node.id,
    routePath: node.routePath,
    label: node.label,
    contentMap: node,
    viewport: {
      width: root.clientWidth || frameSpec.width,
      height: root.clientHeight || frameSpec.height,
    },
    capturedAtPath: window.location.pathname,
    designTree: captureSemanticElement(root, metrics),
    layers: rootLayer ? [rootLayer] : [],
    warnings,
  };
};

const getExportFileName = () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${GENERATED_FILE_PREFIX}-${timestamp}.json`;
};

export const downloadFigmaExport = (payload: FlowFigmaExportV1) => {
  const blob = new Blob([JSON.stringify(payload, null, Spacing.XXXXS)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getExportFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const capturePrototypeFlow = async ({
  graph,
  framePreset,
  frameSpec,
  navigate,
}: CapturePrototypeFlowOptions): Promise<FlowFigmaExportV1> => {
  const originalPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const screens: FigmaExportScreen[] = [];

  try {
    for (const node of graph.nodes) {
      navigate(node.routePath);
      await waitForPaint();
      screens.push(captureScreen(node, frameSpec));
    }
  } finally {
    navigate(originalPath);
    await waitForPaint();
  }

  return {
    schemaVersion: FIGMA_EXPORT_SCHEMA_VERSION,
    app: {
      name: config.appName,
      exportedAt: new Date().toISOString(),
      sourceUrl: window.location.href,
    },
    framePreset: {
      id: framePreset,
      spec: frameSpec,
    },
    tokens: {
      colors,
      colorRoles,
      darkModeColorRoles,
      spacing: Spacing,
      radii: Radii,
      borderWidth: BorderWidth,
      typography,
    },
    contentMapGraph: graph,
    screens,
  };
};
