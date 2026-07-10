import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography, colors, TypographyVariant, ColorToken } from '../theme';

export interface AppTextProps extends TextProps {
  /** Variante tipográfica del sistema Yūgen. Por defecto: bodyMd. */
  variant?: TypographyVariant;
  /** Color del texto (token del theme). Por defecto: onSurface. */
  color?: ColorToken;
}

/**
 * Texto base del design system Yūgen.
 * Centraliza tipografía y color para que todas las pantallas sean
 * consistentes con DESIGN.md. Reemplaza el uso directo de <Text>.
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMd',
  color = 'onSurface',
  style,
  ...rest
}) => {
  return (
    <Text
      style={StyleSheet.flatten([
        typography[variant],
        { color: colors[color] },
        style,
      ])}
      {...rest}
    />
  );
};

export default AppText;
