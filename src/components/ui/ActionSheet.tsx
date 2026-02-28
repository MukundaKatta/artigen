import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export type ActionSheetItem = {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
  title?: string;
};

export function ActionSheet({ visible, onClose, items, title }: Props) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => {
    const itemHeight = 56;
    const cancelHeight = 56;
    const titleHeight = title ? 44 : 0;
    const padding = 40;
    const height = items.length * itemHeight + cancelHeight + titleHeight + padding;
    return [height];
  }, [items.length, title]);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
      />
    ),
    []
  );

  const handleItemPress = (item: ActionSheetItem) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onClose();
    setTimeout(() => item.onPress(), 200);
  };

  if (!visible) return null;

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onClose={onClose}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <View style={styles.content}>
        {title && <Text style={styles.title}>{title}</Text>}

        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.item, index < items.length - 1 && styles.itemBorder]}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.6}
          >
            <Text style={[styles.itemText, item.destructive && styles.destructiveText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.cancelSeparator} />
        <TouchableOpacity style={styles.item} onPress={onClose} activeOpacity={0.6}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  indicator: {
    backgroundColor: colors.border,
    width: 36,
    height: 4,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  item: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemText: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.text,
  },
  destructiveText: {
    color: colors.error,
    fontFamily: typography.semiBold,
  },
  cancelSeparator: {
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: -spacing.lg,
    marginTop: spacing.xs,
  },
  cancelText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
});
