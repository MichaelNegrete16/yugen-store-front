/**
 * Sistema de diseño Yūgen — punto de entrada único.
 *
 * Uso:
 *   import { theme } from '@/theme';
 *   ...
 *   backgroundColor: theme.colors.surface
 *   ...theme.typography.headlineMd
 */
import { colors } from './colors';
import { typography, fontFamily } from './typography';
import { spacing, radius } from './spacing';
import { elevation, softBorder } from './elevation';

export const theme = {
  colors,
  typography,
  fontFamily,
  spacing,
  radius,
  elevation,
  softBorder,
} as const;

export type Theme = typeof theme;

export { colors, typography, fontFamily, spacing, radius, elevation, softBorder };
export type { ColorToken } from './colors';
export type { TypographyVariant } from './typography';
export type { SpacingToken, RadiusToken } from './spacing';
