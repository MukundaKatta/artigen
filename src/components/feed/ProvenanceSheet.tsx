import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  provenance: any;
};

export function ProvenanceSheet({ visible, onClose, provenance }: Props) {
  if (!provenance) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
            <Text style={styles.title}>Art Provenance</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{provenance.verification_status}</Text>
          </View>
          {provenance.model_name && (
            <View style={styles.row}>
              <Text style={styles.label}>AI Model</Text>
              <Text style={styles.value}>{provenance.model_name}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{new Date(provenance.generation_date).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Content Hash</Text>
            <Text style={[styles.value, styles.hash]}>{provenance.content_hash?.slice(0, 16)}...</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Signature</Text>
            <Text style={[styles.value, styles.hash]}>{provenance.signature?.slice(0, 16)}...</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  title: { flex: 1, fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { fontSize: fontSize.sm, color: colors.textSecondary, fontFamily: typography.medium },
  value: { fontSize: fontSize.sm, color: colors.text, fontFamily: typography.medium },
  hash: { fontFamily: 'Courier', fontSize: 12 },
});
