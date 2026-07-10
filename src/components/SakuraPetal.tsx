import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions } from 'react-native';

export interface SakuraPetalProps {
  /** Posición horizontal inicial (0..1 del ancho de pantalla). */
  startXRatio: number;
  /** Retraso antes de iniciar la caída (ms). */
  delay: number;
  /** Duración de una caída completa (ms). */
  duration: number;
  /** Tamaño del pétalo (px). */
  size: number;
}

/**
 * Pétalo de sakura que cae con rotación y vaivén horizontal.
 * Recrea, con el Animated nativo de RN, el efecto three.js del diseño.
 */
export const SakuraPetal: React.FC<SakuraPetalProps> = ({
  startXRatio,
  delay,
  duration,
  size,
}) => {
  const { width, height } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration,
        delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [progress, duration, delay]);

  const startX = startXRatio * width;
  const sway = size * 2.5;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-size * 2, height + size * 2],
  });
  const translateX = progress.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [startX, startX + sway, startX - sway, startX + sway, startX],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.petal,
        {
          width: size,
          height: size,
          transform: [{ translateX }, { translateY }, { rotate }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  petal: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#ffd1dc', // rosa sakura (del material three.js del diseño)
    opacity: 0.75,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopRightRadius: 3,
    borderBottomLeftRadius: 3,
  },
});

export default SakuraPetal;
