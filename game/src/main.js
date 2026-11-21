// Clockwork Twins: bootstrap, game loop and screen wiring.
// One job: start the game, run the frame loop, and connect the buttons.
import { VIEW_W, VIEW_H } from './config.js';
import { createState, startLevel, tick } from './state.js';
import { render } from './render.js';
import { attachInput, simulateClick } from './input.js';
import { stageShot } from './shots.js';
import { setMuted, isMuted } from './audio.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const state = createState();
const mouse = { x: -1, y: -1 };

// Best score, kept on this machine only.
try {
  state.best = Number(window.localStorage.getItem('clockwork-twins-best') || 0) || 0;
} catch {
  state.best = 0;
}

function saveBest() {
  try {
    window.localStorage.setItem('clockwork-twins-best', String(state.best));
  } catch {
    // storage unavailable: the game plays on without it.
  }
}

const hooks = {
  selectLevel(i) {
    state.levelResults = state.levelResults.filter((r, idx) => idx < i);
    startLevel(state, i);
  },
  toMenu() {
    state.screen = 'title';
    state.message = '';
  },
  togglePause() {
    if (state.screen === 'playing') state.screen = 'paused';
    else if (state.screen === 'paused') state.screen = 'playing';
  },
  toggleSound() {
    setMuted(!isMuted());
  },
};

attachInput(canvas, state, mouse, hooks);

// Fit the 1280x800 frame into the window, keeping its shape.
function fit() {
  const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  canvas.style.width = `${Math.floor(VIEW_W * scale)}px`;
  canvas.style.height = `${Math.floor(VIEW_H * scale)}px`;
}
window.addEventListener('resize', fit);
fit();

// Screenshot staging: ?shot=title|play|complete&scene=N&found=a,b,c
// freezes the clock and stages a real frame of the game.
const staged = stageShot(state);
if (staged) {
  state.now = 1.2;
}

let last = performance.now();
let frames = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!staged) {
    tick(state, dt);
    if (state.score > state.best) {
      state.best = state.score;
      saveBest();
    }
  }
  render(ctx, state, mouse);
  if (state.message && statusEl.textContent !== state.message) {
    statusEl.textContent = state.message;
  }
  frames += 1;
  if (staged && frames >= 2) {
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Hooks for the screenshot stager and the playtest, and for debugging.
window.__clockwork = {
  state() {
    return {
      screen: state.screen,
      level: state.levelIndex,
      found: [...state.found],
      score: state.score,
      timeLeft: Math.round(state.timeLeft),
      hintsLeft: state.hintsLeft,
      misses: state.misses,
    };
  },
  click(panel, x, y) {
    return simulateClick(state, panel, x, y);
  },
};
