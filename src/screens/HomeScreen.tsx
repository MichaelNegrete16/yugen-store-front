import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Image,
  ImageBackground,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { CategoryChip } from '../components/CategoryChip';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/products';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addItem, selectCartCount } from '../store/slices/cartSlice';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

const AVATAR = require('../../assets/images/avatar.jpg');
const HERO = require('../../assets/images/hero-sakura.jpg');

const NAV_ITEMS = ['home', 'local-cafe', 'search', 'shopping-cart', 'person'];

/** Paso 2/7 — Home del marketplace Yūgen. */
export const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const cartCount = useAppSelector((state) => selectCartCount(state.cart.items));

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.spacing.stackSm, paddingBottom: 96 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Icon name="menu" size={26} color={theme.colors.primary} />
          <View style={styles.greeting}>
            <AppText variant="labelCaps" color="onSurfaceVariant">
              Hola,
            </AppText>
            <AppText variant="headlineMd" color="onSurface" style={styles.greetingName}>
              Bienvenido de nuevo
            </AppText>
          </View>
          <Image source={AVATAR} style={styles.avatar} />
        </View>

        {/* Buscador */}
        <View style={styles.search}>
          <Icon
            name="search"
            size={22}
            color={theme.colors.onSurfaceVariant}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Explora la colección..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {CATEGORIES.map((c, i) => (
            <CategoryChip key={c.key} label={c.label} icon={c.icon} active={i === 0} />
          ))}
        </ScrollView>

        {/* Hero */}
        <ImageBackground source={HERO} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <AppText variant="headlineMd" color="onPrimary" style={styles.heroTitle}>
              Colección Sakura{'\n'}de Primavera
            </AppText>
            <Pressable style={styles.heroButton} accessibilityRole="button">
              <AppText variant="labelCaps" color="onSurface">
                Comprar ahora
              </AppText>
            </Pressable>
          </View>
        </ImageBackground>

        {/* Curated Goods */}
        <View style={styles.sectionHeader}>
          <AppText
            variant="headlineMd"
            color="onSurface"
            numberOfLines={1}
            adjustsFontSizeToFit
            style={styles.sectionTitle}
          >
            Selección Curada
          </AppText>
          <AppText variant="labelCaps" color="primary" style={styles.viewAll}>
            Ver todo
          </AppText>
        </View>
        <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.sectionSub}>
          Elegidos para el silencio y la forma.
        </AppText>

        {/* Grid de productos */}
        <View style={styles.grid}>
          {products.map((product) => (
            <View key={product.id} style={styles.gridItem}>
              <ProductCard
                product={product}
                onPress={() =>
                  navigation.navigate('ProductDetail', { productId: product.id })
                }
                onAdd={() => dispatch(addItem(product.id))}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Nav inferior */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 12 }]}>
        {NAV_ITEMS.map((name, i) => (
          <View key={name}>
            <Icon
              name={name}
              size={26}
              color={i === 0 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            {name === 'shopping-cart' && cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <AppText variant="labelCaps" color="onPrimary" style={styles.cartBadgeText}>
                  {cartCount}
                </AppText>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { flex: 1, marginLeft: theme.spacing.stackMd },
  greetingName: { fontSize: 20, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainer,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    marginTop: theme.spacing.stackMd,
    paddingHorizontal: theme.spacing.stackMd,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLow,
  },
  searchIcon: { marginRight: theme.spacing.stackSm },
  searchInput: {
    flex: 1,
    ...theme.typography.bodyMd,
    color: theme.colors.onSurface,
    padding: 0,
  },
  categories: {
    paddingVertical: theme.spacing.stackLg - 16,
    marginTop: theme.spacing.stackMd,
  },
  hero: {
    height: 200,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.stackSm,
  },
  heroImage: { borderRadius: theme.radius.lg },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27,27,28,0.28)',
  },
  heroContent: { padding: theme.spacing.stackMd },
  heroTitle: { marginBottom: theme.spacing.stackSm },
  heroButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.stackMd,
    paddingVertical: 10,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceContainerLowest,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackLg,
  },
  sectionTitle: { flex: 1, marginRight: theme.spacing.stackMd },
  viewAll: { flexShrink: 0 },
  sectionSub: { marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: theme.spacing.stackMd,
  },
  gridItem: {
    width: '48%',
    marginBottom: theme.spacing.stackLg,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 14,
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: theme.colors.surfaceContainerHigh,
  },
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
  cartBadgeText: {
    fontSize: 10,
    letterSpacing: 0,
  },
});

export default HomeScreen;
