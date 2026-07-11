import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from '../src/screens/HomeScreen';
import cartReducer from '../src/store/slices/cartSlice';
import productsReducer from '../src/store/slices/productsSlice';
import transactionReducer from '../src/store/slices/transactionSlice';

const makeStore = () =>
  configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      transaction: transactionReducer,
    },
  });

const metrics = {
  frame: { x: 0, y: 0, width: 400, height: 800 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const collectText = (node: any): string[] => {
  if (node == null) return [];
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(collectText);
  return collectText(node.children);
};

const renderScreen = () => {
  const navigation = { navigate: jest.fn() } as any;
  const route = { key: 'home', name: 'Home', params: undefined } as any;
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <Provider store={makeStore()}>
        <SafeAreaProvider initialMetrics={metrics}>
          <HomeScreen navigation={navigation} route={route} />
        </SafeAreaProvider>
      </Provider>,
    );
  });
  return { tree, navigation };
};

const press = (tree: ReactTestRenderer.ReactTestRenderer, testID: string) =>
  ReactTestRenderer.act(() =>
    tree.root.findByProps({ testID }).props.onPress(),
  );

describe('HomeScreen', () => {
  it('no muestra el menú hamburguesa', () => {
    const { tree } = renderScreen();
    const menus = tree.root.findAll((n) => n.props?.name === 'menu');
    expect(menus).toHaveLength(0);
  });

  it('muestra todos los productos por defecto (chip Todos)', () => {
    const { tree } = renderScreen();
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Juego de Té de Basalto');
    expect(text).toContain('Set de Escritura en Ebonita');
    expect(text).toContain('Set Ritual de Matcha Kuroi');
  });

  it('filtra por categoría al tocar un chip (Té)', () => {
    const { tree } = renderScreen();
    press(tree, 'cat-tea');
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Juego de Té de Basalto'); // tea
    expect(text).toContain('Set Ritual de Matcha Kuroi'); // tea
    expect(text).not.toContain('Set de Escritura en Ebonita'); // gifts
  });

  it('muestra estado vacío en una categoría sin productos (Comida)', () => {
    const { tree } = renderScreen();
    press(tree, 'cat-food');
    expect(tree.root.findAllByProps({ testID: 'empty-category' }).length).toBeGreaterThan(0);
    expect(collectText(tree.toJSON()).join(' ')).toContain('Pronto sumaremos piezas');
  });

  it('vuelve a mostrar todo con el chip Todos', () => {
    const { tree } = renderScreen();
    press(tree, 'cat-food');
    press(tree, 'cat-all');
    expect(tree.root.findAllByProps({ testID: 'empty-category' })).toHaveLength(0);
    expect(collectText(tree.toJSON()).join(' ')).toContain('Set de Escritura en Ebonita');
  });

  const type = (tree: ReactTestRenderer.ReactTestRenderer, text: string) =>
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ testID: 'search-input' }).props.onChangeText(text),
    );

  it('busca por nombre (sin acentos ni mayúsculas)', () => {
    const { tree } = renderScreen();
    type(tree, 'matcha');
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Set Ritual de Matcha Kuroi');
    expect(text).not.toContain('Set de Escritura en Ebonita');
  });

  it('la búsqueda tiene prioridad sobre la categoría', () => {
    const { tree } = renderScreen();
    press(tree, 'cat-food'); // categoría sin productos
    type(tree, 'te'); // debería buscar en todo el catálogo
    const text = collectText(tree.toJSON()).join(' ');
    expect(text).toContain('Juego de Té de Basalto');
    expect(tree.root.findAllByProps({ testID: 'empty-category' })).toHaveLength(0);
  });

  it('muestra estado vacío cuando la búsqueda no encuentra nada', () => {
    const { tree } = renderScreen();
    type(tree, 'zzzz');
    expect(tree.root.findAllByProps({ testID: 'empty-category' }).length).toBeGreaterThan(0);
    expect(collectText(tree.toJSON()).join(' ')).toContain('No encontramos resultados');
  });

  it('limpia la búsqueda con el botón', () => {
    const { tree } = renderScreen();
    type(tree, 'matcha');
    ReactTestRenderer.act(() =>
      tree.root.findByProps({ accessibilityLabel: 'Limpiar búsqueda' }).props.onPress(),
    );
    expect(tree.root.findByProps({ testID: 'search-input' }).props.value).toBe('');
    // Al limpiar vuelve a verse todo el catálogo.
    expect(collectText(tree.toJSON()).join(' ')).toContain('Set de Escritura en Ebonita');
  });
});
