import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Rutas del stack principal — mapea el flujo de 7 pasos del checkout.
 *
 * Notas:
 * - Los pasos 5 (datos de tarjeta) y 6 (resumen de pago) son BACKDROPS
 *   que se muestran sobre la pantalla Checkout, no rutas del stack.
 * - Los params se irán refinando cuando exista Redux (carrito, transacción).
 */
export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  TransactionResult: { transactionId: string };
};

/** Helper de props tipadas por pantalla. */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
