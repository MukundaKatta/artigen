import React, { useRef, useState } from 'react';
import { View, StyleSheet, Image, PanResponder, Dimensions } from 'react-native';
import { colors } from '@/lib/theme';

type Props = {
  imageUri: string;
  onMaskReady: (maskUri: string) => void;
};

const CANVAS_SIZE = Dimensions.get('window').width - 32;
const BRUSH_RADIUS = 20;

export function MaskDrawingCanvas({ imageUri, onMaskReady }: Props) {
  const [paths, setPaths] = useState<{ x: number; y: number }[][]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = [{ x: locationX, y: locationY }];
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = [...currentPath.current, { x: locationX, y: locationY }];
        setPaths((prev) => {
          const updated = [...prev];
          updated[updated.length] = currentPath.current;
          return [...prev.slice(0, -1), currentPath.current];
        });
      },
      onPanResponderRelease: () => {
        setPaths((prev) => [...prev, currentPath.current]);
        currentPath.current = [];
        // Signal mask is ready with a placeholder URI
        // In production, this would capture the mask as an image
        onMaskReady(`mask://${Date.now()}`);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} />
      <View style={styles.overlay} {...panResponder.panHandlers}>
        {paths.map((path, pathIndex) =>
          path.map((point, pointIndex) => (
            <View
              key={`${pathIndex}-${pointIndex}`}
              style={[
                styles.brushPoint,
                {
                  left: point.x - BRUSH_RADIUS,
                  top: point.y - BRUSH_RADIUS,
                  width: BRUSH_RADIUS * 2,
                  height: BRUSH_RADIUS * 2,
                },
              ]}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  brushPoint: {
    position: 'absolute',
    borderRadius: BRUSH_RADIUS,
    backgroundColor: 'rgba(255, 0, 0, 0.4)',
  },
});
