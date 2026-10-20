import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Base de datos aparte para pruebas: se recrea desde db/01-schema.sql en cada corrida.
    env: {
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ??
        'postgres://porras:porras_local@localhost:5433/porras_test',
      JWT_SECRET: 'secreto-de-pruebas',
      IP_HASH_SALT: 'sal-de-pruebas',
    },
    setupFiles: ['./test/setup.ts'],
    fileParallelism: false,
  },
});
