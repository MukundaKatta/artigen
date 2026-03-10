import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type MentorProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
};

type Props = {
  mentor: MentorProfile;
  focusAreas?: string[];
  onRequest?: (mentorId: string) => void;
};

export function MentorCard({ mentor, focusAreas, onRequest }: Props) {
  const router = useRouter();

  function handlePress() {
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    router.push(`/(screens)/user/${mentor.id}`);
  }

  return (
    <AnimatedPressable style={styles.card} onPress={handlePress} scaleValue={0.97}>
      <Image
        source={
          mentor.avatar_url
            ? { uri: mentor.avatar_url }
            : require('../../../assets/images/default-avatar.png')
        }
        style={styles.avatar}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {mentor.full_name || mentor.username}
          </Text>
          {mentor.is_verified && (
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          )}
        </View>
        <Text style={styles.username}>@{mentor.username}</Text>
        {focusAreas && focusAreas.length > 0 && (
          <View style={styles.focusRow}>
            {focusAreas.slice(0, 3).map((area) => (
              <View key={area} style={styles.focusTag}>
                <Text style={styles.focusTagText}>{area}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      {onRequest && (
        <TouchableOpacity
          style={styles.requestButton}
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRequest(mentor.id);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.requestButtonText}>Request</Text>
        </TouchableOpacity>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  username: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 1,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.xs,
  },
  focusTag: {
    backgroundColor: colors.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  focusTagText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  requestButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  requestButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
});
