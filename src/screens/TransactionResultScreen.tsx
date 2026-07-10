import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { useAppSelector } from '../store/hooks';
import type { OrderStatus } from '../store/slices/ordersSlice';
import type { ColorToken } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Encabezado (icono, color y textos) según el estado del pago. */
const RESULT_META: Record<
  OrderStatus,
  { icon: string; color: ColorToken; title: string; subtitle: string }
> = {
  approved: {
    icon: 'check',
    color: 'tertiary',
    title: '¡Pago aprobado!',
    subtitle: 'Tu pedido fue confirmado. Gracias por tu compra.',
  },
  pending: {
    icon: 'schedule',
    color: 'secondary',
    title: 'Pago en proceso',
    subtitle: 'Estamos confirmando tu pago. Te avisaremos pronto.',
  },
  declined: {
    icon: 'close',
    color: 'error',
    title: 'Pago rechazado',
    subtitle: 'No pudimos procesar tu pago. Intenta con otra tarjeta.',
  },
};

/** Fecha ISO -> "10/07/2026, 12:48". */
const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
};

/** Paso 7/7 — Resumen detallado del resultado de la compra. */
export const TransactionResultScreen: React.FC<
  RootStackScreenProps<'TransactionResult'>
> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const order = useAppSelector((s) =>
    s.orders.items.find((o) => o.id === route.params.transactionId),
  );
  const products = useAppSelector((s) => s.products.items);

  const meta = RESULT_META[order?.status ?? 'approved'];

  const productNames = order
    ? order.productIds
        .map((id) => products.find((p) => p.id === id)?.name)
        .filter((n): n is string => Boolean(n))
    : [];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.spacing.stackLg },
        ]}
      >
        {/* Encabezado de estado */}
        <View style={[styles.badgeCircle, { backgroundColor: theme.colors[meta.color] }]}>
          <Icon name={meta.icon} size={48} color={theme.colors.onPrimary} />
        </View>
        <AppText variant="headlineMd" color="onSurface" style={styles.title}>
          {meta.title}
        </AppText>
        <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.subtitle}>
          {meta.subtitle}
        </AppText>

        {order ? (
          <>
            {/* Tarjeta de detalle */}
            <View style={styles.card}>
              <DetailRow label="Referencia" value={order.id} />
              <View style={styles.divider} />
              <DetailRow label="Fecha" value={formatDateTime(order.createdAt)} />
              <View style={styles.divider} />
              <DetailRow
                label="Método de pago"
                value={`${order.cardBrand} ••${order.cardLast4}`}
              />
              <View style={styles.divider} />
              <DetailRow
                label="Artículos"
                value={`${order.itemCount} ${order.itemCount === 1 ? 'artículo' : 'artículos'}`}
              />

              {productNames.length > 0 ? (
                <View style={styles.products}>
                  {productNames.map((name, i) => (
                    <View key={`${name}-${i}`} style={styles.productRow}>
                      <Icon name="spa" size={16} color={theme.colors.outline} />
                      <AppText
                        variant="bodyMd"
                        color="onSurfaceVariant"
                        style={styles.productName}
                        numberOfLines={1}
                      >
                        {name}
                      </AppText>
                    </View>
                  ))}
                </View>
              ) : null}

              <View style={styles.totalRow}>
                <AppText variant="labelCaps" color="onSurfaceVariant">
                  TOTAL PAGADO
                </AppText>
                <AppText variant="headlineMd" color="onSurface" style={styles.total} testID="result-total">
                  {formatCop(order.amountCop)}
                </AppText>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <AppText variant="bodyMd" color="onSurfaceVariant">
              Referencia: {route.params.transactionId}
            </AppText>
          </View>
        )}

        {/* Acciones */}
        <Pressable
          testID="see-orders"
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Profile')}
          accessibilityRole="button"
        >
          <AppText variant="labelCaps" color="onPrimary">
            Ver mis compras
          </AppText>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => navigation.popTo('Home')}
          accessibilityRole="button"
        >
          <AppText variant="labelCaps" color="onSurface">
            Volver al inicio
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
};

/** Fila etiqueta / valor de la tarjeta de detalle. */
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <AppText variant="bodyMd" color="onSurfaceVariant">
      {label}
    </AppText>
    <AppText variant="bodyMd" color="onSurface" style={styles.detailValue} numberOfLines={1}>
      {value}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
    alignItems: 'center',
  },
  badgeCircle: {
    width: 88,
    height: 88,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.stackMd,
  },
  title: { fontSize: 26, textAlign: 'center' },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing.stackSm,
    marginBottom: theme.spacing.stackLg,
    paddingHorizontal: theme.spacing.stackMd,
  },
  card: {
    width: '100%',
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  detailValue: { flexShrink: 1, marginLeft: theme.spacing.stackMd, textAlign: 'right' },
  divider: { height: 1, backgroundColor: theme.colors.outlineVariant, opacity: 0.5 },
  products: {
    marginTop: theme.spacing.stackSm,
    paddingTop: theme.spacing.stackSm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
    gap: theme.spacing.stackSm,
  },
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productName: { marginLeft: theme.spacing.stackSm, flexShrink: 1 },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackMd,
    paddingTop: theme.spacing.stackMd,
    borderTopWidth: 1,
    borderTopColor: theme.colors.outlineVariant,
  },
  total: { fontSize: 26 },
  primaryButton: {
    width: '100%',
    backgroundColor: theme.colors.onSurface,
    paddingVertical: 18,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    marginTop: theme.spacing.stackLg,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    marginTop: theme.spacing.stackSm,
  },
});

export default TransactionResultScreen;
