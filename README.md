# PorraRun

Los corredores registran su carrera, comparten un link y sus amigos les mandan porras (mensajes de ánimo) antes y durante la carrera.

Un solo código en **Expo (React Native + TypeScript)** genera la web, la app Android y la app iOS. La API usa **Express + PostgreSQL**, y Nginx sirve todo con HTTPS en `https://porras.local`.

> Proyecto desarrollado para el módulo _Despliegue de Aplicaciones Web y Móviles_ (UVEG). Cada fase de desarrollo corresponde a la entrega de un reto.

Para instalar y correr el proyecto paso a paso, consulta **[INSTALL.md](INSTALL.md)**.

## Estructura

```text
porras-run/
├── apps/
│   ├── mobile/                  # Expo: web + Android + iOS (rutas en src/app)
│   └── api/                     # API Express + PostgreSQL (Dockerfile incluido)
├── packages/
│   └── shared/                  # Validaciones (zod) y tipos compartidos por app y API
├── db/
│   ├── 01-schema.sql            # Tablas, índices y relaciones
│   └── 02-seed.sql              # Datos de demostración
├── deploy/nginx/
│   ├── porras.conf              # HTTPS, redirección, proxy a la API, caché
│   └── snippets/security-headers.conf
├── e2e/                         # Pruebas de Playwright (Chromium, Firefox, WebKit)
├── docker-compose.yml           # db + api + web
├── .env.example                 # Variables de entorno (copiar como .env)
└── .github/workflows/ci.yml     # Lint, tipos, formato, build web y pruebas de la API
```

## Arquitectura

```text
Navegador / App ──HTTPS──► Nginx (porras-web) ──/porras/──► web exportada por Expo
                                   │
                                   └──/api/──► API Express (porras-api) ──► PostgreSQL (porras-db)
```

## Comandos

| Comando                                 | Qué hace                                     |
| --------------------------------------- | -------------------------------------------- |
| `npm install`                           | Instala las dependencias de todo el monorepo |
| `npm run export:web`                    | Genera la web estática en `apps/mobile/dist` |
| `docker compose up -d --build`          | Levanta PostgreSQL, la API y Nginx           |
| `npm run web`                           | App en el navegador en modo desarrollo       |
| `npm run android`                       | App en el emulador o teléfono Android        |
| `npm run api:dev`                       | API con recarga automática (sin Docker)      |
| `npm run test:api`                      | Pruebas de la API contra PostgreSQL          |
| `npm run test:e2e`                      | Pruebas en Chromium, Firefox y WebKit        |
| `npm run lint` / `typecheck` / `format` | Calidad del código                           |
| `npm run package:web`                   | Empaqueta `dist` en `porras-web.tar.gz`      |

## Base de datos

Tres tablas con llaves foráneas en cascada: un corredor (`runners`) tiene muchas carreras (`races`) y una carrera recibe muchas porras (`messages`).

| Índice                                      | Para qué                                              |
| ------------------------------------------- | ----------------------------------------------------- |
| `runners_email_unique` sobre `lower(email)` | Un correo por cuenta, sin importar mayúsculas         |
| `races.share_slug` (único)                  | Buscar la carrera por su link público                 |
| `races_runner_starts_idx`                   | "Mis carreras" ordenadas por fecha                    |
| `messages_race_created_idx`                 | Porras de una carrera, de la más nueva a la más vieja |

## API

| Método y ruta                                                                          | Acceso                  | Qué hace                                     |
| -------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------- |
| `GET /api/health`                                                                      | Público                 | Estado de la API y de PostgreSQL             |
| `POST /api/auth/register`, `POST /api/auth/login`                                      | Público (con límite)    | Crea cuenta o inicia sesión; devuelve un JWT |
| `GET /api/me`                                                                          | Corredor                | Perfil de la sesión                          |
| `DELETE /api/me`                                                                       | Corredor (con límite)   | Elimina la cuenta con sus carreras y porras  |
| `GET /api/races`, `POST /api/races`                                                    | Corredor                | Lista y crea carreras                        |
| `GET/PATCH/DELETE /api/races/:id`                                                      | Dueño                   | Detalle, abrir/cerrar recepción, borrar      |
| `GET /api/races/:id/messages`                                                          | Dueño                   | Porras de la carrera                         |
| `PATCH /api/messages/:id`, `POST /api/messages/:id/report`, `DELETE /api/messages/:id` | Dueño                   | Escuchar, ocultar, reportar o borrar         |
| `GET /api/public/races/:slug`                                                          | Público                 | Datos mínimos de la carrera para el amigo    |
| `POST /api/public/races/:slug/messages`                                                | Público (5 cada 10 min) | Mandar una porra                             |

## Seguridad

| Medida                                                                                                                                                                     | Dónde                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| HTTPS con certificado local (mkcert) y redirección 301 de HTTP a HTTPS                                                                                                     | `deploy/nginx/porras.conf`                    |
| `Strict-Transport-Security`, `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy` | `deploy/nginx/snippets/security-headers.conf` |
| Contraseñas con bcrypt, sesiones con JWT, IP guardada solo como hash                                                                                                       | `apps/api`                                    |
| Validación de todas las entradas con zod (mismas reglas en app y API)                                                                                                      | `packages/shared`                             |
| Límite de peticiones en inicio de sesión y en el link público                                                                                                              | `apps/api/src/middleware/rate-limit.ts`       |
| Consultas parametrizadas (sin concatenar SQL) y cada corredor solo ve lo suyo                                                                                              | `apps/api/src/routes`                         |
| Aviso de Privacidad y Términos de uso visibles en el pie de todas las pantallas                                                                                            | `/porras/privacidad`, `/porras/terminos`      |

## Despliegue de la web

1. **Exportar.** `npm run export:web` genera `apps/mobile/dist`. En `app.json`, `experiments.baseUrl: "/porras"` hace que todas las rutas apunten a `/porras/...`, y `web.output: "static"` pre-genera un HTML por pantalla.
2. **Empaquetar.** `npm run package:web` crea `porras-web.tar.gz` con el contenido de `dist`.
3. **Servir.** `docker compose up -d --build` y abre https://porras.local.

Ajustes de Nginx para la web:

| Ajuste                                                              | Para qué                                                                               |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `try_files $uri $uri.html ...`                                      | Recargar una ruta interna sirve su HTML en vez de dar 404                              |
| Ubicaciones para `/c/...` y `/carreras/...`                         | Un slug o id cae en la plantilla `[slug].html` o `[id].html` y Expo Router lo resuelve |
| `gzip`                                                              | El JS principal se transfiere comprimido (~75 % menos)                                 |
| Caché de 1 año en `_expo/static` y `no-cache` en el HTML            | Archivos con hash en caché; despliegues nuevos visibles de inmediato                   |
| `include security-headers.conf` en cada `location` con `add_header` | En Nginx, un `add_header` en una `location` anula los heredados del `server`           |
| `proxy_hide_header` en `/api/`                                      | Evita headers de seguridad duplicados (helmet y Nginx)                                 |

## Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/): `feat`, `fix`, `build`, `ci`, `docs`, `test`, `chore`.

## Estado

- [x] Fase 0: monorepo, app Expo, paquete compartido y CI
- [x] Fase 1: web navegable con datos de prueba y Nginx (Reto 2)
- [x] Fase 2: PostgreSQL, API, HTTPS, headers de seguridad, legales y pruebas (Reto 3)
- [x] Fase 4: Android — AAB firmado en GitHub Actions, ficha de Google Play simulada (Reto 4)
- [x] Fase 5: iOS — Xcode en GitHub Actions, .ipa, App Store Connect simulado (Reto 5)
- [ ] Fase 3: audio de las porras
