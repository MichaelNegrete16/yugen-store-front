import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('../src/api/apiSlice', () => ({
  useGetProductQuery: jest.fn(() => ({ data: undefined })),
}));

import { ProductDetailScreen } from '../src/screens/ProductDetailScreen';
import cartReducer, { selectCartCount } from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
    },
  });

const metrics = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const collectText = (node: any): string[] => {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return collectText(node.children);
};

const renderScreen = (store: ReturnType<typeof makeStore>) => {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() } as any;
  const route = {
    key: 'p',
    name: 'ProductDetail',
    params: { productId: 'tea-set' },
  } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={metrics}>
          <ProductDetailScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return Object.assign(tree, { navigation });
};

describe('ProductDetailScreen', () => {
  it('muestra nombre y precio del producto', () => {
    const tree = renderScreen(makeStore());
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Juego de Té de Basalto');
    expect(text).toContain('$320.000');
  });

  it('agrega al carrito al presionar el botón', () => {
    const store = makeStore();
    const tree = renderScreen(store);
    const button = tree.root.findByProps({ testID: 'add-to-cart' });
    ReactTestRenderer.act(() => button.props.onPress());
    expect(selectCartCount(store.getState().cart.items)).toBe(1);
  });

  it('el ícono del carrito lleva al Cart', () => {
    const tree = renderScreen(makeStore());
    const cart = tree.root.findByProps({ accessibilityLabel: 'Ver carrito' });
    ReactTestRenderer.act(() => cart.props.onPress());
    expect((tree as any).navigation.navigate).toHaveBeenCalledWith('Cart');
  });
});
