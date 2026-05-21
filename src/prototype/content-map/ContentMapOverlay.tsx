import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LineIcon, Typography } from '../../design-system/components';
import { BorderWidth, MotionDuration, MotionEasing, Spacing } from '../../design-system/tokens';
import type { ContentMapEdge, ContentMapGraph, ContentMapNode, ContentMapOption, ContentMapStatus } from './types';

type Props = {
  graph: ContentMapGraph;
  open: boolean;
  onClose: () => void;
  onNavigateToRoute?: (routePath: string) => void;
};

type NodePosition = {
  x: number;
  y: number;
  h: number;
  column: number;
};

const NODE_WIDTH = Spacing.XXL * 5;
const COLUMN_GAP = Spacing.XXL * 4;
const ROW_GAP = Spacing.XL;
const CANVAS_PADDING = Spacing.XL;
const FALLBACK_NODE_HEIGHT = Spacing.XXL * 3;
const CANVAS_TOP_OFFSET = Spacing.M;
const FIT_PADDING = Spacing.XL * 2;
const EDGE_CONTROL_MIN = Spacing.XXL;
const EDGE_HIT_WIDTH = Spacing.XS;
const MARKER_SIZE = Spacing.XXS;
const MIN_ZOOM = Spacing.XXXS / Spacing.XL;
const MAX_ZOOM = Spacing.XL / Spacing.M;
const DEFAULT_ZOOM = Spacing.M / Spacing.XL;
const WHEEL_INTENSITY = Spacing.CHAT_BUBBLES / (Spacing.XXL * Spacing.XL);
const PINCH_INTENSITY = Spacing.CHAT_BUBBLES / (Spacing.XL * Spacing.XL);

const FADE_TRANSITION = {
  duration: MotionDuration.steady1 / MotionDuration.slow3,
  ease: [...MotionEasing.easeOut],
};

const CARD_BACKGROUND_BY_STATUS: Record<ContentMapStatus, string> = {
  done: 'var(--bg-primary)',
  todo: 'var(--bg-warningLight)',
  external: 'var(--bg-positiveLight)',
};

const EDGE_COLOR = CARD_BACKGROUND_BY_STATUS.done;

const CARD_BORDER_BY_STATUS: Record<ContentMapStatus, string> = {
  done: 'var(--border-default)',
  todo: 'var(--border-warningMid)',
  external: 'var(--border-positiveMid)',
};

const resolveColumns = (nodes: ContentMapNode[], edges: ContentMapEdge[]) => {
  const columns: Record<string, number> = {};
  const explicitColumns = new Set<string>();

  nodes.forEach((node) => {
    columns[node.id] = node.column ?? Spacing.ZERO;
    if (node.column != null) explicitColumns.add(node.id);
  });

  for (let pass = Spacing.ZERO; pass < nodes.length; pass += 1) {
    let changed = false;
    edges.forEach((edge) => {
      if (explicitColumns.has(edge.to)) return;
      const fromColumn = columns[edge.from];
      if (fromColumn == null) return;
      const nextColumn = fromColumn + 1;
      if ((columns[edge.to] ?? Spacing.ZERO) < nextColumn) {
        columns[edge.to] = nextColumn;
        changed = true;
      }
    });
    if (!changed) break;
  }

  return columns;
};

const layoutNodes = (nodes: ContentMapNode[], edges: ContentMapEdge[], heights: Record<string, number>) => {
  const positions: Record<string, NodePosition> = {};
  const cursorByColumn: Record<number, number> = {};
  const columns = resolveColumns(nodes, edges);

  nodes.forEach((node) => {
    const column = columns[node.id] ?? Spacing.ZERO;
    const x = CANVAS_PADDING + column * (NODE_WIDTH + COLUMN_GAP);
    const y = cursorByColumn[column] ?? CANVAS_PADDING;
    const h = heights[node.id] ?? FALLBACK_NODE_HEIGHT;
    positions[node.id] = { x, y, h, column };
    cursorByColumn[column] = y + h + ROW_GAP;
  });

  const totalsByColumn: Record<number, number> = {};
  Object.values(positions).forEach((position) => {
    totalsByColumn[position.column] = Math.max(totalsByColumn[position.column] ?? Spacing.ZERO, position.y + position.h);
  });

  const totals = Object.values(totalsByColumn);
  const tallest = totals.length > Spacing.ZERO ? Math.max(...totals) : Spacing.ZERO;

  Object.entries(totalsByColumn).forEach(([columnKey, total]) => {
    const offset = (tallest - total) / 2;
    if (offset <= Spacing.ZERO) return;
    const column = Number(columnKey);
    nodes.forEach((node) => {
      const position = positions[node.id];
      if (position && position.column === column) position.y += offset;
    });
  });

  return positions;
};

const getCanvasBounds = (positions: Record<string, NodePosition>) => {
  const values = Object.values(positions);
  if (values.length === Spacing.ZERO) {
    return {
      maxX: NODE_WIDTH + FIT_PADDING,
      maxY: FALLBACK_NODE_HEIGHT + FIT_PADDING,
    };
  }

  return {
    maxX: Math.max(...values.map((position) => position.x + NODE_WIDTH)) + FIT_PADDING,
    maxY: Math.max(...values.map((position) => position.y + position.h)) + FIT_PADDING,
  };
};

export const ContentMapOverlay: React.FC<Props> = ({ graph, open, onClose, onNavigateToRoute }) => {
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: Spacing.ZERO, y: Spacing.ZERO });
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [hoveredEdge, setHoveredEdge] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  zoomRef.current = zoom;
  panRef.current = pan;

  const { nodes, edges } = graph;
  const positions = layoutNodes(nodes, edges, heights);
  const { maxX, maxY } = getCanvasBounds(positions);

  useEffect(() => {
    if (!open) return;

    setHeights({});
    const measure = () => {
      const next: Record<string, number> = {};
      nodes.forEach((node) => {
        const element = nodeRefs.current[node.id];
        if (element) next[node.id] = element.offsetHeight;
      });
      setHeights(next);
    };

    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    Object.values(nodeRefs.current).forEach((element) => {
      if (element) observer?.observe(element);
    });

    return () => observer?.disconnect();
  }, [nodes, open]);

  useEffect(() => {
    if (!open) return;

    setPan({ x: Spacing.ZERO, y: Spacing.ZERO });
    const element = canvasRef.current;
    if (!element) {
      setZoom(DEFAULT_ZOOM);
      return;
    }

    const { width, height } = element.getBoundingClientRect();
    const initialPositions = layoutNodes(nodes, edges, {});
    const bounds = getCanvasBounds(initialPositions);
    const fitZoom = Math.min((width - FIT_PADDING) / bounds.maxX, (height - FIT_PADDING) / bounds.maxY);
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitZoom)));
  }, [edges, nodes, open]);

  useEffect(() => {
    if (!open) return;

    const element = canvasRef.current;
    if (!element) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const intensity = event.ctrlKey ? PINCH_INTENSITY : WHEEL_INTENSITY;
      const factor = Math.exp(-event.deltaY * intensity);
      const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * factor));
      const realFactor = nextZoom / zoomRef.current;
      const rect = element.getBoundingClientRect();
      const centerX = event.clientX - rect.left - rect.width / 2;
      const centerY = event.clientY - rect.top - CANVAS_TOP_OFFSET;
      const currentPan = panRef.current;
      setPan({
        x: centerX - (centerX - currentPan.x) * realFactor,
        y: centerY - (centerY - currentPan.y) * realFactor,
      });
      setZoom(nextZoom);
    };

    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [open]);

  const handlePointerDown = (event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest('[data-no-pan]')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: pan.x,
      baseY: pan.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    setPan({
      x: drag.baseX + event.clientX - drag.startX,
      y: drag.baseY + event.clientY - drag.startY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    dragRef.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      return;
    }
  };

  const focusNode = (id: string) => {
    const targetPosition = positions[id];
    const element = canvasRef.current;
    if (!targetPosition || !element) return;

    const rect = element.getBoundingClientRect();
    const targetCenterX = targetPosition.x + NODE_WIDTH / 2;
    const targetCenterY = targetPosition.y + targetPosition.h / 2;
    const targetPanX = zoomRef.current * (maxX / 2 - targetCenterX);
    const targetPanY = rect.height / 2 - CANVAS_TOP_OFFSET - zoomRef.current * targetCenterY;

    setAnimating(true);
    setPan({ x: targetPanX, y: targetPanY });
    window.setTimeout(() => setAnimating(false), MotionDuration.slow2);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: Spacing.ZERO }}
          animate={{ opacity: 1 }}
          exit={{ opacity: Spacing.ZERO }}
          transition={FADE_TRANSITION}
          className="fixed inset-0 flex flex-col"
          style={{
            zIndex: Spacing.XXL * Spacing.M,
            backgroundColor: 'var(--bg-overlay)',
            backdropFilter: `blur(${Spacing.XXS}px)`,
            WebkitBackdropFilter: `blur(${Spacing.XXS}px)`,
          }}
        >
          <div
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative flex-1 overflow-hidden"
            style={{
              cursor: dragRef.current ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          >
            <motion.button
              type="button"
              onClick={onClose}
              aria-label="Close content map"
              data-no-pan
              whileHover={{ backgroundColor: 'var(--bg-overlayInverse)' }}
              whileTap={{ scale: 0.97 }}
              className="absolute inline-flex items-center justify-center rounded-ICON"
              style={{
                top: Spacing.S,
                right: Spacing.S,
                zIndex: Spacing.XXL,
                width: Spacing.XL,
                height: Spacing.XL,
                border: 'none',
                backgroundColor: 'var(--bg-primaryInverse)',
                color: 'var(--content-primaryInverse)',
                cursor: 'pointer',
              }}
            >
              <LineIcon name="cross" size="S" color="currentColor" />
            </motion.button>

            <div
              className="absolute"
              style={{
                left: '50%',
                top: CANVAS_TOP_OFFSET,
                width: maxX,
                height: maxY,
                transform: `translate(-50%, 0) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '50% 0',
                transition: animating
                  ? `transform ${MotionDuration.slow2}ms cubic-bezier(${MotionEasing.easeOut.join(',')})`
                  : 'none',
              }}
            >
              <svg
                width={maxX}
                height={maxY}
                className="pointer-events-none absolute inset-0 overflow-visible"
                aria-hidden
              >
                <defs>
                  <marker
                    id="content-map-arrow"
                    viewBox={`0 0 ${MARKER_SIZE} ${MARKER_SIZE}`}
                    refX={MARKER_SIZE - BorderWidth.S}
                    refY={MARKER_SIZE / 2}
                    markerWidth={MARKER_SIZE}
                    markerHeight={MARKER_SIZE}
                    orient="auto-start-reverse"
                  >
                    <path
                      d={`M0,0 L${MARKER_SIZE},${MARKER_SIZE / 2} L0,${MARKER_SIZE} z`}
                      fill={EDGE_COLOR}
                    />
                  </marker>
                </defs>
                {edges.map((edge, index) => {
                  const from = positions[edge.from];
                  const to = positions[edge.to];
                  if (!from || !to) return null;

                  const x1 = from.x + NODE_WIDTH;
                  const y1 = from.y + from.h / 2;
                  const x2 = to.x;
                  const y2 = to.y + to.h / 2;
                  const dx = Math.max(EDGE_CONTROL_MIN, (x2 - x1) / 2);
                  const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
                  const dimmed = hoveredEdge != null && hoveredEdge !== index;

                  return (
                    <g
                      key={`${edge.from}-${edge.to}-${edge.label ?? index}`}
                      className="pointer-events-auto"
                      style={{
                        opacity: dimmed ? 0.2 : 1,
                        transition: `opacity ${MotionDuration.steady1}ms ease`,
                      }}
                      onMouseEnter={() => setHoveredEdge(index)}
                      onMouseLeave={() => setHoveredEdge(null)}
                    >
                      <path d={path} fill="none" stroke="transparent" strokeWidth={EDGE_HIT_WIDTH} />
                      <path
                        d={path}
                        fill="none"
                        stroke={EDGE_COLOR}
                        strokeWidth={BorderWidth.L}
                        markerEnd="url(#content-map-arrow)"
                      />
                    </g>
                  );
                })}
              </svg>

              {edges.map((edge, index) => {
                if (!edge.label) return null;
                const from = positions[edge.from];
                const to = positions[edge.to];
                if (!from || !to) return null;

                const x1 = from.x + NODE_WIDTH;
                const y1 = from.y + from.h / 2;
                const x2 = to.x;
                const y2 = to.y + to.h / 2;
                const dimmed = hoveredEdge != null && hoveredEdge !== index;

                return (
                  <div
                    key={`${edge.from}-${edge.to}-${edge.label}`}
                    className="pointer-events-none absolute whitespace-nowrap rounded-PILL bg-primary px-XS py-XXXS"
                    style={{
                      left: (x1 + x2) / 2,
                      top: (y1 + y2) / 2,
                      transform: 'translate(-50%, -50%)',
                      border: `${BorderWidth.S}px solid var(--border-default)`,
                      opacity: dimmed ? 0.2 : 1,
                      transition: `opacity ${MotionDuration.steady1}ms ease`,
                    }}
                  >
                    <Typography type="labelStrong" size="S" color="var(--content-secondary)">
                      {edge.label}
                    </Typography>
                  </div>
                );
              })}

              {nodes.map((node) => {
                const position = positions[node.id];
                if (!position) return null;
                const activeEdge = hoveredEdge != null ? edges[hoveredEdge] : null;
                const connected = activeEdge && (activeEdge.from === node.id || activeEdge.to === node.id);
                const dimmed = hoveredEdge != null && !connected;

                return (
                  <div
                    key={node.id}
                    ref={(element) => {
                      nodeRefs.current[node.id] = element;
                    }}
                    data-no-pan
                    className="absolute"
                    style={{
                      left: position.x,
                      top: position.y,
                      width: NODE_WIDTH,
                      opacity: dimmed ? 0.2 : 1,
                      transition: `opacity ${MotionDuration.steady1}ms ease`,
                    }}
                  >
                    <ScreenCard
                      node={node}
                      nodes={nodes}
                      onFocusNode={focusNode}
                      onNavigateToRoute={onNavigateToRoute}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ScreenCard: React.FC<{
  node: ContentMapNode;
  nodes: ContentMapNode[];
  onFocusNode: (id: string) => void;
  onNavigateToRoute?: (routePath: string) => void;
}> = ({ node, nodes, onFocusNode, onNavigateToRoute }) => (
  <div
    className="flex flex-col gap-XS rounded-CARD p-S"
    style={{
      backgroundColor: CARD_BACKGROUND_BY_STATUS[node.status],
      border: `${BorderWidth.S}px solid ${CARD_BORDER_BY_STATUS[node.status]}`,
    }}
  >
    <Typography type="labelStrong" size="S" uppercase color="var(--content-tertiary)">
      {node.context}
    </Typography>

    {(node.heading || node.subhead) && (
      <div className="flex flex-col gap-XXXXS">
        {node.heading && (
          <Typography type="titleStrong" size="M" color="var(--content-primary)">
            {node.heading}
          </Typography>
        )}
        {node.subhead && (
          <Typography type="body" size="S" color="var(--content-secondary)">
            {node.subhead}
          </Typography>
        )}
      </div>
    )}

    {node.body?.map((paragraph) => (
      <Typography key={paragraph} type="body" size="S" color="var(--content-secondary)">
        {paragraph}
      </Typography>
    ))}

    {node.options.length > Spacing.ZERO && (
      <div className="mt-XXXS flex flex-col gap-XXXS">
        {node.options.map((option) => (
          <OptionPill key={option.code} option={option} nodes={nodes} onFocusNode={onFocusNode} />
        ))}
      </div>
    )}

    {node.note && (
      <Typography type="label" size="S" italic color="var(--content-tertiary)">
        {node.note}
      </Typography>
    )}

    {onNavigateToRoute && (
      <motion.button
        type="button"
        data-no-pan
        onClick={() => onNavigateToRoute(node.routePath)}
        whileTap={{ scale: 0.97 }}
        className="mt-XXXS rounded-BUTTON px-XS py-XXS"
        style={{
          border: `${BorderWidth.S}px solid var(--border-default)`,
          backgroundColor: 'var(--bg-accentLight)',
          color: 'var(--content-secondary)',
          cursor: 'pointer',
        }}
      >
        <Typography type="buttonLabel" size="S" color="currentColor">
          Preview screen
        </Typography>
      </motion.button>
    )}
  </div>
);

const OptionPill: React.FC<{
  option: ContentMapOption;
  nodes: ContentMapNode[];
  onFocusNode: (id: string) => void;
}> = ({ option, nodes, onFocusNode }) => {
  const target = option.to ? nodes.find((node) => node.id === option.to) : undefined;
  const clickable = target != null && target.status !== 'todo';
  const content = (
    <Typography type="labelStrong" size="S" color="currentColor">
      {option.label}
    </Typography>
  );

  if (!clickable || !option.to) {
    return (
      <div
        className="rounded-PILL px-XS py-XXXS"
        style={{
          border: `${BorderWidth.S}px solid var(--border-default)`,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--content-tertiary)',
          opacity: 0.6,
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      data-no-pan
      onClick={() => onFocusNode(option.to as string)}
      whileHover={{ backgroundColor: 'var(--bg-tertiary)' }}
      whileTap={{ scale: 0.97 }}
      className="rounded-PILL px-XS py-XXXS text-left"
      style={{
        border: `${BorderWidth.S}px solid var(--border-default)`,
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--content-primary)',
        cursor: 'pointer',
      }}
    >
      {content}
    </motion.button>
  );
};
