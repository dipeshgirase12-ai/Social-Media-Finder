import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

export function createApp(): express.Express {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // Security headers.
  app.use(
    helmet({
      contentSecurityPolicy: env.isProd ? undefined : false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // CORS — only the configured client origin, with credentials (httpOnly JWT cookie).
  app.use(
    cors({
      origin: [env.clientUrl],
      credentials: true,
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '16kb' }));
  app.use(cookieParser());
  app.use(requestLogger);

  // Health check (no auth, no DB requirement).
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, service: 'devtrace-api', time: new Date().toISOString() });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
