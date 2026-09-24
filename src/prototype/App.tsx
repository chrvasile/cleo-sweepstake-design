import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SegmentedControl } from '../design-system/components';
import { ThemeProvider } from '../design-system/theme';
import { FRAME_PRESETS, FrameProvider, IPhoneFrame, useFrame } from '../shell';
import { contentMapGraphByIteration, screensByIteration } from './content-map';
import { DATE_GROUPS, DEFAULT_ITERATION_BY_DATE, ITERATIONS_BY_DATE } from './designIterations';
import type { DateGroup, DesignIteration } from './designIterations';
import { capturePrototypeFlow, downloadFigmaExport } from './figma-export';
import { Radii, Spacing, fontFamilies, fontWeights, typographySizeMap, colorRoles } from '../design-system/tokens';

export const App: React.FC = () => (
  <ThemeProvider initialTheme="light">
    <FrameProvider>
      <BrowserRouter>
        <PrototypeApp />
      </BrowserRouter>
    </FrameProvider>
  </ThemeProvider>
);

const OverlayTriggerButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.92 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    style={{
      height: 32,
      paddingLeft: Spacing.S,
      paddingRight: Spacing.S,
      borderRadius: Radii.BUTTON,
      backgroundColor: colorRoles.background.accentLight,
      border: 'none',
      cursor: 'pointer',
      fontFamily: fontFamilies.body,
      fontSize: typographySizeMap.S.label,
      fontWeight: fontWeights.SemiBold,
      color: colorRoles.content.primary,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </motion.button>
);

const VariantChip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.93 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    style={{
      height: 28,
      paddingLeft: Spacing.XS,
      paddingRight: Spacing.XS,
      borderRadius: Radii.BUTTON,
      backgroundColor: active ? colorRoles.background.accentDark : colorRoles.background.secondary,
      border: 'none',
      cursor: 'pointer',
      fontFamily: fontFamilies.body,
      fontSize: typographySizeMap.S.label,
      fontWeight: fontWeights.SemiBold,
      color: active ? colorRoles.content.onColor : colorRoles.content.secondary,
      whiteSpace: 'nowrap',
      textAlign: 'left',
      width: '100%',
      transition: 'background-color 0.15s ease, color 0.15s ease',
    }}
  >
    {label}
  </motion.button>
);


type WealthHomeVariant = 'v1' | 'v1-bottom-banner' | 'v1-card-bottom';
type SavingsVariant = 'v1' | 'v2';
type SavingsState = 'not-entered' | 'entered' | 'hasnt-won';
type WinnerVariant = 'simple' | 'shareable';

const PrototypeApp: React.FC = () => {
  const [isExportingFigmaFlow, setIsExportingFigmaFlow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateGroup>('v1');
  const [designIteration, setDesignIteration] = useState<DesignIteration>(DEFAULT_ITERATION_BY_DATE['v1']);
  const [wealthHomeVariant, setWealthHomeVariant] = useState<WealthHomeVariant>('v1');
  const [savingsVariant, setSavingsVariant] = useState<SavingsVariant>('v1');
  const [savingsState, setSavingsState] = useState<SavingsState>('not-entered');
  const [clockVariant, setClockVariant] = useState<'classic' | 'alternating' | 'pulse'>('classic');
  const [winnerVariant, setWinnerVariant] = useState<WinnerVariant>('simple');
  const navigate = useNavigate();
  const location = useLocation();
  const frame = useFrame();
  const framePreset = frame?.preset ?? 'medium';
  const frameSpec = frame?.spec ?? FRAME_PRESETS.medium;
  const prototypeScreens = screensByIteration[designIteration] ?? [];
  const contentMapGraph = contentMapGraphByIteration[designIteration] ?? { nodes: [], edges: [] };

  useEffect(() => { navigate('/'); }, []);

  // Keep the Savings control in sync when the user navigates manually.
  useEffect(() => {
    if (location.pathname !== '/savings') return;
    const state = location.state as { depositedAmount?: number; didntWinBanner?: boolean } | null;
    if (state?.depositedAmount != null) {
      setSavingsState('entered');
    } else if (state?.didntWinBanner === true) {
      setSavingsState('hasnt-won');
    } else if (state == null || (state.depositedAmount == null && !state.didntWinBanner)) {
      setSavingsState('not-entered');
    }
  }, [location]);

  // Sync when user taps "Enter the draw" in-place (no navigation).
  useEffect(() => {
    const handler = () => setSavingsState('entered');
    window.addEventListener('cleo:savings:entered', handler);
    return () => window.removeEventListener('cleo:savings:entered', handler);
  }, []);

  const handleDateChange = (date: DateGroup) => {
    const newIteration = DEFAULT_ITERATION_BY_DATE[date];
    setSelectedDate(date);
    setDesignIteration(newIteration);
    const firstScreen = screensByIteration[newIteration]?.[0];
    if (firstScreen) navigate(firstScreen.routePath);
  };

  const handleClockVariantChange = (variant: 'classic' | 'alternating' | 'pulse') => {
    setClockVariant(variant);
    navigate('/savings', { state: { clockVariant: variant } });
  };

  const handleWealthHomeVariantChange = (variant: WealthHomeVariant) => {
    setWealthHomeVariant(variant);
    setDesignIteration(variant);
    navigate('/');
  };

  const handleSavingsVariantChange = (variant: SavingsVariant) => {
    setSavingsVariant(variant);
    setSavingsState('not-entered');
    navigate('/savings', { state: { savingsVariant: variant } });
  };

  const handleSavingsStateChange = (state: SavingsState) => {
    setSavingsState(state);
    if (state === 'not-entered') {
      navigate('/savings', { state: { savingsVariant } });
    } else if (state === 'entered') {
      navigate('/savings', { state: { depositedAmount: 50, savingsVariant } });
    } else if (state === 'hasnt-won') {
      navigate('/savings', { state: { didntWinBanner: true, savingsVariant } });
    }
  };

  const handleWinnerVariantChange = (variant: WinnerVariant) => {
    setWinnerVariant(variant);
    navigate('/winner', { state: { winnerVariant: variant } });
  };

  const handleExportFigmaFlow = async () => {
    if (isExportingFigmaFlow) return;

    setIsExportingFigmaFlow(true);

    try {
      const payload = await capturePrototypeFlow({
        graph: contentMapGraph,
        framePreset,
        frameSpec,
        navigate,
      });
      downloadFigmaExport(payload);
    } catch (error) {
      console.error('Unable to export editable Figma flow', error);
    } finally {
      setIsExportingFigmaFlow(false);
    }
  };

  return (
    <IPhoneFrame
      isExportingFigmaFlow={isExportingFigmaFlow}
      onExportFigmaFlow={handleExportFigmaFlow}
      homeIndicatorColor={['/winner', '/entered-draw', '/deposit-success'].includes(location.pathname) ? '#ffffff' : undefined}
      rightOfFrame={
        <div style={{
          backgroundColor: colorRoles.background.primary,
          borderRadius: Radii.CARD,
          padding: Spacing.S,
          display: 'flex',
          flexDirection: 'column',
          gap: Spacing.S,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          minWidth: 160,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
            <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Pages
            </span>
            <OverlayTriggerButton label="Learn More" onClick={() => navigate('/learn-more')} />
          </div>
          <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
            <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Clock
            </span>
            {([
              { value: 'classic', label: 'Standard' },
              { value: 'alternating', label: 'Alternate' },
              { value: 'pulse', label: 'Pulse' },
            ] as { value: 'classic' | 'alternating' | 'pulse'; label: string }[]).map(({ value, label }) => (
              <VariantChip
                key={value}
                label={label}
                active={clockVariant === value}
                onClick={() => handleClockVariantChange(value)}
              />
            ))}
            <OverlayTriggerButton label="Skip to 55s" onClick={() => window.dispatchEvent(new CustomEvent('cleo:fastforward'))} />
          </div>
          {selectedDate === 'v1' && (
            <>
              <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
                <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Wealth Home
                </span>
                {([
                  { value: 'v1', label: 'Card top' },
                  { value: 'v1-card-bottom', label: 'Card bottom' },
                  { value: 'v1-bottom-banner', label: 'Bottom banner' },
                ] as { value: WealthHomeVariant; label: string }[]).map(({ value, label }) => (
                  <VariantChip
                    key={value}
                    label={label}
                    active={wealthHomeVariant === value}
                    onClick={() => handleWealthHomeVariantChange(value)}
                  />
                ))}
              </div>
              <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
                <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Savings
                </span>
                {/* Variant row */}
                <div style={{ display: 'flex', gap: Spacing.XXXS }}>
                  {([
                    { value: 'v1', label: 'Var 1' },
                    { value: 'v2', label: 'Var 2' },
                  ] as { value: SavingsVariant; label: string }[]).map(({ value, label }) => (
                    <VariantChip
                      key={value}
                      label={label}
                      active={savingsVariant === value}
                      onClick={() => handleSavingsVariantChange(value)}
                    />
                  ))}
                </div>
                {/* State row */}
                {([
                  { value: 'not-entered', label: 'Not entered' },
                  { value: 'entered', label: 'Entered' },
                  { value: 'hasnt-won', label: "Hasn't won" },
                ] as { value: SavingsState; label: string }[]).map(({ value, label }) => (
                  <VariantChip
                    key={value}
                    label={label}
                    active={savingsState === value}
                    onClick={() => handleSavingsStateChange(value)}
                  />
                ))}
              </div>
              <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
                <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Winner
                </span>
                {([
                  { value: 'simple', label: 'Simple' },
                  { value: 'shareable', label: 'Shareable' },
                ] as { value: WinnerVariant; label: string }[]).map(({ value, label }) => (
                  <VariantChip
                    key={value}
                    label={label}
                    active={winnerVariant === value}
                    onClick={() => handleWinnerVariantChange(value)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      }
      aboveFrame={
        <SegmentedControl
          items={DATE_GROUPS}
          selectedValue={selectedDate}
          onValueChange={handleDateChange}
        />
      }
      belowFrame={
        ITERATIONS_BY_DATE[selectedDate].length > 1 ? (
          <SegmentedControl
            items={ITERATIONS_BY_DATE[selectedDate]}
            selectedValue={designIteration}
            onValueChange={(iteration) => {
              setDesignIteration(iteration);
              const firstScreen = screensByIteration[iteration]?.[0];
              if (firstScreen) navigate(firstScreen.routePath);
            }}
          />
        ) : undefined
      }
    >
      <Routes key={designIteration}>
        {prototypeScreens.map(({ Component, routePath }) => (
          <Route key={routePath} path={routePath} element={<Component />} />
        ))}
      </Routes>
    </IPhoneFrame>
  );
};
