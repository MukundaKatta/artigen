import React from 'react';

function makeHost(name: string) {
  const Comp = React.forwardRef<unknown, Record<string, unknown>>((props, ref) =>
    React.createElement(name, { ...props, ref }),
  );
  (Comp as unknown as { displayName: string }).displayName = name;
  return Comp;
}

export const GestureHandlerRootView = makeHost('GestureHandlerRootView');
export const PanGestureHandler = makeHost('PanGestureHandler');
export const TapGestureHandler = makeHost('TapGestureHandler');
export const LongPressGestureHandler = makeHost('LongPressGestureHandler');
export const FlingGestureHandler = makeHost('FlingGestureHandler');
export const State = { BEGAN: 0, ACTIVE: 1, END: 2, CANCELLED: 3, FAILED: 4, UNDETERMINED: 5 };
export const Directions = { LEFT: 1, RIGHT: 2, UP: 4, DOWN: 8 };
export const Gesture = {
  Pan: () => ({ onBegin: () => Gesture.Pan(), onUpdate: () => Gesture.Pan(), onEnd: () => Gesture.Pan() }),
  Tap: () => ({ onStart: () => Gesture.Tap() }),
  LongPress: () => ({ onStart: () => Gesture.LongPress() }),
};
export const GestureDetector = makeHost('GestureDetector');

export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  FlingGestureHandler,
  State,
  Directions,
  Gesture,
  GestureDetector,
};
