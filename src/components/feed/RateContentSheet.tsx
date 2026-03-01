import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

const RATINGS = [
  { value: 'safe', label: 'Safe', color: '#4CAF50' },
  { value: 'sensitive', label: 'Sensitive', color: '#FF9800' },
  { value: 'mature', label: 'Mature', color: '#F44336' },
  { value: 'nsfw', label: 'NSFW', color: '#9C27B0' },
] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: 'safe' | 'sensitive' | 'mature' | 'nsfw') => void;
};

export function RateContentSheet({ visible, onClose, onRate }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Rate Content</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.desc}>Help keep the community safe by rating this content</Text>
          {RATINGS.map(r => (
            <TouchableOpacity key={r.value} style={styles.option} onPress={() => { onRate(r.value); onClose(); }}>
              <View style={[styles.dot, { backgroundColor: r.color }]} />
              <Text style={styles.optionText}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  title: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  optionText: { fontSize: fontSize.md, color: colors.text, fontFamily: typography.medium },
});
