import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
  ViewStyle,
  DimensionValue,
  AccessibilityInfo,
  findNodeHandle,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { useResponsive } from '@/hooks/useResponsive';

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

function DesktopActionSheet({ visible, onClose, items, title }: Props) {
  const titleRef = useRef<Text>(null);
  const accessibilityTitle = title || 'Action menu';

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      const titleNode = findNodeHandle(titleRef.current);
      if (titleNode) {
        AccessibilityInfo.setAccessibilityFocus(titleNode);
      }
      AccessibilityInfo.announceForAccessibility(accessibilityTitle);
    }, 100);

    return () => clearTimeout(timeout);
  }, [accessibilityTitle, visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
      <Pressable style={desktopStyles.overlay} onPress={onClose} accessibilityLabel="Close dialog">
        <Pressable
          style={desktopStyles.dialog}
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
          accessibilityRole="menu"
          accessibilityLabel={accessibilityTitle}
        >
          {title && (
            <Text ref={titleRef} style={desktopStyles.title} accessibilityRole="header" accessible>
              {title}
            </Text>
          )}
          {items.map((item, index) => (
            <AnimatedPressable
              key={index}
              style={[desktopStyles.item, index < items.length - 1 && desktopStyles.itemBorder]}
              onPress={() => {
                onClose();
                setTimeout(() => item.onPress(), 100);
              }}
              scaleValue={0.97}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
            >
              <Text
                style={[desktopStyles.itemText, item.destructive && desktopStyles.destructiveText]}
              >
                {item.label}
              </Text>
            </AnimatedPressable>
          ))}
          <View style={desktopStyles.separator} />
          <AnimatedPressable
            style={desktopStyles.item}
            onPress={onClose}
            scaleValue={0.97}
            accessibilityRole="menuitem"
            accessibilityLabel="Cancel"
          >
            <Text style={desktopStyles.cancelText}>Cancel</Text>
          </AnimatedPressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const desktopStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    width: 400,
    maxWidth: '90%' as DimensionValue,
    paddingVertical: spacing.sm,
    ...(Platform.select({
      web: { boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
      default: {},
    }) as ViewStyle),
  },
  title: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
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
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  destructiveText: {
    color: colors.error,
    fontFamily: typography.semiBold,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
});

export function ActionSheet({ visible, onClose, items, title }: Props) {
  const { isMobile } = useResponsive();
  const useDesktop = Platform.OS === 'web' && !isMobile;

  // All hooks must be called unconditionally (rules-of-hooks)
  const bottomSheetRef = useRef<BottomSheet>(null);
  const titleRef = useRef<Text>(null);
  const accessibilityTitle = title || 'Action menu';
  const snapPoints = useMemo(() => {
    const itemHeight = 56;
    const cancelHeight = 56;
    const titleHeight = title ? 44 : 0;
    const padding = 40;
    const height = items.length * itemHeight + cancelHeight + titleHeight + padding;
    return [height];
  }, [items.length, title]);

  useEffect(() => {
    if (useDesktop) return;
    if (visible) {
      bottomSheetRef.current?.expand();

      const timeout = setTimeout(() => {
        const titleNode = findNodeHandle(titleRef.current);
        if (titleNode) {
          AccessibilityInfo.setAccessibilityFocus(titleNode);
        }
        AccessibilityInfo.announceForAccessibility(accessibilityTitle);
      }, 300);

      return () => clearTimeout(timeout);
    }

    bottomSheetRef.current?.close();
  }, [accessibilityTitle, visible, useDesktop]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    [],
  );

  const handleItemPress = (item: ActionSheetItem) => {
    if (Platform.OS !== 'web') {
      if (item.destructive) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    onClose();
    setTimeout(() => item.onPress(), 200);
  };

  // Use centered dialog on desktop web
  if (useDesktop) {
    return <DesktopActionSheet visible={visible} onClose={onClose} items={items} title={title} />;
  }

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
      <View
        style={styles.content}
        accessibilityViewIsModal
        accessibilityRole="menu"
        accessibilityLabel={accessibilityTitle}
      >
        {title && (
          <Text ref={titleRef} style={styles.title} accessibilityRole="header" accessible>
            {title}
          </Text>
        )}

        {items.map((item, index) => (
          <AnimatedPressable
            key={index}
            style={[styles.item, index < items.length - 1 && styles.itemBorder]}
            onPress={() => handleItemPress(item)}
            scaleValue={0.97}
            accessibilityLabel={item.label}
            accessibilityRole="menuitem"
          >
            <Text style={[styles.itemText, item.destructive && styles.destructiveText]}>
              {item.label}
            </Text>
          </AnimatedPressable>
        ))}

        <View style={styles.cancelSeparator} />
        <AnimatedPressable
          style={styles.item}
          onPress={onClose}
          scaleValue={0.97}
          accessibilityLabel="Cancel"
          accessibilityRole="menuitem"
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </AnimatedPressable>
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
