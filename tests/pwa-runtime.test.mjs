import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const source = await readFile(new URL('../src/pwa/runtime.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source.replace('import.meta.env.PROD', 'true'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function environment({ waiting = null, promptOutcome = 'dismissed' } = {}) {
  const events = {}, swEvents = {}, documentEvents = {}, notices = [];
  let registrations = 0, reloads = 0, prompts = 0, checks = 0;
  const registration = { waiting, installing: null, addEventListener: (name, fn) => { swEvents[name] = fn; }, update: async () => { checks++; } };
  const navigator = { onLine: true, userAgent: 'Chrome', maxTouchPoints: 0, platform: 'Linux',
    serviceWorker: { controller: {}, register: async () => { registrations++; return registration; },
      addEventListener: (name, fn) => { swEvents[name] = fn; } } };
  const window = { matchMedia: () => ({ matches: false }), location: { reload: () => { reloads++; } },
    addEventListener: (name, fn) => { events[name] = fn; } };
  const document = { readyState: 'complete', visibilityState: 'visible', addEventListener: (name, fn) => { documentEvents[name] = fn; } };
  const exports = {};
  vm.runInNewContext(compiled, { exports, window, navigator, document, require: (path) => {
    if (path.endsWith('/store')) return { createStore: (initial) => { let state = initial; return { get: () => state, set: (next) => { state = typeof next === 'function' ? next(state) : next; } }; } };
    if (path.endsWith('/toast')) return { toast: { info: (message) => notices.push(message) } };
    throw new Error(path);
  } });
  const prompt = { preventDefault() { this.prevented = true; }, prompt: async () => { prompts++; }, userChoice: Promise.resolve({ outcome: promptOutcome }) };
  return { exports, events, swEvents, documentEvents, navigator, document, notices, prompt,
    counts: () => ({ registrations, reloads, prompts, checks }) };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test('PWA boot is idempotent and first control never reloads the portal', async () => {
  const env = environment(); env.exports.startPwa(); env.exports.startPwa(); await settle();
  assert.equal(env.counts().registrations, 1);
  env.swEvents.controllerchange(); assert.equal(env.counts().reloads, 0);
});
test('a dismissed install prompt is consumed once; installation hides the menu action', async () => {
  const env = environment(); env.exports.startPwa(); await settle();
  env.events.beforeinstallprompt(env.prompt); assert.equal(env.prompt.prevented, true);
  await env.exports.installPortal(); assert.equal(env.counts().prompts, 1); assert.equal(env.exports.pwaStore.get().install, null);
  env.events.appinstalled(); assert.equal(env.exports.pwaStore.get().installed, true);
});
test('waiting updates never reload until this tab explicitly accepts', async () => {
  const messages = []; const env = environment({ waiting: { postMessage: (message) => messages.push(message.type) } });
  env.exports.startPwa(); await settle(); assert.ok(env.exports.pwaStore.get().waiting);
  env.swEvents.controllerchange(); assert.equal(env.counts().reloads, 0);
  env.exports.updatePortal(); assert.deepEqual(messages, ['SKIP_WAITING']);
  env.swEvents.controllerchange(); assert.equal(env.counts().reloads, 1);
});
test('offline events update only PWA status and foreground checks wait for a connection', async () => {
  const env = environment(); env.exports.startPwa(); await settle();
  env.navigator.onLine = false; env.events.offline(); assert.equal(env.exports.pwaStore.get().offline, true);
  env.documentEvents.visibilitychange(); assert.equal(env.counts().checks, 0);
  env.navigator.onLine = true; env.events.online(); assert.equal(env.exports.pwaStore.get().offline, false);
  env.documentEvents.visibilitychange(); assert.equal(env.counts().checks, 1);
});
test('iOS manual installation guidance and registration failure do not block the app', async () => {
  const env = environment(); env.navigator.userAgent = 'iPhone';
  env.navigator.serviceWorker.register = async () => { throw new Error('unsupported'); };
  env.exports.startPwa(); await settle(); assert.equal(env.exports.canInstallOnIos(), true);
  await env.exports.installPortal(); assert.match(env.notices[0], /Add to Home Screen/);
});
