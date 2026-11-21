// Clockwork Twins: mouse and keyboard.
// One job: turn pointer and key events into game actions.
// It calls the state functions, and the hooks main.js wires up for the
// buttons that change screens.
import { PANEL, VIEW_W, VIEW_H } from './config.js';
import { clickAt, useHint, nextLevel, startLevel } from './state.js';
import { hudButtons, overlayButtons } from './render.js';
import { ensureAudio, setMuted, isMuted } from './audio.js';

function toCanvas(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW_W,
    y: ((clientY - rect.top) / rect.height) * VIEW_H,
  };
}

function panelAt(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.h) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.w) {
    return { side: 'left', x: x - PANEL.leftX, y: y - PANEL.y };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.w) {
    return { side: 'right', x: x - PANEL.rightX, y: y - PANEL.y };
  }
  return null;
}

function inside(b, x, y) {
  return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
}

export function attachInput(canvas, state, mouse, hooks) {
  function handleOverlayClick(x, y) {
    for (const b of overlayButtons(state)) {
      if (!inside(b, x, y)) continue;
      ensureAudio();
      if (b.id.startsWith('level-')) {
        hooks.selectLevel(Number(b.id.slice(6)));
        return true;
      }
      if (b.id === 'next') { nextLevel(state); return true; }
      if (b.id === 'replay') { startLevel(state, state.levelIndex); return true; }
      if (b.id === 'retry') { startLevel(state, state.levelIndex); return true; }
      if (b.id === 'again') {
        state.levelResults = [];
        state.score = 0;
        state.totalClicks = 0;
        state.totalFound = 0;
        state.bestStreak = 0;
        startLevel(state, 0);
        return true;
      }
      if (b.id === 'menu') { hooks.toMenu(); return true; }
      if (b.id === 'resume') { hooks.togglePause(); return true; }
      if (b.id === 'restart') { startLevel(state, state.levelIndex); return true; }
    }
    return false;
  }

  function handleHudClick(x, y) {
    for (const b of hudButtons(state)) {
      if (!inside(b, x, y) || !b.enabled) continue;
      ensureAudio();
      if (b.id === 'hint') { useHint(state); return true; }
      if (b.id === 'sound') { hooks.toggleSound(); return true; }
      if (b.id === 'pause') { hooks.togglePause(); return true; }
    }
    return false;
  }

  canvas.addEventListener('pointermove', (e) => {
    const p = toCanvas(canvas, e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
  });

  canvas.addEventListener('pointerdown', (e) => {
    ensureAudio();
    const p = toCanvas(canvas, e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    if (handleHudClick(p.x, p.y)) return;
    if (state.screen !== 'playing') {
      handleOverlayClick(p.x, p.y);
      return;
    }
    const hit = panelAt(p.x, p.y);
    if (hit) {
      state.crosshair = { x: hit.x, y: hit.y, panel: hit.side, visible: true };
      clickAt(state, hit.side, hit.x, hit.y);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.repeat && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight'
      && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const k = e.key;
    if (k === 'm' || k === 'M') { hooks.toggleSound(); return; }
    if (k === 'p' || k === 'P' || k === 'Escape') {
      if (state.screen === 'playing' || state.screen === 'paused') hooks.togglePause();
      return;
    }
    if (state.screen === 'title') {
      if (k === '1' || k === '2' || k === '3') hooks.selectLevel(Number(k) - 1);
      else if (k === 'Enter') hooks.selectLevel(0);
      return;
    }
    if (state.screen === 'levelComplete' && (k === 'n' || k === 'N' || k === 'Enter')) {
      nextLevel(state);
      return;
    }
    if (state.screen === 'gameover' && k === 'Enter') {
      startLevel(state, state.levelIndex);
      return;
    }
    if (state.screen === 'allComplete' && k === 'Enter') {
      state.levelResults = [];
      state.score = 0;
      state.totalClicks = 0;
      state.totalFound = 0;
      state.bestStreak = 0;
      startLevel(state, 0);
      return;
    }
    if (state.screen !== 'playing') return;
    const step = e.shiftKey ? 48 : 14;
    const ch = state.crosshair;
    if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
      e.preventDefault();
      ch.visible = true;
      if (k === 'ArrowLeft') {
        ch.x -= step;
        if (ch.x < 0 && ch.panel === 'right') { ch.panel = 'left'; ch.x = PANEL.w + ch.x; }
        ch.x = Math.max(0, ch.x);
      }
      if (k === 'ArrowRight') {
        ch.x += step;
        if (ch.x > PANEL.w && ch.panel === 'left') { ch.panel = 'right'; ch.x -= PANEL.w; }
        ch.x = Math.min(PANEL.w, ch.x);
      }
      if (k === 'ArrowUp') ch.y = Math.max(0, ch.y - step);
      if (k === 'ArrowDown') ch.y = Math.min(PANEL.h, ch.y + step);
      return;
    }
    if (k === ' ' || k === 'Enter') {
      e.preventDefault();
      ensureAudio();
      ch.visible = true;
      clickAt(state, ch.panel, ch.x, ch.y);
      return;
    }
    if (k === 'h' || k === 'H') { useHint(state); return; }
    if (k === 'r' || k === 'R') { startLevel(state, state.levelIndex); }
  });
}

// Programmatic click, used by the screenshot stager and the playtest:
// it runs exactly the code a real pointer click runs.
export function simulateClick(state, panel, x, y) {
  state.crosshair = { x, y, panel, visible: true };
  return clickAt(state, panel, x, y);
}
