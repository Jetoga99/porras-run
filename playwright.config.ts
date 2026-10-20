import { defineConfig, devices } from '@playwright/test';

/**
 * Pruebas de punta a punta contra el stack completo (Nginx + API + PostgreSQL).
 * Requisitos: `docker compose up -d` corriendo y `npx playwright install` una vez.
 * Uso: npm run test:e2e   (reporte: npx playwright show-report)
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://porras.local',
    // Firefox y WebKit de Playwright no usan el almacén de certificados de Windows,
    // así que no confían en el certificado local de mkcert aunque Chrome y Edge sí.
    ignoreHTTPSErrors: true,
    locale: 'es-MX',
    timezoneId: 'America/Mexico_City',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Solo para entornos con un Chromium ya instalado fuera de Playwright.
        launchOptions: process.env.PW_CHROMIUM_PATH
          ? { executablePath: process.env.PW_CHROMIUM_PATH }
          : {},
      },
    },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
