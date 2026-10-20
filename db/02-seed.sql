-- =============================================================================
-- PorraRun · Datos de demostración
-- Cuenta demo: demo@porrarun.mx / porras2026
-- =============================================================================

INSERT INTO runners (id, name, email, password_hash) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Jesús', 'demo@porrarun.mx',
   '$2b$10$GBT3vBrzw0O6D0.ksgGgOO69f.mSREtrrAgd5vaEhdvxtjfY9UTGm');

INSERT INTO races (id, runner_id, event_name, starts_at, city, distance_km, share_slug, messages_open) VALUES
  ('22222222-2222-4222-8222-222222222221', '11111111-1111-4111-8111-111111111111',
   'Medio Maratón de Guanajuato', '2026-11-15T07:00:00-06:00', 'Guanajuato', 21.1,
   'medio-gto-k7f2', true),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111',
   'Maratón de la Ciudad de México', '2026-08-30T06:00:00-06:00', 'Ciudad de México', 42.195,
   'maraton-cdmx-p3x9', false);

INSERT INTO messages (race_id, sender_name, body, terms_accepted_at, listened_at, created_at) VALUES
  ('22222222-2222-4222-8222-222222222221', 'Mamá',
   '¡Tú puedes, campeón! Te estaremos esperando en la meta con tacos.',
   '2026-10-05T20:14:00-06:00', NULL, '2026-10-05T20:14:00-06:00'),
  ('22222222-2222-4222-8222-222222222221', 'Caro',
   'Acuérdate de no salir tan rápido los primeros 5 km. ¡A darle!',
   '2026-10-04T09:30:00-06:00', '2026-10-04T10:00:00-06:00', '2026-10-04T09:30:00-06:00'),
  ('22222222-2222-4222-8222-222222222221', 'Equipo de la oficina',
   'Todo el piso 3 te manda porras. ¡Queremos foto con la medalla!',
   '2026-10-02T13:05:00-06:00', '2026-10-02T14:00:00-06:00', '2026-10-02T13:05:00-06:00'),
  ('22222222-2222-4222-8222-222222222222', 'Papá',
   'Lo que entrenaste no se olvida. Disfruta cada kilómetro.',
   '2026-08-29T21:40:00-06:00', '2026-08-29T22:00:00-06:00', '2026-08-29T21:40:00-06:00');
