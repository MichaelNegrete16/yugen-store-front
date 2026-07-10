/**
 * @format
 */

// Polyfill de crypto.getRandomValues (necesario para cifrar el estado
// persistido con crypto-js). DEBE ir antes de importar la App.
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
