import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { SafetySettings } from '@/components/profile/SafetySettings';
import { useSafetyPreferences } from '@/hooks/useSafetyPreferences';
import { colors } from '@/lib/theme';

export default function SafetySettingsRoute() {
  const { user } = useAuth();
  const { prefs, loading, update } = useSafetyPreferences(user?.id);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Content & Safety' }} />
      <SafetySettings
        showSensitive={prefs?.show_sensitive ?? false}
        showMature={prefs?.show_mature ?? false}
        blurNsfw={prefs?.blur_nsfw ?? true}
        onToggleSensitive={(v) => update({ showSensitive: v })}
        onToggleMature={(v) => update({ showMature: v })}
        onToggleBlur={(v) => update({ blurNsfw: v })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
