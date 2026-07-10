/**
 * Herramienta de preparación de assets (no forma parte de la app).
 *
 * Toma el logo Yūgen con fondo de papel crema y lo vuelve transparente,
 * para que en la app no se vea el "cuadro" del fondo del PNG.
 *
 * Algoritmo: muestrea el color de las 4 esquinas (el fondo crema) y hace
 * transparente todo pixel cercano a ese color, con un pequeño feathering
 * en el borde para suavizar. El ensō negro y el dorado se conservan.
 *
 * Uso: node scripts/make-transparent-logo.js <entrada> <salida>
 */
const Jimp = require('jimp');

const SRC = process.argv[2] || 'assets/images/logo-source.png';
const OUT = process.argv[3] || 'assets/images/logo.png';

// Distancia de color por debajo de la cual se considera "fondo".
const HARD = 60; // totalmente transparente
const SOFT = 95; // feathering entre HARD y SOFT

function dist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(
    (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2,
  );
}

Jimp.read(SRC)
  .then((img) => {
    const { width, height, data } = img.bitmap;
    const corners = [
      [2, 2],
      [width - 3, 2],
      [2, height - 3],
      [width - 3, height - 3],
    ];
    let br = 0,
      bg = 0,
      bb = 0;
    corners.forEach(([x, y]) => {
      const i = (y * width + x) * 4;
      br += data[i];
      bg += data[i + 1];
      bb += data[i + 2];
    });
    br /= 4;
    bg /= 4;
    bb /= 4;

    img.scan(0, 0, width, height, function (x, y, idx) {
      const d = dist(
        data[idx],
        data[idx + 1],
        data[idx + 2],
        br,
        bg,
        bb,
      );
      if (d <= HARD) {
        data[idx + 3] = 0;
      } else if (d < SOFT) {
        data[idx + 3] = Math.round(((d - HARD) / (SOFT - HARD)) * 255);
      }
    });

    return img.writeAsync(OUT);
  })
  .then(() => {
    console.log(`Logo transparente generado en ${OUT}`);
  })
  .catch((err) => {
    console.error('Error procesando el logo:', err);
    process.exit(1);
  });
