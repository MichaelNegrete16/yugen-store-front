import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';
import { theme } from '../theme';

export interface CreditCardProps {
  /** Número ya formateado o parcial (se muestra tal cual, con placeholders). */
  number?: string;
  holder?: string;
  expiry?: string;
  cvv?: string;
  /** Marca detectada (Visa / Mastercard / Tarjeta). */
  brand?: string;
  /** Muestra el dorso (para capturar el CVV). */
  flipped?: boolean;
}

const PLACEHOLDER_NUMBER = '•••• •••• •••• ••••';

/**
 * Tarjeta de crédito interactiva del checkout Yūgen.
 * Se voltea al enfocar el CVV, replicando el diseño (puerta shōji + card flip).
 */
export const CreditCard: React.FC<CreditCardProps> = ({
  number,
  holder,
  expiry,
  cvv,
  brand,
  flipped = false,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: flipped ? 1 : 0,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [flipped, rotation]);

  const frontRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Frente */}
      <Animated.View
        style={[
          styles.card,
          styles.front,
          { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] },
        ]}
      >
        <View style={styles.frontTop}>
          <View style={styles.chip} />
          <View style={styles.brandDots}>
            <View style={[styles.brandDot, styles.brandDotRed]} />
            <View style={[styles.brandDot, styles.brandDotGold]} />
          </View>
        </View>

        <Icon
          name="local-florist"
          size={120}
          color="rgba(255,255,255,0.06)"
          style={styles.watermark}
        />

        <View>
          <AppText variant="bodyLg" color="onPrimary" style={styles.number} testID="cc-number">
            {number || PLACEHOLDER_NUMBER}
          </AppText>
          <View style={styles.frontBottom}>
            <View style={styles.field}>
              <AppText variant="labelCaps" style={styles.fieldLabel}>
                TITULAR
              </AppText>
              <AppText variant="labelCaps" color="onPrimary" style={styles.fieldValue}>
                {holder ? holder.toUpperCase() : 'NOMBRE APELLIDO'}
              </AppText>
            </View>
            <View style={[styles.field, styles.fieldRight]}>
              <AppText variant="labelCaps" style={styles.fieldLabel}>
                EXPIRA
              </AppText>
              <AppText variant="labelCaps" color="onPrimary" style={styles.fieldValue}>
                {expiry || 'MM / AA'}
              </AppText>
            </View>
          </View>
          {brand ? (
            <AppText variant="labelCaps" style={styles.brandLabel}>
              {brand}
            </AppText>
          ) : null}
        </View>
      </Animated.View>

      {/* Dorso */}
      <Animated.View
        style={[
          styles.card,
          styles.back,
          { transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
        ]}
      >
        <View style={styles.stripe} />
        <View style={styles.cvvRow}>
          <View style={styles.cvvBox}>
            <AppText variant="bodyMd" color="onSurface" style={styles.cvvText} testID="cc-cvv">
              {cvv || '•••'}
            </AppText>
          </View>
        </View>
        <AppText variant="labelCaps" style={styles.backNote}>
          Yūgen Premium Services
        </AppText>
      </Animated.View>
    </View>
  );
};

const CARD_RADIUS = 20;

const styles = StyleSheet.create({
  wrapper: { width: '100%', aspectRatio: 1.58 },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#121212',
    padding: theme.spacing.stackMd,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  front: {},
  back: { justifyContent: 'flex-start' },
  frontTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  chip: {
    width: 44,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#d4af37',
  },
  brandDots: { flexDirection: 'row', alignItems: 'center' },
  brandDot: { width: 30, height: 30, borderRadius: theme.radius.full, opacity: 0.85 },
  brandDotRed: { backgroundColor: '#eb001b' },
  brandDotGold: { backgroundColor: '#f79e1b', marginLeft: -12 },
  watermark: { position: 'absolute', right: -8, bottom: -12 },
  number: {
    fontSize: 22,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.92)',
    marginBottom: theme.spacing.stackMd,
  },
  frontBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  field: {},
  fieldRight: { alignItems: 'flex-end' },
  fieldLabel: { fontSize: 8, color: 'rgba(255,255,255,0.5)', marginBottom: 3 },
  fieldValue: { fontSize: 13, letterSpacing: 1 },
  brandLabel: {
    position: 'absolute',
    top: -2,
    right: 0,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  stripe: {
    height: 44,
    backgroundColor: '#000',
    marginHorizontal: -theme.spacing.stackMd,
    marginTop: theme.spacing.stackSm,
  },
  cvvRow: { alignItems: 'flex-end', marginTop: theme.spacing.stackMd },
  cvvBox: {
    width: '66%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 6,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cvvText: { textAlign: 'right', letterSpacing: 3, color: '#111' },
  backNote: {
    marginTop: 'auto',
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
  },
});

export default CreditCard;
