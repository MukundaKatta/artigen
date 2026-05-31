// Jest mock for @expo/vector-icons. Each icon family is a host stub that
// renders as a node with the icon name + size.
import React from 'react';

function makeIconFamily(name: string) {
  const Comp = (props: Record<string, unknown>) =>
    React.createElement('Icon', { 'data-family': name, ...props });
  // Minimal glyphMap so `keyof typeof Ionicons.glyphMap` works.
  (Comp as unknown as { glyphMap: Record<string, number> }).glyphMap = {};
  return Comp;
}

export const Ionicons = makeIconFamily('Ionicons');
export const MaterialIcons = makeIconFamily('MaterialIcons');
export const MaterialCommunityIcons = makeIconFamily('MaterialCommunityIcons');
export const FontAwesome = makeIconFamily('FontAwesome');
export const FontAwesome5 = makeIconFamily('FontAwesome5');
export const Feather = makeIconFamily('Feather');
export const AntDesign = makeIconFamily('AntDesign');
export const Entypo = makeIconFamily('Entypo');
export const EvilIcons = makeIconFamily('EvilIcons');
export const Foundation = makeIconFamily('Foundation');
export const Octicons = makeIconFamily('Octicons');
export const SimpleLineIcons = makeIconFamily('SimpleLineIcons');
export const Zocial = makeIconFamily('Zocial');
