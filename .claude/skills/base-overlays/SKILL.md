---
name: base-overlays
description: How modals, dialogs, drawers, bottom sheets, confirm and alert dialogs work in this codebase (the withOverlay HOC + useShow pattern), how to use them, and how to add a new one. Use whenever the user wants a popup, modal, dialog, drawer, slide-over, sheet, confirmation, "are you sure" prompt, or anything that opens on click and blocks the page, and whenever you are about to write an isOpen/setIsOpen state for one.
---

# Overlays: `withOverlay` + `useShow`

Overlays here are **self-managing**. The caller never holds `isOpen` state: it passes a `component` that renders the
trigger, and the HOC owns the open/close state. Do not reintroduce `useState(isOpen)` for an overlay.

## Using one
```tsx
import { Modal, Button } from '../ui';

<Modal
  title="Settings"
  component={({ open }) => <Button onClick={open}>Open</Button>}   // the trigger
  footer={(close) => <Button onClick={close}>Done</Button>}        // node, or function of close
>
  …content…
</Modal>
```
- `component(tools)` gets `{ state, open, close }`. Any element can be the trigger (an `IconButton`, a menu item…).
- `footer` (Modal, Drawer) and `children` (BottomSheet only) may be a function of `close`, for content that dismisses the overlay: `{(close) => <Button onClick={() => { close(); doThing(); }} />}`.
- `ConfirmModal` / `AlertModal` take `onConfirm`; they call it and then close. `AlertModal` is the destructive preset (Delete, danger).
- Escape, backdrop click (Modal), browser Back and body scroll-lock are handled for you. Don't add listeners.
- The same overlay used from two places is simply two instances; that's fine, there is no shared state to coordinate.

## How it is built
```
client/src/hoc/withOverlay.tsx      HOC: useShow() + renders trigger + mounts panel while state !== ''
client/src/hooks/useShow.ts         state: 'active' | 'close' | ''  (+ open/close, popstate, 300ms exit window)
client/src/hooks/useOverlay.ts      Escape (topmost only) + scroll lock, driven by useShow
client/src/ui/<name>/index.tsx      the PANEL: presentational, receives { state, open, close } + its own props
client/src/ui/<name>/modal.tsx      export default withOverlay(Panel)
client/src/ui/index.ts              exports the wrapper as the component and the panel's types
```
`state` is `'close'` for 300 ms after closing so exit animations can play. `Modal`, `Drawer` and `BottomSheet` all render
`ui/overlay_panel.tsx` (`from="center" | "right" | "bottom"`): its container is the backdrop, and it animates in CSS only:
the enter transition starts from `@starting-style`, the exit plays while `state === 'close'`. Reduced motion skips both.

## Adding a new overlay
1. `client/src/ui/side_note/index.tsx` – the panel. Props extend `OverlayProps` (= `ShowTools`). Build it on `OverlayPanel`,
   which already portals, draws the backdrop, closes on backdrop click and animates.
   ```tsx
   import type { ReactNode } from 'react';
   import type { OverlayProps } from '../../hoc/withOverlay';
   import OverlayPanel from '../overlay_panel';

   export interface SideNoteProps extends OverlayProps { title: string; children: ReactNode }

   export default function SideNote({ state, close, title, children }: SideNoteProps) {
     return (
       <OverlayPanel state={state} close={close} from="right" className="h-dvh w-full max-w-sm bg-surface p-6">
         <h2>{title}</h2>
         {children}
       </OverlayPanel>
     );
   }
   ```
2. `client/src/ui/side_note/modal.tsx`:
   ```tsx
   import withOverlay from '../../hoc/withOverlay';
   import SideNote from '.';

   export default withOverlay(SideNote);
   ```
3. Barrel: `export { default as SideNote } from './side_note/modal';` and `export type { SideNoteProps } from './side_note';`
4. Prefer **composing** over copying: build on `Modal` (like `confirm_modal`) or `OverlayPanel` (like `drawer`, `bottom_sheet`) and reuse `DialogHeader`/`DialogFooter` from `ui/dialog_parts.tsx` and `renderFooter` from the HOC.
5. Add a demo in `client/src/showcase/overlays/` (it takes a `component` trigger prop, type in `overlays/types.ts`) and a launcher in `overlays_section.tsx`.

## Gotchas
- **Never spread `{...tools}` (or `open`) onto a DOM element**: React warns about a function-valued attribute. Destructure `state`/`close` and pass only those down (this bit the old `SlideOverlay` once).
- The panel is unmounted when `state === ''`, so any local state inside the panel resets on every open. That is the intended behaviour; keep persistent state in the caller.
- Opening one overlay from inside another is fine: `useOverlay` keeps a stack, and Escape closes only the topmost.
- A11y gap, deliberate: dialogs currently have no `aria-labelledby`/`aria-modal` (removed by the owner). Ask before adding them back.
