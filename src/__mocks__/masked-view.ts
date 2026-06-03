import React from 'react';

const MaskedView = React.forwardRef<unknown, Record<string, unknown>>((props, ref) => {
  const { children, ...rest } = props as { children?: React.ReactNode };
  return React.createElement('MaskedView', { ...rest, ref }, children);
});
(MaskedView as unknown as { displayName: string }).displayName = 'MaskedView';

export default MaskedView;
