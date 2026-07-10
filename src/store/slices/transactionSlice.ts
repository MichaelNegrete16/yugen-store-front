import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TransactionStatus =
  | 'idle'
  | 'pending'
  | 'approved'
  | 'declined'
  | 'error';

export interface CardInfo {
  /** Últimos 4 dígitos (nunca el número completo). */
  last4: string;
  brand: string;
  holder: string;
}

export interface TransactionState {
  id?: string;
  reference?: string;
  status: TransactionStatus;
  amountCop: number;
  productIds: string[];
  card?: CardInfo;
  updatedAt?: string;
}

const initialState: TransactionState = {
  status: 'idle',
  amountCop: 0,
  productIds: [],
};

/**
 * Transacción de pago. Estos datos se persisten ENCRIPTADOS
 * (ver configuración de redux-persist en store/index.ts).
 */
const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    startTransaction: (
      state,
      action: PayloadAction<{
        reference: string;
        amountCop: number;
        productIds: string[];
        card: CardInfo;
      }>,
    ) => {
      state.status = 'pending';
      state.reference = action.payload.reference;
      state.amountCop = action.payload.amountCop;
      state.productIds = action.payload.productIds;
      state.card = action.payload.card;
      state.id = undefined;
    },
    setTransactionResult: (
      state,
      action: PayloadAction<{
        id?: string;
        status: TransactionStatus;
        updatedAt?: string;
      }>,
    ) => {
      state.status = action.payload.status;
      if (action.payload.id) state.id = action.payload.id;
      state.updatedAt = action.payload.updatedAt;
    },
    resetTransaction: () => initialState,
  },
});

export const { startTransaction, setTransactionResult, resetTransaction } =
  transactionSlice.actions;

export default transactionSlice.reducer;
