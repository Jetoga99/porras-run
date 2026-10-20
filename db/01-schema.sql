-- =============================================================================
-- PorraRun · Esquema de la base de datos (PostgreSQL 16)
-- Docker ejecuta este archivo automáticamente la primera vez que crea el volumen
-- (carpeta /docker-entrypoint-initdb.d). Para recrearlo: docker compose down -v
-- =============================================================================

-- Corredores: las únicas personas con cuenta.
CREATE TABLE runners (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(80)  NOT NULL,
  email         VARCHAR(160) NOT NULL,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- El correo se compara sin importar mayúsculas: Jesus@x.mx y jesus@x.mx son la misma cuenta.
CREATE UNIQUE INDEX runners_email_unique ON runners (lower(email));

-- Carreras: cada una tiene un link público (share_slug) para recibir porras.
CREATE TABLE races (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  runner_id     UUID          NOT NULL REFERENCES runners (id) ON DELETE CASCADE,
  event_name    VARCHAR(120)  NOT NULL,
  starts_at     TIMESTAMPTZ   NOT NULL,
  city          VARCHAR(80),
  distance_km   NUMERIC(6, 3) CHECK (distance_km > 0),
  share_slug    VARCHAR(40)   NOT NULL UNIQUE,
  messages_open BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
-- "Mis carreras" filtra por corredor y ordena por fecha de salida.
CREATE INDEX races_runner_starts_idx ON races (runner_id, starts_at DESC);

-- Porras: las manda cualquier persona con el link, sin cuenta.
CREATE TABLE messages (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id           UUID         NOT NULL REFERENCES races (id) ON DELETE CASCADE,
  sender_name       VARCHAR(60)  NOT NULL,
  body              VARCHAR(500),
  audio_path        TEXT,
  audio_seconds     SMALLINT     CHECK (audio_seconds BETWEEN 1 AND 60),
  status            VARCHAR(10)  NOT NULL DEFAULT 'visible'
                                 CHECK (status IN ('visible', 'hidden', 'reported')),
  -- Hash SHA-256 de la IP: permite limitar abusos sin guardar la IP en claro.
  sender_hash       CHAR(64),
  -- Prueba del consentimiento a los Términos y al Aviso de Privacidad.
  terms_accepted_at TIMESTAMPTZ  NOT NULL,
  listened_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT messages_has_content CHECK (body IS NOT NULL OR audio_path IS NOT NULL)
);
CREATE INDEX messages_race_created_idx ON messages (race_id, created_at DESC);
