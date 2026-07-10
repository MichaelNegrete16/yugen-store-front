/**
 * Espaciado y formas del sistema Yūgen.
 *
 * El espaciado sigue el principio "Ma" (間): gaps generosos entre
 * secciones para dar aire y ritmo. Unidad base = 8px.
 * Radios: geometría orgánica, esquinas muy suaves (mín. contenedores 24px).
 */

export const spacing = {
  unit: 8,
  stackSm: 12,
  stackMd: 24,
  stackLg: 48,
  stackXl: 96,
  gutter: 24,
  marginMobile: 20,
  marginDesktop: 64,
  containerMax: 1440,
} as const;

export const radius = {
  sm: 8, // 0.5rem
  DEFAULT: 16, // 1rem
  md: 24, // 1.5rem
  lg: 32, // 2rem
  xl: 48, // 3rem
  full: 9999,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
