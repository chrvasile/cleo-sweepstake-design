import type { Config } from 'tailwindcss';
import {
  colors,
  colorRoles,
  Spacing,
  Radii,
  BorderWidth,
  typographySizeMap,
  typographyLineHeightMap,
  fontWeights,
} from './src/design-system/tokens';

const pxify = <T extends Record<string, number>>(obj: T): Record<keyof T, string> => {
  const out = {} as Record<keyof T, string>;
  for (const key in obj) out[key] = `${obj[key]}px`;
  return out;
};

const cssVar = (prefix: string, group: Record<string, string>): Record<string, string> => {
  const out: Record<string, string> = {};
  for (const key of Object.keys(group)) out[key] = `var(--${prefix}-${key})`;
  return out;
};

const fontSizeMap = (() => {
  const out: Record<string, [string, { lineHeight: string }]> = {};
  (['L', 'M', 'S', 'XS'] as const).forEach((size) => {
    const sizes = typographySizeMap[size];
    const lineHeights = typographyLineHeightMap[size];
    for (const type of Object.keys(sizes)) {
      const fs = sizes[type as keyof typeof sizes];
      const lh = lineHeights[type as keyof typeof lineHeights];
      if (fs != null && lh != null) {
        out[`${type}-${size}`] = [`${fs}px`, { lineHeight: `${lh}px` }];
      }
    }
  });
  return out;
})();

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ...colors,
      },
      backgroundColor: cssVar('bg', colorRoles.background),
      textColor: cssVar('content', colorRoles.content),
      borderColor: cssVar('border', colorRoles.border),
      spacing: pxify(Spacing),
      gap: pxify(Spacing),
      borderRadius: pxify(Radii),
      borderWidth: pxify(BorderWidth),
      fontFamily: {
        body: ['PPNeueMontreal', 'system-ui', '-apple-system', 'sans-serif'],
        header: ['PPNeueMontreal-Bold', 'PPNeueMontreal', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        Medium: String(fontWeights.Medium),
        SemiBold: String(fontWeights.SemiBold),
        Bold: String(fontWeights.Bold),
      },
      fontSize: fontSizeMap,
    },
  },
  plugins: [],
};

export default config;
