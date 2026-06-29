/**
 * Smoke tests for the Stack / HStack / VStack flex helpers.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';
import { Stack, HStack, VStack } from '@/components/ui/Stack';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('Stack', () => {
  it('renders children in column by default', () => {
    const tree = render(
      <Stack>
        <Text>a</Text>
        <Text>b</Text>
      </Stack>,
    );
    expect(tree.root.findAllByType('Text')).toHaveLength(2);
  });

  it('switches to row direction via prop', () => {
    const tree = render(
      <Stack direction="row" gap="md">
        <Text>a</Text>
      </Stack>,
    );
    const view = tree.root.findByType('View');
    const merged = Array.isArray(view.props.style)
      ? Object.assign({}, ...view.props.style.filter(Boolean))
      : view.props.style;
    expect(merged.flexDirection).toBe('row');
  });

  it('HStack and VStack are direction-locked', () => {
    const h = render(
      <HStack>
        <Text>a</Text>
      </HStack>,
    );
    const hStyle = Array.isArray(h.root.findByType('View').props.style)
      ? Object.assign({}, ...h.root.findByType('View').props.style.filter(Boolean))
      : h.root.findByType('View').props.style;
    expect(hStyle.flexDirection).toBe('row');

    const v = render(
      <VStack>
        <Text>a</Text>
      </VStack>,
    );
    const vStyle = Array.isArray(v.root.findByType('View').props.style)
      ? Object.assign({}, ...v.root.findByType('View').props.style.filter(Boolean))
      : v.root.findByType('View').props.style;
    expect(vStyle.flexDirection).toBe('column');
  });

  it('passes alignItems / justifyContent through the shorthand map', () => {
    const tree = render(
      <Stack align="center" justify="between">
        <Text>a</Text>
      </Stack>,
    );
    const style = Array.isArray(tree.root.findByType('View').props.style)
      ? Object.assign({}, ...tree.root.findByType('View').props.style.filter(Boolean))
      : tree.root.findByType('View').props.style;
    expect(style.alignItems).toBe('center');
    expect(style.justifyContent).toBe('space-between');
  });
});
