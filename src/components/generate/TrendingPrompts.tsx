import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { getTrendingPrompts } from '@/services/prompt-library.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type TrendingPrompt = {
  id: string;
  title: string;
  prompt: string;
  model_id: string | null;
  save_count: number;
  user: { username: string } | null;
};

type Props = {
  onSelect: (prompt: string) => void;
};

export function TrendingPrompts({ onSelect }: Props) {
  const [prompts, setPrompts] = useState<TrendingPrompt[]>([]);

  useEffect(() => {
    getTrendingPrompts(6).then(({ data }) => {
      if (data.length > 0) setPrompts(data as TrendingPrompt[]);
    }).catch((err) => console.warn('Failed to load trending prompts:', err));
  }, []);

  if (prompts.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trending-up" size={16} color={colors.primary} />
        <Text style={styles.title}>Trending Prompts</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {prompts.map((item) => (
          <AnimatedPressable
            key={item.id}
            style={styles.card}
            onPress={() => onSelect(item.prompt)}
            scaleValue={0.97}
            accessibilityRole="button"
            accessibilityLabel={`Use prompt: ${item.title}`}
          >
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardPrompt} numberOfLines={2}>{item.prompt}</Text>
            <View style={styles.cardFooter}>
              {item.user && (
                <Text style={styles.cardAuthor}>@{item.user.username}</Text>
              )}
              <View style={styles.cardSaves}>
                <Ionicons name="bookmark" size={10} color={colors.textSecondary} />
                <Text style={styles.cardSaveCount}>{item.save_count}</Text>
              </View>
            </View>
          </AnimatedPressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  scroll: {
    gap: spacing.sm,
  },
  card: {
    width: 180,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  cardPrompt: {
    fontSize: 12,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardAuthor: {
    fontSize: 10,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  cardSaves: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardSaveCount: {
    fontSize: 10,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
