import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SplashScreen } from '../src/screens/SplashScreen';

// Recolecta todos los strings del árbol renderizado.
const collectText = (node: any): string[] => {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return collectText(node.children);
};

describe('SplashScreen', () => {
  const makeNavigation = () => ({ replace: jest.fn() });
  const route = { key: 'splash', name: 'Splash', params: undefined } as any;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renderiza el tagline y la etiqueta de carga', () => {
    const navigation = makeNavigation();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SplashScreen navigation={navigation as any} route={route} />,
      );
    });
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Discover the Beauty of Japan');
    expect(text).toContain('Loading Excellence');
    ReactTestRenderer.act(() => tree.unmount());
  });

  it('navega a Home cuando termina la barra de carga', () => {
    const navigation = makeNavigation();
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <SplashScreen navigation={navigation as any} route={route} />,
      );
    });
    ReactTestRenderer.act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(navigation.replace).toHaveBeenCalledWith('Home');
    ReactTestRenderer.act(() => tree.unmount());
  });
});
