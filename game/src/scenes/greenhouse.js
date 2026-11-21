// Clockwork Twins, scene 3: The Botanist's Greenhouse.
// One job: draw this one scene, and list its seven differences.
// The scene is drawn in a 592 by 520 box. `applied` holds the ids of the
// differences to render in their changed form (the right-hand panel).
export const greenhouse = {
  id: 'greenhouse',
  name: "The Botanist's Greenhouse",
  blurb: 'Seven things changed while the plants were sleeping.',
  differences: [
    { id: 'butterfly', x: 300, y: 140, r: 26, label: 'a butterfly flew away' },
    { id: 'bloom-color', x: 250, y: 356, r: 26, label: 'a bloom changed colour' },
    { id: 'watering-can', x: 382, y: 402, r: 28, label: 'the watering can vanished' },
    { id: 'caged-bird', x: 478, y: 180, r: 26, label: 'the bird left its cage' },
    { id: 'bench-pot', x: 170, y: 390, r: 26, label: 'a little pot went missing' },
    { id: 'ladder-rung', x: 100, y: 300, r: 26, label: 'a ladder rung snapped off' },
    { id: 'leaf-slit', x: 120, y: 250, r: 28, label: 'a leaf lost its slit' },
  ],

  draw(ctx, applied, t) {
    const W = 592;
    const H = 520;
    const has = (id) => applied.has(id);

    // --- glasshouse sky ---
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#bfe3d8');
    sky.addColorStop(0.55, '#8fc4a8');
    sky.addColorStop(1, '#5d8a6a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
    // sun, top right, with slow rays
    const sunX = 508;
    const sunY = 62;
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(t * 0.05);
    ctx.strokeStyle = 'rgba(255,240,170,0.7)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
      ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46);
      ctx.stroke();
    }
    ctx.restore();
    ctx.fillStyle = '#ffdf6e';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(sunX - 6, sunY - 6, 16, 0, Math.PI * 2);
    ctx.fill();
    // soft clouds
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(150, 66, 52, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(196, 74, 38, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(360, 40, 44, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- glass panes: mullions ---
    ctx.strokeStyle = 'rgba(46,74,52,0.55)';
    ctx.lineWidth = 5;
    for (let x = 98; x < W; x += 98) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 180);
    ctx.lineTo(W, 180);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(140, 0);
    ctx.lineTo(40, 520);
    ctx.lineTo(0, 520);
    ctx.closePath();
    ctx.fill();

    // --- stone floor ---
    ctx.fillStyle = '#9a8a72';
    ctx.fillRect(0, 448, W, H - 448);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 74) {
      ctx.beginPath();
      ctx.moveTo(x, 448);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, 484);
    ctx.lineTo(W, 484);
    ctx.stroke();

    // --- big monstera, left ---
    drawMonstera(ctx, 120, 250, has('leaf-slit'), t);
    drawPot(ctx, 120, 428, 46, '#b8452f');

    // --- fern, right ---
    drawFern(ctx, 540, 430, t);
    drawPot(ctx, 540, 436, 40, '#4a6a8a');

    // --- ladder, leaning left ---
    ctx.strokeStyle = '#8a6b45';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(56, 448);
    ctx.lineTo(84, 210);
    ctx.moveTo(140, 448);
    ctx.lineTo(112, 210);
    ctx.stroke();
    ctx.lineWidth = 5;
    const rungs = [420, 372, 324, 276, 228];
    rungs.forEach((ry, i) => {
      if (i === 2 && has('ladder-rung')) return; // the rung that snapped off
      const lx = 60 + (448 - ry) * 0.117;
      const rx = 136 - (448 - ry) * 0.117;
      ctx.beginPath();
      ctx.moveTo(lx, ry);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    });

    // --- hanging birdcage, right ---
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(478, 96);
    ctx.lineTo(478, 118);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(478, 112, 8, Math.PI, 0);
    ctx.stroke();
    // cage body
    ctx.fillStyle = 'rgba(246,234,210,0.25)';
    ctx.beginPath();
    ctx.ellipse(478, 180, 42, 56, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3a2a1a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(478, 180, 42, 56, 0, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(478 + i * 16, 128);
      ctx.quadraticCurveTo(478 + i * 18, 180, 478 + i * 16, 232);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(436, 180);
    ctx.lineTo(520, 180);
    ctx.stroke();
    // perch
    ctx.beginPath();
    ctx.moveTo(452, 204);
    ctx.lineTo(504, 204);
    ctx.stroke();
    // the bird (a difference: home or flown)
    if (!has('caged-bird')) {
      const bob = Math.sin(t * 2.2) * 1.5;
      ctx.fillStyle = '#e8a13a';
      ctx.beginPath();
      ctx.ellipse(478, 194 + bob, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(478, 178 + bob, 8, 0, Math.PI * 2);
      ctx.fill();
      // beak
      ctx.fillStyle = '#d95f4b';
      ctx.beginPath();
      ctx.moveTo(486, 178 + bob);
      ctx.lineTo(494, 181 + bob);
      ctx.lineTo(486, 184 + bob);
      ctx.closePath();
      ctx.fill();
      // eye
      ctx.fillStyle = '#2c2118';
      ctx.beginPath();
      ctx.arc(481, 176 + bob, 1.8, 0, Math.PI * 2);
      ctx.fill();
      // wing
      ctx.strokeStyle = '#a8641f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(476, 196 + bob, 7, 0.3, Math.PI * 0.9);
      ctx.stroke();
    }

    // --- butterflies ---
    drawButterfly(ctx, 210, 110, t, '#7a5ac8');
    if (!has('butterfly')) drawButterfly(ctx, 300, 140, t + 2, '#d95f4b');
    drawButterfly(ctx, 380, 96, t + 4, '#3f8a6d');

    // --- hanging planters, top centre ---
    drawHanger(ctx, 250, 0, 46, t);
    drawHanger(ctx, 340, 0, 38, t + 1);

    // --- workbench ---
    ctx.fillStyle = '#6d4a2f';
    ctx.fillRect(150, 400, 300, 14);
    ctx.fillStyle = '#4a2f1d';
    ctx.fillRect(162, 414, 12, 34);
    ctx.fillRect(426, 414, 12, 34);
    // small pot (a difference: there or gone)
    if (!has('bench-pot')) drawPot(ctx, 170, 388, 22, '#c98a2e');
    // the bloom (a difference: red or yellow)
    drawBloom(ctx, 250, 356, has('bloom-color') ? '#f2c230' : '#d95f4b', t);
    drawPot(ctx, 250, 392, 30, '#7a4a6d');
    // seed packets
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(296, 372, 26, 28);
    ctx.fillStyle = '#3f6d4e';
    ctx.fillRect(296, 372, 26, 8);
    ctx.fillStyle = '#e8dcc0';
    ctx.fillRect(328, 376, 22, 24);
    ctx.fillStyle = '#b8452f';
    ctx.fillRect(328, 376, 22, 7);
    // the watering can (a difference: there or gone)
    if (!has('watering-can')) drawWateringCan(ctx, 382, 402);
    // hand trowel
    ctx.strokeStyle = '#8a8a92';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(430, 400);
    ctx.lineTo(446, 388);
    ctx.stroke();
    ctx.fillStyle = '#8a8a92';
    ctx.beginPath();
    ctx.moveTo(446, 388);
    ctx.lineTo(458, 380);
    ctx.lineTo(454, 394);
    ctx.closePath();
    ctx.fill();
  },
};

function drawPot(ctx, cx, topY, w, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, topY);
  ctx.lineTo(cx + w / 2, topY);
  ctx.lineTo(cx + w / 2 - 6, topY + 26);
  ctx.lineTo(cx - w / 2 + 6, topY + 26);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(cx - w / 2 - 3, topY - 4, w + 6, 8);
}

function drawMonstera(ctx, cx, cy, smoothLeaf, t) {
  const sway = Math.sin(t * 0.9) * 0.02;
  ctx.save();
  ctx.translate(cx, cy + 150);
  ctx.rotate(sway);
  ctx.translate(-cx, -(cy + 150));
  ctx.strokeStyle = '#2f5d3a';
  ctx.lineWidth = 5;
  // stems
  ctx.beginPath();
  ctx.moveTo(cx, cy + 150);
  ctx.quadraticCurveTo(cx - 30, cy + 60, cx - 46, cy - 10);
  ctx.moveTo(cx, cy + 150);
  ctx.quadraticCurveTo(cx + 10, cy + 70, cx + 6, cy - 30);
  ctx.moveTo(cx, cy + 150);
  ctx.quadraticCurveTo(cx + 44, cy + 80, cx + 52, cy + 10);
  ctx.stroke();
  // leaves
  drawLeaf(ctx, cx - 46, cy - 10, -0.5, '#3f7a4e', smoothLeaf);
  drawLeaf(ctx, cx + 6, cy - 30, 0.3, '#4a8a58', false);
  drawLeaf(ctx, cx + 52, cy + 10, 0.9, '#3f7a4e', false);
  drawLeaf(ctx, cx - 8, cy + 30, -1.1, '#57a05e', false);
  ctx.restore();
}

function drawLeaf(ctx, x, y, angle, color, smooth) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 40, 0, 0, Math.PI * 2);
  ctx.fill();
  // the slit: a deep notch on one edge, unless the difference smoothed it
  if (!smooth) {
    ctx.fillStyle = '#8fc4a8';
    ctx.beginPath();
    ctx.moveTo(24, -18);
    ctx.lineTo(2, -2);
    ctx.lineTo(24, 8);
    ctx.closePath();
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -38);
  ctx.lineTo(0, 38);
  ctx.stroke();
  ctx.restore();
}

function drawFern(ctx, cx, baseY, t) {
  ctx.strokeStyle = '#3f7a4e';
  ctx.lineWidth = 3;
  for (let i = -3; i <= 3; i += 1) {
    const sway = Math.sin(t * 1.1 + i) * 4;
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.quadraticCurveTo(cx + i * 12 + sway, baseY - 46, cx + i * 22 + sway * 1.6, baseY - 84);
    ctx.stroke();
  }
}

function drawButterfly(ctx, x, y, t, color) {
  const flap = Math.sin(t * 10) * 0.5;
  const drift = Math.sin(t * 0.7) * 6;
  ctx.save();
  ctx.translate(x + drift, y + Math.cos(t * 1.3) * 5);
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.95;
  // wings
  ctx.save();
  ctx.rotate(-0.4 - flap * 0.4);
  ctx.beginPath();
  ctx.ellipse(-7, -4, 10, 7, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.rotate(0.4 + flap * 0.4);
  ctx.beginPath();
  ctx.ellipse(7, -4, 10, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // body
  ctx.fillStyle = '#2c2118';
  ctx.beginPath();
  ctx.ellipse(0, 0, 2.5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHanger(ctx, x, topY, size, t) {
  const sway = Math.sin(t * 0.8 + x) * 3;
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x + sway, topY + 34);
  ctx.stroke();
  ctx.fillStyle = '#b8452f';
  ctx.beginPath();
  ctx.moveTo(x + sway - size / 2, topY + 34);
  ctx.lineTo(x + sway + size / 2, topY + 34);
  ctx.lineTo(x + sway + size / 2 - 6, topY + 58);
  ctx.lineTo(x + sway - size / 2 + 6, topY + 58);
  ctx.closePath();
  ctx.fill();
  // trailing vines
  ctx.strokeStyle = '#3f7a4e';
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + sway + i * 12, topY + 58);
    ctx.quadraticCurveTo(x + sway + i * 16, topY + 78, x + sway + i * 10, topY + 92);
    ctx.stroke();
  }
}

function drawBloom(ctx, x, y, color, t) {
  const sway = Math.sin(t * 1.4) * 0.03;
  ctx.save();
  ctx.translate(x, y + 30);
  ctx.rotate(sway);
  ctx.translate(-x, -(y + 30));
  ctx.strokeStyle = '#2f5d3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y + 30);
  ctx.lineTo(x, y + 4);
  ctx.stroke();
  // leaves on the stem
  ctx.fillStyle = '#3f7a4e';
  ctx.beginPath();
  ctx.ellipse(x - 8, y + 16, 9, 4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // petals
  ctx.fillStyle = color;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(x + Math.cos(a) * 10, y + Math.sin(a) * 10, 9, 6, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#f2b234';
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWateringCan(ctx, x, y) {
  ctx.fillStyle = '#5d8a9a';
  ctx.beginPath();
  ctx.ellipse(x, y, 26, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 22, y - 18, 12, 18);
  // spout
  ctx.strokeStyle = '#5d8a9a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 22, y - 4);
  ctx.lineTo(x + 44, y - 16);
  ctx.stroke();
  // rose head
  ctx.fillStyle = '#4a7080';
  ctx.beginPath();
  ctx.arc(x + 46, y - 17, 7, 0, Math.PI * 2);
  ctx.fill();
  // handle
  ctx.strokeStyle = '#4a7080';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(x - 14, y - 8, 12, Math.PI * 0.6, Math.PI * 1.5);
  ctx.stroke();
}
