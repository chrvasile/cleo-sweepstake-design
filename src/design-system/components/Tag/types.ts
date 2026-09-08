import type { ReactNode } from 'react';
import type { LineIconName } from '../LineIcon/types';

export type TagVariant = 'info' | 'error' | 'warning' | 'success' | 'disabled' | 'neutral';
export type TagPalette = 'light' | 'dark';
/** 'M' (default) is the general-purpose tag. 'S' is a compact 24px-tall pill (e.g. Figma's DisplayTag). */
export type TagSize = 'M' | 'S';

export type TagProps = {
  /** Plain-text label. Ignored when `children` is passed (e.g. for mixed-weight runs). */
  label?: string;
  variant?: TagVariant;
  palette?: TagPalette;
  size?: TagSize;
  outline?: boolean;
  startIcon?: LineIconName;
  className?: string;
  /** Custom content in place of `label` — e.g. a mix of Typography weights. */
  children?: ReactNode;
};
