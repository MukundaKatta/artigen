import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useArPreview } from '@/hooks/useArPreview';
import { ARPreviewView } from '@/components/ar/ARPreviewView';
import { FrameStylePicker } from '@/components/ar/FrameStylePicker';
import { SizeControls } from '@/components/ar/SizeControls';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import type { FrameStyle } from '@/services/ar-preview.service';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ARPreviewRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  const { preview, loading, create, update } = useArPreview(postId);

  const [frameStyle, setFrameStyle] = useState<FrameStyle>('none');
  const [widthCm, setWidthCm] = useState(60);
  const [heightCm, setHeightCm] = useState(40);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load post image
  useEffect(() => {
    if (!postId) return;
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('media:post_media(*)')
        .eq('id', postId)
        .single();
      const media = data?.media?.[0] as any;
      setImageUrl(media?.media_url || media?.url || null);
      setLoadingPost(false);
    })();
  }, [postId]);

  // Sync with existing preview
  useEffect(() => {
    if (preview) {
      setFrameStyle(preview.frame_style);
      setWidthCm(preview.default_width_cm);
      setHeightCm(preview.default_height_cm);
    }
  }, [preview]);

  async function handleSave() {
    if (!postId) return;
    setSaving(true);
    if (preview) {
      await update({
        frame_style: frameStyle,
        default_width_cm: widthCm,
        default_height_cm: heightCm,
      });
    } else {
      await create(frameStyle, widthCm, heightCm);
    }
    setSaving(false);
  }

  if (loading || loadingPost) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'AR Preview' }} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!imageUrl) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'AR Preview' }} />
        <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyText}>No image available for AR preview</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'AR Preview' }} />

      {/* AR Preview Area */}
      <ARPreviewView
        imageUrl={imageUrl}
        frameStyle={frameStyle}
        widthCm={widthCm}
        heightCm={heightCm}
      />

      {/* Frame Style Picker */}
      <Text style={styles.sectionTitle}>Frame Style</Text>
      <FrameStylePicker selected={frameStyle} onSelect={setFrameStyle} />

      {/* Size Controls */}
      <Text style={styles.sectionTitle}>Dimensions</Text>
      <SizeControls
        width={widthCm}
        height={heightCm}
        onChangeWidth={setWidthCm}
        onChangeHeight={setHeightCm}
      />

      {/* Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={styles.infoText}>
          This is a simulated AR preview. In a full implementation, this would use the device camera with ARKit/ARCore to show the artwork on your wall in real-time.
        </Text>
      </View>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <Button
          title={preview ? 'Update AR Settings' : 'Save AR Settings'}
          onPress={handleSave}
          loading={saving}
          size="lg"
        />
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    margin: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  saveContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  footer: {
    height: 40,
  },
});
