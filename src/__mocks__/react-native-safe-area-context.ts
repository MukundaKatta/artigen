// Jest mock for react-native-safe-area-context.
import React from 'react';

export const useSafeAreaInsets = () => ({ top: 0, right: 0, bottom: 0, left: 0 });
export const useSafeAreaFrame = () => ({ x: 0, y: 0, width: 375, height: 812 });
export const SafeAreaProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const SafeAreaView = ({ children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
  React.createElement('SafeAreaView', rest, children);
export const SafeAreaInsetsContext = React.createContext({ top: 0, right: 0, bottom: 0, left: 0 });
