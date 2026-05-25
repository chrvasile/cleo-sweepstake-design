export const TypographyWeight = {
  MEDIUM: 'Medium',
  SEMIBOLD: 'SemiBold',
  BOLD: 'Bold',
} as const;

export type TypographyWeightName = (typeof TypographyWeight)[keyof typeof TypographyWeight];

export const fontFamilies = {
  header: 'PPNeueMontreal-Bold',
  body: 'PPNeueMontreal',
} as const;

export const fontWeights = {
  Medium: 530,
  SemiBold: 700,
  Bold: 800,
} as const;

export type TypographyType =
  | 'display'
  | 'displayNumbers'
  | 'headline'
  | 'title'
  | 'titleStrong'
  | 'body'
  | 'bodyStrong'
  | 'bodyLink'
  | 'label'
  | 'labelStrong'
  | 'buttonLabel';

export type TypographySize = 'L' | 'M' | 'S' | 'XS';

export const typographySizeMap: Record<TypographySize, Partial<Record<TypographyType, number>>> = {
  L: {
    display: 54,
    displayNumbers: 60,
    headline: 28,
    title: 18,
    titleStrong: 18,
    body: 16,
    bodyStrong: 16,
    bodyLink: 16,
    label: 14,
    labelStrong: 14,
    buttonLabel: 16,
  },
  M: {
    display: 44,
    displayNumbers: 36,
    headline: 24,
    title: 16,
    titleStrong: 16,
    body: 14,
    bodyStrong: 14,
    bodyLink: 14,
    label: 12,
    labelStrong: 12,
    buttonLabel: 14,
  },
  S: {
    display: 36,
    displayNumbers: 24,
    headline: 20,
    title: 14,
    titleStrong: 14,
    body: 12,
    bodyStrong: 12,
    bodyLink: 12,
    label: 11,
    labelStrong: 11,
    buttonLabel: 12,
  },
  XS: {
    displayNumbers: 16,
  },
};

export const typographyLineHeightMap: Record<TypographySize, Partial<Record<TypographyType, number>>> = {
  L: {
    display: 60,
    displayNumbers: 68,
    headline: 32,
    title: 22,
    titleStrong: 22,
    body: 20,
    bodyStrong: 20,
    bodyLink: 20,
    label: 16,
    labelStrong: 16,
    buttonLabel: 20,
  },
  M: {
    display: 50,
    displayNumbers: 42,
    headline: 28,
    title: 20,
    titleStrong: 20,
    body: 18,
    bodyStrong: 18,
    bodyLink: 18,
    label: 14,
    labelStrong: 14,
    buttonLabel: 18,
  },
  S: {
    display: 40,
    displayNumbers: 32,
    headline: 24,
    title: 18,
    titleStrong: 18,
    body: 16,
    bodyStrong: 16,
    bodyLink: 16,
    label: 14,
    labelStrong: 14,
    buttonLabel: 16,
  },
  XS: {
    displayNumbers: 20,
  },
};

export const typographyDefaultWeights: Record<TypographyType, TypographyWeightName> = {
  display: 'Bold',
  displayNumbers: 'Bold',
  headline: 'Bold',
  title: 'Medium',
  titleStrong: 'Bold',
  body: 'Medium',
  bodyStrong: 'SemiBold',
  bodyLink: 'Medium',
  label: 'Medium',
  labelStrong: 'SemiBold',
  buttonLabel: 'SemiBold',
};

export const typography = {
  families: fontFamilies,
  weights: fontWeights,
  sizes: typographySizeMap,
  lineHeights: typographyLineHeightMap,
  defaultWeights: typographyDefaultWeights,
} as const;
