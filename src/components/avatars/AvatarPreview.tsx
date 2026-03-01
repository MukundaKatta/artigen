import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { UserAvatar } from '@/services/avatar.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PREVIEW_SIZE = SCREEN_WIDTH - spacing.lg * 4;

type Props = {
  avatar: UserAvatar;
  onSetAsProfile: (avatarId: string) => void;
  onRemove: (avatarId: string) => void;
  onClose: () => void;
};

export function AvatarPreview({ avatar, onSetAsProfile, onRemove, onClose }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: avatar.image_url }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        {avatar.is_active && (
          <View style={styles.activeBanner}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
            <Text style={styles.activeBannerText}>Current Profile Avatar</Text>
          </View>
        )}
      </View>

      <Text style={styles.styleLabel}>
        Style: {avatar.style.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </Text>

      <View style={styles.actions}>
        {!avatar.is_active && (
          <Button
            title="Set as Profile"
            onPress={() => onSetAsProfile(avatar.id)}
            variant="primary"
            size="lg"
            style={styles.button}
          />
        )}
        <Button
          title="Remove"
          onPress={() => onRemove(avatar.id)}
          variant="outline"
          size="lg"
          style={styles.button}
        />
        <Button
          title="Close"
          onPress={onClose}
          variant="text"
          size="md"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  imageWrapper: {
    borderRadius: PREVIEW_SIZE / 2,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  image: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_SIZE / 2,
  },
  activeBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: spacing.sm,
  },
  activeBannerText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  styleLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    alignItems: 'center',
  },
  button: {
    width: '100%',
  },
});
