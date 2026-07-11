import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, Route } from './src/AppContext';
import { Dictionary } from './src/engine/dictionary';
import { loadDictionary } from './src/engine/dictionaryLoader';
import { dayNumber } from './src/engine/generate';
import { getSettings, saveSettings, Settings } from './src/storage';
import { COLORS } from './src/theme';
import { Display, Loading, UIText } from './src/components/ui';
import { HomeScreen } from './src/screens/HomeScreen';
import { DailyScreen } from './src/screens/DailyScreen';
import { GauntletScreen } from './src/screens/GauntletScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { HowScreen } from './src/screens/HowScreen';

export default function App() {
  const [dict, setDict] = useState<Dictionary | null>(null);
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const [today] = useState(() => new Date());

  useEffect(() => {
    (async () => {
      const [d, s] = await Promise.all([loadDictionary(), getSettings()]);
      setDict(d);
      setSettingsState(s);
    })();
  }, []);

  const navigate = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const back = useCallback(
    () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    [],
  );
  const setSettings = useCallback((s: Settings) => {
    setSettingsState(s);
    saveSettings(s);
  }, []);

  if (!dict || !settings) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <View style={styles.boot}>
          <Display style={styles.wordmark}>GREED</Display>
          <UIText style={styles.tagline}>Keep seven. Regret the rest.</UIText>
          <View style={styles.loadWrap}>
            <Loading label="Shuffling the bag…" />
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  const route = stack[stack.length - 1];
  const dayNum = dayNumber(today);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppProvider value={{ dict, settings, setSettings, navigate, back, today, dayNum }}>
        {renderRoute(route)}
      </AppProvider>
    </SafeAreaProvider>
  );
}

function renderRoute(route: Route) {
  switch (route.name) {
    case 'home':
      return <HomeScreen />;
    case 'daily':
      return <DailyScreen />;
    case 'gauntlet':
      return <GauntletScreen mode="gauntlet" />;
    case 'endless':
      return <GauntletScreen mode="endless" />;
    case 'stats':
      return <StatsScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'how':
      return <HowScreen />;
    default:
      return <HomeScreen />;
  }
}

const styles = StyleSheet.create({
  boot: { flex: 1, backgroundColor: COLORS.ink, alignItems: 'center', justifyContent: 'center', gap: 8 },
  wordmark: { fontSize: 64, letterSpacing: 8, color: COLORS.gold },
  tagline: { color: COLORS.muted, fontStyle: 'italic', fontSize: 15 },
  loadWrap: { height: 120, justifyContent: 'center' },
});
