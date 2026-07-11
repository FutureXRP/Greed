import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Mono, UIText } from './ui';
import { RackRow } from './RackRow';
import { COLORS, FONTS, SPACE } from '../theme';
import { GameState } from '../engine/types';
import { Dictionary } from '../engine/dictionary';
import { classifyPlay } from '../engine/solver';
import { rackLetters } from '../engine/gameMachine';
import { wordScore, ScoreConfig } from '../engine/score';

export function SpellView({
  state,
  dict,
  cfg = {},
  hideValues,
  onToggle,
  onBackspace,
  onClear,
  onSubmit,
  onFold,
}: {
  state: GameState;
  dict: Dictionary;
  cfg?: ScoreConfig;
  hideValues?: boolean;
  onToggle: (i: number) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: (word: string) => void;
  onFold: () => void;
}) {
  const word = state.spelled.map((i) => state.rack[i]?.letter ?? '').join('');
  const rack = rackLetters(state);

  const kind = useMemo(() => (word.length >= 3 ? classifyPlay(word, rack, dict) : null), [word, rack, dict]);
  const valid = kind != null;
  const preview = valid ? wordScore(word, cfg) : 0;

  return (
    <View style={styles.wrap}>
      <UIText style={styles.prompt}>Spell one word · 3–7 letters</UIText>

      <View style={styles.wordBox}>
        {word.length === 0 ? (
          <UIText style={styles.placeholder}>tap tiles to spell</UIText>
        ) : (
          <Mono style={[styles.word, valid ? styles.wordValid : styles.wordPending]}>{word}</Mono>
        )}
        <View style={styles.scoreTag}>
          {word.length >= 3 ? (
            valid ? (
              <Mono style={styles.previewScore}>
                +{preview}
                {kind === 'coinage' ? <UIText style={styles.coinage}>  · a coinage — the house allows it</UIText> : null}
              </Mono>
            ) : (
              <UIText style={styles.invalid}>not a word</UIText>
            )
          ) : null}
        </View>
      </View>

      <RackRow state={state} tileSize={44} onTilePress={onToggle} highlightSpelled hideValues={hideValues} />

      <View style={styles.editRow}>
        <Button label="⌫" variant="ghost" small onPress={onBackspace} style={styles.editBtn} disabled={word.length === 0} />
        <Button label="CLEAR" variant="ghost" small onPress={onClear} style={styles.editBtn} disabled={word.length === 0} />
      </View>

      <View style={styles.actions}>
        <Button label="FOLD" variant="danger" onPress={onFold} style={styles.action} />
        <Button label="CASH OUT" variant="gold" onPress={() => onSubmit(word)} disabled={!valid} style={styles.action} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.md },
  prompt: { color: COLORS.muted, textAlign: 'center', letterSpacing: 1, fontSize: 13 },
  wordBox: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.ink,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.line,
    paddingVertical: SPACE.sm,
  },
  placeholder: { color: COLORS.muted, fontStyle: 'italic' },
  word: { fontSize: 34, letterSpacing: 6, fontWeight: '700' },
  wordValid: { color: COLORS.goldHi },
  wordPending: { color: COLORS.bone },
  scoreTag: { height: 20 },
  previewScore: { color: COLORS.win, fontSize: 15, fontWeight: '700' },
  coinage: { color: COLORS.goldHi, fontSize: 11, fontStyle: 'italic' },
  invalid: { color: COLORS.muted, fontSize: 13 },
  editRow: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'center' },
  editBtn: { minWidth: 90 },
  actions: { flexDirection: 'row', gap: SPACE.md },
  action: { flex: 1 },
});
