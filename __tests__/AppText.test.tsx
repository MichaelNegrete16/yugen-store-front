import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { AppText } from '../src/components/AppText';
import { typography, colors } from '../src/theme';

describe('AppText', () => {
  const render = (element: React.ReactElement) => {
    let tree!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(element);
    });
    return tree.toJSON() as ReactTestRenderer.ReactTestRendererJSON;
  };

  it('renderiza el texto hijo', () => {
    const json = render(<AppText>Yūgen</AppText>);
    expect(json.children).toEqual(['Yūgen']);
  });

  it('aplica la variante y color por defecto (bodyMd / onSurface)', () => {
    const json = render(<AppText>Hola</AppText>);
    expect(json.props.style).toMatchObject({
      fontSize: typography.bodyMd.fontSize,
      fontFamily: typography.bodyMd.fontFamily,
      color: colors.onSurface,
    });
  });

  it('aplica variante y color personalizados', () => {
    const json = render(
      <AppText variant="headlineMd" color="primary">
        Título
      </AppText>,
    );
    expect(json.props.style).toMatchObject({
      fontSize: typography.headlineMd.fontSize,
      fontFamily: typography.headlineMd.fontFamily,
      color: colors.primary,
    });
  });

  it('permite sobreescribir estilos con la prop style', () => {
    const json = render(<AppText style={{ marginTop: 10 }}>X</AppText>);
    expect(json.props.style).toMatchObject({ marginTop: 10 });
  });
});
