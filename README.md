# Yūgen Store — App móvil

Marketplace japonés de lujo con **checkout de pago con tarjeta**. App móvil en **React Native** (TypeScript) que consume una **API propia (NestJS)** para catálogo, cotización y pagos.

- **Flujo:** Splash → Home → Detalle → Carrito → Checkout → Pago → Resultado → Perfil (historial).
- **Stack:** React Native 0.86, Redux Toolkit + RTK Query (arquitectura Flux), redux-persist con datos de pago **cifrados**, React Navigation (stack + tabs).
- La app **solo** habla con nuestro backend; las llaves de la pasarela viven en el servidor (nunca en la app).

---

## 1. Requisitos previos

Instalar una sola vez en el equipo:

- **Node.js** 20 LTS o superior + npm
- **JDK 17** (Microsoft OpenJDK 17)
- **Android Studio** + SDK (Android 15 / **API 35**), Platform-Tools y Build-Tools
- Variables de entorno:
  - `JAVA_HOME` → carpeta del JDK 17
  - `ANDROID_HOME` → `%LOCALAPPDATA%\Android\Sdk`
  - Agregar al `Path`: `%ANDROID_HOME%\platform-tools`
- Un **celular Android** con **Depuración USB** activada (en Xiaomi/MIUI activar además **"Instalar apps vía USB"** en Opciones de desarrollador).

Verificar que todo esté OK:

```powershell
node -v
adb devices        # debe listar tu celular
npx react-native doctor
```

---

## 2. Instalar dependencias

```powershell
git clone https://github.com/MichaelNegrete16/yugen-store-front.git
cd yugen-store-front
npm install
```

---

## 3. Correr en desarrollo (con recarga en caliente)

Con el celular conectado por USB. Se usan **dos terminales**.

**Terminal 1 — Metro (servidor de JS):**

```powershell
cd yugen-store-front
npm start
```

**Terminal 2 — compilar e instalar en el celular:**

```powershell
cd yugen-store-front\android
.\gradlew.bat app:installDebug
cd ..
adb reverse tcp:8081 tcp:8081
```

Abre la app en el celular. Los cambios de código se reflejan al instante (Fast Refresh).

> **Nota (Windows):** `npx react-native run-android` a veces falla con *"gradlew.bat no se reconoce…"*. Por eso arriba se compila con `.\gradlew.bat app:installDebug` directo, que es lo confiable.
>
> **Nota:** si instalas dependencias nuevas, reinicia Metro con caché limpia: `npm start -- --reset-cache`.

---

## 4. APK lista para usar

Hay una APK **release** ya compilada y lista para instalar en el repositorio:

```
apk/YugenStore.apk
```

Es standalone (JS empaquetado): **funciona sin Metro ni PC**, solo necesita internet (consume el backend desplegado). Para instalarla en un celular conectado por USB:

```powershell
adb install -r apk/YugenStore.apk
```

O cópiala al teléfono y ábrela desde el explorador de archivos (permitir "instalar apps de esta fuente").

### Regenerarla

Genera una APK con el JS empaquetado adentro:

```powershell
cd yugen-store-front\android
.\gradlew.bat assembleRelease
```

La APK queda en:

```
android\app\build\outputs\apk\release\app-release.apk
```

Instalarla en un celular conectado:

```powershell
adb install -r android\app\build\outputs\apk\release\app-release.apk
```

> Está firmada con el *debug keystore* (config del template). Suficiente para distribuir/probar; para Play Store se generaría un keystore propio.

---

## 5. Tests y cobertura

```powershell
npm test                 # corre todos los tests
npm test -- --coverage   # con reporte de cobertura
```

**Resultado actual:** 80 tests en 18 suites, todos en verde.

| Métrica | Cobertura |
|---|---|
| Statements | **86.1%** |
| Lines | **87.5%** |
| Branches | 77.5% |
| Functions | 74.6% |

---

## 6. Estructura del proyecto

```
src/
  api/          Cliente RTK Query (endpoints: products, quote, transactions, orders)
  components/   AppText, ProductCard, CreditCard, PaymentDrawer, BrandLoader, RemoteImage...
  navigation/   Stack raíz + Tab Navigator (barra inferior persistente)
  screens/      Splash, Home, ProductDetail, Cart, Checkout, TransactionResult, Profile
  store/        Redux Toolkit + slices (cart, transaction, orders, products, customer) + persist cifrado
  theme/        Sistema de diseño Yūgen (colores, tipografía, spacing)
  utils/        formato de precios (COP), validación de tarjeta, pricing, toast
```

---

## 7. Notas

- **Backend:** la app consume una API pública desplegada (ver `src/api/config.ts`). No requiere configuración local.
- **Pagos:** usa el ambiente **sandbox** de la pasarela; las tarjetas son de prueba (ej. `4242…` aprueba, `4111…` rechaza). No se mueve dinero real.
- **Seguridad:** la app no contiene credenciales; los datos de la transacción se persisten **cifrados** en el dispositivo.
