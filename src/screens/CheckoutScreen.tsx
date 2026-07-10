import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/**
 * Paso 4/7 — Checkout (placeholder).
 * Aquí irá el botón "Pagar con tarjeta" que abre el backdrop (pasos 5 y 6).
 */
export const CheckoutScreen: React.FC<RootStackScreenProps<'Checkout'>> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <AppText variant="headlineMd">Checkout</AppText>
      <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.hint}>
        Resumen y pago
      </AppText>
      <Pressable
        style={styles.button}
        onPress={() =>
          navigation.navigate('TransactionResult', { transactionId: 'demo' })
        }
      >
        <AppText variant="labelCaps" color="onPrimary">
          Pagar con tarjeta
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.marginMobile,
  },
  hint: { marginTop: theme.spacing.stackSm, marginBottom: theme.spacing.stackLg },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.stackSm,
    paddingHorizontal: theme.spacing.stackMd,
    borderRadius: theme.radius.full,
  },
});

export default CheckoutScreen;
