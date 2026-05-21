import type { FigmaSemanticNodeDefinition } from './types';

const REGISTRY_KEY = '__CLEO_FIGMA_SEMANTIC_NODES__';

type FigmaSemanticRegistryWindow = Window & {
  [REGISTRY_KEY]?: Map<string, FigmaSemanticNodeDefinition>;
};

const getRegistry = () => {
  const target = window as FigmaSemanticRegistryWindow;
  target[REGISTRY_KEY] ??= new Map<string, FigmaSemanticNodeDefinition>();
  return target[REGISTRY_KEY];
};

export const registerSemanticNode = (definition: FigmaSemanticNodeDefinition) => {
  getRegistry().set(definition.id, definition);
};

export const unregisterSemanticNode = (id: string) => {
  getRegistry().delete(id);
};

export const getSemanticNodeDefinition = (id: string) => getRegistry().get(id);

export const SEMANTIC_NODE_ATTRIBUTE = 'data-cleo-figma-node-id';
