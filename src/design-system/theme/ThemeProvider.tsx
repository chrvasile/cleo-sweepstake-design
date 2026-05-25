import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { colorRoles, darkModeColorRoles, tokens } from '../tokens';

export type ThemeName = 'light' | 'dark';
export type ThemeMode = 'auto' | 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  tokens: typeof tokens;
  colorRoles: typeof colorRoles;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const SUNRISE_HOUR = 7;
const SUNSET_HOUR = 19;

const getThemeForTime = (): ThemeName => {
  const hour = new Date().getHours();
  return hour >= SUNSET_HOUR || hour < SUNRISE_HOUR ? 'dark' : 'light';
};

const applyThemeVars = (theme: ThemeName) => {
  const roles = theme === 'dark' ? darkModeColorRoles : colorRoles;
  const root = document.documentElement;

  for (const [key, value] of Object.entries(roles.background)) {
    root.style.setProperty(`--bg-${key}`, value);
  }
  for (const [key, value] of Object.entries(roles.content)) {
    root.style.setProperty(`--content-${key}`, value);
  }
  for (const [key, value] of Object.entries(roles.border)) {
    root.style.setProperty(`--border-${key}`, value);
  }
  root.setAttribute('data-theme', theme);
};

const resolveTheme = (mode: ThemeMode): ThemeName =>
  mode === 'auto' ? getThemeForTime() : mode;

export const ThemeProvider: React.FC<{ initialTheme?: ThemeMode; children: React.ReactNode }> = ({
  initialTheme = 'light',
  children,
}) => {
  const [mode, setMode] = useState<ThemeMode>(initialTheme);
  const [theme, setThemeRaw] = useState<ThemeName>(() => resolveTheme(initialTheme));

  useEffect(() => {
    const resolved = resolveTheme(mode);
    setThemeRaw(resolved);
    applyThemeVars(resolved);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const check = () => {
      const resolved = getThemeForTime();
      setThemeRaw((prev) => {
        if (prev !== resolved) applyThemeVars(resolved);
        return resolved;
      });
    };

    const interval = setInterval(check, 60_000);
    return () => clearInterval(interval);
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const current = resolveTheme(prev);
      return current === 'light' ? 'dark' : 'light';
    });
  }, []);

  const setTheme = useCallback((t: ThemeName) => setMode(t), []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      mode,
      setTheme,
      setMode,
      toggleTheme,
      tokens,
      colorRoles: theme === 'dark' ? darkModeColorRoles : colorRoles,
    }),
    [theme, mode, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};
