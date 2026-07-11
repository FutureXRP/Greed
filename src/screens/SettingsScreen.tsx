import React from 'react';
import { View, StyleSheet, Switch } from 'react-native';
import { Screen } from '../components/Screen';
import { Card, UIText } from '../components/ui';
import { COLORS, SPACE } from '../theme';
import { useApp } from '../AppContext';
import { saveSettings } from '../storage';

export function SettingsScreen() {
  const { back, settings, setSettings } = useApp();

  function update(patch: Partial<typeof settings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  }

  return (
    <Screen title="SETTINGS" onBack={back}>
      <Card>
        <Toggle
          label="Reduced motion"
          hint="Disable tile flips, count-ups, and meter fills."
          value={settings.reducedMotion}
          onChange={(v) => update({ reducedMotion: v })}
        />
        <Toggle
          label="Haptics"
          hint="Vibration feedback on keep, pass, and forced fill."
          value={settings.haptics}
          onChange={(v) => update({ haptics: v })}
        />
        <Toggle
          label="Sound"
          hint="Card slides, felt thumps, coin shimmers. (Coming soon.)"
          value={settings.sound}
          onChange={(v) => update({ sound: v })}
        />
      </Card>
      <UIText style={styles.about}>
        GREED · seedv1 · The Daily is free forever. Keep seven. Regret the rest.
      </UIText>
    </Screen>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <UIText style={styles.label}>{label}</UIText>
        <UIText style={styles.hint}>{hint}</UIText>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: COLORS.line, true: COLORS.goldDim }}
        thumbColor={value ? COLORS.goldHi : COLORS.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACE.sm,
    gap: SPACE.md,
  },
  rowText: { flex: 1 },
  label: { color: COLORS.bone, fontSize: 15 },
  hint: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  about: { color: COLORS.muted, fontSize: 12, textAlign: 'center', marginTop: SPACE.md, lineHeight: 18 },
});
