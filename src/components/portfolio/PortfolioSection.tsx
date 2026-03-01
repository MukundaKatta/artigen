import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PortfolioItemCard } from './PortfolioItemCard';
import type { PortfolioSection as SectionType, PortfolioItem } from '@/services/portfolio.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  section: SectionType;
  items: PortfolioItem[];
  onRemoveItem?: (itemId: string) => void;
  onItemPress?: (item: PortfolioItem) => void;
  editable?: boolean;
};

export function PortfolioSection({ section, items, onRemoveItem, onItemPress, editable = false }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{section.title}</Text>
        {section.description ? (
          <Text style={styles.description}>{section.description}</Text>
        ) : null}
      </View>
      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in this section yet</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {items.map((item) => (
            <PortfolioItemCard
              key={item.id}
              item={item}
              onPress={() => onItemPress?.(item)}
              onRemove={editable ? () => onRemoveItem?.(item.id) : undefined}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  emptyContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
