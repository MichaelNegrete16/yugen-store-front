import { useEffect } from 'react';
import { useGetProductsQuery } from './apiSlice';
import { useAppDispatch } from '../store/hooks';
import { setProducts } from '../store/slices/productsSlice';

/**
 * Carga el catálogo del backend (RTK Query) y lo sincroniza con el store,
 * para que las pantallas que leen `state.products.items` usen datos reales.
 * Si el backend falla, el store conserva el catálogo mock (resiliencia).
 * No renderiza nada.
 */
export const ProductsSync: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data } = useGetProductsQuery();

  useEffect(() => {
    if (data && data.length > 0) {
      dispatch(setProducts(data));
    }
  }, [data, dispatch]);

  return null;
};

export default ProductsSync;
