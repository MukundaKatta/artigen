// Jest mock for react-native-reanimated. Provides just enough surface
// that components using `Animated.View`, `useSharedValue`, etc. can render.
import React from 'react';

function makeHost(name: string) {
  const Comp = React.forwardRef<unknown, Record<string, unknown>>((props, ref) =>
    React.createElement(name, { ...props, ref }),
  );
  (Comp as unknown as { displayName: string }).displayName = name;
  return Comp;
}

const View = makeHost('Animated.View');
const Text = makeHost('Animated.Text');
const ScrollView = makeHost('Animated.ScrollView');
const Image = makeHost('Animated.Image');
const FlatList = makeHost('Animated.FlatList');

export default {
  View,
  Text,
  ScrollView,
  Image,
  FlatList,
  createAnimatedComponent: <P,>(C: React.ComponentType<P>) => C,
  call: () => {},
  Value: class { setValue() {} },
};

export { View, Text, ScrollView, Image, FlatList };

// Hooks
export const useSharedValue = <T,>(v: T) => ({ value: v });
export const useAnimatedStyle = (fn: () => Record<string, unknown>) => fn();
export const useAnimatedProps = (fn: () => Record<string, unknown>) => fn();
export const withTiming = <T,>(v: T) => v;
export const withSpring = <T,>(v: T) => v;
export const withRepeat = <T,>(v: T) => v;
export const withSequence = <T,>(v: T) => v;
export const withDelay = <T,>(_d: number, v: T) => v;
export const withDecay = <T,>(v: T) => v;
export const runOnJS = <T extends (...args: never[]) => unknown>(fn: T) => fn;
export const runOnUI = <T extends (...args: never[]) => unknown>(fn: T) => fn;
export const interpolate = (n: number) => n;
export const Extrapolate = { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' };
export const Easing = {
  linear: () => 0,
  ease: () => 0,
  in: () => () => 0,
  out: () => () => 0,
  inOut: () => () => 0,
  bezier: () => () => 0,
};
export const cancelAnimation = () => {};
export const interpolateColor = () => 'transparent';

// Entering / Exiting animation builders — chainable noops.
function makeBuilder() {
  const chain = {
    duration: () => chain,
    delay: () => chain,
    damping: () => chain,
    stiffness: () => chain,
    springify: () => chain,
    withInitialValues: () => chain,
    easing: () => chain,
    rotate: () => chain,
    build: () => chain,
  };
  return chain;
}
export const FadeIn = makeBuilder();
export const FadeOut = makeBuilder();
export const FadeInDown = makeBuilder();
export const FadeOutUp = makeBuilder();
export const FadeInUp = makeBuilder();
export const FadeOutDown = makeBuilder();
export const SlideInDown = makeBuilder();
export const SlideOutDown = makeBuilder();
export const ZoomIn = makeBuilder();
export const ZoomOut = makeBuilder();
export const Layout = makeBuilder();
