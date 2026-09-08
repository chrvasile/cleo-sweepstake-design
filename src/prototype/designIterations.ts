import type { SegmentedControlItem } from '../design-system/components/SegmentedControl/types';

export type DesignIteration = 'visual' | 'widget-selection' | 'widget' | 'two-step';

export const DESIGN_ITERATIONS: readonly SegmentedControlItem<DesignIteration>[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'widget-selection', label: 'Widget + selection' },
  { value: 'widget', label: 'Widget' },
  { value: 'two-step', label: 'Two-step entry' },
];

export const DESIGN_ITERATION_LABEL: Record<DesignIteration, string> = {
  visual: 'Visual',
  'widget-selection': 'Widget + selection',
  widget: 'Widget',
  'two-step': 'Two-step entry',
};
