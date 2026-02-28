import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSize, spacing, typography } from '@/lib/theme';

const REPORT_REASONS = [
  'Spam',
  'Harassment or bullying',
  'Hate speech',
  'Violence or threats',
  'Nudity or sexual content',
  'Misinformation',
  'Intellectual property violation',
  'Other',
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onReport: (reason: string) => void;
  title?: string;
};

export function ReportSheet({ visible, onClose, onReport, title = 'Report' }: Props) {
  const [submitted, setSubmitted] = useState(false);

  function handleReport(reason: string) {
    onReport(reason);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          {submitted ? (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              <Text style={styles.successText}>Thanks for reporting</Text>
              <Text style={styles.successSubtext}>We'll review this and take action if needed.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>Why are you reporting this?</Text>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={styles.reasonRow}
                  onPress={() => handleReport(reason)}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: spacing.xxxl,
    maxHeight: '80%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  reasonText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  successText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
  },
  successSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
