import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getCritiqueCount } from '@/services/critique.service';
import { colors, spacing, fontSize, typography, accentColors } from '@/lib/theme';

type Props = {
  postId: string;
};

export function CritiqueButton({ postId }: Props) {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    getCritiqueCount(postId).then(setCount);
  }, [postId]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/(screens)/critiques/${postId}`)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `View ${count} critique${count === 1 ? '' : 's'}` : 'Add critique'}
    >
      <Ionicons name="school-outline" size={20} color={accentColors.amber} />
      <Text style={styles.text}>
        {count > 0 ? `${count} ${count === 1 ? 'Critique' : 'Critiques'}` : 'Critique'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: accentColors.amber,
  },
});
