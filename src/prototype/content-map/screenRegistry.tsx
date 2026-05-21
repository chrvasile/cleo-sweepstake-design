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

const getScreenSegments = (modulePath: string) =>
  modulePath
    .replace('../screens/', '')
    .replace(/\.tsx$/, '')
    .split('/')
    .map((segment) => segment.replace(new RegExp(`${SCREEN_SUFFIX}$`), ''));

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

export const prototypeScreens: PrototypeScreen[] = Object.entries(screenModules)
  .map(([modulePath, module]) => {
    const screenName = getScreenName(modulePath);
    const Component = getNamedComponent(module, screenName);
    if (!Component) return null;

    const contentMap = module.contentMap ?? {};
    const id = contentMap.id ?? getInferredId(modulePath);
    const routePath = contentMap.routePath ?? getInferredRoutePath(modulePath);
    const label = contentMap.label ?? toTitle(screenName.replace(new RegExp(`${SCREEN_SUFFIX}$`), ''));

    return {
      id,
      routePath,
      label,
      order: contentMap.order ?? Number.MAX_SAFE_INTEGER,
      Component,
      contentMap,
    };
  })
  .filter((screen): screen is PrototypeScreen => screen != null)
  .sort((a, b) => a.order - b.order || routeRank(a.routePath).localeCompare(routeRank(b.routePath)));

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

export const contentMapGraph: ContentMapGraph = {
  nodes: prototypeScreens.map((screen) => ({
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
  edges: explicitEdges(prototypeScreens),
};
