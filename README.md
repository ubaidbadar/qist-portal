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
