import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Plugin } from 'vite';

/** Precache public build files only. Business data never enters the service-worker cache. */
export function portalPwa(): Plugin {
  return {
    name: 'qist-pwa',
    apply: 'build',
    async generateBundle(_options, bundle) {
      const publicFiles = ['offline.html', 'favicon.svg', 'qist-logo-1024.png', 'manifest.webmanifest', 'pwa-maskable.svg', 'icons/qist-192.png', 'icons/qist-512.png', 'icons/qist-maskable-512.png'];
      const assets = Object.keys(bundle).filter((file) => file.startsWith('assets/') && !file.endsWith('.map'));
      const hash = createHash('sha256');
      for (const file of assets.sort()) {
        const entry = bundle[file];
        hash.update(file).update(entry.type === 'chunk' ? entry.code : entry.source);
      }
      for (const file of publicFiles) hash.update(await readFile(new URL(`../public/${file}`, import.meta.url)));
      const template = await readFile(new URL('./service-worker.js', import.meta.url), 'utf8');
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: template
        .replace('__CACHE_NAME__', `qist-portal-${hash.digest('hex').slice(0, 16)}`)
        .replace('__PRECACHE__', JSON.stringify([...publicFiles, ...assets].map((file) => `/${file}`))) });
    },
  };
}
