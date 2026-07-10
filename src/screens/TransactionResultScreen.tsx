import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 7/7 — Estado final de la transacción (placeholder). */
export const TransactionResultScreen: React.FC<
  RootStackScreenProps<'TransactionResult'>
> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <AppText variant="headlineMd">Resultado</AppText>
      <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.hint}>
        Transacción: {route.params.transactionId}
      </AppText>
      <Pressable
        style={styles.button}
        onPress={() => navigation.popTo('Home')}
      >
        <AppText variant="labelCaps" color="onPrimary">
          Volver al inicio
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

export default TransactionResultScreen;
