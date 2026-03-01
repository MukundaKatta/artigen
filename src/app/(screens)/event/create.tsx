import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { createEvent } from '@/services/event.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

const EVENT_TYPES = [
  { key: 'workshop', label: 'Workshop', icon: 'build-outline' },
  { key: 'ama', label: 'AMA', icon: 'chatbubbles-outline' },
  { key: 'livestream', label: 'Livestream', icon: 'videocam-outline' },
  { key: 'challenge_event', label: 'Challenge', icon: 'trophy-outline' },
  { key: 'meetup', label: 'Meetup', icon: 'people-outline' },
] as const;

export default function CreateEventRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<string>('workshop');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!user?.id) return;
    if (!title.trim()) {
      Alert.alert('Error', 'Event title is required.');
      return;
    }

    // Default to 1 hour from now if no date provided
    const startDate = startsAt.trim()
      ? new Date(startsAt.trim()).toISOString()
      : new Date(Date.now() + 3600 * 1000).toISOString();

    setSubmitting(true);

    const { data, error } = await createEvent(user.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      event_type: eventType as any,
      starts_at: startDate,
      meeting_url: meetingUrl.trim() || undefined,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert('Error', 'Failed to create event. Please try again.');
      return;
    }

    if (data) {
      router.replace(`/(screens)/event/${data.id}`);
    }
  }, [user?.id, title, description, eventType, startsAt, meetingUrl, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Event' }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Event type selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Event Type *</Text>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeChip,
                  eventType === type.key && styles.typeChipActive,
                ]}
                onPress={() => setEventType(type.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={type.icon as any}
                  size={16}
                  color={eventType === type.key ? colors.textLight : colors.text}
                />
                <Text
                  style={[
                    styles.typeChipText,
                    eventType === type.key && styles.typeChipTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={150}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's this event about?"
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </View>

        {/* Start date */}
        <View style={styles.field}>
          <Text style={styles.label}>Start Date & Time</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD HH:MM (e.g., 2026-03-15 14:00)"
            placeholderTextColor={colors.textSecondary}
            value={startsAt}
            onChangeText={setStartsAt}
          />
          <Text style={styles.hint}>
            Leave empty to default to 1 hour from now
          </Text>
        </View>

        {/* Meeting URL */}
        <View style={styles.field}>
          <Text style={styles.label}>Meeting Link</Text>
          <TextInput
            style={styles.input}
            placeholder="https://meet.google.com/..."
            placeholderTextColor={colors.textSecondary}
            value={meetingUrl}
            onChangeText={setMeetingUrl}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.createButton, (!title.trim() || submitting) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!title.trim() || submitting}
          activeOpacity={0.7}
        >
          {submitting ? (
            <ActivityIndicator color={colors.textLight} />
          ) : (
            <Text style={styles.createButtonText}>Create Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeChipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  typeChipTextActive: {
    color: colors.textLight,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.textLight,
  },
});
