import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CartScreen } from '../src/screens/CartScreen';
import cartReducer, { CartItem, selectCartCount } from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';
import { PRODUCTS, Product } from '../src/data/products';

const withStock = (id: string, stock: number): Product[] =>
  PRODUCTS.map((p) => (p.id === id ? { ...p, stock } : p));

const makeStore = (cartItems: CartItem[] = [], products: Product[] = PRODUCTS) =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
    },
    preloadedState: {
      cart: { items: cartItems },
      products: { items: products },
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
  const route = { key: 'cart', name: 'Cart', params: undefined } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={metrics}>
          <CartScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return { tree, navigation };
};

describe('CartScreen', () => {
  it('muestra el estado vacío cuando no hay ítems', () => {
    const { tree } = renderScreen(makeStore());
    expect(collectText(tree.toJSON()).join(' ')).toContain('Tu carrito está vacío');
  });

  it('lista los ítems y calcula el subtotal', () => {
    const store = makeStore([
      { productId: 'tea-set', qty: 2 }, // 640.000
      { productId: 'writing-set', qty: 1 }, // 245.000
    ]);
    const { tree } = renderScreen(store);
    expect(collectText(tree.toJSON()).join(' ')).toContain('Juego de Té de Basalto');
    const subtotal = tree.root.findByProps({ testID: 'cart-subtotal' });
    expect(collectText(subtotal.props.children).join('')).toContain('$885.000');
  });

  it('aumenta y disminuye la cantidad de una línea', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree } = renderScreen(store);
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ accessibilityLabel: 'Aumentar Juego de Té de Basalto' }).props.onPress(),
    );
    expect(selectCartCount(store.getState().cart.items)).toBe(2);
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ accessibilityLabel: 'Disminuir Juego de Té de Basalto' }).props.onPress(),
    );
    expect(selectCartCount(store.getState().cart.items)).toBe(1);
  });

  it('quita una línea del carrito', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree } = renderScreen(store);
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ accessibilityLabel: 'Quitar Juego de Té de Basalto' }).props.onPress(),
    );
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it('continúa al checkout', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'continue-button' }).props.onPress(),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Checkout');
  });

  it('marca el artículo agotado y no lo suma al subtotal', () => {
    const store = makeStore(
      [
        { productId: 'tea-set', qty: 2 }, // agotado → no suma
        { productId: 'writing-set', qty: 1 }, // 245.000
      ],
      withStock('tea-set', 0),
    );
    const { tree } = renderScreen(store);
    const all = collectText(tree.toJSON()).join(' ');
    expect(all).toContain('Agotado');
    const subtotal = tree.root.findByProps({ testID: 'cart-subtotal' });
    expect(collectText(subtotal.props.children).join('')).toContain('$245.000');
  });

  it('deshabilita continuar cuando todo está agotado', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }], withStock('tea-set', 0));
    const { tree } = renderScreen(store);
    expect(
      tree.root.findByProps({ testID: 'continue-button' }).props.accessibilityState,
    ).toEqual({ disabled: true });
  });
});
