import React, { useState } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { SegmentedControl } from '../design-system/components';
import { ThemeProvider } from '../design-system/theme';
import { FRAME_PRESETS, FrameProvider, IPhoneFrame, useFrame } from '../shell';
import { ContentMapOverlay, contentMapGraphByIteration, screensByIteration } from './content-map';
import { DESIGN_ITERATIONS } from './designIterations';
import type { DesignIteration } from './designIterations';
import { capturePrototypeFlow, downloadFigmaExport } from './figma-export';

export const App: React.FC = () => (
  <ThemeProvider initialTheme="auto">
    <FrameProvider>
      <BrowserRouter>
        <PrototypeApp />
      </BrowserRouter>
    </FrameProvider>
  </ThemeProvider>
);

const PrototypeApp: React.FC = () => {
  const [contentMapOpen, setContentMapOpen] = useState(false);
  const [isExportingFigmaFlow, setIsExportingFigmaFlow] = useState(false);
  const [designIteration, setDesignIteration] = useState<DesignIteration>('visual');
  const navigate = useNavigate();
  const frame = useFrame();
  const framePreset = frame?.preset ?? 'medium';
  const frameSpec = frame?.spec ?? FRAME_PRESETS.medium;
  const prototypeScreens = screensByIteration[designIteration] ?? [];
  const contentMapGraph = contentMapGraphByIteration[designIteration] ?? { nodes: [], edges: [] };
  const contentMapAvailable = contentMapGraph.nodes.length >= 2 && contentMapGraph.edges.length > 0;

  const handleNavigateToRoute = (routePath: string) => {
    navigate(routePath);
    setContentMapOpen(false);
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
    <>
      <IPhoneFrame
        contentMapAvailable={contentMapAvailable}
        isExportingFigmaFlow={isExportingFigmaFlow}
        onExportFigmaFlow={handleExportFigmaFlow}
        onOpenContentMap={() => setContentMapOpen(true)}
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
      <ContentMapOverlay
        graph={contentMapGraph}
        open={contentMapOpen}
        onClose={() => setContentMapOpen(false)}
        onNavigateToRoute={handleNavigateToRoute}
      />
    </>
  );
};
