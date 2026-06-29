import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { spacing as spacingScale } from '@/lib/theme';

type SpacingKey = keyof typeof spacingScale;

type StackProps = {
  direction?: 'row' | 'column';
  gap?: SpacingKey;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  flex?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const ALIGN_MAP: Record<NonNullable<StackProps['align']>, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const JUSTIFY_MAP: Record<NonNullable<StackProps['justify']>, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Lightweight flex helper. Replaces ad-hoc `<View style={{flexDirection,
 * alignItems, justifyContent, gap}}/>` boilerplate.
 *
 *   <Stack direction="row" gap="md" align="center" justify="between">
 *     <Text>Left</Text>
 *     <Text>Right</Text>
 *   </Stack>
 */
export function Stack({
  direction = 'column',
  gap = 'sm',
  align,
  justify,
  wrap,
  flex,
  style,
  children,
}: StackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap: spacingScale[gap] as number,
          alignItems: align ? ALIGN_MAP[align] : undefined,
          justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
          flexWrap: wrap ? 'wrap' : undefined,
          flex,
        } as ViewStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Inline shorthand: `<HStack>` ≡ `<Stack direction="row">`. */
export function HStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="row" />;
}

/** Inline shorthand: `<VStack>` ≡ `<Stack direction="column">`. */
export function VStack(props: Omit<StackProps, 'direction'>) {
  return <Stack {...props} direction="column" />;
}
