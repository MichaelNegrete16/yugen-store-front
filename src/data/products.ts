/** Producto del catálogo Yūgen. */
export interface Product {
  id: string;
  name: string;
  /** Precio en pesos colombianos (COP, sin decimales). */
  priceCop: number;
  category: string;
  /** URL de la imagen (servida por el backend). Puede fallar → placeholder. */
  image: string;
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
 * Catálogo mock (fallback offline mientras carga o si el backend no responde).
 * En runtime se reemplaza por el catálogo servido desde el backend (RTK Query).
 */
export const PRODUCTS: Product[] = [
  {
    id: 'tea-set',
    name: 'Juego de Té de Basalto',
    priceCop: 320000,
    category: 'tea',
    image: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9',
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
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a',
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
    image: 'https://images.unsplash.com/photo-1536013455962-4dc3b8f0f3a9',
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
