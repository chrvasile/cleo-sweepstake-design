import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
} from '../../design-system/components';
import type { LineIconName } from '../../design-system/components';
import {
  colorRoles,
  Spacing,
  BottomDrawerTransitions,
  framerFromDef,
} from '../../design-system/tokens';
import { useSafeArea } from '../../shell';
import { AnimatedClockIcon } from '../components/AnimatedClockIcon';
import type { ContentMapScreenMetadata } from '../content-map/types';
import fdicLogo from '../assets/fdic-logo.png';
import drawHero from '../assets/sweepstakes-draw-hero.png';
import infoIcon from '../assets/info-icon.svg';
import activityIconInvesting from '../assets/activity-icon-investing.svg';
import activityIconAdded from '../assets/activity-icon-added.svg';
import activityIconWithdrawn from '../assets/activity-icon-withdrawn.svg';
import saveHackPaydaySaver from '../assets/save-hack-payday-saver.png';
import saveHackSetAndForget from '../assets/save-hack-set-and-forget.png';
import saveHackRoundups from '../assets/save-hack-roundups.png';
import saveHackSwearJar from '../assets/save-hack-swear-jar.png';
import saveHackSmartSave from '../assets/save-hack-smart-save.png';

export const contentMap: ContentMapScreenMetadata = {
  id: 'savings',
  routePath: '/',
  label: 'Savings',
  context: 'Savings home',
  status: 'done',
  heading: 'Savings',
  subhead: 'Balance, the weekly sweepstakes draw tile, save hacks and activity.',
  order: 0,
};

// ─── Small building blocks (no design-system match — assembled from tokens) ──

// Figma's "Numbers/*" text styles are all Medium weight. The design system's
// `displayNumbers` type both defaults to Bold AND hardcodes its font-family to
// the single-weight 'PPNeueMontreal-Bold' face for that type — so the `weight`
// prop alone can't fix it; the font-family has to be overridden too, or the
// Bold face renders regardless of the requested weight.
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

// Figma: Tile is a fixed 136px, icon pinned to the top and the number/label
// block pinned to the bottom (flex-col justify-between) — not a small gap
// under the icon.
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
      {/* Figma: Body/Regular/S (Medium, 12/16) in content/tertiary → resolves to brown-500, our accentMid token */}
      <Typography type="body" size="S" color={colorRoles.content.accentMid}>
        {label}
      </Typography>
    </VStack>
  </div>
);

const DrawStat: React.FC<{ icon: LineIconName; value: string; label: string }> = ({ icon, value, label }) => (
  <VStack gap="XXS" align="center" justify="start" className="flex-1">
    <div
      className="flex items-center justify-center rounded-ICON"
      style={{ width: 40, height: 40, backgroundColor: colorRoles.background.secondary }}
    >
      {/* Ticking hands (not a static glyph) sell the "time is running out"
          framing of the draw countdown — see AnimatedClockIcon. */}
      {icon === 'clock' ? (
        <AnimatedClockIcon size={20} color={colorRoles.content.primary} />
      ) : (
        <LineIcon name={icon} size="M" color={colorRoles.content.primary} />
      )}
    </div>
    <VStack gap="XXXXS" align="center">
      {/* Figma: Title/Strong/L is SemiBold here, not the design system's Bold default */}
      <Typography type="titleStrong" size="L" weight="SemiBold" color={colorRoles.content.primary} align="center">
        {value}
      </Typography>
      <Typography type="body" size="M" color={colorRoles.content.accentMid} align="center">
        {label}
      </Typography>
    </VStack>
  </VStack>
);

// Countdown chip shown on the hero image once entered. Figma: Numbers/XS
// (Medium, 16/20) segments in white, separated by 1px hairline dividers.
// Matches Figma's static copy (06d 03h 34m 48s) as the starting point, then
// ticks down for real once mounted.
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

const CountdownTimer: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const [secondsLeft, setSecondsLeft] = useState(DRAW_COUNTDOWN_SECONDS);

  useEffect(() => {
    if (!isRunning) return;
    const endsAt = Date.now() + secondsLeft * 1000;
    const tick = () => setSecondsLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally captures secondsLeft only once per start
  }, [isRunning]);

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

// Draw-tile "before → after" state change — an explicit designer-authored spec
// (matching Figma's own keyframes), not the design system's token scale:
// - Card, title and hourglass image never move; only the content area under
//   the image changes, by crossfading its two states (both always mounted,
//   stacked absolute, opacity-only) inside a container whose height animates
//   between their two known natural heights. Nothing below it is animated
//   directly — it just reflows, because the tile is never `layout`/FLIP.
// - The 300ms gap between the old content starting to fade and the new
//   content/countdown starting to appear is what sells the "shared shell":
//   the shell (title + image) visibly holds still while old content
//   dissolves, before new content resolves in.
const DRAW_EASE: [number, number, number, number] = [0.42, 0, 0.58, 1]; // CSS ease-in-out
const DRAW_FADE_DURATION = 0.4;
const DRAW_FADE_OUT_DELAY = 0.3;
const DRAW_FADE_IN_DELAY = 0.6;
const DRAW_HEIGHT_DURATION = 0.6;
const DRAW_HEIGHT_DELAY = 0.3;
const DRAW_CONTENT_HEIGHT_BEFORE = 198; // natural height of the stats row + two buttons
const DRAW_CONTENT_HEIGHT_AFTER = 96; // natural height of the confirmation row + one button

// Snackbar shown once the draw-entry morph settles. No dedicated snackbar
// component or motion bundle exists in the design system, so this reuses
// `BottomDrawerTransitions.panel` — the closest existing motion shape for a
// transient bottom-anchored surface (scale + slide, easeOut in / easeIn out).
const Snackbar: React.FC<{ message: string }> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: 16, scale: BottomDrawerTransitions.panel.scaleFrom }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 16, scale: BottomDrawerTransitions.panel.scaleFrom }}
    transition={framerFromDef(BottomDrawerTransitions.panel.scaleEnter)}
    className="rounded-SNACKBAR p-XS"
    style={{ backgroundColor: colorRoles.background.positiveLight }}
  >
    <Typography type="bodyStrong" size="M" color={colorRoles.content.positiveDark}>
      {message}
    </Typography>
  </motion.div>
);

// ─── Save Hacks cards (copy + structure from Figma; art is a placeholder) ────

type SaveHack = { title: string; body: string; image: string };

const SAVE_HACKS: SaveHack[] = [
  { title: 'Payday Saver', body: 'Save a percentage of every paycheck', image: saveHackPaydaySaver },
  { title: 'Set and Forget', body: 'Save a fixed amount weekly', image: saveHackSetAndForget },
  { title: 'Roundups', body: 'Round up every purchase to the next dollar', image: saveHackRoundups },
  { title: 'Swear Jar', body: 'Save every time you shop at a set store', image: saveHackSwearJar },
  { title: 'Smart Save', body: 'Safely set aside based on your spending', image: saveHackSmartSave },
];

const SaveHackCard: React.FC<{ hack: SaveHack }> = ({ hack }) => (
  // Nested corner radius: outer card 28px (rounded-MODAL), inner image 16px (rounded-CARD).
  // align="stretch" (not "start") + no explicit width on the image: a percentage
  // width on a flex child inside a column flex container was resolving a few
  // pixels wider than the padded content box, eating into the 16px padding on
  // the right edge. Stretching the flex item is the reliable way to fill it.
  <VStack gap="XS" align="stretch" justify="between" className="h-full rounded-MODAL border border-default bg-white p-S">
    <Image source={hack.image} alt="" height={158} resizeMode="cover" borderRadius={16} />
    <VStack gap="XXXS" align="start" className="w-full flex-1">
      {/* Figma: Title/Strong/L is SemiBold here, not the design system's Bold default */}
      <Typography type="titleStrong" size="L" weight="SemiBold" color={colorRoles.content.primary}>
        {hack.title}
      </Typography>
      <Typography type="body" size="M" color={colorRoles.content.secondary}>
        {hack.body}
      </Typography>
    </VStack>
    {/* self-start: the card's align="stretch" (needed for the image) would
        otherwise stretch this to the card's full width too */}
    <Button label="Set up" variant="secondary" size="S" className="self-start" />
  </VStack>
);

// ─── Activity ─────────────────────────────────────────────────────────────

type Activity = {
  title: string;
  subtitle: string;
  sign: string;
  main: string;
  cents: string;
  amountColor: string;
  icon: string;
};

// Icons pulled directly from Figma (Category Icon instances on each ListItem) —
// none of these match a name in the LineIcon set, so they're real SVG assets
// rather than icon-font glyphs. The circle backdrop is baked into each SVG.
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

// Figma: the trailing amount on each Activity row mixes Numbers/XS ($ and
// cents) with Numbers/S (the main digits), all one color per row.
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

// ─── Decorative background curve (behind the period selector) ───────────────
// Reproduced from the Figma vector paths (Group 2147230077 / Vector 3716-3717).

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
      <linearGradient id="savings-curve-gradient" x1="170.012" x2="191.704" y1="-43.0525" y2="264.78" gradientUnits="userSpaceOnUse">
        <stop stopColor={colorRoles.content.tertiary} />
        <stop offset="1" stopColor={colorRoles.content.tertiary} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M3 260.338H5.69153H396V1.50033L391 16.5003C391 16.5003 366.244 109.326 320.5 142C303 154.5 268 150 268 150H203.5C162.666 145.625 137.074 156.455 100 176C71.6252 190.959 73 182.5 30.5 215.5C30.5 215.5 20.2874 223.936 15 229.5C8.8274 235.996 0 245 0 245L3 260.338Z"
      fill="url(#savings-curve-gradient)"
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

// ─── Period selector (doesn't match the design system's SelectableChip —
// unselected pills are transparent with a hairline border here, not filled) ──

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

// ─── Screen ────────────────────────────────────────────────────────────────

const PERIODS = ['1 W', '1 M', '6 M', '1 Y'] as const;

export const SavingsScreen: React.FC = () => {
  const insets = useSafeArea();
  const [entered, setEntered] = useState(false);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('1 Y');
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Show the snackbar once the draw-entry morph has settled (height transition
  // ends at 0.3s delay + 0.6s duration = 0.9s; content fade-in ends at
  // 0.6s + 0.4s = 1.0s), then auto-dismiss it after a normal toast duration.
  useEffect(() => {
    if (!entered) return;
    const showTimer = setTimeout(() => setShowSnackbar(true), 1000);
    const hideTimer = setTimeout(() => setShowSnackbar(false), 5000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [entered]);

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
          {/* Figma: Title/Regular/M (Medium, 16/20) — not Body/M */}
          <Typography type="title" size="M" color={colorRoles.content.tertiary}>
            $13.70 (+9.8%) all time
          </Typography>
        </HStack>
      </VStack>

      {/* Decorative curve — sits below the balance with a fixed 48px gap per Figma
          (not a spacing token; this block is manually positioned in the source file) */}
      <div className="relative w-full" style={{ height: 259, marginTop: 48 }}>
        <BackgroundCurve />
      </div>

      {/* Period selector — 16px (Spacing.S) below the curve, not overlapping it */}
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

        {/* Sweepstakes draw tile */}
        <VStack gap="XS" align="start" className="w-full">
          <Typography type="headline" size="S" color={colorRoles.content.primary}>
            Enter the weekly $3,000 draw
          </Typography>

          {/* Card + title + image are completely static — only the content area
              below the image (and the countdown overlay on the image) animate. */}
          <div className="w-full rounded-MODAL border border-default bg-white p-S" style={{ overflow: 'hidden' }}>
            <div className="relative">
              <Image source={drawHero} alt="" height={143} resizeMode="cover" borderRadius={16} />
              {/* Countdown overlay: always mounted, crossfades in/out with the content below */}
              <motion.div
                animate={{ opacity: entered ? 1 : 0 }}
                transition={{ duration: DRAW_FADE_DURATION, delay: entered ? DRAW_FADE_IN_DELAY : 0, ease: DRAW_EASE }}
                className="absolute flex items-center rounded-CONTAINER px-S py-XS"
                style={{
                  left: 12,
                  bottom: 12,
                  height: 44,
                  backgroundColor: 'rgba(14, 6, 5, 0.12)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  pointerEvents: entered ? 'auto' : 'none',
                }}
              >
                <CountdownTimer isRunning={entered} />
              </motion.div>
            </div>

            {/* Content area: both states always mounted, stacked absolute, crossfading
                opacity only. The container's own height animates between their two
                known natural heights — everything below reflows for free since
                nothing here is `layout`/FLIP-animated or position: absolute itself. */}
            <motion.div
              animate={{ height: entered ? DRAW_CONTENT_HEIGHT_AFTER : DRAW_CONTENT_HEIGHT_BEFORE }}
              transition={{ duration: DRAW_HEIGHT_DURATION, delay: DRAW_HEIGHT_DELAY, ease: DRAW_EASE }}
              style={{ position: 'relative', marginTop: Spacing.S, overflow: 'hidden' }}
            >
              <motion.div
                animate={{ opacity: entered ? 0 : 1 }}
                transition={{ duration: DRAW_FADE_DURATION, delay: DRAW_FADE_OUT_DELAY, ease: DRAW_EASE }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: entered ? 'none' : 'auto' }}
              >
                <VStack gap="S" align="stretch">
                  <HStack gap="XXXS" align="stretch" className="w-full">
                    <DrawStat icon="clock" value="2d 21hrs" label="before draw ends" />
                    <Divider vertical />
                    <DrawStat icon="ticket-default" value="177" label="tokens" />
                  </HStack>
                  <VStack gap="XS" align="stretch">
                    <Button label="Enter the draw" variant="primary" fullWidth onPress={() => setEntered(true)} />
                    <Button label="Learn more" variant="secondary" fullWidth />
                  </VStack>
                </VStack>
              </motion.div>

              <motion.div
                animate={{ opacity: entered ? 1 : 0 }}
                transition={{ duration: DRAW_FADE_DURATION, delay: entered ? DRAW_FADE_IN_DELAY : 0, ease: DRAW_EASE }}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', pointerEvents: entered ? 'auto' : 'none' }}
              >
                <VStack gap="XS" align="stretch">
                  <HStack gap="XXS" align="center">
                    <div
                      className="flex items-center justify-center rounded-ICON"
                      style={{ width: 40, height: 40, backgroundColor: colorRoles.background.secondary }}
                    >
                      <LineIcon name="ticket-default" size="M" color={colorRoles.content.primary} />
                    </div>
                    <VStack gap="XXXXS" align="start" className="flex-1">
                      {/* Figma: Title/Strong/L (18/22) — "You entered " is Medium, "177 tokens" is SemiBold */}
                      <p style={{ margin: 0 }}>
                        <Typography as="span" type="titleStrong" size="L" weight="Medium" color={colorRoles.content.primary}>
                          You entered{' '}
                        </Typography>
                        <Typography as="span" type="titleStrong" size="L" weight="SemiBold" color={colorRoles.content.primary}>
                          177 tokens
                        </Typography>
                      </p>
                      <Typography type="body" size="M" color={colorRoles.content.secondary}>
                        Get more tokens by adding to your savings
                      </Typography>
                    </VStack>
                  </HStack>
                  <Button label="Get more tokens" variant="secondary" fullWidth />
                </VStack>
              </motion.div>
            </motion.div>
          </div>
        </VStack>

        {/* Save Hacks — bleeds past the page's side padding so the peeking card
            is cut off flush with the true screen edge instead of leaving a
            strip of empty background between the card and the edge (which read
            as a dead-end "wall" rather than an obviously-swipeable carousel) */}
        {/* No "w-full": an explicit 100% width plus negative margins on both
            sides only shifts the box (margin-right can't stretch a
            fixed-width box) — auto width is what lets negative margins on
            both edges actually bleed it past the parent's padding. */}
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
                {/* Not using ListItem here — its `icon` prop only takes a LineIcon
                    glyph name, and these three rows use real Figma SVG assets
                    (with the circle backdrop baked in) instead */}
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
          {/* Figma: Label/Strong/S and Label/Regular/S (11px), not the M size */}
          <Typography type="labelStrong" size="S" color={colorRoles.content.secondary} align="center">
            FDIC insured up to $250,000
          </Typography>
          <Typography type="label" size="S" color={colorRoles.content.tertiary} align="center">
            Your savings are held at Thread Bank, Member FDIC
          </Typography>
          <Typography type="label" size="S" color={colorRoles.content.tertiary} align="center">
            {`FDIC insurance up to $3,000,000 is available through a network of program banks where your funds may be held, each a Member FDIC. Standard FDIC insurance is $250,000 per depositor, per insured bank, per ownership category; higher coverage is reached by distributing deposits across multiple program banks. Coverage depends on program conditions being met, including that you haven't already reached coverage limits at a program bank through other deposits held there. A current list of program banks is available `}
            <Typography as="span" type="bodyLink" size="S" color={colorRoles.content.tertiary}>
              here
            </Typography>
            .
          </Typography>
        </VStack>
      </VStack>
    </div>
    <AnimatePresence>
      {showSnackbar && (
        <div
          className="absolute w-full"
          style={{ bottom: insets.bottom + Spacing.S, paddingLeft: Spacing.S, paddingRight: Spacing.S }}
        >
          <Snackbar message="You're in! Deposit more into your savings for more chances to win." />
        </div>
      )}
    </AnimatePresence>
    </div>
  );
};
