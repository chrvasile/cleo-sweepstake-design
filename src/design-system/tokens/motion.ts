/** Duration scale (ms). Aligned with Cleo's canonical MotionDuration. */
export const MotionDuration = {
  instant: 0,
  swift1: 50,
  swift2: 100,
  steady1: 200,
  steady2: 300,
  slow1: 400,
  slow2: 500,
  slow3: 1000,
} as const;

export type DurationToken = keyof typeof MotionDuration;

/** Cubic-bezier control points [x1, y1, x2, y2] for Framer Motion / CSS. */
export const MotionEasing = {
  linear: [0.0, 0.0, 1.0, 1.0],
  ease: [0.28, 0.0, 0.72, 1.0],
  easeIn: [0.28, 0.0, 0.84, 1.0],
  easeOut: [0.16, 0.0, 0.16, 1.0],
  easeInOut: [0.28, 0.0, 0.16, 1.0],
} as const;

export type EasingToken = keyof typeof MotionEasing;

export type BezierTuple = readonly [number, number, number, number];

export function msToSeconds(ms: number): number {
  return ms / 1000;
}

export const motion = {
  duration: MotionDuration,
  easing: MotionEasing,
} as const;
