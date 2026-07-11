import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';
import { CreditCard } from './CreditCard';
import { BrandLoader } from './BrandLoader';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import {
  formatCardNumber,
  formatExpiry,
  formatCvv,
  detectBrand,
  last4,
  isCardComplete,
} from '../utils/card';

/** Datos completos de la tarjeta al confirmar (para tokenizar en el backend). */
export interface ConfirmedCard {
  number: string;
  cardHolder: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  brand: string;
  last4: string;
}

export interface PaymentDrawerProps {
  visible: boolean;
  amountCop: number;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (card: ConfirmedCard) => void;
}

export const PaymentDrawer: React.FC<PaymentDrawerProps> = ({
  visible,
  amountCop,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [flipped, setFlipped] = useState(false);

  const complete = isCardComplete(number, holder, expiry, cvv);
  const brand = number ? detectBrand(number) : undefined;

  const handleConfirm = () => {
    if (!complete || loading) return;
    const [mm = '', yy = ''] = expiry.split('/').map((s) => s.trim());
    onConfirm({
      number: number.replace(/\D/g, ''),
      cardHolder: holder.trim(),
      expMonth: mm,
      expYear: yy,
      cvc: cvv,
      brand: detectBrand(number),
      last4: last4(number),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        if (!loading) onClose();
      }}
    >
      {loading ? (
        <View style={styles.fullLoader}>
          <BrandLoader
            title="Procesando tu pago"
            subtitle="Estamos confirmando con tu banco. Por favor no cierres esta ventana."
          />
        </View>
      ) : (
        <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Cerrar">
              <Icon name="arrow-back" size={26} color={theme.colors.onSurface} />
            </Pressable>
            <AppText variant="labelCaps" color="primary">
              PAGO SEGURO
            </AppText>
            <View style={styles.headerSpacer} />
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scroll,
                { paddingBottom: (insets.bottom || 12) + theme.spacing.stackXl },
              ]}
              keyboardShouldPersistTaps="handled"
            >
              <CreditCard
                number={number}
                holder={holder}
                expiry={expiry}
                cvv={cvv}
                brand={brand}
                flipped={flipped}
              />

              <View style={styles.form}>
                <Field label="NÚMERO DE TARJETA">
                  <TextInput
                    testID="input-number"
                    style={styles.input}
                    value={number}
                    onChangeText={(t) => setNumber(formatCardNumber(t))}
                    keyboardType="number-pad"
                    placeholder="0000 0000 0000 0000"
                    placeholderTextColor={theme.colors.surfaceDim}
                    maxLength={19}
                  />
                </Field>

                <Field label="TITULAR DE LA TARJETA">
                  <TextInput
                    testID="input-holder"
                    style={styles.input}
                    value={holder}
                    onChangeText={setHolder}
                    autoCapitalize="characters"
                    placeholder="NOMBRE COMPLETO"
                    placeholderTextColor={theme.colors.surfaceDim}
                  />
                </Field>

                <View style={styles.row}>
                  <Field label="EXPIRACIÓN" style={styles.rowItem}>
                    <TextInput
                      testID="input-expiry"
                      style={styles.input}
                      value={expiry}
                      onChangeText={(t) => setExpiry(formatExpiry(t))}
                      keyboardType="number-pad"
                      placeholder="MM / AA"
                      placeholderTextColor={theme.colors.surfaceDim}
                      maxLength={7}
                    />
                  </Field>
                  <Field label="CVV" style={styles.rowItem}>
                    <TextInput
                      testID="input-cvv"
                      style={styles.input}
                      value={cvv}
                      onChangeText={(t) => setCvv(formatCvv(t))}
                      onFocus={() => setFlipped(true)}
                      onBlur={() => setFlipped(false)}
                      keyboardType="number-pad"
                      placeholder="•••"
                      placeholderTextColor={theme.colors.surfaceDim}
                      maxLength={3}
                    />
                  </Field>
                </View>
              </View>

              <Pressable
                testID="confirm-payment"
                style={[styles.confirm, (!complete || loading) && styles.confirmDisabled]}
                onPress={handleConfirm}
                disabled={!complete || loading}
                accessibilityRole="button"
              >
                <AppText variant="labelCaps" color="onPrimary">
                  Confirmar pago — {formatCop(amountCop)}
                </AppText>
              </Pressable>
              <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.terms}>
                Al confirmar aceptas nuestros términos de comercio artesanal.
              </AppText>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </Modal>
  );
};

const Field: React.FC<{
  label: string;
  style?: object;
  children: React.ReactNode;
}> = ({ label, style, children }) => (
  <View style={[styles.field, style]}>
    <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.fieldLabel}>
      {label}
    </AppText>
    {children}
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.marginMobile,
  },
  fullLoader: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.stackMd,
  },
  headerSpacer: { width: 26 },
  scroll: { paddingTop: theme.spacing.stackSm },
  form: { marginTop: theme.spacing.stackLg, gap: theme.spacing.stackMd },
  field: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outlineVariant,
    paddingVertical: 8,
  },
  fieldLabel: { fontSize: 10, marginBottom: 4 },
  input: {
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    padding: 0,
  },
  row: { flexDirection: 'row', gap: theme.spacing.stackMd },
  rowItem: { flex: 1 },
  confirm: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    marginTop: theme.spacing.stackLg,
  },
  confirmDisabled: { backgroundColor: theme.colors.surfaceContainerHighest },
  terms: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: theme.spacing.stackSm,
    letterSpacing: 0,
    opacity: 0.6,
  },
});

export default PaymentDrawer;
