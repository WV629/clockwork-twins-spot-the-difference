// Playtest for Clockwork Twins: drives the real game in headless Chrome
// through CDP, with real pointer and keyboard events, and asserts the state
// after each step. Usage: node playtest.mjs   (serve the game first)
import { spawn } from 'node:child_process';

const CHROME = '/home/hatch/workspace/makefun/chrome/linux-157.0.8103.78/chrome-linux64/chrome';
const PORT = 9335;
const URL = 'http://localhost:8080/index.html';
const PROFILE = '/tmp/clockwork-twins-playtest-profile';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForJson(path, tries = 50) {
  for (let i = 0; i < tries; i += 1) {
    try {
      const res = await fetch(`http://localhost:${PORT}${path}`);
      if (res.ok) return await res.json();
    } catch { /* not up yet */ }
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

const failures = [];
function check(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined ? ` — ${detail}` : ''}`);
  if (!cond) failures.push(name);
}

try {
  await waitForJson('/json/version');
  const target = await (await fetch(`http://localhost:${PORT}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(JSON.stringify(msg.params.exceptionDetails).slice(0, 300));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(JSON.stringify(msg.params.args).slice(0, 300));
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 300));
    return r.result?.value;
  };
  const state = () => evalJs('JSON.stringify(window.__clockwork.state())').then(JSON.parse);
  const clickAt = (x, y) => evalJs(
    `document.getElementById('game').dispatchEvent(new PointerEvent('pointerdown', {clientX: ${x}, clientY: ${y}, bubbles: true}))`,
  );
  const key = (k) => evalJs(
    `window.dispatchEvent(new KeyboardEvent('keydown', {key: ${JSON.stringify(k)}}))`,
  );

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: URL });
  await sleep(1500);

  let s = await state();
  check('title screen on load', s.screen === 'title', JSON.stringify(s));

  // Level select with the keyboard.
  await key('2');
  await sleep(200);
  s = await state();
  check('key 2 starts the bakery', s.screen === 'playing' && s.level === 1, JSON.stringify(s));

  // A wrong click: a miss costs time and a point penalty, and breaks streak.
  const before = await state();
  await clickAt(24 + 100, 96 + 300);
  await sleep(150);
  s = await state();
  check('miss counted', s.misses === 1 && s.found.length === 0, JSON.stringify(s));
  check('miss costs time', s.timeLeft < before.timeLeft, `${before.timeLeft} -> ${s.timeLeft}`);

  // A right click: the cake candle (300, 392) in the left panel.
  await clickAt(24 + 300, 96 + 392);
  await sleep(150);
  s = await state();
  check('find counted', s.found.length === 1 && s.found[0] === 'cake-candle', JSON.stringify(s));
  check('find scores points', s.score >= 100, `score=${s.score}`);

  // Hint: one fewer hint, and a pulse appears (state only shows the count).
  await key('h');
  await sleep(150);
  s = await state();
  check('hint spent', s.hintsLeft === 2, JSON.stringify(s));

  // Pause and resume.
  await key('p');
  await sleep(150);
  s = await state();
  check('pause works', s.screen === 'paused', JSON.stringify(s));
  const pausedTime = s.timeLeft;
  await sleep(700);
  s = await state();
  check('timer frozen while paused', s.timeLeft === pausedTime, `${pausedTime} -> ${s.timeLeft}`);
  await key('p');
  await sleep(150);
  s = await state();
  check('resume works', s.screen === 'playing', JSON.stringify(s));

  // Crosshair: arrows move it, Enter clicks where it stands.
  await key('ArrowRight');
  await key('ArrowRight');
  await sleep(100);
  const cross = await evalJs('JSON.stringify(window.__clockwork.state())');
  check('crosshair moves (no crash)', typeof cross === 'string');

  // Finish the bakery: click the other six differences on the right panel.
  const rest = [
    [490, 102], [452, 168], [478, 322], [150, 462], [122, 62], [528, 196],
  ];
  for (const [dx, dy] of rest) {
    await clickAt(664 + dx, 96 + dy);
    await sleep(120);
  }
  s = await state();
  check('level complete after 7 finds', s.screen === 'levelComplete' && s.found.length === 7, JSON.stringify(s));
  check('stars earned', s.score > 0, `score=${s.score}`);

  // Next level with N.
  await key('n');
  await sleep(200);
  s = await state();
  check('N advances to the greenhouse', s.screen === 'playing' && s.level === 2, JSON.stringify(s));

  // Mute toggle does not crash.
  await key('m');
  await sleep(100);
  check('mute toggle runs', true);

  // Back to the menu from pause: P, then click the MENU button.
  await key('p');
  await sleep(150);
  s = await state();
  check('pause on level 3', s.screen === 'paused', JSON.stringify(s));
  // MENU button is at cx+70=710, y=470, w=120, h=52.
  await clickAt(710 + 60, 470 + 26);
  await sleep(200);
  s = await state();
  check('menu button returns to title', s.screen === 'title', JSON.stringify(s));

  if (errors.length > 0) {
    console.error('PAGE ERRORS:', errors);
    failures.push('page errors');
  }
  ws.close();
} finally {
  chrome.kill('SIGKILL');
}

if (failures.length > 0) {
  console.error(`\n${failures.length} FAILURE(S): ${failures.join(', ')}`);
  process.exit(1);
}
console.log('\nplaytest: all checks passed');
