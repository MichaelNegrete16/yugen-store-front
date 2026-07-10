module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Por defecto Jest ignora node_modules al transpilar. React Navigation y
  // varias libs de RN se publican en ESM, así que hay que permitir su
  // transformación (si no, Jest revienta con "Unexpected token 'export'").
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?(' +
      '@react-native|react-native|@react-native/js-polyfills|' +
      '@react-navigation|react-native-screens|react-native-safe-area-context|' +
      'react-native-vector-icons' +
      ')/)',
  ],
};
