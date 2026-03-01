import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { PromptRemixEditor } from '@/components/create/PromptRemixEditor';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function RemixRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [modifiedPrompt, setModifiedPrompt] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId) return;
    supabase
      .from('ai_metadata')
      .select('prompt')
      .eq('post_id', postId)
      .maybeSingle()
      .then(({ data }) => {
        const prompt = data?.prompt || '';
        setOriginalPrompt(prompt);
        setModifiedPrompt(prompt);
        setLoading(false);
      });
  }, [postId]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Remix Prompt' }} />
      <PromptRemixEditor
        originalPrompt={originalPrompt}
        modifiedPrompt={modifiedPrompt}
        onChangeModified={setModifiedPrompt}
      />
      <View style={styles.buttonRow}>
        <Button
          title="Generate with Modified Prompt"
          variant="primary"
          disabled={modifiedPrompt === originalPrompt || !modifiedPrompt.trim()}
          onPress={() => {
            router.push({
              pathname: '/(camera)/generate',
              params: {
                prefillPrompt: modifiedPrompt,
                remixOfPostId: postId,
                originalPrompt,
              },
            });
          }}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  buttonRow: { padding: spacing.lg },
  button: { marginHorizontal: spacing.lg },
});
