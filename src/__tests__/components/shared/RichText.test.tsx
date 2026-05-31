import React from 'react';
import TestRenderer, { type ReactTestRenderer, act } from 'react-test-renderer';
import { RichText } from '@/components/shared/RichText';

function render(props: React.ComponentProps<typeof RichText>) {
  let tree!: ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<RichText {...props} />);
  });
  return tree;
}

describe('<RichText>', () => {
  it('renders plain text as a single text run', () => {
    const tree = render({ children: 'Just plain text' });
    // Outer Text + 1 part Text = 2 nodes
    const all = tree.root.findAllByType('Text');
    expect(all.length).toBeGreaterThanOrEqual(1);
    const joined = tree.toJSON();
    expect(JSON.stringify(joined)).toContain('Just plain text');
  });

  it('renders the optional username before the body', () => {
    const tree = render({ children: 'Hello', username: 'alice' });
    expect(JSON.stringify(tree.toJSON())).toContain('alice');
  });

  it('renders @mentions as separate pressable text runs', () => {
    const tree = render({ children: 'hey @bob nice work' });
    // The mention part should have onPress
    const mentions = tree.root
      .findAllByType('Text')
      .filter((n) => n.props.children === '@bob' && typeof n.props.onPress === 'function');
    expect(mentions).toHaveLength(1);
  });

  it('renders #hashtags as separate pressable text runs', () => {
    const tree = render({ children: 'check #art today' });
    const tags = tree.root
      .findAllByType('Text')
      .filter((n) => n.props.children === '#art' && typeof n.props.onPress === 'function');
    expect(tags).toHaveLength(1);
  });

  it('handles mixed @mention + #hashtag in one string', () => {
    const tree = render({ children: 'shoutout to @alice for #cyberpunk' });
    const json = JSON.stringify(tree.toJSON());
    expect(json).toContain('@alice');
    expect(json).toContain('#cyberpunk');
  });

  it('keys parts stably (type+text+index) — no duplicate-key warning', () => {
    // Spy on console.error to detect React key warnings
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render({ children: 'one @x two @x three #y #y end' });
    const calls = errSpy.mock.calls.map((c) => String(c[0]));
    expect(calls.some((m) => m.includes('Encountered two children with the same key'))).toBe(false);
    errSpy.mockRestore();
  });
});
