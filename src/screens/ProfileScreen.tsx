import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCustomerEmail } from '../store/slices/customerSlice';
import { useGetOrdersQuery } from '../api/apiSlice';
import type { Order, OrderStatus } from '../store/slices/ordersSlice';
import type { ColorToken } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

const STATUS_META: Record<OrderStatus, { label: string; color: ColorToken }> = {
  approved: { label: 'Aprobada', color: 'tertiary' },
  pending: { label: 'Pendiente', color: 'secondary' },
  declined: { label: 'Rechazada', color: 'error' },
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const isValidEmail = (v: string) => /\S+@\S+\.\S+/.test(v.trim());

/** Perfil — historial de compras del correo del cliente (backend). */
export const ProfileScreen: React.FC<RootStackScreenProps<'Profile'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const storedEmail = useAppSelector((s) => s.customer.email);
  const localOrders = useAppSelector((s) => s.orders.items);

  const [emailInput, setEmailInput] = useState(storedEmail);

  const {
    data: remoteOrders,
    isFetching,
    isError,
    refetch,
  } = useGetOrdersQuery(storedEmail, { skip: !storedEmail });

  const TopBar = (
    <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
      <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Volver">
        <Icon name="arrow-back" size={26} color={theme.colors.onSurface} />
      </Pressable>
      <AppText variant="headlineMd" color="onSurface" style={styles.topTitle}>
        Mi perfil
      </AppText>
      <Avatar size={40} />
    </View>
  );

  // Sin correo → pedirlo para traer sus compras.
  if (!storedEmail) {
    return (
      <View style={styles.container}>
        {TopBar}
        <View style={styles.form}>
          <Icon name="alternate-email" size={48} color={theme.colors.surfaceContainerHighest} />
          <AppText variant="headlineMd" color="onSurface" style={styles.formTitle}>
            Ver mis compras
          </AppText>
          <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.formSub}>
            Ingresa el correo con el que realizaste tus compras para consultarlas.
          </AppText>
          <View style={styles.field}>
            <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.fieldLabel}>
              CORREO ELECTRÓNICO
            </AppText>
            <TextInput
              testID="profile-email"
              style={styles.input}
              value={emailInput}
              onChangeText={setEmailInput}
              placeholder="tucorreo@ejemplo.com"
              placeholderTextColor={theme.colors.surfaceDim}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <Pressable
            testID="profile-email-submit"
            style={[styles.primaryButton, !isValidEmail(emailInput) && styles.buttonDisabled]}
            disabled={!isValidEmail(emailInput)}
            onPress={() => dispatch(setCustomerEmail(emailInput.trim()))}
            accessibilityRole="button"
          >
            <AppText variant="labelCaps" color="onPrimary">
              Ver mis compras
            </AppText>
          </Pressable>
        </View>
      </View>
    );
  }

  const orders: Order[] = remoteOrders ?? (isError ? localOrders : []);
  const showEmpty = !isFetching && !isError && orders.length === 0;

  return (
    <View style={styles.container}>
      {TopBar}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.accountRow}>
          <AppText variant="bodyMd" color="onSurfaceVariant" numberOfLines={1} style={styles.accountEmail}>
            {storedEmail}
          </AppText>
          <Pressable onPress={() => dispatch(setCustomerEmail(''))} hitSlop={8}>
            <AppText variant="labelCaps" color="primary">
              Cambiar
            </AppText>
          </Pressable>
        </View>

        <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.sectionLabel}>
          MIS COMPRAS
        </AppText>

        {isFetching ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.colors.primary} />
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.centerText}>
              Cargando tus compras…
            </AppText>
          </View>
        ) : isError && orders.length === 0 ? (
          <View style={styles.center}>
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.centerText}>
              No pudimos cargar tus compras.
            </AppText>
            <Pressable style={styles.retryButton} onPress={() => refetch()} accessibilityRole="button">
              <AppText variant="labelCaps" color="onPrimary">
                Reintentar
              </AppText>
            </Pressable>
          </View>
        ) : showEmpty ? (
          <View style={styles.center}>
            <Icon name="receipt-long" size={56} color={theme.colors.surfaceContainerHighest} />
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.centerText}>
              No hay compras con este correo.
            </AppText>
          </View>
        ) : (
          orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() =>
                navigation.navigate('TransactionResult', { transactionId: order.id })
              }
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const OrderCard: React.FC<{ order: Order; onPress: () => void }> = ({ order, onPress }) => {
  const status = STATUS_META[order.status];
  return (
    <Pressable testID={`order-${order.id}`} style={styles.card} onPress={onPress} accessibilityRole="button">
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
          {order.itemCount} {order.itemCount === 1 ? 'artículo' : 'artículos'} · {order.cardBrand} ••{order.cardLast4}
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
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackMd,
  },
  accountEmail: { flex: 1, marginRight: theme.spacing.stackMd },
  sectionLabel: { marginTop: theme.spacing.stackLg, marginBottom: theme.spacing.stackMd },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.stackXl },
  centerText: { marginTop: theme.spacing.stackSm, textAlign: 'center' },
  retryButton: {
    marginTop: theme.spacing.stackMd,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.stackLg,
    borderRadius: theme.radius.full,
  },
  form: { paddingHorizontal: theme.spacing.stackLg, paddingTop: theme.spacing.stackXl, alignItems: 'center' },
  formTitle: { marginTop: theme.spacing.stackMd, textAlign: 'center', fontSize: 26 },
  formSub: { marginTop: theme.spacing.stackSm, textAlign: 'center' },
  field: {
    width: '100%',
    marginTop: theme.spacing.stackLg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingVertical: 8,
  },
  fieldLabel: { fontSize: 10, marginBottom: 4 },
  input: { ...theme.typography.bodyMd, color: theme.colors.onSurface, padding: 0 },
  primaryButton: {
    width: '100%',
    marginTop: theme.spacing.stackLg,
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: theme.radius.full,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: theme.colors.surfaceContainerHighest },
  card: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.radius.md,
    padding: theme.spacing.stackMd,
    marginBottom: theme.spacing.stackMd,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: theme.spacing.stackSm, paddingVertical: 4, borderRadius: theme.radius.full },
  badgeText: { fontSize: 10, letterSpacing: 0.5 },
  reference: { marginTop: theme.spacing.stackSm },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackSm,
  },
  amount: { fontWeight: '700' },
});

export default ProfileScreen;
