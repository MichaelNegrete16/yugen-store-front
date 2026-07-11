import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { RemoteImage } from '../src/components/RemoteImage';

const collectText = (node: any): string[] => {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return collectText(node.children);
};

describe('RemoteImage', () => {
  it('muestra el placeholder "Sin imagen" cuando no hay URL', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(<RemoteImage uri={undefined} />);
    });
    expect(collectText(tree.toJSON()).join(' ')).toContain('Sin imagen');
  });

  it('no muestra placeholder cuando hay URL válida', () => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <RemoteImage uri="https://example.com/foto.jpg" />,
      );
    });
    expect(collectText(tree.toJSON()).join(' ')).not.toContain('Sin imagen');
  });
});
