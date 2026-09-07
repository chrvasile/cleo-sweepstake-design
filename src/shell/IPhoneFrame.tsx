import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LineIcon } from '../design-system/components';
import { DesignSystemGallery } from '../design-system/gallery/DesignSystemGallery';
import { useTheme } from '../design-system/theme';
import {
  BorderWidth,
  colors,
  fontFamilies,
  fontWeights,
  Radii,
  Spacing,
  typographyLineHeightMap,
  typographySizeMap,
} from '../design-system/tokens';
import { FRAME_PRESETS, useFrame } from './FrameProvider';
import type { FramePreset } from './FrameProvider';
import { useDoubleTap } from './useDoubleTap';
import { useLongPress } from './useLongPress';

const FRAME_PADDING = Spacing.M;
const SCREENSHOT_PIXEL_RATIO = 2;
const SCREENSHOT_BUTTON_SIZE = Spacing.XL;
const TOUCH_DEVICE_QUERY = '(pointer: coarse) and (hover: none)';
const CONTENT_MAP_TOOLTIP_ID = 'content-map-tooltip';
const FIGMA_EXPORT_TOOLTIP_ID = 'figma-export-tooltip';
const SCREENSHOT_TOOLTIP_ID = 'screenshot-tooltip';
const THEME_TOGGLE_TOOLTIP_ID = 'theme-toggle-tooltip';
const CONTENT_MAP_UNAVAILABLE_TOOLTIP =
  'The Content Map will be available once you have at least two screens linked to each other.';
const CONTENT_MAP_TOOLTIP = 'Open content map';
const FIGMA_EXPORT_TOOLTIP = 'Export editable Figma flow';
const SCREENSHOT_TOOLTIP = 'Download screenshot';
const DISABLED_CONTROL_OPACITY = Spacing.S / Spacing.XL;
const TOOLTIP_TEXT_SIZE = typographySizeMap.M.label ?? Spacing.XS;
const TOOLTIP_TEXT_LINE_HEIGHT = typographyLineHeightMap.M.label ?? Spacing.S;
const CONTROL_ORDER = {
  figmaExport: Spacing.ZERO,
  contentMap: Spacing.CHAT_BUBBLES,
  screenshot: Spacing.XXXXS,
  themeToggle: Spacing.XXS,
} as const;

type IPhoneFrameProps = {
  children: React.ReactNode;
  onOpenContentMap?: () => void;
  contentMapAvailable?: boolean;
  onExportFigmaFlow?: () => void;
  isExportingFigmaFlow?: boolean;
  belowFrame?: React.ReactNode;
};

const getScreenshotFileName = () => {
  const routeName = window.location.pathname.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-') || 'home';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `cleo-${routeName}-${timestamp}.png`;
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

const ControlTooltip: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <div
    id={id}
    role="tooltip"
    className="absolute left-1/2 z-50 rounded-TOOLTIP bg-primaryInverse p-XS"
    style={{
      bottom: `calc(100% + ${Spacing.XXS}px)`,
      width: 'max-content',
      maxWidth: Spacing.XXL * 5,
      transform: 'translateX(-50%)',
      border: `${BorderWidth.S}px solid var(--border-selectedInverse)`,
      color: 'var(--content-primaryInverse)',
    }}
  >
    <span
      style={{
        display: 'block',
        fontFamily: fontFamilies.body,
        fontSize: `${TOOLTIP_TEXT_SIZE}px`,
        fontWeight: fontWeights.Medium,
        lineHeight: `${TOOLTIP_TEXT_LINE_HEIGHT}px`,
        textAlign: 'left',
        whiteSpace: 'normal',
      }}
    >
      {children}
    </span>
  </div>
);

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  onOpenContentMap,
  contentMapAvailable = true,
  onExportFigmaFlow,
  isExportingFigmaFlow = false,
  belowFrame,
}) => {
  const frame = useFrame();
  const preset = frame?.preset ?? 'medium';
  const setPreset = frame?.setPreset;
  const spec = FRAME_PRESETS[preset];

  const [scale, setScale] = useState(1);
  const [isCapturing, setIsCapturing] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [presetMenuOpen, setPresetMenuOpen] = useState(false);
  const [contentMapTooltipOpen, setContentMapTooltipOpen] = useState(false);
  const [figmaExportTooltipOpen, setFigmaExportTooltipOpen] = useState(false);
  const [screenshotTooltipOpen, setScreenshotTooltipOpen] = useState(false);
  const [themeToggleTooltipOpen, setThemeToggleTooltipOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(TOUCH_DEVICE_QUERY).matches,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const belowFrameRef = useRef<HTMLDivElement>(null);
  const screenCaptureRef = useRef<HTMLDivElement>(null);
  const handleIslandTap = useDoubleTap(() => setGalleryOpen(true));
  const longPress = useLongPress(() => setPresetMenuOpen(true));
  const { theme, toggleTheme } = useTheme();
  const bezelColor = theme === 'dark' ? colors.brown[500] : colors.black;
  const islandColor = theme === 'dark' ? colors.brown[700] : colors.black;

  useEffect(() => {
    const mq = window.matchMedia(TOUCH_DEVICE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsTouchDevice(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;
    const compute = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const controlsHeight = controlsRef.current?.getBoundingClientRect().height ?? 0;
      const belowFrameHeight = belowFrameRef.current?.getBoundingClientRect().height ?? 0;
      const belowFrameGap = belowFrameHeight > 0 ? Spacing.S : 0;
      const scaleX = (w - FRAME_PADDING * 2) / spec.width;
      const scaleY =
        (h - FRAME_PADDING * 2 - controlsHeight - belowFrameHeight - belowFrameGap - Spacing.S) / spec.height;
      setScale(Math.min(1, Math.max(0, scaleX), Math.max(0, scaleY)));
    };
    compute();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(compute);
    if (controlsRef.current) observer?.observe(controlsRef.current);
    if (belowFrameRef.current) observer?.observe(belowFrameRef.current);
    window.addEventListener('resize', compute);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, [isTouchDevice, spec.width, spec.height, Boolean(belowFrame)]);

  if (isTouchDevice) {
    return (
      <div className="fixed inset-0" style={{ backgroundColor: 'var(--bg-primary)' }}>
        {children}
      </div>
    );
  }

  const handleChromeClick = () => {
    if (longPress.didFire()) return;
    handleIslandTap();
  };

  const handleScreenshot = async () => {
    const captureTarget = screenCaptureRef.current;
    if (!captureTarget || isCapturing) return;

    setIsCapturing(true);

    try {
      await document.fonts.ready;
      const { toBlob } = await import('html-to-image');
      const width = captureTarget.clientWidth;
      const height = captureTarget.clientHeight;
      const blob = await toBlob(captureTarget, {
        cacheBust: true,
        pixelRatio: SCREENSHOT_PIXEL_RATIO,
        width,
        height,
        canvasWidth: width,
        canvasHeight: height,
        backgroundColor: getComputedStyle(captureTarget).backgroundColor,
      });

      if (blob) downloadBlob(blob, getScreenshotFileName());
    } catch (error) {
      console.error('Unable to capture prototype screenshot', error);
    } finally {
      setIsCapturing(false);
    }
  };

  const canOpenContentMap = Boolean(onOpenContentMap && contentMapAvailable);

  const handleContentMapClick = () => {
    if (!canOpenContentMap) return;
    onOpenContentMap?.();
  };

  const chromeProps = {
    onClick: handleChromeClick,
    onPointerDown: longPress.onPointerDown,
    onPointerUp: longPress.onPointerUp,
    onPointerLeave: longPress.onPointerLeave,
    onPointerCancel: longPress.onPointerCancel,
    'aria-label': 'Double-tap to open the design system gallery; hold to change size',
  } as const;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex flex-col items-center justify-center gap-S overflow-hidden"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      <div ref={controlsRef} className="flex justify-center gap-XXS">
        {onOpenContentMap && (
          <div className="relative inline-flex" style={{ order: CONTROL_ORDER.contentMap }}>
            <motion.button
              type="button"
              onClick={handleContentMapClick}
              onMouseEnter={() => setContentMapTooltipOpen(true)}
              onMouseLeave={() => setContentMapTooltipOpen(false)}
              onFocus={() => setContentMapTooltipOpen(true)}
              onBlur={() => setContentMapTooltipOpen(false)}
              aria-label={canOpenContentMap ? 'Open content map' : 'Content map unavailable'}
              aria-disabled={!canOpenContentMap}
              aria-describedby={contentMapTooltipOpen ? CONTENT_MAP_TOOLTIP_ID : undefined}
              whileHover={canOpenContentMap ? { backgroundColor: 'var(--bg-tertiary)', scale: 1.04 } : undefined}
              whileTap={canOpenContentMap ? { scale: 0.92 } : undefined}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="inline-flex items-center justify-center"
              style={{
                width: SCREENSHOT_BUTTON_SIZE,
                height: SCREENSHOT_BUTTON_SIZE,
                borderRadius: Radii.ICON,
                backgroundColor: 'var(--bg-accentLight)',
                color: 'var(--content-primary)',
                border: 'none',
                cursor: canOpenContentMap ? 'pointer' : 'not-allowed',
                opacity: canOpenContentMap ? 1 : DISABLED_CONTROL_OPACITY,
              }}
            >
              <LineIcon name="share" size="S" color="currentColor" />
            </motion.button>
            {contentMapTooltipOpen && (
              <ControlTooltip id={CONTENT_MAP_TOOLTIP_ID}>
                {canOpenContentMap ? CONTENT_MAP_TOOLTIP : CONTENT_MAP_UNAVAILABLE_TOOLTIP}
              </ControlTooltip>
            )}
          </div>
        )}
        {onExportFigmaFlow && (
          <div className="relative inline-flex" style={{ order: CONTROL_ORDER.figmaExport }}>
            <motion.button
              type="button"
              onClick={onExportFigmaFlow}
              onMouseEnter={() => setFigmaExportTooltipOpen(!isExportingFigmaFlow)}
              onMouseLeave={() => setFigmaExportTooltipOpen(false)}
              onFocus={() => setFigmaExportTooltipOpen(!isExportingFigmaFlow)}
              onBlur={() => setFigmaExportTooltipOpen(false)}
              disabled={isExportingFigmaFlow}
              whileHover={isExportingFigmaFlow ? undefined : { backgroundColor: 'var(--bg-tertiary)', scale: 1.04 }}
              whileTap={isExportingFigmaFlow ? undefined : { scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              aria-label="Export editable Figma flow"
              aria-describedby={figmaExportTooltipOpen ? FIGMA_EXPORT_TOOLTIP_ID : undefined}
              className="inline-flex items-center justify-center"
              style={{
                width: SCREENSHOT_BUTTON_SIZE,
                height: SCREENSHOT_BUTTON_SIZE,
                borderRadius: Radii.ICON,
                backgroundColor: 'var(--bg-accentLight)',
                color: 'var(--content-primary)',
                border: 'none',
                cursor: isExportingFigmaFlow ? 'not-allowed' : 'pointer',
                opacity: isExportingFigmaFlow ? DISABLED_CONTROL_OPACITY : 1,
              }}
            >
              <LineIcon name="download" size="S" color="currentColor" />
            </motion.button>
            {figmaExportTooltipOpen && (
              <ControlTooltip id={FIGMA_EXPORT_TOOLTIP_ID}>{FIGMA_EXPORT_TOOLTIP}</ControlTooltip>
            )}
          </div>
        )}
        <div className="relative inline-flex" style={{ order: CONTROL_ORDER.screenshot }}>
          <motion.button
            type="button"
            onClick={handleScreenshot}
            onMouseEnter={() => setScreenshotTooltipOpen(!isCapturing)}
            onMouseLeave={() => setScreenshotTooltipOpen(false)}
            onFocus={() => setScreenshotTooltipOpen(!isCapturing)}
            onBlur={() => setScreenshotTooltipOpen(false)}
            disabled={isCapturing}
            whileHover={isCapturing ? undefined : { backgroundColor: 'var(--bg-tertiary)', scale: 1.04 }}
            whileTap={isCapturing ? undefined : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label="Take screenshot"
            aria-describedby={screenshotTooltipOpen ? SCREENSHOT_TOOLTIP_ID : undefined}
            className="inline-flex items-center justify-center"
            style={{
              width: SCREENSHOT_BUTTON_SIZE,
              height: SCREENSHOT_BUTTON_SIZE,
              borderRadius: Radii.ICON,
              backgroundColor: 'var(--bg-accentLight)',
              color: 'var(--content-primary)',
              border: 'none',
              cursor: isCapturing ? 'not-allowed' : 'pointer',
              opacity: isCapturing ? 0.4 : 1,
            }}
          >
            <LineIcon name="screenshot" size="S" color="currentColor" />
          </motion.button>
          {screenshotTooltipOpen && (
            <ControlTooltip id={SCREENSHOT_TOOLTIP_ID}>{SCREENSHOT_TOOLTIP}</ControlTooltip>
          )}
        </div>
        <div className="relative inline-flex" style={{ order: CONTROL_ORDER.themeToggle }}>
          <motion.button
            type="button"
            onClick={toggleTheme}
            onMouseEnter={() => setThemeToggleTooltipOpen(true)}
            onMouseLeave={() => setThemeToggleTooltipOpen(false)}
            onFocus={() => setThemeToggleTooltipOpen(true)}
            onBlur={() => setThemeToggleTooltipOpen(false)}
            whileHover={{ backgroundColor: 'var(--bg-tertiary)', scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-describedby={themeToggleTooltipOpen ? THEME_TOGGLE_TOOLTIP_ID : undefined}
            className="inline-flex items-center justify-center"
            style={{
              width: SCREENSHOT_BUTTON_SIZE,
              height: SCREENSHOT_BUTTON_SIZE,
              borderRadius: Radii.ICON,
              backgroundColor: 'var(--bg-accentLight)',
              color: 'var(--content-primary)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="inline-flex items-center justify-center"
              >
                <LineIcon name={theme === 'dark' ? 'sun' : 'moon'} size="S" color="currentColor" />
              </motion.span>
            </AnimatePresence>
          </motion.button>
          {themeToggleTooltipOpen && (
            <ControlTooltip id={THEME_TOGGLE_TOOLTIP_ID}>
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </ControlTooltip>
          )}
        </div>
      </div>

      <div
        style={{
          width: spec.width * scale,
          height: spec.height * scale,
          transition: 'width 0.25s ease, height 0.25s ease',
        }}
      >
        <div
          style={{
            width: spec.width,
            height: spec.height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            borderRadius: 56,
            padding: 10,
            backgroundColor: bezelColor,
            boxShadow: '0 40px 80px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.06)',
            transition: 'width 0.25s ease, height 0.25s ease',
          }}
        >
          <div className="relative h-full w-full overflow-hidden bg-primary" style={{ borderRadius: 48 }}>
            <div
              ref={screenCaptureRef}
              data-screenshot-target="prototype-screen"
              className="absolute inset-0 overflow-hidden bg-primary"
            >
              {children}
            </div>

            {spec.chrome === 'island' && (
              <button
                type="button"
                {...chromeProps}
                className="absolute left-1/2 z-50 -translate-x-1/2 cursor-default"
                style={{
                  top: 11,
                  width: 126,
                  height: 37,
                  borderRadius: 999,
                  backgroundColor: islandColor,
                  border: 'none',
                  padding: 0,
                }}
              />
            )}
            {spec.chrome === 'notch' && (
              <button
                type="button"
                {...chromeProps}
                className="absolute left-1/2 z-50 -translate-x-1/2 cursor-default"
                style={{
                  top: 0,
                  width: 209,
                  height: 30,
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  backgroundColor: islandColor,
                  border: 'none',
                  padding: 0,
                }}
              />
            )}
            {spec.chrome === 'punch-hole' && (
              <button
                type="button"
                {...chromeProps}
                className="absolute left-1/2 z-50 -translate-x-1/2 cursor-default"
                style={{
                  top: 14,
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: islandColor,
                  border: 'none',
                  padding: 0,
                }}
              />
            )}

            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2"
              style={{
                bottom: 8,
                width: spec.platform === 'Android' ? 108 : 134,
                height: spec.platform === 'Android' ? 4 : 5,
                borderRadius: 999,
                backgroundColor: 'var(--content-primary)',
                opacity: 0.9,
              }}
            />

            <AnimatePresence>
              {presetMenuOpen && setPreset && (
                <>
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setPresetMenuOpen(false)}
                    className="absolute inset-0 z-40"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
                  />
                  <motion.div
                    key="menu"
                    initial={{ opacity: 0, x: '-50%', y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
                    exit={{ opacity: 0, x: '-50%', y: -8, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute left-1/2 z-50 overflow-hidden"
                    style={{
                      top: spec.chrome === 'island' ? 56 : 40,
                      minWidth: 280,
                      borderRadius: 16,
                      backgroundColor: 'var(--bg-primary)',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border-default)',
                    }}
                  >
                    {(['iOS', 'Android'] as const).map((platform) => {
                      const keys = (Object.keys(FRAME_PRESETS) as FramePreset[]).filter(
                        (k) => FRAME_PRESETS[k].platform === platform,
                      );
                      return (
                        <div key={platform} style={{ marginTop: platform === 'Android' ? 12 : 0 }}>
                          <div
                            style={{
                              padding: '12px 20px 8px',
                              fontFamily: 'var(--font-body, inherit)',
                              fontSize: 11,
                              fontWeight: 600,
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              color: 'var(--content-tertiary)',
                            }}
                          >
                            {platform}
                          </div>
                          {keys.map((key) => {
                            const p = FRAME_PRESETS[key];
                            const selected = key === preset;
                            const chromeLabel =
                              p.chrome === 'island'
                                ? 'Dynamic Island'
                                : p.chrome === 'notch'
                                  ? 'Notch'
                                  : 'Punch-hole';
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  setPreset(key);
                                  setPresetMenuOpen(false);
                                }}
                                className="flex w-full items-center justify-between"
                                style={{
                                  gap: 24,
                                  padding: '10px 20px',
                                  border: 'none',
                                  backgroundColor: selected ? 'var(--bg-secondary)' : 'transparent',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-body, inherit)',
                                      fontSize: 15,
                                      fontWeight: 600,
                                      color: 'var(--content-primary)',
                                    }}
                                  >
                                    {p.label}
                                  </span>
                                  <span
                                    style={{
                                      fontFamily: 'var(--font-body, inherit)',
                                      fontSize: 13,
                                      color: 'var(--content-secondary)',
                                    }}
                                  >
                                    {p.width} × {p.height} · {chromeLabel}
                                  </span>
                                </div>
                                {selected && (
                                  <span style={{ color: 'var(--content-accentMid)', fontSize: 16 }}>✓</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <DesignSystemGallery isOpen={galleryOpen} onClose={() => setGalleryOpen(false)} />
          </div>
        </div>
      </div>

      {belowFrame && (
        <div ref={belowFrameRef} className="flex justify-center">
          {belowFrame}
        </div>
      )}
    </div>
  );
};
