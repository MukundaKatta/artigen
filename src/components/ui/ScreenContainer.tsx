import React from 'react';
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle, ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '@/lib/theme';

type Props = {
  /** Wrap children in a ScrollView. */
  scrollable?: boolean;
  /** Apply horizontal screen padding (default true). */
  padded?: boolean;
  /** Background color override. */
  backgroundColor?: string;
  /** Forward to ScrollView when scrollable. */
  scrollProps?: ScrollViewProps;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Standard screen container: respects safe areas top + bottom, applies
 * the app background, optional horizontal padding, optional ScrollView.
 *
 *   <ScreenContainer scrollable>
 *     <PageHeader title="Profile" />
 *     ...
 *   </ScreenContainer>
 */
export function ScreenContainer({
  scrollable = false,
  padded = true,
  backgroundColor,
  scrollProps,
  style,
  contentStyle,
  children,
}: Props) {
  const insets = useSafeAreaInsets();
  const containerStyle: StyleProp<ViewStyle> = [
    styles.root,
    { backgroundColor: backgroundColor ?? colors.background },
    { paddingTop: insets.top },
    style,
  ];
  const inner: StyleProp<ViewStyle> = [
    padded && styles.padded,
    { paddingBottom: insets.bottom + spacing.lg },
    contentStyle,
  ];

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          contentContainerStyle={inner}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[containerStyle, inner]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.lg,
  },
});
