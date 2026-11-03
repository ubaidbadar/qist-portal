---
name: base-new-project
description: Step-by-step checklist for starting a new project from this base repo (copying it, renaming and rebranding it, removing the demo showcase and original-app leftovers, and keeping it easy to pull future base improvements). Use whenever the user says they are creating, starting, scaffolding, cloning, rebranding or forking a new app/project/site from this base or "from this code", even if they don't say "checklist".
---

# Starting a new project from the base

The base is a design system (`client/src/ui`) plus plumbing (hooks, auth, API client, overlays). A new project keeps all of
that and replaces the demo and the original app's branding. Work through this in order, then run
`yarn install && yarn typecheck && yarn lint && yarn build`.

## 1. Copy
- Clone/copy into a new folder, remove `.git`, `git init`, and (optional but recommended) add the base as a remote so
  improvements can be pulled later: `git remote add base <url>` → `git fetch base` → cherry-pick or merge.
- Keep `.claude/` and `CLAUDE.md`: they carry these conventions into the new project.

## 2. Rename
The base itself is brand-neutral (`base-frontend`, `Base`, `base_auth`, `example.com` emails). Change:
| Where | Change |
|---|---|
| `package.json` | `name` |
| `README.md`, `index.html` `<title>` | project name |
| `.env.example` | `VITE_API_URL` default; create `.env` from it |
| `client/src/auth/session.ts` | `STORAGE_KEY = 'base_auth'` → `'<project>_auth'` (the only place; the API client reads the store) |
| `client/src/showcase/*` | demo copy mentions audio/"Base Design System"; replace or delete with the showcase |
| `client/src/index.css` `@theme` | **the one place to restyle the whole UI**: neutrals, `accent`, status shades, radii, shadows, fonts |
| fonts | swap the `@fontsource/*` packages imported in `main.tsx` together with `--font-display` / `--font-body` |
Components only use those tokens (lint enforces it), so re-theming never means touching `client/src/ui`. Add a token to `@theme` before inventing a color or radius.

## 3. Replace the demo with the real app
- `client/src/app.tsx` renders `showcase/`. Replace its body with the real app/routes. Either delete `client/src/showcase/` or keep it behind a dev-only route (`/design-system`) as a live component catalog: it is the fastest way to check a theme change.
- Remove from `main.tsx` what the project doesn't need: `AuthListener` (only for social-account linking), the whole `auth/` folder if the project has no login.
- `client/src/auth/types.ts` (`User`, `SocialAccount`, `brandTones`, `contentPillars`, `brandColors`) is the *original app's* user model: reshape it to the new API's user.

## 4. Dependencies
Everything in `ui/` is used by the library, so keep them (animations are plain CSS, no animation library):
`date-fns` (Calendar, DatePicker), `lucide-react` (icons). `react-hook-form` and `@hookform/resolvers` are needed only by
`ui/form` (`zod` is what you write its schemas with, and the resolver requires it); `axios` by `config/api.ts`; `react-router-dom` by `main.tsx`.
Drop a dependency only after deleting the code that imports it (e.g. `grep -rn "react-hook-form" src`), then re-run typecheck/build.

## 5. Keep the base easy to merge
- Treat `client/src/ui`, `client/src/hooks`, `client/src/hoc` and `client/src/utils` as the shared core. Put project-specific components in `client/src/features/<name>/` or `client/src/pages/`, not in `ui/`.
- If a project needs a change to a core file, make it generic enough to belong in the base and make it there first.
- Use the same file naming (`snake_case`; camelCase for hooks/HOC) so the projects stay interchangeable.

## 6. Verify
`yarn install` → `yarn typecheck` → `yarn lint` → `yarn build` → `yarn dev` and click through the app. Confirm the compiler
is active: `grep -o memo_cache_sentinel dist/assets/*.js | wc -l` is well above 1.
