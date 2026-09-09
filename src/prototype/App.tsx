import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { SegmentedControl } from '../design-system/components';
import { ThemeProvider } from '../design-system/theme';
import { FRAME_PRESETS, FrameProvider, IPhoneFrame, useFrame } from '../shell';
import { contentMapGraphByIteration, screensByIteration } from './content-map';
import { DESIGN_ITERATIONS } from './designIterations';
import type { DesignIteration } from './designIterations';
import { capturePrototypeFlow, downloadFigmaExport } from './figma-export';

export const App: React.FC = () => (
  <ThemeProvider initialTheme="light">
    <FrameProvider>
      <BrowserRouter>
        <PrototypeApp />
      </BrowserRouter>
    </FrameProvider>
  </ThemeProvider>
);

const PrototypeApp: React.FC = () => {
  const [isExportingFigmaFlow, setIsExportingFigmaFlow] = useState(false);
  const [designIteration, setDesignIteration] = useState<DesignIteration>('visual');
  const navigate = useNavigate();
  const frame = useFrame();
  const framePreset = frame?.preset ?? 'medium';
  const frameSpec = frame?.spec ?? FRAME_PRESETS.medium;
  const prototypeScreens = screensByIteration[designIteration] ?? [];
  const contentMapGraph = contentMapGraphByIteration[designIteration] ?? { nodes: [], edges: [] };

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
      belowFrame={
        <SegmentedControl
          items={DESIGN_ITERATIONS}
          selectedValue={designIteration}
          onValueChange={setDesignIteration}
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
