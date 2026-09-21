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

const LabelledToggle: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: Spacing.XXS, height: 32 }}>
    <span style={{
      fontFamily: fontFamilies.body,
      fontSize: typographySizeMap.S.label,
      fontWeight: fontWeights.SemiBold,
      color: colorRoles.content.primary,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
    <motion.button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={onToggle}
      whileTap={{ scale: 0.93 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: active ? colorRoles.background.accentDark : colorRoles.border.default,
        border: 'none',
        cursor: 'pointer',
        padding: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: active ? 'flex-end' : 'flex-start',
        transition: 'background-color 0.2s ease',
        flexShrink: 0,
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: colorRoles.background.primary,
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}
      />
    </motion.button>
  </div>
);

const PrototypeApp: React.FC = () => {
  const [isExportingFigmaFlow, setIsExportingFigmaFlow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateGroup>('v1');
  const [designIteration, setDesignIteration] = useState<DesignIteration>(DEFAULT_ITERATION_BY_DATE['v1']);
  const [didntWinBanner, setDidntWinBanner] = useState(false);
  const [clockVariant, setClockVariant] = useState<'classic' | 'alternating'>('classic');
  const navigate = useNavigate();
  const location = useLocation();
  const frame = useFrame();
  const framePreset = frame?.preset ?? 'medium';
  const frameSpec = frame?.spec ?? FRAME_PRESETS.medium;
  const prototypeScreens = screensByIteration[designIteration] ?? [];
  const contentMapGraph = contentMapGraphByIteration[designIteration] ?? { nodes: [], edges: [] };

  useEffect(() => { navigate('/savings'); }, []);

  const handleDateChange = (date: DateGroup) => {
    const newIteration = DEFAULT_ITERATION_BY_DATE[date];
    setSelectedDate(date);
    setDesignIteration(newIteration);
    const firstScreen = screensByIteration[newIteration]?.[0];
    if (firstScreen) navigate(firstScreen.routePath);
  };

  const handleToggleDidntWinBanner = () => {
    const next = !didntWinBanner;
    setDidntWinBanner(next);
    navigate('/savings', { state: { didntWinBanner: next } });
  };

  const handleToggleClockVariant = () => {
    const next: 'classic' | 'alternating' = clockVariant === 'classic' ? 'alternating' : 'classic';
    setClockVariant(next);
    navigate('/savings', { state: { clockVariant: next } });
  };

  const handleToggleBottomBanner = () => {
    const next = designIteration === 'v1-bottom-banner' ? 'v1' : 'v1-bottom-banner';
    setDesignIteration(next);
    navigate('/');
  };

  const handleTriggerWon = () => {
    if (selectedDate === 'v1') {
      navigate('/winner');
    } else {
      navigate('/savings', { state: { triggerOverlay: 'won' } });
    }
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
      homeIndicatorColor={location.pathname === '/winner' ? '#ffffff' : undefined}
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
            <OverlayTriggerButton label="Won" onClick={handleTriggerWon} />
            <OverlayTriggerButton label="Learn More" onClick={() => navigate('/learn-more')} />
          </div>
          <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
            <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Clock
            </span>
            <LabelledToggle label="Alt. sweep" active={clockVariant === 'alternating'} onToggle={handleToggleClockVariant} />
            <OverlayTriggerButton label="Skip to 55s" onClick={() => window.dispatchEvent(new CustomEvent('cleo:fastforward'))} />
          </div>
          <div style={{ height: 1, backgroundColor: colorRoles.border.default }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: Spacing.XXS }}>
            <span style={{ fontFamily: fontFamilies.body, fontSize: 9, fontWeight: fontWeights.SemiBold, color: colorRoles.content.tertiary, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Banners
            </span>
            <LabelledToggle label="Bottom banner" active={designIteration === 'v1-bottom-banner'} onToggle={handleToggleBottomBanner} />
            <LabelledToggle label="Didn't win" active={didntWinBanner} onToggle={handleToggleDidntWinBanner} />
          </div>
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
