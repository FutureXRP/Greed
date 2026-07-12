import React, { createContext, useContext } from 'react';
import { Dictionary } from './engine/dictionary';
import { Settings } from './storage';

/** Sub-routes pushed above a tab root (tabs themselves live in App state). */
export type Route = { name: 'settings' } | { name: 'how' };

export interface AppContextValue {
  dict: Dictionary;
  settings: Settings;
  setSettings: (s: Settings) => void;
  navigate: (r: Route) => void;
  back: () => void;
  /** True when a sub-route is pushed (tab roots have no back). */
  canGoBack: boolean;
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
