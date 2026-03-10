import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useAuth } from '@/providers/AuthProvider';
import {
  updateProfileTheme,
  updateInterestTags,
} from '@/services/profile-customization.service';
import { showAlert } from '@/utils/alert';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const ACCENT_COLORS = [
  '#0095F6', '#EF4444', '#F59E0B', '#22C55E', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

export default function CustomizeProfileRoute() {
  const router = useRouter();
  const { profile, user, refreshProfile } = useAuth();
  const theme = (profile?.profile_theme as any) || {};

  const [accentColor, setAccentColor] = useState(theme.accentColor || colors.primary);
  const [musicTitle, setMusicTitle] = useState(theme.musicTitle || '');
  const [musicArtist, setMusicArtist] = useState(theme.musicArtist || '');
  const [tags, setTags] = useState((profile?.interest_tags || []).join(', '));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);

    await updateProfileTheme(user.id, {
      accentColor,
      musicTitle: musicTitle.trim() || undefined,
      musicArtist: musicArtist.trim() || undefined,
    });

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await updateInterestTags(user.id, tagList);
    await refreshProfile();

    setSaving(false);
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Customize Profile' }} />

      {/* Accent Color */}
      <Animated.View entering={FadeInUp.duration(400)}>
        <Text style={styles.sectionTitle}>Accent Color</Text>
        <View style={styles.colorGrid}>
          {ACCENT_COLORS.map((c) => (
            <AnimatedPressable
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, accentColor === c ? styles.colorSelected : undefined]}
              onPress={() => {
                if (Platform.OS !== 'web') Haptics.selectionAsync();
                setAccentColor(c);
              }}
              scaleValue={0.85}
            />
          ))}
        </View>
      </Animated.View>

      {/* Profile Music */}
      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
      <Text style={styles.sectionTitle}>Profile Music</Text>
      <TextInput
        style={styles.input}
        placeholder="Song title"
        placeholderTextColor={colors.textSecondary}
        value={musicTitle}
        onChangeText={setMusicTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Artist name"
        placeholderTextColor={colors.textSecondary}
        value={musicArtist}
        onChangeText={setMusicArtist}
      />

      </Animated.View>

      {/* Interest Tags */}
      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
      <Text style={styles.sectionTitle}>Interest Tags</Text>
      <TextInput
        style={[styles.input, { height: 60 }]}
        placeholder="e.g. Photography, Travel, AI Art, Music"
        placeholderTextColor={colors.textSecondary}
        value={tags}
        onChangeText={setTags}
        multiline
      />
      <Text style={styles.hint}>Comma-separated</Text>
      </Animated.View>

      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={saving}
        size="lg"
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginBottom: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
  },
  hint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  saveButton: {
    marginTop: spacing.xxxl,
  },
});
