import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { AppText } from '../components/AppText';
import { useAppSelector } from '../store/hooks';
import { selectCartCount } from '../store/slices/cartSlice';
import { theme } from '../theme';

const ICONS: Record<string, string> = {
  Home: 'home',
  Cart: 'shopping-cart',
  Profile: 'person',
};

/** Barra inferior persistente del Tab Navigator. */
export const YugenTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const cartCount = useAppSelector((s) => selectCartCount(s.cart.items));

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom || 12 }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };
        return (
          <Pressable
            key={route.key}
            style={styles.item}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
          >
            <View>
              <Icon
                name={ICONS[route.name] ?? 'circle'}
                size={26}
                color={focused ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              {route.name === 'Cart' && cartCount > 0 ? (
                <View style={styles.badge}>
                  <AppText variant="labelCaps" color="onPrimary" style={styles.badgeText}>
                    {cartCount}
                  </AppText>
                </View>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
  item: { flex: 1, alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, letterSpacing: 0 },
});

export default YugenTabBar;
