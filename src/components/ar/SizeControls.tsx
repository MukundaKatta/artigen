import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  width: number;
  height: number;
  onChangeWidth: (value: number) => void;
  onChangeHeight: (value: number) => void;
};

const MIN_SIZE = 20;
const MAX_SIZE = 200;

export function SizeControls({ width, height, onChangeWidth, onChangeHeight }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.sliderRow}>
        <Text style={styles.label}>Width</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_SIZE}
          maximumValue={MAX_SIZE}
          step={5}
          value={width}
          onValueChange={onChangeWidth}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.value}>{width} cm</Text>
      </View>
      <View style={styles.sliderRow}>
        <Text style={styles.label}>Height</Text>
        <Slider
          style={styles.slider}
          minimumValue={MIN_SIZE}
          maximumValue={MAX_SIZE}
          step={5}
          value={height}
          onValueChange={onChangeHeight}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <Text style={styles.value}>{height} cm</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    width: 50,
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  value: {
    width: 60,
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    textAlign: 'right',
  },
});
