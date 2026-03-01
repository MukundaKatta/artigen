import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  children: React.ReactNode;
  isLocked: boolean;
  onSubscribe: () => void;
};

export function SubscriberGate({ children, isLocked, onSubscribe }: Props) {
  if (!isLocked) return <>{children}</>;

  return (
    <View style={styles.container}>
      {children}
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
        <View style={styles.overlay}>
          <Ionicons name="lock-closed" size={32} color="#fff" />
          <Text style={styles.text}>Subscriber Only</Text>
          <TouchableOpacity style={styles.btn} onPress={onSubscribe}>
            <Text style={styles.btnText}>Subscribe to View</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  text: { color: '#fff', fontSize: fontSize.md, fontFamily: typography.bold },
  btn: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 8 },
  btnText: { color: '#fff', fontFamily: typography.bold, fontSize: fontSize.sm },
});
