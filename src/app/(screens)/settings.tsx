import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { ActionSheet } from '@/components/ui/ActionSheet';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { updateProfile } from '@/services/profile.service';
import { toggleActivityStatus } from '@/services/activity.service';
import { colors, fontSize, spacing, typography, borderRadius, shadows } from '@/lib/theme';

type SettingRowProps = {
  icon: string;
  iconColor?: string;
  label: string;
  onPress?: () => void;
  value?: string;
  destructive?: boolean;
  rightElement?: React.ReactNode;
};

function SettingRow({ icon, iconColor, label, onPress, value, destructive, rightElement }: SettingRowProps) {
  return (
    <AnimatedPressable
      style={styles.row}
      onPress={() => {
        if (onPress) {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          onPress();
        }
      }}
      disabled={!onPress && !rightElement}
      scaleValue={0.98}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={[styles.iconBg, destructive && styles.iconBgDestructive]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={destructive ? colors.error : (iconColor || colors.primary)}
        />
      </View>
      <Text style={[styles.rowText, destructive && { color: colors.error }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={styles.rowValue}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && (
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        )}
      </View>
    </AnimatedPressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  if (!title) return <View style={{ height: spacing.lg }} />;
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.sectionCard}>{children}</View>;
}

export default function SettingsRoute() {
  const { signOut, profile, user } = useAuth();
  const { themePreference, setTheme } = useTheme();
  const router = useRouter();
  const [showLogout, setShowLogout] = useState(false);
  const [showTheme, setShowTheme] = useState(false);
  const [isPrivate, setIsPrivate] = useState(profile?.is_private || false);
  const [showActivity, setShowActivity] = useState(profile?.show_activity_status !== false);

  const themeLabels = { system: 'System', light: 'Light', dark: 'Dark' };

  async function togglePrivate(value: boolean) {
    setIsPrivate(value);
    if (user?.id) {
      await updateProfile(user.id, { is_private: value });
    }
  }

  async function handleToggleActivity(value: boolean) {
    setShowActivity(value);
    if (user?.id) {
      await toggleActivityStatus(user.id, value);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Stack.Screen options={{ title: 'Settings' }} />

      <SectionHeader title="Account" />
      <SectionCard>
        <SettingRow
          icon="person-outline"
          label="Edit Profile"
          onPress={() => router.push('/(screens)/edit-profile')}
        />
        <SettingRow
          icon="lock-closed-outline"
          iconColor="#F59E0B"
          label="Private Account"
          rightElement={
            <Switch
              value={isPrivate}
              onValueChange={togglePrivate}
              trackColor={{ true: colors.primary }}
            />
          }
        />
      </SectionCard>

      <SectionHeader title="Appearance" />
      <SectionCard>
        <SettingRow
          icon="color-palette-outline"
          iconColor="#8B5CF6"
          label="Theme"
          value={themeLabels[themePreference]}
          onPress={() => setShowTheme(true)}
        />
      </SectionCard>

      <SectionHeader title="Social" />
      <SectionCard>
        <SettingRow
          icon="star-outline"
          iconColor="#F59E0B"
          label="Close Friends"
          onPress={() => router.push('/(screens)/close-friends')}
        />
        <SettingRow
          icon="calendar-outline"
          iconColor="#10B981"
          label="Scheduled Posts"
          onPress={() => router.push('/(screens)/scheduled-posts')}
        />
        <SettingRow
          icon="color-palette-outline"
          iconColor="#EC4899"
          label="Customize Profile"
          onPress={() => router.push('/(screens)/customize-profile')}
        />
      </SectionCard>

      <SectionHeader title="Creator" />
      <SectionCard>
        <SettingRow
          icon="wallet-outline"
          iconColor="#10B981"
          label="Wallet"
          onPress={() => router.push('/(screens)/wallet')}
        />
        <SettingRow
          icon="sparkles-outline"
          iconColor="#8B5CF6"
          label="AI Credits"
          onPress={() => router.push('/(screens)/buy-credits')}
        />
        <SettingRow
          icon="pricetag-outline"
          iconColor="#F59E0B"
          label="Manage Subscription Tiers"
          onPress={() => router.push('/(screens)/manage-tiers')}
        />
        <SettingRow
          icon="storefront-outline"
          label="Marketplace Orders"
          onPress={() => router.push('/(screens)/marketplace/orders')}
        />
        <SettingRow
          icon="flask-outline"
          iconColor="#8B5CF6"
          label="Future Labs"
          onPress={() => router.push('/(screens)/future-labs')}
        />
      </SectionCard>

      <SectionHeader title="Discovery" />
      <SectionCard>
        <SettingRow
          icon="pulse-outline"
          iconColor="#EC4899"
          label="Your Algorithm"
          onPress={() => router.push('/(screens)/taste-profile')}
        />
        <SettingRow
          icon="trending-up-outline"
          iconColor="#F59E0B"
          label="Trending"
          onPress={() => router.push('/(screens)/trending')}
        />
      </SectionCard>

      <SectionHeader title="Privacy & Safety" />
      <SectionCard>
        <SettingRow
          icon="radio-button-on-outline"
          iconColor="#10B981"
          label="Activity Status"
          rightElement={
            <Switch
              value={showActivity}
              onValueChange={handleToggleActivity}
              trackColor={{ true: colors.primary }}
            />
          }
        />
        <SettingRow
          icon="ban-outline"
          iconColor="#EF4444"
          label="Blocked Users"
          onPress={() => router.push('/(screens)/blocked-users')}
        />
        <SettingRow
          icon="shield-checkmark-outline"
          iconColor="#10B981"
          label="Content & Safety"
          onPress={() => router.push('/(screens)/safety-settings')}
        />
      </SectionCard>

      <SectionHeader title="About" />
      <SectionCard>
        <SettingRow icon="information-circle-outline" label="Version" value="1.0.0" />
      </SectionCard>

      <View style={{ height: spacing.lg }} />
      <SectionCard>
        <SettingRow
          icon="log-out-outline"
          label="Log Out"
          destructive
          onPress={() => setShowLogout(true)}
        />
      </SectionCard>

      <View style={{ height: spacing.xxxl * 2 }} />

      <ConfirmDialog
        visible={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={async () => {
          await signOut();
          router.replace('/');
        }}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        destructive
        icon="log-out-outline"
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
    backgroundColor: colors.backgroundSecondary,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  sectionCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
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
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(0,149,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBgDestructive: {
    backgroundColor: 'rgba(237,73,86,0.1)',
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
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
