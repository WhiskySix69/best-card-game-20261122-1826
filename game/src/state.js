// Mesin giliran RIMBA DUEL: status permainan, main kartu, giliran AI, menang/kalah.
// Satu state memegang kedua sisi; giliran bergantian pemain -> AI -> pemain.

import { MAX_HP, START_HAND, MAX_HAND, energyForRound, beats, losesTo } from './config.js';
import { makeRng } from './random.js';
import { newSide, drawUpTo } from './deck.js';

export function newGame(seed) {
  const rng = makeRng(seed);
  const state = {
    seed,
    rng,
    screen: 'title',
    turn: 'player',
    round: 1,
    player: newSide(rng),
    ai: newSide(rng),
    log: [],
    floats: [],
    aiTimer: 0,
    aiActed: false,
    stats: { turns: 0, played: 0, damage: 0 },
    winner: null,
    lastPlay: null,
  };
  drawUpTo(state.player, rng, START_HAND);
  drawUpTo(state.ai, rng, START_HAND);
  state.player.energy = energyForRound(1);
  state.player.maxEnergy = energyForRound(1);
  state.ai.maxEnergy = energyForRound(1);
  pushLog(state, 'Rimba menyambutmu. Giliranmu: mainkan kartu, lalu akhiri giliran.');
  return state;
}

export function pushLog(state, text) {
  state.log.push(text);
  if (state.log.length > 5) state.log.shift();
}

export function addFloat(state, x, y, text, color) {
  state.floats.push({ x, y, text, color, life: 1.2 });
}

export function updateFloats(state, dt) {
  for (const f of state.floats) {
    f.y -= 34 * dt;
    f.life -= dt;
  }
  state.floats = state.floats.filter((f) => f.life > 0);
}

// Damage akhir sebuah kartu terhadap target, dengan bonus elemen vs ward.
export function calcDamage(card, target) {
  const def = card.def;
  if (!def.atk) return 0;
  let dmg = def.atk;
  if (beats(def.el, target.ward)) dmg += 2;
  else if (losesTo(def.el, target.ward)) dmg -= 1;
  return Math.max(1, dmg);
}

function applyDamage(state, target, source, amount, x, y) {
  if (amount <= 0) return 0;
  let left = amount;
  if (target.shield > 0) {
    const blocked = Math.min(target.shield, left);
    target.shield -= blocked;
    left -= blocked;
    if (blocked > 0) pushLog(state, `Perisai menahan ${blocked} damage.`);
  }
  if (left > 0) {
    target.hp = Math.max(0, target.hp - left);
    addFloat(state, x, y, `-${left}`, '#ff5252');
    return left;
  }
  return 0;
}

function healSide(side, amount) {
  side.hp = Math.min(side.maxHp, side.hp + amount);
}

export function beginTurn(state, who) {
  const side = who === 'player' ? state.player : state.ai;
  side.energy = energyForRound(state.round);
  side.maxEnergy = side.energy;
  if (state.stats.turns > 0 || who === 'ai') {
    const drawn = drawUpTo(side, state.rng, 1);
    if (drawn.length === 0) pushLog(state, `${who === 'player' ? 'Kamu' : 'Penjaga'} kehabisan kartu untuk diambil.`);
  }
}

// Mainkan kartu dari tangan. Mengembalikan true bila berhasil.
export function playCard(state, who, handIndex) {
  if (state.screen !== 'table') return false;
  if (state.turn !== who) return false;
  const side = who === 'player' ? state.player : state.ai;
  const foe = who === 'player' ? state.ai : state.player;
  const card = side.hand[handIndex];
  if (!card) return false;
  if (side.energy < card.def.cost) return false;

  side.energy -= card.def.cost;
  side.hand.splice(handIndex, 1);
  side.discard.push(card);
  side.ward = card.def.el;
  state.lastPlay = { who, card };
  state.stats.played += 1;

  const whoName = who === 'player' ? 'Kamu' : 'Penjaga Rimba';
  const foeName = who === 'player' ? 'Penjaga Rimba' : 'Kamu';
  const fx = who === 'player' ? 640 : 640;
  const fy = who === 'player' ? 300 : 300;

  if (card.def.shield) {
    side.shield += card.def.shield;
    pushLog(state, `${whoName} memasang ${card.def.name} (+${card.def.shield} perisai).`);
    addFloat(state, fx, fy, `+${card.def.shield} perisai`, '#90caf9');
  }
  if (card.def.atk) {
    const dmg = calcDamage(card, foe);
    const bonus = beats(card.def.el, foe.ward) ? ' (+2 elemen!)' : '';
    const before = foe.hp;
    applyDamage(state, foe, who, dmg, fx, fy - 40);
    const dealt = before - foe.hp;
    if (who === 'player') state.stats.damage += dealt;
    pushLog(state, `${whoName} memainkan ${card.def.name}: ${dealt} damage ke ${foeName}${bonus}.`);
  }
  if (card.def.heal) {
    healSide(side, card.def.heal);
    pushLog(state, `${whoName} memulihkan ${card.def.heal} HP dari ${card.def.name}.`);
    addFloat(state, fx, fy + 40, `+${card.def.heal} HP`, '#66bb6a');
  }
  if (card.def.draw) {
    const drawn = drawUpTo(side, state.rng, card.def.draw);
    if (drawn.length > 0) pushLog(state, `${whoName} mengambil ${drawn.length} kartu dari ${card.def.name}.`);
  }
  if (side.hand.length > MAX_HAND) {
    const extra = side.hand.splice(MAX_HAND);
    side.discard.push(...extra);
  }
  checkEnd(state);
  return true;
}

// Skor kartu untuk AI: damage efektif + nilai heal/perisai.
function scoreCard(state, card) {
  const foe = state.player;
  let score = 0;
  if (card.def.atk) score += calcDamage(card, foe) * 2;
  if (card.def.heal) score += card.def.heal * 2;
  if (card.def.shield) score += card.def.shield * 1.5;
  if (card.def.draw) score += 2;
  score -= card.def.cost * 0.5;
  return score;
}

export function aiAct(state) {
  const side = state.ai;
  beginTurn(state, 'ai');
  let guard = 0;
  while (guard < 5) {
    guard += 1;
    let best = -1;
    let bestScore = 0;
    for (let i = 0; i < side.hand.length; i += 1) {
      const card = side.hand[i];
      if (card.def.cost > side.energy) continue;
      const score = scoreCard(state, card);
      if (score > bestScore) {
        bestScore = score;
        best = i;
      }
    }
    if (best < 0) break;
    if (!playCard(state, 'ai', best)) break;
    if (state.screen !== 'table') break;
  }
  if (state.screen === 'table') {
    state.round += 1;
    state.stats.turns += 1;
    state.turn = 'player';
    beginTurn(state, 'player');
    pushLog(state, `Ronde ${state.round}: giliranmu. Energi ${state.player.energy}.`);
  }
}

export function endPlayerTurn(state) {
  if (state.screen !== 'table' || state.turn !== 'player') return;
  state.stats.turns += 1;
  state.turn = 'ai';
  state.aiTimer = 0.8;
  pushLog(state, 'Penjaga Rimba berpikir...');
}

export function update(state, dt) {
  updateFloats(state, dt);
  if (state.screen === 'table' && state.turn === 'ai' && state.aiTimer > 0) {
    state.aiTimer -= dt;
    if (state.aiTimer <= 0) aiAct(state);
  }
}

export function checkEnd(state) {
  if (state.screen !== 'table') return;
  if (state.ai.hp <= 0) {
    state.screen = 'win';
    state.winner = 'player';
    pushLog(state, 'Penjaga Rimba tumbang. Rimba milikmu!');
  } else if (state.player.hp <= 0) {
    state.screen = 'lose';
    state.winner = 'ai';
    pushLog(state, 'Kamu tumbang di rimba...');
  }
}

export function toTitle(state) {
  const fresh = newGame(state.seed);
  fresh.screen = 'title';
  return fresh;
}

export function restart(state) {
  const fresh = newGame(state.seed + 1);
  fresh.screen = 'table';
  fresh.player.energy = energyForRound(1);
  return fresh;
}
