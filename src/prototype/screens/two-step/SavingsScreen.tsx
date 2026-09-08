import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion, useMotionValue, useTransform, animate } from 'framer-motion';
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
  colorRoles,
  Spacing,
  BottomDrawerTransitions,
  MotionTransitions,
  framerFromDef,
  MotionDuration,
  msToSeconds,
  bottomDrawerBackdropEnter,
  bottomDrawerPanelEnter,
  bottomDrawerContentEnter,
} from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';
import fdicLogo from '../../assets/fdic-logo.png';
import sweepstakesHourglass from '../../assets/sweepstakes-draw-hourglass.png';
import sweepstakesModalHero from '../../assets/sweepstakes-modal-hero.png';
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
  id: 'savings-two-step',
  routePath: '/',
  label: 'Savings',
  context: 'Savings home',
  status: 'done',
  heading: 'Savings — two-step entry',
  subhead: "Widget tile. Tapping Enter draw opens a bottom sheet. The tile only updates once the sheet is dismissed.",
  order: 0,
  options: [
    { code: 'ENTER_EXTRA_TOKENS', label: 'Get extra tokens', to: 'two-step-deposit' },
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
    className="relative flex-1 rounded-CARD bg-white p-XS"
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
  <VStack gap="XS" align="stretch" justify="between" className="h-full rounded-MODAL border border-default bg-white p-S">
    <Image source={hack.image} alt="" height={158} resizeMode="cover" borderRadius={16} />
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
      <linearGradient id="savings-curve-gradient-2step" x1="170.012" x2="191.704" y1="-43.0525" y2="264.78" gradientUnits="userSpaceOnUse">
        <stop stopColor={colorRoles.content.tertiary} />
        <stop offset="1" stopColor={colorRoles.content.tertiary} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M3 260.338H5.69153H396V1.50033L391 16.5003C391 16.5003 366.244 109.326 320.5 142C303 154.5 268 150 268 150H203.5C162.666 145.625 137.074 156.455 100 176C71.6252 190.959 73 182.5 30.5 215.5C30.5 215.5 20.2874 223.936 15 229.5C8.8274 235.996 0 245 0 245L3 260.338Z"
      fill="url(#savings-curve-gradient-2step)"
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

const DRAW_COUNTDOWN_SECONDS = 6 * 86400 + 3 * 3600 + 34 * 60 + 48;
const pad2 = (n: number) => String(n).padStart(2, '0');
const formatCountdown = (totalSeconds: number) => {
  const clamped = Math.max(0, totalSeconds);
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = Math.floor(clamped % 60);
  return [`${pad2(days)}d`, `${pad2(hours)}h`, `${pad2(minutes)}m`, `${pad2(seconds)}s`];
};

const CountdownTimer: React.FC = () => {
  const [secondsLeft, setSecondsLeft] = useState(DRAW_COUNTDOWN_SECONDS);
  useEffect(() => {
    const endsAt = Date.now() + secondsLeft * 1000;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const segments = formatCountdown(secondsLeft);
  return (
    <HStack gap="XXS" align="center">
      {segments.map((segment, i) => (
        <React.Fragment key={i}>
          <NumberPart text={segment} size="XS" color={colorRoles.content.onColor} />
          {i < segments.length - 1 && (
            <div style={{ width: 1, height: 16, backgroundColor: colorRoles.border.opaqueInverseLight }} />
          )}
        </React.Fragment>
      ))}
    </HStack>
  );
};

// ─── Hold-to-enter button ─────────────────────────────────────────────────────
// User holds for holdDurationMs to confirm entry. A fill sweeps left-to-right
// during the hold; releasing early retreats it. On completion the button
// briefly shows "You're in!" before the bottom sheet opens.

const HoldToEnterButton: React.FC<{ holdDurationMs: number; onReady: () => void; onComplete: () => void }> = ({ holdDurationMs, onReady, onComplete }) => {
  const progress = useMotionValue(0);
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
      // Sheet opens after wiggle (750ms, no token) has settled plus a breath (slow2 = 500ms) + 250ms extra delay
      setTimeout(() => onComplete(), 750 + MotionDuration.slow2 + 250);
    }
  };

  const startHold = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (completedRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setPhase('holding');
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const endHold = () => {
    if (completedRef.current) return;
    stopRaf();
    setPhase('idle');
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

// ─── "You're in!" bottom sheet ────────────────────────────────────────────────
// Appears immediately when the user taps "Enter draw". The tile on the home
// screen stays in its pre-entry state until this sheet is dismissed — only
// then does the tile flip to the entered state and the snackbar fires.

const YoureInSheet: React.FC<{
  isOpen: boolean;
  onGetMoreTokens: () => void;
  onDismiss: () => void;
}> = ({ isOpen, onGetMoreTokens, onDismiss }) => {
  const reducedMotion = !!useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="absolute inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={bottomDrawerBackdropEnter(reducedMotion)}
            style={{ backgroundColor: colorRoles.background.overlay }}
            onClick={onDismiss}
          />
          <motion.div
            className="absolute z-50 overflow-hidden rounded-MODAL"
            style={{
              left: Spacing.XS,
              right: Spacing.XS,
              bottom: Spacing.XS,
              backgroundColor: colorRoles.background.baseLight,
            }}
            initial={{ opacity: 0, y: 16, scale: BottomDrawerTransitions.panel.scaleFrom }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: BottomDrawerTransitions.panel.scaleFrom }}
            transition={bottomDrawerPanelEnter(reducedMotion)}
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={bottomDrawerContentEnter(reducedMotion)}
            >
              <VStack
                align="stretch"
                style={{
                  gap: Spacing.M,
                  paddingLeft: Spacing.S,
                  paddingRight: Spacing.S,
                  paddingBottom: Spacing.S,
                  paddingTop: Spacing.ZERO,
                }}
              >
                {/* Grabber */}
                <div className="flex w-full justify-center" style={{ paddingTop: Spacing.XXS }}>
                  <div className="rounded-PILL" style={{ width: 48, height: 4, backgroundColor: colorRoles.background.overlayLight }} />
                </div>

                <VStack gap="S" align="stretch" className="w-full">
                  {/* Hero image with live countdown overlay — matches visual variant */}
                  <div className="relative">
                    <Image source={sweepstakesModalHero} alt="" height={162} resizeMode="cover" borderRadius={16} />
                    <div
                      className="absolute flex items-center rounded-CONTAINER px-S py-XS"
                      style={{
                        left: 12,
                        bottom: 12,
                        height: 44,
                        backgroundColor: 'rgba(14, 6, 5, 0.12)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                      }}
                    >
                      <CountdownTimer />
                    </div>
                  </div>

                  <VStack gap="XXXS" align="start" className="w-full">
                    <Typography type="headline" size="M" color={colorRoles.content.primary}>
                      You're in!
                    </Typography>
                    <Typography type="body" size="L" color={colorRoles.content.secondary}>
                      You've entered 177 tokens. Want more chances to win? Add to your savings for extra tokens.
                    </Typography>
                  </VStack>
                </VStack>

                <VStack gap="XXS" align="stretch" className="w-full">
                  <Button label="Get more tokens" variant="primary" fullWidth onPress={onGetMoreTokens} />
                  <Button label="Not now" variant="secondary" fullWidth onPress={onDismiss} />
                </VStack>
              </VStack>
            </motion.div>
          </motion.div>
        </>
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
  const [hourglassSpin, setHourglassSpin] = useState(depositResult != null);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('1 Y');

  const shakeDuration = 500;
  const shakeAmplitude = 5;
  const holdDuration = 1400;
  const [sheetOpen, setSheetOpen] = useState(false);

  // Clear navigation state on return from deposit so a refresh doesn't re-trigger entered state.
  useEffect(() => {
    if (depositResult == null) return;
    navigate(location.pathname, { replace: true, state: null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fires immediately when hold hits 100% — card reacts before the sheet opens.
  const handleHoldReady = () => {
    setEntered(true);
    setHourglassSpin(true);
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
          <IconButton icon="chevron-left" variant="primary" label="Back" />
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
                style={{ left: 195, top: -13, width: 237.522, height: 237.522 }}
              >
                {/* Hourglass wiggles when the hold completes. Dampened swing: full → 75% → rest. */}
                <motion.div
                  initial={{ rotate: -11.34 }}
                  animate={{
                    rotate: hourglassSpin
                      ? [-11.34, -11.34 - shakeAmplitude, -11.34 + shakeAmplitude, -11.34 - shakeAmplitude * 0.75, -11.34 + shakeAmplitude * 0.75, -11.34]
                      : -11.34,
                  }}
                  // No design system match — 500ms falls between steady2 (300ms) and slow1 (400ms)… actually slow2 is 500ms. Still keeping raw comment for clarity.
                  transition={hourglassSpin
                    ? { duration: msToSeconds(shakeDuration), ease: 'easeInOut', times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                    : { duration: 0 }
                  }
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

              <VStack gap="S" align="start" style={{ maxWidth: 224, position: 'relative' }}>
                <VStack gap="XXS" align="start" className="w-full">
                  <Tag variant="success" size="S">
                    <p style={{ margin: 0, fontSize: 11, lineHeight: '14px' }}>
                      <Typography as="span" type="labelStrong" size="S" weight="Medium" color={colorRoles.content.positiveDark}>
                        {entered ? 'Countdown to the draw: ' : 'Next draw in '}
                      </Typography>
                      <Typography as="span" type="labelStrong" size="S" weight="Bold" color={colorRoles.content.positiveDark}>
                        2d 2hrs
                      </Typography>
                    </p>
                  </Tag>
                  {/* Body copy crossfades between pre- and post-entry */}
                  <AnimatePresence mode="wait" initial={false}>
                    {entered ? (
                      <motion.p
                        key="entered"
                        style={{ margin: 0 }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={framerFromDef(MotionTransitions.slideIn.steady2)}
                      >
                        <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                          You entered{' '}
                        </Typography>
                        <Typography as="span" type="body" size="M" weight="SemiBold" color={colorRoles.content.tertiary}>
                          177 tokens
                        </Typography>
                        <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                          . Get more by adding to your savings
                        </Typography>
                      </motion.p>
                    ) : (
                      <motion.p
                        key="not-entered"
                        style={{ margin: 0 }}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={framerFromDef(MotionTransitions.slideIn.steady2)}
                      >
                        <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                          You have{' '}
                        </Typography>
                        <Typography as="span" type="body" size="M" weight="Bold" color={colorRoles.content.tertiary}>
                          177 tokens
                        </Typography>
                        <Typography as="span" type="body" size="M" color={colorRoles.content.tertiary}>
                          . Save more to get more chances to win
                        </Typography>
                      </motion.p>
                    )}
                  </AnimatePresence>
                </VStack>
                {/* Button crossfades too */}
                <AnimatePresence mode="wait" initial={false}>
                  {entered ? (
                    <motion.div
                      key="get-more"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={framerFromDef(MotionTransitions.slideIn.steady2)}
                    >
                      <Button label="Get more tokens" variant="secondary" onPress={handleGetMoreTokens} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="hold-enter"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={framerFromDef(MotionTransitions.slideIn.steady2)}
                      style={{ width: '100%' }}
                    >
                      <HoldToEnterButton holdDurationMs={holdDuration} onReady={handleHoldReady} onComplete={handleEnterDraw} />
                    </motion.div>
                  )}
                </AnimatePresence>
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

      {/* "You're in!" bottom sheet */}
      <YoureInSheet
        isOpen={sheetOpen}
        onGetMoreTokens={handleGetMoreTokens}
        onDismiss={handleDismissSheet}
      />

    </div>
  );
};
