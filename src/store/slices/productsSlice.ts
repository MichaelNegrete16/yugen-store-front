import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PRODUCTS, Product } from '../../data/products';

export interface ProductsState {
  items: Product[];
}

const initialState: ProductsState = {
  // Catálogo mock inicial (se reemplazará por el que sirva el backend).
  items: PRODUCTS,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    decrementStock: (
      state,
      action: PayloadAction<{ productId: string; qty: number }>,
    ) => {
      const product = state.items.find(
        (p) => p.id === action.payload.productId,
      );
      if (product) {
        product.stock = Math.max(0, product.stock - action.payload.qty);
      }
    },
  },
});

export const { setProducts, decrementStock } = productsSlice.actions;

export default productsSlice.reducer;
