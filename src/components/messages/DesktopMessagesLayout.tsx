import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
};

export function DesktopMessagesLayout({ children }: Props) {
  return (
    <View style={styles.container}>
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
    maxWidth: 935,
    alignSelf: 'center',
    width: '100%' as any,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
  },
});
