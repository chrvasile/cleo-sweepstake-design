import { MotionDuration } from './motion';
import { MotionTransitions, type TransitionDef } from './motionTransitions';

// ─── Tab-to-tab cascade ─────────────────────────────────────────────────────

export type TabEnterCascadeDef = {
  firstFadeOnly: boolean;
  slideY: number;
  slide: TransitionDef;
  fade: TransitionDef;
  firstStagger: number;
  stagger: number;
  startDelay: number;
};

export const TabEnterCascade = {
  firstFadeOnly: true,
  slideY: 36,
  slide: MotionTransitions.slideIn.steady1,
  fade: MotionTransitions.fadeIn.swift2,
  firstStagger: MotionDuration.swift1,
  stagger: MotionDuration.instant,
  startDelay: MotionDuration.swift2,
} as const satisfies TabEnterCascadeDef;

// ─── FSM — maintain context ─────────────────────────────────────────────────

export type FullscreenModalMaintainContextDef = {
  sourceEnter: TransitionDef;
  sourceExit: TransitionDef;
  backdropEnter: TransitionDef;
  backdropExit: TransitionDef;
  panelEnter: TransitionDef;
  panelExit: TransitionDef;
  contentEnter: TransitionDef;
  contentExit: TransitionDef;
  contentEnterDelay: number;
};

export const FullscreenModalMaintainContext = {
  sourceEnter: MotionTransitions.slideIn.steady2,
  sourceExit: MotionTransitions.slide.steady2,
  backdropEnter: MotionTransitions.fadeIn.swift2,
  backdropExit: MotionTransitions.fadeOut.steady1,
  panelEnter: MotionTransitions.fadeIn.swift2,
  panelExit: MotionTransitions.fadeOut.steady1,
  contentEnter: MotionTransitions.fadeIn.steady1,
  contentExit: MotionTransitions.fadeOut.swift2,
  contentEnterDelay: MotionDuration.steady2,
} as const satisfies FullscreenModalMaintainContextDef;

// ─── FSM — container transform → new context ────────────────────────────────

export type FullscreenModalContainerTransformNewDef = {
  panelEnter: TransitionDef;
  panelExit: TransitionDef;
  sourceContentExit: TransitionDef;
  backdropEnter: TransitionDef;
  backdropExit: TransitionDef;
  contentEnter: TransitionDef;
  contentExit: TransitionDef;
  contentEnterDelay: number;
};

export const FullscreenModalContainerTransformNew = {
  panelEnter: MotionTransitions.slide.steady2,
  panelExit: MotionTransitions.slide.steady1,
  sourceContentExit: MotionTransitions.fadeOut.swift1,
  backdropEnter: MotionTransitions.fadeIn.swift2,
  backdropExit: MotionTransitions.fadeOut.swift1,
  contentEnter: MotionTransitions.fadeIn.swift2,
  contentExit: MotionTransitions.fadeOut.swift2,
  contentEnterDelay: MotionDuration.steady2,
} as const satisfies FullscreenModalContainerTransformNewDef;

// ─── FSM — container transform → keep context ──────────────────────────────

export type FullscreenModalContainerTransformKeepDef = {
  panelEnter: TransitionDef;
  panelExit: TransitionDef;
  sourceContentExit: TransitionDef;
  sourceContentEnter: TransitionDef;
  sourceContentEnterAt: number;
  backdropEnter: TransitionDef;
  backdropExit: TransitionDef;
  backdropExitAt: number;
  contentEnter: TransitionDef;
  contentExit: TransitionDef;
  contentEnterDelay: number;
  headingSwapAt: number;
  headingExitAt: number;
};

export const FullscreenModalContainerTransformKeep = {
  panelEnter: MotionTransitions.slide.steady2,
  panelExit: MotionTransitions.slide.steady2,
  sourceContentExit: MotionTransitions.fadeOut.swift1,
  sourceContentEnter: MotionTransitions.fadeIn.steady1,
  sourceContentEnterAt: MotionDuration.steady2,
  backdropEnter: MotionTransitions.fadeIn.swift2,
  backdropExit: MotionTransitions.fadeOut.swift2,
  backdropExitAt: MotionDuration.steady1,
  contentEnter: MotionTransitions.fadeIn.steady1,
  contentExit: MotionTransitions.fadeOut.swift2,
  contentEnterDelay: MotionDuration.steady1,
  headingSwapAt: MotionDuration.swift2,
  headingExitAt: MotionDuration.swift2,
} as const satisfies FullscreenModalContainerTransformKeepDef;
