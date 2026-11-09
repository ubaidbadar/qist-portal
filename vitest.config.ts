import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
export default defineConfig({
  resolve: { alias: { '@shop/shared': fileURLToPath(new URL('./shared/src/index.ts', import.meta.url)) } },
  test: { setupFiles: ['./tests/navigation_setup.ts'], include: ['tests/navigation.test.tsx'] },
});
