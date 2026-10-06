import { z } from 'zod';

/** Límites de negocio: la app y la API usan exactamente los mismos. */
export const LIMITS = {
  eventNameMaxChars: 120,
  cityMaxChars: 80,
  senderNameMaxChars: 60,
  messageMaxChars: 500,
  audioMaxSeconds: 60,
} as const;

/** Datos que captura el corredor al crear una carrera. */
export const createRaceSchema = z.object({
  eventName: z
    .string()
    .trim()
    .min(3, { error: 'El nombre del evento debe tener al menos 3 caracteres' })
    .max(LIMITS.eventNameMaxChars),
  startsAt: z.iso.datetime({ offset: true, error: 'Fecha y hora de salida inválidas' }),
  city: z.string().trim().max(LIMITS.cityMaxChars).optional(),
  distanceKm: z.number().positive().max(500).optional(),
});
export type CreateRaceInput = z.infer<typeof createRaceSchema>;

/** Campos de texto del formulario público donde un amigo manda su porra. */
export const sendMessageSchema = z.object({
  senderName: z
    .string()
    .trim()
    .min(1, { error: 'Escribe tu nombre' })
    .max(LIMITS.senderNameMaxChars),
  body: z.string().trim().max(LIMITS.messageMaxChars).optional(),
  acceptedTerms: z.literal(true, {
    error: 'Debes aceptar los Términos y el Aviso de Privacidad',
  }),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
