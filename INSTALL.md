# Instalación (Windows)

Guía para reproducir PorraRun desde cero: base de datos PostgreSQL, API Express, web servida por Nginx con HTTPS en `https://porras.local`, y la app móvil en desarrollo.

## 1. Herramientas

| Herramienta                | Versión               | Para qué                             | Instalación                                    |
| -------------------------- | --------------------- | ------------------------------------ | ---------------------------------------------- |
| Node.js                    | 24 LTS (mínimo 20.19) | Expo, API y pruebas                  | https://nodejs.org                             |
| Git                        | La más reciente       | Control de versiones                 | https://git-scm.com                            |
| Docker Desktop (con WSL 2) | La más reciente       | PostgreSQL, API y Nginx              | https://www.docker.com/products/docker-desktop |
| mkcert                     | La más reciente       | Certificado HTTPS local de confianza | `winget install FiloSottile.mkcert`            |
| Android Studio             | La más reciente       | Emulador Android (Reto 4)            | https://developer.android.com/studio           |
| Expo Go (teléfono)         | La de la tienda       | Probar la app en un dispositivo real | Play Store / App Store                         |

Verifica en una terminal nueva:

```powershell
node -v
git --version
docker --version
mkcert -version
```

## 2. Versiones del proyecto

Las versiones exactas quedan fijadas en `package-lock.json`. Principales:

**Servicios (imágenes de Docker)**

| Servicio      | Imagen                                                  |
| ------------- | ------------------------------------------------------- |
| Base de datos | `postgres:16-alpine`                                    |
| API           | `node:24-alpine` (construida con `apps/api/Dockerfile`) |
| Servidor web  | `nginx:1.29-alpine`                                     |

**App (`apps/mobile`)**

| Paquete               | Versión         | Uso                                     |
| --------------------- | --------------- | --------------------------------------- |
| expo                  | 57.0.25         | Framework de la app (web, Android, iOS) |
| expo-router           | 57.0.23         | Navegación por archivos                 |
| react-native / react  | 0.86.3 / 19.2.3 | Interfaz                                |
| react-native-web      | 0.21.3          | Versión web                             |
| @tanstack/react-query | 5.104.2         | Peticiones a la API, caché y reintentos |
| expo-secure-store     | 57.0.4          | Sesión cifrada en el teléfono           |

**API (`apps/api`)**

| Paquete            | Versión | Uso                                                              |
| ------------------ | ------- | ---------------------------------------------------------------- |
| express            | 5.3.0   | Framework del servidor                                           |
| pg                 | 8.23.1  | Conexión con PostgreSQL                                          |
| zod                | 4.6.7   | Validación de datos (compartida con la app en `packages/shared`) |
| helmet             | 8.3.0   | Encabezados de seguridad HTTP                                    |
| express-rate-limit | 8.7.1   | Límite de peticiones (anti-spam en el link público)              |
| bcryptjs           | 3.0.3   | Hash de contraseñas                                              |
| jsonwebtoken       | 9.0.3   | Sesiones con JWT                                                 |
| cors               | 2.8.6   | Permitir al servidor de desarrollo de Expo                       |

**Pruebas y herramientas**

| Paquete            | Versión       | Uso                                   |
| ------------------ | ------------- | ------------------------------------- |
| vitest + supertest | 5.0.4 + 7.3.1 | Pruebas de la API contra PostgreSQL   |
| @playwright/test   | 1.64.1        | Pruebas en Chromium, Firefox y WebKit |
| typescript         | 6.0.3         | Tipos                                 |
| esbuild            | 0.28.2        | Empaquetar la API en un solo archivo  |

## 3. Clonar e instalar dependencias

```powershell
git clone https://github.com/Jetoga99/porras-run.git
cd porras-run
npm install
```

## 4. Variables de entorno

```powershell
Copy-Item .env.example .env
```

Abre `.env` y cambia `JWT_SECRET` e `IP_HASH_SALT` por textos largos y aleatorios. El archivo `.env` no se sube a Git.

## 5. Dominio local `porras.local`

Abre PowerShell **como administrador** y agrega el dominio al archivo `hosts`:

```powershell
Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "127.0.0.1 porras.local"
ipconfig /flushdns
```

Comprueba con `ping porras.local` (debe responder `127.0.0.1`).

## 6. Certificado HTTPS local

mkcert crea una autoridad certificadora local y la registra en Windows, así que Chrome y Edge muestran el candado sin advertencias.

```powershell
mkcert -install
mkdir deploy\certs
mkcert -cert-file deploy\certs\porras.local.pem -key-file deploy\certs\porras.local-key.pem porras.local localhost 127.0.0.1
```

La carpeta `deploy/certs` está en `.gitignore`: las llaves nunca se suben al repositorio.

## 7. Levantar todo

Con Docker Desktop abierto:

```powershell
npm run export:web
docker compose up -d --build
docker compose ps
```

Los tres contenedores (`porras-db`, `porras-api`, `porras-web`) deben aparecer como `healthy` o `running`. Abre **https://porras.local** y entra con la cuenta demo:

- Correo: `demo@porrarun.mx`
- Contraseña: `porras2026`

La primera vez, PostgreSQL ejecuta `db/01-schema.sql` (tablas e índices) y `db/02-seed.sql` (datos demo).

## 8. Verificar la configuración

```powershell
# API y conexión con la base de datos
curl.exe -k https://porras.local/api/health

# Tablas creadas por el script de inicialización
docker exec -it porras-db psql -U porras -d porras -c "\dt"

# Encabezados de seguridad
curl.exe -kI https://porras.local/porras/

# Redirección de HTTP a HTTPS
curl.exe -I http://porras.local/porras/

# Sintaxis de Nginx
docker exec porras-web nginx -t
```

## 9. Desarrollo de la app

Con los contenedores corriendo, la API también escucha en `http://localhost:3000`.

```powershell
npm run web       # navegador: http://localhost:8081/porras (usa la API en localhost:3000)
npm run android   # emulador Android: usa la API en 10.0.2.2:3000
```

Para un **teléfono físico** con Expo Go, crea `apps/mobile/.env.local` con la IP de tu PC (`ipconfig`):

```text
EXPO_PUBLIC_API_URL=http://192.168.1.50:3000/api
```

y vuelve a correr `npm start`.

## 10. Pruebas

**API** (necesita la base de pruebas, una sola vez):

```powershell
docker exec porras-db createdb -U porras porras_test
npm run test:api
```

**Navegadores** (necesita el stack corriendo):

```powershell
npx playwright install
npm run test:e2e
npx playwright show-report
```

**Rendimiento:** en Chrome abre https://porras.local, presiona F12 → pestaña _Lighthouse_ → analiza en modo móvil y escritorio.

## 11. Android: AAB firmado (Reto 4)

La carpeta `apps/mobile/android/` no se versiona: la genera `npx expo prebuild` desde `app.json`. La firma de publicación la agrega el plugin `apps/mobile/plugins/with-android-release-signing.js`, que lee la llave de propiedades de Gradle (nunca del repositorio).

**1. Crear la upload key** (una sola vez; `keytool` viene con el JDK de Android Studio en `C:\Program Files\Android\Android Studio\jbr\bin`). Guárdala fuera del proyecto y respáldala:

```powershell
mkdir $env:USERPROFILE\porrarun-llaves
keytool -genkeypair -v -storetype PKCS12 -keyalg RSA -keysize 2048 -validity 10000 `
  -alias porrarun-upload -keystore $env:USERPROFILE\porrarun-llaves\porrarun-upload.jks
```

**2. Compilar en GitHub Actions** (recomendado). En el repositorio: _Settings → Secrets and variables → Actions_, crea estos secrets:

| Secret                           | Valor                                                                      |
| -------------------------------- | -------------------------------------------------------------------------- |
| `ANDROID_UPLOAD_KEYSTORE_BASE64` | Contenido de `upload-base64.txt` (comando de abajo)                        |
| `ANDROID_UPLOAD_STORE_PASSWORD`  | Contraseña que pusiste en `keytool`                                        |
| `ANDROID_UPLOAD_KEY_ALIAS`       | `porrarun-upload`                                                          |
| `ANDROID_UPLOAD_KEY_PASSWORD`    | La misma contraseña (en PKCS12 la llave y el almacén comparten contraseña) |

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$env:USERPROFILE\porrarun-llaves\porrarun-upload.jks")) |
  Set-Content $env:USERPROFILE\porrarun-llaves\upload-base64.txt
```

Después: _Actions → Android (AAB) → Run workflow_ (o sube una etiqueta `v1.0.0`). Descarga el artefacto `porrarun-android-...`: trae `app-release.aab`, `app-release.apk` y `verificacion.txt` (certificado, `apksigner verify` y `aapt2 dump badging` con paquete, versión, SDK y permisos). Sin los secrets el flujo firma con la llave de depuración y lo avisa.

**3. Compilar en tu PC** (opcional; requiere Android Studio con el SDK y la variable `ANDROID_HOME`). Agrega a `%USERPROFILE%\.gradle\gradle.properties`:

```properties
PORRAS_UPLOAD_STORE_FILE=C:/Users/<tu-usuario>/porrarun-llaves/porrarun-upload.jks
PORRAS_UPLOAD_STORE_PASSWORD=<contraseña>
PORRAS_UPLOAD_KEY_ALIAS=porrarun-upload
PORRAS_UPLOAD_KEY_PASSWORD=<contraseña>
```

```powershell
cd apps/mobile
npx expo prebuild -p android --clean
cd android
.\gradlew.bat bundleRelease assembleRelease
# AAB: app\build\outputs\bundle\release\app-release.aab
# APK: app\build\outputs\apk\release\app-release.apk
```

`prebuild` cambia los scripts `android` e `ios` de `apps/mobile/package.json`: no subas ese cambio (`git diff apps/mobile/package.json` y deshaz solo esas dos líneas).

**4. Probar en el emulador.** Android Studio → _Device Manager_ → crea un Pixel con Android 16 → arrastra `app-release.apk` a la ventana del emulador (o `adb install app-release.apk`). El emulador no resuelve `porras.local` ni confía en el certificado de mkcert, así que las pantallas que usan la API mostrarán el error de conexión; la pantalla de inicio, el Aviso de Privacidad, los Términos y _Eliminar mi cuenta_ funcionan sin servidor.

## 12. iOS: compilación con Xcode en GitHub Actions (Reto 5)

No se necesita Mac: _Actions → iOS (Xcode) → Run workflow_. El flujo corre en macOS con Xcode 26, genera `ios/` con `expo prebuild` y CocoaPods, compila para el simulador, archiva para dispositivo, arma el `.ipa`, le aplica una firma ad hoc con `codesign` y toma capturas y un video en simuladores de iPhone y iPad. En repositorios privados cada minuto de macOS cuenta como 10 de los minutos gratuitos de Actions; en públicos no tiene costo.

El artefacto `porrarun-ios-...` contiene `PorraRun-sin-firma.ipa`, `PorraRun-adhoc.ipa`, `codesign.txt`, `build-settings.txt`, `xcode-version.txt` y la carpeta `capturas/`. Estos `.ipa` no se instalan en un iPhone: para eso hacen falta el certificado Apple Distribution y un perfil de aprovisionamiento de una cuenta de Apple Developer, que se usarían con `xcodebuild -exportArchive` y un `ExportOptions.plist` con `method` = `app-store-connect`.

## 13. Problemas comunes

| Síntoma                                                      | Solución                                                                                                                               |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `ports are not available` en el puerto 5433 de la base       | Cambia `PORRAS_DB_PORT` en `.env` (por ejemplo a 15432) y ajusta `TEST_DATABASE_URL` para las pruebas                                  |
| `docker compose up` dice que el puerto 80 o 443 está ocupado | Detén el otro servicio, o cambia `PORRAS_HTTP_PORT` y `PORRAS_HTTPS_PORT` en `.env`                                                    |
| Firefox muestra "Riesgo de seguridad"                        | Firefox usa su propio almacén de certificados: en `about:config` activa `security.enterprise_roots.enabled` y reinicia Firefox         |
| `porras.local` no abre                                       | Revisa el archivo `hosts` y ejecuta `ipconfig /flushdns`                                                                               |
| Cambié `db/*.sql` y no se aplica                             | Los scripts solo corren con el volumen vacío: `docker compose down -v` y vuelve a levantar (borra los datos)                           |
| La página queda en blanco tras actualizar Expo               | Expo cambió su script en línea: corre `node scripts/csp-hash.mjs` y actualiza el hash en `deploy/nginx/snippets/security-headers.conf` |
