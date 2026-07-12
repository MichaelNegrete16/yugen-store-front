import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { RemoteImage } from '../components/RemoteImage';
import { PaymentDrawer } from '../components/PaymentDrawer';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { computeOrderSummary, DISCOUNT_CODE } from '../utils/pricing';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { startTransaction, setTransactionResult } from '../store/slices/transactionSlice';
import { addOrder } from '../store/slices/ordersSlice';
import { clearCart } from '../store/slices/cartSlice';
import { setCustomerEmail } from '../store/slices/customerSlice';
import {
  api,
  useCreateTransactionMutation,
  useLazyGetTransactionQuery,
  useQuoteMutation,
  PriceBreakdown,
} from '../api/apiSlice';
import { showToast } from '../utils/toast';
import { isOutOfStockError, soldOutLabel } from '../utils/stock';
import type { ConfirmedCard } from '../components/PaymentDrawer';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 4/7 — Checkout: datos de envío, artículos, resumen y pago. */
export const CheckoutScreen: React.FC<RootStackScreenProps<'Checkout'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((s) => s.cart.items);
  const products = useAppSelector((s) => s.products.items);
  const [createTransaction, { isLoading: paying }] = useCreateTransactionMutation();
  const [pollTransaction] = useLazyGetTransactionQuery();

  const [payOpen, setPayOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [email, setEmail] = useState('');
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
          const available = product.stock >= item.qty;
          return {
            product,
            qty: item.qty,
            lineTotal: product.priceCop * item.qty,
            available,
          };
        })
        .filter((l): l is NonNullable<typeof l> => l !== null),
    [cartItems, products],
  );

  // Solo se cobran los disponibles: los agotados no entran al total ni se envían.
  const payableLines = useMemo(() => lines.filter((l) => l.available), [lines]);
  const hasSoldOut = lines.some((l) => !l.available);

  const subtotal = useMemo(
    () => payableLines.reduce((sum, l) => sum + l.lineTotal, 0),
    [payableLines],
  );
  const localSummary = useMemo(
    () => computeOrderSummary(subtotal, DISCOUNT_CODE),
    [subtotal],
  );

  const empty = lines.length === 0;
  const nothingToPay = payableLines.length === 0;

  const [fetchQuote] = useQuoteMutation();
  const [remoteSummary, setRemoteSummary] = useState<PriceBreakdown | null>(null);
  useEffect(() => {
    if (nothingToPay) {
      setRemoteSummary(null);
      return;
    }
    let cancelled = false;
    fetchQuote({
      items: payableLines.map((l) => ({ productId: l.product.id, qty: l.qty })),
      discountCode: DISCOUNT_CODE,
    })
      .unwrap()
      .then((b) => !cancelled && setRemoteSummary(b))
      .catch(() => !cancelled && setRemoteSummary(null));
    return () => {
      cancelled = true;
    };
  }, [payableLines, nothingToPay, fetchQuote]);

  const summary = remoteSummary ?? localSummary;

  const shippingComplete =
    /\S+@\S+\.\S+/.test(email.trim()) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    address.trim().length > 0 &&
    city.trim().length > 0 &&
    postal.trim().length > 0;

  const handleConfirm = async (card: ConfirmedCard) => {
    const productIds = payableLines.map((l) => l.product.id);
    const itemCount = payableLines.reduce((sum, l) => sum + l.qty, 0);
    const items = payableLines.map((l) => ({ productId: l.product.id, qty: l.qty }));
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(() => r(), ms));

    setProcessing(true);
    try {
      let tx;
      try {
        tx = await createTransaction({
          customer: { email: email.trim(), fullName: `${firstName} ${lastName}`.trim() },
          shipping: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            address: address.trim(),
            city: city.trim(),
            postalCode: postal.trim(),
            country: 'Colombia',
          },
          items,
          discountCode: DISCOUNT_CODE,
          card: {
            number: card.number,
            cardHolder: card.cardHolder,
            expMonth: card.expMonth,
            expYear: card.expYear,
            cvc: card.cvc,
            installments: 1,
          },
        }).unwrap();
      } catch (err) {
        setPayOpen(false);
        // Si el backend rechaza por stock (422), el catálogo quedó desfasado:
        // refrescamos productos y avisamos que hay algo agotado.
        if (isOutOfStockError(err)) {
          dispatch(api.util.invalidateTags(['Products']));
          showToast('Uno de los artículos está agotado. Actualizamos tu carrito.');
        } else {
          showToast('No pudimos iniciar el pago. Revisa tu conexión e intenta de nuevo.');
        }
        return;
      }

      // La transacción ya está creada (PENDING). Consultamos el estado final
      // tolerando fallos de red en el polling para no perder la compra.
      for (let attempt = 0; tx.status === 'pending' && attempt < 8; attempt++) {
        if (attempt > 0) await sleep(1500);
        try {
          const polled = await pollTransaction(tx.reference).unwrap();
          if (polled) tx = polled;
        } catch {
          // reintenta en la siguiente vuelta
        }
      }

      const amount = tx.amountCop || tx.breakdown?.total || summary.total;
      dispatch(setCustomerEmail(email.trim()));
      dispatch(
        startTransaction({
          reference: tx.reference,
          amountCop: amount,
          productIds,
          card: { last4: card.last4, brand: card.brand, holder: card.cardHolder },
        }),
      );
      dispatch(setTransactionResult({ id: tx.id, status: tx.status, updatedAt: tx.createdAt }));

      if (tx.status === 'declined' || tx.status === 'error') {
        setPayOpen(false);
        showToast('Pago rechazado. Verifica los datos o intenta con otra tarjeta.');
        return;
      }

      dispatch(
        addOrder({
          id: tx.reference,
          createdAt: tx.createdAt,
          amountCop: amount,
          itemCount,
          productIds,
          cardLast4: tx.cardLast4 || card.last4,
          cardBrand: tx.cardBrand || card.brand,
          status: tx.status,
        }),
      );
      dispatch(clearCart());
      // Refrescar el historial del backend YA con el estado final.
      dispatch(api.util.invalidateTags(['Orders']));
      setPayOpen(false);
      navigation.navigate('TransactionResult', { transactionId: tx.reference });
    } finally {
      setProcessing(false);
    }
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
        <Avatar />
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
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
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
            <ShippingField testID="ship-email" label="CORREO ELECTRÓNICO" value={email} onChangeText={setEmail} placeholder="tucorreo@ejemplo.com" keyboardType="email-address" />
            <View style={styles.formRow}>
              <ShippingField testID="ship-firstName" label="NOMBRE" value={firstName} onChangeText={setFirstName} placeholder="Kenji" style={styles.formRowItem} />
              <ShippingField testID="ship-lastName" label="APELLIDO" value={lastName} onChangeText={setLastName} placeholder="Sato" style={styles.formRowItem} />
            </View>
            <ShippingField testID="ship-address" label="DIRECCIÓN DE ENTREGA" value={address} onChangeText={setAddress} placeholder="Calle 10 # 5-51" />
            <View style={styles.formRow}>
              <ShippingField testID="ship-city" label="CIUDAD" value={city} onChangeText={setCity} placeholder="Bogotá" style={styles.formRowItem} />
              <ShippingField testID="ship-postal" label="CÓDIGO POSTAL" value={postal} onChangeText={setPostal} placeholder="110111" keyboardType="number-pad" style={styles.formRowItem} />
            </View>
          </View>

          {/* 02 — Artículos */}
          <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.sectionLabel}>
            02 — ARTÍCULOS
          </AppText>
          {lines.map(({ product, qty, lineTotal, available }) => (
            <View
              key={product.id}
              testID={`item-${product.id}`}
              style={[styles.item, !available && styles.itemSoldOut]}
            >
              <RemoteImage uri={product.image} style={styles.thumb} showLabel={false} />
              <View style={styles.itemBody}>
                <AppText
                  variant="bodyLg"
                  color={available ? 'onSurface' : 'onSurfaceVariant'}
                  numberOfLines={2}
                  style={!available && styles.struck}
                >
                  {product.name}
                </AppText>
                {!available ? (
                  <View style={styles.soldOutTag}>
                    <Icon name="do-not-disturb-on" size={13} color={theme.colors.error} />
                    <AppText variant="labelCaps" color="error" style={styles.soldOutText}>
                      {soldOutLabel(product)} · no se cobra
                    </AppText>
                  </View>
                ) : product.artisan ? (
                  <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.artisan}>
                    Artesano: {product.artisan}
                  </AppText>
                ) : null}
                <View style={styles.itemFooter}>
                  <AppText variant="bodyMd" color="onSurfaceVariant">
                    Cantidad: {qty}
                  </AppText>
                  <AppText
                    variant="bodyLg"
                    color={available ? 'primary' : 'onSurfaceVariant'}
                    style={[styles.itemPrice, !available && styles.struck]}
                  >
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
              style={[styles.payButton, (!shippingComplete || nothingToPay) && styles.payButtonDisabled]}
              onPress={() => setPayOpen(true)}
              disabled={!shippingComplete || nothingToPay}
              accessibilityRole="button"
              accessibilityState={{ disabled: !shippingComplete || nothingToPay }}
            >
              <AppText variant="labelCaps" color="onPrimary">
                Pagar con tarjeta
              </AppText>
              <Icon name="chevron-right" size={22} color={theme.colors.onPrimary} />
            </Pressable>
            <AppText
              variant="labelCaps"
              color={shippingComplete && !nothingToPay ? 'onSurfaceVariant' : 'error'}
              style={styles.secure}
            >
              {nothingToPay
                ? 'Todos los artículos están agotados'
                : hasSoldOut
                ? 'Los artículos agotados no se cobrarán'
                : shippingComplete
                ? 'Pago cifrado SSL • Devoluciones en 30 días'
                : 'Completa tus datos de envío para continuar'}
            </AppText>
          </View>
        </ScrollView>
      )}

      <PaymentDrawer
        visible={payOpen}
        amountCop={summary.total}
        loading={paying || processing}
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
  keyboardType?: 'default' | 'number-pad' | 'email-address';
  testID?: string;
  style?: object;
}> = ({ label, value, onChangeText, placeholder, keyboardType = 'default', testID, style }) => (
  <View style={[styles.field, style]}>
    <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.fieldLabel}>
      {label}
    </AppText>
    <TextInput
      testID={testID}
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
  itemSoldOut: { opacity: 0.55 },
  struck: { textDecorationLine: 'line-through' },
  soldOutTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  soldOutText: { fontSize: 10, letterSpacing: 0.5 },
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
  payButtonDisabled: { backgroundColor: theme.colors.surfaceContainerHighest },
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
