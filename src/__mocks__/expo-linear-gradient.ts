import React from 'react';

export const LinearGradient = ({ children, ...rest }: Record<string, unknown> & { children?: React.ReactNode }) =>
  React.createElement('LinearGradient', rest, children);
