/**
 * Herramienta de preparación de assets (no forma parte de la app).
 *
 * Genera los íconos del launcher de Android a partir del logo Yūgen,
 * recortando el símbolo (ensō + hoja dorada) para que se lea bien en tamaños
 * pequeños, y los escribe en cada densidad (mipmap-*). Crea el ícono cuadrado
 * (ic_launcher.png) y el redondo (ic_launcher_round.png).
 *
 * Uso: node scripts/make-app-icon.js
 */
const path = require('path');
const Jimp = require('jimp');

const SRC = path.join(__dirname, '..', 'assets', 'images', 'logo.png');
const RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Recorte del símbolo (solo el ensō + hoja, SIN el texto) dentro del logo 1024x1024.
const CROP = { x: 265, y: 157, w: 490, h: 490 };
// Fondo crema del sistema Yūgen (theme.colors.surface).
const CREAM = 0xfcf9f8ff;
// Proporción del símbolo dentro del ícono (deja margen alrededor).
const SCALE = 0.8;

// Densidades del launcher de Android.
const DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

/** Deja transparente todo lo que quede fuera del círculo (ícono redondo). */
function circleMask(img) {
  const { width: w, height: h, data } = img.bitmap;
  const cx = w / 2;
  const cy = h / 2;
  const r = w / 2;
  img.scan(0, 0, w, h, (x, y, idx) => {
    const dx = x - cx + 0.5;
    const dy = y - cy + 0.5;
    if (Math.sqrt(dx * dx + dy * dy) > r) {
      data[idx + 3] = 0;
    }
  });
  return img;
}

/** Símbolo centrado sobre un cuadrado crema del tamaño pedido. */
function makeIcon(symbol, size) {
  const canvas = new Jimp(size, size, CREAM);
  const inner = Math.round(size * SCALE);
  const s = symbol.clone().resize(inner, inner);
  const off = Math.round((size - inner) / 2);
  canvas.composite(s, off, off);
  return canvas;
}

Jimp.read(SRC)
  .then(async (logo) => {
    const symbol = logo.clone().crop(CROP.x, CROP.y, CROP.w, CROP.h);

    for (const [dir, size] of Object.entries(DENSITIES)) {
      const square = makeIcon(symbol, size);
      await square.writeAsync(path.join(RES, dir, 'ic_launcher.png'));

      const round = circleMask(makeIcon(symbol, size));
      await round.writeAsync(path.join(RES, dir, 'ic_launcher_round.png'));

      // eslint-disable-next-line no-console
      console.log(`ok ${dir} (${size}px)`);
    }
    // eslint-disable-next-line no-console
    console.log('Íconos del launcher generados.');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Error generando íconos:', err);
    process.exit(1);
  });
