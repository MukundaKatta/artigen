import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { showAlert } from '@/utils/alert';
import { useImagePicker } from '@/hooks/useImagePicker';
import { updateProfile } from '@/services/profile.service';
import { uploadFile } from '@/services/upload.service';
import { Ionicons } from '@expo/vector-icons';
import { editProfileSchema, EditProfileFormData } from '@/utils/validation';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';

export function EditProfileScreen() {
  const { profile, user, refreshProfile } = useAuth();
  const router = useRouter();
  const { pickFromGallery } = useImagePicker();
  const [saving, setSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      username: profile?.username || '',
      fullName: profile?.full_name || '',
      bio: profile?.bio || '',
      website: profile?.website || '',
    },
  });

  async function handleChangePhoto() {
    const { asset, error } = await pickFromGallery({ aspect: [1, 1] });
    if (error) {
      showAlert('Error', error);
      return;
    }
    if (asset) {
      setAvatarUri(asset.uri);
    }
  }

  async function onSubmit(data: EditProfileFormData) {
    if (!user?.id) return;
    setSaving(true);

    let avatarUrl = profile?.avatar_url;

    // Upload new avatar if changed
    if (avatarUri) {
      const fileName = `avatar_${Date.now()}.jpg`;
      const { url, error } = await uploadFile('avatars', user.id, avatarUri, fileName);
      if (error) {
        showAlert('Error', 'Failed to upload avatar');
        setSaving(false);
        return;
      }
      avatarUrl = url;
    }

    const { error } = await updateProfile(user.id, {
      username: data.username,
      full_name: data.fullName,
      bio: data.bio || '',
      website: data.website || '',
      avatar_url: avatarUrl,
    });

    setSaving(false);

    if (error) {
      showAlert('Error', error.message);
    } else {
      await refreshProfile();
      router.back();
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar uri={avatarUri || profile?.avatar_url} size="xl" />
        <TouchableOpacity onPress={handleChangePhoto}>
          <Text style={styles.changePhotoText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Username"
            placeholder="Username"
            onBlur={onBlur}
            onChangeText={(text) => onChange(text.toLowerCase())}
            value={value}
            error={errors.username?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Name"
            placeholder="Full Name"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Bio"
            placeholder="Write a bio..."
            multiline
            numberOfLines={3}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.bio?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="website"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Website"
            placeholder="https://example.com"
            keyboardType="url"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={errors.website?.message}
          />
        )}
      />

      {/* Customize Profile Link */}
      <TouchableOpacity
        style={styles.customizeRow}
        onPress={() => router.push('/(screens)/customize-profile')}
      >
        <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
        <Text style={styles.customizeText}>Customize Profile</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </TouchableOpacity>

      <Button
        title="Save"
        onPress={handleSubmit(onSubmit)}
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  changePhotoText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  customizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  customizeText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  saveButton: {
    marginTop: spacing.lg,
  },
});
