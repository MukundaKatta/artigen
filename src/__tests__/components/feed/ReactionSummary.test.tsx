import React from 'react';
import TestRenderer, { type ReactTestRenderer } from 'react-test-renderer';
import { ReactionSummary } from '@/components/feed/ReactionSummary';
import type { ReactionSummary as ReactionSummaryType } from '@/types';

function render(summary: ReactionSummaryType[], totalCount: number) {
  let tree!: ReactTestRenderer;
  TestRenderer.act(() => {
    tree = TestRenderer.create(<ReactionSummary summary={summary} totalCount={totalCount} />);
  });
  return tree;
}

describe('<ReactionSummary>', () => {
  it('renders nothing when totalCount is 0', () => {
    const tree = render([], 0);
    expect(tree.toJSON()).toBeNull();
  });

  it('renders nothing when summary array is empty (even if totalCount > 0)', () => {
    const tree = render([], 5);
    expect(tree.toJSON()).toBeNull();
  });

  it('renders only the top 3 reactions when more are provided', () => {
    const tree = render(
      [
        { type: 'love', count: 10 },
        { type: 'fire', count: 8 },
        { type: 'wow', count: 5 },
        { type: 'laugh', count: 2 },
        { type: 'sad', count: 1 },
      ] as unknown as ReactionSummaryType[],
      26,
    );
    // Emoji rendered with key={type} on Text — search for elements whose key matches one of top 3
    const allText = tree.root.findAllByType('Text');
    // 3 emoji Texts + 1 count Text = 4 total
    expect(allText.length).toBe(4);
  });

  it('shows singular "reaction" when totalCount is 1', () => {
    const tree = render([{ type: 'love', count: 1 }] as unknown as ReactionSummaryType[], 1);
    const countText = tree.root
      .findAllByType('Text')
      .map((n) => n.props.children)
      .find((c) => Array.isArray(c) && c[2] === 'reaction');
    expect(countText).toBeDefined();
  });

  it('shows plural "reactions" when totalCount > 1', () => {
    const tree = render([{ type: 'love', count: 5 }] as unknown as ReactionSummaryType[], 5);
    const countText = tree.root
      .findAllByType('Text')
      .map((n) => n.props.children)
      .find((c) => Array.isArray(c) && c[2] === 'reactions');
    expect(countText).toBeDefined();
  });
});
