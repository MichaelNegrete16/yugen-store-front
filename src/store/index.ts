import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import cartReducer from './slices/cartSlice';
import transactionReducer from './slices/transactionSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';
import { api } from '../api/apiSlice';

/**
 * Clave de cifrado para los datos persistidos sensibles (transacción).
 * NOTA: en producción debe venir de una fuente segura (env / Keystore),
 * no hardcodeada. Se deja constante solo para el contexto de esta prueba.
 */
const ENCRYPTION_KEY = 'yugen-store-persist-key-v1';

const encrypt = encryptTransform({
  secretKey: ENCRYPTION_KEY,
  onError: (error) => {
    // eslint-disable-next-line no-console
    console.warn('Error cifrando estado persistido:', error);
  },
});

// El carrito se persiste normal; la transacción y los pedidos, CIFRADOS.
const cartPersistConfig = { key: 'cart', storage: AsyncStorage };
const transactionPersistConfig = {
  key: 'transaction',
  storage: AsyncStorage,
  transforms: [encrypt],
};
const ordersPersistConfig = {
  key: 'orders',
  storage: AsyncStorage,
  transforms: [encrypt],
};

const rootReducer = combineReducers({
  cart: persistReducer(cartPersistConfig, cartReducer),
  transaction: persistReducer(transactionPersistConfig, transactionReducer),
  orders: persistReducer(ordersPersistConfig, ordersReducer),
  products: productsReducer,
  // Caché de RTK Query (no se persiste).
  [api.reducerPath]: api.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Acciones internas de redux-persist que no son serializables.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
