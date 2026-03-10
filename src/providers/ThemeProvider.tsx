import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/lib/storage';
import { lightColors, darkColors, type ThemeColors } from '@/lib/theme';

type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'artigen_theme_preference';

type ThemeContextType = {
  colorScheme: 'light' | 'dark';
  isDark: boolean;
  themeColors: ThemeColors;
  themePreference: ThemePreference;
  setTheme: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  isDark: false,
  themeColors: lightColors,
  themePreference: 'system',
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  // Restore persisted preference on mount
  useEffect(() => {
    storage.getItem(THEME_STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreference(saved);
      }
    });
  }, []);

  const colorScheme = useMemo(() => {
    if (preference === 'system') return systemScheme || 'light';
    return preference;
  }, [preference, systemScheme]);

  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref);
    storage.setItem(THEME_STORAGE_KEY, pref);
  }, []);

  const value = useMemo(() => ({
    colorScheme,
    isDark,
    themeColors,
    themePreference: preference,
    setTheme,
  }), [colorScheme, isDark, themeColors, preference, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
