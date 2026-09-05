import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { logger } from './utils/logger';

async function main(): Promise<void> {
  const dbOk = await connectDatabase();
  if (!dbOk) {
    logger.warn('Starting without database — search works, history/auth persistence disabled.');
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    logger.info(`DevTrace API listening on port ${env.port}`, {
      env: env.nodeEnv,
      demoMode: env.demoMode,
      db: dbOk ? 'connected' : 'unavailable',
    });
  });

  const shutdown = (): void => {
    logger.info('Shutting down...');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  logger.error('Fatal startup error', { error: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
