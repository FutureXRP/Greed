import React, { createContext, useContext } from 'react';
import { Dictionary } from './engine/dictionary';
import { Settings } from './storage';

export type Route =
  | { name: 'home' }
  | { name: 'daily' }
  | { name: 'gauntlet' }
  | { name: 'endless' }
  | { name: 'stats' }
  | { name: 'settings' }
  | { name: 'how' };

export interface AppContextValue {
  dict: Dictionary;
  settings: Settings;
  setSettings: (s: Settings) => void;
  navigate: (r: Route) => void;
  back: () => void;
  today: Date;
  dayNum: number;
}

const Ctx = createContext<AppContextValue | null>(null);

export const AppProvider = Ctx.Provider;

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used within AppProvider');
  return v;
}
