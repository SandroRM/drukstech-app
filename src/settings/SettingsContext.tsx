import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppSettings, defaultSettings, loadSettings, persistSettings } from './settingsStore';
import { reportGenAppError } from '../debug/genAppDebug';

type SettingsCtx = {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
};

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings());

  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .catch((e) => reportGenAppError('SettingsProvider.load', e, {}));
  }, []);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persistSettings(next).catch((e) => reportGenAppError('SettingsProvider.persist', e, {}));
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ settings, updateSettings }}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
