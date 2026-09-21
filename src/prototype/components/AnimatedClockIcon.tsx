import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MotionDuration, MotionTransitions, framerFromDef } from '../../design-system/tokens';

// Same face + hands geometry as the design system's "clock" LineIcon
// (src/design-system/components/LineIcon/generatedIcons.tsx), split into two
// independently-rotatable hand paths instead of one static combined path.
// Not added to the design system itself since this ticking behaviour is
// specific to this one countdown use case, not a general-purpose icon state.
const CENTER = { x: 12, y: 12 };
const HOUR_HAND_TIP = { x: 12, y: 4.99976 };
const MINUTE_HAND_TIP = { x: 17.0004, y: 12 };

// Each tick moves a hand and holds — mirrors how the seconds/minutes/hours
// actually advance on the countdown below the icon, rather than a smooth
// continuous sweep. Ticking backwards (negative rotation) reads as counting
// down rather than a normal clock counting up.
const MINUTE_TICK_DEGREES = -30; // 12 ticks per full rotation
const HOUR_TICK_DEGREES = -15;
// Half the previous (steady2 / slow1) tick intervals — twice the tick rate.
const MINUTE_TICK_INTERVAL_MS = MotionDuration.steady2 / 2; // 150ms
const HOUR_TICK_INTERVAL_MS = MotionDuration.slow1 / 2; // 200ms — still visibly slower than the minute hand
const TICK_TRANSITION = framerFromDef(MotionTransitions.slide.swift2); // near-instant 100ms jump per tick

const AnimatedHand: React.FC<{
  tip: { x: number; y: number };
  tickDegrees: number;
  tickIntervalMs: number;
  speedMultiplier?: number;
}> = ({ tip, tickDegrees, tickIntervalMs, speedMultiplier = 1 }) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => prev + tickDegrees);
    }, tickIntervalMs / speedMultiplier);
    return () => clearInterval(interval);
  }, [tickDegrees, tickIntervalMs, speedMultiplier]);

  return (
    <motion.path
      d={`M${CENTER.x} ${CENTER.y}L${tip.x} ${tip.y}`}
      stroke="currentColor"
      animate={{ rotate: rotation }}
      transition={TICK_TRANSITION}
      style={{ originX: `${CENTER.x}px`, originY: `${CENTER.y}px` }}
    />
  );
};

// Matches the LineIcon component's own rendering (24x24 viewBox, currentColor,
// round caps/joins) so it drops in as a like-for-like replacement wherever the
// static "clock" LineIcon was used.
export const AnimatedClockIcon: React.FC<{ size?: number; color?: string; strokeWidth?: number; speedMultiplier?: number }> = ({
  size = 20,
  color,
  strokeWidth = 1.5,
  speedMultiplier = 1,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeMiterlimit={10}
    style={{ color: color ?? 'var(--content-primary)', display: 'inline-block', flexShrink: 0 }}
    aria-hidden
  >
    <circle cx={CENTER.x} cy={CENTER.y} r="11" />
    <AnimatedHand tip={HOUR_HAND_TIP} tickDegrees={HOUR_TICK_DEGREES} tickIntervalMs={HOUR_TICK_INTERVAL_MS} speedMultiplier={speedMultiplier} />
    <AnimatedHand tip={MINUTE_HAND_TIP} tickDegrees={MINUTE_TICK_DEGREES} tickIntervalMs={MINUTE_TICK_INTERVAL_MS} speedMultiplier={speedMultiplier} />
  </svg>
);
