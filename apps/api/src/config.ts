/** Configuración leída de variables de entorno (ver .env.example en la raíz del repo). */

const isProduction = process.env.NODE_ENV === 'production';

function required(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return devFallback;
}

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL', 'postgres://porras:porras_local@localhost:5433/porras'),
  jwtSecret: required('JWT_SECRET', 'solo-para-desarrollo-cambiame'),
  jwtExpiresIn: '7d',
  /** Orígenes que pueden llamar a la API desde el navegador (el servidor de Expo en desarrollo). */
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  /** Sal para el hash de IP de quien manda una porra. */
  ipHashSalt: required('IP_HASH_SALT', 'sal-de-desarrollo'),
  /** Detrás de Nginx: confiar en el primer proxy para leer la IP real (X-Forwarded-For). */
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
} as const;
