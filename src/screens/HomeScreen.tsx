import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AppText } from '../components/AppText';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 2/7 — Home de productos (placeholder). */
export const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({
  navigation,
}) => {
  return (
    <View style={styles.container}>
      <AppText variant="headlineMd">Home</AppText>
      <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.hint}>
        Catálogo de productos
      </AppText>
      <Pressable
        style={styles.button}
        onPress={() => navigation.navigate('ProductDetail', { productId: '1' })}
      >
        <AppText variant="labelCaps" color="onPrimary">
          Ver producto
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.marginMobile,
  },
  hint: { marginTop: theme.spacing.stackSm, marginBottom: theme.spacing.stackLg },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.stackSm,
    paddingHorizontal: theme.spacing.stackMd,
    borderRadius: theme.radius.full,
  },
});

export default HomeScreen;
