const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Ignora artefactos de build nativo de Android (NDK/CMake/Gradle).
    // Evita que el file-watcher de Metro crashee en Windows cuando CMake
    // crea/borra carpetas temporales durante la compilacion.
    blockList: [
      /android[\\/]app[\\/]\.cxx[\\/].*/,
      /android[\\/]app[\\/]build[\\/].*/,
      /android[\\/]build[\\/].*/,
      /android[\\/]\.gradle[\\/].*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
