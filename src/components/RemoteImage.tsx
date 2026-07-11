import React, { useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';
import { theme } from '../theme';

export interface RemoteImageProps {
  /** URL de la imagen. Si falta o falla, se muestra el placeholder. */
  uri?: string;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'center';
  /** Muestra el texto "Sin imagen" en el placeholder (por defecto true). */
  showLabel?: boolean;
}

/**
 * Imagen remota resiliente: maneja carga y error.
 * Si la URL del backend no es válida o no carga, muestra un placeholder
 * "Sin imagen" CENTRADO en vez de romper la vista.
 */
export const RemoteImage: React.FC<RemoteImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  showLabel = true,
}) => {
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  const showPlaceholder = !uri || failed;

  return (
    <View style={[styles.wrap, style as StyleProp<ViewStyle>]}>
      {showPlaceholder ? (
        <>
          <Icon
            name="image-not-supported"
            size={28}
            color={theme.colors.onSurfaceVariant}
          />
          {showLabel ? (
            <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.label}>
              Sin imagen
            </AppText>
          ) : null}
        </>
      ) : (
        <>
          <Image
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode={resizeMode}
            onError={() => setFailed(true)}
            onLoadEnd={() => setLoading(false)}
          />
          {loading ? <ActivityIndicator color={theme.colors.outline} /> : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // El contenedor centra su contenido: así el placeholder (o el spinner)
  // queda siempre al medio, sin importar el tamaño que reciba por props.
  wrap: {
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: 6, fontSize: 10 },
});

export default RemoteImage;
