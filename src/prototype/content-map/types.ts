import type React from 'react';

export type ContentMapStatus = 'done' | 'todo' | 'external';

export type ContentMapOption = {
  code: string;
  label: string;
  to?: string;
};

export type ContentMapScreenMetadata = {
  id?: string;
  routePath?: string;
  label?: string;
  context?: string;
  status?: ContentMapStatus;
  heading?: string;
  subhead?: string;
  body?: string[];
  note?: string;
  order?: number;
  column?: number;
  options?: ContentMapOption[];
};

export type PrototypeScreen = {
  id: string;
  routePath: string;
  label: string;
  order: number;
  Component: React.ComponentType;
  contentMap: ContentMapScreenMetadata;
};

export type ContentMapNode = {
  id: string;
  routePath: string;
  label: string;
  context: string;
  status: ContentMapStatus;
  heading?: string;
  subhead?: string;
  body?: string[];
  note?: string;
  order: number;
  column?: number;
  options: ContentMapOption[];
};

export type ContentMapEdge = {
  from: string;
  to: string;
  label?: string;
};

export type ContentMapGraph = {
  nodes: ContentMapNode[];
  edges: ContentMapEdge[];
};
