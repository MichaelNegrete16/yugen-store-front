import type { ImageSourcePropType } from 'react-native';

/** Producto del catálogo Yūgen. */
export interface Product {
  id: string;
  name: string;
  /** Precio en pesos colombianos (COP, sin decimales). */
  priceCop: number;
  category: string;
  image: ImageSourcePropType;
  rating: number;
  stock: number;
  badge?: string;
  description?: string;
  artisan?: string;
}

/** Categorías del marketplace (icono = nombre en MaterialIcons). */
export const CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'tea', label: 'Tea', icon: 'local-cafe' },
  { key: 'food', label: 'Food', icon: 'restaurant' },
  { key: 'gaming', label: 'Gaming', icon: 'sports-esports' },
  { key: 'decor', label: 'Decor', icon: 'lightbulb' },
  { key: 'gifts', label: 'Gifts', icon: 'card-giftcard' },
];

/**
 * Catálogo mock (datos e imágenes tomados del diseño Yūgen).
 * Se reemplazará por el catálogo servido desde el backend.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'tea-set',
    name: 'Black Basalt Tea Set',
    priceCop: 320000,
    category: 'tea',
    image: require('../../assets/images/products/tea-set.jpg'),
    rating: 4.9,
    stock: 8,
    badge: 'New Arrival',
    description:
      'Juego de té japonés en basalto mate negro, hecho a mano. Sobria elegancia para el ritual diario.',
    artisan: 'Kenzo Tanaka',
  },
  {
    id: 'writing-set',
    name: 'Ebonite Writing Set',
    priceCop: 245000,
    category: 'gifts',
    image: require('../../assets/images/products/writing-set.jpg'),
    rating: 5.0,
    stock: 5,
    description:
      'Pluma de ebonita pulida con plumín dorado sobre cuaderno de papel Washi. Lujo minimalista para escribir.',
    artisan: 'Hiroshi Abe',
  },
  {
    id: 'matcha-set',
    name: 'The Kuroi Matcha Ritual Set',
    priceCop: 340000,
    category: 'tea',
    image: require('../../assets/images/products/matcha-set.jpg'),
    rating: 5.0,
    stock: 3,
    badge: 'Limited Edition',
    description:
      'Incluye 40g de Matcha de Uji grado ceremonial, de granjas familiares sostenibles.',
    artisan: 'Takuya Matsuo',
  },
];

/** Devuelve un producto por id. */
export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);
