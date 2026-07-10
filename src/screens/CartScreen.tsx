import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addItem,
  decrementItem,
  removeItem,
  selectCartCount,
} from '../store/slices/cartSlice';
import type { RootStackScreenProps } from '../navigation/types';

/**
 * Carrito — revisar y editar los artículos antes de pagar.
 * Permite ajustar cantidades (+/−) y eliminar. El CTA "Continuar con el pago"
 * lleva al Checkout (datos de envío + pago).
 */
export const CartScreen: React.FC<RootStackScreenProps<'Cart'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const products = useAppSelector((s) => s.products.items);
  const count = useAppSelector((s) => selectCartCount(s.cart.items));

  const lines = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return null;
          return { product, qty: item.qty, lineTotal: product.priceCop * item.qty };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null),
    [cartItems, products],
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.lineTotal, 0),
    [lines],
  );

  const empty = lines.length === 0;

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Volver">
          <Icon name="arrow-back" size={26} color={theme.colors.onSurface} />
        </Pressable>
        <AppText variant="headlineMd" color="onSurface" style={styles.topTitle}>
          Tu carrito
        </AppText>
        <View style={styles.topSpacer} />
      </View>

      {empty ? (
        <View style={styles.emptyState}>
          <Icon name="shopping-cart" size={56} color={theme.colors.surfaceContainerHighest} />
          <AppText variant="headlineMd" color="onSurface" style={styles.emptyTitle}>
            Tu carrito está vacío
          </AppText>
          <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.emptySub}>
            Explora la colección y agrega tus piezas favoritas.
          </AppText>
          <Pressable
            style={styles.emptyButton}
            onPress={() => navigation.navigate('Home')}
            accessibilityRole="button"
          >
            <AppText variant="labelCaps" color="onPrimary">
              Explorar colección
            </AppText>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.count}>
              {count} {count === 1 ? 'artículo' : 'artículos'}
            </AppText>

            {lines.map(({ product, qty, lineTotal }) => (
              <View key={product.id} testID={`cart-line-${product.id}`} style={styles.line}>
                <Image source={product.image} style={styles.thumb} resizeMode="cover" />
                <View style={styles.lineBody}>
                  <AppText variant="bodyLg" color="onSurface" numberOfLines={2}>
                    {product.name}
                  </AppText>
                  <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.unit}>
                    {formatCop(product.priceCop)} c/u
                  </AppText>

                  <View style={styles.lineFooter}>
                    <View style={styles.qtyControls}>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => dispatch(decrementItem(product.id))}
                        accessibilityLabel={`Disminuir ${product.name}`}
                      >
                        <Icon name="remove" size={18} color={theme.colors.onSurface} />
                      </Pressable>
                      <AppText variant="bodyLg" color="onSurface" style={styles.qtyValue}>
                        {qty}
                      </AppText>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => dispatch(addItem(product.id))}
                        accessibilityLabel={`Aumentar ${product.name}`}
                      >
                        <Icon name="add" size={18} color={theme.colors.onSurface} />
                      </Pressable>
                    </View>
                    <AppText variant="bodyLg" color="onSurface" style={styles.lineTotal}>
                      {formatCop(lineTotal)}
                    </AppText>
                  </View>
                </View>

                <Pressable
                  style={styles.remove}
                  onPress={() => dispatch(removeItem(product.id))}
                  hitSlop={8}
                  accessibilityLabel={`Quitar ${product.name}`}
                >
                  <Icon name="close" size={18} color={theme.colors.onSurfaceVariant} />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          {/* Pie fijo: subtotal + continuar */}
          <View style={[styles.footer, { paddingBottom: (insets.bottom || 12) + 8 }]}>
            <View style={styles.subtotalRow}>
              <AppText variant="labelCaps" color="onSurfaceVariant">
                Subtotal
              </AppText>
              <AppText variant="headlineMd" color="onSurface" style={styles.subtotal} testID="cart-subtotal">
                {formatCop(subtotal)}
              </AppText>
            </View>
            <Pressable
              testID="continue-button"
              style={styles.continueButton}
              onPress={() => navigation.navigate('Checkout')}
              accessibilityRole="button"
            >
              <AppText variant="labelCaps" color="onPrimary">
                Continuar con el pago
              </AppText>
              <View style={styles.arrowCircle}>
                <Icon name="arrow-forward" size={18} color={theme.colors.onSurface} />
              </View>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackSm,
  },
  topTitle: { fontSize: 20 },
  topSpacer: { width: 26 },
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackMd,
  },
  count: { marginBottom: theme.spacing.stackMd },
  line: { flexDirection: 'row', marginBottom: theme.spacing.stackMd },
  thumb: {
    width: 84,
    height: 84,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceContainer,
  },
  lineBody: { flex: 1, marginLeft: theme.spacing.stackMd },
  unit: { marginTop: 2 },
  lineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackSm,
  },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { minWidth: 32, textAlign: 'center' },
  lineTotal: { fontWeight: '600' },
  remove: { paddingLeft: theme.spacing.stackSm },
  footer: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingTop: theme.spacing.stackMd,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  subtotalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.stackMd,
  },
  subtotal: { fontSize: 22 },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.onSurface,
    paddingVertical: 14,
    paddingLeft: theme.spacing.stackLg,
    paddingRight: theme.spacing.unit,
    borderRadius: theme.radius.full,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.stackXl,
  },
  emptyTitle: { marginTop: theme.spacing.stackMd, textAlign: 'center' },
  emptySub: { marginTop: theme.spacing.stackSm, textAlign: 'center' },
  emptyButton: {
    marginTop: theme.spacing.stackLg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.stackLg,
    borderRadius: theme.radius.full,
  },
});

export default CartScreen;
