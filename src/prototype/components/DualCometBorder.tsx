import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// CARD border-radius token = 16px (foundationalRadii.M)
const R = 16;

// Orbit speeds — deliberately different so the two comets drift in and out
// of phase, creating an interference pattern as they lap each other.
const ORBIT_1 = 1.35; // seconds
const ORBIT_2 = 1.82; // seconds

// Total duration before the glow starts fading (ms).
// Longer comet completes ~3 full laps in this window.
const ACTIVE_MS = 5400;
const FADE_OUT_MS = 700;

export const DualCometBorder: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [opacity, setOpacity] = useState(0);
  const started = useRef(false);

  // Measure the parent wrapper (the relative div wrapping the card).
  useEffect(() => {
    const parent = svgRef.current?.parentElement;
    if (!parent) return;
    const obs = new ResizeObserver((entries) => {
      const e = entries[0];
      if (!e) return;
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(parent);
    return () => obs.disconnect();
  }, []);

  // Fire once when the user enters the draw.
  useEffect(() => {
    if (!isActive || started.current) return;
    started.current = true;
    setOpacity(1);
    const t = setTimeout(() => setOpacity(0), ACTIVE_MS);
    return () => clearTimeout(t);
  }, [isActive]);

  const w = size?.w ?? 0;
  const h = size?.h ?? 0;

  // Perimeter of a rounded rectangle.
  const perim = w > 0 ? 2 * (w - 2 * R) + 2 * (h - 2 * R) + 2 * Math.PI * R : 0;

  // Comet body = 20% of perimeter, capped to keep it from looking too long on
  // tall cards.
  const body = Math.min(perim * 0.2, 96);
  const gap = perim - body;

  // Bright head = front 22% of the body arc.
  const headLen = body * 0.22;
  const headGap = perim - headLen;

  return (
    <motion.svg
      ref={svgRef}
      aria-hidden
      className="pointer-events-none absolute"
      style={{ top: -3, left: -3, zIndex: 10, overflow: 'visible' }}
      width={w > 0 ? w + 6 : 0}
      height={h > 0 ? h + 6 : 0}
      animate={{ opacity }}
      transition={{ duration: opacity === 1 ? 0.3 : FADE_OUT_MS / 1000, ease: 'easeOut' }}
    >
      {perim > 0 && (
        <>
          <defs>
            {/* Outer glow for each comet — spreads outward without touching the
                card interior because the SVG overflows the card boundary. */}
            <filter id="dcb-g1" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="dcb-g2" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Comet 1 — warm amber ── */}

          {/* Diffuse glow halo */}
          <motion.rect
            x={3} y={3} width={w} height={h} rx={R}
            fill="none" stroke="rgba(240,158,25,0.42)" strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${body} ${gap}`}
            filter="url(#dcb-g1)"
            animate={{ strokeDashoffset: [0, -perim] }}
            transition={{ duration: ORBIT_1, repeat: Infinity, ease: 'linear' }}
          />
          {/* Sharp bright head */}
          <motion.rect
            x={3} y={3} width={w} height={h} rx={R}
            fill="none" stroke="rgba(255,205,70,0.95)" strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={`${headLen} ${headGap}`}
            filter="url(#dcb-g1)"
            animate={{ strokeDashoffset: [0, -perim] }}
            transition={{ duration: ORBIT_1, repeat: Infinity, ease: 'linear' }}
          />

          {/* ── Comet 2 — soft violet, starts 50% offset, slightly slower ── */}

          {/* Diffuse glow halo */}
          <motion.rect
            x={3} y={3} width={w} height={h} rx={R}
            fill="none" stroke="rgba(118,88,245,0.38)" strokeWidth={7}
            strokeLinecap="round"
            strokeDasharray={`${body} ${gap}`}
            strokeDashoffset={-(perim / 2)}
            filter="url(#dcb-g2)"
            animate={{ strokeDashoffset: [-(perim / 2), -(perim / 2) - perim] }}
            transition={{ duration: ORBIT_2, repeat: Infinity, ease: 'linear' }}
          />
          {/* Sharp bright head */}
          <motion.rect
            x={3} y={3} width={w} height={h} rx={R}
            fill="none" stroke="rgba(200,186,255,0.95)" strokeWidth={1.5}
            strokeLinecap="round"
            strokeDasharray={`${headLen} ${headGap}`}
            strokeDashoffset={-(perim / 2)}
            filter="url(#dcb-g2)"
            animate={{ strokeDashoffset: [-(perim / 2), -(perim / 2) - perim] }}
            transition={{ duration: ORBIT_2, repeat: Infinity, ease: 'linear' }}
          />
        </>
      )}
    </motion.svg>
  );
};
