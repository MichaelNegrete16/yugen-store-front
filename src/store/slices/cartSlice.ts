import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  qty: number;
}

export interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

/**
 * Carrito de compras (arquitectura Flux via Redux Toolkit).
 */
const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((i) => i.productId === action.payload);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ productId: action.payload, qty: 1 });
      }
    },
    addToCart: (
      state,
      action: PayloadAction<{ productId: string; qty: number }>,
    ) => {
      const { productId, qty } = action.payload;
      if (qty <= 0) return;
      const existing = state.items.find((i) => i.productId === productId);
      if (existing) {
        existing.qty += qty;
      } else {
        state.items.push({ productId, qty });
      }
    },
    decrementItem: (state, action: PayloadAction<string>) => {
      const existing = state.items.find((i) => i.productId === action.payload);
      if (!existing) return;
      existing.qty -= 1;
      if (existing.qty <= 0) {
        state.items = state.items.filter((i) => i.productId !== action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, addToCart, decrementItem, removeItem, clearCart } =
  cartSlice.actions;

/** Número total de unidades en el carrito. */
export const selectCartCount = (items: CartItem[]): number =>
  items.reduce((sum, i) => sum + i.qty, 0);

export default cartSlice.reducer;
