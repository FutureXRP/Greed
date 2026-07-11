import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { DraftView } from './DraftView';
import { SpellView } from './SpellView';
import { Button, UIText } from './ui';
import { useHand } from './useHand';
import { COLORS, SPACE } from '../theme';
import { GameConfig, GameState } from '../engine/types';
import { Dictionary } from '../engine/dictionary';
import { ScoreConfig } from '../engine/score';

export interface LevelHandExtras {
  cursedIndex?: number | null;
  peekAhead?: number;
  markedLetter?: string | null;
  decisionSeconds?: number | null;
  hideValues?: boolean;
  canBurn?: boolean;
  loadedDie?: boolean;
  haptics?: boolean;
  reducedMotion?: boolean;
  /** Fresh random tail for Loaded Die (count = unrevealed letters). */
  makeTail?: (count: number) => string[];
}

/** One Gauntlet/Endless level: draft → spell, with mid-draft shop items. */
export function LevelHand({
  stream,
  config,
  dict,
  cfg = {},
  extras = {},
  onSubmit,
  onFold,
}: {
  stream: string[];
  config: GameConfig;
  dict: Dictionary;
  cfg?: ScoreConfig;
  extras?: LevelHandExtras;
  onSubmit: (word: string, state: GameState) => void;
  onFold: (state: GameState) => void;
}) {
  const hand = useHand(stream, config);
  const [burnUsed, setBurnUsed] = useState(false);
  const [dieUsed, setDieUsed] = useState(false);
  const [burnArmed, setBurnArmed] = useState(false);

  const canBurnNow = extras.canBurn && !burnUsed && burnArmed && hand.state.rack.length > 0;

  function onBurnTile(i: number) {
    hand.burn(i);
    setBurnUsed(true);
    setBurnArmed(false);
  }

  function useLoadedDie() {
    if (!extras.makeTail) return;
    const remaining = hand.state.stream.length - hand.state.revealIndex;
    if (remaining <= 0) return;
    hand.rerollTail(extras.makeTail(remaining));
    setDieUsed(true);
  }

  if (hand.state.phase === 'draft') {
    return (
      <View style={styles.wrap}>
        <DraftView
          state={hand.state}
          onKeep={hand.keep}
          onPass={hand.pass}
          extras={{
            cursedIndex: extras.cursedIndex,
            peekAhead: extras.peekAhead,
            markedLetter: extras.markedLetter,
            decisionSeconds: extras.decisionSeconds,
            hideValues: extras.hideValues,
            canBurn: canBurnNow,
            onBurn: onBurnTile,
            haptics: extras.haptics,
            reducedMotion: extras.reducedMotion,
          }}
        />
        <View style={styles.itemRow}>
          {extras.canBurn && !burnUsed ? (
            <Button
              label={burnArmed ? 'BURN: TAP A TILE' : 'USE BURN'}
              variant="danger"
              small
              onPress={() => setBurnArmed((b) => !b)}
            />
          ) : null}
          {extras.loadedDie && !dieUsed ? (
            <Button label="LOADED DIE" variant="ghost" small onPress={useLoadedDie} />
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <SpellView
      state={hand.state}
      dict={dict}
      cfg={cfg}
      hideValues={false}
      onToggle={hand.toggle}
      onBackspace={hand.backspace}
      onClear={hand.clear}
      onSubmit={(w) => onSubmit(w, hand.state)}
      onFold={() => onFold(hand.state)}
    />
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.md },
  itemRow: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'center', flexWrap: 'wrap' },
});
