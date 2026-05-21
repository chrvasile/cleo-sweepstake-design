import React, { useId, useLayoutEffect, useMemo } from 'react';
import { Button, Typography } from '../../design-system/components';
import type { ButtonProps } from '../../design-system/components';
import type { ButtonSize, ButtonVariant } from '../../design-system/components/Button/types';
import {
  Spacing,
  colorRoles,
  typographyDefaultWeights,
} from '../../design-system/tokens';
import type {
  BackgroundRole,
  ContentRole,
  SpacingToken,
  TypographySize,
  TypographyType,
  TypographyWeightName,
} from '../../design-system/tokens';
import {
  SEMANTIC_NODE_ATTRIBUTE,
  registerSemanticNode,
  unregisterSemanticNode,
} from './semanticRegistry';
import type {
  FigmaSemanticDimension,
  FigmaSemanticNodeDefinition,
  FigmaSemanticSizing,
} from './types';

type SemanticPaddingInput = {
  top?: FigmaSemanticDimension;
  right?: FigmaSemanticDimension;
  bottom?: FigmaSemanticDimension;
  left?: FigmaSemanticDimension;
};

type StackProps = {
  name: string;
  direction?: 'vertical' | 'horizontal';
  gap?: SpacingToken;
  padding?: SemanticPaddingInput;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  backgroundRole?: BackgroundRole;
  width?: FigmaSemanticSizing;
  height?: FigmaSemanticSizing;
  children: React.ReactNode;
};

type SpacerProps = {
  name?: string;
  grow?: number;
};

type SemanticTextProps = {
  name: string;
  type: TypographyType;
  size: TypographySize;
  colorRole?: ContentRole;
  weight?: TypographyWeightName;
  width?: FigmaSemanticSizing;
  children: string;
};

type SemanticButtonProps = Pick<
  ButtonProps,
  'label' | 'onPress' | 'size' | 'variant' | 'theme' | 'startIcon' | 'endIcon' | 'fullWidth'
> & {
  name: string;
};

const ALIGN_ITEMS = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
} as const;

const JUSTIFY_CONTENT = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
} as const;

const useSemanticId = (prefix: string) => {
  const id = useId().replace(/[^a-z0-9_-]/gi, '');
  return `${prefix}-${id}`;
};

const dimensionFromToken = (token: SpacingToken): FigmaSemanticDimension => ({
  value: Spacing[token],
  token: `Spacing.${token}`,
});

export const semanticDimension = (
  value: number,
  expression: string,
  token?: string,
): FigmaSemanticDimension => ({
  value,
  expression,
  token,
});

const edgeValue = (edge?: FigmaSemanticDimension) => (edge ? edge.value : undefined);

const register = (definition: FigmaSemanticNodeDefinition) => {
  registerSemanticNode(definition);
  return () => unregisterSemanticNode(definition.id);
};

export const FigmaStack: React.FC<StackProps> = ({
  name,
  direction = 'vertical',
  gap,
  padding,
  align = 'stretch',
  justify = 'start',
  backgroundRole,
  width = 'fill',
  height = 'hug',
  children,
}) => {
  const id = useSemanticId('stack');
  const gapDimension = gap ? dimensionFromToken(gap) : undefined;
  const definition = useMemo<FigmaSemanticNodeDefinition>(
    () => ({
      id,
      kind: 'stack',
      name,
      layout: {
        direction,
        gap: gapDimension,
        padding,
        align,
        justify,
        width,
        height,
      },
      visual: backgroundRole ? { backgroundRole } : undefined,
    }),
    [align, backgroundRole, direction, gapDimension, height, id, justify, name, padding, width],
  );

  useLayoutEffect(() => register(definition), [definition]);

  return (
    <div
      {...{ [SEMANTIC_NODE_ATTRIBUTE]: id }}
      style={{
        width: width === 'fill' ? '100%' : undefined,
        height: height === 'fill' ? '100%' : undefined,
        display: 'flex',
        flexDirection: direction === 'vertical' ? 'column' : 'row',
        alignItems: ALIGN_ITEMS[align],
        justifyContent: JUSTIFY_CONTENT[justify],
        gap: gapDimension?.value,
        paddingTop: edgeValue(padding?.top),
        paddingRight: edgeValue(padding?.right),
        paddingBottom: edgeValue(padding?.bottom),
        paddingLeft: edgeValue(padding?.left),
        backgroundColor: backgroundRole ? colorRoles.background[backgroundRole] : undefined,
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
};

export const FigmaSpacer: React.FC<SpacerProps> = ({ name = 'Spacer', grow = 1 }) => {
  const id = useSemanticId('spacer');
  const definition = useMemo<FigmaSemanticNodeDefinition>(
    () => ({
      id,
      kind: 'spacer',
      name,
      layout: {
        grow,
        width: 'fill',
        height: 'fill',
      },
    }),
    [grow, id, name],
  );

  useLayoutEffect(() => register(definition), [definition]);

  return (
    <div
      {...{ [SEMANTIC_NODE_ATTRIBUTE]: id }}
      style={{
        flex: grow,
        minHeight: 0,
        minWidth: 0,
      }}
    />
  );
};

export const FigmaText: React.FC<SemanticTextProps> = ({
  name,
  type,
  size,
  colorRole = 'primary',
  weight,
  width = 'fill',
  children,
}) => {
  const id = useSemanticId('text');
  const resolvedWeight = weight ?? typographyDefaultWeights[type];
  const definition = useMemo<FigmaSemanticNodeDefinition>(
    () => ({
      id,
      kind: 'text',
      name,
      text: {
        value: children,
        type,
        size,
        weight: resolvedWeight,
        colorRole,
        width,
      },
      layout: {
        width,
        height: 'hug',
      },
      visual: {
        contentRole: colorRole,
      },
    }),
    [children, colorRole, id, name, resolvedWeight, size, type, width],
  );

  useLayoutEffect(() => register(definition), [definition]);

  return (
    <span
      {...{ [SEMANTIC_NODE_ATTRIBUTE]: id }}
      style={{
        display: 'block',
        width: width === 'fill' ? '100%' : undefined,
      }}
    >
      <Typography
        type={type}
        size={size}
        weight={weight}
        color={colorRoles.content[colorRole]}
      >
        {children}
      </Typography>
    </span>
  );
};

export const FigmaButton: React.FC<SemanticButtonProps> = ({
  name,
  label,
  onPress,
  size = 'M',
  variant = 'primary',
  theme,
  startIcon,
  endIcon,
  fullWidth = false,
}) => {
  const id = useSemanticId('button');
  const width = fullWidth ? 'fill' : 'hug';
  const definition = useMemo<FigmaSemanticNodeDefinition>(
    () => ({
      id,
      kind: 'button',
      name,
      button: {
        label,
        size: size as ButtonSize,
        variant: variant as ButtonVariant,
        width,
      },
      layout: {
        width,
        height: 'hug',
      },
    }),
    [id, label, name, size, variant, width],
  );

  useLayoutEffect(() => register(definition), [definition]);

  return (
    <div
      {...{ [SEMANTIC_NODE_ATTRIBUTE]: id }}
      style={{
        width: fullWidth ? '100%' : undefined,
        display: fullWidth ? 'block' : 'inline-flex',
      }}
    >
      <Button
        label={label}
        onPress={onPress}
        size={size}
        variant={variant}
        theme={theme}
        startIcon={startIcon}
        endIcon={endIcon}
        fullWidth={fullWidth}
      />
    </div>
  );
};

export type { SemanticPaddingInput };
