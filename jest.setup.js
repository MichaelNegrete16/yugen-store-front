/* Setup global de Jest. */

// Mock de fetch para RTK Query en tests (Node no trae fetch). Devuelve vacío;
// los tests que necesiten datos concretos pueden sobreescribir global.fetch.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('[]'),
    json: () => Promise.resolve([]),
    headers: { get: () => 'application/json' },
    clone() {
      return this;
    },
  }),
);

// Mock del almacenamiento nativo usado por redux-persist.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// En el entorno de test no existe el driver de animación nativo. Forzamos
// que Animated use el driver JS aunque el código pida useNativeDriver:true,
// evitando el crash "getNativeTagFromPublicInstance is not a function" y
// los timers que quedan vivos tras el teardown.
jest.mock('react-native/src/private/animated/NativeAnimatedHelper', () => {
  const actual = jest.requireActual(
    'react-native/src/private/animated/NativeAnimatedHelper',
  );
  const helper = actual.default ?? actual;
  return {
    __esModule: true,
    ...actual,
    shouldUseNativeDriver: () => false,
    default: { ...helper, shouldUseNativeDriver: () => false },
  };
});
