import { useCallback, useMemo, useState } from 'react';
import {
  initGame,
  keep as keepFn,
  pass as passFn,
  burn as burnFn,
  toggleTile as toggleFn,
  backspaceTile as backspaceFn,
  clearSpelled as clearFn,
  currentLetter,
  currentWord,
  rackLetters,
} from '../engine/gameMachine';
import { GameConfig, GameState } from '../engine/types';

/** React wrapper over the pure game reducer. */
export function useHand(stream: string[], config: GameConfig) {
  const [state, setState] = useState<GameState>(() => initGame(stream, config));

  const keep = useCallback(() => setState((s) => keepFn(s)), []);
  const pass = useCallback(() => setState((s) => passFn(s)), []);
  const burn = useCallback((i: number) => setState((s) => burnFn(s, i)), []);
  const toggle = useCallback((i: number) => setState((s) => toggleFn(s, i)), []);
  const backspace = useCallback(() => setState((s) => backspaceFn(s)), []);
  const clear = useCallback(() => setState((s) => clearFn(s)), []);
  /** Replace the yet-unrevealed tail of the stream (Loaded Die). */
  const rerollTail = useCallback((newTail: string[]) => {
    setState((s) => {
      const stream2 = s.stream.slice(0, s.revealIndex).concat(newTail);
      return { ...s, stream: stream2 };
    });
  }, []);

  const derived = useMemo(
    () => ({
      current: currentLetter(state),
      word: currentWord(state),
      rack: rackLetters(state),
    }),
    [state],
  );

  return { state, setState, keep, pass, burn, toggle, backspace, clear, rerollTail, ...derived };
}
