// Input RIMBA DUEL: klik mouse dan keyboard. Semua hit-test memakai layout
// yang sama dengan render, jadi yang terlihat sama dengan yang bisa diklik.

import { getLayout } from './render.js';
import { playCard, endPlayerTurn, restart, toTitle } from './state.js';

function pointIn(rect, x, y) {
  return rect && x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function bindInput(canvas, getState, setState) {
  const hover = { x: -1, y: -1 };
  const scale = () => canvas.getBoundingClientRect().width / canvas.width;

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    hover.x = (e.clientX - r.left) / scale();
    hover.y = (e.clientY - r.top) / scale();
  });
  canvas.addEventListener('mouseleave', () => {
    hover.x = -1;
    hover.y = -1;
  });

  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / scale();
    const y = (e.clientY - r.top) / scale();
    const state = getState();
    const layout = getLayout(state);
    if (state.screen === 'title') {
      if (pointIn(layout.start, x, y)) {
        state.screen = 'table';
      }
      return;
    }
    if (state.screen === 'win' || state.screen === 'lose') {
      if (pointIn(layout.restart, x, y)) setState(restart(state));
      return;
    }
    if (state.screen === 'table') {
      if (pointIn(layout.menu, x, y)) {
        setState(toTitle(state));
        return;
      }
      if (pointIn(layout.endTurn, x, y)) {
        endPlayerTurn(state);
        return;
      }
      for (const cardRect of layout.playerCards) {
        if (pointIn(cardRect, x, y)) {
          playCard(state, 'player', cardRect.idx);
          return;
        }
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    const state = getState();
    if (state.screen === 'title') {
      if (e.key === 'Enter' || e.key === ' ') state.screen = 'table';
      return;
    }
    if (state.screen === 'win' || state.screen === 'lose') {
      if (e.key === 'r' || e.key === 'R' || e.key === 'Enter') setState(restart(state));
      if (e.key === 'Escape') setState(toTitle(state));
      return;
    }
    if (state.screen !== 'table') return;
    if (state.turn !== 'player') return;
    if (e.key >= '1' && e.key <= '7') {
      const idx = Number(e.key) - 1;
      if (idx < state.player.hand.length) playCard(state, 'player', idx);
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      endPlayerTurn(state);
    } else if (e.key === 'Escape') {
      setState(toTitle(state));
    }
  });

  return hover;
}
