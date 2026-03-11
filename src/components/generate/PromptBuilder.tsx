import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '@/lib/theme';

type Category = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  options: string[];
};

const CATEGORIES: Category[] = [
  {
    label: 'Subject',
    icon: 'person-outline',
    options: [
      'a portrait of a woman', 'a landscape scene', 'a futuristic city',
      'an enchanted forest', 'a mythical creature', 'a cozy cabin',
      'an astronaut', 'a underwater kingdom', 'a majestic mountain',
      'a street scene', 'a cat', 'a robot',
    ],
  },
  {
    label: 'Style',
    icon: 'color-palette-outline',
    options: [
      'digital art', 'oil painting', 'watercolor', 'anime',
      'photorealistic', 'pixel art', '3D render', 'pencil sketch',
      'pop art', 'impressionist', 'art nouveau', 'cyberpunk',
      'steampunk', 'minimalist', 'surrealist', 'comic book',
    ],
  },
  {
    label: 'Mood',
    icon: 'happy-outline',
    options: [
      'dreamy', 'dramatic', 'serene', 'mysterious',
      'vibrant', 'melancholic', 'ethereal', 'epic',
      'whimsical', 'dark', 'joyful', 'nostalgic',
    ],
  },
  {
    label: 'Lighting',
    icon: 'sunny-outline',
    options: [
      'golden hour', 'neon lights', 'moonlight', 'studio lighting',
      'soft ambient', 'dramatic shadows', 'backlit', 'volumetric',
      'cinematic', 'natural daylight', 'candlelight', 'bioluminescent',
    ],
  },
  {
    label: 'Details',
    icon: 'sparkles-outline',
    options: [
      'highly detailed', '8K resolution', 'intricate patterns',
      'bokeh background', 'depth of field', 'ray tracing',
      'octane render', 'unreal engine', 'trending on artstation',
      'masterpiece', 'award winning', 'photographic',
    ],
  },
];

type PromptBuilderProps = {
  onInsert: (text: string) => void;
  visible: boolean;
  onClose: () => void;
};

export function PromptBuilder({ onInsert, visible, onClose }: PromptBuilderProps) {
  const [activeCategory, setActiveCategory] = useState(0);
  const [selected, setSelected] = useState<Map<string, Set<string>>>(new Map());

  const toggleOption = useCallback((category: string, option: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(category) ?? []);
      if (set.has(option)) {
        set.delete(option);
      } else {
        set.add(option);
      }
      next.set(category, set);
      return next;
    });
  }, []);

  const builtPrompt = useMemo(() => {
    const parts: string[] = [];
    for (const cat of CATEGORIES) {
      const opts = selected.get(cat.label);
      if (opts && opts.size > 0) {
        parts.push(Array.from(opts).join(', '));
      }
    }
    return parts.join(', ');
  }, [selected]);

  const totalSelected = useMemo(() => {
    let count = 0;
    selected.forEach((s) => { count += s.size; });
    return count;
  }, [selected]);

  const handleInsert = useCallback(() => {
    if (builtPrompt) {
      onInsert(builtPrompt);
      setSelected(new Map());
      onClose();
    }
  }, [builtPrompt, onInsert, onClose]);

  if (!visible) return null;

  const category = CATEGORIES[activeCategory];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prompt Builder</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
      >
        {CATEGORIES.map((cat, i) => (
          <Pressable
            key={cat.label}
            onPress={() => setActiveCategory(i)}
            style={[styles.tab, i === activeCategory && styles.activeTab]}
          >
            <Ionicons
              name={cat.icon}
              size={16}
              color={i === activeCategory ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.tabText, i === activeCategory && styles.activeTabText]}>
              {cat.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Options grid */}
      <View style={styles.optionsGrid}>
        {category.options.map((option) => {
          const isSelected = selected.get(category.label)?.has(option) ?? false;
          return (
            <Pressable
              key={option}
              onPress={() => toggleOption(category.label, option)}
              style={[styles.chip, isSelected && styles.chipSelected]}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Preview + Insert */}
      {totalSelected > 0 && (
        <View style={styles.footer}>
          <Text style={styles.preview} numberOfLines={2}>
            {builtPrompt}
          </Text>
          <Pressable onPress={handleInsert} style={styles.insertButton}>
            <Text style={styles.insertText}>Insert ({totalSelected})</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  tabs: {
    marginBottom: spacing.sm,
  },
  tabsContent: {
    gap: spacing.xs,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.08)',
  },
  tabText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  preview: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  insertButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
  },
  insertText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
