import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../src/app';

const app = createApp();

async function register(email: string, name = 'Jesús Torres') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password: 'porras2026' });
  expect(res.status).toBe(201);
  return res.body.token as string;
}

async function createRace(token: string, eventName = 'Medio Maratón de Guanajuato') {
  const res = await request(app).post('/api/races').set('Authorization', `Bearer ${token}`).send({
    eventName,
    startsAt: '2026-11-15T07:00:00-06:00',
    city: 'Guanajuato',
    distanceKm: 21.1,
  });
  expect(res.status).toBe(201);
  return res.body as { id: string; shareSlug: string };
}

describe('salud', () => {
  it('confirma la conexión con PostgreSQL', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'ok' });
  });
});

describe('cuentas', () => {
  it('registra, inicia sesión y devuelve el perfil', async () => {
    await register('Corredor@PorraRun.mx');
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'corredor@porrarun.mx', password: 'porras2026' });
    expect(login.status).toBe(200);
    const me = await request(app).get('/api/me').set('Authorization', `Bearer ${login.body.token}`);
    expect(me.body).toMatchObject({ name: 'Jesús Torres', email: 'corredor@porrarun.mx' });
  });

  it('no permite dos cuentas con el mismo correo', async () => {
    await register('repetido@porrarun.mx');
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Otra persona', email: 'REPETIDO@porrarun.mx', password: 'porras2026' });
    expect(res.status).toBe(409);
  });

  it('rechaza contraseña incorrecta sin revelar si el correo existe', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'repetido@porrarun.mx', password: 'equivocada' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Correo o contraseña incorrectos');
  });

  it('valida los campos y responde el error por campo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'no-es-correo', password: '123' });
    expect(res.status).toBe(400);
    expect(Object.keys(res.body.fields)).toEqual(['name', 'email', 'password']);
  });

  it('exige sesión en las rutas del corredor', async () => {
    expect((await request(app).get('/api/races')).status).toBe(401);
    const bad = await request(app).get('/api/races').set('Authorization', 'Bearer token-falso');
    expect(bad.status).toBe(401);
  });

  it('elimina la cuenta con sus carreras y porras después de confirmar la contraseña', async () => {
    const token = await register('se-va@porrarun.mx');
    const race = await createRace(token);
    const auth = { Authorization: `Bearer ${token}` };

    const wrong = await request(app).delete('/api/me').set(auth).send({ password: 'equivocada' });
    expect(wrong.status).toBe(401);
    expect(wrong.body.fields.password).toBeDefined();

    const ok = await request(app).delete('/api/me').set(auth).send({ password: 'porras2026' });
    expect(ok.status).toBe(204);

    expect((await request(app).get('/api/me').set(auth)).status).toBe(401);
    expect((await request(app).get(`/api/public/races/${race.shareSlug}`)).status).toBe(404);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'se-va@porrarun.mx', password: 'porras2026' });
    expect(login.status).toBe(401);
  });
});

describe('carreras y porras', () => {
  it('flujo completo: crear carrera, recibir porra por el link y marcarla', async () => {
    const token = await register('flujo@porrarun.mx');
    const race = await createRace(token);
    expect(race.shareSlug).toMatch(/^medio-maraton-de-guanaju-[0-9a-f]{4}$/);

    const publicRace = await request(app).get(`/api/public/races/${race.shareSlug}`);
    expect(publicRace.body).toMatchObject({ runnerName: 'Jesús', messagesOpen: true });
    expect(publicRace.body).not.toHaveProperty('email');

    const sent = await request(app)
      .post(`/api/public/races/${race.shareSlug}/messages`)
      .send({ senderName: 'Mamá', body: '¡Tú puedes!', acceptedTerms: true });
    expect(sent.status).toBe(201);

    const auth = { Authorization: `Bearer ${token}` };
    const list = await request(app).get(`/api/races/${race.id}/messages`).set(auth);
    expect(list.body).toHaveLength(1);
    expect(list.body[0]).toMatchObject({ senderName: 'Mamá', listened: false, status: 'visible' });

    const races = await request(app).get('/api/races').set(auth);
    expect(races.body[0]).toMatchObject({ messageCount: 1, pendingCount: 1 });

    const marked = await request(app)
      .patch(`/api/messages/${list.body[0].id}`)
      .set(auth)
      .send({ listened: true });
    expect(marked.body.listened).toBe(true);

    await request(app).patch(`/api/messages/${list.body[0].id}`).set(auth).send({ hidden: true });
    const afterHide = await request(app).get(`/api/races/${race.id}/messages`).set(auth);
    expect(afterHide.body).toHaveLength(0);
  });

  it('exige aceptar los términos y escribir la porra', async () => {
    const token = await register('terminos@porrarun.mx');
    const race = await createRace(token);
    const res = await request(app)
      .post(`/api/public/races/${race.shareSlug}/messages`)
      .send({ senderName: 'Caro', body: '', acceptedTerms: false });
    expect(res.status).toBe(400);
    expect(res.body.fields).toHaveProperty('acceptedTerms');
  });

  it('no acepta porras cuando la recepción está cerrada', async () => {
    const token = await register('cerrada@porrarun.mx');
    const race = await createRace(token);
    await request(app)
      .patch(`/api/races/${race.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ messagesOpen: false });
    const res = await request(app)
      .post(`/api/public/races/${race.shareSlug}/messages`)
      .send({ senderName: 'Caro', body: 'Ánimo', acceptedTerms: true });
    expect(res.status).toBe(409);
  });

  it('un corredor no puede ver ni tocar las carreras de otro', async () => {
    const owner = await register('dueno@porrarun.mx');
    const intruder = await register('intruso@porrarun.mx');
    const race = await createRace(owner);
    const auth = { Authorization: `Bearer ${intruder}` };
    expect((await request(app).get(`/api/races/${race.id}`).set(auth)).status).toBe(404);
    expect((await request(app).delete(`/api/races/${race.id}`).set(auth)).status).toBe(404);
    expect((await request(app).get('/api/races/no-es-uuid').set(auth)).status).toBe(404);
  });

  it('limita a 5 porras por persona cada 10 minutos', async () => {
    const token = await register('limite@porrarun.mx');
    const race = await createRace(token);
    const send = () =>
      request(app)
        .post(`/api/public/races/${race.shareSlug}/messages`)
        .send({ senderName: 'Spam', body: 'Hola', acceptedTerms: true });
    for (let i = 0; i < 5; i++) expect((await send()).status).toBe(201);
    expect((await send()).status).toBe(429);
  });
});
