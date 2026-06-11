import { MotionDuration, MotionEasing, msToSeconds, type BezierTuple } from './motion';

export type TransitionDef = {
  ease: BezierTuple;
  durationMs: number;
};

export type MotionGroup =
  | 'hide'
  | 'fadeIn'
  | 'fadeOut'
  | 'scale'
  | 'scaleIn'
  | 'scaleOut'
  | 'slide'
  | 'slideIn'
  | 'slideOut';

/** Preset duration + easing pairs (same structure as native MotionTransitions). */
export const MotionTransitions = {
  hide: {
    instant: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.instant,
    },
  },
  fadeIn: {
    swift1: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.swift1,
    },
    swift2: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.steady1,
    },
  },
  fadeOut: {
    swift1: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.swift1,
    },
    swift2: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.linear,
      durationMs: MotionDuration.steady2,
    },
  },
  scale: {
    swift2: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.slow1,
    },
  },
  scaleIn: {
    swift2: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.slow1,
    },
  },
  scaleOut: {
    swift2: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.slow1,
    },
  },
  slide: {
    swift2: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeInOut,
      durationMs: MotionDuration.slow1,
    },
  },
  slideIn: {
    swift1: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.swift1,
    },
    swift2: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.slow1,
    },
    slow2: {
      ease: MotionEasing.easeOut,
      durationMs: MotionDuration.slow2,
    },
  },
  slideOut: {
    swift1: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.swift1,
    },
    swift2: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.swift2,
    },
    steady1: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.steady1,
    },
    steady2: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.steady2,
    },
    slow1: {
      ease: MotionEasing.easeIn,
      durationMs: MotionDuration.slow1,
    },
  },
} as const satisfies Record<MotionGroup, Record<string, TransitionDef>>;

/** Convert a TransitionDef to a Framer Motion transition object. */
export function framerFromDef(def: TransitionDef): { duration: number; ease: BezierTuple } {
  return {
    duration: msToSeconds(def.durationMs),
    ease: def.ease,
  };
}

// ─── Semantic enter token groups ─────────────────────────────────────────────

export type TextEnterDef = {
  rowSlideY: number;
  row: TransitionDef;
  wordSlideY: number;
  word: TransitionDef;
  wordStagger: number;
};

export type BodyListEnterDef = {
  rowStagger: number;
};

export const EnterTransitions = {
  text: {
    rowSlideY: 16,
    row: MotionTransitions.slideIn.swift2,
    wordSlideY: 12,
    word: MotionTransitions.slideIn.steady1,
    wordStagger: MotionDuration.swift1,
  } satisfies TextEnterDef,
  bodyList: {
    rowStagger: 1500,
  } satisfies BodyListEnterDef,
} as const;

// ─── Semantic exit token groups ───────────────────────────────────────────────

export type TextExitDef = {
  slideY: number;
  slide: TransitionDef;
  fade: TransitionDef;
  fadeDelay: number;
};

export type BodyListExitDef = {
  slideY: number;
  slide: TransitionDef;
  rowStagger: number;
};

export const ExitTransitions = {
  text: {
    slideY: -16,
    slide: MotionTransitions.slideOut.steady1,
    fade: MotionTransitions.fadeOut.swift2,
    fadeDelay: MotionDuration.swift2,
  } satisfies TextExitDef,
  bodyList: {
    slideY: -32,
    slide: MotionTransitions.slideOut.slow1,
    rowStagger: MotionDuration.swift1,
  } satisfies BodyListExitDef,
} as const;

// ─── Bottom drawer transition tokens ─────────────────────────────────────────

export type BottomDrawerBackdropDef = {
  enter: TransitionDef;
  exit: TransitionDef;
};

export type BottomDrawerPanelDef = {
  scaleFrom: number;
  scaleTo: number;
  slideY: number;
  scaleEnter: TransitionDef;
  slideEnter: TransitionDef;
  exit: TransitionDef;
};

export type BottomDrawerContentDef = {
  enterDelay: number;
  enter: TransitionDef;
  exit: TransitionDef;
};

export const BottomDrawerTransitions = {
  backdrop: {
    enter: MotionTransitions.fadeIn.swift2,
    exit: MotionTransitions.fadeOut.steady1,
  } satisfies BottomDrawerBackdropDef,
  panel: {
    scaleFrom: 0.85,
    scaleTo: 0.98,
    slideY: 16,
    scaleEnter: MotionTransitions.scaleIn.steady1,
    slideEnter: MotionTransitions.slideIn.steady1,
    exit: MotionTransitions.scaleOut.steady1,
  } satisfies BottomDrawerPanelDef,
  content: {
    enterDelay: MotionDuration.swift1,
    enter: MotionTransitions.fadeIn.swift1,
    exit: MotionTransitions.fadeOut.steady1,
  } satisfies BottomDrawerContentDef,
} as const;

// ─── Fullscreen modal transition tokens ──────────────────────────────────────

export type FullscreenModalBackdropDef = {
  enter: TransitionDef;
  exit: TransitionDef;
};

export type FullscreenModalPanelDef = {
  slideX: string;
  slideEnter: TransitionDef;
  slideExit: TransitionDef;
  fadeEnter: TransitionDef;
  fadeExit: TransitionDef;
};

export type FullscreenModalUnderlyingDef = {
  slideX: string;
  slideEnter: TransitionDef;
  slideExit: TransitionDef;
};

export const FullscreenModalTransitions = {
  backdrop: {
    enter: MotionTransitions.fadeIn.swift2,
    exit: MotionTransitions.fadeOut.swift1,
  } satisfies FullscreenModalBackdropDef,
  panel: {
    slideX: '50%',
    slideEnter: MotionTransitions.slideIn.steady2,
    slideExit: MotionTransitions.slideOut.steady1,
    fadeEnter: MotionTransitions.fadeIn.swift2,
    fadeExit: MotionTransitions.fadeOut.swift2,
  } satisfies FullscreenModalPanelDef,
  underlying: {
    slideX: '-25%',
    slideEnter: MotionTransitions.slideOut.steady2,
    slideExit: MotionTransitions.slideIn.steady1,
  } satisfies FullscreenModalUnderlyingDef,
} as const;

// ─── Alert modal transition tokens ───────────────────────────────────────────

export type AlertModalBackdropDef = {
  enter: TransitionDef;
  exit: TransitionDef;
};

export type AlertModalPanelDef = {
  scaleFrom: number;
  enterDelay: number;
  scaleEnter: TransitionDef;
  fadeEnter: TransitionDef;
  fadeExit: TransitionDef;
};

export const AlertModalTransitions = {
  backdrop: {
    enter: MotionTransitions.fadeIn.swift2,
    exit: MotionTransitions.fadeOut.swift1,
  } satisfies AlertModalBackdropDef,
  panel: {
    scaleFrom: 0.85,
    enterDelay: MotionDuration.swift1,
    scaleEnter: MotionTransitions.scaleIn.swift2,
    fadeEnter: MotionTransitions.fadeIn.swift2,
    fadeExit: MotionTransitions.fadeOut.swift2,
  } satisfies AlertModalPanelDef,
} as const;

// ─── Dismiss card transition tokens ──────────────────────────────────────────

export type DismissCardDef = {
  cardFade: TransitionDef;
  reflowSlide: TransitionDef;
  reflowDelay: number;
};

export const DismissCardTransitions = {
  cardFade: MotionTransitions.fadeOut.swift2,
  reflowSlide: MotionTransitions.slideIn.steady2,
  reflowDelay: MotionDuration.swift1,
} as const satisfies DismissCardDef;
