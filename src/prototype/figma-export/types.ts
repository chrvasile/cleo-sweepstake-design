import type { FramePreset, FrameSpec } from '../../shell';
import type {
  BackgroundRole,
  ContentRole,
  TypographySize,
  TypographyType,
  TypographyWeightName,
} from '../../design-system/tokens';
import type { ContentMapGraph, ContentMapNode } from '../content-map/types';

export const FIGMA_EXPORT_SCHEMA_VERSION = 1;

export type FigmaExportBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FigmaExportLayerType = 'root' | 'container' | 'text' | 'image' | 'svg' | 'shape';

export type FigmaExportSpacingStyle = {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
};

export type FigmaExportLayoutStyle = {
  display?: string;
  position?: string;
  overflow?: string;
  flexDirection?: string;
  flexWrap?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  flexGrow?: number;
  flexShrink?: number;
};

export type FigmaExportVisualStyle = {
  backgroundColor?: string;
  backgroundImage?: string;
  color?: string;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  boxShadow?: string;
  transform?: string;
};

export type FigmaExportTextStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: string;
  textDecoration?: string;
  textTransform?: string;
  whiteSpace?: string;
  lineCount?: number;
};

export type FigmaExportTokenMatches = Partial<Record<string, string>>;

export type FigmaSemanticDimension = {
  value: number;
  token?: string;
  expression?: string;
};

export type FigmaSemanticBoxEdges = {
  top?: FigmaSemanticDimension;
  right?: FigmaSemanticDimension;
  bottom?: FigmaSemanticDimension;
  left?: FigmaSemanticDimension;
};

export type FigmaSemanticSizing = 'fill' | 'hug' | 'fixed';

export type FigmaSemanticNodeKind = 'stack' | 'text' | 'spacer' | 'button' | 'frame';

export type FigmaSemanticNodeDefinition = {
  id: string;
  kind: FigmaSemanticNodeKind;
  name: string;
  layout?: {
    direction?: 'vertical' | 'horizontal';
    gap?: FigmaSemanticDimension;
    padding?: FigmaSemanticBoxEdges;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between';
    grow?: number;
    width?: FigmaSemanticSizing;
    height?: FigmaSemanticSizing;
  };
  visual?: {
    backgroundRole?: BackgroundRole;
    contentRole?: ContentRole;
  };
  text?: {
    value: string;
    type: TypographyType;
    size: TypographySize;
    weight?: TypographyWeightName;
    colorRole: ContentRole;
    width?: FigmaSemanticSizing;
  };
  button?: {
    label: string;
    size: 'S' | 'M' | 'L';
    variant: 'primary' | 'secondary' | 'tertiary' | 'text' | 'link';
    width?: FigmaSemanticSizing;
  };
};

export type FigmaSemanticNode = FigmaSemanticNodeDefinition & {
  bounds: FigmaExportBounds;
  visualStyle: FigmaExportVisualStyle;
  spacing?: {
    padding: FigmaExportSpacingStyle;
    margin: FigmaExportSpacingStyle;
  };
  textStyle?: FigmaExportTextStyle;
  children: FigmaSemanticNode[];
};

export type FigmaExportLayer = {
  id: string;
  path: string;
  name: string;
  type: FigmaExportLayerType;
  tagName: string;
  bounds: FigmaExportBounds;
  layout: FigmaExportLayoutStyle;
  visual: FigmaExportVisualStyle;
  textStyle?: FigmaExportTextStyle;
  spacing: {
    padding: FigmaExportSpacingStyle;
    margin: FigmaExportSpacingStyle;
  };
  text?: string;
  image?: {
    src: string;
    alt?: string;
    objectFit?: string;
  };
  svg?: string;
  tokens: FigmaExportTokenMatches;
  warnings: string[];
  children: FigmaExportLayer[];
};

export type FigmaExportScreen = {
  id: string;
  routePath: string;
  label: string;
  contentMap: ContentMapNode;
  viewport: {
    width: number;
    height: number;
  };
  capturedAtPath: string;
  designTree: FigmaSemanticNode[];
  layers: FigmaExportLayer[];
  warnings: string[];
};

export type FigmaExportTokens = {
  colors: unknown;
  colorRoles: unknown;
  darkModeColorRoles: unknown;
  spacing: Record<string, number>;
  radii: Record<string, number>;
  borderWidth: Record<string, number>;
  typography: unknown;
};

export type FlowFigmaExportV1 = {
  schemaVersion: typeof FIGMA_EXPORT_SCHEMA_VERSION;
  app: {
    name: string;
    exportedAt: string;
    sourceUrl: string;
  };
  framePreset: {
    id: FramePreset;
    spec: FrameSpec;
  };
  tokens: FigmaExportTokens;
  contentMapGraph: ContentMapGraph;
  screens: FigmaExportScreen[];
};
