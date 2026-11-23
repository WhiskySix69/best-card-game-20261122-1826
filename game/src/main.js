// RIMBA DUEL — boot game: canvas 1280x800, loop requestAnimationFrame,
// ?shot= & ?seed= untuk screenshot, window.__ready untuk harness.

import { CANVAS_W, CANVAS_H } from './config.js';
import { newGame, update } from './state.js';
import { draw } from './render.js';
import { bindInput } from './input.js';
import { shotState } from './shots.js';

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7');
const shot = params.get('shot');

let state = shot ? shotState(shot, seed) : newGame(seed);
if (!shot) state.screen = 'title';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const hover = bindInput(canvas, () => state, (next) => {
  state = next;
});

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  update(state, dt);
  draw(ctx, state, hover);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
window.__ready = true;
