import { Platform } from 'react-native';

/**
 * Dirección pública de la web, donde los amigos abren el link de una carrera.
 * Se puede sobrescribir con EXPO_PUBLIC_WEB_URL (por ejemplo, para probar en el teléfono).
 */
export const PUBLIC_WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://porras.local/porras';

export function shareLink(slug: string) {
  return `${PUBLIC_WEB_URL}/c/${slug}`;
}

/**
 * Dirección de la API.
 * - Web servida por Nginx: mismo dominio, ruta /api (sin problemas de CORS).
 * - Web en desarrollo (Expo en el puerto 8081): la API corre aparte en el puerto 3000.
 * - Emulador de Android: 10.0.2.2 es la PC anfitriona.
 * Un teléfono físico necesita EXPO_PUBLIC_API_URL con la IP de la PC (ver INSTALL.md).
 */
export function apiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS !== 'web') return 'http://10.0.2.2:3000/api';
  if (typeof window !== 'undefined' && window.location.port === '8081') {
    return 'http://localhost:3000/api';
  }
  return '/api';
}
