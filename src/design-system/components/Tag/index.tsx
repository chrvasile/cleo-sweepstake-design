import React from 'react';
import { LineIcon } from '../LineIcon';
import { Typography } from '../Typography';
import type { TagProps, TagSize, TagVariant } from './types';

const VARIANT_STYLES: Record<TagVariant, { bg: string; content: string; border: string }> = {
  info: { bg: 'var(--bg-waitingLight)', content: 'var(--content-waitingMid)', border: 'var(--border-waitingLight)' },
  success: { bg: 'var(--bg-positiveLight)', content: 'var(--content-positiveMid)', border: 'var(--border-positiveLight)' },
  warning: { bg: 'var(--bg-warningLight)', content: 'var(--content-warningMid)', border: 'var(--border-warningLight)' },
  error: { bg: 'var(--bg-negativeLight)', content: 'var(--content-negativeMid)', border: 'var(--border-negativeLight)' },
  disabled: { bg: 'var(--bg-disabled)', content: 'var(--content-disabled)', border: 'var(--border-disabled)' },
  neutral: { bg: 'var(--bg-secondary)', content: 'var(--content-primary)', border: 'var(--border-default)' },
};

// 'M' is the general-purpose tag used elsewhere (e.g. the design system gallery).
// 'S' is the compact 24px pill Figma's DisplayTag uses — tighter padding/gap, fixed height.
const SIZE_STYLES: Record<TagSize, { className: string; height?: number }> = {
  M: { className: 'gap-XXS px-XS py-XXS' },
  S: { className: 'gap-XXXS px-XXS py-XXXS', height: 24 },
};

export const Tag: React.FC<TagProps> = ({
  label,
  variant = 'neutral',
  size = 'M',
  outline = false,
  startIcon,
  className = '',
  children,
}) => {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  return (
    <span
      className={`inline-flex items-center justify-center rounded-PILL ${s.className} ${className}`}
      style={{
        backgroundColor: outline ? 'transparent' : v.bg,
        borderWidth: outline ? 1 : 0,
        borderStyle: 'solid',
        borderColor: v.border,
        height: s.height,
      }}
    >
      {startIcon && <LineIcon name={startIcon} size="XS" color={v.content} />}
      {children ?? (
        <Typography type="labelStrong" size="S" color={v.content}>
          {label}
        </Typography>
      )}
    </span>
  );
};

export type { TagProps };
