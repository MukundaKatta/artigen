import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SafetySettings } from '@/components/profile/SafetySettings';
import { useSafetyPreferences } from '@/hooks/useSafetyPreferences';
import { colors } from '@/lib/theme';

export default function SafetySettingsRoute() {
  const { user } = useAuth();
  const { prefs, loading, update } = useSafetyPreferences(user?.id);

  if (loading) return <LoadingSpinner fullScreen />;

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
