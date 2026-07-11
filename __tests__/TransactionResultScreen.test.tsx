import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionResultScreen } from '../src/screens/TransactionResultScreen';
import cartReducer from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';
import ordersReducer, { Order } from '../src/store/slices/ordersSlice';

const order: Order = {
  id: 'YUGEN-1111-1',
  createdAt: '2026-07-10T00:48:00.000Z',
  amountCop: 3383100,
  itemCount: 10,
  productIds: ['tea-set', 'writing-set'],
  cardLast4: '1111',
  cardBrand: 'Visa',
  status: 'approved',
};

const makeStore = (orders: Order[] = [order]) =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
      orders: ordersReducer,
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

const renderScreen = (store: ReturnType<typeof makeStore>, transactionId = 'YUGEN-1111-1') => {
  const navigation = { navigate: jest.fn(), popTo: jest.fn() } as any;
  const route = { key: 'r', name: 'TransactionResult', params: { transactionId } } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={store}>
        <SafeAreaProvider initialMetrics={metrics}>
          <TransactionResultScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return { tree, navigation };
};

describe('TransactionResultScreen', () => {
  it('muestra el resumen detallado de una compra aprobada', () => {
    const { tree } = renderScreen(makeStore());
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('¡Pago aprobado!');
    expect(text).toContain('YUGEN-1111-1');
    expect(text).toContain('Visa ••1111');
    expect(text).toContain('Juego de Té de Basalto');
    const total = tree.root.findByProps({ testID: 'result-total' });
    expect(collectText(total.props.children).join('')).toContain('$3.383.100');
  });

  it('muestra el encabezado según el estado (rechazada)', () => {
    const { tree } = renderScreen(makeStore([{ ...order, status: 'declined' }]));
    expect(collectText(tree.toJSON()).join(' ')).toContain('Pago rechazado');
  });

  it('los botones llevan a Perfil e Inicio', () => {
    const { tree, navigation } = renderScreen(makeStore());
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'see-orders' }).props.onPress(),
    );
    expect(navigation.navigate).toHaveBeenCalledWith('Main', { screen: 'Profile' });
  });

  it('no rompe si no encuentra el pedido', () => {
    const { tree } = renderScreen(makeStore([]), 'DESCONOCIDO');
    expect(collectText(tree.toJSON()).join(' ')).toContain('DESCONOCIDO');
  });
});
