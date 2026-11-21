// Clockwork Twins: shared constants, layout and palette.
// One job: every number and colour the game agrees on lives here.
export const VIEW_W = 1280;
export const VIEW_H = 800;

// The two picture panels. Each shows the same scene, 592 by 520 in scene
// coordinates; the right panel is the one with the differences.
export const PANEL = {
  w: 592,
  h: 520,
  y: 96,
  leftX: 24,
  rightX: 664,
  gap: 48,
};

export const HUD_H = 88;
export const FOOTER_Y = 636;

export const LEVEL_TIME_SEC = 150;
export const HINTS_PER_LEVEL = 3;
export const MISS_PENALTY_SEC = 5;
export const FIND_POINTS = 100;
export const STREAK_BONUS = 25;
export const HINT_COST = 15;
export const MISS_POINTS = 25;

// A difference counts as found when the click lands inside its circle.
export const HIT_RADIUS = 34;

export const PALETTE = {
  page: '#241a12',
  pageEdge: '#17100a',
  panelFrame: '#8a6b45',
  panelFrameDark: '#5d452a',
  gold: '#f2b234',
  goldSoft: '#ffd97a',
  cream: '#f6ead2',
  ink: '#2c2118',
  red: '#d95f4b',
  green: '#7fb069',
  hud: '#3a2a1a',
  hudLine: '#6b5236',
  muted: '#b9a586',
};

export const SCENE_NAMES = [
  "The Clockmaker's Attic",
  'The Starlight Bakery',
  "The Botanist's Greenhouse",
];
