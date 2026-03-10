import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { findMentors } from '@/services/mentorship.service';
import { requestMentorship } from '@/services/mentorship.service';
import { MentorCard } from '@/components/learning/MentorCard';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type MentorProfile = {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_verified: boolean;
};

export default function FindMentorRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await findMentors();
      setMentors(data);
      setLoading(false);
    })();
  }, []);

  async function handleRequest(mentorId: string) {
    if (!user?.id) return;

    Alert.prompt(
      'Request Mentorship',
      'Write a message to the mentor explaining what you want to learn:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Request',
          onPress: async (message) => {
            if (!message?.trim()) return;
            const { error } = await requestMentorship(
              user.id,
              mentorId,
              ['AI art'],
              message.trim(),
            );
            if (error) {
              Alert.alert('Error', 'Failed to send request. Please try again.');
            } else {
              Alert.alert('Success', 'Mentorship request sent!');
              router.back();
            }
          },
        },
      ],
      'plain-text',
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Find a Mentor' }} />
        <LoadingSpinner fullScreen />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Find a Mentor' }} />
      <FlatList
        data={mentors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MentorCard
            mentor={item}
            onRequest={handleRequest}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Available Mentors</Text>
            <Text style={styles.headerSubtitle}>
              Connect with experienced AI artists who can guide your journey
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No mentors available yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
