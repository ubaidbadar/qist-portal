import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../dist/sw.js', import.meta.url), 'utf8');
function worker({ online = true } = {}) {
  const handlers = {}, writes = [], deleted = [], requests = [];
  const fallback = new Response('offline page');
  const cache = { addAll: async (paths) => writes.push(...paths), match: async (request) =>
    request === '/offline.html' ? fallback : new Response('static asset') };
  const scope = {
    URL, Set, self: { location: { origin: 'https://portal.test' }, clients: { claim: async () => {} },
      skipWaiting: async () => { scope.skipped = true; }, addEventListener: (name, fn) => { handlers[name] = fn; } },
    caches: { open: async () => cache, keys: async () => ['qist-portal-old', 'unrelated-app'], delete: async (name) => deleted.push(name) },
    fetch: async (request) => { requests.push(request); if (!online) throw new Error('offline'); return new Response('network'); },
  };
  vm.runInNewContext(source, scope);
  return { handlers, writes, deleted, requests, scope };
}
function request(url, options = {}) { return { url, method: 'GET', headers: new Headers(), mode: 'cors', ...options }; }
async function respond(worker, request) {
  let response;
  worker.handlers.fetch({ request, respondWith: (value) => { response = value; } });
  return response ? await response : null;
}

test('manifest has standalone identity and real install icons', async () => {
  const manifest = JSON.parse(await readFile('dist/manifest.webmanifest', 'utf8'));
  assert.equal(manifest.display, 'standalone'); assert.equal(manifest.scope, '/'); assert.equal(manifest.id, '/');
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((icon) => icon.sizes === `${size}x${size}` && icon.purpose === 'any');
    assert.ok(icon); const png = await readFile(`dist${icon.src}`);
    assert.equal(png.readUInt32BE(16), size); assert.equal(png.readUInt32BE(20), size);
  }
  assert.ok(manifest.icons.some((icon) => icon.purpose === 'maskable'));
});
test('precache contains only existing public files and hashed build assets', async () => {
  const w = worker(); let pending; w.handlers.install({ waitUntil: (value) => { pending = value; } }); await pending;
  assert.ok(w.writes.includes('/offline.html'));
  for (const path of w.writes) { assert.equal((await stat(`dist${path}`)).isFile(), true); assert.ok(!path.includes('/api/')); }
  assert.ok(!w.writes.includes('/index.html')); assert.ok(!w.writes.includes('/'));
  assert.ok(w.writes.some((path) => path.endsWith('.js')));
  assert.equal(w.scope.skipped, undefined);
});
test('API calls, writes, authorized and cross-origin requests bypass the cache', async () => {
  const w = worker();
  for (const req of [request('https://portal.test/api/v1/contracts'), request('https://api.test/payments'),
    request('https://portal.test/payments', { method: 'POST' }),
    request('https://portal.test/favicon.svg', { headers: new Headers({ Authorization: 'Bearer private' }) })]) {
    assert.equal(await respond(w, req), null);
  }
  assert.equal(w.requests.length, 0); assert.equal(w.writes.length, 0);
});
test('offline deep links show a branded fallback without caching page responses', async () => {
  const w = worker({ online: false });
  const response = await respond(w, request('https://portal.test/contracts/private-id', { mode: 'navigate' }));
  assert.equal(await response.text(), 'offline page'); assert.equal(w.writes.length, 0);
  const online = worker(); const live = await respond(online, request('https://portal.test/payments', { mode: 'navigate' }));
  assert.equal(await live.text(), 'network'); assert.equal(online.writes.length, 0);
});
test('only known static assets are served from cache', async () => {
  const w = worker({ online: false });
  assert.equal(await (await respond(w, request('https://portal.test/favicon.svg'))).text(), 'static asset');
  assert.equal(await respond(w, request('https://portal.test/customer-export.csv')), null);
});
test('activation cleans only Qist caches; updates require an explicit message', async () => {
  const w = worker(); let pending; w.handlers.activate({ waitUntil: (value) => { pending = value; } }); await pending;
  assert.deepEqual(w.deleted, ['qist-portal-old']); assert.equal(w.scope.skipped, undefined);
  w.handlers.message({ data: { type: 'unknown' }, waitUntil: () => assert.fail('unexpected activation') });
  w.handlers.message({ data: { type: 'SKIP_WAITING' }, waitUntil: (value) => { pending = value; } }); await pending;
  assert.equal(w.scope.skipped, true);
});
test('the production entry registers PWA support and remains compiled by React Compiler', async () => {
  const files = await readdir('dist/assets');
  const scripts = await Promise.all(files.filter((file) => file.endsWith('.js')).map((file) => readFile(`dist/assets/${file}`, 'utf8')));
  assert.ok(scripts.some((text) => text.includes('serviceWorker') && text.includes('/sw.js')));
  assert.ok(scripts.some((text) => text.includes('memo_cache_sentinel')));
});
