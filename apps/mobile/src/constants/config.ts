/**
 * Dirección pública de la web, donde los amigos abren el link de una carrera.
 * En la Fase 2 cambia a https://porras.local; se puede sobrescribir con EXPO_PUBLIC_WEB_URL.
 */
export const PUBLIC_WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'http://localhost/porras';

export function shareLink(slug: string) {
  return `${PUBLIC_WEB_URL}/c/${slug}`;
}
