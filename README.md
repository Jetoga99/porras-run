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
├── deploy/nginx/        # Configuración de Nginx para servir la web
├── docker-compose.yml   # Nginx en Docker: http://localhost/porras
├── .github/workflows/   # CI: lint, tipos, formato y build web
└── INSTALL.md           # Cómo preparar el equipo y correr el proyecto
```

Se agregan en fases siguientes: `apps/api` (Express) y `db/` (PostgreSQL).

## Comandos

| Comando               | Qué hace                                           |
| --------------------- | -------------------------------------------------- |
| `npm install`         | Instala las dependencias de todo el monorepo       |
| `npm run web`         | Abre la app en el navegador                        |
| `npm run android`     | Abre la app en el emulador o teléfono Android      |
| `npm start`           | Servidor de desarrollo (escanea el QR con Expo Go) |
| `npm run lint`        | Revisa el código con ESLint                        |
| `npm run typecheck`   | Revisa los tipos de TypeScript                     |
| `npm run format`      | Da formato con Prettier                            |
| `npm run export:web`  | Genera la web estática en `apps/mobile/dist`       |
| `npm run package:web` | Empaqueta `dist` en `porras-web.tar.gz`            |

## Despliegue local de la web

La web se exporta como sitio estático y la sirve Nginx en un contenedor de Docker, en la ruta `/porras`.

1. **Exportar.** `npm run export:web` genera `apps/mobile/dist`. En `app.json`, `experiments.baseUrl: "/porras"` hace que todas las rutas y archivos apunten a `/porras/...`. Con `web.output: "static"` cada pantalla se pre-genera como HTML (mejor primera carga y SEO), incluidas las carreras de prueba mediante `generateStaticParams`.
2. **Empaquetar.** `npm run package:web` crea `porras-web.tar.gz` con el contenido de `dist`, listo para copiarse a cualquier servidor.
3. **Servir.** Con Docker Desktop abierto:

   ```powershell
   docker compose up -d
   ```

   Abre http://localhost/porras. Si el puerto 80 está ocupado, usa otro: `$env:PORRAS_HTTP_PORT=8080; docker compose up -d` y abre http://localhost:8080/porras.

4. **Actualizar.** Después de un nuevo `export:web` no hace falta reiniciar: Nginx lee `dist` directamente (volumen de solo lectura).

Qué hace la configuración de Nginx (`deploy/nginx/porras.conf`):

| Ajuste                                      | Para qué                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `try_files $uri $uri.html ...`              | Recargar una ruta interna (`/porras/carreras`) sirve su HTML en vez de dar 404               |
| Ubicaciones para `/c/...` y `/carreras/...` | Un slug o id nuevo cae en la plantilla `[slug].html` o `[id].html` y Expo Router lo resuelve |
| `gzip`                                      | El JS principal se transfiere comprimido (~75 % menos)                                       |
| Caché de 1 año en `_expo/static`            | Esos archivos llevan un hash en el nombre y nunca cambian                                    |
| `Cache-Control: no-cache` en el HTML        | Un despliegue nuevo se ve de inmediato                                                       |
| `absolute_redirect off`                     | Las redirecciones conservan el puerto cuando no es el 80                                     |
| `server_tokens off`                         | No revelar la versión de Nginx                                                               |
| `error_page 404`                            | Las rutas que no existen muestran la página "no encontrado" de la app                        |

## Pantallas (Fase 1, con datos de prueba)

| Ruta                       | Pantalla                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| `/porras/`                 | Inicio: qué es PorraRun y cómo funciona                                |
| `/porras/carreras`         | Mis carreras, con porras recibidas y sin escuchar                      |
| `/porras/carreras/1`       | Detalle: link para compartir y lista de porras                         |
| `/porras/c/medio-gto-k7f2` | Página del amigo para mandar una porra (validada con `@porras/shared`) |

Los datos viven en `apps/mobile/src/data/mock.ts` y en la Fase 2 se reemplazan por la API.

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
- [x] Fase 1: web navegable con datos de prueba (Reto 2)
- [ ] Fase 2: API y datos reales (Reto 3)
- [ ] Fase 3: audio y moderación
- [ ] Fase 4: Android (Reto 4)
- [ ] Fase 5: iOS (Reto 5)
