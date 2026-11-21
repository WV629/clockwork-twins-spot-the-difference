// Clockwork Twins: everything the player sees.
// One job: draw the frame, the HUD, both panels, the markers and the screens.
// It reads state, never mutates it. Buttons are laid out here too, so the
// input module can hit-test the exact rectangles this file draws.
import { VIEW_W, VIEW_H, PANEL, PALETTE, SCENE_NAMES } from './config.js';
import { SCENES } from './scenes/index.js';
import { currentScene, foundCount, remainingCount, accuracy } from './state.js';
import { isMuted } from './audio.js';

const GOLD = PALETTE.gold;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawPanelFrame(ctx, x, y, w, h, label) {
  ctx.fillStyle = PALETTE.panelFrameDark;
  roundRect(ctx, x - 6, y - 6, w + 12, h + 12, 14);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelFrame;
  ctx.lineWidth = 2;
  roundRect(ctx, x - 6, y - 6, w + 12, h + 12, 14);
  ctx.stroke();
  // corner badge
  ctx.fillStyle = PALETTE.panelFrame;
  roundRect(ctx, x - 6, y - 6, 44, 26, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 16, y + 8);
}

function drawMarker(ctx, x, y, r, t, kind) {
  const pulse = 1 + Math.sin(t * 4) * 0.04;
  const rr = r * pulse;
  ctx.save();
  ctx.shadowColor = 'rgba(242,178,52,0.9)';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = kind === 'hint' ? '#fff3b0' : GOLD;
  ctx.lineWidth = kind === 'hint' ? 3 : 5;
  if (kind === 'hint') ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  if (kind === 'found') {
    // little check badge on the ring
    const bx = x + rr * 0.7;
    const by = y - rr * 0.7;
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(bx, by, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c2118';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 5, by);
    ctx.lineTo(bx - 1.5, by + 4);
    ctx.lineTo(bx + 5.5, by - 4.5);
    ctx.stroke();
  }
}

function drawScenePanel(ctx, state, scene, applied, panelX, panelLabel) {
  const { y, w, h } = PANEL;
  drawPanelFrame(ctx, panelX, y, w, h, panelLabel);
  ctx.save();
  ctx.beginPath();
  ctx.rect(panelX, y, w, h);
  ctx.clip();
  ctx.translate(panelX, y);
  scene.draw(ctx, applied, state.now);
  ctx.restore();
  // markers for found differences, on both panels
  ctx.save();
  ctx.translate(panelX, y);
  for (const diff of scene.differences) {
    if (state.found.has(diff.id)) {
      drawMarker(ctx, diff.x, diff.y, diff.r, state.now, 'found');
    }
  }
  // hint pulse, on both panels
  if (state.hintPulse) {
    const d = state.hintPulse.diff;
    drawMarker(ctx, d.x, d.y, d.r + 4, state.now, 'hint');
  }
  ctx.restore();
  // "remaining" chip, bottom-left of the panel
  ctx.fillStyle = 'rgba(23,16,10,0.78)';
  roundRect(ctx, panelX + 10, y + h - 36, 128, 26, 13);
  ctx.fill();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${remainingCount(state)} differences left`, panelX + 22, y + h - 23);
}

function drawHud(ctx, state) {
  ctx.fillStyle = PALETTE.hud;
  ctx.fillRect(0, 0, VIEW_W, 88);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, 88, VIEW_W, 3);
  // title, left
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CLOCKWORK TWINS', 24, 34);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(currentScene(state).name, 24, 60);
  // counter pill, centre
  const cx = VIEW_W / 2;
  ctx.fillStyle = '#241a10';
  roundRect(ctx, cx - 150, 12, 300, 42, 21);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  roundRect(ctx, cx - 150, 12, 300, 42, 21);
  ctx.stroke();
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`FOUND ${foundCount(state)} / 7`, cx, 41);
  // timer bar under the pill
  const barW = 300;
  const frac = Math.max(0, state.timeLeft / 150);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, cx - barW / 2, 60, barW, 10, 5);
  ctx.fill();
  ctx.fillStyle = state.timeLeft <= 30 ? '#d95f4b' : GOLD;
  if (frac > 0) {
    roundRect(ctx, cx - barW / 2, 60, barW * frac, 10, 5);
    ctx.fill();
  }
  ctx.fillStyle = state.timeLeft <= 30 ? '#ff9a8a' : PALETTE.cream;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText(`${Math.ceil(state.timeLeft)}s`, cx, 84);
  // score, right
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`SCORE ${state.score}`, 1010, 34);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillText(
    state.streak >= 2 ? `STREAK ×${state.streak}` : `BEST ${state.best}`,
    1010, 58,
  );
  // HUD buttons
  for (const b of hudButtons(state)) {
    ctx.fillStyle = b.enabled ? '#4a3520' : '#33261a';
    roundRect(ctx, b.x, b.y, b.w, b.h, 9);
    ctx.fill();
    ctx.strokeStyle = b.enabled ? GOLD : '#6b5236';
    ctx.lineWidth = 1.5;
    roundRect(ctx, b.x, b.y, b.w, b.h, 9);
    ctx.stroke();
    ctx.fillStyle = b.enabled ? PALETTE.cream : PALETTE.muted;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  }
}

export function hudButtons(state) {
  return [
    {
      id: 'hint', label: `HINT ${state.hintsLeft}`, x: 1030, y: 16, w: 74, h: 30,
      enabled: state.screen === 'playing' && state.hintsLeft > 0,
    },
    {
      id: 'sound', label: isMuted() ? 'MUTED' : 'SOUND', x: 1112, y: 16, w: 74, h: 30,
      enabled: true,
    },
    {
      id: 'pause', label: '❚❚', x: 1194, y: 16, w: 46, h: 30,
      enabled: state.screen === 'playing' || state.screen === 'paused',
    },
  ];
}

function drawFooter(ctx, state) {
  ctx.fillStyle = PALETTE.muted;
  ctx.font = 'italic 16px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  // The message line belongs to play; overlay screens have their own hints
  // lower down, so keep it empty there instead of printing over them.
  const msg = state.screen === 'playing' && state.now < state.messageUntil && state.message
    ? state.message
    : '';
  ctx.fillText(msg, VIEW_W / 2, 668);
  // controls help
  ctx.font = '13px system-ui, sans-serif';
  ctx.fillStyle = '#8a7a62';
  ctx.textAlign = 'left';
  ctx.fillText('Click a difference  ·  Arrow keys + Enter move the crosshair  ·  H hint  ·  P pause  ·  M sound', 24, 716);
  // level dots
  let dx = VIEW_W - 24;
  for (let i = SCENES.length - 1; i >= 0; i -= 1) {
    const done = state.levelResults[i];
    const current = i === state.levelIndex && (state.screen === 'playing' || state.screen === 'paused');
    ctx.fillStyle = done ? GOLD : current ? PALETTE.cream : '#4a3a28';
    ctx.beginPath();
    ctx.arc(dx - 10, 710, 8, 0, Math.PI * 2);
    ctx.fill();
    if (done) {
      ctx.fillStyle = '#2c2118';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(done.stars), dx - 10, 711);
    }
    dx -= 30;
  }
  ctx.fillStyle = '#8a7a62';
  ctx.font = '13px system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('LEVELS', dx - 8, 715);
  // accuracy
  ctx.textAlign = 'left';
  ctx.fillText(`Accuracy ${accuracy(state)}%  ·  Found ${state.totalFound}  ·  Misses ${state.misses}`, 24, 752);
  ctx.textAlign = 'right';
  ctx.fillText('Clockwork Twins — an original game. No two pictures are quite the same.', VIEW_W - 24, 752);
}

function drawFloaters(ctx, state) {
  ctx.textAlign = 'center';
  for (const f of state.floaters) {
    const age = state.now - f.born;
    const alpha = 1 - age / 1.1;
    const y = f.y - age * 34;
    const panelX = f.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = f.color;
    ctx.font = 'bold 20px Georgia, serif';
    ctx.fillText(f.text, panelX + f.x, PANEL.y + y);
    ctx.globalAlpha = 1;
  }
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    const age = state.now - p.born;
    const alpha = 1 - age / 0.9;
    const panelX = p.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(panelX + p.x + p.vx * age, PANEL.y + p.y + p.vy * age + 60 * age * age, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

function drawMissFlashes(ctx, state) {
  for (const m of state.missFlashes) {
    const age = state.now - m.born;
    const alpha = 1 - age / 0.6;
    const panelX = m.panel === 'left' ? PANEL.leftX : PANEL.rightX;
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#ff6a55';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const x = panelX + m.x;
    const y = PANEL.y + m.y;
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.moveTo(x + 12, y - 12);
    ctx.lineTo(x - 12, y + 12);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawCrosshair(ctx, state) {
  if (!state.crosshair.visible || state.screen !== 'playing') return;
  const panelX = state.crosshair.panel === 'left' ? PANEL.leftX : PANEL.rightX;
  const x = panelX + state.crosshair.x;
  const y = PANEL.y + state.crosshair.y;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 16, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 22, y);
  ctx.lineTo(x - 8, y);
  ctx.moveTo(x + 8, y);
  ctx.lineTo(x + 22, y);
  ctx.moveTo(x, y - 22);
  ctx.lineTo(x, y - 8);
  ctx.moveTo(x, y + 8);
  ctx.lineTo(x, y + 22);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(x, y, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawButton(ctx, b, hover) {
  ctx.fillStyle = hover ? '#f2b234' : '#4a3520';
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  roundRect(ctx, b.x, b.y, b.w, b.h, 10);
  ctx.stroke();
  ctx.fillStyle = hover ? '#2c2118' : PALETTE.cream;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
}

function dim(ctx) {
  ctx.fillStyle = 'rgba(16,10,6,0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
}

function card(ctx, x, y, w, h) {
  ctx.fillStyle = '#2e2114';
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.stroke();
}

function starsLine(ctx, cx, y, stars, size) {
  ctx.font = `${size}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  let s = '';
  for (let i = 0; i < 3; i += 1) s += i < stars ? '★' : '☆';
  ctx.fillStyle = GOLD;
  ctx.fillText(s, cx, y);
}

export function overlayButtons(state) {
  const cx = VIEW_W / 2;
  if (state.screen === 'title') {
    const cards = [];
    SCENES.forEach((scene, i) => {
      cards.push({
        id: `level-${i}`, label: scene.name, x: 190 + i * 310, y: 400, w: 280, h: 96,
        kind: 'card', sub: '7 differences',
      });
    });
    return cards;
  }
  if (state.screen === 'levelComplete') {
    return [
      { id: 'next', label: 'NEXT LEVEL  →', x: cx - 230, y: 560, w: 220, h: 52, kind: 'button' },
      { id: 'replay', label: 'REPLAY', x: cx + 10, y: 560, w: 120, h: 52, kind: 'button' },
      { id: 'menu', label: 'MENU', x: cx + 140, y: 560, w: 90, h: 52, kind: 'button' },
    ];
  }
  if (state.screen === 'allComplete') {
    return [
      { id: 'again', label: 'PLAY AGAIN', x: cx - 130, y: 560, w: 170, h: 52, kind: 'button' },
      { id: 'menu', label: 'MENU', x: cx + 60, y: 560, w: 90, h: 52, kind: 'button' },
    ];
  }
  if (state.screen === 'gameover') {
    return [
      { id: 'retry', label: 'RETRY LEVEL', x: cx - 130, y: 540, w: 170, h: 52, kind: 'button' },
      { id: 'menu', label: 'MENU', x: cx + 60, y: 540, w: 90, h: 52, kind: 'button' },
    ];
  }
  if (state.screen === 'paused') {
    return [
      { id: 'resume', label: 'RESUME', x: cx - 190, y: 470, w: 120, h: 52, kind: 'button' },
      { id: 'restart', label: 'RESTART', x: cx - 60, y: 470, w: 120, h: 52, kind: 'button' },
      { id: 'menu', label: 'MENU', x: cx + 70, y: 470, w: 120, h: 52, kind: 'button' },
    ];
  }
  return [];
}

function drawTitle(ctx, state, mouse) {
  dim(ctx);
  const cx = VIEW_W / 2;
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('CLOCKWORK TWINS', cx, 150);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'italic 26px Georgia, serif';
  ctx.fillText('Spot the Difference', cx, 192);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Three hand-drawn scenes. Seven changes hiding in each. Your eyes against the clock.', cx, 228);
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Click a difference in either picture — a gold ring marks it. Wrong clicks cost 5 seconds.', cx, 258);
  ctx.fillText('Arrows + Enter move the crosshair · H hints · P pauses · M mutes', cx, 282);
  // level cards
  for (const b of overlayButtons(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    card(ctx, b.x, b.y, b.w, b.h);
    if (hover) {
      ctx.strokeStyle = '#ffd97a';
      ctx.lineWidth = 3;
      roundRect(ctx, b.x, b.y, b.w, b.h, 18);
      ctx.stroke();
    }
    ctx.fillStyle = PALETTE.cream;
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(b.label, b.x + b.w / 2, b.y + 34);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(b.sub, b.x + b.w / 2, b.y + 64);
    const done = state.levelResults[SCENES.findIndex((s) => s.name === b.label)];
    if (done) starsLine(ctx, b.x + b.w / 2, b.y + 84, done.stars, 16);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.best > 0 ? `Best score: ${state.best}` : 'No score yet — make the clockmaker proud.', cx, 540);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillText('Click a scene, or press 1, 2 or 3', cx, 580);
}

function drawLevelComplete(ctx, state, mouse) {
  dim(ctx);
  const cx = VIEW_W / 2;
  card(ctx, cx - 320, 130, 640, 400, 18);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('LEVEL COMPLETE', cx, 200);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '20px Georgia, serif';
  ctx.fillText(currentScene(state).name, cx, 236);
  starsLine(ctx, cx, 288, state.stars, 44);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText(`All 7 differences found  ·  Time left ${Math.round(state.timeLeft)}s  ·  Time bonus +${state.levelBonus}`, cx, 340);
  ctx.fillText(`Misses ${state.misses}  ·  Hints used ${state.hintsUsed}  ·  Score ${state.score}`, cx, 372);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = 'italic 16px Georgia, serif';
  const tip = state.stars === 3
    ? 'Flawless. The clockmaker tips his hat.'
    : state.stars === 2
      ? 'Well spotted — one more careful pass earns the third star.'
      : 'Finished! Fewer hints and a faster eye earn more stars.';
  ctx.fillText(tip, cx, 420);
  for (const b of overlayButtons(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    drawButton(ctx, b, hover);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Press N for the next level', cx, 650);
}

function drawAllComplete(ctx, state, mouse) {
  dim(ctx);
  const cx = VIEW_W / 2;
  card(ctx, cx - 330, 120, 660, 420, 18);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 42px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('ALL SCENES SOLVED!', cx, 190);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = 'italic 20px Georgia, serif';
  ctx.fillText('Every difference in every room — the twins are identical again.', cx, 228);
  starsLine(ctx, cx, 280, 3, 40);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '18px system-ui, sans-serif';
  let y = 330;
  for (const r of state.levelResults) {
    ctx.fillText(`${r.scene}: ${'★'.repeat(r.stars)}${'☆'.repeat(3 - r.stars)}   ${r.timeLeft}s left   ${r.misses} misses`, cx, y);
    y += 30;
  }
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText(`FINAL SCORE ${state.score}   ·   Accuracy ${accuracy(state)}%   ·   Best streak ×${state.bestStreak}`, cx, y + 16);
  for (const b of overlayButtons(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    drawButton(ctx, b, hover);
  }
}

function drawGameOver(ctx, state, mouse) {
  dim(ctx);
  const cx = VIEW_W / 2;
  card(ctx, cx - 300, 140, 600, 380, 18);
  ctx.fillStyle = '#ff9a8a';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText("TIME'S UP", cx, 210);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`${currentScene(state).name} — you found ${foundCount(state)} of 7 differences.`, cx, 252);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillText(`Score ${state.score}  ·  The ${remainingCount(state)} you missed are still hiding.`, cx, 292);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = 'italic 16px Georgia, serif';
  ctx.fillText('The clock always wins in the end. Try again — the differences never move.', cx, 330);
  for (const b of overlayButtons(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    drawButton(ctx, b, hover);
  }
}

function drawPaused(ctx, state, mouse) {
  dim(ctx);
  const cx = VIEW_W / 2;
  card(ctx, cx - 260, 150, 520, 360, 18);
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', cx, 220);
  ctx.fillStyle = PALETTE.cream;
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`${currentScene(state).name} — ${foundCount(state)} of 7 found, ${Math.ceil(state.timeLeft)}s left`, cx, 262);
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '15px system-ui, sans-serif';
  ctx.fillText('Take a breath. The twins will wait.', cx, 296);
  for (const b of overlayButtons(state)) {
    const hover = mouse.x >= b.x && mouse.x <= b.x + b.w && mouse.y >= b.y && mouse.y <= b.y + b.h;
    drawButton(ctx, b, hover);
  }
  ctx.fillStyle = PALETTE.muted;
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('Press P or Esc to resume', cx, 560);
}

export function render(ctx, state, mouse) {
  // page background
  const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  bg.addColorStop(0, PALETTE.page);
  bg.addColorStop(1, PALETTE.pageEdge);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const scene = currentScene(state);
  const appliedLeft = new Set();
  const appliedRight = new Set(scene.differences.map((d) => d.id));

  drawHud(ctx, state);
  drawScenePanel(ctx, state, scene, appliedLeft, PANEL.leftX, 'A');
  drawScenePanel(ctx, state, scene, appliedRight, PANEL.rightX, 'B');
  // centre divider badge
  ctx.fillStyle = PALETTE.panelFrameDark;
  roundRect(ctx, PANEL.leftX + PANEL.w + 6, PANEL.y + 230, 36, 60, 10);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('7', PANEL.leftX + PANEL.w + 24, PANEL.y + 252);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('DIFFS', PANEL.leftX + PANEL.w + 24, PANEL.y + 272);

  drawParticles(ctx, state);
  drawMissFlashes(ctx, state);
  drawFloaters(ctx, state);
  drawCrosshair(ctx, state);
  drawFooter(ctx, state);

  if (state.screen === 'title') drawTitle(ctx, state, mouse);
  else if (state.screen === 'levelComplete') drawLevelComplete(ctx, state, mouse);
  else if (state.screen === 'allComplete') drawAllComplete(ctx, state, mouse);
  else if (state.screen === 'gameover') drawGameOver(ctx, state, mouse);
  else if (state.screen === 'paused') drawPaused(ctx, state, mouse);
}
