import type { Transition } from 'framer-motion';

import { MotionDuration, MotionEasing, msToSeconds } from './motion';
import {
  AlertModalTransitions,
  BottomDrawerTransitions,
  framerFromDef,
  FullscreenModalTransitions,
  MotionTransitions,
} from './motionTransitions';

export const duration = {
  stack: msToSeconds(MotionDuration.steady2),
  modal: msToSeconds(MotionDuration.steady2),
  skeletonFade: msToSeconds(MotionDuration.slow1),
  sheet: msToSeconds(MotionDuration.steady1),
  alert: msToSeconds(MotionDuration.steady1),
} as const;

export const bezier = {
  standard: MotionEasing.ease,
  emphasized: MotionEasing.easeInOut,
  modal: MotionEasing.easeOut,
  sheet: MotionEasing.easeIn,
} as const;

export function stackTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return { duration: duration.stack, ease: bezier.standard };
}

export function tabEnterTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.1, ease: 'linear' };
  return framerFromDef(MotionTransitions.fadeIn.steady1);
}

export function tabExitTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.1, ease: 'linear' };
  return framerFromDef(MotionTransitions.fadeOut.swift1);
}

export function modalTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(MotionTransitions.slideIn.steady1);
}

export function sheetTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.18, ease: 'linear' };
  return { duration: duration.sheet, ease: bezier.sheet };
}

export function bottomDrawerBackdropEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(BottomDrawerTransitions.backdrop.enter);
}

export function bottomDrawerBackdropExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(BottomDrawerTransitions.backdrop.exit);
}

export function bottomDrawerPanelEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.18, ease: 'linear' };
  return framerFromDef(BottomDrawerTransitions.panel.scaleEnter);
}

export function bottomDrawerPanelExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.18, ease: 'linear' };
  return framerFromDef(BottomDrawerTransitions.panel.exit);
}

export function bottomDrawerContentEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0 };
  return {
    ...framerFromDef(BottomDrawerTransitions.content.enter),
    delay: msToSeconds(BottomDrawerTransitions.content.enterDelay),
  };
}

export function bottomDrawerContentExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0 };
  return framerFromDef(BottomDrawerTransitions.content.exit);
}

// ─── Fullscreen modal adapters ───────────────────────────────────────────────

export function fullscreenModalBackdropEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(FullscreenModalTransitions.backdrop.enter);
}

export function fullscreenModalBackdropExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(FullscreenModalTransitions.backdrop.exit);
}

export function fullscreenModalPanelEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return {
    x: framerFromDef(FullscreenModalTransitions.panel.slideEnter),
    opacity: framerFromDef(FullscreenModalTransitions.panel.fadeEnter),
  };
}

export function fullscreenModalPanelExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return {
    x: framerFromDef(FullscreenModalTransitions.panel.slideExit),
    opacity: framerFromDef(FullscreenModalTransitions.panel.fadeExit),
  };
}

export function fullscreenModalUnderlyingEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0 };
  return framerFromDef(FullscreenModalTransitions.underlying.slideEnter);
}

export function fullscreenModalUnderlyingExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0 };
  return framerFromDef(FullscreenModalTransitions.underlying.slideExit);
}

// ─── Alert modal adapters ────────────────────────────────────────────────────

export function alertModalBackdropEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(AlertModalTransitions.backdrop.enter);
}

export function alertModalBackdropExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(AlertModalTransitions.backdrop.exit);
}

export function alertModalPanelEnter(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  const delay = msToSeconds(AlertModalTransitions.panel.enterDelay);
  return {
    scale: { ...framerFromDef(AlertModalTransitions.panel.scaleEnter), delay },
    opacity: { ...framerFromDef(AlertModalTransitions.panel.fadeEnter), delay },
  };
}

export function alertModalPanelExit(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return framerFromDef(AlertModalTransitions.panel.fadeExit);
}

export function alertTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.12, ease: 'linear' };
  return { duration: duration.alert, ease: bezier.modal };
}
