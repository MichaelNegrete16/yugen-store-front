import React, { useMemo, useState } from 'react';
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
import { addItem } from '../store/slices/cartSlice';
import { theme } from '../theme';
import type { MainTabScreenProps } from '../navigation/types';

const HERO = require('../../assets/images/hero-sakura.jpg');

const ALL_KEY = 'all';
const FILTERS = [{ key: ALL_KEY, label: 'Todos', icon: 'grid-view' }, ...CATEGORIES];

/** Normaliza para buscar sin distinguir mayúsculas ni acentos. */
const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

/** Paso 2/7 — Home del marketplace Yūgen. */
export const HomeScreen: React.FC<MainTabScreenProps<'Home'>> = ({
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.items);

  const [category, setCategory] = useState<string>(ALL_KEY);
  const [query, setQuery] = useState('');

  const q = query.trim();

  const visibleProducts = useMemo(() => {
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + theme.spacing.stackSm },
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  scroll: {
    paddingHorizontal: theme.spacing.marginMobile,
    paddingBottom: theme.spacing.stackLg,
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
});

export default HomeScreen;
