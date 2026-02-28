import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { colors, fontSize, spacing, typography } from '@/lib/theme';

export default function SettingsRoute() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} onPress={() => setShowLogout(true)}>
        <Ionicons name="log-out-outline" size={24} color={colors.error} />
        <Text style={[styles.rowText, { color: colors.error }]}>Log Out</Text>
      </TouchableOpacity>

      <ActionSheet
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        title="Are you sure you want to log out?"
        items={[
          {
            label: 'Log Out',
            destructive: true,
            onPress: async () => {
              await signOut();
              router.replace('/');
            },
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    marginLeft: spacing.md,
    color: colors.text,
  },
});
