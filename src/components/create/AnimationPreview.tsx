import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { sourceUrl: string; resultUrl?: string; loading?: boolean; status?: string };

export function AnimationPreview({ sourceUrl, resultUrl, loading, status }: Props) {
  return (
    <View style={styles.container}>
      {resultUrl ? (
        <Image source={{ uri: resultUrl }} style={styles.image} />
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: sourceUrl }} style={styles.image} />
          {loading && (
            <View style={styles.overlay}>
              <LoadingSpinner size="large" color="#fff" />
              <Text style={styles.statusText}>{status === 'processing' ? 'Animating...' : 'Preparing...'}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.md },
  imageContainer: { position: 'relative' },
  image: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: spacing.sm },
  statusText: { color: '#fff', fontSize: fontSize.sm, fontFamily: typography.medium },
});
