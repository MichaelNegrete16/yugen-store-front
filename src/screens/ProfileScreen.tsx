import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { useAppSelector } from '../store/hooks';
import { useGetOrdersQuery } from '../api/apiSlice';
import type { Order, OrderStatus } from '../store/slices/ordersSlice';
import type { ColorToken } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Etiqueta y color por estado de la compra. */
const STATUS_META: Record<OrderStatus, { label: string; color: ColorToken }> = {
  approved: { label: 'Aprobada', color: 'tertiary' },
  pending: { label: 'Pendiente', color: 'secondary' },
  declined: { label: 'Rechazada', color: 'error' },
};

/** Fecha ISO -> "10/07/2026" (sin Intl, limitado en Hermes). */
const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/** Perfil del usuario — historial de compras con su estado. */
export const ProfileScreen: React.FC<RootStackScreenProps<'Profile'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const localOrders = useAppSelector((s) => s.orders.items);
  const email = useAppSelector((s) => s.customer.email);
  const { data: remoteOrders } = useGetOrdersQuery(email, { skip: !email });
  const orders =
    remoteOrders && remoteOrders.length > 0 ? remoteOrders : localOrders;
  const empty = orders.length === 0;

  return (
    <View style={styles.container}>
      {/* Barra superior */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Volver">
          <Icon name="arrow-back" size={26} color={theme.colors.onSurface} />
        </Pressable>
        <AppText variant="headlineMd" color="onSurface" style={styles.topTitle}>
          Mi perfil
        </AppText>
        <Avatar size={40} />
      </View>

      {empty ? (
        <View style={styles.emptyState}>
          <Icon name="receipt-long" size={56} color={theme.colors.surfaceContainerHighest} />
          <AppText variant="headlineMd" color="onSurface" style={styles.emptyTitle}>
            Aún no tienes compras
          </AppText>
          <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.emptySub}>
            Cuando completes un pedido, aquí verás su estado.
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
        >
          <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.sectionLabel}>
            MIS COMPRAS
          </AppText>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                navigation.navigate('TransactionResult', { transactionId: order.id })
              }
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

/** Tarjeta de un pedido con su estado. */
const OrderCard: React.FC<{ order: Order; onPress: () => void }> = ({
  order,
  onPress,
}) => {
  const status = STATUS_META[order.status];
  return (
    <Pressable
      testID={`order-${order.id}`}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <AppText variant="labelCaps" color="onSurfaceVariant">
          {formatDate(order.createdAt)}
        </AppText>
        <View style={[styles.badge, { backgroundColor: theme.colors[status.color] }]}>
          <AppText variant="labelCaps" color="onPrimary" style={styles.badgeText}>
            {status.label}
          </AppText>
        </View>
      </View>

      <AppText variant="bodyLg" color="onSurface" style={styles.reference} numberOfLines={1}>
        {order.id}
      </AppText>

      <View style={styles.cardFooter}>
        <AppText variant="bodyMd" color="onSurfaceVariant">
          {order.itemCount} {order.itemCount === 1 ? 'artículo' : 'artículos'} ·{' '}
          {order.cardBrand} ••{order.cardLast4}
        </AppText>
        <AppText variant="bodyLg" color="onSurface" style={styles.amount}>
          {formatCop(order.amountCop)}
        </AppText>
      </View>
    </Pressable>
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
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
  },
  sectionLabel: { marginTop: theme.spacing.stackSm, marginBottom: theme.spacing.stackMd },
  card: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    marginBottom: theme.spacing.stackMd,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: theme.spacing.stackSm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  badgeText: { fontSize: 10, letterSpacing: 0.5 },
  reference: { marginTop: theme.spacing.stackSm },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackSm,
  },
  amount: { fontWeight: '700' },
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

export default ProfileScreen;
