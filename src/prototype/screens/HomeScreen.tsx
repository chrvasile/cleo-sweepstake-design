import React from 'react';
import { config } from '../../config';
import { useFrame, useSafeArea } from '../../shell';
import type { ContentMapScreenMetadata } from '../content-map/types';
import { FigmaSpacer, FigmaStack, FigmaText, semanticDimension } from '../figma-export';
import { Spacing } from '../../design-system/tokens';

export const contentMap: ContentMapScreenMetadata = {
  id: 'home',
  routePath: '/',
  label: 'Home',
  context: 'Template start',
  status: 'done',
  heading: config.appName,
  subhead: 'Start prompting to build your prototype.',
  order: 0,
  column: 0,
};

const CHROME_LABELS: Record<'notch' | 'island' | 'punch-hole', string> = {
  notch: 'notch',
  island: 'Dynamic Island',
  'punch-hole': 'punch-hole camera',
};

export const HomeScreen: React.FC = () => {
  const insets = useSafeArea();
  const frame = useFrame();
  const chromeLabel = CHROME_LABELS[frame?.spec.chrome ?? 'island'];
  return (
    <FigmaStack
      name="Home screen"
      height="fill"
      gap="XXS"
      align="start"
      backgroundRole="primary"
      padding={{
        top: semanticDimension(insets.top + Spacing.S, 'safeAreaTop + Spacing.S'),
        right: semanticDimension(Spacing.M, 'Spacing.M', 'Spacing.M'),
        bottom: semanticDimension(insets.bottom + Spacing.S, 'safeAreaBottom + Spacing.S'),
        left: semanticDimension(Spacing.M, 'Spacing.M', 'Spacing.M'),
      }}
    >
      <FigmaSpacer name="Top flexible spacer" />
      <FigmaText name="App name" type="display" size="L" colorRole="primary">
        {config.appName}
      </FigmaText>
      <FigmaText name="Start prompt" type="body" size="L" colorRole="secondary">
        Start prompting to build your prototype.
      </FigmaText>
      <FigmaSpacer name="Bottom flexible spacer" />
      <FigmaText name="Gallery instruction" type="body" size="S" colorRole="tertiary">
        {`Double-tap the ${chromeLabel} to open the design system gallery. Long-press it to change the viewport.`}
      </FigmaText>
    </FigmaStack>
  );
};
