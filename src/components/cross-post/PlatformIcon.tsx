import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  platform: string;
  size?: number;
  color?: string;
};

// Brand colors per vendor guidelines. Some brands (TikTok, Threads) use pure
// black on light surfaces, which is unreadable on the app's dark theme. For
// those, declare both light/dark variants so the icon stays legible either way.
type PlatformConfig = {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  colorDark?: string;
};

const PLATFORM_ICONS: Record<string, PlatformConfig> = {
  photo:     { name: 'camera-outline',    color: '#E1306C' },
  twitter:   { name: 'logo-twitter',      color: '#1DA1F2' },
  tiktok:    { name: 'logo-tiktok',       color: '#000000', colorDark: '#FFFFFF' },
  facebook:  { name: 'logo-facebook',     color: '#1877F2' },
  pinterest: { name: 'logo-pinterest',    color: '#E60023' },
  threads:   { name: 'at-outline',        color: '#000000', colorDark: '#FFFFFF' },
};

const FALLBACK: PlatformConfig = { name: 'share-outline', color: '#666666', colorDark: '#A8A8A8' };

export function PlatformIcon({ platform, size = 24, color }: Props) {
  const { isDark } = useTheme();
  const config = PLATFORM_ICONS[platform] || FALLBACK;
  const themedBrandColor = isDark && config.colorDark ? config.colorDark : config.color;
  const iconColor = color || themedBrandColor;

  return (
    <View style={styles.container}>
      <Ionicons name={config.name} size={size} color={iconColor} />
    </View>
  );
}

export function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    photo: 'Photo',
    twitter: 'X (Twitter)',
    tiktok: 'TikTok',
    facebook: 'Facebook',
    pinterest: 'Pinterest',
    threads: 'Threads',
  };
  return labels[platform] || platform;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
