import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { RemoteImage } from '../components/RemoteImage';
import { theme } from '../theme';
import { formatCop } from '../utils/format';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart, selectCartCount } from '../store/slices/cartSlice';
import type { RootStackScreenProps } from '../navigation/types';

/** Paso 3/7 — Detalle y selección de producto. */
export const ProductDetailScreen: React.FC<
  RootStackScreenProps<'ProductDetail'>
> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const dispatch = useAppDispatch();
  const product = useAppSelector((state) =>
    state.products.items.find((p) => p.id === route.params.productId),
  );
  const cartCount = useAppSelector((s) => selectCartCount(s.cart.items));

  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <View style={styles.notFound}>
        <AppText variant="headlineMd">Producto no encontrado</AppText>
      </View>
    );
  }

  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    if (outOfStock) return;
    dispatch(addToCart({ productId: product.id, qty }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <View style={styles.container}>
      {/* Barra superior fija */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Volver">
          <Icon name="arrow-back" size={26} color={theme.colors.onSurface} />
        </Pressable>
        <View style={styles.topRight}>
          <Pressable onPress={() => setFavorite((f) => !f)} hitSlop={10} accessibilityLabel="Favorito">
            <Icon
              name={favorite ? 'favorite' : 'favorite-border'}
              size={24}
              color={favorite ? theme.colors.primary : theme.colors.onSurface}
            />
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate('Cart')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Ver carrito"
          >
            <Icon name="shopping-cart" size={24} color={theme.colors.onSurface} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <AppText variant="labelCaps" color="onPrimary" style={styles.cartBadgeText}>
                  {cartCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Imagen full-bleed */}
        <RemoteImage
          uri={product.image}
          style={{ width: screenWidth, height: screenWidth * 0.9 }}
        />

        <View style={styles.content}>
          {product.badge ? (
            <AppText variant="labelCaps" color="outline" style={styles.badge}>
              {product.badge}
            </AppText>
          ) : null}

          <AppText variant="headlineMd" color="onSurface" style={styles.title}>
            {product.name}
          </AppText>

          <AppText variant="headlineMd" color="primary" style={styles.price}>
            {formatCop(product.priceCop)}
          </AppText>

          <View style={styles.metaRow}>
            <Icon name="star" size={16} color={theme.colors.secondaryFixedDim} />
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.metaText}>
              {product.rating.toFixed(1)}
            </AppText>
            {product.artisan ? (
              <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.metaText}>
                · Artesano: {product.artisan}
              </AppText>
            ) : null}
          </View>

          {product.description ? (
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.description}>
              {product.description}
            </AppText>
          ) : null}

          {/* Selector de cantidad */}
          <View style={styles.qtyRow}>
            <AppText variant="labelCaps" color="onSurfaceVariant">
              Cantidad
            </AppText>
            <View style={styles.qtyControls}>
              <Pressable
                style={styles.qtyButton}
                onPress={() => setQty((q) => Math.max(1, q - 1))}
                accessibilityLabel="Disminuir cantidad"
              >
                <Icon name="remove" size={20} color={theme.colors.onSurface} />
              </Pressable>
              <AppText variant="bodyLg" color="onSurface" style={styles.qtyValue}>
                {qty}
              </AppText>
              <Pressable
                style={styles.qtyButton}
                onPress={() => setQty((q) => Math.min(product.stock, q + 1))}
                accessibilityLabel="Aumentar cantidad"
              >
                <Icon name="add" size={20} color={theme.colors.onSurface} />
              </Pressable>
            </View>
          </View>

          <AppText
            variant="labelCaps"
            color={outOfStock ? 'error' : 'tertiary'}
            style={styles.stock}
          >
            {outOfStock ? 'Agotado' : `${product.stock} disponibles`}
          </AppText>

          {/* Total + agregar (al final del flujo, no sticky) */}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <AppText variant="labelCaps" color="onSurfaceVariant">
              Total
            </AppText>
            <AppText variant="headlineMd" color="onSurface" style={styles.total}>
              {formatCop(product.priceCop * qty)}
            </AppText>
          </View>

          <Pressable
            testID="add-to-cart"
            style={[styles.addButton, (outOfStock || added) && styles.addButtonAlt]}
            onPress={handleAdd}
            disabled={outOfStock}
            accessibilityRole="button"
          >
            <AppText variant="labelCaps" color="onPrimary">
              {outOfStock ? 'Agotado' : added ? 'Agregado' : 'Agregar al carrito'}
            </AppText>
            <View style={styles.arrowCircle}>
              <Icon
                name={added ? 'check' : 'arrow-forward'}
                size={18}
                color={theme.colors.onSurface}
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackSm,
    backgroundColor: theme.colors.background,
    zIndex: 2,
  },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.stackMd },
  cartBadge: {
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
  cartBadgeText: { fontSize: 10, letterSpacing: 0 },
  scroll: { paddingBottom: 32 },
  content: { paddingHorizontal: theme.spacing.marginMobile },
  badge: { marginTop: theme.spacing.stackMd },
  title: { marginTop: theme.spacing.stackSm, fontSize: 26, lineHeight: 32 },
  price: { marginTop: theme.spacing.stackSm, fontSize: 24 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.stackSm,
    flexWrap: 'wrap',
  },
  metaText: { marginLeft: 6 },
  description: { marginTop: theme.spacing.stackMd },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackLg,
  },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { minWidth: 36, textAlign: 'center' },
  stock: { marginTop: theme.spacing.stackMd },
  divider: {
    height: 1,
    backgroundColor: theme.colors.surfaceContainerHigh,
    marginTop: theme.spacing.stackLg,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackMd,
  },
  total: { fontSize: 22 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.onSurface,
    paddingVertical: 14,
    paddingLeft: theme.spacing.stackLg,
    paddingRight: theme.spacing.unit,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.stackMd,
  },
  addButtonAlt: { backgroundColor: theme.colors.tertiary },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductDetailScreen;
