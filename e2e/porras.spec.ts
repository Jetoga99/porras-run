import { expect, test } from '@playwright/test';

test.describe('PorraRun en el navegador', () => {
  test('flujo completo: crear cuenta, registrar carrera, recibir y escuchar una porra', async ({
    page,
    browserName,
  }) => {
    const email = `e2e-${browserName}-${Date.now()}@porrarun.mx`;

    // 1. El corredor crea su cuenta.
    await page.goto('/porras/registro');
    await page.getByLabel('Tu nombre').fill('Ana Corredora');
    await page.getByLabel('Correo').fill(email);
    await page.getByLabel(/Contraseña/).fill('porras2026');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/porras\/carreras$/);
    await expect(page.getByText('Hola, Ana')).toBeVisible();

    // 2. Registra su carrera y obtiene el link.
    await page.getByRole('button', { name: 'Registrar una carrera' }).click();
    await page.getByLabel('Nombre del evento').fill('10K Bosque de Chapultepec');
    await page.getByLabel('Fecha (AAAA-MM-DD)').fill('2026-12-06');
    await page.getByLabel('Hora de salida').fill('07:30');
    await page.getByLabel('Ciudad').fill('Ciudad de México');
    await page.getByLabel('Distancia (km)').fill('10');
    await page.getByRole('button', { name: 'Guardar carrera' }).click();
    await expect(page).toHaveURL(/\/porras\/carreras\/[0-9a-f-]{36}$/);
    const raceUrl = page.url();
    const link = await page.getByText(/\/porras\/c\/10k-bosque-de-chapultepe-/).textContent();
    const slugPath = new URL(link!.trim()).pathname;

    // 3. Un amigo abre el link y manda su porra.
    await page.goto(slugPath);
    await expect(page.getByText('¡Échale porras a Ana!')).toBeVisible();
    await page.getByLabel('Tu nombre').fill('Tío Beto');
    await page.getByLabel('Tu porra').fill('¡Vas a romper tu marca, Ana!');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Enviar porra' }).click();
    await expect(page.getByText('¡Porra enviada!')).toBeVisible();

    // 4. El corredor ve la porra y la marca como escuchada.
    await page.goto(raceUrl);
    await expect(page.getByText('¡Vas a romper tu marca, Ana!')).toBeVisible();
    await page.getByRole('button', { name: 'Marcar como escuchada' }).click();
    await expect(page.getByText('Escuchada', { exact: true })).toBeVisible();
  });

  test('el corredor puede eliminar su cuenta desde la app', async ({ page, browserName }) => {
    await page.goto('/porras/registro');
    await page.getByLabel('Tu nombre').fill('Beto Temporal');
    await page.getByLabel('Correo').fill(`baja-${browserName}-${Date.now()}@porrarun.mx`);
    await page.getByLabel(/Contraseña/).fill('porras2026');
    await page.getByRole('checkbox').click();
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/porras\/carreras$/);

    await page.getByRole('link', { name: 'Eliminar mi cuenta' }).click();
    await expect(page).toHaveURL(/\/porras\/cuenta\/eliminar$/);
    const password = page.getByLabel('Escribe tu contraseña para confirmar');
    await password.fill('equivocada');
    await page.getByRole('button', { name: 'Eliminar mi cuenta para siempre' }).click();
    await expect(page.getByText('La contraseña no es correcta').first()).toBeVisible();

    await password.fill('porras2026');
    await page.getByRole('button', { name: 'Eliminar mi cuenta para siempre' }).click();
    await expect(page.getByText('Tu cuenta fue eliminada')).toBeVisible();
  });

  test('valida el formulario de porra antes de enviarlo', async ({ page }) => {
    await page.goto('/porras/c/medio-gto-k7f2');
    await page.getByRole('button', { name: 'Enviar porra' }).click();
    await expect(page.getByText('Escribe tu nombre')).toBeVisible();
    await expect(page.getByText('Escribe tu porra')).toBeVisible();
    await expect(
      page.getByText('Debes aceptar los Términos y el Aviso de Privacidad'),
    ).toBeVisible();
  });

  test('el Aviso de Privacidad y los Términos están visibles en el pie', async ({ page }) => {
    await page.goto('/porras/');
    const footer = page.getByRole('contentinfo');
    await footer.getByRole('link', { name: 'Aviso de Privacidad' }).click();
    await expect(
      page.getByRole('heading', { name: 'Aviso de Privacidad', level: 2 }),
    ).toBeVisible();
    await expect(page.getByText('Tus derechos ARCO')).toBeVisible();

    await page.getByRole('contentinfo').getByRole('link', { name: 'Términos de uso' }).click();
    await expect(page.getByRole('heading', { name: 'Términos de uso', level: 2 })).toBeVisible();
    await expect(page.getByText('Limitación de responsabilidad')).toBeVisible();
  });

  test('el servidor responde con HTTPS y encabezados de seguridad', async ({ request }) => {
    const response = await request.get('/porras/');
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toContain("default-src 'self'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');

    const health = await request.get('/api/health');
    expect(await health.json()).toMatchObject({ status: 'ok', database: 'ok' });
  });
});
