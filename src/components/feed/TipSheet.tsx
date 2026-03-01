import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { TIP_PRESETS } from '@/lib/constants';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSend: (amountCents: number, message?: string) => void;
  recipientName: string;
  sending?: boolean;
};

export function TipSheet({ visible, onClose, onSend, recipientName, sending }: Props) {
  const [selected, setSelected] = useState<number>(TIP_PRESETS[1]);
  const [message, setMessage] = useState('');

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Tip {recipientName}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <View style={styles.presets}>
            {TIP_PRESETS.map(amount => (
              <TouchableOpacity
                key={amount}
                style={[styles.chip, selected === amount && styles.chipActive]}
                onPress={() => setSelected(amount)}
              >
                <Text style={[styles.chipText, selected === amount && styles.chipTextActive]}>
                  ${(amount / 100).toFixed(0)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a message (optional)"
            placeholderTextColor={colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            maxLength={200}
          />
          <TouchableOpacity
            style={[styles.sendBtn, sending && styles.sendBtnDisabled]}
            onPress={() => onSend(selected, message || undefined)}
            disabled={sending}
          >
            <Ionicons name="gift" size={18} color="#fff" />
            <Text style={styles.sendText}>
              {sending ? 'Sending...' : `Send $${(selected / 100).toFixed(0)} Tip`}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontFamily: typography.bold, color: colors.text },
  presets: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  chip: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text },
  chipTextActive: { color: '#fff' },
  input: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.sm, color: colors.text, fontSize: fontSize.sm, marginBottom: spacing.md },
  sendBtn: { backgroundColor: colors.primary, borderRadius: 8, padding: spacing.md, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  sendBtnDisabled: { opacity: 0.5 },
  sendText: { color: '#fff', fontFamily: typography.bold, fontSize: fontSize.md },
});
