# PorraRun

Los corredores registran su carrera, comparten un link y sus amigos les mandan porras (mensajes de texto y audio) antes y durante la carrera.

Un solo código en **Expo (React Native + TypeScript)** genera la web, la app Android y la app iOS. La API usa **Express + PostgreSQL**.

> Proyecto desarrollado para el módulo _Despliegue de Aplicaciones Web y Móviles_ (UVEG). Cada fase de desarrollo corresponde a la entrega de un reto.

## Estructura

```text
porras-run/
├── apps/
│   └── mobile/          # Expo: web + Android + iOS (rutas en src/app)
├── packages/
│   └── shared/          # Validaciones (zod) y tipos compartidos
├── .github/workflows/   # CI: lint, tipos, formato y build web
└── INSTALL.md           # Cómo preparar el equipo y correr el proyecto
```

Se agregan en fases siguientes: `apps/api` (Express), `db/` (PostgreSQL) y `deploy/` (Nginx y Docker).

## Comandos

| Comando              | Qué hace                                           |
| -------------------- | -------------------------------------------------- |
| `npm install`        | Instala las dependencias de todo el monorepo       |
| `npm run web`        | Abre la app en el navegador                        |
| `npm run android`    | Abre la app en el emulador o teléfono Android      |
| `npm start`          | Servidor de desarrollo (escanea el QR con Expo Go) |
| `npm run lint`       | Revisa el código con ESLint                        |
| `npm run typecheck`  | Revisa los tipos de TypeScript                     |
| `npm run format`     | Da formato con Prettier                            |
| `npm run export:web` | Genera la web estática en `apps/mobile/dist`       |

## Convención de commits

Se usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

- `feat:` nueva funcionalidad
- `fix:` corrección de un error
- `build:` empaquetado, dependencias o build
- `ci:` workflows de GitHub Actions
- `docs:` documentación
- `chore:` mantenimiento

## Estado

- [x] Fase 0: monorepo, app Expo, paquete compartido y CI
- [ ] Fase 1: web navegable con datos de prueba (Reto 2)
- [ ] Fase 2: API y datos reales (Reto 3)
- [ ] Fase 3: audio y moderación
- [ ] Fase 4: Android (Reto 4)
- [ ] Fase 5: iOS (Reto 5)
