---
name: base-ui-component
description: How to add, extend or change a component in client/src/ui (buttons, inputs, selects, cards, badges, tooltips, popovers, any shared UI primitive) without breaking the design system or creating duplicates. Use whenever the user asks for a new component, a new variant or prop on an existing one, a form control, a dropdown/popover/tooltip, or says "add X to the UI kit", even if they never mention client/src/ui.
---

# Adding or changing a `client/src/ui` component

`client/src/ui` is what every project built on this base reuses, so the bar is: consistent, small, and no second copy of anything.

## 1. Look before you write
Search `client/src/ui/index.ts`, `client/src/ui/`, `client/src/hooks/` and `client/src/utils/styles.ts` first. Most requests are a new
**variant or prop** on an existing component, not a new component. If something similar exists, extend it. Two
components that differ only in classes or one prop are a duplicate waiting to happen.

## 2. Conventions every component follows
- File `client/src/ui/snake_case.tsx`, one default-exported component, exported `XxxProps` interface.
- Props extend the native element's attributes (`HTMLAttributes<HTMLSpanElement>`, `InputHTMLAttributes<…>`) and spread the rest onto the root: `{ variant, className = '', ...props }`. Put `className` **last** in the class string so callers can override.
- `ref` is a normal prop (React 19). Never use `forwardRef`.
- Variants and sizes are `const` objects, typed with `keyof typeof`:
  ```tsx
  const variants = { neutral: 'bg-border text-ink', accent: 'bg-accent/10 text-accent' };
  export interface ChipProps extends HTMLAttributes<HTMLSpanElement> { variant?: keyof typeof variants }
  export default function Chip({ variant = 'neutral', className = '', ...props }: ChipProps) {
    return <span className={`inline-flex rounded-pill px-3 py-1 text-xs ${variants[variant]} ${className}`} {...props} />;
  }
  ```
- **Style only with the design tokens** (next section). Never a raw palette color, hex or `rounded-xl`: lint rejects them.
- No `useMemo`, `useCallback` or `memo`; see `base-react-rules`.
- Split a private sub-component out (same file) when a `.map` body or a block has its own props; move it to its own file when a second component needs it.

## Design tokens: the whole look lives in `client/src/index.css` `@theme`
Components use roles, so a project can be re-themed by editing that one block.
| Kind | Tokens (use as `bg-…`, `text-…`, `border-…`, `ring-…`, `from-…`) |
|---|---|
| Neutrals | `canvas` (page), `surface` (cards, inputs, dialogs, and text on dark fills), `ink` (strongest text, primary fill), `body`, `muted`, `subtle` (placeholders), `border` |
| Accent | `accent`, `accent-alt` (gradient partner), `on-accent` (text/knob on accent fills) |
| Primary | `primary`, `on-primary`: main buttons and badges (Teal #0B6E6E in light mode, Mint #5FD0C8 in dark) |
| Logo | `logo-ring` (Teal, Mint in dark), `logo-tail` (Amber #FFB020); the mark is `app/layout/logo.tsx`, its dot and body use `currentColor` (Ink) |
| Brand | `brand-start`, `brand-end`, `on-brand`: the rich gradient of brand panels, the same in both themes |
| Status | `danger`, `success`, `warning`, `info` with a shade: `bg-danger-50`, `text-danger-600`, `border-danger-200`. Only shades defined in `index.css` exist; add one there if you need it |
| Radius | `rounded-pill` (buttons, badges, progress), `-card`, `-panel` (sheet, hero), `-control` (inputs, menus, toasts), `-small`, `-chip`. Use plain `rounded-full` only for true circles (avatar, switch, dots) |
| Shadow | `shadow-card`, `shadow-lg`, `shadow-sheet` |
| Font | `font-display` (headings), `font-body` (default) |
Need something new (a color, a radius)? Add a **token** to `@theme` and use it; don't inline a value. If a token is missing for a one-off, that is usually a sign to reuse a nearby one.

## 3. Reuse the building blocks that already exist
| Need | Use |
|---|---|
| Text-like form control (label, error, ids, aria) | `useFieldControl` + `FieldShell` from `ui/field.tsx` (see `input.tsx`, `select.tsx`, `textarea.tsx`) |
| Checkbox/radio style control | `ChoiceField` from `ui/field.tsx` |
| Button that shows pending inside a `<form action>` | `useButtonState` (`Button`, `IconButton`) |
| Value that is controlled **or** internal | `useControllableState` (`tabs.tsx`, `segmented_control.tsx`) |
| Floating element next to an anchor (popover, menu, tooltip) | `useAnchoredPosition` + `useDismiss`, portaled with `createPortal(…, document.body)` (see `dropdown_menu.tsx`) |
| Modal, drawer, sheet, confirm | the `base-overlays` skill, not custom state |
| Toast | `toast.success/error/info/warning` from `ui/toast.tsx` |

Floating elements are `position: fixed`; `useAnchoredPosition` already sets `transition-property: none` on them so they don't animate from the corner. Don't add `transition-all` to a positioned wrapper.

## 4. Wire it in
1. Export from `client/src/ui/index.ts` (keep alphabetical): `export { default as Chip, type ChipProps } from './chip';`
2. Show it in the matching `client/src/showcase/*_section.tsx` (or add a section), so the demo page stays the live catalog. Keep demos' state inside the section that uses it.
3. Run `yarn typecheck && yarn lint && yarn build`.

## Native HTML/CSS first
- Keyboard focus is global: `:focus-visible` in `index.css` draws an accent outline on every control. Don't add `focus:ring`/`focus:outline-none` to buttons; adjust only the offset where it would be clipped (`-outline-offset-2` inside `overflow` containers). Text inputs keep their own border+ring style (`formInputBaseClasses`).
- Prefer the platform's state over React state for presentation: `<details name>` (Accordion), native radios (SegmentedControl), `has-checked:`/`has-disabled:`/`peer-checked:`, `aria-*:` variants, and `error:` (custom variant = `aria-invalid` or `:user-invalid`).
- Animations are CSS: `starting:` (`@starting-style`) for enter, `animate-pop-in` for popovers, the `ease-emphasized` token for slides, and always `motion-reduce:` to turn them off. There is no animation library and no tailwindcss-animate (`animate-in`/`fade-in` classes do nothing).
- Purely decorative shapes (a sheet's grab handle, a switch knob, a radio dot) can be a pseudo-element or a clipped background instead of an element; anything that carries meaning stays in the DOM.

## Accessibility baseline
Icon-only buttons need `aria-label`; inputs need a visible label tied by `htmlFor`/`id`; errors use `role="alert"` and `aria-describedby`; anything clickable is a real `<button>`/`<a>`; decorative icons get `aria-hidden`.
