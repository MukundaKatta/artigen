/**
 * Smoke tests for the PriceTag primitive.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { PriceTag } from '@/components/ui/PriceTag';

function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(node);
  });
  return tree;
}

describe('PriceTag', () => {
  it('renders the formatted currency value', () => {
    const tree = render(<PriceTag amount={49} currency="USD" />);
    const texts = tree.root.findAllByType('Text').map((t) => t.props.children);
    expect(texts.some((t) => typeof t === 'string' && t.includes('49'))).toBe(true);
  });

  it('shows the compareAt value crossed out when on sale', () => {
    const tree = render(<PriceTag amount={49} compareAt={99} />);
    const texts = tree.root.findAllByType('Text');
    const compare = texts.find(
      (t) => typeof t.props.children === 'string' && t.props.children.includes('99'),
    );
    expect(compare).toBeTruthy();
    // SALE pill renders only on sale
    const sale = tree.root.findAllByType('Text').find((t) => t.props.children === 'SALE');
    expect(sale).toBeTruthy();
  });

  it('does not render SALE pill when compareAt <= amount', () => {
    const tree = render(<PriceTag amount={99} compareAt={99} />);
    const sale = tree.root.findAllByType('Text').find((t) => t.props.children === 'SALE');
    expect(sale).toBeFalsy();
  });
});
