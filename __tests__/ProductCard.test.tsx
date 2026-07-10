import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { ProductCard } from '../src/components/ProductCard';
import { PRODUCTS } from '../src/data/products';

const collectText = (node: any): string[] => {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return collectText(node.children);
};

describe('ProductCard', () => {
  const product = PRODUCTS[0]; // $320.000

  it('muestra nombre y precio formateado en COP', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProductCard product={product} onPress={jest.fn()} />,
      );
    });
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain(product.name);
    expect(text).toContain('$320.000');
  });

  it('llama onPress al tocar la tarjeta', () => {
    const onPress = jest.fn();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ProductCard product={product} onPress={onPress} />,
      );
    });
    const card = tree.root.findByProps({ testID: 'product-card' });
    ReactTestRenderer.act(() => card.props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
