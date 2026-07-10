import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckoutScreen } from '../src/screens/CheckoutScreen';
import cartReducer, {
  CartItem,
  selectCartCount,
} from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';

const makeStore = (cartItems: CartItem[] = []) =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
    },
    preloadedState: { cart: { items: cartItems } },
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
  const route = { key: 'c', name: 'Checkout', params: undefined } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={metrics}>
          <CheckoutScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return { tree, navigation };
};

describe('CheckoutScreen', () => {
  it('muestra el estado vacío cuando no hay ítems', () => {
    const { tree } = renderScreen(makeStore());
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Tu carrito está vacío');
  });

  it('lista los ítems y calcula el total', () => {
    const store = makeStore([
      { productId: 'tea-set', qty: 2 }, // 320.000 x 2 = 640.000
      { productId: 'writing-set', qty: 1 }, // 245.000
    ]);
    const { tree } = renderScreen(store);
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Juego de Té de Basalto');
    expect(text).toContain('Set de Escritura en Ebonita');
    // Total = 640.000 + 245.000 = 885.000
    const total = tree.root.findByProps({ testID: 'cart-total' });
    expect(collectText(total.props.children).join('')).toContain('$885.000');
  });

  it('aumenta y disminuye la cantidad de una línea', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree } = renderScreen(store);
    const inc = tree.root.findByProps({
      accessibilityLabel: 'Aumentar Juego de Té de Basalto',
    });
    ReactTestRenderer.act(() => inc.props.onPress());
    expect(selectCartCount(store.getState().cart.items)).toBe(2);
    const dec = tree.root.findByProps({
      accessibilityLabel: 'Disminuir Juego de Té de Basalto',
    });
    ReactTestRenderer.act(() => dec.props.onPress());
    expect(selectCartCount(store.getState().cart.items)).toBe(1);
  });

  it('quita una línea del carrito', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree } = renderScreen(store);
    const remove = tree.root.findByProps({ accessibilityLabel: 'Quitar Juego de Té de Basalto' });
    ReactTestRenderer.act(() => remove.props.onPress());
    expect(store.getState().cart.items).toHaveLength(0);
  });

  it('navega al resultado al pagar', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);
    const pay = tree.root.findByProps({ testID: 'pay-button' });
    ReactTestRenderer.act(() => pay.props.onPress());
    expect(navigation.navigate).toHaveBeenCalledWith(
      'TransactionResult',
      expect.objectContaining({ transactionId: expect.any(String) }),
    );
  });
});
