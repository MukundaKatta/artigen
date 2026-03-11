import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGenerationHistory, GenerationRecord } from '@/services/generation-history.service';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';
import { logger } from '@/lib/logger';

type Props = {
  userId: string;
  onSelect: (prompt: string, modelId: string) => void;
};

export function PromptHistory({ userId, onSelect }: Props) {
  const [history, setHistory] = useState<GenerationRecord[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    getGenerationHistory(userId, 0, 10)
      .then(setHistory)
      .catch((err: unknown) => logger.warn('Failed to load prompt history:', err));
  }, [userId]);

  if (history.length === 0) return null;

  const visible = expanded ? history : history.slice(0, 3);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        accessibilityRole="button"
        accessibilityLabel={expanded ? 'Collapse prompt history' : 'Expand prompt history'}
      >
        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.title}>Recent Prompts</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textSecondary}
        />
      </Pressable>
      <ScrollView
        horizontal={!expanded}
        showsHorizontalScrollIndicator={false}
        style={expanded ? styles.expandedList : undefined}
      >
        {visible.map((record) => (
          <Pressable
            key={record.id}
            style={[styles.card, expanded && styles.cardExpanded]}
            onPress={() => onSelect(record.prompt, record.model_id)}
            accessibilityRole="button"
            accessibilityLabel={`Use prompt: ${record.prompt.slice(0, 50)}`}
          >
            <Text style={styles.promptText} numberOfLines={2}>
              {record.prompt}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.modelName}>{record.model_name}</Text>
              {record.credits_used > 0 && (
                <Text style={styles.credits}>{record.credits_used}cr</Text>
              )}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {!expanded && history.length > 3 && (
        <Pressable
          onPress={() => setExpanded(true)}
          style={styles.showMore}
          accessibilityRole="button"
          accessibilityLabel="Show more prompt history"
        >
          <Text style={styles.showMoreText}>Show {history.length - 3} more</Text>
        </Pressable>
      )}
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
    paddingVertical: 4,
  },
  title: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  expandedList: {
    maxHeight: 300,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginRight: spacing.sm,
    width: 200,
  },
  cardExpanded: {
    width: '100%' as any,
    marginRight: 0,
    marginBottom: spacing.xs,
  },
  promptText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 18,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  modelName: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  credits: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
  },
  showMore: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  showMoreText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '500',
  },
});
