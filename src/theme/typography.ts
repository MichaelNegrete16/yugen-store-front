/**
 * Tipografía del sistema Yūgen.
 *
 * Familia principal: Plus Jakarta Sans (pesos 300–700).
 * Acento "zen": Noto Serif JP (tagline / detalles editoriales).
 *
 * Nota RN: a diferencia de la web, React Native usa puntos (no em/rem).
 * - letterSpacing: se convierte de `em` a puntos (em * fontSize).
 * - lineHeight: se convierte del multiplicador a puntos (mult * fontSize).
 * En Android los pesos de fuentes custom se seleccionan por `fontFamily`
 * (un archivo .ttf por peso), no por `fontWeight`.
 */

export const fontFamily = {
  light: 'PlusJakartaSans-Light', // 300
  regular: 'PlusJakartaSans-Regular', // 400
  medium: 'PlusJakartaSans-Medium', // 500
  semiBold: 'PlusJakartaSans-SemiBold', // 600
  bold: 'PlusJakartaSans-Bold', // 700
  serif: 'NotoSerifJP-Regular', // acento zen
} as const;

export const typography = {
  // Título display (desktop / tablets grandes)
  displayLg: {
    fontFamily: fontFamily.light,
    fontSize: 64,
    lineHeight: 70,
    letterSpacing: -1.28,
  },
  // Título display (móvil)
  displayLgMobile: {
    fontFamily: fontFamily.light,
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.4,
  },
  // Encabezados de sección
  headlineMd: {
    fontFamily: fontFamily.medium,
    fontSize: 32,
    lineHeight: 42,
    letterSpacing: 0.64,
  },
  // Cuerpo grande
  bodyLg: {
    fontFamily: fontFamily.regular,
    fontSize: 18,
    lineHeight: 29,
    letterSpacing: 0.18,
  },
  // Cuerpo estándar
  bodyMd: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0.16,
  },
  // Etiquetas / metadatos en mayúsculas con tracking amplio
  labelCaps: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 1.8,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
