import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  platform: string;
  size?: number;
  color?: string;
};

const PLATFORM_ICONS: Record<string, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  photo: { name: 'camera-outline', color: '#E1306C' },
  twitter: { name: 'logo-twitter', color: '#1DA1F2' },
  tiktok: { name: 'logo-tiktok', color: '#000000' },
  facebook: { name: 'logo-facebook', color: '#1877F2' },
  pinterest: { name: 'logo-pinterest', color: '#E60023' },
  threads: { name: 'at-outline', color: '#000000' },
};

export function PlatformIcon({ platform, size = 24, color }: Props) {
  const config = PLATFORM_ICONS[platform] || { name: 'share-outline' as const, color: '#666' };
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
