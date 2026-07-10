import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  ImageBackground,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppText } from '../components/AppText';
import { Avatar } from '../components/Avatar';
import { CategoryChip } from '../components/CategoryChip';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data/products';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addItem, selectCartCount } from '../store/slices/cartSlice';
import { theme } from '../theme';
import type { RootStackScreenProps } from '../navigation/types';

const HERO = require('../../assets/images/hero-sakura.jpg');

/** Chip "Todos" (ver todo el catálogo) + las categorías del catálogo. */
const ALL_KEY = 'all';
const FILTERS = [{ key: ALL_KEY, label: 'Todos', icon: 'grid-view' }, ...CATEGORIES];

/** Normaliza para buscar sin distinguir mayúsculas ni acentos. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Paso 2/7 — Home del marketplace Yūgen. */
export const HomeScreen: React.FC<RootStackScreenProps<'Home'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);
  const cartCount = useAppSelector((state) => selectCartCount(state.cart.items));

  const [category, setCategory] = useState<string>(ALL_KEY);
  const [query, setQuery] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  const searchRef = useRef<TextInput>(null);

  const scrollToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });
  const focusSearch = () => {
    scrollToTop();
    searchRef.current?.focus();
  };

  /** Ítems del nav inferior (Home · Buscar · Carrito · Perfil). */
  const navItems = [
    { key: 'home', icon: 'home', label: 'Inicio', onPress: scrollToTop },
    { key: 'search', icon: 'search', label: 'Buscar', onPress: focusSearch },
    {
      key: 'cart',
      icon: 'shopping-cart',
      label: 'Carrito',
      onPress: () => navigation.navigate('Cart'),
    },
    {
      key: 'profile',
      icon: 'person',
      label: 'Perfil',
      onPress: () => navigation.navigate('Profile'),
    },
  ];

  const q = query.trim();

  const visibleProducts = useMemo(() => {
    // La búsqueda tiene prioridad y corre sobre todo el catálogo.
    if (q) {
      const nq = normalize(q);
      return products.filter(
        (p) =>
          normalize(p.name).includes(nq) ||
          (p.artisan ? normalize(p.artisan).includes(nq) : false),
      );
    }
    return category === ALL_KEY
      ? products
      : products.filter((p) => p.category === category);
  }, [products, category, q]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.spacing.stackSm, paddingBottom: 96 },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <AppText variant="labelCaps" color="onSurfaceVariant">
              Hola,
            </AppText>
            <AppText variant="headlineMd" color="onSurface" style={styles.greetingName}>
              Bienvenido de nuevo
            </AppText>
          </View>
          <Avatar />
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
            ref={searchRef}
            testID="search-input"
            style={styles.searchInput}
            placeholder="Explora la colección..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
          {q ? (
            <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Limpiar búsqueda">
              <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>

        {/* Categorías */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {FILTERS.map((c) => (
            <CategoryChip
              key={c.key}
              testID={`cat-${c.key}`}
              label={c.label}
              icon={c.icon}
              active={category === c.key}
              onPress={() => setCategory(c.key)}
            />
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
            {q ? 'Resultados' : 'Selección Curada'}
          </AppText>
          {q ? null : (
            <AppText variant="labelCaps" color="primary" style={styles.viewAll}>
              Ver todo
            </AppText>
          )}
        </View>
        <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.sectionSub}>
          {q ? `Para «${q}»` : 'Elegidos para el silencio y la forma.'}
        </AppText>

        {/* Grid de productos */}
        {visibleProducts.length > 0 ? (
          <View style={styles.grid}>
            {visibleProducts.map((product) => (
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
        ) : (
          <View style={styles.emptyCategory} testID="empty-category">
            <Icon name={q ? 'search-off' : 'spa'} size={40} color={theme.colors.surfaceContainerHighest} />
            <AppText variant="bodyMd" color="onSurfaceVariant" style={styles.emptyCategoryText}>
              {q
                ? `No encontramos resultados para «${q}».`
                : 'Pronto sumaremos piezas a esta colección.'}
            </AppText>
          </View>
        )}
      </ScrollView>

      {/* Nav inferior (Home · Buscar · Carrito · Perfil) */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 12 }]}>
        {navItems.map((item, i) => (
          <Pressable
            key={item.key}
            testID={`nav-${item.key}`}
            hitSlop={8}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Icon
              name={item.icon}
              size={26}
              color={i === 0 ? theme.colors.primary : theme.colors.onSurfaceVariant}
            />
            {item.key === 'cart' && cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <AppText variant="labelCaps" color="onPrimary" style={styles.cartBadgeText}>
                  {cartCount}
                </AppText>
              </View>
            ) : null}
          </Pressable>
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
  greeting: { flex: 1 },
  greetingName: { fontSize: 20, marginTop: 2 },
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
    paddingVertical: theme.spacing.stackSm,
    marginTop: theme.spacing.stackSm,
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  emptyCategory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.stackXl,
  },
  emptyCategoryText: {
    marginTop: theme.spacing.stackSm,
    textAlign: 'center',
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
