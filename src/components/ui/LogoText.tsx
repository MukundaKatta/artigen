import React, { useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Platform, Animated } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: 22,
  md: 28,
  lg: 42,
};

const GRADIENT_COLORS: [string, string, ...string[]] = [
  '#833AB4',
  '#C13584',
  '#E1306C',
  '#FD1D1D',
  '#F77737',
  '#FCAF45',
  '#F77737',
  '#FD1D1D',
  '#E1306C',
  '#C13584',
  '#833AB4',
];

function LogoLabel({ fontSize, color }: { fontSize: number; color?: string }) {
  const capSize = Math.round(fontSize * 1.35);
  const colorStyle = color ? { color } : undefined;
  return (
    <Text style={[styles.text, { fontSize }, colorStyle]}>
      <Text style={{ fontSize: capSize }}>A</Text>
      rtigen
    </Text>
  );
}

// Inject the keyframes animation once for web
const ANIMATION_ID = 'artigen-gradient-shift';
function injectWebAnimation() {
  if (Platform.OS !== 'web') return;
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIMATION_ID)) return;
  const style = document.createElement('style');
  style.id = ANIMATION_ID;
  style.textContent = `
    @keyframes artigenGradientShift {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
  `;
  document.head.appendChild(style);
}

function WebGradientLogo({ fontSize }: { fontSize: number }) {
  const capSize = Math.round(fontSize * 1.35);

  useEffect(() => {
    injectWebAnimation();
  }, []);

  const gradientStyle = {
    // @ts-ignore — web-only CSS properties for gradient text
    backgroundImage:
      'linear-gradient(90deg, #833AB4, #C13584, #E1306C, #FD1D1D, #F77737, #FCAF45, #F77737, #FD1D1D, #E1306C, #C13584, #833AB4)',
    backgroundSize: '200% 100%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent',
    animationName: 'artigenGradientShift',
    animationDuration: '3s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite' as const,
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
        <Text style={[styles.text, { fontSize: capSize }, gradientStyle]}>A</Text>
        <Text style={[styles.text, { fontSize }, gradientStyle]}>rtigen</Text>
      </View>
    </View>
  );
}

function NativeAnimatedLogo({ fontSize }: { fontSize: number }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const textHeight = Math.round(fontSize * 1.35) * 1.4;
  // Make gradient wide enough to scroll through
  const gradientWidth = fontSize * 12;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -gradientWidth / 2,
        duration: 3000,
        useNativeDriver: true,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [translateX, gradientWidth]);

  const textElement = <LogoLabel fontSize={fontSize} />;

  return (
    <View style={styles.container}>
      <MaskedView maskElement={textElement}>
        <View style={{ height: textHeight, overflow: 'hidden' }}>
          <Animated.View
            style={{
              flexDirection: 'row',
              transform: [{ translateX }],
            }}
          >
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: textHeight, width: gradientWidth }}
            >
              <LogoLabel fontSize={fontSize} color="transparent" />
            </LinearGradient>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ height: textHeight, width: gradientWidth }}
            />
          </Animated.View>
        </View>
      </MaskedView>
    </View>
  );
}

export function LogoText({ size = 'md' }: Props) {
  const fontSize = SIZES[size];

  if (Platform.OS === 'web') {
    return <WebGradientLogo fontSize={fontSize} />;
  }

  return <NativeAnimatedLogo fontSize={fontSize} />;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Pacifico_400Regular',
    letterSpacing: 1,
  },
});
