// Jest mock for react-native. Provides the small subset of APIs our tests
// touch, plus stub host components that re-render as plain React elements
// (so `react-test-renderer` can walk the tree to assert props / children).

import React from 'react';

export const Platform = {
  OS: 'ios' as 'ios' | 'android' | 'web',
  select: (obj: Record<string, any>) => obj.ios ?? obj.default ?? {},
};

export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 3, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

export const AppState = {
  currentState: 'active',
  addEventListener: () => ({ remove: () => {} }),
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  hairlineWidth: 0.5,
  flatten: (s: unknown) => s,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  absoluteFillObject: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
};

export const PixelRatio = {
  get: () => 3,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size: number) => size * 3,
  roundToNearestPixel: (size: number) => size,
};

export const Appearance = {
  getColorScheme: () => 'light',
  addChangeListener: () => ({ remove: () => {} }),
};

export const Alert = {
  alert: jest.fn(),
};

export const Share = {
  share: jest.fn().mockResolvedValue({ action: 'dismissedAction' }),
};

export const Linking = {
  openURL: jest.fn().mockResolvedValue(undefined),
  canOpenURL: jest.fn().mockResolvedValue(true),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
};

// ── Host component stubs ─────────────────────────────────
// Each returns its children wrapped in a host element whose `type` is the
// component name (so react-test-renderer can search by displayName).
function createHost(name: string) {
  const Comp = React.forwardRef<unknown, Record<string, unknown>>((props, ref) => {
    const { children, ...rest } = props as { children?: React.ReactNode };
    // Use createElement with a string tag so the test renderer treats it as
    // a host node; ref is forwarded for components that need it.
    return React.createElement(name, { ...rest, ref }, children);
  });
  Comp.displayName = name;
  return Comp;
}

export const View = createHost('View');
export const Text = createHost('Text');
export const ScrollView = createHost('ScrollView');
export const Image = createHost('Image');
export const ImageBackground = createHost('ImageBackground');
export const TextInput = createHost('TextInput');
export const Switch = createHost('Switch');
export const ActivityIndicator = createHost('ActivityIndicator');
export const TouchableOpacity = createHost('TouchableOpacity');
export const TouchableHighlight = createHost('TouchableHighlight');
export const Pressable = createHost('Pressable');
export const Modal = createHost('Modal');
export const SafeAreaView = createHost('SafeAreaView');
export const KeyboardAvoidingView = createHost('KeyboardAvoidingView');
export const RefreshControl = createHost('RefreshControl');
export const FlatList = createHost('FlatList');
export const SectionList = createHost('SectionList');

// Animated namespace — minimal stub. Most tests don't drive animations;
// they just need the components to render.
const AnimatedHost = (name: string) => {
  const Comp = createHost(`Animated.${name}`);
  return Comp;
};

export const Animated = {
  View: AnimatedHost('View'),
  Text: AnimatedHost('Text'),
  ScrollView: AnimatedHost('ScrollView'),
  Image: AnimatedHost('Image'),
  FlatList: AnimatedHost('FlatList'),
  Value: class { constructor(_v: number) {} setValue() {} },
  ValueXY: class { constructor() {} setValue() {} },
  timing: () => ({ start: (cb?: () => void) => cb?.() }),
  spring: () => ({ start: (cb?: () => void) => cb?.() }),
  sequence: () => ({ start: (cb?: () => void) => cb?.() }),
  parallel: () => ({ start: (cb?: () => void) => cb?.() }),
  loop: () => ({ start: (cb?: () => void) => cb?.() }),
  decay: () => ({ start: (cb?: () => void) => cb?.() }),
  event: () => () => {},
  createAnimatedComponent: <P,>(C: React.ComponentType<P>) => C,
};

// AppRegistry — touched by some entry-point code; harmless stub.
export const AppRegistry = {
  registerComponent: jest.fn(),
  getRunnable: jest.fn(),
};

// Optional: NativeModules + NativeEventEmitter stubs used by some libs.
export const NativeModules: Record<string, unknown> = {};
export class NativeEventEmitter {
  addListener() { return { remove: () => {} }; }
  removeAllListeners() {}
  emit() {}
}

// Default export: combined namespace (some libs do `import RN from 'react-native'`)
export default {
  Platform,
  Dimensions,
  AppState,
  StyleSheet,
  PixelRatio,
  Appearance,
  Alert,
  Share,
  Linking,
  Keyboard,
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  Switch,
  ActivityIndicator,
  TouchableOpacity,
  TouchableHighlight,
  Pressable,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  RefreshControl,
  FlatList,
  SectionList,
  Animated,
  AppRegistry,
  NativeModules,
  NativeEventEmitter,
};
