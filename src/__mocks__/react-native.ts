export const Platform = {
  OS: 'ios',
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
  create: (styles: any) => styles,
  hairlineWidth: 0.5,
  flatten: (s: any) => s,
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
