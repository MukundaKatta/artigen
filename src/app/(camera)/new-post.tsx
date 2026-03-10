import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { createPost } from '@/services/post.service';
import { submitEntry } from '@/services/challenge.service';
import { downloadToLocal } from '@/services/upload.service';
import { showAlert } from '@/utils/alert';
import { captionSchema } from '@/utils/validation';
import type { CaptionFormData } from '@/utils/validation';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CaptionGenerator } from '@/components/feed/CaptionGenerator';
import { LocationPicker } from '@/components/feed/LocationPicker';
import { schedulePost } from '@/services/schedule.service';
import { getOrCreateLocation } from '@/services/location.service';
import type { AiMetadataInsert, Location } from '@/types';

export default function NewPostRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    imageUri,
    imageWidth,
    imageHeight,
    mediaType,
    aiMetadata: aiMetadataJson,
    remixOfPostId,
    challengeId,
  } = useLocalSearchParams<{
    imageUri: string;
    imageWidth: string;
    imageHeight: string;
    mediaType?: string;
    aiMetadata?: string;
    remixOfPostId?: string;
    challengeId?: string;
  }>();

  const prefilledAi = aiMetadataJson ? JSON.parse(aiMetadataJson) : null;
  const [sharing, setSharing] = useState(false);
  const [isAiContent, setIsAiContent] = useState(!!prefilledAi);

  // Manual AI metadata fields (for uploads)
  const [manualPrompt, setManualPrompt] = useState('');
  const [manualModelName, setManualModelName] = useState('');
  const [styleTags, setStyleTags] = useState('');

  // New features
  const [showCaptionGen, setShowCaptionGen] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [audience, setAudience] = useState<'everyone' | 'close_friends'>('everyone');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CaptionFormData>({
    resolver: zodResolver(captionSchema),
    defaultValues: { caption: '', location: '' },
  });

  async function onSubmit(data: CaptionFormData) {
    if (!user?.id || !imageUri) return;
    setSharing(true);

    // Download remote AI image to local cache if needed
    let finalUri = imageUri;
    if (prefilledAi && imageUri.startsWith('http')) {
      const localUri = await downloadToLocal(imageUri);
      if (!localUri) {
        setSharing(false);
        showAlert('Error', 'Failed to download generated image');
        return;
      }
      finalUri = localUri;
    }

    // Build AI metadata
    let aiMetadata: Omit<AiMetadataInsert, 'post_id'> | undefined;
    if (isAiContent) {
      const parsedTags = styleTags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      if (prefilledAi) {
        aiMetadata = {
          source: prefilledAi.source as 'generated' | 'uploaded',
          provider: prefilledAi.provider as string,
          model_id: prefilledAi.model_id as string,
          model_name: prefilledAi.model_name as string,
          prompt: prefilledAi.prompt as string,
          negative_prompt: (prefilledAi.negative_prompt as string) || '',
          style_tags: parsedTags.length > 0 ? parsedTags : (prefilledAi.style_tags as string[]) || [],
          settings: (prefilledAi.settings as Record<string, unknown>) || {},
          generation_time_ms: prefilledAi.generation_time_ms as number | undefined,
          replicate_prediction_id: prefilledAi.replicate_prediction_id as string | undefined,
        };
      } else {
        if (!manualPrompt.trim()) {
          setSharing(false);
          showAlert('Error', 'Please enter the prompt used to generate this image');
          return;
        }
        aiMetadata = {
          source: 'uploaded',
          provider: 'manual',
          model_id: 'unknown',
          model_name: manualModelName.trim() || 'Unknown',
          prompt: manualPrompt.trim(),
          negative_prompt: '',
          style_tags: parsedTags,
          settings: {},
        };
      }
    }

    // Handle location
    let locationId: string | undefined;
    const locationText = selectedLocation?.name || data.location;
    if (selectedLocation?.name) {
      const { data: loc } = await getOrCreateLocation(
        selectedLocation.name,
        selectedLocation.address || undefined,
        selectedLocation.lat || undefined,
        selectedLocation.lng || undefined
      );
      if (loc) locationId = loc.id;
    }

    const resolvedMediaType = (mediaType === 'video' ? 'video' : 'image') as 'image' | 'video';
    const fileExt = resolvedMediaType === 'video' ? 'mp4' : 'jpg';
    const fileName = `post_${Date.now()}.${fileExt}`;
    const { data: postData, error } = await createPost({
      userId: user.id,
      caption: data.caption || '',
      location: locationText,
      remixOfPostId: remixOfPostId || undefined,
      audience,
      mediaFiles: [
        {
          uri: finalUri,
          fileName,
          mediaType: resolvedMediaType,
          width: Number(imageWidth) || undefined,
          height: Number(imageHeight) || undefined,
        },
      ],
      aiMetadata,
    });

    // Schedule if needed
    if (!error && postData && scheduledDate) {
      await schedulePost((postData as any).id, scheduledDate);
    }

    // Link post to challenge if applicable
    if (!error && postData && challengeId && (postData as any).id) {
      await submitEntry(challengeId, (postData as any).id, user.id).catch((err) => console.warn('Challenge entry submission failed:', err));
    }

    setSharing(false);

    if (error) {
      showAlert('Error', (error as any).message || 'Failed to create post');
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Image
            source={{ uri: imageUri }}
            style={styles.preview}
            contentFit="cover"
          />
          <Controller
            control={control}
            name="caption"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Write a caption..."
                multiline
                numberOfLines={4}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                error={errors.caption?.message}
                containerStyle={styles.captionContainer}
                style={styles.captionInput}
              />
            )}
          />
        </View>

        {/* Location */}
        <TouchableOpacity
          style={styles.locationRow}
          onPress={() => setShowLocationPicker(true)}
        >
          <Ionicons name="location-outline" size={18} color={colors.text} />
          <Text style={[styles.locationText, !selectedLocation && { color: colors.textSecondary }]}>
            {selectedLocation?.name || 'Add location'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Audience */}
        <View style={styles.optionRow}>
          <Ionicons name="people-outline" size={18} color={colors.text} />
          <Text style={styles.optionLabel}>Audience</Text>
          <View style={styles.audienceChips}>
            <TouchableOpacity
              style={[styles.chip, audience === 'everyone' && styles.chipActive]}
              onPress={() => setAudience('everyone')}
            >
              <Text style={[styles.chipText, audience === 'everyone' && styles.chipTextActive]}>Everyone</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.chip, audience === 'close_friends' && styles.chipCloseFriends]}
              onPress={() => setAudience('close_friends')}
            >
              <Text style={[styles.chipText, audience === 'close_friends' && styles.chipTextActive]}>Close Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowDatePicker(!showDatePicker)}
        >
          <Ionicons name="calendar-outline" size={18} color={colors.text} />
          <Text style={styles.optionLabel}>
            {scheduledDate
              ? `Scheduled: ${scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`
              : 'Schedule post'}
          </Text>
          {scheduledDate && (
            <TouchableOpacity onPress={() => setScheduledDate(null)}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={scheduledDate || new Date(Date.now() + 3600000)}
            mode="datetime"
            minimumDate={new Date()}
            onChange={(_: any, date?: Date) => {
              setShowDatePicker(false);
              if (date) setScheduledDate(date);
            }}
          />
        )}

        {/* AI Caption Generator */}
        <TouchableOpacity
          style={styles.optionRow}
          onPress={() => setShowCaptionGen(true)}
        >
          <Ionicons name="sparkles-outline" size={18} color="#8B5CF6" />
          <Text style={[styles.optionLabel, { color: '#8B5CF6' }]}>Generate caption with AI</Text>
        </TouchableOpacity>

        <Controller
          control={control}
          name="location"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Add location text"
              onBlur={onBlur}
              onChangeText={onChange}
              value={selectedLocation?.name || value}
              error={errors.location?.message}
              containerStyle={{ display: 'none' }}
            />
          )}
        />

        {/* AI Content Section */}
        <View style={styles.aiSection}>
          <View style={styles.aiToggleRow}>
            <View style={styles.aiToggleLabel}>
              <Ionicons name="sparkles" size={18} color="#8B5CF6" />
              <Text style={styles.aiToggleText}>AI-Generated Content</Text>
            </View>
            <Switch
              value={isAiContent}
              onValueChange={setIsAiContent}
              trackColor={{ true: '#8B5CF6', false: colors.border }}
              disabled={!!prefilledAi}
            />
          </View>

          {isAiContent && prefilledAi && (
            <View style={styles.aiPrefilledInfo}>
              <View style={styles.aiInfoRow}>
                <Text style={styles.aiInfoLabel}>Model</Text>
                <Text style={styles.aiInfoValue}>{prefilledAi.model_name}</Text>
              </View>
              <View style={styles.aiInfoRow}>
                <Text style={styles.aiInfoLabel}>Prompt</Text>
                <Text style={styles.aiInfoValue} numberOfLines={3}>
                  {prefilledAi.prompt}
                </Text>
              </View>
              {prefilledAi.generation_time_ms && (
                <View style={styles.aiInfoRow}>
                  <Text style={styles.aiInfoLabel}>Gen. Time</Text>
                  <Text style={styles.aiInfoValue}>
                    {(prefilledAi.generation_time_ms / 1000).toFixed(1)}s
                  </Text>
                </View>
              )}
            </View>
          )}

          {isAiContent && !prefilledAi && (
            <View style={styles.aiManualFields}>
              <Text style={styles.fieldLabel}>Prompt *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="What prompt was used?"
                placeholderTextColor={colors.textSecondary}
                value={manualPrompt}
                onChangeText={setManualPrompt}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.fieldLabel}>Model Name</Text>
              <TextInput
                style={[styles.textInput, { height: 44 }]}
                placeholder="e.g. Midjourney, DALL-E 3, Flux"
                placeholderTextColor={colors.textSecondary}
                value={manualModelName}
                onChangeText={setManualModelName}
              />
            </View>
          )}

          {isAiContent && (
            <>
              <Text style={styles.fieldLabel}>Style Tags</Text>
              <TextInput
                style={[styles.textInput, { height: 44 }]}
                placeholder="e.g. photorealistic, cinematic, abstract"
                placeholderTextColor={colors.textSecondary}
                value={styleTags}
                onChangeText={setStyleTags}
              />
              <Text style={styles.fieldHint}>Comma-separated</Text>
            </>
          )}
        </View>

        <Button
          title="Share"
          onPress={handleSubmit(onSubmit)}
          loading={sharing}
          size="lg"
          style={styles.shareButton}
        />
      </ScrollView>

      {/* Caption Generator Modal */}
      <CaptionGenerator
        visible={showCaptionGen}
        imageUri={imageUri}
        onClose={() => setShowCaptionGen(false)}
        onUse={(caption: string) => {
          setValue('caption', caption);
          setShowCaptionGen(false);
        }}
      />

      {/* Location Picker Modal */}
      <LocationPicker
        visible={showLocationPicker}
        onClose={() => setShowLocationPicker(false)}
        onSelect={(location) => {
          setSelectedLocation(location);
          setShowLocationPicker(false);
        }}
      />
    </KeyboardAvoidingView>
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
  topRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  preview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  captionContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  captionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  locationText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionLabel: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  audienceChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipCloseFriends: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  chipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
  },
  shareButton: {
    marginTop: spacing.xl,
  },
  // AI Section
  aiSection: {
    marginTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiToggleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiToggleText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  aiPrefilledInfo: {
    marginTop: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  aiInfoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  aiInfoLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    width: 70,
  },
  aiInfoValue: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    flex: 1,
  },
  aiManualFields: {
    marginTop: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  fieldHint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    height: 80,
    backgroundColor: colors.backgroundSecondary,
  },
});
