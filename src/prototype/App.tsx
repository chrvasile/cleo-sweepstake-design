import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
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
    whileHover={{ scale: 1.04, backgroundColor: colorRoles.background.tertiary }}
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

const PrototypeApp: React.FC = () => {
  const [isExportingFigmaFlow, setIsExportingFigmaFlow] = useState(false);
  const [selectedDate, setSelectedDate] = useState<DateGroup>('sep16');
  const [designIteration, setDesignIteration] = useState<DesignIteration>(DEFAULT_ITERATION_BY_DATE['sep16']);
  const navigate = useNavigate();
  const frame = useFrame();
  const framePreset = frame?.preset ?? 'medium';
  const frameSpec = frame?.spec ?? FRAME_PRESETS.medium;
  const prototypeScreens = screensByIteration[designIteration] ?? [];
  const contentMapGraph = contentMapGraphByIteration[designIteration] ?? { nodes: [], edges: [] };

  const handleDateChange = (date: DateGroup) => {
    const newIteration = DEFAULT_ITERATION_BY_DATE[date];
    setSelectedDate(date);
    setDesignIteration(newIteration);
    const firstScreen = screensByIteration[newIteration]?.[0];
    if (firstScreen) navigate(firstScreen.routePath);
  };

  const handleTriggerDidntWin = () => {
    navigate('/savings', { state: { triggerOverlay: 'didnt-win' } });
  };

  const handleTriggerWon = () => {
    navigate('/savings', { state: { triggerOverlay: 'won' } });
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
      rightOfFrame={
        <>
          <OverlayTriggerButton label="Won" onClick={handleTriggerWon} />
          <OverlayTriggerButton label="Didn't win" onClick={handleTriggerDidntWin} />
          <OverlayTriggerButton label="Learn More" onClick={() => navigate('/learn-more')} />
        </>
      }
      aboveFrame={
        <SegmentedControl
          items={DATE_GROUPS}
          selectedValue={selectedDate}
          onValueChange={handleDateChange}
        />
      }
      belowFrame={
        <SegmentedControl
          items={ITERATIONS_BY_DATE[selectedDate]}
          selectedValue={designIteration}
          onValueChange={(iteration) => {
            setDesignIteration(iteration);
            const firstScreen = screensByIteration[iteration]?.[0];
            if (firstScreen) navigate(firstScreen.routePath);
          }}
        />
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
