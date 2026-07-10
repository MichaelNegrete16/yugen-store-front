import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 3/7 — Detalle / selección de producto (placeholder). */
export const ProductDetailScreen: React.FC<
  RootStackScreenProps<'ProductDetail'>
> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      <AppText variant="headlineMd">Producto</AppText>
      <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.hint}>
        ID: {route.params.productId}
      </AppText>
      <Pressable style={styles.button} onPress={() => navigation.navigate('Checkout')}>
        <AppText variant="labelCaps" color="onPrimary">
          Ir a checkout
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

export default ProductDetailScreen;
