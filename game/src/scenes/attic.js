// Clockwork Twins, scene 1: The Clockmaker's Attic.
// One job: draw this one scene, and list its seven differences.
// The scene is drawn in a 592 by 520 box. `applied` holds the ids of the
// differences to render in their changed form (the right-hand panel).
// Every difference is fair: the changed thing is visible once you look at it,
// but nothing flashes or points at it.

export const attic = {
  id: 'attic',
  name: "The Clockmaker's Attic",
  blurb: 'Seven things changed while the clockmaker slept.',
  differences: [
    { id: 'clock-hand', x: 150, y: 148, r: 34, label: 'the clock hand moved' },
    { id: 'gear-tooth', x: 332, y: 232, r: 30, label: 'a gear lost a tooth' },
    { id: 'cat-tail', x: 508, y: 428, r: 28, label: "the cat's tail moved" },
    { id: 'book-color', x: 212, y: 226, r: 26, label: 'a book changed colour' },
    { id: 'window-star', x: 492, y: 66, r: 26, label: 'a star went out' },
    { id: 'lamp-glow', x: 300, y: 96, r: 30, label: 'the lamp went dark' },
    { id: 'mug', x: 96, y: 402, r: 28, label: 'the mug vanished' },
  ],

  draw(ctx, applied, t) {
    const W = 592;
    const H = 520;
    const has = (id) => applied.has(id);

    // --- wooden wall ---
    const wall = ctx.createLinearGradient(0, 0, 0, H);
    wall.addColorStop(0, '#6d4a2f');
    wall.addColorStop(1, '#4a2f1d');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)';
    ctx.lineWidth = 2;
    for (let y = 52; y < H; y += 52) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,220,160,0.05)';
    for (let i = 0; i < 5; i += 1) {
      ctx.fillRect(40 + i * 110, 0, 26, H);
    }

    // --- floor ---
    ctx.fillStyle = '#3a2718';
    ctx.fillRect(0, 448, W, H - 448);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    for (let x = 0; x < W; x += 74) {
      ctx.beginPath();
      ctx.moveTo(x, 448);
      ctx.lineTo(x - 18, H);
      ctx.stroke();
    }

    // --- window, top right: night sky, moon, stars ---
    ctx.save();
    ctx.beginPath();
    ctx.rect(408, 28, 160, 140);
    ctx.clip();
    const sky = ctx.createLinearGradient(0, 28, 0, 168);
    sky.addColorStop(0, '#1b2a4a');
    sky.addColorStop(1, '#3a5a8a');
    ctx.fillStyle = sky;
    ctx.fillRect(408, 28, 160, 140);
    // moon
    ctx.fillStyle = '#f4e9c8';
    ctx.beginPath();
    ctx.arc(528, 66, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9cba4';
    ctx.beginPath();
    ctx.arc(520, 60, 5, 0, Math.PI * 2);
    ctx.arc(536, 74, 4, 0, Math.PI * 2);
    ctx.fill();
    // stars (one of them is a difference)
    const stars = [
      [430, 52], [458, 44], [486, 96], [452, 120], [540, 120], [548, 44],
    ];
    ctx.fillStyle = '#ffeeb0';
    stars.forEach(([sx, sy], i) => {
      if (i === 2 && has('window-star')) return; // the star that went out
      drawStar(ctx, sx, sy, 4, t);
    });
    // window frame
    ctx.restore();
    ctx.strokeStyle = '#2c1c10';
    ctx.lineWidth = 8;
    ctx.strokeRect(408, 28, 160, 140);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(488, 28);
    ctx.lineTo(488, 168);
    ctx.moveTo(408, 98);
    ctx.lineTo(568, 98);
    ctx.stroke();

    // --- big wall clock, left ---
    drawWallClock(ctx, 150, 148, 88, has('clock-hand') ? 150 : 60, t);

    // --- hanging lamp, centre top ---
    ctx.strokeStyle = '#241a10';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 0);
    ctx.lineTo(300, 62);
    ctx.stroke();
    const lit = !has('lamp-glow');
    if (lit) {
      const glow = ctx.createRadialGradient(300, 96, 6, 300, 96, 90);
      glow.addColorStop(0, 'rgba(255,214,130,0.55)');
      glow.addColorStop(1, 'rgba(255,214,130,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(300, 96, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    // lamp shade
    ctx.fillStyle = lit ? '#b8452f' : '#5e3a30';
    ctx.beginPath();
    ctx.moveTo(272, 62);
    ctx.lineTo(328, 62);
    ctx.lineTo(316, 96);
    ctx.lineTo(284, 96);
    ctx.closePath();
    ctx.fill();
    // bulb
    ctx.fillStyle = lit ? '#ffe9a8' : '#8a8078';
    ctx.beginPath();
    ctx.arc(300, 100, 9, 0, Math.PI * 2);
    ctx.fill();

    // --- shelf with books, gears and a small clock ---
    ctx.fillStyle = '#33200f';
    ctx.fillRect(28, 258, 330, 12);
    ctx.fillStyle = '#241608';
    ctx.fillRect(28, 270, 330, 6);
    // books, standing
    const bookColors = ['#a8442f', '#3f6d4e', '#c98a2e', '#4a6a8a', '#7a4a6d'];
    let bx = 44;
    bookColors.forEach((c, i) => {
      const w = 22 + (i % 2) * 6;
      const h = 52 - (i % 3) * 6;
      let color = c;
      if (i === 2 && has('book-color')) color = '#2f8a7a'; // the recoloured book
      ctx.fillStyle = color;
      ctx.fillRect(bx, 258 - h, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(bx, 258 - h, w, 4);
      bx += w + 4;
    });
    // leaning book
    ctx.save();
    ctx.translate(bx + 8, 258 - 26);
    ctx.rotate(0.22);
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(-11, -26, 22, 52);
    ctx.restore();
    // gears on the shelf
    drawGear(ctx, 268, 232, 26, 8, '#c9a24a', has('gear-tooth') ? 3 : -1);
    drawGear(ctx, 332, 232, 20, 7, '#8a8a92', -1);
    // tiny alarm clock
    ctx.fillStyle = '#3a3a44';
    ctx.beginPath();
    ctx.arc(196, 240, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f6ead2';
    ctx.beginPath();
    ctx.arc(196, 240, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c2118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(196, 240);
    ctx.lineTo(196, 231);
    ctx.moveTo(196, 240);
    ctx.lineTo(203, 243);
    ctx.stroke();

    // --- rug ---
    ctx.fillStyle = '#7a3a2e';
    ctx.beginPath();
    ctx.ellipse(452, 470, 118, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d9a24a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(452, 470, 100, 26, 0, 0, Math.PI * 2);
    ctx.stroke();

    // --- sleeping cat on the rug ---
    drawCat(ctx, 452, 452, has('cat-tail'), t);

    // --- workbench, bottom left ---
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(28, 392, 260, 16);
    ctx.fillStyle = '#3a2412';
    ctx.fillRect(40, 408, 12, 60);
    ctx.fillRect(264, 408, 12, 60);
    // tools on the bench
    ctx.strokeStyle = '#c9c9c9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(150, 392);
    ctx.lineTo(196, 392);
    ctx.stroke();
    ctx.fillStyle = '#8a5a2e';
    ctx.fillRect(146, 388, 10, 8);
    // screwdriver
    ctx.strokeStyle = '#b8452f';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(210, 392);
    ctx.lineTo(238, 384);
    ctx.stroke();
    // the mug (a difference: present or gone)
    if (!has('mug')) {
      ctx.fillStyle = '#4a6a8a';
      ctx.fillRect(82, 372, 28, 30);
      ctx.fillStyle = '#5d84a5';
      ctx.fillRect(82, 372, 28, 6);
      ctx.strokeStyle = '#4a6a8a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(114, 386, 8, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      // steam
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(90, 366);
      ctx.quadraticCurveTo(86, 356, 92, 348);
      ctx.moveTo(102, 366);
      ctx.quadraticCurveTo(106, 356, 100, 348);
      ctx.stroke();
    }
    // scattered gears on the bench
    drawGear(ctx, 240, 384, 12, 6, '#c9a24a', -1);
    drawGear(ctx, 60, 440, 10, 6, '#8a8a92', -1);

    // --- pendulum clock on the right wall ---
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(556, 250, 10, 120);
    ctx.fillStyle = '#6d4a2f';
    ctx.fillRect(548, 240, 26, 130);
    ctx.fillStyle = '#f6ead2';
    ctx.beginPath();
    ctx.arc(561, 268, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c2118';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(561, 268);
    ctx.lineTo(561, 258);
    ctx.moveTo(561, 268);
    ctx.lineTo(568, 272);
    ctx.stroke();
    const swing = Math.sin(t * 1.4) * 0.28;
    ctx.strokeStyle = '#c9a24a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(561, 284);
    ctx.lineTo(561 + Math.sin(swing) * 34, 284 + Math.cos(swing) * 34);
    ctx.stroke();
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.arc(561 + Math.sin(swing) * 34, 284 + Math.cos(swing) * 34, 8, 0, Math.PI * 2);
    ctx.fill();

    // --- cobweb, top left corner ---
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(0, 20 + i * 14);
      ctx.lineTo(20 + i * 14, 0);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI / 2);
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

function drawWallClock(ctx, cx, cy, r, minuteDeg, t) {
  // case
  ctx.fillStyle = '#2c1c10';
  ctx.beginPath();
  ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
  ctx.fill();
  // face
  const face = ctx.createRadialGradient(cx - 20, cy - 24, 8, cx, cy, r);
  face.addColorStop(0, '#fff6dd');
  face.addColorStop(1, '#e8d5a8');
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // tick marks
  ctx.strokeStyle = '#2c2118';
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.sin(a) * (r - 12), cy - Math.cos(a) * (r - 12));
    ctx.lineTo(cx + Math.sin(a) * (r - 4), cy - Math.cos(a) * (r - 4));
    ctx.stroke();
  }
  // numerals at 12, 3, 6, 9
  ctx.fillStyle = '#2c2118';
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('12', cx, cy - r + 24);
  ctx.fillText('3', cx + r - 22, cy);
  ctx.fillText('6', cx, cy + r - 24);
  ctx.fillText('9', cx - r + 22, cy);
  // hands: hour fixed at 10, minute is the difference
  const hourA = ((-60 * Math.PI) / 180);
  const minA = ((minuteDeg - 90) * Math.PI) / 180;
  ctx.strokeStyle = '#2c2118';
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(hourA) * (r * 0.5), cy + Math.sin(hourA) * (r * 0.5));
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(minA) * (r * 0.78), cy + Math.sin(minA) * (r * 0.78));
  ctx.stroke();
  // second hand, gently sweeping
  const secA = t * 0.6;
  ctx.strokeStyle = '#b8452f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(secA - Math.PI / 2) * (r * 0.82), cy + Math.sin(secA - Math.PI / 2) * (r * 0.82));
  ctx.stroke();
  ctx.fillStyle = '#2c2118';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawGear(ctx, cx, cy, r, teeth, color, missingTooth) {
  ctx.fillStyle = color;
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < teeth; i += 1) {
    if (i === missingTooth) continue; // the tooth that fell out
    const a = (i / teeth) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * r;
    const y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a + 0.22) * r;
    const y2 = cy + Math.sin(a + 0.22) * r;
    const x3 = cx + Math.cos(a + 0.11) * (r + 7);
    const y3 = cy + Math.sin(a + 0.11) * (r + 7);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

function drawCat(ctx, cx, cy, tailDown, t) {
  const breathe = Math.sin(t * 1.2) * 1.5;
  // tail
  ctx.strokeStyle = '#c97e2e';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (tailDown) {
    ctx.moveTo(cx + 52, cy + 6);
    ctx.quadraticCurveTo(cx + 78, cy + 10, cx + 88, cy - 2);
  } else {
    ctx.moveTo(cx + 52, cy + 6);
    ctx.quadraticCurveTo(cx + 76, cy - 6, cx + 72, cy - 26);
  }
  ctx.stroke();
  // body: a curled sleeping loaf
  ctx.fillStyle = '#d98a3a';
  ctx.beginPath();
  ctx.ellipse(cx, cy + breathe, 56, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  // stripes
  ctx.strokeStyle = '#a8641f';
  ctx.lineWidth = 4;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(cx + i * 22 - 6, cy - 18 + breathe);
    ctx.lineTo(cx + i * 22 + 2, cy - 2 + breathe);
    ctx.stroke();
  }
  // head, tucked down
  ctx.fillStyle = '#d98a3a';
  ctx.beginPath();
  ctx.arc(cx - 46, cy - 8 + breathe, 20, 0, Math.PI * 2);
  ctx.fill();
  // ears
  ctx.beginPath();
  ctx.moveTo(cx - 60, cy - 22 + breathe);
  ctx.lineTo(cx - 56, cy - 36 + breathe);
  ctx.lineTo(cx - 48, cy - 24 + breathe);
  ctx.closePath();
  ctx.moveTo(cx - 38, cy - 24 + breathe);
  ctx.lineTo(cx - 34, cy - 38 + breathe);
  ctx.lineTo(cx - 28, cy - 22 + breathe);
  ctx.closePath();
  ctx.fill();
  // closed eye
  ctx.strokeStyle = '#5d3a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx - 50, cy - 8 + breathe, 4, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  // nose
  ctx.fillStyle = '#b8452f';
  ctx.beginPath();
  ctx.arc(cx - 64, cy - 2 + breathe, 2.5, 0, Math.PI * 2);
  ctx.fill();
}
