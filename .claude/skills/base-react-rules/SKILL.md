---
name: base-react-rules
description: The React 19 + React Compiler rules this codebase follows for state, effects, memoization, refs, lists and performance. Use whenever you write or refactor any React component or hook here, or are about to reach for useEffect, useMemo, useCallback, memo, forwardRef, useContext, or a useState that mirrors another value, or the user asks to optimize, clean up or "modernize" React code.
---

# React rules for this codebase

React 19.x with the **React Compiler** enabled (`vite.config.ts`: `@rolldown/plugin-babel` + `reactCompilerPreset()`).
Lint (`eslint-plugin-react-hooks` v7, flat config) enforces the compiler rules. The goal is *less* code: fewer states,
fewer effects, no manual memoization.

## The compiler
- **Do not write `useMemo`, `useCallback` or `React.memo`.** The compiler memoizes. Write plain functions and objects.
- A component the compiler can't handle is silently left unoptimized. `yarn lint` surfaces this (`react-hooks/*` errors), so lint must be **clean**, not just "passing with warnings".
- Sanity check that it is really running: after `yarn build`, `grep -o memo_cache_sentinel dist/assets/*.js | wc -l` should be well above 1 (tens). A previous config used the removed `react({ babel })` option and compiled nothing, with no error.
- Don't mutate props/state, and don't read or write `ref.current` during render (only in handlers and effects).

## State
- Ask "does this need to be state?" Derive from props/state/URL during render instead of storing it: filtered lists, `isValid`, `activeTab`, counts, labels.
- State that must reset when an id changes: give the component a `key` (see `ExpandableText`, which remounts on `text`), or remember *which value* was affected instead of a boolean (`Avatar` stores `failedSrc`, so a new `src` is automatically "not failed"). Never `useEffect(() => setX(f(prop)), [prop])`.
- Keep state at the **lowest** component that needs it. If only one section reads it, it lives in that section (that is why `showcase/` is split into small sections, each owning its own state).
- Uncontrolled inputs with `defaultValue` are fine when nothing reads the value during render.
- Shared client state outside React: `utils/store.ts` (`createStore` + `useStore`, built on `useSyncExternalStore`). That is how the auth session and toasts work. Don't use Context for it unless a *subtree* needs its own value.
- Event-driven logic belongs in event handlers, not in an effect that watches state.

## Effects: the one question
> What external system is this effect synchronizing with?

If the answer isn't a subscription, timer, DOM measurement/focus, network request or third-party widget, it isn't an effect.
Every effect cleans up after itself (remove the listener, clear the timer, abort the request).
- **`useEffectEvent`** for a callback an effect needs to *call* without re-running when it changes (`useDismiss`, `useOverlay`, `useAnchoredPosition`, `AuthListener`). It must only be called from inside effects, never passed down or put in deps.
- `useLayoutEffect` only for measuring/positioning before paint.
- Data fetching: abort with `AbortController` in cleanup and ignore aborted results (`useGet`).

## Other conventions
- `ref` is a prop; no `forwardRef`. `useId` for ids. Context is read with `use(Context)`, and rendered as `<Ctx value={…}>` (no `.Provider`).
- Keys are stable ids, never array indexes for data that can reorder or change.
- Don't add `typeof window`/`typeof document` SSR guards: this is a client-only SPA.
- Components: one responsibility. Split when a piece has its own props or state, not just to shorten a file.
- Duplicated JSX or logic in two components is a missing component or hook: extract it (see `ui/field.tsx`, `ui/overlay_panel.tsx`, `hooks/useAnchoredPosition.ts` as examples of this).

## React 19 APIs: when they actually apply
| API | Use when | Not here when |
|---|---|---|
| `useActionState` + `<form action>` | a new form with a submit that has pending/error state | the form already uses `ui/Form` (react-hook-form) |
| `useFormStatus` | a button/field inside a `<form action>` needs pending (already in `Button`/`IconButton`) | outside a form |
| `useOptimistic` | a list/toggle should update before the server confirms | there's no mutation yet |
| `use(promise)` + `<Suspense>` | the data is fetched by a *parent* and passed as a promise | plain `useGet` is enough |
| `startTransition` / `useTransition` | a state update triggers expensive rendering you want interruptible | trivial updates |
| `lazy` | there are multiple routes with heavy pages | single-route app (today) |
Don't add one just because it's new. Extend `useGet`/`usePost`/`Form` first (see `base-data-forms-auth`).

## Before you say it's done
`yarn typecheck && yarn lint && yarn build`, then use the feature in the browser (`yarn dev`) for anything interactive.
Type checks do not catch behaviour bugs such as an overlay not closing or a popover positioned wrong.
