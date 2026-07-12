import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './config';
import type { Product } from '../data/products';
import type { Order } from '../store/slices/ordersSlice';

/** Ítem de pedido (producto + cantidad) usado en quote y transacción. */
export interface OrderItemInput {
  productId: string;
  qty: number;
}

/** Desglose de precios calculado por el backend (fuente de verdad). */
export interface PriceBreakdown {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface QuoteRequest {
  items: OrderItemInput[];
  discountCode?: string;
}

/** Datos de tarjeta (falsos, con estructura real) para tokenizar en el backend. */
export interface CardPayload {
  number: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  installments?: number;
}

export interface CreateTransactionRequest {
  customer: { email: string; fullName: string; phone?: string };
  shipping: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  items: OrderItemInput[];
  discountCode?: string;
  card: CardPayload;
  acceptanceToken?: string;
}

export type TransactionStatus = 'approved' | 'pending' | 'declined' | 'error';

export interface TransactionResponse {
  reference: string;
  id: string;
  /** Referencia de la transacción en la pasarela de pago (null si fue rechazada antes de crearse). */
  gatewayTransactionId: string | null;
  status: TransactionStatus;
  amountCop: number;
  breakdown: PriceBreakdown;
  cardBrand: string;
  cardLast4: string;
  createdAt: string;
}

/**
 * Servicio API (RTK Query). Genera hooks con loading/error/caché.
 * El polling del estado del pago usa `pollingInterval` (ver Result screen).
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ['Products', 'Orders'],
  endpoints: (builder) => ({
    getProducts: builder.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Products'],
    }),
    getProduct: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
    }),
    quote: builder.mutation<PriceBreakdown, QuoteRequest>({
      query: (body) => ({ url: '/checkout/quote', method: 'POST', body }),
    }),
    createTransaction: builder.mutation<
      TransactionResponse,
      CreateTransactionRequest
    >({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      // Solo stock aquí; "Orders" se invalida tras finalizar el polling
      // (si no, cachearía el estado pending recién creado).
      invalidatesTags: ['Products'],
    }),
    getTransaction: builder.query<TransactionResponse, string>({
      query: (reference) => `/transactions/${reference}`,
    }),
    getOrders: builder.query<Order[], string>({
      query: (email) => `/orders?email=${encodeURIComponent(email)}`,
      providesTags: ['Orders'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useQuoteMutation,
  useCreateTransactionMutation,
  useGetTransactionQuery,
  useLazyGetTransactionQuery,
  useGetOrdersQuery,
} = api;
