import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import type { AwardType } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (awardTypeId: string) => void;
  awardTypes: AwardType[];
};

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  diamond: 'Diamond',
};

const TIER_COLORS: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
};

function groupByTier(awardTypes: AwardType[]) {
  const groups: { tier: string; items: AwardType[] }[] = [];
  const tierMap = new Map<string, AwardType[]>();

  awardTypes.forEach((at) => {
    const tier = at.tier || 'bronze';
    if (!tierMap.has(tier)) {
      tierMap.set(tier, []);
    }
    tierMap.get(tier)!.push(at);
  });

  const tierOrder = ['bronze', 'silver', 'gold', 'diamond'];
  tierOrder.forEach((tier) => {
    const items = tierMap.get(tier);
    if (items && items.length > 0) {
      groups.push({ tier, items });
    }
  });

  return groups;
}

export function AwardPicker({ visible, onClose, onSelect, awardTypes }: Props) {
  if (!visible) return null;

  const groups = groupByTier(awardTypes);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Give an Award</Text>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {groups.map((group) => (
              <View key={group.tier} style={styles.tierSection}>
                <View style={styles.tierHeader}>
                  <View
                    style={[styles.tierDot, { backgroundColor: TIER_COLORS[group.tier] }]}
                  />
                  <Text style={styles.tierLabel}>{TIER_LABELS[group.tier]}</Text>
                </View>
                <View style={styles.grid}>
                  {group.items.map((award) => (
                    <TouchableOpacity
                      key={award.id}
                      style={styles.awardItem}
                      onPress={() => {
                        onSelect(award.id);
                        onClose();
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.awardEmoji}>{award.emoji}</Text>
                      <Text style={styles.awardName} numberOfLines={1}>
                        {award.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxxl,
    maxHeight: '60%',
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  tierSection: {
    marginBottom: spacing.lg,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tierDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tierLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  awardItem: {
    width: 80,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  awardEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  awardName: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.text,
    textAlign: 'center',
  },
});
