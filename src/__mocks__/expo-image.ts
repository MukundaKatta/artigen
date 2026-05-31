// Jest mock for expo-image. Image renders as a host node so tests can
// assert source/style props.
import React from 'react';

export const Image = React.forwardRef<unknown, Record<string, unknown>>((props, ref) => {
  return React.createElement('Image', { ...props, ref });
});
(Image as unknown as { displayName: string }).displayName = 'ExpoImage';

export default { Image };
