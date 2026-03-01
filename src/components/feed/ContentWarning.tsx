import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  labelType?: 'safe' | 'sensitive' | 'mature' | 'nsfw';
  userShowsSensitive?: boolean;
  userShowsMature?: boolean;
};

export function ContentWarning({ children, labelType, userShowsSensitive, userShowsMature }: Props) {
  const [revealed, setRevealed] = useState(false);

  const shouldBlur = labelType === 'nsfw' ||
    (labelType === 'sensitive' && !userShowsSensitive) ||
    (labelType === 'mature' && !userShowsMature);

  if (!shouldBlur || revealed) return <>{children}</>;

  return (
    <View style={styles.container}>
      {children}
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={40} style={StyleSheet.absoluteFill} />
        <View style={styles.overlay}>
          <Ionicons name="eye-off" size={28} color="#fff" />
          <Text style={styles.label}>
            {labelType === 'nsfw' ? 'NSFW Content' : labelType === 'mature' ? 'Mature Content' : 'Sensitive Content'}
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => setRevealed(true)}>
            <Text style={styles.btnText}>Show</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  label: { color: '#fff', fontSize: fontSize.sm, fontFamily: typography.bold },
  btn: { borderWidth: 1, borderColor: '#fff', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: 6 },
  btnText: { color: '#fff', fontFamily: typography.medium, fontSize: fontSize.sm },
});
