import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlatformIcon, getPlatformLabel } from './PlatformIcon';
import { SUPPORTED_PLATFORMS } from '@/services/cross-post.service';
import type { CrossPostAccount } from '@/services/cross-post.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  accounts: CrossPostAccount[];
  selectedPlatforms: string[];
  onTogglePlatform: (platform: string) => void;
};

export function PlatformSelector({ accounts, selectedPlatforms, onTogglePlatform }: Props) {
  const connectedPlatforms = new Set(
    accounts.filter((a) => a.is_connected).map((a) => a.platform)
  );

  return (
    <View style={styles.container}>
      {SUPPORTED_PLATFORMS.map((platform) => {
        const isConnected = connectedPlatforms.has(platform);
        const isSelected = selectedPlatforms.includes(platform);
        const account = accounts.find((a) => a.platform === platform);

        return (
          <TouchableOpacity
            key={platform}
            style={[
              styles.platformItem,
              isSelected && styles.platformSelected,
              !isConnected && styles.platformDisabled,
            ]}
            onPress={() => isConnected && onTogglePlatform(platform)}
            disabled={!isConnected}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${getPlatformLabel(platform)}${isConnected ? '' : ', not connected'}`}
            accessibilityState={{ selected: isSelected, disabled: !isConnected }}
          >
            <PlatformIcon platform={platform} size={28} />
            <Text
              style={[
                styles.platformName,
                !isConnected && styles.platformNameDisabled,
              ]}
            >
              {getPlatformLabel(platform)}
            </Text>
            {isConnected && account?.platform_username ? (
              <Text style={styles.username}>@{account.platform_username}</Text>
            ) : (
              <Text style={styles.notConnected}>Not connected</Text>
            )}
            {isConnected && (
              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                {isSelected && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  platformItem: {
    width: '47%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background,
  },
  platformSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.05)',
  },
  platformDisabled: {
    opacity: 0.5,
  },
  platformName: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  platformNameDisabled: {
    color: colors.textSecondary,
  },
  username: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  notConnected: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
