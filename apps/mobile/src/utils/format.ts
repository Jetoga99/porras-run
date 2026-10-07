const LOCALE = 'es-MX';
const TIME_ZONE = 'America/Mexico_City';

/** "domingo, 15 de noviembre de 2026" */
export function formatRaceDate(iso: string) {
  return new Date(iso).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TIME_ZONE,
  });
}

/** "07:00" */
export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TIME_ZONE,
  });
}

/** "5 oct, 20:14" */
export function formatShortDateTime(iso: string) {
  const date = new Date(iso).toLocaleDateString(LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: TIME_ZONE,
  });
  return `${date}, ${formatTime(iso)}`;
}

/** "21.1 km" o "42.195 km" */
export function formatDistance(km: number) {
  return `${km} km`;
}
