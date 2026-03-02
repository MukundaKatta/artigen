import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { PromptForm, PromptFormValues } from '@/components/prompt/PromptForm';
import { createPrompt } from '@/services/prompt-library.service';
import { showAlert } from '@/utils/alert';

export default function PromptCreateScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: PromptFormValues) => {
    if (!user) {
      showAlert('Error', 'You must be logged in to save prompts');
      return;
    }

    setSubmitting(true);
    const { data, error } = await createPrompt({
      user_id: user.id,
      ...values,
    });
    setSubmitting(false);

    if (error) {
      showAlert('Error', error.message || 'Failed to save prompt');
    } else {
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <PromptForm onSubmit={handleSubmit} submitting={submitting} />
    </View>
  );
}
