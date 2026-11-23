// Pose screenshot deterministik untuk RIMBA DUEL. applyShot menerima state
// dan nama pose, lalu mengubah state ke keadaan yang sama setiap run dengan
// seed yang sama. Dipakai oleh ?shot= dan oleh skrip screenshot lokal.

import { newGame, playCard, pushLog } from './state.js';

function playFirstAffordable(state, maxPlays) {
  let n = 0;
  while (n < maxPlays) {
    const idx = state.player.hand.findIndex((c) => c.def.cost <= state.player.energy);
    if (idx < 0) break;
    if (!playCard(state, 'player', idx)) break;
    n += 1;
    if (state.screen !== 'table') break;
  }
  return n;
}

export function applyShot(state, shot, seed) {
  if (shot === 'title') {
    state.screen = 'title';
    return;
  }
  if (shot === 'table') {
    state.screen = 'table';
    playFirstAffordable(state, 2);
    return;
  }
  if (shot === 'win') {
    state.screen = 'table';
    playFirstAffordable(state, 2);
    state.round = 6;
    state.stats.played = 9;
    state.stats.damage = 30;
    state.player.hp = 14;
    state.ai.hp = 0;
    state.screen = 'win';
    state.winner = 'player';
    pushLog(state, 'Penjaga Rimba tumbang. Rimba milikmu!');
    return;
  }
  if (shot === 'lose') {
    state.screen = 'table';
    playFirstAffordable(state, 1);
    state.round = 5;
    state.stats.played = 6;
    state.stats.damage = 18;
    state.ai.hp = 9;
    state.player.hp = 0;
    state.screen = 'lose';
    state.winner = 'ai';
    pushLog(state, 'Kamu tumbang di rimba...');
    return;
  }
  state.screen = 'table';
}

// State awal untuk sebuah pose, dari seed yang sama.
export function shotState(shot, seed) {
  const state = newGame(seed);
  applyShot(state, shot, seed);
  return state;
}
