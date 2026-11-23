// RIMBA DUEL — konfigurasi: elemen, kartu, dan aturan dasar.
// Empat elemen rimba membentuk siklus kelemahan: Daun mengalahkan Air,
// Air mengalahkan Api, Api mengalahkan Batu, Batu mengalahkan Daun.

export const CANVAS_W = 1280;
export const CANVAS_H = 800;

export const MAX_HP = 30;
export const START_HAND = 5;
export const MAX_HAND = 7;
export const MAX_ENERGY = 5;
export const DECK_SIZE = 24;

// Elemen: warna + bentuk + nama. Bentuknya berbeda-beda supaya bisa
// dibedakan lewat warna DAN bentuk, bukan lewat teks saja.
export const ELEMENTS = {
  DAUN: { key: 'DAUN', name: 'Daun', color: '#43a047', dark: '#1b5e20', light: '#a5d6a7', shape: 'leaf' },
  API: { key: 'API', name: 'Api', color: '#e64a19', dark: '#bf360c', light: '#ffab91', shape: 'flame' },
  AIR: { key: 'AIR', name: 'Air', color: '#1e88e5', dark: '#0d47a1', light: '#90caf9', shape: 'drop' },
  BATU: { key: 'BATU', name: 'Batu', color: '#8d6e63', dark: '#4e342e', light: '#bcaaa4', shape: 'rock' },
};

// Siklus: kunci mengalahkan nilai (DAUN mengalahkan AIR, dan seterusnya).
export const BEATS = { DAUN: 'AIR', AIR: 'API', API: 'BATU', BATU: 'DAUN' };

export function beats(attacker, defenderWard) {
  if (!attacker || !defenderWard) return false;
  return BEATS[attacker] === defenderWard;
}

export function losesTo(attacker, defenderWard) {
  if (!attacker || !defenderWard) return false;
  return BEATS[defenderWard] === attacker;
}

// Delapan jenis kartu; tiap jenis ada 3 salinan, jadi dek berisi 24 kartu.
export const CARD_TYPES = [
  { id: 'daun-tebas', name: 'Tebasan Daun', el: 'DAUN', cost: 1, atk: 3, text: 'Serang 3.' },
  { id: 'api-sembur', name: 'Semburan Api', el: 'API', cost: 1, atk: 3, text: 'Serang 3.' },
  { id: 'air-arus', name: 'Arus Air', el: 'AIR', cost: 2, atk: 5, text: 'Serang 5.' },
  { id: 'batu-hantam', name: 'Hantaman Batu', el: 'BATU', cost: 2, atk: 5, text: 'Serang 5.' },
  { id: 'daun-akar', name: 'Belitan Akar', el: 'DAUN', cost: 2, atk: 4, heal: 2, text: 'Serang 4. Pulih 2 HP.' },
  { id: 'api-kobar', name: 'Kobaran Rimba', el: 'API', cost: 3, atk: 7, text: 'Serang 7.' },
  { id: 'air-hujan', name: 'Hujan Lebat', el: 'AIR', cost: 3, atk: 6, draw: 1, text: 'Serang 6. Ambil 1 kartu.' },
  { id: 'batu-perisai', name: 'Perisai Batu', el: 'BATU', cost: 1, atk: 0, shield: 4, text: 'Perisai 4. Tanpa serang.' },
];

export function energyForRound(round) {
  // Giliran 1: 3 energi, lalu +1 tiap ronde, maks 5.
  return Math.min(2 + round, MAX_ENERGY);
}

export const RULE_LINES = [
  'Kalahkan Penjaga Rimba: kurangi HP-nya jadi 0.',
  'Tiap giliran: mainkan kartu (bayar energi), lalu akhiri giliran.',
  'Elemen yang mengalahkan ward lawan memberi +2 damage; yang kalah -1.',
  'Siklus: Daun > Air > Api > Batu > Daun.',
  'Klik kartu untuk memainkannya. Tombol 1-5 juga bisa. Spasi: akhiri giliran.',
];
