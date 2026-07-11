import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from './AppText';
import { RemoteImage } from './RemoteImage';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import type { Product } from '../data/products';

export interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAdd?: () => void;
}

/** Tarjeta de producto del grid "Curated Goods". */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAdd,
}) => {
  return (
    <Pressable
      testID="product-card"
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.imageWrap}>
        <RemoteImage uri={product.image} style={styles.image} showLabel={false} />
        {product.badge ? (
          <View style={styles.badge}>
            <AppText variant="labelCaps" color="onSurface" style={styles.badgeText}>
              {product.badge}
            </AppText>
          </View>
        ) : null}
        <Pressable
          style={styles.addButton}
          onPress={onAdd ?? onPress}
          accessibilityLabel={`Agregar ${product.name}`}
          accessibilityRole="button"
        >
          <Icon name="add" size={20} color={theme.colors.onPrimary} />
        </Pressable>
      </View>

      <AppText variant="bodyLg" color="onSurface" numberOfLines={1} style={styles.name}>
        {product.name}
      </AppText>
      <View style={styles.metaRow}>
        <AppText variant="labelCaps" color="secondary">
          {formatCop(product.priceCop)}
        </AppText>
        <View style={styles.rating}>
          <Icon name="star" size={13} color={theme.colors.secondaryFixedDim} />
          <AppText variant="labelCaps" color="onSurfaceVariant" style={styles.ratingText}>
            {product.rating.toFixed(1)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.stackSm,
    left: theme.spacing.stackSm,
    backgroundColor: theme.colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  badgeText: {
    fontSize: 9,
    letterSpacing: 1,
  },
  addButton: {
    position: 'absolute',
    right: theme.spacing.stackSm,
    bottom: theme.spacing.stackSm,
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.soft,
  },
  name: {
    marginTop: theme.spacing.stackSm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    letterSpacing: 0.5,
  },
});

export default ProductCard;
