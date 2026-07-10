import React from 'react';
import { Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { theme } from '../theme';

const DEFAULT_AVATAR = require('../../assets/images/avatar.jpg');

export interface AvatarProps {
  source?: ImageSourcePropType;
  /** Lado en px (avatar cuadrado). Por defecto 44. */
  size?: number;
}

/**
 * Avatar del usuario, consistente en toda la app (Home, Checkout, etc.).
 * Centraliza tamaño, borde y forma para no tener variantes distintas por pantalla.
 */
export const Avatar: React.FC<AvatarProps> = ({ source = DEFAULT_AVATAR, size = 44 }) => (
  <Image
    source={source}
    style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    accessibilityLabel="Avatar del usuario"
  />
);

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: theme.colors.surfaceContainer,
    borderWidth: 1,
    borderColor: theme.colors.outlineVariant,
  },
});

export default Avatar;
