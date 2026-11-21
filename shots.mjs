// Takes the screenshots in shots.json with headless Chrome for Testing via
// CDP (Node 24's built-in WebSocket client, no dependencies). Each shot loads
// the game with its ?shot= query, waits for window.__shotReady, then captures
// a JPEG (1280x800, quality 85) into screenshots/. It also prints every page
// error and exception, so a broken frame is visible, not silent.
//
// Usage: node shots.mjs [shot-name ...]   (default: every shot in shots.json)
// The game must be served first: node serve.ts  (http://localhost:8080)
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const CHROME = '/home/hatch/workspace/makefun/chrome/linux-157.0.8103.78/chrome-linux64/chrome';
const PORT = 9334;
const BASE = 'http://localhost:8080/index.html';
const PROFILE = '/tmp/clockwork-twins-chrome-profile';

const shots = JSON.parse(await readFile('shots.json', 'utf8'));
const wanted = process.argv.slice(2);
const todo = wanted.length ? shots.filter((s) => wanted.includes(s.name)) : shots;
if (todo.length === 0) {
  console.error(`no shots match: ${wanted.join(', ')}`);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(path, tries = 50) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}${path}`);
      if (res.ok) return await res.json();
    } catch {
      // Chrome not up yet.
    }
    await sleep(200);
  }
  throw new Error(`chrome devtools did not answer ${path}`);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  `--remote-debugging-port=${PORT}`,
  '--window-size=1280,800',
  '--no-sandbox',
  '--disable-gpu',
  `--user-data-dir=${PROFILE}`,
  'about:blank',
], { stdio: 'ignore' });

const errors = [];
try {
  await waitForJson('/json/version');
  await mkdir('screenshots', { recursive: true });

  for (const shot of todo) {
    const target = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(`${shot.name}: ${JSON.stringify(msg.params.exceptionDetails).slice(0, 400)}`);
      }
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        errors.push(`${shot.name}: console.error ${JSON.stringify(msg.params.args).slice(0, 300)}`);
      }
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const mid = ++id;
      pending.set(mid, { resolve, reject });
      ws.send(JSON.stringify({ id: mid, method, params }));
    });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
    await send('Page.navigate', { url: `${BASE}${shot.query}` });

    let ready = false;
    for (let i = 0; i < 75; i += 1) {
      await sleep(200);
      const r = await send('Runtime.evaluate', { expression: 'window.__shotReady === true', returnByValue: true });
      if (r.result?.value) {
        ready = true;
        break;
      }
    }
    if (!ready) {
      errors.push(`${shot.name}: __shotReady never became true`);
      ws.close();
      continue;
    }
    await sleep(300);
    const shotResult = await send('Page.captureScreenshot', { format: 'jpeg', quality: 85 });
    const bytes = Buffer.from(shotResult.data, 'base64');
    await writeFile(`screenshots/${shot.name}`, bytes);
    console.log(`${shot.name}: ${(bytes.length / 1024).toFixed(1)} KiB`);
    const state = await send('Runtime.evaluate', {
      expression: 'JSON.stringify(window.__clockwork ? window.__clockwork.state() : null)',
      returnByValue: true,
    });
    console.log(`  state: ${state.result?.value}`);
    ws.close();
    await fetch(`http://localhost:${PORT}/json/close/${target.id}`);
  }
} finally {
  chrome.kill('SIGKILL');
}

if (errors.length > 0) {
  console.error('PAGE ERRORS:');
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log('all shots captured, no page errors');
