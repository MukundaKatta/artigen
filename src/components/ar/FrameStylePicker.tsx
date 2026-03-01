import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FRAME_STYLES } from '@/services/ar-preview.service';
import type { FrameStyle } from '@/services/ar-preview.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  selected: FrameStyle;
  onSelect: (style: FrameStyle) => void;
};

const FRAME_PREVIEWS: Record<FrameStyle, { bg: string; border: string; borderW: number }> = {
  none: { bg: '#DDD', border: 'transparent', borderW: 0 },
  thin_black: { bg: '#DDD', border: '#1A1A1A', borderW: 2 },
  thin_white: { bg: '#DDD', border: '#FFFFFF', borderW: 2 },
  gallery: { bg: '#DDD', border: '#2C2C2C', borderW: 4 },
  modern: { bg: '#DDD', border: '#E0E0E0', borderW: 5 },
  ornate: { bg: '#DDD', border: '#8B7355', borderW: 6 },
};

export function FrameStylePicker({ selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {FRAME_STYLES.map(({ value, label }) => {
        const preview = FRAME_PREVIEWS[value];
        const isSelected = selected === value;

        return (
          <TouchableOpacity
            key={value}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.preview,
                {
                  borderWidth: preview.borderW,
                  borderColor: preview.border,
                },
              ]}
            >
              <View style={[styles.previewInner, { backgroundColor: preview.bg }]} />
            </View>
            <Text
              style={[styles.label, isSelected && styles.labelSelected]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  option: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 149, 246, 0.05)',
  },
  preview: {
    width: 50,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewInner: {
    width: '80%',
    height: '80%',
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.primary,
    fontFamily: typography.semiBold,
  },
});
