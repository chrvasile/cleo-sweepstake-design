export type SegmentedControlItem<T extends string = string> = {
  value: T;
  label: string;
  /** Render a vertical divider immediately before this item to visually group segments. */
  dividerBefore?: boolean;
};

export type SegmentedControlProps<T extends string = string> = {
  items: readonly SegmentedControlItem<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  isFullWidth?: boolean;
  className?: string;
};
