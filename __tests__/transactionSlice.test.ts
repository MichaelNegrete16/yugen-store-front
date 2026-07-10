import reducer, {
  startTransaction,
  setTransactionResult,
  resetTransaction,
  TransactionState,
} from '../src/store/slices/transactionSlice';

const initial: TransactionState = {
  status: 'idle',
  amountCop: 0,
  productIds: [],
};

const card = { last4: '4242', brand: 'VISA', holder: 'Michael Negrete' };

describe('transactionSlice', () => {
  it('startTransaction pone estado en pending con los datos', () => {
    const state = reducer(
      initial,
      startTransaction({
        reference: 'ref-1',
        amountCop: 320000,
        productIds: ['tea-set'],
        card,
      }),
    );
    expect(state.status).toBe('pending');
    expect(state.reference).toBe('ref-1');
    expect(state.amountCop).toBe(320000);
    expect(state.productIds).toEqual(['tea-set']);
    expect(state.card).toEqual(card);
  });

  it('setTransactionResult actualiza estado e id', () => {
    const pending = reducer(
      initial,
      startTransaction({
        reference: 'ref-1',
        amountCop: 320000,
        productIds: ['tea-set'],
        card,
      }),
    );
    const state = reducer(
      pending,
      setTransactionResult({ id: 'txn_123', status: 'approved' }),
    );
    expect(state.status).toBe('approved');
    expect(state.id).toBe('txn_123');
  });

  it('resetTransaction vuelve al estado inicial', () => {
    const pending = reducer(
      initial,
      startTransaction({
        reference: 'ref-1',
        amountCop: 320000,
        productIds: ['tea-set'],
        card,
      }),
    );
    expect(reducer(pending, resetTransaction())).toEqual(initial);
  });
});
