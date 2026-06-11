# Cleo Prototype Template

## Project context

This is a prototype scaffolding tool for Cleo's product design team. Prototypes built from this template are rendered inside a simulated iPhone viewport and are used to test interaction patterns and product ideas with users. The design system under `src/design-system/` is a web translation of Cleo's Cocoa design system from the React Native app — tokens (colors, typography, spacing, radii, motion, gradients) and components map 1:1 where possible, with iOS interaction patterns approximated using Framer Motion.

## Design System Rules

These rules are non-negotiable and apply to every file you create or modify.

1. **Never hardcode values.** Do not hardcode hex colour values, pixel sizes, font names, font weights, or spacing values anywhere in the codebase. Every value must come from the design system.

2. **Always import from the design system.** When using tokens, import from `src/design-system/tokens`. When using components, import from `src/design-system/components`. Check whether a component already exists before building a new one.

3. **Check before building.** Before creating any UI element, check `src/design-system/components/` to see if a matching component already exists. If it does, use it. If one partially matches, extend it rather than duplicating it.

4. **Token usage in Tailwind.** Design tokens are available as Tailwind utility classes (e.g., `bg-brown-50`, `bg-primary` for the semantic background role, `text-primary` for semantic content, `rounded-CARD`, `rounded-BUTTON`, `p-S`, `p-M`, `font-body`). Prefer these over inline styles where possible.

5. **No external component libraries.** Do not install or use component libraries such as shadcn/ui, Radix, MUI, Chakra, or similar. All UI must come from the design system in this repo or be built from scratch using the design system tokens.

6. **iOS interaction patterns.** All interactive elements must feel iOS-native:
   - Pressable elements use Framer Motion `whileTap={{ scale: 0.97 }}` for touch feedback.
   - Navigation transitions: push = slide from right, modal = slide from bottom.
   - Bottom sheets animate up from below using Framer Motion `AnimatePresence`.
   - Haptic equivalents are visual (scale, opacity shift) — not literal haptics.

8. **Motion tokens are mandatory.** Never hardcode durations (ms or seconds), easing curves, or animation parameters. Every animation must use tokens from `src/design-system/tokens/motion*.ts`. The motion system is layered — prefer the highest-level token that fits:

   **Layer 3 — Component-shaped tokens (prefer these).** Ready-made choreography for specific UI patterns. Use directly — they carry the full design intent:
   - `BottomDrawerTransitions` — backdrop, panel (scale + slide), content (with enter delay)
   - `FullscreenModalTransitions` — backdrop, panel (slide + fade), underlying page parallax
   - `AlertModalTransitions` — backdrop, panel (scale + fade with enter delay)
   - `EnterTransitions.text` — row slide-up + per-word staggered fade/slide
   - `EnterTransitions.bodyList` — row stagger cadence for lists
   - `ExitTransitions.text` — slide + fade with offset timing
   - `ExitTransitions.bodyList` — block slide with row stagger
   - `DismissCardTransitions` — card fade + reflow slide with delay

   **Advanced choreography** (in `motionTransitionsAdvanced.ts`):
   - `TabEnterCascade` — staggered card cascade on tab switch
   - `FullscreenModalMaintainContext` — source element morphs via layoutId into FSM
   - `FullscreenModalContainerTransformNew` — source card morphs into FSM panel, new content
   - `FullscreenModalContainerTransformKeep` — source card morphs into FSM panel, source content stays

   **Reduced-motion adapters** (in `motionAdaptersReducedMotion.ts`):
   Functions like `stackTransition(reduced)`, `modalTransition(reduced)`, `bottomDrawerBackdropEnter(reduced)`, etc. Pass `useReducedMotion()` from Framer Motion. They return full Framer Motion `Transition` objects — reduced-motion variants are already built in.

   **Layer 2 — Semantic raw transitions.** When no component-shaped token fits, use `MotionTransitions` grouped by motion shape and intent:
   - Enter: `fadeIn.*`, `scaleIn.*`, `slideIn.*` — easeOut (decelerates to rest)
   - Exit: `fadeOut.*`, `scaleOut.*`, `slideOut.*` — easeIn (accelerates away)
   - State-to-state: `scale.*`, `slide.*` — easeInOut (symmetric, element keeps identity)
   - Each group offers duration tiers: `swift1` (50ms), `swift2` (100ms), `steady1` (200ms), `steady2` (300ms), `slow1` (400ms), `slow2` (500ms)
   - Convert to Framer Motion with `framerFromDef(MotionTransitions.slideIn.steady1)`

   **Layer 1 — Primitives (do not use directly in components).** `MotionDuration` and `MotionEasing` are the raw scale. Only use them when composing new semantic tokens or for delay/stagger values — never as standalone animation parameters.

   **Choosing the right easing:**
   - Element entering the screen → `easeOut` (decelerates to rest)
   - Element leaving the screen → `easeIn` (accelerates away)
   - Element changing in place (keeps identity) → `easeInOut` (symmetric)
   - Opacity-only transitions → `linear`

7. **Safe area awareness.** Any element that would sit behind the Dynamic Island or home indicator on a real device must respect `SAFE_AREA_TOP` and `SAFE_AREA_BOTTOM` from `src/shell/SafeAreaProvider.tsx`, or wrap content in the `SafeArea` component from `src/design-system/components/SafeArea`.

## Workflow: Figma to Prototype

When a designer provides a Figma file or Figma MCP output:

1. Render the screen visually as provided in the Figma spec.
2. After rendering, perform a reconciliation pass:
   a. For every colour value in the Figma spec, check whether it matches a token in `src/design-system/tokens/colors.ts`. If it matches (exact or near-exact), replace the hardcoded value with the token reference.
   b. For every UI element in the Figma spec, check whether a matching component exists in `src/design-system/components/`. If it does, replace the raw implementation with the component.
   c. For every animation or transition in the Figma spec (duration, easing, delay, stagger), check whether it matches a motion token in `src/design-system/tokens/motionTransitions.ts` or `motionTransitionsAdvanced.ts`. If a component-shaped token exists for the pattern (e.g. bottom drawer, fullscreen modal, alert, text enter/exit), use it. Otherwise match to the closest `MotionTransitions` group + duration tier.
3. Do not silently skip reconciliation. If a colour, element, or motion value could not be matched, leave a comment in the code: `// No design system match found for [value/element] — using raw value`.
4. The output should be a screen that looks identical to the Figma spec but is built on design system primitives wherever possible.

## Workflow: Idea to Prototype

When a designer describes what they want in natural language:

1. Generate the UI using design system components and tokens exclusively. Do not invent visual decisions.
2. If the design system does not have a component for something, build it from scratch using only tokens — not arbitrary values.
3. Follow iOS interaction patterns as described in the Design System Rules section.
4. Structure output as one file per screen in `src/prototype/screens/`.
5. If the designer asks for navigation or linking between screens, implement it using React Router with screen transitions appropriate to the navigation type (push or modal).

## Prototype Structure

- One file per screen in `src/prototype/screens/`.
- Prototype-specific components (not from the design system) go in `src/prototype/components/`.
- Do not put prototype logic inside design system files.
- For routing between screens, use React Router. Push navigation slides from right. Modal navigation slides from bottom.
- Prototypes can be as simple or as complex as needed. Simple three-screen flows and full vision prototypes with branching logic are both valid uses of this template.

## Automatic Content Map

The prototype shell includes a content-map tool above the phone, next to the screenshot button. It opens an overlay showing every screen in `src/prototype/screens/` and any declared links between screens.

Every new screen file must export `contentMap` metadata from the screen file itself. This keeps the map self-updating without asking the user to request it separately.

```ts
import type { ContentMapScreenMetadata } from '../content-map/types';

export const contentMap: ContentMapScreenMetadata = {
  id: 'onboarding-start',
  routePath: '/onboarding-start',
  label: 'Onboarding start',
  context: 'Onboarding',
  heading: 'Start onboarding',
  subhead: 'Introduce the next step.',
  order: 1,
  options: [
    { code: 'CONTINUE', label: 'Continue', to: 'onboarding-details' },
  ],
};
```

- `id` is the stable node id used by other screens' `options[].to` values.
- `routePath` is optional when the filename maps cleanly to the route, but include it for clarity when adding navigation.
- `order` controls the left-to-right/top-to-bottom map order.
- `options` should include only forward product/content choices and branch targets, creating a one-way arrow from this screen to the next screen.
- Do not include Back, Close, Dismiss, Done, Cancel, or other return/navigation controls in `options`; those can exist in the UI, but they should not create content-map arrows.
- If a screen is intentionally unfinished, set `status: 'todo'` and add a short `note`.

## What Not To Do

- Do not install new npm packages without being asked.
- Do not modify files in `src/design-system/` unless explicitly asked to update the design system.
- Do not use `any` in TypeScript.
- Do not create global CSS overrides that could break design system component styles.
- Do not use `px` values directly in component code — use spacing tokens.
