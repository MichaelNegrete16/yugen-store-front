import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { PaymentDrawer } from '../components/PaymentDrawer';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { computeOrderSummary, DISCOUNT_CODE } from '../utils/pricing';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { startTransaction, CardInfo } from '../store/slices/transactionSlice';
import type { RootStackScreenProps } from '../navigation/types';

const AVATAR = require('../../assets/images/avatar.jpg');

/**
 * Paso 4/7 — Checkout: datos de envío, artículos y resumen del pedido.
 * El botón "Pagar con tarjeta" abre el drawer de pago (pasos 5 y 6).
 * El pago es MOCK; el empalme con la pasarela sandbox es la última fase.
 */
export const CheckoutScreen: React.FC<RootStackScreenProps<'Checkout'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const products = useAppSelector((s) => s.products.items);

  const [payOpen, setPayOpen] = useState(false);
  // Datos de envío (locales; el diseño los muestra como formulario editable).
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postal, setPostal] = useState('');

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
  const summary = useMemo(
    () => computeOrderSummary(subtotal, DISCOUNT_CODE),
    [subtotal],
  );

  const empty = lines.length === 0;

  const handleConfirm = (card: CardInfo) => {
    const reference = `YUGEN-${card.last4}-${Date.now()}`;
    dispatch(
      startTransaction({
        reference,
        amountCop: summary.total,
        productIds: lines.map((l) => l.product.id),
        card,
      }),
    );
    setPayOpen(false);
    navigation.navigate('TransactionResult', { transactionId: reference });
  };

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={styles.topLeft}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Volver">
            <Icon name="arrow-back" size={26} color={theme.colors.primary} />
          </Pressable>
          <AppText variant="headlineMd" color="onSurface" style={styles.topTitle}>
            Checkout
          </AppText>
        </View>
        <Image source={AVATAR} style={styles.avatar} />
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {/* 01 — Datos de envío */}
          <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.sectionLabel}>
            01 — DATOS DE ENVÍO
          </AppText>
          <View style={styles.formCard}>
            <View style={styles.formRow}>
              <ShippingField label="NOMBRE" value={firstName} onChangeText={setFirstName} placeholder="Kenji" style={styles.formRowItem} />
              <ShippingField label="APELLIDO" value={lastName} onChangeText={setLastName} placeholder="Sato" style={styles.formRowItem} />
            </View>
            <ShippingField label="DIRECCIÓN DE ENTREGA" value={address} onChangeText={setAddress} placeholder="Calle 10 # 5-51" />
            <View style={styles.formRow}>
              <ShippingField label="CIUDAD" value={city} onChangeText={setCity} placeholder="Bogotá" style={styles.formRowItem} />
              <ShippingField label="CÓDIGO POSTAL" value={postal} onChangeText={setPostal} placeholder="110111" keyboardType="number-pad" style={styles.formRowItem} />
            </View>
          </View>

          {/* 02 — Artículos */}
          <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.sectionLabel}>
            02 — ARTÍCULOS
          </AppText>
          {lines.map(({ product, qty, lineTotal }) => (
            <View key={product.id} testID={`item-${product.id}`} style={styles.item}>
              <Image source={product.image} style={styles.thumb} resizeMode="cover" />
              <View style={styles.itemBody}>
                <AppText variant="bodyLg" color="onSurface" numberOfLines={2}>
                  {product.name}
                </AppText>
                {product.artisan ? (
                  <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.artisan}>
                    Artesano: {product.artisan}
                  </AppText>
                ) : null}
                <View style={styles.itemFooter}>
                  <AppText variant="bodyMd" color="onSurfaceVariant">
                    Cantidad: {qty}
                  </AppText>
                  <AppText variant="bodyLg" color="primary" style={styles.itemPrice}>
                    {formatCop(lineTotal)}
                  </AppText>
                </View>
              </View>
            </View>
          ))}

          {/* Resumen del pedido */}
          <View style={styles.summaryCard}>
            <AppText variant="headlineMd" color="onSurface" style={styles.summaryTitle}>
              Resumen del pedido
            </AppText>
            <SummaryRow label="Subtotal" value={formatCop(summary.subtotal)} />
            <SummaryRow label="Envío (Estándar)" value={formatCop(summary.shipping)} />
            <SummaryRow label="IVA (19%)" value={formatCop(summary.tax)} />
            {summary.discount > 0 ? (
              <SummaryRow
                label={`Descuento (${DISCOUNT_CODE})`}
                value={`- ${formatCop(summary.discount)}`}
                highlight
              />
            ) : null}
            <View style={styles.summaryDivider} />
            <View style={styles.grandRow}>
              <AppText variant="labelCaps" color="onSurfaceVariant">
                GRAN TOTAL
              </AppText>
              <AppText variant="headlineMd" color="onSurface" style={styles.grandTotal} testID="grand-total">
                {formatCop(summary.total)}
              </AppText>
            </View>

            <Pressable
              testID="pay-button"
              style={styles.payButton}
              onPress={() => setPayOpen(true)}
              accessibilityRole="button"
            >
              <AppText variant="labelCaps" color="onPrimary">
                Pagar con tarjeta
              </AppText>
              <Icon name="chevron-right" size={22} color={theme.colors.onPrimary} />
            </Pressable>
            <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.secure}>
              Pago cifrado SSL • Devoluciones en 30 días
            </AppText>
          </View>
        </ScrollView>
      )}

      <PaymentDrawer
        visible={payOpen}
        amountCop={summary.total}
        onClose={() => setPayOpen(false)}
        onConfirm={handleConfirm}
      />
    </View>
  );
};

/** Campo de envío con label en label-caps y línea inferior. */
const ShippingField: React.FC<{
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad';
  style?: object;
}> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', style }) => (
  <View style={[styles.field, style]}>
    <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.fieldLabel}>
      {label}
    </AppText>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.surfaceDim}
      keyboardType={keyboardType}
    />
  </View>
);

/** Línea del resumen (label a la izquierda, valor a la derecha). */
const SummaryRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.summaryRow}>
    <AppText variant="bodyMd" color={highlight ? 'secondary' : 'onSurfaceVariant'}>
      {label}
    </AppText>
    <AppText variant="bodyMd" color={highlight ? 'secondary' : 'onSurfaceVariant'}>
      {value}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackSm,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.stackMd },
  topTitle: { fontSize: 26 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
  },
  sectionLabel: { marginTop: theme.spacing.stackLg, marginBottom: theme.spacing.stackMd },
  formCard: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    gap: theme.spacing.stackMd,
  },
  formRow: { flexDirection: 'row', gap: theme.spacing.stackMd },
  formRowItem: { flex: 1 },
  field: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingVertical: 6,
  },
  fieldLabel: { fontSize: 10, marginBottom: 4 },
  input: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    padding: 0,
  },
  item: {
    flexDirection: 'row',
    gap: theme.spacing.stackMd,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackSm,
    marginBottom: theme.spacing.stackSm,
  },
  thumb: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceContainerHighest,
  },
  itemBody: { flex: 1, justifyContent: 'center' },
  artisan: { marginTop: 2 },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackSm,
  },
  itemPrice: { fontWeight: '700' },
  summaryCard: {
    marginTop: theme.spacing.stackLg,
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  summaryTitle: { fontSize: 22, marginBottom: theme.spacing.stackMd },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.stackSm,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
    marginVertical: theme.spacing.stackSm,
  },
  grandRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  grandTotal: { fontSize: 28 },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: theme.colors.onSurface,
    paddingVertical: 18,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.stackLg,
  },
  secure: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: theme.spacing.stackMd,
    letterSpacing: 1,
    opacity: 0.6,
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

export default CheckoutScreen;
