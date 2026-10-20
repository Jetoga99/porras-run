import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { config } from './config';
import { errorHandler, notFoundHandler } from './lib/errors';
import { authRouter } from './routes/auth';
import { healthRouter } from './routes/health';
import { publicRouter } from './routes/public';
import { racesRouter } from './routes/races';

export function createApp() {
  const app = express();

  // Detrás de Nginx la IP real llega en X-Forwarded-For (para el límite de peticiones).
  app.set('trust proxy', config.trustProxy);
  app.disable('x-powered-by');

  // Headers de seguridad para las respuestas JSON (Nginx agrega los de la web).
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '20kb' }));

  const api = express.Router();
  api.use(healthRouter);
  api.use(authRouter);
  api.use(publicRouter);
  api.use(racesRouter);
  app.use('/api', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
