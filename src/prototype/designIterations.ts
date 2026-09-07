import type { SegmentedControlItem } from '../design-system/components/SegmentedControl/types';

export type DesignIteration = 'visual' | 'widget-selection' | 'widget';

export const DESIGN_ITERATIONS: readonly SegmentedControlItem<DesignIteration>[] = [
  { value: 'visual', label: 'Visual' },
  { value: 'widget-selection', label: 'Widget + selection' },
  { value: 'widget', label: 'Widget' },
];

export const DESIGN_ITERATION_LABEL: Record<DesignIteration, string> = {
  visual: 'Visual',
  'widget-selection': 'Widget + selection',
  widget: 'Widget',
};
