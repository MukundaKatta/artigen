import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { updateProfile } from '@/services/profile.service';
import { colors, fontSize, spacing, typography } from '@/lib/theme';

type SettingRowProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  value?: string;
  destructive?: boolean;
  rightElement?: React.ReactNode;
};

function SettingRow({ icon, label, onPress, value, destructive, rightElement }: SettingRowProps) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !rightElement}>
      <Ionicons name={icon as any} size={22} color={destructive ? colors.error : colors.text} />
      <Text style={[styles.rowText, destructive && { color: colors.error }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export default function SettingsRoute() {
  const { signOut, profile, user } = useAuth();
  const { themePreference, setTheme } = useTheme();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);

  const themeLabels = { system: 'System', light: 'Light', dark: 'Dark' };

  async function togglePrivate(value: boolean) {
    setIsPrivate(value);
    if (user?.id) {
      await updateProfile(user.id, { is_private: value });
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <SectionHeader title="Account" />
      <SettingRow
        icon="person-outline"
        label="Edit Profile"
        onPress={() => router.push('/(screens)/edit-profile')}
      />
      <SettingRow
        icon="lock-closed-outline"
        label="Private Account"
        rightElement={
          <Switch
            value={isPrivate}
            onValueChange={togglePrivate}
            trackColor={{ true: colors.primary }}
          />
        }
      />

      <SectionHeader title="Appearance" />
      <SettingRow
        icon="color-palette-outline"
        label="Theme"
        value={themeLabels[themePreference]}
        onPress={() => setShowTheme(true)}
      />

      <SectionHeader title="Privacy & Safety" />
      <SettingRow
        icon="ban-outline"
        label="Blocked Users"
        onPress={() => router.push('/(screens)/blocked-users')}
      />

      <SectionHeader title="About" />
      <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />

      <SectionHeader title="" />
      <SettingRow
        icon="log-out-outline"
        label="Log Out"
        destructive
        onPress={() => setShowLogout(true)}
      />

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

      <ActionSheet
        visible={showTheme}
        onClose={() => setShowTheme(false)}
        title="Choose Theme"
        items={[
          { label: 'System Default', onPress: () => setTheme('system') },
          { label: 'Light', onPress: () => setTheme('light') },
          { label: 'Dark', onPress: () => setTheme('dark') },
        ]}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sectionHeader: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginLeft: spacing.md,
    flex: 1,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rowValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
