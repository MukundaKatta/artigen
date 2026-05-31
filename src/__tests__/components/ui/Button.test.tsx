/**
 * Render tests for the shared <Button>. Uses react-test-renderer + the
 * enriched react-native mock (host components are stub elements whose
 * type === component name) so we can walk the tree to assert props /
 * children without a real RN runtime.
 */

import React from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer';
import { Button } from '@/components/ui/Button';

function renderButton(props: Partial<React.ComponentProps<typeof Button>> = {}) {
  const finalProps = {
    title: 'Click me',
    onPress: jest.fn(),
    ...props,
  };
  let tree!: ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(<Button {...finalProps} />);
  });
  return { tree, props: finalProps };
}

describe('<Button>', () => {
  it('renders the title text', () => {
    const { tree } = renderButton({ title: 'Save' });
    const txt = tree.root.findAllByType('Text').find((n) => n.children[0] === 'Save');
    expect(txt).toBeDefined();
  });

  it('forwards accessibilityRole="button" and a label derived from title', () => {
    const { tree } = renderButton({ title: 'Save' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.accessibilityLabel).toBe('Save');
  });

  it('uses an explicit accessibilityLabel when provided', () => {
    const { tree } = renderButton({ title: 'Save', accessibilityLabel: 'Save profile changes', variant: 'outline' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.accessibilityLabel).toBe('Save profile changes');
  });

  it('exposes accessibilityState.disabled when disabled', () => {
    const { tree } = renderButton({ title: 'X', disabled: true, variant: 'outline' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.accessibilityState).toEqual({ disabled: true, busy: false });
  });

  it('exposes accessibilityState.busy when loading', () => {
    const { tree } = renderButton({ title: 'X', loading: true, variant: 'outline' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.accessibilityState).toEqual({ disabled: true, busy: true });
  });

  it('renders ActivityIndicator instead of label while loading', () => {
    const { tree } = renderButton({ title: 'X', loading: true, variant: 'outline' });
    const spinner = tree.root.findAllByType('ActivityIndicator');
    expect(spinner.length).toBeGreaterThan(0);
  });

  it('calls onPress when the underlying Pressable fires onPress', () => {
    const onPress = jest.fn();
    const { tree } = renderButton({ title: 'X', onPress, variant: 'outline' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    pressable.props.onPress();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onPress when disabled (the Pressable receives disabled=true)', () => {
    const onPress = jest.fn();
    const { tree } = renderButton({ title: 'X', onPress, disabled: true, variant: 'outline' });
    const pressable = tree.root.findByProps({ accessibilityRole: 'button' });
    expect(pressable.props.disabled).toBe(true);
  });
});
