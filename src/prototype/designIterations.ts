import type { SegmentedControlItem } from '../design-system/components/SegmentedControl/types';

export type DateGroup = 'sep1' | 'sep8' | 'sep16';

export type DesignIteration =
  | 'visual'
  | 'widget-selection'
  | 'widget'
  | 'two-step'
  | 'two-step-no-modal'
  | 'sep16-two-step';

// Sep 1 and Sep 8 are frozen — no further changes to those variants.
export const DATE_GROUPS: readonly SegmentedControlItem<DateGroup>[] = [
  { value: 'sep1', label: '🔒 Sep 1' },
  { value: 'sep8', label: '🔒 Sep 8' },
  { value: 'sep16', label: 'Sep 17' },
];

export const ITERATIONS_BY_DATE: Record<DateGroup, readonly SegmentedControlItem<DesignIteration>[]> = {
  sep1: [
    { value: 'visual', label: 'Visual' },
    { value: 'widget-selection', label: 'Widget + selection' },
    { value: 'widget', label: 'Widget' },
  ],
  sep8: [
    { value: 'two-step', label: 'Two-step entry' },
    { value: 'two-step-no-modal', label: 'Two-step (no modal)' },
  ],
  sep16: [
    { value: 'sep16-two-step', label: 'Two-step entry' },
  ],
};

export const DEFAULT_ITERATION_BY_DATE: Record<DateGroup, DesignIteration> = {
  sep1: 'visual',
  sep8: 'two-step',
  sep16: 'sep16-two-step',
};

export const DESIGN_ITERATION_LABEL: Record<DesignIteration, string> = {
  visual: 'Visual',
  'widget-selection': 'Widget + selection',
  widget: 'Widget',
  'two-step': 'Two-step entry',
  'two-step-no-modal': 'Two-step (no modal)',
  'sep16-two-step': 'Two-step entry',
};
