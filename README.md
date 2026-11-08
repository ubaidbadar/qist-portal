# Shop Portal (Client)

The frontend client for the multi-tenant installment management portal. Built with React 19, Vite, Tailwind CSS v4, TanStack Query, and React Hook Form.

## Prerequisites

- [Bun](https://bun.sh/) (v1.1+ recommended) or Node.js (v20+)

## Quick Start

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```
   Set `VITE_API_URL` to point to the backend API (e.g. `http://localhost:5001/api/v1` for local development).

3. Start development server:
   ```bash
   bun run dev
   ```
   The client runs at `http://localhost:3000`.

## Scripts

- `bun run dev` - Start local Vite dev server
- `bun run build` - Build production bundle to `dist/`
- `bun run preview` - Preview production build locally
- `bun run typecheck` - Typecheck with TypeScript (`tsc --noEmit`)
- `bun run lint` - Lint source files and enforce design token rules
- `bun run check` - Run typecheck, lint, and build

## Deployment

The client is a standard static Single Page Application (SPA). It can be deployed to any static hosting platform:

- **Vercel**: Framework preset `Vite`, Build command `bun run build` (or `npm run build`), Output directory `dist`. Set environment variable `VITE_API_URL`. Configure single page rewrite to `/index.html`.
- **Netlify**: Build command `bun run build`, Publish directory `dist`. Add `/* /index.html 200` to `_redirects` or `netlify.toml`.
- **Cloudflare Pages**: Framework preset `Vite`, Build command `bun run build`, Output directory `dist`.
- **AWS S3 + CloudFront / Nginx**: Build the project and serve `dist/` with fallback to `index.html`.

### Installable portal (PWA)

The production build emits `/sw.js` and serves `/manifest.webmanifest`, using Qist's existing keyhole logo with 192/512px and maskable icons. Chrome/Edge users can choose **Install Qist app** in the account menu when the browser offers installation, or use its native install menu. On iPhone/iPad, use Safari → Share → Add to Home Screen. Installed windows open in standalone mode at the portal root. HTTPS (or localhost for development testing) is required.

Only public static build assets are precached. API responses, authenticated requests, payment submissions, exports and visited HTML pages are not stored in Cache Storage. Reloading offline shows a branded reconnect page at the requested URL; this is not an offline payment queue. Existing in-memory query/session behavior is unchanged.

New workers wait while the current portal is open. An **Update ready** notice offers an explicit reload after saving work; only the accepting tab reloads. Other tabs are never force-reloaded. Browser update checks and foreground entry check for updates without a polling timer. Firebase hosting revalidates the worker, manifest and HTML; deploy the complete `dist` output together. No backend change or extra business API call is needed.

Run `npm run test:pwa` to build and exercise the generated manifest/service worker (icon dimensions, cache allowlist, API/write exclusion, offline deep links, activation and explicit updates). Run the existing type/lint checks too. Before publishing, verify native installation and an update cycle on Android Chrome and iOS Safari; an operating-system install dialog cannot be proven by source tests.
