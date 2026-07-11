import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('../src/api/apiSlice', () => ({ useGetOrdersQuery: jest.fn() }));

import { ProfileScreen } from '../src/screens/ProfileScreen';
import { useGetOrdersQuery } from '../src/api/apiSlice';
import cartReducer from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';
import ordersReducer, { Order } from '../src/store/slices/ordersSlice';
import customerReducer from '../src/store/slices/customerSlice';

const mockOrders = useGetOrdersQuery as unknown as jest.Mock;
const setQuery = (
  data: Order[] | undefined,
  extra: { isFetching?: boolean; isError?: boolean } = {},
) =>
  mockOrders.mockReturnValue({
    data,
    isFetching: extra.isFetching ?? false,
    isError: extra.isError ?? false,
    refetch: jest.fn(),
  });

beforeEach(() => {
  mockOrders.mockReset();
  setQuery(undefined);
});

const makeStore = (orders: Order[] = [], email = '') =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
      orders: ordersReducer,
      customer: customerReducer,
    },
    preloadedState: { orders: { items: orders }, customer: { email } },
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

const order = (over: Partial<Order> = {}): Order => ({
  id: 'YUGEN-1111-1',
  createdAt: '2026-07-10T00:00:00.000Z',
  amountCop: 979650,
  itemCount: 3,
  productIds: ['tea-set'],
  cardLast4: '1111',
  cardBrand: 'Visa',
  status: 'approved',
  ...over,
});

const renderScreen = (store: ReturnType<typeof makeStore>) => {
  const navigation = { goBack: jest.fn(), navigate: jest.fn() } as any;
  const route = { key: 'p', name: 'Profile', params: undefined } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={metrics}>
          <ProfileScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return { tree, navigation, store };
};

describe('ProfileScreen', () => {
  it('sin correo muestra el formulario para ingresarlo', () => {
    const { tree } = renderScreen(makeStore([], ''));
    expect(tree.root.findAllByProps({ testID: 'profile-email' }).length).toBeGreaterThan(0);
    expect(collectText(tree.toJSON()).join(' ')).toContain('Ver mis compras');
  });

  it('guarda el correo al enviarlo', () => {
    const { tree, store } = renderScreen(makeStore([], ''));
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'profile-email' }).props.onChangeText('kenji@example.com'),
    );
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'profile-email-submit' }).props.onPress(),
    );
    expect(store.getState().customer.email).toBe('kenji@example.com');
  });

  it('con correo lista las compras del backend', () => {
    setQuery([
      order({ id: 'YUGEN-1111-1', status: 'approved', amountCop: 979650 }),
      order({ id: 'YUGEN-2222-2', status: 'pending', amountCop: 120000 }),
    ]);
    const { tree } = renderScreen(makeStore([], 'kenji@example.com'));
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Aprobada');
    expect(text).toContain('Pendiente');
    expect(text).toContain('$979.650');
    expect(text).toContain('YUGEN-1111-1');
  });

  it('abre el detalle de la compra al tocarla', () => {
    setQuery([order({ id: 'YUGEN-1111-1' })]);
    const { tree, navigation } = renderScreen(makeStore([], 'kenji@example.com'));
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'order-YUGEN-1111-1' }).props.onPress(),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('TransactionResult', {
      transactionId: 'YUGEN-1111-1',
    });
  });
});
