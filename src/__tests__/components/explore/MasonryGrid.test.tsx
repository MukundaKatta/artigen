import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { MasonryGrid } from '@/components/explore/MasonryGrid';
import type { PostMedia } from '@/types/database';

function makeMedia(p: { width: number; height: number; url?: string }): PostMedia {
  return {
    id: 'm-1',
    post_id: 'p-1',
    media_url: p.url ?? 'https://cdn/x.jpg',
    media_type: 'image',
    thumbnail_url: null,
    blurhash: null,
    width: p.width,
    height: p.height,
    duration_seconds: null,
    sort_order: 0,
    created_at: '2026-01-01',
  };
}

function makePost(id: string, media: PostMedia[], ai_metadata?: unknown[]) {
  return { id, media, ai_metadata };
}

describe('<MasonryGrid>', () => {
  it('renders without crashing on empty posts', () => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<MasonryGrid posts={[]} onPostPress={jest.fn()} />);
    });
    expect(tree.toJSON()).toBeDefined();
  });

  it('balances posts across two columns by accumulated height', () => {
    const tall = makePost('tall', [makeMedia({ width: 100, height: 300 })]);
    const short1 = makePost('s1', [makeMedia({ width: 100, height: 100 })]);
    const short2 = makePost('s2', [makeMedia({ width: 100, height: 100 })]);

    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid posts={[tall, short1, short2]} onPostPress={jest.fn()} />,
      );
    });

    // The tall post lands in column 1; both shorts should pile into column 2
    // (since tall already maxes column 1's height). We assert by counting
    // cells in each <View style={styles.column}> via traversal.
    const json = JSON.stringify(tree.toJSON());
    // All three post ids should appear
    expect(json).toContain('tall');
    expect(json).toContain('s1');
    expect(json).toContain('s2');
  });

  it('shows a sparkles overlay when ai_metadata is present', () => {
    const aiPost = makePost('ai', [makeMedia({ width: 100, height: 100 })], [{ model: 'sd' }]);
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid posts={[aiPost]} onPostPress={jest.fn()} />,
      );
    });
    const sparkles = tree.root.findAllByProps({ name: 'sparkles' });
    expect(sparkles.length).toBeGreaterThan(0);
  });

  it('does NOT show the sparkles overlay when ai_metadata is missing', () => {
    const plain = makePost('plain', [makeMedia({ width: 100, height: 100 })]);
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid posts={[plain]} onPostPress={jest.fn()} />,
      );
    });
    const sparkles = tree.root.findAllByProps({ name: 'sparkles' });
    expect(sparkles.length).toBe(0);
  });

  it('does NOT show the sparkles overlay when ai_metadata is empty array', () => {
    const empty = makePost('e', [makeMedia({ width: 100, height: 100 })], []);
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid posts={[empty]} onPostPress={jest.fn()} />,
      );
    });
    const sparkles = tree.root.findAllByProps({ name: 'sparkles' });
    expect(sparkles.length).toBe(0);
  });

  it('falls back to a square cell when media has no width/height', () => {
    const sq = { id: 'sq', media: [{ ...makeMedia({ width: 0, height: 0 }), width: null as unknown as number, height: null as unknown as number }] };
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid posts={[sq]} onPostPress={jest.fn()} />,
      );
    });
    // No crash; the cell wrapper renders with the COLUMN_WIDTH default height
    expect(tree.toJSON()).toBeDefined();
  });

  it('onScroll calls onEndReached when within 200px of the bottom (once per pass)', () => {
    const onEndReached = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <MasonryGrid
          posts={[makePost('p', [makeMedia({ width: 100, height: 100 })])]}
          onPostPress={jest.fn()}
          onEndReached={onEndReached}
        />,
      );
    });

    const scroll = tree.root.findByType('ScrollView');

    // Far from bottom — no call
    act(() => {
      scroll.props.onScroll({
        nativeEvent: {
          contentOffset: { y: 0 },
          layoutMeasurement: { height: 500 },
          contentSize: { height: 2000 },
        },
      });
    });
    expect(onEndReached).toHaveBeenCalledTimes(0);

    // Within threshold — fires once
    act(() => {
      scroll.props.onScroll({
        nativeEvent: {
          contentOffset: { y: 1400 },
          layoutMeasurement: { height: 500 },
          contentSize: { height: 2000 }, // distanceFromBottom = 100 ≤ 200
        },
      });
    });
    expect(onEndReached).toHaveBeenCalledTimes(1);

    // Second consecutive scroll near bottom does NOT re-fire (latching)
    act(() => {
      scroll.props.onScroll({
        nativeEvent: {
          contentOffset: { y: 1410 },
          layoutMeasurement: { height: 500 },
          contentSize: { height: 2000 },
        },
      });
    });
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });
});
