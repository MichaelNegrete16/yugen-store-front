import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomerState {
  email: string;
}

const initialState: CustomerState = {
  email: '',
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
  },
});

export const { setCustomerEmail } = customerSlice.actions;

export default customerSlice.reducer;
