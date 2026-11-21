// Clockwork Twins: the game's state and rules.
// One job: what a level is, what a click does, what a hint costs.
// Rendering never mutates this; input calls these functions.
import { SCENES } from './scenes/index.js';
import {
  LEVEL_TIME_SEC,
  HINTS_PER_LEVEL,
  MISS_PENALTY_SEC,
  FIND_POINTS,
  STREAK_BONUS,
  HINT_COST,
  MISS_POINTS,
  HIT_RADIUS,
} from './config.js';
import { soundFind, soundMiss, soundHint, soundLevelClear, soundWin } from './audio.js';

export function createState() {
  return {
    screen: 'title', // title | playing | paused | levelComplete | allComplete | gameover
    levelIndex: 0,
    found: new Set(),
    foundOrder: [],
    misses: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintsUsed: 0,
    timeLeft: LEVEL_TIME_SEC,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalClicks: 0,
    totalFound: 0,
    levelResults: [],
    floaters: [], // {x, y, text, color, born, panel}
    particles: [], // {x, y, vx, vy, born, color, panel}
    missFlashes: [], // {x, y, born, panel}
    hintPulse: null, // {diff, until}
    crosshair: { x: 296, y: 260, panel: 'left', visible: false },
    message: '',
    messageUntil: 0,
    stars: 0,
    levelBonus: 0,
    now: 0, // seconds since the game started (animation clock)
    best: 0,
  };
}

export function currentScene(state) {
  return SCENES[state.levelIndex];
}

export function startLevel(state, index) {
  state.levelIndex = index;
  state.found = new Set();
  state.foundOrder = [];
  state.misses = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintsUsed = 0;
  state.timeLeft = LEVEL_TIME_SEC;
  state.streak = 0;
  state.floaters = [];
  state.particles = [];
  state.missFlashes = [];
  state.hintPulse = null;
  state.screen = 'playing';
  state.message = `${currentScene(state).blurb} Find 7 differences.`;
  state.messageUntil = state.now + 4;
}

export function foundCount(state) {
  return state.found.size;
}

export function remainingCount(state) {
  return currentScene(state).differences.length - state.found.size;
}

function addFloater(state, panel, x, y, text, color) {
  state.floaters.push({ panel, x, y, text, color, born: state.now });
}

function burst(state, panel, x, y, color) {
  for (let i = 0; i < 14; i += 1) {
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
    const speed = 40 + Math.random() * 90;
    state.particles.push({
      panel, x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed - 30,
      born: state.now,
      color,
    });
  }
}

// A click inside a panel, in scene coordinates (0..592, 0..520).
// Returns what happened, so the caller can react.
export function clickAt(state, panel, x, y) {
  if (state.screen !== 'playing') return { result: 'ignored' };
  state.totalClicks += 1;
  const scene = currentScene(state);
  let hit = null;
  for (const diff of scene.differences) {
    if (state.found.has(diff.id)) continue;
    const d = Math.hypot(diff.x - x, diff.y - y);
    if (d <= diff.r) {
      hit = diff;
      break;
    }
  }
  if (hit) {
    state.found.add(hit.id);
    state.foundOrder.push(hit.id);
    state.totalFound += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const bonus = (state.streak - 1) * STREAK_BONUS;
    const points = FIND_POINTS + bonus;
    state.score += points;
    addFloater(state, 'left', hit.x, hit.y - 30, `+${points}`, '#ffd97a');
    addFloater(state, 'right', hit.x, hit.y - 30, `+${points}`, '#ffd97a');
    burst(state, 'left', hit.x, hit.y, '#f2b234');
    burst(state, 'right', hit.x, hit.y, '#f2b234');
    soundFind();
    if (state.found.size === scene.differences.length) {
      completeLevel(state);
      return { result: 'found', diff: hit, levelDone: true };
    }
    state.message = `Found: ${hit.label}. ${remainingCount(state)} to go.`;
    state.messageUntil = state.now + 3;
    return { result: 'found', diff: hit };
  }
  state.misses += 1;
  state.streak = 0;
  state.timeLeft = Math.max(0, state.timeLeft - MISS_PENALTY_SEC);
  state.score = Math.max(0, state.score - MISS_POINTS);
  state.missFlashes.push({ panel, x, y, born: state.now });
  addFloater(state, panel, x, y - 24, `-${MISS_POINTS} · -${MISS_PENALTY_SEC}s`, '#ff9a8a');
  soundMiss();
  state.message = 'Not quite — that spot matches. −5 seconds.';
  state.messageUntil = state.now + 2.5;
  return { result: 'miss' };
}

export function useHint(state) {
  if (state.screen !== 'playing') return null;
  if (state.hintsLeft <= 0) {
    state.message = 'No hints left in this level.';
    state.messageUntil = state.now + 2;
    return null;
  }
  const scene = currentScene(state);
  const remaining = scene.differences.filter((d) => !state.found.has(d.id));
  if (remaining.length === 0) return null;
  const diff = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.hintsUsed += 1;
  state.score = Math.max(0, state.score - HINT_COST);
  state.hintPulse = { diff, until: state.now + 3 };
  soundHint();
  state.message = `Hint: look near the ${diff.label.replace(/^a |^the /, '')}…`;
  state.messageUntil = state.now + 3;
  return diff;
}

export function starsForLevel(state) {
  if (state.hintsUsed === 0 && state.timeLeft >= 45) return 3;
  if (state.hintsUsed <= 1 && state.timeLeft >= 20) return 2;
  return 1;
}

function completeLevel(state) {
  const stars = starsForLevel(state);
  const bonus = Math.round(state.timeLeft) * 2;
  state.levelBonus = bonus;
  state.score += bonus;
  state.stars = stars;
  state.levelResults.push({
    scene: currentScene(state).name,
    stars,
    misses: state.misses,
    hintsUsed: state.hintsUsed,
    timeLeft: Math.round(state.timeLeft),
  });
  soundLevelClear();
  if (state.levelIndex + 1 >= SCENES.length) {
    state.screen = 'allComplete';
    soundWin();
    if (state.score > state.best) state.best = state.score;
  } else {
    state.screen = 'levelComplete';
  }
}

export function nextLevel(state) {
  startLevel(state, state.levelIndex + 1);
}

export function tick(state, dt) {
  state.now += dt;
  if (state.screen === 'playing') {
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'gameover';
      if (state.score > state.best) state.best = state.score;
    }
  }
  // age the transient effects
  state.floaters = state.floaters.filter((f) => state.now - f.born < 1.1);
  state.particles = state.particles.filter((p) => state.now - p.born < 0.9);
  state.missFlashes = state.missFlashes.filter((m) => state.now - m.born < 0.6);
  if (state.hintPulse && state.now > state.hintPulse.until) state.hintPulse = null;
}

export function accuracy(state) {
  if (state.totalClicks === 0) return 100;
  return Math.round((state.totalFound / state.totalClicks) * 100);
}
