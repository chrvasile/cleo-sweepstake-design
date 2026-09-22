import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Button, LineIcon, Typography } from '../../../design-system/components';
import { colorRoles, colors, Radii, Spacing, MotionTransitions, framerFromDef, msToSeconds, MotionDuration } from '../../../design-system/tokens';
import { useSafeArea } from '../../../shell';
import type { ContentMapScreenMetadata } from '../../content-map/types';

const NAV_LABEL_FONT = "'PPNeueMontreal', system-ui, sans-serif";

// ─── Draw countdown ───────────────────────────────────────────────────────────

const DRAW_OFFSET_MS = (2 * 24 + 7) * 60 * 60 * 1000;

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0m';
  const totalSecs = Math.floor(ms / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m ${secs}s`;
}

function useDrawCountdown(): string {
  const targetRef = useRef<number>(Date.now() + DRAW_OFFSET_MS);
  const [label, setLabel] = useState(() => formatCountdown(DRAW_OFFSET_MS));

  useEffect(() => {
    const tick = () => setLabel(formatCountdown(targetRef.current - Date.now()));
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return label;
}

// ─── Floating bottom banner ───────────────────────────────────────────────────

const FloatingDrawBanner: React.FC<{
  countdownLabel: string;
  onSeeMore: () => void;
  onDismiss: () => void;
}> = ({ countdownLabel, onSeeMore, onDismiss }) => (
  <div
    style={{
      backgroundColor: colorRoles.background.primaryInverse,
      borderRadius: Radii.BANNER,
      paddingTop: Spacing.XXS,
      paddingBottom: Spacing.XXS,
      paddingLeft: Spacing.XS,
      paddingRight: Spacing.XXS,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.XXS,
    }}
  >
    <div style={{ flex: 1, minWidth: 0 }}>
      <Typography type="titleStrong" size="S" color={colorRoles.content.primaryInverse}>
        Win $3,000 every week
      </Typography>
      <Typography type="body" size="S" color={colorRoles.content.secondaryInverse}>
        {countdownLabel} left before the draw
      </Typography>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.XXXS, flexShrink: 0 }}>
      <Button label="Learn more" variant="primary" palette="dark" size="S" onPress={onSeeMore} />
      <motion.button
        type="button"
        onClick={onDismiss}
        whileTap={{ scale: 0.8 }}
        aria-label="Dismiss"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: Spacing.XXXS,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LineIcon name="cross" size="XS" color={colorRoles.content.primaryInverse} />
      </motion.button>
    </div>
  </div>
);

export const contentMap: ContentMapScreenMetadata = {
  id: 'v1-bb-wealth-home',
  routePath: '/',
  label: 'Wealth Home',
  context: 'Wealth overview',
  heading: 'Money at work',
  subhead: 'Overview of savings and investing — with floating bottom banner.',
  order: 0,
  options: [{ code: 'SAVINGS', label: 'Savings', to: 'savings-v1' }],
};

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const GainArrow: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
    <div style={{ transform: 'rotate(90deg)', lineHeight: 0 }}>
      <svg width="12.31" height="12" viewBox="0 0 12.3112 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M12.3107 6.00018H1.06066M5.06066 2.00017L1.06066 6.00018L5.06066 10.0002" stroke={colors.green[400]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  </div>
);

const CardChevron: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3.25017 0.750168L8.50017 6.00017L3.25017 11.2502" stroke={colors.brown[800]} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DataVisIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M15 8V5H12M15 5L9 11L5 7L1 11" stroke={colors.brown[700]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NavSpend: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0.75C21.3178 0.75 27.25 6.68223 27.25 14C27.25 21.3178 21.3178 27.25 14 27.25C6.68223 27.25 0.75 21.3178 0.75 14C0.750002 6.68223 6.68223 0.750002 14 0.75Z" stroke={colors.brown[800]} strokeWidth="1.5" />
    <path d="M8.00033 18.5897L9.41033 19.9997L17.7103 11.7097V17.2897H19.7103V8.28972H10.7103V10.2897H16.2903L8.00033 18.5897Z" fill={colors.brown[800]} />
  </svg>
);

const NavPlan: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0.75C21.3178 0.75 27.25 6.68223 27.25 14C27.25 21.3178 21.3178 27.25 14 27.25C6.68223 27.25 0.75 21.3178 0.75 14C0.750002 6.68223 6.68223 0.750002 14 0.75Z" stroke={colors.brown[800]} strokeWidth="1.5" />
    <path d="M21 20.5L14 16.5838L7 20.5L14 4.5L21 20.5ZM11.1929 15.8386L14 14.2695L16.8061 15.8386L14 9.42407L11.1929 15.8386Z" fill={colors.brown[800]} />
  </svg>
);

const NavAskCleo: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0.75C21.3158 0.75 27.25 6.68421 27.25 14C27.25 21.3158 21.3158 27.25 14 27.25H0.75V14C0.750002 6.68421 6.68421 0.750002 14 0.75Z" stroke={colors.brown[800]} strokeWidth="1.5" />
    <path fillRule="evenodd" clipRule="evenodd" d="M17.1003 16.01C16.4903 17.44 15.4603 18.33 13.9703 18.33C11.7503 18.33 10.3803 16.43 10.3803 14C10.3803 11.57 11.7503 9.67 13.9403 9.67C15.4303 9.67 16.4903 10.54 17.1003 11.97L19.5803 10.78C18.5203 8.32 16.5503 7 13.9403 7C10.1203 7 7.55029 9.93 7.55029 14C7.55029 18.07 10.1303 21 13.9703 21C16.5703 21 18.5403 19.63 19.6103 17.17L17.1103 16.01H17.1003Z" fill={colors.brown[800]} />
  </svg>
);

const NavWealth: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0.75C21.3178 0.75 27.25 6.68223 27.25 14C27.25 21.3178 21.3178 27.25 14 27.25C6.68223 27.25 0.75 21.3178 0.75 14C0.750002 6.68223 6.68223 0.750002 14 0.75Z" fill={colors.brown[800]} stroke={colors.brown[800]} strokeWidth="1.5" />
    <path d="M21 14V11H18M21 11L15 17L11 13L7 17" stroke={colors.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const NavRequest: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M14 0.75C21.3178 0.75 27.25 6.68223 27.25 14C27.25 21.3178 21.3178 27.25 14 27.25C6.68223 27.25 0.75 21.3178 0.75 14C0.750002 6.68223 6.68223 0.750002 14 0.75Z" stroke={colors.brown[800]} strokeWidth="1.5" />
    <path d="M18.0299 19.3105C17.2399 19.9905 16.1299 20.3605 14.6799 20.4205V22.0005H13.4999V20.3805C12.0899 20.2605 10.9599 19.8105 10.1099 19.0505C9.25988 18.2805 8.81988 17.2605 8.78988 15.9905H11.3299C11.3699 16.6605 11.5799 17.1805 11.9599 17.5505C12.3399 17.9205 12.8499 18.1505 13.4999 18.2505V14.7605C13.3799 14.7105 13.2599 14.6905 13.2599 14.6905C11.9699 14.3405 10.9799 13.8905 10.2699 13.3505C9.56988 12.8105 9.20988 12.0305 9.20988 11.0205C9.20988 9.9305 9.58988 9.0505 10.3599 8.4005C11.1299 7.7405 12.1699 7.3905 13.4999 7.3205V6.0105H14.6799V7.3305C15.9699 7.4505 16.9899 7.8705 17.7499 8.5905C18.5099 9.3105 18.9199 10.2405 18.9599 11.3905H16.3999C16.2799 10.3205 15.6999 9.6805 14.6699 9.4605V12.6205C15.6899 12.9305 16.5099 13.2205 17.1299 13.5005C17.7499 13.7805 18.2499 14.1705 18.6299 14.6805C19.0099 15.1905 19.1999 15.8405 19.1999 16.6505C19.1999 17.7405 18.8099 18.6305 18.0199 19.3105H18.0299ZM12.1899 11.6605C12.4499 11.8705 12.8899 12.0805 13.5099 12.2805V9.4105C12.9799 9.4505 12.5699 9.5805 12.2599 9.8105C11.9499 10.0405 11.7999 10.3705 11.7999 10.7805C11.7999 11.1505 11.9299 11.4405 12.1999 11.6505L12.1899 11.6605ZM14.6799 18.3205C15.9799 18.2505 16.6299 17.7605 16.6299 16.8505C16.6299 16.4105 16.4699 16.0605 16.1499 15.8005C15.8299 15.5405 15.3399 15.3005 14.6799 15.0805V18.3205Z" fill={colors.brown[800]} />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M3.62872 19.1369C4.62412 18.5248 7.54983 17.0006 11.9998 17.0006C16.4497 17.0006 19.3755 18.5248 20.3709 19.1369M0.99975 12.0005C0.99975 14.9179 2.15868 17.7158 4.22158 19.7787C6.28448 21.8416 9.08237 23.0005 11.9998 23.0005C14.9172 23.0005 17.7151 21.8416 19.778 19.7787C21.8409 17.7158 22.9998 14.9179 22.9998 12.0005C22.9998 9.0831 21.8409 6.28521 19.778 4.22231C17.7151 2.15941 14.9172 1.00048 11.9998 1.00048C9.08237 1.00048 6.28448 2.15941 4.22158 4.22231C2.15868 6.28521 0.99975 9.0831 0.99975 12.0005ZM7.49975 9.50057C7.49975 10.694 7.97386 11.8386 8.81777 12.6825C9.66168 13.5265 10.8063 14.0006 11.9998 14.0006C13.1932 14.0006 14.3378 13.5265 15.1817 12.6825C16.0256 11.8386 16.4998 10.694 16.4998 9.50057C16.4998 8.30709 16.0256 7.1625 15.1817 6.31859C14.3378 5.47467 13.1932 5.00057 11.9998 5.00057C10.8063 5.00057 9.66168 5.47467 8.81777 6.31859C7.97386 7.1625 7.49975 8.30709 7.49975 9.50057Z" stroke={colors.brown[800]} strokeWidth="1.5" />
  </svg>
);

// ─── Sparkline charts ─────────────────────────────────────────────────────────

const SavingsSparkline: React.FC = () => (
  <svg viewBox="0 0 385 53" preserveAspectRatio="none" style={{ width: '100%', height: 53, display: 'block' }} aria-hidden="true">
    <defs>
      <linearGradient id="bb-savings-grad" x1="141.649" y1="-4.08" x2="145.086" y2="58.51" gradientUnits="userSpaceOnUse">
        <stop stopColor={colors.brown[600]} />
        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M385 49.5L0 52.5L50.5 45.5C95.0376 38.7481 138.721 35.3294 183.5 31C219.972 27.4737 276.446 18.1667 276.446 18.1667L385 0V49.5Z" fill="url(#bb-savings-grad)" />
    <path d="M1.5 50C1.5 50 104.1 41.9 169.7 34.3C252.8 24.7 383.2 1.5 383.2 1.5" fill="none" stroke={colors.brown[600]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const InvestingSparkline: React.FC = () => (
  <svg viewBox="0 0 359 52" preserveAspectRatio="none" style={{ width: '100%', height: 51, display: 'block' }} aria-hidden="true">
    <defs>
      <linearGradient id="bb-invest-grad" x1="129.187" y1="-0.5" x2="132.043" y2="54.83" gradientUnits="userSpaceOnUse">
        <stop stopColor={colors.brown[600]} />
        <stop offset="1" stopColor="#D9D9D9" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path d="M0 49.5L7.30612 45.2808L20.091 37.4452L40.1829 39.8562L54.7951 37.4452C54.7951 37.4452 61.7824 37.1152 66.2355 37.4452C80.4679 38.5 88.1315 39.2534 102.911 37C111.608 35.674 127.544 39.2534 127.544 39.2534C127.544 39.2534 162.134 21.5 186.305 25.3904C196.487 27.0291 208.38 34.5 208.38 34.5C208.38 34.5 236.729 33.768 250.234 32.6233C293.701 28.9387 359 0 359 0L358 49.5H0Z" fill="url(#bb-invest-grad)" />
    <path d="M1.5 51C1.5 51 11.8074 41.7347 20.2575 40.0004C27.6416 38.4848 31.9952 41.7563 39.5509 41.5004C52.5284 41.0608 52.4132 36.0004 64.7395 39.0004C87.4511 44.5279 99.0389 33.0004 116.725 40.0004C129.457 45.0398 157.897 24.8419 183.18 27.5004C194.893 28.7321 200.453 33.9329 212.12 35.5004C226.005 37.366 234.064 35.7645 248.027 34.5004C287.003 30.9718 357.285 1.50039 357.285 1.50039" fill="none" stroke={colors.brown[600]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── Nav item ─────────────────────────────────────────────────────────────────

type NavItemProps = { icon: React.ReactNode; label: string; active?: boolean; onPress?: () => void };

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onPress }) => (
  <motion.button
    type="button"
    onClick={onPress}
    whileTap={{ scale: 0.9 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Spacing.XXS, padding: Spacing.XXXS, background: 'none', border: 'none', cursor: 'pointer', width: 58 }}
  >
    <div style={{ width: 28, height: 28, flexShrink: 0 }}>{icon}</div>
    <span style={{ fontFamily: NAV_LABEL_FONT, fontSize: 11, fontWeight: 530, lineHeight: '16px', letterSpacing: '0.2px', color: active ? colorRoles.content.primary : colorRoles.content.tertiary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: 50, textAlign: 'center' }}>
      {label}
    </span>
  </motion.button>
);

// ─── Product card ─────────────────────────────────────────────────────────────

type ProductCardProps = { icon: React.ReactNode; title: string; balance: string; gainAmount: string; gainPct: string; chart: React.ReactNode; onPress?: () => void; delay: number };

const ProductCard: React.FC<ProductCardProps> = ({ icon, title, balance, gainAmount, gainPct, chart, onPress, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay }}
    style={{ backgroundColor: colorRoles.background.baseLight, borderRadius: Radii.CONTAINER, border: `1px solid ${colorRoles.border.default}`, overflow: 'hidden', cursor: onPress ? 'pointer' : undefined }}
    whileTap={onPress ? { scale: 0.985 } : undefined}
    onClick={onPress}
  >
    <div style={{ paddingTop: Spacing.S, paddingLeft: Spacing.S, paddingRight: Spacing.S, paddingBottom: Spacing.XXS }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.XXS, height: 20, marginBottom: Spacing.XXS }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: Spacing.XXS, minWidth: 0, overflow: 'hidden' }}>
          {icon}
          <Typography type="labelStrong" size="L" color={colorRoles.content.secondary} numberOfLines={1}>{title}</Typography>
        </div>
        <CardChevron />
      </div>
      <div style={{ marginBottom: Spacing.XXXS }}>
        <Typography type="displayNumbers" size="S" weight="Medium" color={colorRoles.content.primary} style={{ fontFamily: 'PPNeueMontreal, system-ui, sans-serif' }}>{balance}</Typography>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.XXXS }}>
        <GainArrow />
        <Typography type="body" size="M" color={colorRoles.content.tertiary}>{gainAmount} ({gainPct}) all time</Typography>
      </div>
    </div>
    {chart}
  </motion.div>
);

// ─── Screen ───────────────────────────────────────────────────────────────────

export const WealthHomeScreen: React.FC = () => {
  const insets = useSafeArea();
  const navigate = useNavigate();
  const countdownLabel = useDrawCountdown();
  const [bannerVisible, setBannerVisible] = useState(true);

  const d0 = msToSeconds(MotionDuration.swift2);
  const d1 = msToSeconds(MotionDuration.steady1);
  const d2 = msToSeconds(MotionDuration.steady1 + MotionDuration.swift2);

  const NAV_HEIGHT = 103;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: colorRoles.background.primary, overflowY: 'auto' }}>

      {/* Top app bar */}
      <div style={{ paddingTop: insets.top, paddingLeft: Spacing.S, paddingRight: Spacing.S, height: insets.top + 48, display: 'flex', alignItems: 'flex-end', paddingBottom: 8, flexShrink: 0 }}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          aria-label="Profile"
          style={{ width: 40, height: 40, borderRadius: Radii.ICON, backgroundColor: colors.whiteAlpha[25], border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', boxShadow: `0px 2px 12px 1px ${colors.blackAlpha[5]}` }}
        >
          <UserIcon />
        </motion.button>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...framerFromDef(MotionTransitions.fadeIn.steady1), delay: d0 }}
        style={{ flex: 1, paddingLeft: Spacing.S, paddingRight: Spacing.S, display: 'flex', flexDirection: 'column', gap: Spacing.XL }}
      >
        {/* Hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Spacing.XXXS, paddingTop: Spacing.M }}>
          <Typography type="labelStrong" size="L" color={colorRoles.content.primary}>Money at work</Typography>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography type="displayNumbers" size="M" weight="Medium" color={colorRoles.content.primary} style={{ fontFamily: 'PPNeueMontreal, system-ui, sans-serif' }}>$</Typography>
            <Typography type="displayNumbers" size="L" weight="Medium" color={colorRoles.content.primary} style={{ fontFamily: 'PPNeueMontreal, system-ui, sans-serif' }}>628</Typography>
            <Typography type="displayNumbers" size="M" weight="Medium" color={colorRoles.content.primary} style={{ fontFamily: 'PPNeueMontreal, system-ui, sans-serif' }}>.35</Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.XXXS }}>
            <GainArrow />
            <Typography type="title" size="M" color={colorRoles.content.tertiary}>$48.50 (+8.4%) all time</Typography>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.S }}>
          <ProductCard
            icon={<LineIcon name="piggy-bank" size="S" color={colorRoles.content.secondary} />}
            title="Savings at 2.75% APY"
            balance="$61.09"
            gainAmount="$13.70"
            gainPct="+4.8%"
            chart={<SavingsSparkline />}
            onPress={() => navigate('/savings')}
            delay={d1}
          />
          <ProductCard
            icon={<DataVisIcon />}
            title="Smart Investing"
            balance="$475.26"
            gainAmount="$34.80"
            gainPct="+7.9%"
            chart={<InvestingSparkline />}
            delay={d2}
          />
        </div>
      </motion.div>

      {/* Spacer so content doesn't hide behind nav */}
      <div style={{ height: NAV_HEIGHT + insets.bottom, flexShrink: 0 }} />

      {/* Bottom stack: banner sits 12px above the nav, both anchored to bottom: 0 */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        <AnimatePresence>
          {bannerVisible && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ ...framerFromDef(MotionTransitions.slideIn.steady1), delay: d2 }}
              style={{ paddingLeft: Spacing.S, paddingRight: Spacing.S, paddingBottom: Spacing.XS }}
            >
              <FloatingDrawBanner
                countdownLabel={countdownLabel}
                onSeeMore={() => navigate('/learn-more')}
                onDismiss={() => setBannerVisible(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom nav */}
        <div style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: `${colorRoles.background.primary}99`, borderTopLeftRadius: Radii.MODAL, borderTopRightRadius: Radii.MODAL, borderTop: `1px solid ${colorRoles.border.default}` }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: Spacing.XS, paddingLeft: Spacing.XS, paddingRight: Spacing.XS }}>
            <NavItem label="Spend"    icon={<NavSpend />} />
            <NavItem label="Plan"     icon={<NavPlan />} />
            <NavItem label="Ask Cleo" icon={<NavAskCleo />} />
            <NavItem label="Wealth"   icon={<NavWealth />} active />
            <NavItem label="Request"  icon={<NavRequest />} />
          </div>
          {insets.bottom > 0 && <div style={{ height: insets.bottom }} />}
        </div>
      </div>
    </div>
  );
};
