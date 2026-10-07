/**
 * Datos de prueba de la Fase 1. Tienen la misma forma que las tablas `races` y `messages`
 * del modelo de datos; en la Fase 2 se reemplazan por llamadas a la API.
 */

export type Race = {
  id: string;
  eventName: string;
  /** Fecha y hora de salida en ISO 8601 con zona horaria. */
  startsAt: string;
  city: string;
  distanceKm: number;
  shareSlug: string;
  messagesOpen: boolean;
};

export type Message = {
  id: string;
  raceId: string;
  senderName: string;
  body: string;
  createdAt: string;
  listened: boolean;
};

export const RUNNER_NAME = 'Jesús';

export const RACES: Race[] = [
  {
    id: '1',
    eventName: 'Medio Maratón de Guanajuato',
    startsAt: '2026-11-15T07:00:00-06:00',
    city: 'Guanajuato',
    distanceKm: 21.1,
    shareSlug: 'medio-gto-k7f2',
    messagesOpen: true,
  },
  {
    id: '2',
    eventName: 'Maratón de la Ciudad de México',
    startsAt: '2026-08-30T06:00:00-06:00',
    city: 'Ciudad de México',
    distanceKm: 42.195,
    shareSlug: 'maraton-cdmx-p3x9',
    messagesOpen: false,
  },
];

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    raceId: '1',
    senderName: 'Mamá',
    body: '¡Tú puedes, campeón! Te estaremos esperando en la meta con tacos.',
    createdAt: '2026-10-05T20:14:00-06:00',
    listened: false,
  },
  {
    id: 'm2',
    raceId: '1',
    senderName: 'Caro',
    body: 'Acuérdate de no salir tan rápido los primeros 5 km. ¡A darle!',
    createdAt: '2026-10-04T09:30:00-06:00',
    listened: true,
  },
  {
    id: 'm3',
    raceId: '1',
    senderName: 'Equipo de la oficina',
    body: 'Todo el piso 3 te manda porras. ¡Queremos foto con la medalla!',
    createdAt: '2026-10-02T13:05:00-06:00',
    listened: true,
  },
  {
    id: 'm4',
    raceId: '2',
    senderName: 'Papá',
    body: 'Lo que entrenaste no se olvida. Disfruta cada kilómetro.',
    createdAt: '2026-08-29T21:40:00-06:00',
    listened: true,
  },
];

export function getRace(id: string) {
  return RACES.find((race) => race.id === id);
}

export function getRaceBySlug(slug: string) {
  return RACES.find((race) => race.shareSlug === slug);
}

export function getMessages(raceId: string) {
  return MESSAGES.filter((message) => message.raceId === raceId);
}
