import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Image, Easing } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../theme';

const LOGO = require('../../assets/images/logo.png');
const TRACK_WIDTH = 200;
const SEGMENT = 72;

export interface BrandLoaderProps {
  title: string;
  subtitle?: string;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({ title, subtitle }) => {
  const pulse = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    const slideAnim = Animated.loop(
      Animated.timing(slide, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    pulseAnim.start();
    slideAnim.start();
    return () => {
      pulseAnim.stop();
      slideAnim.stop();
    };
  }, [pulse, slide]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.06] });
  const translateX = slide.interpolate({
    inputRange: [0, 1],
    outputRange: [-SEGMENT, TRACK_WIDTH],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      <AppText variant="headlineMd" color="onSurface" style={styles.title}>
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}

      <View style={styles.track}>
        <Animated.View style={[styles.segment, { transform: [{ translateX }] }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.stackXl,
  },
  logo: { width: 120, height: 120 },
  title: {
    fontSize: 22,
    marginTop: theme.spacing.stackMd,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: theme.spacing.stackSm,
    paddingHorizontal: theme.spacing.stackLg,
  },
  track: {
    width: TRACK_WIDTH,
    height: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.outlineVariant,
    overflow: 'hidden',
    marginTop: theme.spacing.stackLg,
  },
  segment: {
    width: SEGMENT,
    height: 3,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.secondaryFixedDim,
  },
});

export default BrandLoader;
