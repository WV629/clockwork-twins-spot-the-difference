// Clockwork Twins, scene 2: The Starlight Bakery.
// One job: draw this one scene, and list its seven differences.
// The scene is drawn in a 592 by 520 box. `applied` holds the ids of the
// differences to render in their changed form (the right-hand panel).
export const bakery = {
  id: 'bakery',
  name: 'The Starlight Bakery',
  blurb: 'Seven things changed while the bread was rising.',
  differences: [
    { id: 'cake-candle', x: 300, y: 392, r: 26, label: 'a candle went out' },
    { id: 'pretzel-count', x: 490, y: 102, r: 26, label: 'a pretzel vanished' },
    { id: 'jar-label', x: 452, y: 168, r: 26, label: 'a jam label changed colour' },
    { id: 'oven-flame', x: 478, y: 322, r: 28, label: 'the oven flame sank' },
    { id: 'rolling-pin', x: 150, y: 462, r: 28, label: 'the rolling pin turned' },
    { id: 'window-star', x: 122, y: 62, r: 26, label: 'a star went out' },
    { id: 'loaf', x: 528, y: 196, r: 28, label: 'a loaf went missing' },
  ],

  draw(ctx, applied, t) {
    const W = 592;
    const H = 520;
    const has = (id) => applied.has(id);

    // --- brick wall ---
    ctx.fillStyle = '#7a4a34';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.22)';
    ctx.lineWidth = 2;
    for (let y = 0; y < H; y += 26) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      const off = (y / 26) % 2 === 0 ? 0 : 37;
      for (let x = off; x < W; x += 74) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 26);
        ctx.stroke();
      }
    }
    ctx.fillStyle = 'rgba(255,220,160,0.04)';
    ctx.fillRect(0, 0, W, 60);

    // --- window, top left: night sky ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(28, 28, 160, 120);
    ctx.clip();
    const sky = ctx.createLinearGradient(0, 28, 0, 148);
    sky.addColorStop(0, '#16233f');
    sky.addColorStop(1, '#33507e');
    ctx.fillStyle = sky;
    ctx.fillRect(28, 28, 160, 120);
    // crescent moon
    ctx.fillStyle = '#f4e9c8';
    ctx.beginPath();
    ctx.arc(158, 58, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#33507e';
    ctx.beginPath();
    ctx.arc(166, 52, 15, 0, Math.PI * 2);
    ctx.fill();
    // stars (one is a difference)
    const stars = [[52, 52], [86, 44], [122, 62], [70, 96], [146, 108], [104, 128]];
    ctx.fillStyle = '#ffeeb0';
    stars.forEach(([sx, sy], i) => {
      if (i === 2 && has('window-star')) return;
      drawStar(ctx, sx, sy, 3.5, t + i);
    });
    ctx.restore();
    ctx.strokeStyle = '#2c1c10';
    ctx.lineWidth = 8;
    ctx.strokeRect(28, 28, 160, 120);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(108, 28);
    ctx.lineTo(108, 148);
    ctx.moveTo(28, 88);
    ctx.lineTo(188, 88);
    ctx.stroke();

    // --- chalkboard menu ---
    ctx.fillStyle = '#2e3a33';
    ctx.fillRect(220, 40, 160, 130);
    ctx.strokeStyle = '#8a6b45';
    ctx.lineWidth = 6;
    ctx.strokeRect(220, 40, 160, 130);
    ctx.fillStyle = '#f6ead2';
    ctx.font = 'bold 17px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText("Tonight's Menu", 300, 66);
    ctx.font = '15px Georgia, serif';
    ctx.fillText('~ sourdough ~', 300, 94);
    ctx.fillText('~ honey cake ~', 300, 118);
    ctx.fillText('~ star buns ~', 300, 142);
    // chalk croissant doodle
    ctx.strokeStyle = '#f6ead2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(238, 148, 9, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(362, 148, 9, Math.PI, 0);
    ctx.stroke();

    // --- pretzel rail, top right ---
    ctx.strokeStyle = '#241a10';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(420, 44);
    ctx.lineTo(572, 44);
    ctx.stroke();
    const pretzelX = [440, 490, 540];
    pretzelX.forEach((px, i) => {
      if (i === 1 && has('pretzel-count')) return; // the missing pretzel
      ctx.strokeStyle = '#241a10';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 44);
      ctx.lineTo(px, 66);
      ctx.stroke();
      drawPretzel(ctx, px, 102);
    });

    // --- shelf with jam jars and loaves ---
    ctx.fillStyle = '#33200f';
    ctx.fillRect(404, 210, 172, 10);
    ctx.fillStyle = '#241608';
    ctx.fillRect(404, 220, 172, 5);
    // jam jars
    const jarX = [424, 452, 480];
    jarX.forEach((jx, i) => {
      ctx.fillStyle = i === 1 ? '#b8452f' : '#c98a2e';
      ctx.fillRect(jx - 11, 178, 22, 32);
      ctx.fillStyle = '#e8d5a8';
      ctx.fillRect(jx - 11, 172, 22, 8);
      // label (the middle jar's label is a difference)
      let label = i === 1 ? '#d95f4b' : '#f6ead2';
      if (i === 1 && has('jar-label')) label = '#3f8a6d';
      ctx.fillStyle = label;
      ctx.fillRect(jx - 8, 188, 16, 12);
    });
    // bread loaves on the same shelf
    drawLoaf(ctx, 512, 196);
    if (!has('loaf')) drawLoaf(ctx, 552, 196);

    // --- brick oven, right ---
    ctx.fillStyle = '#5d3a28';
    ctx.fillRect(404, 246, 168, 184);
    ctx.fillStyle = '#7a4a34';
    ctx.fillRect(404, 246, 168, 14);
    // chimney
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(520, 196, 26, 50);
    // arched opening with fire
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(424, 396);
    ctx.lineTo(424, 330);
    ctx.quadraticCurveTo(488, 272, 552, 330);
    ctx.lineTo(552, 396);
    ctx.closePath();
    ctx.clip();
    ctx.fillStyle = '#1c0f08';
    ctx.fillRect(424, 272, 128, 124);
    // fire: high flames or low flames
    const flameH = has('oven-flame') ? 26 : 52;
    const flick = Math.sin(t * 6) * 4;
    const fire = ctx.createRadialGradient(488, 392, 4, 488, 392, 70);
    fire.addColorStop(0, '#ffe9a8');
    fire.addColorStop(0.5, '#f28c2e');
    fire.addColorStop(1, 'rgba(180,60,20,0)');
    ctx.fillStyle = fire;
    ctx.beginPath();
    ctx.ellipse(488, 392, 52, flameH + 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b234';
    ctx.beginPath();
    ctx.moveTo(462, 392);
    ctx.quadraticCurveTo(470, 392 - flameH - flick, 488, 392 - flameH - 8 - flick);
    ctx.quadraticCurveTo(506, 392 - flameH - flick, 514, 392);
    ctx.closePath();
    ctx.fill();
    // logs
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(452, 390);
    ctx.lineTo(524, 384);
    ctx.moveTo(452, 384);
    ctx.lineTo(524, 390);
    ctx.stroke();
    ctx.restore();
    ctx.strokeStyle = '#2c1c10';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(424, 396);
    ctx.lineTo(424, 330);
    ctx.quadraticCurveTo(488, 272, 552, 330);
    ctx.lineTo(552, 396);
    ctx.stroke();
    // oven glow on the wall
    if (!has('oven-flame')) {
      const glow = ctx.createRadialGradient(488, 340, 10, 488, 340, 110);
      glow.addColorStop(0, 'rgba(255,170,80,0.28)');
      glow.addColorStop(1, 'rgba(255,170,80,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(378, 230, 220, 220);
    }

    // --- hanging utensils, left wall ---
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 3;
    // ladle
    ctx.beginPath();
    ctx.moveTo(216, 240);
    ctx.lineTo(216, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(216, 308, 10, 0, Math.PI * 2);
    ctx.stroke();
    // whisk
    ctx.beginPath();
    ctx.moveTo(248, 240);
    ctx.lineTo(248, 292);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(248, 306, 7, 14, 0, 0, Math.PI * 2);
    ctx.stroke();

    // --- counter ---
    const counter = ctx.createLinearGradient(0, 430, 0, 520);
    counter.addColorStop(0, '#8a5a34');
    counter.addColorStop(1, '#5d3a20');
    ctx.fillStyle = counter;
    ctx.fillRect(0, 430, W, 90);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0, 430, W, 4);

    // flour sack
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath();
    ctx.moveTo(52, 430);
    ctx.lineTo(104, 430);
    ctx.lineTo(98, 470);
    ctx.lineTo(58, 470);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#7a6a4a';
    ctx.font = 'bold 13px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('FLOUR', 78, 456);
    // spilled flour
    ctx.fillStyle = 'rgba(232,220,192,0.85)';
    ctx.beginPath();
    ctx.ellipse(118, 466, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // rolling pin (a difference: lying flat or turned upright)
    ctx.save();
    ctx.translate(150, 462);
    if (has('rolling-pin')) ctx.rotate(Math.PI / 2.4);
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a6b45';
    ctx.beginPath();
    ctx.ellipse(-46, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(46, 0, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- cake stand with cake and candles ---
    ctx.fillStyle = '#c9c9c9';
    ctx.beginPath();
    ctx.ellipse(300, 470, 64, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(296, 440, 8, 30);
    ctx.beginPath();
    ctx.ellipse(300, 442, 52, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // cake
    ctx.fillStyle = '#e8b4c8';
    ctx.fillRect(258, 408, 84, 34);
    ctx.fillStyle = '#c98a9e';
    ctx.fillRect(258, 408, 84, 10);
    // icing drips
    ctx.fillStyle = '#f6ead2';
    for (let i = 0; i < 6; i += 1) {
      const dx = 262 + i * 14;
      ctx.beginPath();
      ctx.ellipse(dx, 410, 6, 7 + (i % 2) * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // cherries
    ctx.fillStyle = '#b8452f';
    ctx.beginPath();
    ctx.arc(272, 404, 5, 0, Math.PI * 2);
    ctx.arc(300, 404, 5, 0, Math.PI * 2);
    ctx.arc(328, 404, 5, 0, Math.PI * 2);
    ctx.fill();
    // candles: three, or two when the difference applies
    const candleX = [280, 300, 320];
    candleX.forEach((cx, i) => {
      if (i === 2 && has('cake-candle')) return; // the candle that went out
      ctx.fillStyle = i === 1 ? '#4a6a8a' : '#f6ead2';
      ctx.fillRect(cx - 3, 380, 6, 26);
      const flicker = Math.sin(t * 9 + i * 2) * 1.5;
      ctx.fillStyle = '#ffd97a';
      ctx.beginPath();
      ctx.ellipse(cx + flicker * 0.4, 374, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,217,122,0.35)';
      ctx.beginPath();
      ctx.arc(cx, 374, 10, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- teapot, right of the cake ---
    ctx.fillStyle = '#3f6d8a';
    ctx.beginPath();
    ctx.ellipse(392, 452, 26, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(392, 436);
    ctx.lineTo(392, 424);
    ctx.lineTo(404, 436);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3f6d8a';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(416, 448);
    ctx.quadraticCurveTo(436, 448, 430, 466);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(368, 448);
    ctx.quadraticCurveTo(352, 448, 356, 462);
    ctx.stroke();
    // steam
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(398, 420);
    ctx.quadraticCurveTo(394, 410, 400, 402);
    ctx.stroke();
  },
};

function drawStar(ctx, x, y, r, t) {
  const tw = 0.75 + 0.25 * Math.sin(t * 2 + x);
  ctx.globalAlpha = tw;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.lineTo(x + r * 0.35, y - r * 0.35);
  ctx.lineTo(x + r, y);
  ctx.lineTo(x + r * 0.35, y + r * 0.35);
  ctx.lineTo(x, y + r);
  ctx.lineTo(x - r * 0.35, y + r * 0.35);
  ctx.lineTo(x - r, y);
  ctx.lineTo(x - r * 0.35, y - r * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawPretzel(ctx, cx, cy) {
  ctx.strokeStyle = '#a8641f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx - 9, cy - 6, 11, Math.PI * 0.15, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 9, cy - 6, 11, Math.PI * 1.3, Math.PI * 0.85 + Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 16, cy - 12);
  ctx.quadraticCurveTo(cx, cy + 16, cx + 16, cy - 12);
  ctx.stroke();
  // salt
  ctx.fillStyle = '#f6ead2';
  ctx.beginPath();
  ctx.arc(cx - 8, cy - 14, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 6, cy - 4, 1.8, 0, Math.PI * 2);
  ctx.arc(cx + 2, cy + 8, 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawLoaf(ctx, cx, cy) {
  ctx.fillStyle = '#c98a2e';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 24, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a5a1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 14, cy - 6);
  ctx.quadraticCurveTo(cx, cy - 12, cx + 14, cy - 6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 2);
  ctx.quadraticCurveTo(cx, cy - 4, cx + 10, cy + 2);
  ctx.stroke();
}
