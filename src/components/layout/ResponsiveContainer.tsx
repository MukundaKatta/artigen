import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { DESKTOP_CONTENT_WIDTH } from '@/lib/constants';
import { colors } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
};

export function ResponsiveContainer({ children, rightSidebar }: Props) {
  const { isMobile } = useResponsive();

  if (Platform.OS !== 'web' || isMobile) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.content}>
        {children}
      </View>
      {rightSidebar && (
        <View style={styles.sidebar}>
          {rightSidebar}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    width: DESKTOP_CONTENT_WIDTH,
    maxWidth: DESKTOP_CONTENT_WIDTH,
  },
  sidebar: {
    width: 320,
    paddingLeft: 40,
    paddingTop: 20,
  },
});
