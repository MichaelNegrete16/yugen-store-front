import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';

jest.mock('../src/api/apiSlice', () => ({
  useGetOrdersQuery: jest.fn(() => ({ data: undefined })),
}));

import { ProfileScreen } from '../src/screens/ProfileScreen';
import cartReducer from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';
import ordersReducer, { Order } from '../src/store/slices/ordersSlice';
import customerReducer from '../src/store/slices/customerSlice';

const makeStore = (orders: Order[] = []) =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
      orders: ordersReducer,
      customer: customerReducer,
    },
    preloadedState: { orders: { items: orders } },
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
  return { tree, navigation };
};

describe('ProfileScreen', () => {
  it('muestra el estado vacío sin compras', () => {
    const { tree } = renderScreen(makeStore());
    expect(collectText(tree.toJSON()).join(' ')).toContain('Aún no tienes compras');
  });

  it('lista las compras con su estado y total', () => {
    const { tree } = renderScreen(
      makeStore([
        order({ id: 'YUGEN-1111-1', status: 'approved', amountCop: 979650 }),
        order({ id: 'YUGEN-2222-2', status: 'pending', amountCop: 120000 }),
      ]),
    );
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Aprobada');
    expect(text).toContain('Pendiente');
    expect(text).toContain('$979.650');
    expect(text).toContain('YUGEN-1111-1');
  });

  it('abre el detalle de la compra al tocarla', () => {
    const { tree, navigation } = renderScreen(makeStore([order({ id: 'YUGEN-1111-1' })]));
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'order-YUGEN-1111-1' }).props.onPress(),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('TransactionResult', {
      transactionId: 'YUGEN-1111-1',
    });
  });
});
