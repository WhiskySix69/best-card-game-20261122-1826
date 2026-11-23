// RIMBA DUEL — semua gambar digambar di canvas 2D: layar judul, meja,
// kartu, bar HP, tombol, dan layar menang/kalah. Tanpa aset luar, tanpa font
// khusus: semua bentuk digambar dari path, semua teks pakai sans-serif.

import { CANVAS_W, CANVAS_H, ELEMENTS, BEATS, RULE_LINES } from './config.js';

const CARD_W = 140;
const CARD_H = 190;
const AI_CARD_W = 84;
const AI_CARD_H = 118;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color;
  ctx.font = `${weight || 'normal'} ${size}px sans-serif`;
  ctx.textAlign = align || 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// Bentuk elemen: daun, api, air, batu — beda warna DAN beda bentuk.
export function drawElementShape(ctx, shape, cx, cy, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(2, size * 0.08);
  const s = size / 2;
  ctx.beginPath();
  if (shape === 'leaf') {
    ctx.moveTo(cx, cy - s);
    ctx.quadraticCurveTo(cx + s, cy - s * 0.4, cx, cy + s);
    ctx.quadraticCurveTo(cx - s, cy - s * 0.4, cx, cy - s);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.7);
    ctx.lineTo(cx, cy + s * 0.9);
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.stroke();
  } else if (shape === 'flame') {
    ctx.moveTo(cx, cy - s);
    ctx.quadraticCurveTo(cx + s * 0.9, cy - s * 0.1, cx + s * 0.45, cy + s * 0.55);
    ctx.quadraticCurveTo(cx + s * 0.1, cy + s * 0.85, cx - s * 0.25, cy + s * 0.6);
    ctx.quadraticCurveTo(cx - s * 0.8, cy + s * 0.3, cx - s * 0.5, cy - s * 0.5);
    ctx.quadraticCurveTo(cx - s * 0.25, cy - s * 0.8, cx, cy - s);
    ctx.fill();
  } else if (shape === 'drop') {
    ctx.moveTo(cx, cy - s);
    ctx.quadraticCurveTo(cx + s * 0.85, cy + s * 0.1, cx + s * 0.55, cy + s * 0.55);
    ctx.quadraticCurveTo(cx, cy + s, cx - s * 0.55, cy + s * 0.55);
    ctx.quadraticCurveTo(cx - s * 0.85, cy + s * 0.1, cx, cy - s);
    ctx.fill();
  } else {
    // rock: hexagon
    for (let i = 0; i < 6; i += 1) {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      const px = cx + Math.cos(a) * s;
      const py = cy + Math.sin(a) * s * 0.9;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawHpBar(ctx, x, y, w, h, hp, maxHp) {
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fill();
  const frac = Math.max(0, hp / maxHp);
  const grad = ctx.createLinearGradient(x, y, x + w, y);
  grad.addColorStop(0, frac > 0.5 ? '#66bb6a' : frac > 0.25 ? '#ffa726' : '#ef5350');
  grad.addColorStop(1, frac > 0.5 ? '#43a047' : frac > 0.25 ? '#fb8c00' : '#e53935');
  roundRect(ctx, x + 2, y + 2, Math.max(0, (w - 4) * frac), h - 4, (h - 4) / 2);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.stroke();
  text(ctx, `${hp} / ${maxHp}`, x + w / 2, y + h / 2 + 1, 15, '#ffffff', 'bold');
}

function drawEnergy(ctx, x, y, energy, maxEnergy) {
  for (let i = 0; i < maxEnergy; i += 1) {
    ctx.beginPath();
    ctx.arc(x + i * 26, y, 10, 0, Math.PI * 2);
    ctx.fillStyle = i < energy ? '#ffd54f' : 'rgba(255,255,255,0.18)';
    ctx.fill();
    ctx.strokeStyle = '#8d6e63';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  text(ctx, 'Energi', x - 8, y, 13, '#ffe0b2', 'bold', 'right');
}

function drawWard(ctx, x, y, ward) {
  text(ctx, 'Ward:', x, y, 13, '#ffe0b2', 'bold', 'right');
  if (!ward) {
    text(ctx, '—', x + 14, y, 14, '#bcaaa4', 'bold', 'left');
    return;
  }
  const el = ELEMENTS[ward];
  drawElementShape(ctx, el.shape, x + 26, y, 20, el.color);
  text(ctx, el.name, x + 42, y, 14, '#ffffff', 'bold', 'left');
}

function drawButton(ctx, rect, label, enabled, hover) {
  const { x, y, w, h } = rect;
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = enabled ? (hover ? '#6d4c41' : '#5d4037') : 'rgba(93,64,55,0.45)';
  ctx.fill();
  ctx.strokeStyle = enabled ? '#ffd54f' : 'rgba(255,213,79,0.3)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, 18, enabled ? '#ffe0b2' : '#9e9e9e', 'bold');
}

function drawCardFace(ctx, card, x, y, w, h, playable, hover) {
  const def = card.def;
  const el = ELEMENTS[def.el];
  const lift = hover ? -10 : 0;
  const yy = y + lift;
  ctx.save();
  if (!playable) ctx.globalAlpha = 0.6;
  roundRect(ctx, x, yy, w, h, 12);
  ctx.fillStyle = '#fff8e1';
  ctx.fill();
  ctx.strokeStyle = hover ? '#ffd54f' : '#4e342e';
  ctx.lineWidth = hover ? 4 : 2;
  ctx.stroke();
  // Pita elemen
  roundRect(ctx, x + 2, yy + 2, w - 4, 40, 10);
  ctx.fillStyle = el.color;
  ctx.fill();
  drawElementShape(ctx, el.shape, x + 24, yy + 22, 24, 'rgba(255,255,255,0.95)');
  text(ctx, el.name.toUpperCase(), x + 42, yy + 23, 15, '#ffffff', 'bold', 'left');
  // Biaya (lingkaran kanan atas, di pita elemen — tidak menutup nama kartu)
  ctx.beginPath();
  ctx.arc(x + w - 22, yy + 22, 15, 0, Math.PI * 2);
  ctx.fillStyle = '#37474f';
  ctx.fill();
  ctx.strokeStyle = '#ffd54f';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, String(def.cost), x + w - 22, yy + 23, 16, '#ffffff', 'bold');
  // Nama kartu
  text(ctx, def.name, x + w / 2, yy + 62, 15, '#3e2723', 'bold');
  // Gambar elemen besar di tengah
  drawElementShape(ctx, el.shape, x + w / 2, yy + 112, 62, el.color);
  // Serang
  if (def.atk) {
    text(ctx, `ATK ${def.atk}`, x + w / 2, yy + 156, 20, '#b71c1c', 'bold');
  } else {
    text(ctx, `PERISAI ${def.shield}`, x + w / 2, yy + 156, 16, '#1565c0', 'bold');
  }
  // Teks efek
  text(ctx, def.text, x + w / 2, yy + 178, 11, '#5d4037', 'normal');
  ctx.restore();
}

function drawCardBack(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#1b5e20';
  ctx.fill();
  ctx.strokeStyle = '#a5d6a7';
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRect(ctx, x + 6, y + 6, w - 12, h - 12, 7);
  ctx.strokeStyle = 'rgba(165,214,167,0.6)';
  ctx.lineWidth = 1;
  ctx.stroke();
  drawElementShape(ctx, 'leaf', x + w / 2, y + h / 2, 44, '#66bb6a');
}

function drawBackground(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  grad.addColorStop(0, '#1b3a1f');
  grad.addColorStop(0.5, '#2e5d33');
  grad.addColorStop(1, '#1b3a1f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  // Dedaunan dekoratif di sudut
  ctx.save();
  ctx.globalAlpha = 0.16;
  for (const [cx, cy, s, rot] of [[60, 60, 90, 0.5], [1220, 50, 110, -0.4], [70, 750, 100, 2.6], [1210, 760, 90, 2.2]]) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    drawElementShape(ctx, 'leaf', 0, 0, s, '#66bb6a');
    ctx.restore();
  }
  ctx.restore();
}

// Posisi kartu tangan pemain / AI (dipakai render dan input).
export function playerHandRects(state) {
  const n = state.player.hand.length;
  const gap = 12;
  const total = n * CARD_W + (n - 1) * gap;
  const startX = (CANVAS_W - total) / 2;
  return state.player.hand.map((card, i) => ({ x: startX + i * (CARD_W + gap), y: 592, w: CARD_W, h: CARD_H, card, idx: i }));
}

export function aiHandRects(state) {
  const n = state.ai.hand.length;
  const gap = 10;
  const total = n * AI_CARD_W + (n - 1) * gap;
  const startX = (CANVAS_W - total) / 2;
  return state.ai.hand.map((card, i) => ({ x: startX + i * (AI_CARD_W + gap), y: 78, w: AI_CARD_W, h: AI_CARD_H, card, idx: i }));
}

export function getLayout(state) {
  const layout = { playerCards: [], aiCards: [], endTurn: null, menu: { x: 1150, y: 14, w: 116, h: 40 }, start: null, restart: null };
  if (state.screen === 'table') {
    layout.playerCards = playerHandRects(state);
    layout.aiCards = aiHandRects(state);
    layout.endTurn = { x: 1080, y: 452, w: 160, h: 54 };
  } else if (state.screen === 'title') {
    layout.start = { x: 510, y: 548, w: 260, h: 64 };
  } else if (state.screen === 'win' || state.screen === 'lose') {
    layout.restart = { x: 510, y: 560, w: 260, h: 64 };
  }
  return layout;
}

function pointIn(rect, x, y) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function drawCycleDiagram(ctx, cx, cy) {
  text(ctx, 'SIKLUS ELEMEN', cx, cy - 126, 16, '#ffe0b2', 'bold');
  const order = ['DAUN', 'AIR', 'API', 'BATU'];
  const positions = [[0, -72], [86, 0], [0, 72], [-86, 0]];
  const pts = [];
  for (let i = 0; i < 4; i += 1) {
    const el = ELEMENTS[order[i]];
    const [dx, dy] = positions[i];
    const px = cx + dx;
    const py = cy + dy;
    pts.push([px, py]);
    ctx.beginPath();
    ctx.arc(px, py, 34, 0, Math.PI * 2);
    ctx.fillStyle = el.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawElementShape(ctx, el.shape, px, py - 6, 26, 'rgba(255,255,255,0.95)');
    text(ctx, el.name, px, py + 20, 12, '#ffffff', 'bold');
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % 4];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    text(ctx, '>', mx, my, 16, '#ffd54f', 'bold');
  }
  text(ctx, 'Daun > Air > Api > Batu > Daun', cx, cy + 108, 14, '#dcedc8', 'normal');
}

function drawTable(ctx, state, hover) {
  drawBackground(ctx);
  const layout = getLayout(state);
  // Bar info AI
  text(ctx, 'PENJAGA RIMBA', 40, 34, 20, '#ffccbc', 'bold', 'left');
  drawHpBar(ctx, 250, 18, 300, 28, state.ai.hp, state.ai.maxHp);
  drawEnergy(ctx, 640, 32, state.ai.energy, state.ai.maxEnergy);
  drawWard(ctx, 900, 32, state.ai.ward);
  text(ctx, `Dek ${state.ai.deck.length}`, 1060, 32, 14, '#dcedc8', 'normal', 'left');
  drawButton(ctx, layout.menu, 'MENU', true, pointIn(layout.menu, hover.x, hover.y));
  // Tangan AI (tertutup)
  for (const r of layout.aiCards) drawCardBack(ctx, r.x, r.y, r.w, r.h);
  text(ctx, `${state.ai.hand.length} kartu`, CANVAS_W / 2, 214, 13, '#a5d6a7', 'normal');
  // Kotak log
  roundRect(ctx, 40, 226, 360, 280, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.stroke();
  text(ctx, 'JURNAL RIMBA', 220, 252, 15, '#ffe0b2', 'bold');
  state.log.forEach((line, i) => {
    text(ctx, line, 56, 286 + i * 30, 13, '#e8f5e9', 'normal', 'left');
  });
  // Diagram siklus di tengah
  drawCycleDiagram(ctx, 640, 366);
  // Panel kanan: giliran + kartu terakhir + tombol akhiri giliran
  roundRect(ctx, 880, 226, 360, 280, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.stroke();
  text(ctx, state.turn === 'player' ? 'GILIRANMU' : 'GILIRAN PENJAGA', 1060, 252, 16, state.turn === 'player' ? '#ffd54f' : '#ffab91', 'bold');
  if (state.lastPlay) {
    const lp = state.lastPlay;
    text(ctx, `Terakhir: ${lp.who === 'player' ? 'Kamu' : 'Penjaga'} — ${lp.card.def.name}`, 1060, 286, 13, '#e8f5e9', 'normal');
    drawElementShape(ctx, ELEMENTS[lp.card.def.el].shape, 1060, 340, 56, ELEMENTS[lp.card.def.el].color);
    text(ctx, `${lp.card.def.name}  •  ATK ${lp.card.def.atk}`, 1060, 386, 14, '#ffffff', 'bold');
  } else {
    text(ctx, 'Belum ada kartu dimainkan.', 1060, 330, 13, '#bcaaa4', 'normal');
  }
  const endEnabled = state.turn === 'player';
  drawButton(ctx, layout.endTurn, 'AKHIRI GILIRAN', endEnabled, pointIn(layout.endTurn, hover.x, hover.y));
  // Bar info pemain
  text(ctx, 'KAMU', 40, 552, 20, '#bbdefb', 'bold', 'left');
  drawHpBar(ctx, 250, 536, 300, 28, state.player.hp, state.player.maxHp);
  drawEnergy(ctx, 640, 550, state.player.energy, state.player.maxEnergy);
  drawWard(ctx, 900, 550, state.player.ward);
  text(ctx, `Dek ${state.player.deck.length}  •  Ronde ${state.round}`, 1060, 550, 14, '#dcedc8', 'normal', 'left');
  // Tangan pemain
  for (const r of layout.playerCards) {
    const playable = state.turn === 'player' && r.card.def.cost <= state.player.energy;
    const isHover = pointIn(r, hover.x, hover.y);
    drawCardFace(ctx, r.card, r.x, r.y, r.w, r.h, playable, isHover);
  }
  // Angka melayang (damage / heal)
  for (const f of state.floats) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, f.life));
    text(ctx, f.text, f.x, f.y, 26, f.color, 'bold');
    ctx.restore();
  }
  if (state.turn === 'player') {
    text(ctx, 'Klik kartu untuk memainkannya • Spasi: akhiri giliran', CANVAS_W / 2, 796, 12, '#a5d6a7', 'normal');
  }
}

function drawTitle(ctx, state, hover) {
  drawBackground(ctx);
  const layout = getLayout(state);
  text(ctx, 'RIMBA DUEL', CANVAS_W / 2, 150, 84, '#fff8e1', 'bold');
  text(ctx, 'Duel Kartu Rimba — 1 lawan 1 melawan Penjaga Rimba', CANVAS_W / 2, 216, 22, '#dcedc8', 'normal');
  // Tiga kartu hias
  const deco = [
    { el: 'DAUN', name: 'Tebasan Daun', atk: 3, cost: 1 },
    { el: 'API', name: 'Kobaran Rimba', atk: 7, cost: 3 },
    { el: 'AIR', name: 'Hujan Lebat', atk: 6, cost: 3 },
  ];
  deco.forEach((d, i) => {
    const fake = { def: { ...d, text: '', heal: 0, draw: 0, shield: 0 } };
    drawCardFace(ctx, fake, 430 + i * 160, 250, CARD_W, CARD_H, true, false);
  });
  // Deret elemen (bukan diagram penuh supaya tidak menumpuk kartu hias)
  const chips = ['DAUN', 'AIR', 'API', 'BATU'];
  chips.forEach((key, i) => {
    const el = ELEMENTS[key];
    const cx = 520 + i * 90;
    drawElementShape(ctx, el.shape, cx, 478, 30, el.color);
    text(ctx, el.name, cx, 502, 13, '#ffffff', 'bold');
    if (i < 3) text(ctx, '>', cx + 45, 478, 16, '#ffd54f', 'bold');
  });
  text(ctx, 'Daun > Air > Api > Batu > Daun', CANVAS_W / 2, 528, 14, '#dcedc8', 'normal');
  drawButton(ctx, layout.start, 'MULAI DUEL', true, pointIn(layout.start, hover.x, hover.y));
  RULE_LINES.forEach((line, i) => {
    text(ctx, line, CANVAS_W / 2, 636 + i * 24, 15, '#e8f5e9', 'normal');
  });
  text(ctx, 'HP 30 vs 30 • Dek 24 kartu • 4 elemen', CANVAS_W / 2, 774, 14, '#ffd54f', 'bold');
}

function drawEnd(ctx, state, hover) {
  drawBackground(ctx);
  const layout = getLayout(state);
  const won = state.screen === 'win';
  roundRect(ctx, 340, 130, 600, 500, 18);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fill();
  ctx.strokeStyle = won ? '#66bb6a' : '#ef5350';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, won ? 'MENANG!' : 'KALAH', CANVAS_W / 2, 220, 72, won ? '#a5d6a7' : '#ef9a9a', 'bold');
  text(ctx, won ? 'Penjaga Rimba tumbang. Rimba milikmu!' : 'Kamu tumbang di rimba...', CANVAS_W / 2, 300, 20, '#ffffff', 'normal');
  text(ctx, `HP akhir — Kamu ${state.player.hp} : ${state.ai.hp} Penjaga`, CANVAS_W / 2, 360, 18, '#ffe0b2', 'bold');
  text(ctx, `Ronde ${state.round} • Kartu dimainkan ${state.stats.played} • Damage ${state.stats.damage}`, CANVAS_W / 2, 410, 16, '#dcedc8', 'normal');
  drawButton(ctx, layout.restart, won ? 'MAIN LAGI' : 'COBA LAGI', true, pointIn(layout.restart, hover.x, hover.y));
  text(ctx, 'Tekan R untuk main lagi • Esc untuk menu', CANVAS_W / 2, 680, 14, '#a5d6a7', 'normal');
}

export function draw(ctx, state, hover) {
  const h = hover || { x: -1, y: -1 };
  if (state.screen === 'title') drawTitle(ctx, state, h);
  else if (state.screen === 'table') drawTable(ctx, state, h);
  else drawEnd(ctx, state, h);
}
