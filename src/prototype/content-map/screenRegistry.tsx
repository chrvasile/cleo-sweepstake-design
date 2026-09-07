import type React from 'react';
import type { ContentMapEdge, ContentMapGraph, ContentMapScreenMetadata, PrototypeScreen } from './types';

type ScreenModule = {
  default?: React.ComponentType;
  contentMap?: ContentMapScreenMetadata;
  [key: string]: unknown;
};

const screenModules = import.meta.glob<ScreenModule>('../screens/**/*.tsx', { eager: true });

const HOME_SCREEN_NAME = 'HomeScreen';
const SCREEN_SUFFIX = 'Screen';
const WORD_BOUNDARY = /([a-z0-9])([A-Z])/g;
const NON_WORD = /[^a-z0-9]+/gi;
const DASH_BOUNDARY = /(^-|-$)/g;

const toKebab = (value: string) =>
  value
    .replace(WORD_BOUNDARY, '$1-$2')
    .replace(NON_WORD, '-')
    .replace(DASH_BOUNDARY, '')
    .toLowerCase();

const toTitle = (value: string) =>
  value
    .replace(WORD_BOUNDARY, '$1 $2')
    .replace(NON_WORD, ' ')
    .trim();

const getScreenName = (modulePath: string) => {
  const fileName = modulePath.split('/').pop() ?? modulePath;
  return fileName.replace(/\.tsx$/, '');
};

// Screens live one level deeper now, under a design-iteration folder
// (e.g. `../screens/visual/SavingsScreen.tsx`) — that leading segment is the
// iteration key, not part of the screen's own name, so id/route inference
// below ignores it.
const getRelativeSegments = (modulePath: string) =>
  modulePath.replace('../screens/', '').replace(/\.tsx$/, '').split('/');

const getIterationKey = (modulePath: string) => getRelativeSegments(modulePath)[0] ?? modulePath;

const getScreenSegments = (modulePath: string) => {
  const segments = getRelativeSegments(modulePath);
  const withoutIteration = segments.length > 1 ? segments.slice(1) : segments;
  return withoutIteration.map((segment) => segment.replace(new RegExp(`${SCREEN_SUFFIX}$`), ''));
};

const getInferredId = (modulePath: string) => toKebab(getScreenSegments(modulePath).join('-'));

const getInferredRoutePath = (modulePath: string) => {
  const screenName = getScreenName(modulePath);
  if (screenName === HOME_SCREEN_NAME) return '/';
  const routeSegments = getScreenSegments(modulePath).map(toKebab).filter(Boolean);
  return `/${routeSegments.join('/')}`;
};

const getNamedComponent = (module: ScreenModule, screenName: string): React.ComponentType | undefined => {
  const candidate = module.default ?? module[screenName];
  return typeof candidate === 'function' ? (candidate as React.ComponentType) : undefined;
};

const routeRank = (routePath: string) => (routePath === '/' ? '' : routePath);

const explicitEdges = (screens: PrototypeScreen[]): ContentMapEdge[] =>
  screens.flatMap((screen) =>
    (screen.contentMap.options ?? [])
      .filter((option) => option.to != null)
      .map((option) => ({
        from: screen.id,
        to: option.to as string,
        label: option.label,
      })),
  );

const screensByIterationMutable: Record<string, PrototypeScreen[]> = {};

for (const [modulePath, module] of Object.entries(screenModules)) {
  const screenName = getScreenName(modulePath);
  const Component = getNamedComponent(module, screenName);
  if (!Component) continue;

  const iterationKey = getIterationKey(modulePath);
  const contentMap = module.contentMap ?? {};
  const id = contentMap.id ?? getInferredId(modulePath);
  const routePath = contentMap.routePath ?? getInferredRoutePath(modulePath);
  const label = contentMap.label ?? toTitle(screenName.replace(new RegExp(`${SCREEN_SUFFIX}$`), ''));

  const screen: PrototypeScreen = {
    id,
    routePath,
    label,
    order: contentMap.order ?? Number.MAX_SAFE_INTEGER,
    Component,
    contentMap,
  };

  (screensByIterationMutable[iterationKey] ??= []).push(screen);
}

for (const screens of Object.values(screensByIterationMutable)) {
  screens.sort((a, b) => a.order - b.order || routeRank(a.routePath).localeCompare(routeRank(b.routePath)));
}

/** Every prototype screen, grouped by design-iteration folder under `screens/`. */
export const screensByIteration: Record<string, PrototypeScreen[]> = screensByIterationMutable;

/** Content-map graph per design iteration, built from that iteration's screens only. */
export const contentMapGraphByIteration: Record<string, ContentMapGraph> = Object.fromEntries(
  Object.entries(screensByIterationMutable).map(([iterationKey, screens]) => [
    iterationKey,
    {
      nodes: screens.map((screen) => ({
        id: screen.id,
        routePath: screen.routePath,
        label: screen.label,
        context: screen.contentMap.context ?? screen.label,
        status: screen.contentMap.status ?? 'done',
        heading: screen.contentMap.heading,
        subhead: screen.contentMap.subhead,
        body: screen.contentMap.body,
        note: screen.contentMap.note,
        order: screen.order,
        column: screen.contentMap.column,
        options: screen.contentMap.options ?? [],
      })),
      edges: explicitEdges(screens),
    },
  ]),
);
