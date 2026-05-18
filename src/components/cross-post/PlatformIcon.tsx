import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, platformColors } from '@/lib/theme';

type Props = {
  platform: string;
  size?: number;
  color?: string;
};

const PLATFORM_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  photo: { name: 'camera-outline', color: platformColors.photo },
  twitter: { name: 'logo-twitter', color: platformColors.twitter },
  tiktok: { name: 'logo-tiktok', color: colors.backgroundDark },
  facebook: { name: 'logo-facebook', color: platformColors.facebook },
  pinterest: { name: 'logo-pinterest', color: platformColors.pinterest },
  threads: { name: 'at-outline', color: colors.backgroundDark },
};

export function PlatformIcon({ platform, size = 24, color }: Props) {
  const config = PLATFORM_ICONS[platform] || { name: 'share-outline' as const, color: colors.textSecondary };
  const iconColor = color || config.color;

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
