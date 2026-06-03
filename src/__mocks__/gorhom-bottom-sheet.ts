import React from 'react';

function makeHost(name: string) {
  const Comp = React.forwardRef<unknown, Record<string, unknown>>((props, ref) =>
    React.createElement(name, { ...props, ref }),
  );
  (Comp as unknown as { displayName: string }).displayName = name;
  return Comp;
}

const BottomSheet = makeHost('BottomSheet');
export default BottomSheet;
export const BottomSheetBackdrop = makeHost('BottomSheetBackdrop');
export const BottomSheetView = makeHost('BottomSheetView');
export const BottomSheetScrollView = makeHost('BottomSheetScrollView');
export const BottomSheetFlatList = makeHost('BottomSheetFlatList');
export const BottomSheetModal = makeHost('BottomSheetModal');
export const BottomSheetModalProvider = makeHost('BottomSheetModalProvider');
export type BottomSheetBackdropProps = Record<string, unknown>;
