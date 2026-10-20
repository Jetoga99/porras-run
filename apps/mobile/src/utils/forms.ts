import type { z } from 'zod';

/** Convierte los errores de zod en { campo: primer mensaje } para mostrarlos bajo cada input. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    result[key] ??= issue.message;
  }
  return result;
}
