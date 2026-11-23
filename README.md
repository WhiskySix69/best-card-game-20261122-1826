# 🌿 RIMBA DUEL — Make the best card game

[![best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/WhiskySix69/best-card-game-20261122-1826/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/WhiskySix69/best-card-game-20261122-1826/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826)

**RIMBA DUEL** adalah game duel kartu 1 lawan 1 yang berjalan offline di
browser desktop dari file statis. Kamu menantang Penjaga Rimba: dua-duanya
punya 30 HP dan satu dek 24 kartu dari empat elemen rimba — Daun, Api, Air,
dan Batu. Elemen yang kamu mainkan terakhir menjadi *ward*-mu, dan elemen
lawan yang mengalahkannya memberi bonus damage.

## Cara bermain

- **Tujuan:** kurangi HP Penjaga Rimba dari 30 menjadi 0 sebelum dia
  menghabiskan HP-mu.
- **Main kartu:** klik kartu di tanganmu (atau tekan tombol 1–7). Kartu hanya
  bisa dimainkan kalau energimu cukup.
- **Energi:** setiap giliran energimu terisi ulang — 3 di ronde 1, lalu naik 1
  tiap ronde sampai maksimal 5. Kartu mengambil 1 kartu baru di awal giliran.
- **Siklus elemen:** Daun > Air > Api > Batu > Daun. Menyerang dengan elemen
  yang mengalahkan *ward* lawan memberi +2 damage; elemen yang kalah
  memberi −1 damage (minimal 1).
- **Ward:** elemen kartu terakhir yang kamu mainkan menjadi ward-mu. Jaga
  ward-mu supaya lawan tidak dapat bonus.
- **Perisai:** kartu Perisai Batu memberi perisai yang menyerap damage sebelum
  HP berkurang.
- **Kartu efek:** Belitan Akar menyembuhkan 2 HP, Hujan Lebat mengambil 1
  kartu tambahan.
- **Akhiri giliran:** klik tombol AKHIRI GILIRAN atau tekan Spasi — lalu
  Penjaga Rimba bermain.
- **Menang / kalah:** layar akhir menampilkan HP, ronde, jumlah kartu yang
  dimainkan, dan total damage. Tekan R untuk main lagi, Esc untuk menu.

## Kartu (24 kartu, 8 jenis × 3)

| Kartu | Elemen | Biaya | Efek |
| --- | --- | --- | --- |
| Tebasan Daun | Daun | 1 | 3 damage |
| Semburan Api | Api | 1 | 3 damage |
| Arus Air | Air | 2 | 5 damage |
| Hantaman Batu | Batu | 2 | 5 damage |
| Belitan Akar | Daun | 2 | 4 damage, pulih 2 HP |
| Kobaran Rimba | Api | 3 | 7 damage |
| Hujan Lebat | Air | 3 | 6 damage, ambil 1 kartu |
| Perisai Batu | Batu | 1 | +4 perisai |

## Menjalankan

Buka `game/index.html` di Chrome desktop, atau jalankan server statis apa pun
di folder `game/` (modul ES butuh HTTP, bukan `file://`):

```sh
cd game && python3 -m http.server 8080
```

## Struktur

- `main.ts` — program Node 22 yang menyerahkan game (menyalin `game/` dan
  `screenshots/`, menulis `dossier.json`)
- `game/index.html` — halaman game
- `game/src/config.js` — angka, elemen, siklus, dan daftar kartu
- `game/src/random.js` — RNG mulberry32 dan acak Fisher-Yates
- `game/src/deck.js` — bangun dek, ambil kartu, kocok ulang buangan
- `game/src/state.js` — mesin giliran, main kartu, AI, menang/kalah
- `game/src/render.js` — semua gambar di canvas (judul, meja, kartu, bar HP)
- `game/src/input.js` — klik mouse dan keyboard
- `game/src/shots.js` — pose screenshot deterministik
- `game/src/main.js` — boot game dan loop requestAnimationFrame
- `vendor/makefun-game.ts` — library make.fun dari kit (tidak diubah)
- `screenshots/` — 4 tangkapan layar asli dari game ini

Dibuat untuk kompetisi [Make the best card game](https://make.fun/bounty/best-card-game-20261122-1826) di make.fun.

## Lisensi

MIT — lihat `LICENSE`.
