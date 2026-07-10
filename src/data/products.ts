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
  { key: 'tea', label: 'Té', icon: 'local-cafe' },
  { key: 'food', label: 'Comida', icon: 'restaurant' },
  { key: 'gaming', label: 'Juegos', icon: 'sports-esports' },
  { key: 'decor', label: 'Decoración', icon: 'lightbulb' },
  { key: 'gifts', label: 'Regalos', icon: 'card-giftcard' },
];

/**
 * Catálogo mock (datos e imágenes tomados del diseño Yūgen).
 * Se reemplazará por el catálogo servido desde el backend.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'tea-set',
    name: 'Juego de Té de Basalto',
    priceCop: 320000,
    category: 'tea',
    image: require('../../assets/images/products/tea-set.jpg'),
    rating: 4.9,
    stock: 8,
    badge: 'Nuevo',
    description:
      'Juego de té japonés en basalto mate negro, hecho a mano. Sobria elegancia para el ritual diario.',
    artisan: 'Kenzo Tanaka',
  },
  {
    id: 'writing-set',
    name: 'Set de Escritura en Ebonita',
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
    name: 'Set Ritual de Matcha Kuroi',
    priceCop: 340000,
    category: 'tea',
    image: require('../../assets/images/products/matcha-set.jpg'),
    rating: 5.0,
    stock: 3,
    badge: 'Edición Limitada',
    description:
      'Incluye 40g de Matcha de Uji grado ceremonial, de granjas familiares sostenibles.',
    artisan: 'Takuya Matsuo',
  },
];

/** Devuelve un producto por id. */
export const getProductById = (id: string): Product | undefined =>
  PRODUCTS.find((p) => p.id === id);
