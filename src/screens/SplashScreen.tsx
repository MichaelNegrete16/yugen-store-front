import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Image,
  Platform,
  Easing,
} from 'react-native';
import { AppText } from '../components/AppText';
import { SakuraPetal } from '../components/SakuraPetal';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

const LOGO = require('../../assets/images/logo.png');

/** Configuración de los pétalos que caen (variedad de posición/ritmo). */
const PETALS = [
  { startXRatio: 0.1, delay: 0, duration: 5200, size: 14 },
  { startXRatio: 0.25, delay: 1200, duration: 6000, size: 10 },
  { startXRatio: 0.4, delay: 600, duration: 4800, size: 16 },
  { startXRatio: 0.55, delay: 2000, duration: 5600, size: 12 },
  { startXRatio: 0.7, delay: 400, duration: 6400, size: 11 },
  { startXRatio: 0.85, delay: 1600, duration: 5000, size: 15 },
  { startXRatio: 0.5, delay: 2600, duration: 7000, size: 9 },
];

const LOADING_MS = 2400;

/** Paso 1/7 — Splash Yūgen con animación de bienvenida. */
export const SplashScreen: React.FC<RootStackScreenProps<'Splash'>> = ({
  navigation,
}) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const barProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Revelado del logo + texto
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Barra de carga → al terminar, navega a Home
    const bar = Animated.timing(barProgress, {
      toValue: 1,
      duration: LOADING_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    bar.start(({ finished }) => {
      if (finished) {
        navigation.replace('Home');
      }
    });
    return () => bar.stop();
  }, [logoOpacity, logoScale, textOpacity, barProgress, navigation]);

  const barWidth = barProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Capa de pétalos cayendo */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PETALS.map((p, i) => (
          <SakuraPetal key={i} {...p} />
        ))}
      </View>

      {/* Logo + tagline */}
      <View style={styles.center}>
        <Animated.View
          style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        <Animated.View style={[styles.tagWrap, { opacity: textOpacity }]}>
          <AppText style={styles.tagline} color="onSurfaceVariant">
            Descubre la belleza de Japón
          </AppText>
        </Animated.View>
      </View>

      {/* Barra de carga */}
      <View style={styles.loadingWrap}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: barWidth }]} />
        </View>
        <AppText
          variant="labelCaps"
          color="onSurfaceVariant"
          style={styles.loadingLabel}
        >
          Cargando excelencia
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  tagWrap: {
    marginTop: theme.spacing.stackMd,
  },
  tagline: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
    fontSize: 18,
    fontStyle: 'italic',
    letterSpacing: 2,
    textAlign: 'center',
  },
  loadingWrap: {
    position: 'absolute',
    bottom: theme.spacing.stackXl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  barTrack: {
    width: 192,
    height: 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.outlineVariant,
    overflow: 'hidden',
  },
  barFill: {
    height: 2,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryFixedDim,
  },
  loadingLabel: {
    marginTop: theme.spacing.stackMd,
    opacity: 0.6,
  },
});

export default SplashScreen;
