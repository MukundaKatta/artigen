import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTasteProfile } from '@/hooks/useTasteProfile';
import { TasteProfileEditor } from '@/components/profile/TasteProfileEditor';
import { AlgorithmPreview } from '@/components/profile/AlgorithmPreview';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function TasteProfileScreen() {
  const { user } = useAuth();
  const { profile, loading, update } = useTasteProfile(user?.id);

  const toggle = useCallback((arr: string[], val: string) => {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <AlgorithmPreview profile={profile} />
      <TasteProfileEditor
        selectedStyles={profile?.preferred_styles || []}
        selectedThemes={profile?.preferred_themes || []}
        selectedPalettes={profile?.preferred_palettes || []}
        onToggleStyle={(s) => update({ preferredStyles: toggle(profile?.preferred_styles || [], s) })}
        onToggleTheme={(t) => update({ preferredThemes: toggle(profile?.preferred_themes || [], t) })}
        onTogglePalette={(p) => update({ preferredPalettes: toggle(profile?.preferred_palettes || [], p) })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
