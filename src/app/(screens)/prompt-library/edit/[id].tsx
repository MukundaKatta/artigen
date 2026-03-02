import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { PromptForm, PromptFormValues } from '@/components/prompt/PromptForm';
import { getPromptById, updatePrompt, deletePrompt } from '@/services/prompt-library.service';
import { showAlert } from '@/utils/alert';
import { Button } from '@/components/ui/Button';

export default function PromptEditScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<PromptFormValues>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPromptById(id).then(({ data }) => {
      if (data) {
        setInitial({
          title: data.title,
          prompt: data.prompt,
          negative_prompt: data.negative_prompt || '',
          model_id: data.model_id || '',
          style_tags: data.style_tags || [],
          is_public: data.is_public,
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (values: PromptFormValues) => {
    if (!user) {
      showAlert('Error', 'You must be logged in to modify prompts');
      return;
    }
    setSubmitting(true);
    const { data, error } = await updatePrompt(id!, values);
    setSubmitting(false);
    if (error) {
      showAlert('Error', error.message || 'Failed to update prompt');
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    Alert.alert('Delete Prompt', 'Are you sure you want to delete this prompt?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePrompt(id!);
          router.back();
        },
      },
    ]);
  };

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PromptForm initial={initial} onSubmit={handleSubmit} submitting={submitting} />
      <View style={{ padding: 16 }}>
        <Button
          title="Delete Prompt"
          variant="outline"
          textStyle={{ color: '#E53E3E' }}
          style={{ borderColor: '#E53E3E' }}
          onPress={handleDelete}
        />
      </View>
    </View>
  );
}
