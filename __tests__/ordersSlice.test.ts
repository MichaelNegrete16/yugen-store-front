import ordersReducer, {
  addOrder,
  setOrderStatus,
  clearOrders,
  Order,
} from '../src/store/slices/ordersSlice';

const makeOrder = (id: string): Order => ({
  id,
  createdAt: '2026-07-10T00:00:00.000Z',
  amountCop: 100000,
  itemCount: 2,
  productIds: ['tea-set'],
  cardLast4: '1111',
  cardBrand: 'Visa',
  status: 'approved',
});

describe('ordersSlice', () => {
  it('agrega un pedido al inicio (más reciente primero)', () => {
    let state = ordersReducer(undefined, addOrder(makeOrder('A')));
    state = ordersReducer(state, addOrder(makeOrder('B')));
    expect(state.items.map((o) => o.id)).toEqual(['B', 'A']);
  });

  it('actualiza el estado de un pedido', () => {
    let state = ordersReducer(undefined, addOrder(makeOrder('A')));
    state = ordersReducer(state, setOrderStatus({ id: 'A', status: 'declined' }));
    expect(state.items[0].status).toBe('declined');
  });

  it('ignora setOrderStatus si el id no existe', () => {
    let state = ordersReducer(undefined, addOrder(makeOrder('A')));
    state = ordersReducer(state, setOrderStatus({ id: 'X', status: 'pending' }));
    expect(state.items[0].status).toBe('approved');
  });

  it('limpia el historial', () => {
    let state = ordersReducer(undefined, addOrder(makeOrder('A')));
    state = ordersReducer(state, clearOrders());
    expect(state.items).toHaveLength(0);
  });
});
