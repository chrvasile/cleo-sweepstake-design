import type { SegmentedControlItem } from '../design-system/components/SegmentedControl/types';

export type DesignIteration =
  | 'visual'
  | 'widget-selection'
  | 'widget'
  | 'two-step'
  | 'two-step-no-modal';

export const DESIGN_ITERATIONS: readonly SegmentedControlItem<DesignIteration>[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'widget-selection', label: 'Widget + selection' },
  { value: 'widget', label: 'Widget' },
  { value: 'two-step', label: 'Two-step entry', dividerBefore: true },
  { value: 'two-step-no-modal', label: 'Two-step (no modal)' },
];

export const DESIGN_ITERATION_LABEL: Record<DesignIteration, string> = {
  visual: 'Visual',
  'widget-selection': 'Widget + selection',
  widget: 'Widget',
  'two-step': 'Two-step entry',
  'two-step-no-modal': 'Two-step (no modal)',
};
