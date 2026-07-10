import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CheckoutScreen } from '../src/screens/CheckoutScreen';
import cartReducer, { CartItem } from '../src/store/slices/cartSlice';
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

  it('lista artículos con artesano y cantidad', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 2 }]);
    const { tree } = renderScreen(store);
    // La línea del artículo existe con su testID.
    expect(tree.root.findAllByProps({ testID: 'item-tea-set' }).length).toBeGreaterThan(0);
    const all = collectText(tree.toJSON()).join(' ').replace(/\s+/g, ' ');
    expect(all).toContain('Juego de Té de Basalto');
    expect(all).toContain('Artesano: Kenzo Tanaka');
    expect(all).toContain('Cantidad: 2');
  });

  it('calcula el gran total (subtotal + envío + IVA − descuento)', () => {
    // 320.000 x 2 + 245.000 = 885.000 subtotal
    // + 15.000 envío + 168.150 IVA − 88.500 descuento = 979.650
    const store = makeStore([
      { productId: 'tea-set', qty: 2 },
      { productId: 'writing-set', qty: 1 },
    ]);
    const { tree } = renderScreen(store);
    const total = tree.root.findByProps({ testID: 'grand-total' });
    expect(collectText(total.props.children).join('')).toContain('$979.650');
  });

  it('abre el drawer de pago al presionar "Pagar con tarjeta"', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree } = renderScreen(store);
    // Antes de abrir no existe el formulario de tarjeta.
    expect(tree.root.findAllByProps({ testID: 'input-number' })).toHaveLength(0);
    const pay = tree.root.findByProps({ testID: 'pay-button' });
    ReactTestRenderer.act(() => pay.props.onPress());
    expect(tree.root.findAllByProps({ testID: 'input-number' }).length).toBeGreaterThan(0);
  });

  it('confirma el pago: inicia la transacción y navega al resultado', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);

    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'pay-button' }).props.onPress(),
    );

    const setField = (testID: string, value: string) => {
      const input = tree.root.findByProps({ testID });
      ReactTestRenderer.act(() => input.props.onChangeText(value));
    };
    setField('input-number', '4111111111111111');
    setField('input-holder', 'Kenji Sato');
    setField('input-expiry', '1226');
    setField('input-cvv', '123');

    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'confirm-payment' }).props.onPress(),
    );

    const tx = store.getState().transaction;
    expect(tx.status).toBe('pending');
    expect(tx.card).toEqual({ last4: '1111', brand: 'Visa', holder: 'Kenji Sato' });
    // El monto de la transacción es el gran total (con envío + IVA − descuento).
    expect(tx.amountCop).toBeGreaterThan(0);
    expect(navigation.navigate).toHaveBeenCalledWith(
      'TransactionResult',
      expect.objectContaining({ transactionId: expect.stringContaining('YUGEN-1111') }),
    );
  });

  it('no confirma con datos de tarjeta incompletos', () => {
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'pay-button' }).props.onPress(),
    );
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'confirm-payment' }).props.onPress(),
    );
    expect(store.getState().transaction.status).toBe('idle');
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
