import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { SplashScreen } from '../screens/SplashScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { TransactionResultScreen } from '../screens/TransactionResultScreen';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack principal — flujo de 7 pasos del checkout Yūgen.
 * Splash → Home → ProductDetail → Checkout → TransactionResult.
 * (Datos de tarjeta y resumen son backdrops dentro de Checkout.)
 */
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen
        name="TransactionResult"
        component={TransactionResultScreen}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
