import { ToastAndroid, Platform, Alert } from 'react-native';

/**
 * Muestra un toast de error/aviso. En Android usa ToastAndroid;
 * en iOS cae a un Alert (que no tiene toast nativo).
 */
export const showToast = (message: string): void => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.LONG);
  } else {
    Alert.alert('', message);
  }
};
