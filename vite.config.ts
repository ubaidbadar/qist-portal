import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { portalPwa } from './build/pwa.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss(), portalPwa()],
  resolve: {
    alias: {
      '@shop/shared': path.resolve(__dirname, './shared/src/index.ts'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
