import reducer, {
  addItem,
  decrementItem,
  removeItem,
  clearCart,
  selectCartCount,
  CartState,
} from '../src/store/slices/cartSlice';

const empty: CartState = { items: [] };

describe('cartSlice', () => {
  it('agrega un producto nuevo con qty 1', () => {
    const state = reducer(empty, addItem('tea-set'));
    expect(state.items).toEqual([{ productId: 'tea-set', qty: 1 }]);
  });

  it('incrementa qty si el producto ya existe', () => {
    let state = reducer(empty, addItem('tea-set'));
    state = reducer(state, addItem('tea-set'));
    expect(state.items).toEqual([{ productId: 'tea-set', qty: 2 }]);
  });

  it('decrementa y elimina el item al llegar a 0', () => {
    let state = reducer(empty, addItem('tea-set'));
    state = reducer(state, decrementItem('tea-set'));
    expect(state.items).toEqual([]);
  });

  it('elimina un producto con removeItem', () => {
    let state = reducer(empty, addItem('tea-set'));
    state = reducer(state, addItem('matcha-set'));
    state = reducer(state, removeItem('tea-set'));
    expect(state.items).toEqual([{ productId: 'matcha-set', qty: 1 }]);
  });

  it('vacía el carrito con clearCart', () => {
    let state = reducer(empty, addItem('tea-set'));
    state = reducer(state, clearCart());
    expect(state.items).toEqual([]);
  });

  it('selectCartCount suma todas las unidades', () => {
    const items = [
      { productId: 'a', qty: 2 },
      { productId: 'b', qty: 3 },
    ];
    expect(selectCartCount(items)).toBe(5);
    expect(selectCartCount([])).toBe(0);
  });
});
