import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

const HEADER_HEIGHT = 200;

type Props = {
  headerImage?: React.ReactNode;
  headerBackgroundColor?: string;
  headerHeight?: number;
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  stickyElement?: React.ReactNode;
};

export function ParallaxScrollView({
  headerImage,
  headerBackgroundColor = '#0095F6',
  headerHeight = HEADER_HEIGHT,
  children,
  onRefresh,
  refreshing,
  stickyElement,
}: Props) {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [-headerHeight / 2, 0, headerHeight * 0.75],
      Extrapolation.CLAMP,
    );

    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [2, 1, 1],
      Extrapolation.CLAMP,
    );

    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight * 0.6, headerHeight],
      [1, 0.5, 0],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY }, { scale }],
      opacity,
    };
  });

  const stickyAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [headerHeight * 0.5, headerHeight * 0.8],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return { opacity };
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          onRefresh && Platform.OS !== 'web'
            ? undefined // Let caller handle via props
            : undefined
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            { height: headerHeight, backgroundColor: headerBackgroundColor },
            headerAnimatedStyle,
          ]}
        >
          {headerImage}
        </Animated.View>
        <View style={styles.content}>{children}</View>
      </Animated.ScrollView>

      {stickyElement && (
        <Animated.View style={[styles.stickyHeader, stickyAnimatedStyle]}>
          {stickyElement}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
