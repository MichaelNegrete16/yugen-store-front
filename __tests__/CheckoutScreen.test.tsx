import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('../src/api/apiSlice', () => ({
  useCreateTransactionMutation: jest.fn(),
  useLazyGetTransactionQuery: jest.fn(),
  useQuoteMutation: jest.fn(),
  api: { util: { invalidateTags: jest.fn(() => ({ type: 'api/invalidateTags' })) } },
}));
jest.mock('../src/utils/toast', () => ({ showToast: jest.fn() }));

import { CheckoutScreen } from '../src/screens/CheckoutScreen';
import {
  useCreateTransactionMutation,
  useLazyGetTransactionQuery,
  useQuoteMutation,
} from '../src/api/apiSlice';
import { showToast } from '../src/utils/toast';
import cartReducer, { CartItem } from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';
import ordersReducer from '../src/store/slices/ordersSlice';

const mockCreate = useCreateTransactionMutation as unknown as jest.Mock;
const mockPoll = useLazyGetTransactionQuery as unknown as jest.Mock;
const mockQuote = useQuoteMutation as unknown as jest.Mock;
const mockShowToast = showToast as unknown as jest.Mock;

const BASE = {
  reference: 'YUGEN-4242-1',
  id: 'txn1',
  amountCop: 395800,
  breakdown: { subtotal: 320000, shipping: 15000, tax: 60800, discount: 0, total: 395800 },
  cardBrand: 'VISA',
  cardLast4: '4242',
  createdAt: '2026-07-10T12:00:00.000Z',
};

const setFlow = (finalStatus: string, rejectCreate = false) => {
  const createTrigger = jest.fn(() => ({
    unwrap: () =>
      rejectCreate
        ? Promise.reject(new Error('net'))
        : Promise.resolve({ ...BASE, status: 'pending' }),
  }));
  mockCreate.mockReturnValue([createTrigger, { isLoading: false }]);
  const pollTrigger = jest.fn(() => ({
    unwrap: () => Promise.resolve({ ...BASE, status: finalStatus }),
  }));
  mockPoll.mockReturnValue([pollTrigger]);
  return { createTrigger, pollTrigger };
};

beforeEach(() => {
  mockCreate.mockReset();
  mockPoll.mockReset();
  mockQuote.mockReset();
  mockShowToast.mockReset();
  // El quote cae al cálculo local en tests (rechaza), para asertar montos locales.
  mockQuote.mockReturnValue([
    jest.fn(() => ({ unwrap: () => Promise.reject(new Error('no quote')) })),
    {},
  ]);
  setFlow('approved');
});

const makeStore = (cartItems: CartItem[] = []) =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
      orders: ordersReducer,
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

const setField = (tree: ReactTestRenderer.ReactTestRenderer, testID: string, value: string) => {
  const input = tree.root.findByProps({ testID });
  ReactTestRenderer.act(() => input.props.onChangeText(value));
};

const fillShipping = (tree: ReactTestRenderer.ReactTestRenderer) => {
  setField(tree, 'ship-email', 'kenji@example.com');
  setField(tree, 'ship-firstName', 'Kenji');
  setField(tree, 'ship-lastName', 'Sato');
  setField(tree, 'ship-address', 'Calle 10 # 5-51');
  setField(tree, 'ship-city', 'Bogotá');
  setField(tree, 'ship-postal', '110111');
};

const fillCard = (tree: ReactTestRenderer.ReactTestRenderer, number: string) => {
  setField(tree, 'input-number', number);
  setField(tree, 'input-holder', 'Kenji Sato');
  setField(tree, 'input-expiry', '1228');
  setField(tree, 'input-cvv', '123');
};

const pay = async (tree: ReactTestRenderer.ReactTestRenderer, cardNumber: string) => {
  fillShipping(tree);
  ReactTestRenderer.act(() =>
    tree.root.findByProps({ testID: 'pay-button' }).props.onPress(),
  );
  fillCard(tree, cardNumber);
  await ReactTestRenderer.act(async () => {
    tree.root.findByProps({ testID: 'confirm-payment' }).props.onPress();
  });
};

describe('CheckoutScreen', () => {
  it('muestra el estado vacío cuando no hay ítems', () => {
    const { tree } = renderScreen(makeStore());
    expect(collectText(tree.toJSON()).join(' ')).toContain('Tu carrito está vacío');
  });

  it('lista artículos con artesano y cantidad', () => {
    const { tree } = renderScreen(makeStore([{ productId: 'tea-set', qty: 2 }]));
    const all = collectText(tree.toJSON()).join(' ').replace(/\s+/g, ' ');
    expect(all).toContain('Juego de Té de Basalto');
    expect(all).toContain('Artesano: Kenzo Tanaka');
    expect(all).toContain('Cantidad: 2');
  });

  it('calcula el gran total (subtotal + envío + IVA − descuento)', () => {
    const store = makeStore([
      { productId: 'tea-set', qty: 2 },
      { productId: 'writing-set', qty: 1 },
    ]);
    const { tree } = renderScreen(store);
    const total = tree.root.findByProps({ testID: 'grand-total' });
    expect(collectText(total.props.children).join('')).toContain('$979.650');
  });

  it('no habilita el pago sin datos de envío (incluye correo)', () => {
    const { tree } = renderScreen(makeStore([{ productId: 'tea-set', qty: 1 }]));
    expect(
      tree.root.findByProps({ testID: 'pay-button' }).props.accessibilityState,
    ).toEqual({ disabled: true });
    fillShipping(tree);
    expect(
      tree.root.findByProps({ testID: 'pay-button' }).props.accessibilityState,
    ).toEqual({ disabled: false });
  });

  it('pago aprobado: crea, hace polling, registra la compra, vacía el carrito y navega', async () => {
    const { createTrigger, pollTrigger } = setFlow('approved');
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);

    await pay(tree, '4242424242424242');

    expect(createTrigger).toHaveBeenCalledTimes(1);
    expect(pollTrigger).toHaveBeenCalled();
    const state = store.getState();
    expect(state.orders.items[0]).toMatchObject({ id: 'YUGEN-4242-1', status: 'approved' });
    expect(state.cart.items).toHaveLength(0);
    expect(navigation.navigate).toHaveBeenCalledWith('TransactionResult', {
      transactionId: 'YUGEN-4242-1',
    });
  });

  it('pago rechazado: muestra toast, no navega y conserva el carrito', async () => {
    setFlow('declined');
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);

    await pay(tree, '4111111111111111');

    expect(mockShowToast).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().orders.items).toHaveLength(0);
  });

  it('error de red: muestra toast y no navega', async () => {
    setFlow('approved', true);
    const store = makeStore([{ productId: 'tea-set', qty: 1 }]);
    const { tree, navigation } = renderScreen(store);

    await pay(tree, '4242424242424242');

    expect(mockShowToast).toHaveBeenCalled();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
