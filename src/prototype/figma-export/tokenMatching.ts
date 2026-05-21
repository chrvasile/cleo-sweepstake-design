import {
  BorderWidth,
  Radii,
  Spacing,
  colorRoles,
  colors,
  darkModeColorRoles,
  fontWeights,
  typographyLineHeightMap,
  typographySizeMap,
} from '../../design-system/tokens';

type NumberLookup = Map<number, string>;
type StringLookup = Map<string, string>;

const TOKEN_MATCH_PRECISION = 100;

const roundForLookup = (value: number) => Math.round(value * TOKEN_MATCH_PRECISION) / TOKEN_MATCH_PRECISION;

const addNumberToken = (lookup: NumberLookup, name: string, value: number) => {
  const rounded = roundForLookup(value);
  if (!lookup.has(rounded)) lookup.set(rounded, name);
};

const addColorToken = (lookup: StringLookup, name: string, value: string) => {
  const normalized = normalizeColor(value);
  if (normalized && !lookup.has(normalized)) lookup.set(normalized, name);
};

const walkTokenObject = (
  value: unknown,
  prefix: string,
  onLeaf: (name: string, value: string | number) => void,
) => {
  if (typeof value === 'string' || typeof value === 'number') {
    onLeaf(prefix, value);
    return;
  }

  if (value == null || typeof value !== 'object') return;

  Object.entries(value as Record<string, unknown>).forEach(([key, child]) => {
    walkTokenObject(child, `${prefix}.${key}`, onLeaf);
  });
};

export const normalizeColor = (value: string | undefined): string | undefined => {
  if (!value || value === 'transparent') return undefined;

  const hexMatch = value.trim().match(/^#([0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (!hex) return undefined;
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    const alpha = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return `rgba(${red},${green},${blue},${roundForLookup(alpha)})`;
  }

  const colorMatch = value
    .trim()
    .match(/^rgba?\(([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)(?:[,\s/]+([-\d.]+%?))?\)$/i);

  if (!colorMatch) return undefined;

  const red = Number(colorMatch[1]);
  const green = Number(colorMatch[2]);
  const blue = Number(colorMatch[3]);
  const rawAlpha = colorMatch[4];
  const alpha = rawAlpha == null ? 1 : rawAlpha.endsWith('%') ? Number.parseFloat(rawAlpha) / 100 : Number(rawAlpha);

  if ([red, green, blue, alpha].some((part) => Number.isNaN(part))) return undefined;

  return `rgba(${Math.round(red)},${Math.round(green)},${Math.round(blue)},${roundForLookup(alpha)})`;
};

export const createTokenMatcher = () => {
  const colorLookup: StringLookup = new Map();
  const spacingLookup: NumberLookup = new Map();
  const radiiLookup: NumberLookup = new Map();
  const borderWidthLookup: NumberLookup = new Map();
  const fontSizeLookup: NumberLookup = new Map();
  const lineHeightLookup: NumberLookup = new Map();
  const fontWeightLookup: NumberLookup = new Map();

  walkTokenObject(colorRoles, 'colorRoles', (name, value) => {
    if (typeof value === 'string') addColorToken(colorLookup, name, value);
  });
  walkTokenObject(darkModeColorRoles, 'darkModeColorRoles', (name, value) => {
    if (typeof value === 'string') addColorToken(colorLookup, name, value);
  });
  walkTokenObject(colors, 'colors', (name, value) => {
    if (typeof value === 'string') addColorToken(colorLookup, name, value);
  });
  walkTokenObject(Spacing, 'Spacing', (name, value) => {
    if (typeof value === 'number') addNumberToken(spacingLookup, name, value);
  });
  walkTokenObject(Radii, 'Radii', (name, value) => {
    if (typeof value === 'number') addNumberToken(radiiLookup, name, value);
  });
  walkTokenObject(BorderWidth, 'BorderWidth', (name, value) => {
    if (typeof value === 'number') addNumberToken(borderWidthLookup, name, value);
  });
  walkTokenObject(typographySizeMap, 'typography.sizes', (name, value) => {
    if (typeof value === 'number') addNumberToken(fontSizeLookup, name, value);
  });
  walkTokenObject(typographyLineHeightMap, 'typography.lineHeights', (name, value) => {
    if (typeof value === 'number') addNumberToken(lineHeightLookup, name, value);
  });
  walkTokenObject(fontWeights, 'fontWeights', (name, value) => {
    if (typeof value === 'number') addNumberToken(fontWeightLookup, name, value);
  });

  return {
    color(value: string | undefined) {
      const normalized = normalizeColor(value);
      return normalized ? colorLookup.get(normalized) : undefined;
    },
    spacing(value: number | undefined) {
      return value == null ? undefined : spacingLookup.get(roundForLookup(value));
    },
    radius(value: number | undefined) {
      return value == null ? undefined : radiiLookup.get(roundForLookup(value));
    },
    borderWidth(value: number | undefined) {
      return value == null ? undefined : borderWidthLookup.get(roundForLookup(value));
    },
    fontSize(value: number | undefined) {
      return value == null ? undefined : fontSizeLookup.get(roundForLookup(value));
    },
    lineHeight(value: number | undefined) {
      return value == null ? undefined : lineHeightLookup.get(roundForLookup(value));
    },
    fontWeight(value: number | undefined) {
      return value == null ? undefined : fontWeightLookup.get(roundForLookup(value));
    },
  };
};
