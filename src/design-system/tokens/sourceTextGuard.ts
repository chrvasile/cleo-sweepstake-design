import { FullscreenModalContainerTransformKeep } from './motionTransitionsAdvanced';
import type { TransitionDef } from './motionTransitions';

export type SourceTextGuardOptions = {
  tween?: boolean;
  transition?: TransitionDef;
};

export function guardSourceTextGeometry(
  source: Element | null,
  clone: Element | null,
  options: SourceTextGuardOptions = {},
): void {
  if (!source || !clone) return;
  const {
    tween = false,
    transition = FullscreenModalContainerTransformKeep.sourceContentEnter,
  } = options;
  const count = Math.min(source.children.length, clone.children.length);
  const [c1, c2, c3, c4] = transition.ease;
  for (let i = 0; i < count; i++) {
    const sourceChild = source.children[i];
    const cloneChild = clone.children[i];
    if (!sourceChild || !cloneChild) continue;
    const from = getComputedStyle(sourceChild);
    const el = cloneChild as HTMLElement;
    el.style.fontWeight = from.fontWeight;
    el.style.letterSpacing = from.letterSpacing;
    const current = getComputedStyle(el).fontSize;
    if (tween && current !== from.fontSize) {
      el.animate([{ fontSize: current }, { fontSize: from.fontSize }], {
        duration: transition.durationMs,
        easing: `cubic-bezier(${c1}, ${c2}, ${c3}, ${c4})`,
        fill: 'forwards',
      });
    } else {
      el.style.fontSize = from.fontSize;
    }
  }
}
