import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AVATAR_SIZES } from '@/lib/constants';

type Props = {
  children: React.ReactNode;
  size?: keyof typeof AVATAR_SIZES;
};

const CLOSE_FRIENDS_GREEN = '#58C322';

export function CloseFriendsRing({ children, size = 'lg' }: Props) {
  const dimension = AVATAR_SIZES[size];
  const ringSize = dimension + 10;

  return (
    <View
      style={[
        styles.ring,
        {
          width: ringSize,
          height: ringSize,
          borderRadius: ringSize / 2,
        },
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            width: ringSize - 4,
            height: ringSize - 4,
            borderRadius: (ringSize - 4) / 2,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 2,
    borderColor: CLOSE_FRIENDS_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
