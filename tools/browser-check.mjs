// Browser check harness. Drives a headless Chromium (Edge by default) over the
// DevTools protocol so a page can be opened at an emulated viewport, including
// phone sizes with touch, a check script run inside it, console errors
// collected and a screenshot saved. Plain `--headless --screenshot` cannot do
// any of that, and the desktop app browser pane pauses rendering when hidden.
//
//   node tools/browser-check.mjs <url> <width> <height> <mobile 0|1> <outPrefix> [check.js]
//   node tools/browser-check.mjs http://localhost:4321/ 1440 900 0 out/desktop tools/checks/interactions.js
//
// Set BROWSER_EXE to point at another Chromium build. Needs Node 22 or newer
// for the built-in WebSocket.
import { spawn } from 'node:child_process';
import { writeFile, readFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [url, w, h, mobile, out, scriptPath] = process.argv.slice(2);
if (!url || !w || !h || !out) {
  console.error('usage: node tools/browser-check.mjs <url> <width> <height> <mobile 0|1> <outPrefix> [check.js]');
  process.exit(1);
}
const EDGE = process.env.BROWSER_EXE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const port = 9333 + Math.floor(Math.random() * 500);
const profile = await mkdtemp(join(tmpdir(), 'browser-check-'));

const edge = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function targets() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json`);
      const list = await res.json();
      const page = list.find(t => t.type === 'page');
      if (page) return page;
    } catch {}
    await sleep(250);
  }
  throw new Error('Edge did not expose a page target');
}

const page = await targets();
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let id = 0;
const pending = new Map();
const events = [];
ws.onmessage = e => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method) events.push(msg);
};
const send = (method, params = {}) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async expr => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text };
  return r.result?.result?.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: +w, height: +h, deviceScaleFactor: 2, mobile: mobile === '1',
});
if (mobile === '1') await send('Emulation.setTouchEmulationEnabled', { enabled: true });
await send('Page.navigate', { url });
for (let i = 0; i < 60; i++) {
  const ready = await evaluate('document.readyState === "complete" && document.body && document.body.children.length > 1');
  if (ready === true) break;
  await sleep(250);
}
await sleep(800);

const consoleErrors = events
  .filter(m => (m.method === 'Runtime.exceptionThrown') || (m.method === 'Log.entryAdded' && m.params.entry.level === 'error'))
  .map(m => m.method === 'Runtime.exceptionThrown' ? m.params.exceptionDetails.text : m.params.entry.text);

let scriptResult = null;
if (scriptPath) {
  const code = await readFile(scriptPath, 'utf8');
  scriptResult = await evaluate(`(async () => { ${code} })()`);
  await sleep(300);
}

const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
await writeFile(`${out}.png`, Buffer.from(shot.result.data, 'base64'));

const metrics = await evaluate('({ scrollWidth: document.documentElement.scrollWidth, innerWidth, innerHeight, docHeight: document.documentElement.scrollHeight, hidden: document.hidden })');
console.log(JSON.stringify({ consoleErrors, metrics, scriptResult }, null, 2));

ws.close();
edge.kill();
process.exit(0);
