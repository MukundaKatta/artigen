import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
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

export function LogoText({ size = 'md' }: Props) {
  const fontSize = SIZES[size];

  const textElement = <LogoLabel fontSize={fontSize} />;

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <LogoLabel fontSize={fontSize} color="#C13584" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaskedView maskElement={textElement}>
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: Math.round(fontSize * 1.35) * 1.4 }}
        >
          <LogoLabel fontSize={fontSize} color="transparent" />
        </LinearGradient>
      </MaskedView>
    </View>
  );
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
