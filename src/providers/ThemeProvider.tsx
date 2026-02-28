import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, type ThemeColors } from '@/lib/theme';

type ThemePreference = 'system' | 'light' | 'dark';

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

  const colorScheme = useMemo(() => {
    if (preference === 'system') return systemScheme || 'light';
    return preference;
  }, [preference, systemScheme]);

  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? darkColors : lightColors;

  function setTheme(pref: ThemePreference) {
    setPreference(pref);
  }

  const value = useMemo(() => ({
    colorScheme,
    isDark,
    themeColors,
    themePreference: preference,
    setTheme,
  }), [colorScheme, isDark, themeColors, preference]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
