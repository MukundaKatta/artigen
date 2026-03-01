import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { FrameStyle } from '@/services/ar-preview.service';

type Props = {
  imageUrl: string;
  frameStyle: FrameStyle;
  widthCm: number;
  heightCm: number;
};

const FRAME_STYLES: Record<FrameStyle, { borderWidth: number; borderColor: string; padding: number; shadow: boolean }> = {
  none: { borderWidth: 0, borderColor: 'transparent', padding: 0, shadow: false },
  thin_black: { borderWidth: 2, borderColor: '#1A1A1A', padding: 0, shadow: true },
  thin_white: { borderWidth: 2, borderColor: '#FFFFFF', padding: 0, shadow: true },
  gallery: { borderWidth: 4, borderColor: '#2C2C2C', padding: 8, shadow: true },
  modern: { borderWidth: 6, borderColor: '#E0E0E0', padding: 4, shadow: true },
  ornate: { borderWidth: 8, borderColor: '#8B7355', padding: 6, shadow: true },
};

export function ARPreviewView({ imageUrl, frameStyle, widthCm, heightCm }: Props) {
  const frame = FRAME_STYLES[frameStyle];

  // Scale cm to pixel dimensions (max 280px wide)
  const maxWidth = 280;
  const ratio = heightCm / widthCm;
  const displayWidth = maxWidth;
  const displayHeight = maxWidth * ratio;

  return (
    <View style={styles.container}>
      {/* Simulated wall background */}
      <LinearGradient
        colors={['#E8DDD3', '#D4C5B5', '#C9BAA8'] as [string, string, ...string[]]}
        style={styles.wallBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Shadow behind frame */}
        {frame.shadow && (
          <View
            style={[
              styles.frameShadow,
              {
                width: displayWidth + frame.borderWidth * 2 + frame.padding * 2 + 8,
                height: displayHeight + frame.borderWidth * 2 + frame.padding * 2 + 8,
              },
            ]}
          />
        )}

        {/* Frame */}
        <View
          style={[
            styles.frame,
            {
              borderWidth: frame.borderWidth,
              borderColor: frame.borderColor,
              padding: frame.padding,
            },
          ]}
        >
          <Image
            source={{ uri: imageUrl }}
            style={{
              width: displayWidth,
              height: displayHeight,
            }}
            resizeMode="cover"
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  wallBackground: {
    width: '100%',
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  frameShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 2,
    transform: [{ translateX: 4 }, { translateY: 4 }],
  },
  frame: {
    backgroundColor: '#FFFFFF',
  },
});
