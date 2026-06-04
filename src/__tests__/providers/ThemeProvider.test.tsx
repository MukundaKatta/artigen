import React, { useEffect } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider, useTheme } from '@/providers/ThemeProvider';
import { storage } from '@/lib/storage';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors } from '@/lib/theme';

// Helper component that exposes the current theme context via a callback.
function Spy({ onContext }: { onContext: (ctx: ReturnType<typeof useTheme>) => void }) {
  const ctx = useTheme();
  useEffect(() => {
    onContext(ctx);
  });
  return null;
}

beforeEach(() => {
  jest.clearAllMocks();
  (storage as unknown as { __reset: () => void }).__reset();
  (useColorScheme as jest.Mock).mockReturnValue('light');
});

describe('<ThemeProvider>', () => {
  it('starts with "system" preference and resolves to the system colorScheme', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');

    let captured: ReturnType<typeof useTheme> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ThemeProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ThemeProvider>,
      );
    });

    expect(captured!.themePreference).toBe('system');
    expect(captured!.colorScheme).toBe('dark');
    expect(captured!.isDark).toBe(true);
    expect(captured!.themeColors).toBe(darkColors);
  });

  it('restores a persisted "light" preference on mount, overriding system', async () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark'); // system says dark
    await storage.setItem('artigen_theme_preference', 'light');

    let captured: ReturnType<typeof useTheme> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ThemeProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ThemeProvider>,
      );
    });

    expect(captured!.themePreference).toBe('light');
    expect(captured!.colorScheme).toBe('light');
    expect(captured!.themeColors).toBe(lightColors);
  });

  it('setTheme persists the new preference', async () => {
    let captured: ReturnType<typeof useTheme> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ThemeProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ThemeProvider>,
      );
    });

    await act(async () => {
      captured!.setTheme('dark');
    });

    expect(storage.setItem).toHaveBeenCalledWith('artigen_theme_preference', 'dark');
    expect(captured!.themePreference).toBe('dark');
    expect(captured!.isDark).toBe(true);
  });

  it('ignores invalid persisted values', async () => {
    await storage.setItem('artigen_theme_preference', 'plaid');

    let captured: ReturnType<typeof useTheme> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ThemeProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ThemeProvider>,
      );
    });

    // Falls back to system default
    expect(captured!.themePreference).toBe('system');
  });

  it('falls back to "light" when useColorScheme returns null', async () => {
    (useColorScheme as jest.Mock).mockReturnValue(null);

    let captured: ReturnType<typeof useTheme> | null = null;
    await act(async () => {
      TestRenderer.create(
        <ThemeProvider>
          <Spy onContext={(c) => { captured = c; }} />
        </ThemeProvider>,
      );
    });

    expect(captured!.colorScheme).toBe('light');
  });
});
