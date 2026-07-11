import type {
  NavigatorScreenParams,
  CompositeScreenProps,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/** Pestañas principales (barra inferior persistente). */
export type MainTabParamList = {
  Home: undefined;
  Cart: undefined;
  Profile: undefined;
};

/**
 * Stack raíz. Las secciones principales viven en `Main` (tabs); las pantallas
 * de flujo (detalle, checkout, resultado) se apilan encima con flecha atrás.
 */
export type RootStackParamList = {
  Splash: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  ProductDetail: { productId: string };
  Checkout: undefined;
  TransactionResult: { transactionId: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
