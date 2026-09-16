import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useTransform, useAnimationFrame, animate } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import {
  Button,
  IconButton,
  Typography,
  VStack,
  HStack,
  Divider,
  Carousel,
  Image,
  LineIcon,
  Tag,
} from '../../../design-system/components';
import type { LineIconName } from '../../../design-system/components';
import {
  colors,
  colorRoles,
  Radii,
  Spacing,
  MotionTransitions,
  framerFromDef,
  MotionDuration,
  msToSeconds,
} from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import { AnimatedClockIcon } from '../../components/AnimatedClockIcon';
import fdicLogo from '../../assets/fdic-logo.png';
import sweepstakesHourglass from '../../assets/sweepstakes-draw-hourglass.png';
import sweepstakesDidntWin from '../../assets/sweepstakes-didnt-win.png';
import sweepstakesWon from '../../assets/sweepstakes-won.png';
import infoIcon from '../../assets/info-icon.svg';
import activityIconInvesting from '../../assets/activity-icon-investing.svg';
import activityIconAdded from '../../assets/activity-icon-added.svg';
import activityIconWithdrawn from '../../assets/activity-icon-withdrawn.svg';
import saveHackPaydaySaver from '../../assets/save-hack-payday-saver.png';
import saveHackSetAndForget from '../../assets/save-hack-set-and-forget.png';
import saveHackRoundups from '../../assets/save-hack-roundups.png';
import saveHackSwearJar from '../../assets/save-hack-swear-jar.png';
import saveHackSmartSave from '../../assets/save-hack-smart-save.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'savings-sep16-two-step',
  routePath: '/savings',
  label: 'Savings',
  context: 'Savings home',
  status: 'done',
  heading: 'Savings — two-step entry',
  subhead: "Widget tile. Tapping Enter draw opens a bottom sheet. The tile only updates once the sheet is dismissed.",
  order: 1,
  options: [
    { code: 'ENTER_EXTRA_TOKENS', label: 'Get extra tokens', to: 'sep16-two-step-deposit' },
  ],
};

// ─── Small building blocks ────────────────────────────────────────────────────

const NUMBER_FONT_FAMILY = "'PPNeueMontreal', system-ui, -apple-system, sans-serif";

const NumberPart: React.FC<{ text: string; size: 'L' | 'M' | 'S' | 'XS'; color: string }> = ({
  text,
  size,
  color,
}) => (
  <Typography type="displayNumbers" size={size} weight="Medium" color={color} style={{ fontFamily: NUMBER_FONT_FAMILY }}>
    {text}
  </Typography>
);

const InfoGlyph: React.FC = () => <img src={infoIcon} alt="" width={16} height={16} />;

type NumberFragment = { text: string; size: 'S' | 'XS' };

const StatTile: React.FC<{ icon: LineIconName; parts: NumberFragment[]; label: string }> = ({
  icon,
  parts,
  label,
}) => (
  <div
    className="relative flex-1 rounded-CARD border border-default bg-white p-XS"
    style={{ height: 136, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
  >
    <div
      className="flex items-center justify-center rounded-ICON"
      style={{ width: 40, height: 40, backgroundColor: colorRoles.background.positiveLight }}
    >
      <LineIcon name={icon} size="M" color={colorRoles.content.accentDark} />
    </div>
    <div style={{ position: 'absolute', top: Spacing.XS, right: Spacing.XS }}>
      <InfoGlyph />
    </div>
    <VStack gap="XXXXS" align="start">
      <HStack gap="ZERO" align="baseline">
        {parts.map((part, i) => (
          <NumberPart key={i} text={part.text} size={part.size} color={colorRoles.content.primary} />
        ))}
      </HStack>
      <Typography type="body" size="S" color={colorRoles.content.accentMid}>
        {label}
      </Typography>
    </VStack>
  </div>
);

// ─── Save Hacks ───────────────────────────────────────────────────────────────

type SaveHack = { title: string; body: string; image: string };

const SAVE_HACKS: SaveHack[] = [
  { title: 'Payday Saver', body: 'Save a percentage of every paycheck', image: saveHackPaydaySaver },
  { title: 'Set and Forget', body: 'Save a fixed amount weekly', image: saveHackSetAndForget },
  { title: 'Roundups', body: 'Round up every purchase to the next dollar', image: saveHackRoundups },
  { title: 'Swear Jar', body: 'Save every time you shop at a set store', image: saveHackSwearJar },
  { title: 'Smart Save', body: 'Safely set aside based on your spending', image: saveHackSmartSave },
];

const SaveHackCard: React.FC<{ hack: SaveHack }> = ({ hack }) => (
  <VStack gap="XS" align="stretch" justify="between" className="h-full rounded-INPUT border border-default bg-white p-S">
    <Image source={hack.image} alt="" height={158} resizeMode="cover" borderRadius={8} />
    <VStack gap="XXXS" align="start" className="w-full flex-1">
      <Typography type="titleStrong" size="L" weight="SemiBold" color={colorRoles.content.primary}>
        {hack.title}
      </Typography>
      <Typography type="body" size="M" color={colorRoles.content.secondary}>
        {hack.body}
      </Typography>
    </VStack>
    <Button label="Set up" variant="secondary" size="S" className="self-start" />
  </VStack>
);

// ─── Activity ─────────────────────────────────────────────────────────────────

type Activity = {
  title: string;
  subtitle: string;
  sign: string;
  main: string;
  cents: string;
  amountColor: string;
  icon: string;
};

const ACTIVITY: Activity[] = [
  {
    title: 'Investing your money',
    subtitle: 'Pending • Today, 3:31pm',
    sign: ' $',
    main: '40',
    cents: '.00',
    amountColor: colorRoles.content.accentMid,
    icon: activityIconInvesting,
  },
  {
    title: 'Money added',
    subtitle: 'Completed • Jun 3, 4:12pm',
    sign: '+$',
    main: '40',
    cents: '.00',
    amountColor: colorRoles.content.positiveMid,
    icon: activityIconAdded,
  },
  {
    title: 'Money withdrawn',
    subtitle: 'Completed • Jun 3, 11:19am',
    sign: '-$',
    main: '100',
    cents: '.00',
    amountColor: colorRoles.content.negativeMid,
    icon: activityIconWithdrawn,
  },
];

const ActivityAmount: React.FC<{ sign: string; main: string; cents: string; color: string }> = ({
  sign,
  main,
  cents,
  color,
}) => (
  <HStack gap="ZERO" align="baseline">
    <NumberPart text={sign} size="XS" color={color} />
    <NumberPart text={main} size="S" color={color} />
    <NumberPart text={cents} size="XS" color={color} />
  </HStack>
);

// ─── Decorative background curve ─────────────────────────────────────────────

const BackgroundCurve: React.FC = () => (
  <svg
    className="pointer-events-none absolute left-0 top-0 block"
    width="100%"
    height="100%"
    viewBox="0 0 396.5 260.338"
    preserveAspectRatio="none"
    fill="none"
  >
    <defs>
      <linearGradient id="savings-curve-gradient-sep16" x1="170.012" x2="191.704" y1="-43.0525" y2="264.78" gradientUnits="userSpaceOnUse">
        <stop stopColor={colorRoles.content.tertiary} />
        <stop offset="1" stopColor={colorRoles.content.tertiary} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M3 260.338H5.69153H396V1.50033L391 16.5003C391 16.5003 366.244 109.326 320.5 142C303 154.5 268 150 268 150H203.5C162.666 145.625 137.074 156.455 100 176C71.6252 190.959 73 182.5 30.5 215.5C30.5 215.5 20.2874 223.936 15 229.5C8.8274 235.996 0 245 0 245L3 260.338Z"
      fill="url(#savings-curve-gradient-sep16)"
    />
    <path
      d="M2.50002 243.5C2.50002 243.5 18.0198 222.138 33.5851 212.062C156.5 132.5 192.39 150.353 289 151C360.343 151.478 395 1.50033 395 1.50033"
      stroke={colorRoles.content.secondary}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Period selector ──────────────────────────────────────────────────────────

const PeriodChip: React.FC<{ label: string; isSelected: boolean; onPress: () => void }> = ({
  label,
  isSelected,
  onPress,
}) => (
  <motion.button
    type="button"
    onClick={onPress}
    whileTap={{ scale: 0.97 }}
    className="flex items-center justify-center rounded-BUTTON px-M"
    style={{
      height: 28,
      width: 82,
      backgroundColor: isSelected ? colorRoles.background.accentDark : 'transparent',
      border: isSelected ? 'none' : `1px solid ${colorRoles.border.opaqueLight}`,
    }}
  >
    <Typography type="buttonLabel" size="S" color={isSelected ? colorRoles.content.onColor : colorRoles.content.primary}>
      {label}
    </Typography>
  </motion.button>
);

// ─── Draw countdown timer (matches the visual variant's frosted-pill overlay) ──

// ─── Hold-to-enter button ─────────────────────────────────────────────────────
// User holds for holdDurationMs to confirm entry. A fill sweeps left-to-right
// during the hold; releasing early retreats it. On completion the button
// briefly shows "You're in!" before the bottom sheet opens.

const HoldToEnterButton: React.FC<{ holdDurationMs: number; progress: MotionValue<number>; onReady: () => void; onComplete: () => void; onHoldChange: (isHolding: boolean) => void }> = ({ holdDurationMs, progress, onReady, onComplete, onHoldChange }) => {
  const fillWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const [phase, setPhase] = useState<'idle' | 'holding' | 'complete'>('idle');
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = (timestamp: number) => {
    if (startTimeRef.current === null) return;
    const p = Math.min((timestamp - startTimeRef.current) / holdDurationMs, 1);
    progress.set(p);
    if (p < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      completedRef.current = true;
      stopRaf();
      setPhase('complete');
      onReady(); // card reacts immediately
      setTimeout(() => onComplete(), MotionDuration.slow2 + MotionDuration.steady1);
    }
  };

  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (completedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPhase('holding');
    onHoldChange(true);
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (completedRef.current) return;
    stopRaf();
    setPhase('idle');
    onHoldChange(false);
    startTimeRef.current = null;
    animate(progress, 0, { duration: 0.25, ease: 'easeIn' });
  };

  const isHolding = phase === 'holding';
  const isComplete = phase === 'complete';

  return (
    <motion.button
      type="button"
      onPointerDown={startHold}
      onPointerUp={endHold}
      onPointerLeave={endHold}
      onPointerCancel={endHold}
      className="relative overflow-hidden w-full rounded-BUTTON"
      style={{
        height: 40,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
        border: 'none',
        cursor: isComplete ? 'default' : 'pointer',
        backgroundColor: isComplete ? colorRoles.background.positiveDark : colorRoles.background.accentMid,
        transition: 'background-color 0.2s ease',
      }}
    >
      {/* #1B0C0B (accentDark) fill sweeping left to right during hold */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: fillWidth,
          backgroundColor: colorRoles.background.accentDark,
          opacity: isComplete ? 0 : 1,
        }}
      />
      {/* Label */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography type="buttonLabel" size="M" color={colorRoles.content.onColor}>
          {isComplete ? "You're in!" : isHolding ? 'Keep holding…' : 'Hold to enter'}
        </Typography>
      </div>
    </motion.button>
  );
};

// ─── "You're in!" full-screen overlay ────────────────────────────────────────

const YoureInOverlay: React.FC<{
  isOpen: boolean;
  onGetMoreTokens: () => void;
  onDismiss: () => void;
}> = ({ isOpen, onGetMoreTokens, onDismiss }) => {
  const insets = useSafeArea();
  const reducedMotion = !!useReducedMotion();

  // Stagger delays for content after the overlay fades in
  const d0 = msToSeconds(MotionDuration.steady1);
  const d1 = msToSeconds(MotionDuration.steady1 + MotionDuration.swift2);
  const d2 = msToSeconds(MotionDuration.steady2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
          style={{ borderRadius: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Radial gradient backdrop — warm amber centre fading to dark brown, 90% opacity + 2px blur */}
          <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}>
            <svg
              viewBox="0 0 391 846"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <radialGradient
                  id="youre-in-overlay-grad"
                  gradientUnits="userSpaceOnUse"
                  cx="0"
                  cy="0"
                  r="10"
                  gradientTransform="matrix(0.05 42.3 -50.667 0.059889 195.5 423)"
                >
                  <stop stopColor={colors.brown[700]} offset="0" />
                  <stop stopColor={colors.brown[800]} offset="0.5" />
                  <stop stopColor={colors.brown[900]} offset="1" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#youre-in-overlay-grad)" opacity="0.9" />
            </svg>
          </div>

          {/* Content sits on top of the blur layer */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Close button — top-right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: insets.top + Spacing.XS, paddingRight: Spacing.M }}>
              <motion.button
                type="button"
                onClick={onDismiss}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label="Close"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: Radii.ICON,
                  backgroundColor: colorRoles.background.primary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LineIcon name="cross" size="S" color={colorRoles.content.primary} />
              </motion.button>
            </div>

            {/* Vertically centred content block */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: Spacing.M,
              paddingRight: Spacing.M,
              paddingBottom: insets.bottom,
            }}>

              {/* Hourglass — slightly rotated to match Figma; tag overlaps the bottom edge */}
              <motion.div
                style={{ position: 'relative' }}
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: d0 }}
              >
                <img
                  src={sweepstakesHourglass}
                  alt=""
                  style={{
                    width: 210,
                    height: 210,
                    objectFit: 'contain',
                    display: 'block',
                    transform: 'rotate(-11.34deg)',
                  }}
                />
                {/* Tag sits inside the image, overlapping the hourglass foot */}
                <div style={{ position: 'absolute', bottom: Spacing.S, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                  <Tag variant="success" size="S">
                    <AnimatedClockIcon size={12} color={colorRoles.content.positiveDark} />
                    <p style={{ margin: 0, fontSize: 11, lineHeight: '14px' }}>
                      <Typography as="span" type="labelStrong" size="S" weight="Medium" color={colorRoles.content.positiveDark}>
                        Countdown to the draw:{' '}
                      </Typography>
                      <Typography as="span" type="labelStrong" size="S" weight="Bold" color={colorRoles.content.positiveDark}>
                        2d 2hrs
                      </Typography>
                    </p>
                  </Tag>
                </div>
              </motion.div>

              {/* Headline + body — 32px below the hourglass image */}
              <motion.div
                style={{ width: '100%', marginTop: Spacing.M, textAlign: 'center' }}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d1 }}
              >
                <VStack gap="XXS" align="center">
                  <Typography type="headline" size="L" color={colorRoles.content.onColor} align="center">
                    You're in with 177 tokens!
                  </Typography>
                  <Typography type="body" size="L" color={colorRoles.content.onColor} align="center">
                    Add to your savings for extra tokens, giving you more chances to win.
                  </Typography>
                </VStack>
              </motion.div>

              {/* Buttons */}
              <motion.div
                style={{ width: '100%', marginTop: Spacing.M }}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d2 }}
              >
                <VStack gap="XXS" align="stretch">
                  <Button label="Get more chances to win" variant="primary" palette="dark" size="L" fullWidth onPress={onGetMoreTokens} />
                  <Button label="Not now" variant="secondary" palette="dark" size="L" fullWidth onPress={onDismiss} />
                </VStack>
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── "You won!" full-screen overlay ──────────────────────────────────────────

const YouWonOverlay: React.FC<{
  isOpen: boolean;
  onDismiss: () => void;
}> = ({ isOpen, onDismiss }) => {
  const insets = useSafeArea();
  const reducedMotion = !!useReducedMotion();

  const d0 = msToSeconds(MotionDuration.steady1);
  const d1 = msToSeconds(MotionDuration.steady1 + MotionDuration.swift2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
          style={{ borderRadius: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Radial gradient backdrop */}
          <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}>
            <svg
              viewBox="0 0 391 846"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <radialGradient
                  id="you-won-overlay-grad"
                  gradientUnits="userSpaceOnUse"
                  cx="0"
                  cy="0"
                  r="10"
                  gradientTransform="matrix(0.05 42.3 -50.667 0.059889 195.5 423)"
                >
                  <stop stopColor={colors.brown[700]} offset="0" />
                  <stop stopColor={colors.brown[800]} offset="0.5" />
                  <stop stopColor={colors.brown[900]} offset="1" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#you-won-overlay-grad)" opacity="0.9" />
            </svg>
          </div>

          {/* Content — full-height centred flex; close button absolutely positioned */}
          <div style={{
            position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingLeft: Spacing.M, paddingRight: Spacing.M,
          }}>

            {/* Close button */}
            <div style={{ position: 'absolute', top: insets.top + Spacing.XS, right: Spacing.M }}>
              <motion.button
                type="button"
                onClick={onDismiss}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: Radii.ICON,
                  backgroundColor: colorRoles.background.primary,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <LineIcon name="cross" size="S" color={colorRoles.content.primary} />
              </motion.button>
            </div>

            {/* Illustration */}
            <motion.div
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: d0 }}
            >
              <img
                src={sweepstakesWon}
                alt=""
                style={{ width: 220, height: 220, objectFit: 'contain', display: 'block' }}
              />
            </motion.div>

            {/* Headline + body */}
            <motion.div
              style={{ width: '100%', marginTop: Spacing.M, textAlign: 'center' }}
              initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d1 }}
            >
              <VStack gap="XXS" align="center">
                <Typography type="headline" size="L" color={colorRoles.content.onColor} align="center">
                  You're the grand winner!
                </Typography>
                <Typography type="body" size="L" color={colorRoles.content.onColor} align="center">
                  Check your inbox in the next 48 hours. We'll email you with instructions for how to redeem your prize.
                </Typography>
              </VStack>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── "You didn't win" full-screen overlay ────────────────────────────────────

const YouDidntWinOverlay: React.FC<{
  isOpen: boolean;
  onEnterNextDraw: () => void;
  onGetMoreTokens: () => void;
  onDismiss: () => void;
}> = ({ isOpen, onEnterNextDraw, onGetMoreTokens, onDismiss }) => {
  const insets = useSafeArea();
  const reducedMotion = !!useReducedMotion();

  const d0 = msToSeconds(MotionDuration.steady1);
  const d1 = msToSeconds(MotionDuration.steady1 + MotionDuration.swift2);
  const d2 = msToSeconds(MotionDuration.steady2);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
          style={{ borderRadius: 0 }}
          role="dialog"
          aria-modal="true"
        >
          {/* Radial gradient backdrop */}
          <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}>
            <svg
              viewBox="0 0 391 846"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            >
              <defs>
                <radialGradient
                  id="didnt-win-overlay-grad"
                  gradientUnits="userSpaceOnUse"
                  cx="0"
                  cy="0"
                  r="10"
                  gradientTransform="matrix(0.05 42.3 -50.667 0.059889 195.5 423)"
                >
                  <stop stopColor={colors.brown[700]} offset="0" />
                  <stop stopColor={colors.brown[800]} offset="0.5" />
                  <stop stopColor={colors.brown[900]} offset="1" />
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#didnt-win-overlay-grad)" opacity="0.9" />
            </svg>
          </div>

          {/* Content — full-height centred flex; close button and footer are absolute so they don't skew centering */}
          <div style={{
            position: 'relative', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingLeft: Spacing.M, paddingRight: Spacing.M,
          }}>

            {/* Close button — absolutely positioned, doesn't affect flex centering */}
            <div style={{ position: 'absolute', top: insets.top + Spacing.XS, right: Spacing.M }}>
              <motion.button
                type="button"
                onClick={onDismiss}
                whileTap={{ scale: 0.93 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                aria-label="Close"
                style={{
                  width: 32, height: 32, borderRadius: Radii.ICON,
                  backgroundColor: colorRoles.background.primary,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <LineIcon name="cross" size="S" color={colorRoles.content.primary} />
              </motion.button>
            </div>

              {/* Illustration */}
              <motion.div
                initial={reducedMotion ? {} : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: d0 }}
              >
                <img
                  src={sweepstakesDidntWin}
                  alt=""
                  style={{ width: 220, height: 220, objectFit: 'contain', display: 'block' }}
                />
              </motion.div>

              {/* Headline + body */}
              <motion.div
                style={{ width: '100%', marginTop: Spacing.M, textAlign: 'center' }}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d1 }}
              >
                <VStack gap="XXS" align="center">
                  <Typography type="headline" size="L" color={colorRoles.content.onColor} align="center">
                    You didn't win this time
                  </Typography>
                  <Typography type="body" size="L" color={colorRoles.content.onColor} align="center">
                    {"But there's still a chance. This week's $3,000 draw is live, and you can enter "}
                    <Typography as="span" type="body" size="L" weight="Bold" color={colorRoles.content.onColor}>
                      177 tokens
                    </Typography>
                    .
                  </Typography>
                </VStack>
              </motion.div>

              {/* Buttons */}
              <motion.div
                style={{ width: '100%', marginTop: Spacing.M }}
                initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d2 }}
              >
                <VStack gap="XXS" align="stretch">
                  <Button label="Enter next draw" variant="primary" palette="dark" size="L" fullWidth onPress={onEnterNextDraw} />
                  <Button label="Get more chances to win" variant="secondary" palette="dark" size="L" fullWidth onPress={onGetMoreTokens} />
                </VStack>
              </motion.div>

            {/* Info footer — absolutely pinned 32px from bottom of screen */}
            <motion.div
              style={{
                position: 'absolute',
                bottom: Spacing.L,
                left: Spacing.M,
                right: Spacing.M,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: Spacing.XXS,
              }}
              initial={reducedMotion ? {} : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: d2 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke={colorRoles.content.onColorDark} strokeWidth="1.2" />
                <circle cx="8" cy="5.5" r="1" fill={colorRoles.content.onColorDark} />
                <line x1="8" y1="8" x2="8" y2="11.5" stroke={colorRoles.content.onColorDark} strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <Typography type="body" size="S" color={colorRoles.content.onColorDark} align="center">
                Add more money to your savings for more tokens, giving you more chances to win
              </Typography>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Screen ────────────────────────────────────────────────────────────────────

const PERIODS = ['1 W', '1 M', '6 M', '1 Y'] as const;

export const SavingsScreen: React.FC = () => {
  const insets = useSafeArea();
  const navigate = useNavigate();
  const location = useLocation();

  const [depositResult] = useState(() => {
    const state = location.state as { depositedAmount?: number } | null;
    return state?.depositedAmount != null ? state : null;
  });
  const [entered, setEntered] = useState(depositResult != null);
  const holdProgress = useMotionValue(0);
  const isHoldingRef = useRef(false);
  // Rotation driven imperatively: sine shake during hold (amplitude scales with progress²),
  // then snaps into the dampened wiggle on complete.
  const hourglassRotate = useMotionValue(-11.34);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('1 Y');

  const holdDuration = 1400;
  const [sheetOpen, setSheetOpen] = useState(false);
  const [didntWinOpen, setDidntWinOpen] = useState(false);
  const [wonOpen, setWonOpen] = useState(false);

  // Shake params — ref so useAnimationFrame always reads the latest value.
  const shakeParams = useRef({
    amplitude: 1.9,      // peak shake angle (°) at full hold
    startFreqHz: 2.2,    // oscillation speed at hold start
    maxFreqHz: 6.9,      // oscillation speed at hold end
    rampExp: 1.7,        // exponent for intensity curve (1=linear, 2=quadratic, 3=cubic)
    wiggleAmplitude: 5,  // swing angle (°) of the completion wiggle
    wiggleDuration: 500, // duration (ms) of the completion wiggle
  });

  // Shake: anchored in place, amplitude and frequency ramp with progress^rampExp.
  useAnimationFrame((time) => {
    if (!isHoldingRef.current) return;
    const p = holdProgress.get();
    const { amplitude, startFreqHz, maxFreqHz, rampExp } = shakeParams.current;
    const fStart = startFreqHz * 2 * Math.PI / 1000;
    const fRange = (maxFreqHz - startFreqHz) * 2 * Math.PI / 1000;
    hourglassRotate.set(-11.34 + Math.sin(time * (fStart + fRange * p)) * amplitude * Math.pow(p, rampExp));
  });

  // Notify when hold starts or stops early (pointer lifted before complete).
  const handleHoldChange = (holding: boolean) => {
    isHoldingRef.current = holding;
    if (!holding) {
      // Released early — spring back to resting angle.
      animate(hourglassRotate, -11.34, { duration: 0.3, ease: 'easeOut' });
    }
  };

  // Clear navigation state on return from deposit so a refresh doesn't re-trigger entered state.
  useEffect(() => {
    if (depositResult == null) return;
    navigate(location.pathname, { replace: true, state: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Overlay trigger from viewport buttons (e.g. "Won" / "Didn't win" buttons beside the phone).
  useEffect(() => {
    const state = location.state as { triggerOverlay?: string } | null;
    if (state?.triggerOverlay === 'didnt-win') {
      setDidntWinOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    } else if (state?.triggerOverlay === 'won') {
      setWonOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // Fires immediately when hold hits 100% — tension releases into dampened wiggle.
  const handleHoldReady = () => {
    isHoldingRef.current = false;
    setEntered(true);
    const { wiggleAmplitude, wiggleDuration } = shakeParams.current;
    animate(
      hourglassRotate,
      [-11.34, -11.34 - wiggleAmplitude, -11.34 + wiggleAmplitude, -11.34 - wiggleAmplitude * 0.75, -11.34 + wiggleAmplitude * 0.75, -11.34],
      { duration: msToSeconds(wiggleDuration), ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
  };

  // Fires after the button's 480ms success beat — opens the sheet.
  const handleEnterDraw = () => {
    setSheetOpen(true);
  };

  const handleDismissSheet = () => {
    setSheetOpen(false);
  };

  // "Get more tokens" — go to deposit.
  const handleGetMoreTokens = () => {
    setSheetOpen(false);
    navigate('/deposit', { state: { extraTokens: 0 } });
  };

  const handleDidntWinGetMoreTokens = () => {
    setDidntWinOpen(false);
    navigate('/deposit', { state: { extraTokens: 0 } });
  };

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div className="h-full overflow-y-auto" style={{ backgroundColor: colorRoles.background.primary }}>
        {/* Top app bar */}
        <HStack
          justify="between"
          align="center"
          className="w-full"
          style={{ paddingTop: insets.top + Spacing.XXS, paddingLeft: Spacing.S, paddingRight: Spacing.S }}
        >
          <IconButton icon="chevron-left" variant="primary" label="Back" onPress={() => navigate('/')} />
          <Typography type="headline" size="S" color={colorRoles.content.primary}>
            Savings
          </Typography>
          <div style={{ width: 32 }} />
        </HStack>

        {/* Balance */}
        <VStack gap="XXXS" align="center" className="w-full" style={{ marginTop: Spacing.M }}>
          <Typography type="bodyStrong" size="M" color={colorRoles.content.tertiary}>
            Today
          </Typography>
          <HStack gap="ZERO" align="baseline">
            <NumberPart text="$" size="M" color={colorRoles.content.tertiary} />
            <NumberPart text="177" size="L" color={colorRoles.content.primary} />
            <NumberPart text=".09" size="M" color={colorRoles.content.tertiary} />
          </HStack>
          <HStack gap="XXXXS" align="center">
            <LineIcon name="increase-arrow" size="XS" color={colorRoles.content.positiveMid} />
            <Typography type="title" size="M" color={colorRoles.content.tertiary}>
              $13.70 (+9.8%) all time
            </Typography>
          </HStack>
        </VStack>

        {/* Decorative curve */}
        <div className="relative w-full" style={{ height: 259, marginTop: 48 }}>
          <BackgroundCurve />
        </div>

        {/* Period selector */}
        <div className="w-full" style={{ marginTop: Spacing.S, paddingLeft: Spacing.S, paddingRight: Spacing.S }}>
          <HStack align="center" justify="between" className="w-full">
            {PERIODS.map((p) => (
              <PeriodChip key={p} label={p} isSelected={period === p} onPress={() => setPeriod(p)} />
            ))}
          </HStack>
        </div>

        <VStack
          gap="M"
          align="stretch"
          style={{
            gap: Spacing.M,
            paddingTop: Spacing.M,
            paddingBottom: insets.bottom + Spacing.M,
            paddingLeft: Spacing.S,
            paddingRight: Spacing.S,
          }}
        >
          {/* APY + Earned tiles */}
          <HStack gap="XXS" align="stretch" className="w-full">
            <StatTile
              icon="percent"
              parts={[
                { text: '2.25', size: 'S' },
                { text: '%', size: 'XS' },
              ]}
              label="APY"
            />
            <StatTile
              icon="dollar-increase"
              parts={[
                { text: '$', size: 'XS' },
                { text: '2', size: 'S' },
                { text: '.83', size: 'XS' },
              ]}
              label="Earned this month"
            />
          </HStack>

          {/* Sweepstakes draw tile — widget variant */}
          <VStack gap="XS" align="start" className="w-full">
            <Typography type="headline" size="S" color={colorRoles.content.primary}>
              Weekly $3,000 draw
            </Typography>

            <div
              className="relative w-full rounded-CARD border border-default bg-white p-S"
              style={{ overflow: 'hidden' }}
            >
              <div
                className="absolute flex items-center justify-center"
                style={{ left: 195, top: -13, width: 237.522, height: 237.522, cursor: 'pointer' }}
                onDoubleClick={() => setDidntWinOpen(true)}
              >
                {/* Rotation driven imperatively via hourglassRotate:
                    hold → sine shake (amplitude ramps with progress²), complete → dampened wiggle. */}
                <motion.div style={{ rotate: hourglassRotate }}
                >
                  <div className="relative" style={{ width: 201.796, height: 201.796 }}>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <img
                        src={sweepstakesHourglass}
                        alt=""
                        className="absolute max-w-none"
                        style={{ left: '-2.41%', top: '-0.01%', width: '100%', height: '100%' }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>

              <VStack gap="S" align="start" style={{ maxWidth: 200, position: 'relative' }}>
                <VStack gap="XXS" align="start" className="w-full">
                  <Tag variant="success" size="S">
                    <AnimatedClockIcon size={12} color={colorRoles.content.positiveDark} />
                    <p style={{ margin: 0, fontSize: 11, lineHeight: '14px' }}>
                      <Typography as="span" type="labelStrong" size="S" weight="Medium" color={colorRoles.content.positiveDark}>
                        Next draw in{' '}
                      </Typography>
                      <Typography as="span" type="labelStrong" size="S" weight="Bold" color={colorRoles.content.positiveDark}>
                        2d 2hrs 14m
                      </Typography>
                    </p>
                  </Tag>
                  {/* Both copies live in the same grid cell, so this block is always
                      sized to the content and never resizes when the state swaps.
                      Only opacity changes; the hidden copy is non-interactive. */}
                  <div style={{ display: 'grid', width: '100%' }}>
                    <motion.p
                      style={{ gridArea: '1 / 1', margin: 0, lineHeight: '18px', pointerEvents: entered ? 'auto' : 'none' }}
                      initial={false}
                      animate={{ opacity: entered ? 1 : 0 }}
                      transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
                    >
                      <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                        You entered{' '}
                      </Typography>
                      <Typography as="span" type="body" size="M" weight="Bold" color={colorRoles.content.tertiary}>
                        177 tokens
                      </Typography>
                      <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                        . Get more by adding to your savings
                      </Typography>
                    </motion.p>
                    <motion.p
                      style={{ gridArea: '1 / 1', margin: 0, lineHeight: '18px', pointerEvents: entered ? 'none' : 'auto' }}
                      initial={false}
                      animate={{ opacity: entered ? 0 : 1 }}
                      transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
                    >
                      <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                        You have{' '}
                      </Typography>
                      <Typography as="span" type="body" size="M" weight="Bold" color={colorRoles.content.tertiary}>
                        177 tokens
                      </Typography>
                      <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                        . Save more for extra chances to win
                      </Typography>
                    </motion.p>
                  </div>
                </VStack>
                {/* Both buttons share one grid cell too — identical footprint,
                    so swapping them can never change the card height. */}
                <div style={{ display: 'grid', width: '100%' }}>
                  <motion.div
                    style={{ gridArea: '1 / 1', display: 'flex', width: '100%', pointerEvents: entered ? 'auto' : 'none' }}
                    initial={false}
                    animate={{ opacity: entered ? 1 : 0 }}
                    transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
                  >
                    <Button label="Get more tokens" variant="secondary" onPress={handleGetMoreTokens} />
                  </motion.div>
                  <motion.div
                    style={{ gridArea: '1 / 1', display: 'flex', width: '100%', pointerEvents: entered ? 'none' : 'auto' }}
                    initial={false}
                    animate={{ opacity: entered ? 0 : 1 }}
                    transition={framerFromDef(MotionTransitions.fadeIn.steady1)}
                  >
                    <HoldToEnterButton holdDurationMs={holdDuration} progress={holdProgress} onReady={handleHoldReady} onComplete={handleEnterDraw} onHoldChange={handleHoldChange} />
                  </motion.div>
                </div>
              </VStack>
            </div>
          </VStack>

          {/* Save Hacks */}
          <VStack gap="XS" align="start" style={{ marginLeft: -Spacing.S, marginRight: -Spacing.S }}>
            <Typography type="headline" size="S" color={colorRoles.content.primary} style={{ paddingLeft: Spacing.S }}>
              Save Hacks
            </Typography>
            <Carousel
              items={SAVE_HACKS}
              renderItem={(hack) => <SaveHackCard hack={hack} />}
              activeIndex={0}
              onChangeIndex={() => {}}
              itemWidth={278}
              gap={Spacing.XS}
              className="pl-S"
            />
          </VStack>

          {/* Activity */}
          <VStack gap="XS" align="start" className="w-full">
            <HStack justify="between" align="center" className="w-full">
              <Typography type="headline" size="S" color={colorRoles.content.primary}>
                Activity
              </Typography>
              <LineIcon name="chevron-right" size="S" color={colorRoles.content.primary} />
            </HStack>
            <div
              className="w-full overflow-hidden rounded-CONTAINER border border-default"
              style={{ backgroundColor: colorRoles.background.baseLight }}
            >
              {ACTIVITY.map((item, index) => (
                <React.Fragment key={item.title}>
                  <HStack gap="S" align="center" className="w-full p-S">
                    <img src={item.icon} alt="" width={40} height={40} />
                    <VStack gap="XXXXS" align="start" className="min-w-0 flex-1">
                      <Typography type="titleStrong" size="M" color={colorRoles.content.primary}>
                        {item.title}
                      </Typography>
                      <Typography type="body" size="M" color={colorRoles.content.secondary}>
                        {item.subtitle}
                      </Typography>
                    </VStack>
                    <ActivityAmount sign={item.sign} main={item.main} cents={item.cents} color={item.amountColor} />
                  </HStack>
                  {index < ACTIVITY.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </div>
          </VStack>

          {/* FDIC footer */}
          <VStack gap="XXS" align="center" className="w-full">
            <Image source={fdicLogo} alt="FDIC" width={48} height={19} resizeMode="contain" />
            <Typography type="labelStrong" size="S" color={colorRoles.content.secondary} align="center">
              FDIC insured up to $250,000
            </Typography>
            <Typography type="label" size="S" color={colorRoles.content.tertiary} align="center">
              Your savings are held at Thread Bank, Member FDIC
            </Typography>
            <Typography type="label" size="S" color={colorRoles.content.tertiary} align="left">
              {`FDIC insurance up to $3,000,000 is available through a network of program banks where your funds may be held, each a Member FDIC. Standard FDIC insurance is $250,000 per depositor, per insured bank, per ownership category; higher coverage is reached by distributing deposits across multiple program banks. Coverage depends on program conditions being met, including that you haven't already reached coverage limits at a program bank through other deposits held there. A current list of program banks is available `}
              <Typography as="span" type="bodyLink" size="S" color={colorRoles.content.tertiary}>
                here
              </Typography>
              .
            </Typography>
          </VStack>
        </VStack>
      </div>

      <YoureInOverlay
        isOpen={sheetOpen}
        onGetMoreTokens={handleGetMoreTokens}
        onDismiss={handleDismissSheet}
      />

      <YouWonOverlay
        isOpen={wonOpen}
        onDismiss={() => setWonOpen(false)}
      />

      <YouDidntWinOverlay
        isOpen={didntWinOpen}
        onEnterNextDraw={() => setDidntWinOpen(false)}
        onGetMoreTokens={handleDidntWinGetMoreTokens}
        onDismiss={() => setDidntWinOpen(false)}
      />

    </div>
  );
};
