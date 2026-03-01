import React from 'react';
import { View, StyleSheet } from 'react-native';
import { DesktopSidebar } from './DesktopSidebar';
import { useResponsive } from '@/hooks/useResponsive';
import { colors } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
};

export function DesktopLayout({ children }: Props) {
  const { isTablet } = useResponsive();

  return (
    <View style={styles.container}>
      <DesktopSidebar collapsed={isTablet} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
});
