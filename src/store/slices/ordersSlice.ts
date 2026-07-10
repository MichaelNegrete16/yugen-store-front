import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type OrderStatus = 'approved' | 'pending' | 'declined';

/** Un pedido/compra del usuario (para el historial en Perfil). */
export interface Order {
  /** Referencia única (la misma que la transacción). */
  id: string;
  createdAt: string;
  amountCop: number;
  itemCount: number;
  productIds: string[];
  /** Solo últimos 4 dígitos y marca (nunca el número completo). */
  cardLast4: string;
  cardBrand: string;
  status: OrderStatus;
}

export interface OrdersState {
  items: Order[];
}

const initialState: OrdersState = {
  items: [],
};

/**
 * Historial de compras. Se persiste CIFRADO (ver store/index.ts) por contener
 * datos de la transacción, alineado con el requisito de la prueba.
 */
const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    /** Agrega un pedido al inicio del historial (el más reciente primero). */
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
    },
    /** Actualiza el estado de un pedido (usado por el empalme real más adelante). */
    setOrderStatus: (
      state,
      action: PayloadAction<{ id: string; status: OrderStatus }>,
    ) => {
      const order = state.items.find((o) => o.id === action.payload.id);
      if (order) order.status = action.payload.status;
    },
    clearOrders: (state) => {
      state.items = [];
    },
  },
});

export const { addOrder, setOrderStatus, clearOrders } = ordersSlice.actions;

export default ordersSlice.reducer;
