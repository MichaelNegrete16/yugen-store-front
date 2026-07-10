import { Platform, ViewStyle } from 'react-native';

/**
 * Profundidad del sistema Yūgen.
 *
 * La elevación se comunica con "Soft Ambient Shadows" (sombras muy
 * difusas y sutiles) y capas tonales, no con sombras duras.
 * Ref DESIGN.md: sombra difusa (blur 40, opacidad 4%, color #1F1F1F).
 *
 * iOS usa shadowColor/Offset/Opacity/Radius; Android usa `elevation`.
 */

const SHADOW_COLOR = '#1f1f1f';

export const elevation: Record<'none' | 'soft' | 'card' | 'floating', ViewStyle> = {
  none: {},
  // Elevación sutil para superficies "levantadas"
  soft: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.04,
      shadowRadius: 20,
    },
    android: { elevation: 2 },
    default: {},
  }) as ViewStyle,
  // Tarjetas de producto
  card: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.06,
      shadowRadius: 28,
    },
    android: { elevation: 4 },
    default: {},
  }) as ViewStyle,
  // Backdrops / modales flotantes (efecto Shoji)
  floating: Platform.select({
    ios: {
      shadowColor: SHADOW_COLOR,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.08,
      shadowRadius: 40,
    },
    android: { elevation: 12 },
    default: {},
  }) as ViewStyle,
};

/** Borde suave estándar (1px gris claro) para estructura sutil. */
export const softBorder = {
  borderWidth: 1,
  borderColor: '#ececec',
} as const;
