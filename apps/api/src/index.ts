import { createApp } from './app';
import { config } from './config';
import { pool } from './db';

const server = createApp().listen(config.port, () => {
  console.log(`API de PorraRun escuchando en el puerto ${config.port}`);
});

// Docker manda SIGTERM al detener el contenedor: cerramos conexiones con orden.
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    server.close(() => {
      pool.end().finally(() => process.exit(0));
    });
  });
}
