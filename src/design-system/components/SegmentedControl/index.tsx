import { Fragment, useId } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '../Typography';
import type { SegmentedControlProps } from './types';

export function SegmentedControl<T extends string>({
  items,
  selectedValue,
  onValueChange,
  isFullWidth = false,
  className = '',
}: SegmentedControlProps<T>) {
  const indicatorId = useId();
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div
        className={`flex items-center p-XXXS rounded-PILL ${isFullWidth ? 'min-w-full' : ''}`}
        style={{ backgroundColor: 'var(--bg-secondary)', width: 'max-content' }}
      >
        {items.map((item) => {
          const isSelected = item.value === selectedValue;
          return (
            <Fragment key={item.value}>
              {item.dividerBefore && (
                <div
                  aria-hidden
                  className="self-stretch my-XXS mx-XXS"
                  style={{ width: 1, backgroundColor: 'var(--border-opaque)' }}
                />
              )}
              <button
                type="button"
                onClick={() => onValueChange(item.value)}
                className="relative px-S py-XS rounded-PILL"
                style={{ cursor: 'pointer', flex: isFullWidth ? '1 0 auto' : '0 0 auto' }}
              >
                {isSelected && (
                  <motion.div
                    layoutId={indicatorId}
                    className="absolute inset-0 rounded-PILL"
                    style={{ backgroundColor: 'var(--bg-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 whitespace-nowrap">
                  <Typography
                    type="buttonLabel"
                    size="M"
                    color={isSelected ? 'var(--content-primary)' : 'var(--content-tertiary)'}
                  >
                    {item.label}
                  </Typography>
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export type { SegmentedControlProps };
