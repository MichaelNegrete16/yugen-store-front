import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 1/7 — Splash (placeholder; el diseño real llega en su feature). */
export const SplashScreen: React.FC<RootStackScreenProps<'Splash'>> = ({
  navigation,
}) => {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Home'), 1800);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppText variant="headlineMd" color="onSurface">
        Yūgen Store
      </AppText>
      <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.tag}>
        Discover the Beauty of Japan
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  tag: { marginTop: theme.spacing.stackSm },
});

export default SplashScreen;
