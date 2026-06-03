import React from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer';
import { Input } from '@/components/ui/Input';

function render(props: React.ComponentProps<typeof Input> = {}) {
  let tree!: ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(<Input {...props} />);
  });
  return tree;
}

describe('<Input>', () => {
  it('renders an optional label', () => {
    const tree = render({ label: 'Email' });
    const labels = tree.root.findAllByType('Text').filter((n) => n.children[0] === 'Email');
    expect(labels).toHaveLength(1);
  });

  it('does not render a label node when label is undefined', () => {
    const tree = render({ placeholder: 'name@example.com' });
    // No "Email"-style label text
    const allTexts = tree.root.findAllByType('Text');
    // Only renders text nodes when label or error is present
    expect(allTexts.length).toBe(0);
  });

  it('uses label as accessibilityLabel when provided', () => {
    const tree = render({ label: 'Username', placeholder: 'unused-as-fallback' });
    const ti = tree.root.findByType('TextInput');
    expect(ti.props.accessibilityLabel).toBe('Username');
  });

  it('falls back to placeholder as accessibilityLabel when no label', () => {
    const tree = render({ placeholder: 'Search...' });
    const ti = tree.root.findByType('TextInput');
    expect(ti.props.accessibilityLabel).toBe('Search...');
  });

  it('renders error text with role="alert" when error is set', () => {
    const tree = render({ error: 'Required' });
    const alert = tree.root.findByProps({ accessibilityRole: 'alert' });
    expect(alert).toBeDefined();
    expect(alert.props.children).toBe('Required');
  });

  it('reflects editable=false via accessibilityState.disabled', () => {
    const tree = render({ editable: false, placeholder: 'x' });
    const ti = tree.root.findByType('TextInput');
    expect(ti.props.accessibilityState).toEqual({ disabled: true });
  });

  it('forwards arbitrary TextInput props (value / onChangeText)', () => {
    const onChangeText = jest.fn();
    const tree = render({ value: 'hello', onChangeText });
    const ti = tree.root.findByType('TextInput');
    expect(ti.props.value).toBe('hello');
    ti.props.onChangeText('world');
    expect(onChangeText).toHaveBeenCalledWith('world');
  });
});
