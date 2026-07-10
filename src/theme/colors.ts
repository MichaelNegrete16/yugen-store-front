/**
 * Paleta de color del sistema de diseño "Yūgen".
 * Minimalismo de lujo japonés: base papel crema, rojo Hinomaru,
 * acento dorado y verde matcha para estados de éxito.
 *
 * Fuente de verdad: DESIGN.md (Yūgen Aesthetic).
 */
export const colors = {
  // Superficies (tonal layering)
  surface: '#fcf9f8',
  surfaceDim: '#dcd9d9',
  surfaceBright: '#fcf9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae7e7',
  surfaceContainerHighest: '#e5e2e1',
  surfaceVariant: '#e5e2e1',
  surfaceTint: '#bd1119',

  // Texto / contenido sobre superficies
  onSurface: '#1b1b1c',
  onSurfaceVariant: '#5c403d',
  inverseSurface: '#303030',
  inverseOnSurface: '#f3f0ef',

  // Bordes
  outline: '#906f6b',
  outlineVariant: '#e5bdb9',

  // Primary (rojo japonés - Hinomaru)
  primary: '#b20112',
  onPrimary: '#ffffff',
  primaryContainer: '#d62828',
  onPrimaryContainer: '#fff1ef',
  inversePrimary: '#ffb4ab',

  // Secondary (acento dorado - indicadores de lujo)
  secondary: '#735c00',
  onSecondary: '#ffffff',
  secondaryContainer: '#fed65b',
  onSecondaryContainer: '#745c00',

  // Tertiary (verde matcha - estados de éxito / naturaleza)
  tertiary: '#3f6027',
  onTertiary: '#ffffff',
  tertiaryContainer: '#57793d',
  onTertiaryContainer: '#ddffbf',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Fixed (variantes estables para acentos)
  primaryFixed: '#ffdad6',
  primaryFixedDim: '#ffb4ab',
  onPrimaryFixed: '#410002',
  onPrimaryFixedVariant: '#93000d',
  secondaryFixed: '#ffe088',
  secondaryFixedDim: '#e9c349',
  onSecondaryFixed: '#241a00',
  onSecondaryFixedVariant: '#574500',
  tertiaryFixed: '#c7eea6',
  tertiaryFixedDim: '#acd28c',
  onTertiaryFixed: '#0b2000',
  onTertiaryFixedVariant: '#2f4f18',

  // Fondo
  background: '#fcf9f8',
  onBackground: '#1b1b1c',
} as const;

export type ColorToken = keyof typeof colors;
