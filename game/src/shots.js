// Clockwork Twins: screenshot staging.
// One job: turn a ?shot= URL into a real, frozen frame of the game.
// The stager plays the game for real (real clicks, real state), then the
// main loop freezes the clock, so the same URL always renders the same shot.
//   ?shot=title                      the title screen
//   ?shot=play&scene=1&found=a,b,c   mid-play, those differences already found
//   ?shot=complete&scene=1           the level-complete screen, all 7 found
import { SCENES } from './scenes/index.js';
import { startLevel } from './state.js';
import { simulateClick } from './input.js';

export function stageShot(state) {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return false;
  const sceneIndex = Math.max(
    0,
    Math.min(SCENES.length - 1, Number(params.get('scene') || 1) - 1),
  );
  const scene = SCENES[sceneIndex];

  if (shot === 'title') {
    state.screen = 'title';
    state.levelIndex = 0;
    return true;
  }

  startLevel(state, sceneIndex);
  // A staged frame is mid-game: a settled clock and a plausible score.
  state.timeLeft = 118;
  state.score = 0;

  if (shot === 'play') {
    const wanted = (params.get('found') || '').split(',').filter(Boolean);
    for (const id of wanted) {
      const diff = scene.differences.find((d) => d.id === id);
      if (diff) simulateClick(state, 'left', diff.x, diff.y);
    }
    // Stage the score the finds earned, minus nothing: the clicks above
    // already scored it. Settle the floaters by moving the clock forward
    // past their lifetime, then freeze.
    state.now = 2.0;
    state.floaters = [];
    state.particles = [];
    return true;
  }

  if (shot === 'complete') {
    for (const diff of scene.differences) {
      simulateClick(state, 'left', diff.x, diff.y);
    }
    state.now = 2.0;
    state.floaters = [];
    state.particles = [];
    return true;
  }

  return false;
}
