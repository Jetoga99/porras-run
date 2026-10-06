# Instalación (Windows)

Guía para preparar el equipo y correr PorraRun desde cero.

## 1. Herramientas

| Herramienta                | Versión               | Para qué                               | Descarga                                       |
| -------------------------- | --------------------- | -------------------------------------- | ---------------------------------------------- |
| Node.js                    | 24 LTS (mínimo 20.19) | Ejecutar Expo y la API                 | https://nodejs.org                             |
| Git                        | La más reciente       | Control de versiones                   | https://git-scm.com                            |
| Visual Studio Code         | La más reciente       | Editor                                 | https://code.visualstudio.com                  |
| Android Studio             | La más reciente       | Emulador Android y compilación del AAB | https://developer.android.com/studio           |
| Docker Desktop (con WSL 2) | La más reciente       | Nginx y PostgreSQL (fases 1 y 2)       | https://www.docker.com/products/docker-desktop |
| Expo Go (en tu teléfono)   | La de la tienda       | Probar la app en un dispositivo real   | Play Store / App Store                         |

Después de instalar, verifica en una terminal nueva:

```powershell
node -v
npm -v
git --version
docker --version
```

### Android Studio

1. En _More Actions → Virtual Device Manager_, crea un dispositivo (por ejemplo, Pixel con la imagen de Android más reciente).
2. Agrega la variable de entorno `ANDROID_HOME` = `%LOCALAPPDATA%\Android\Sdk` y suma `%ANDROID_HOME%\platform-tools` al `Path`.
3. Verifica con `adb --version`.

## 2. Correr el proyecto

```powershell
git clone https://github.com/<tu-usuario>/porras-run.git
cd porras-run
npm install
npm run web        # navegador
npm run android    # emulador Android (debe estar abierto)
npm start          # QR para Expo Go en el teléfono
```

El teléfono y la PC deben estar en la misma red Wi-Fi para usar Expo Go.

## 3. Versiones del proyecto

Las versiones exactas de cada dependencia quedan fijadas en `package-lock.json`. Principales:

| Paquete      | Versión |
| ------------ | ------- |
| expo         | ~57.0   |
| expo-router  | ~57.0   |
| react-native | 0.86    |
| react        | 19.2    |
| typescript   | ~6.0    |
| zod          | 4.x     |
