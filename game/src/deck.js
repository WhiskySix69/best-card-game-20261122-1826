// Dek RIMBA DUEL: 24 kartu (3 salinan dari tiap 8 jenis), dikocok dengan RNG.
// Tiap sisi (pemain dan AI) punya dek, tangan, dan tumpukan buang sendiri.

import { CARD_TYPES, DECK_SIZE } from './config.js';
import { shuffle } from './random.js';

let uidCounter = 1;

export function makeCardInstance(type) {
  return { uid: uidCounter, type: type.id, def: type };
}

export function buildDeck(rng) {
  const cards = [];
  for (const type of CARD_TYPES) {
    for (let i = 0; i < 3; i += 1) {
      uidCounter += 1;
      cards.push(makeCardInstance(type));
    }
  }
  if (cards.length !== DECK_SIZE) throw new Error('deck size mismatch');
  return shuffle(cards, rng);
}

export function newSide(rng) {
  return {
    deck: buildDeck(rng),
    hand: [],
    discard: [],
    hp: 30,
    maxHp: 30,
    energy: 0,
    maxEnergy: 5,
    ward: null,
    shield: 0,
  };
}

// Ambil 1 kartu dari dek ke tangan. Kalau dek habis, kocok ulang buangan.
// Mengembalikan kartu yang diambil, atau null kalau tidak ada kartu tersisa.
export function drawCard(side, rng) {
  if (side.deck.length === 0) {
    if (side.discard.length === 0) return null;
    side.deck = shuffle(side.discard, rng);
    side.discard = [];
  }
  const card = side.deck.pop();
  side.hand.push(card);
  return card;
}

export function drawUpTo(side, rng, count) {
  const drawn = [];
  for (let i = 0; i < count; i += 1) {
    const card = drawCard(side, rng);
    if (!card) break;
    drawn.push(card);
  }
  return drawn;
}
