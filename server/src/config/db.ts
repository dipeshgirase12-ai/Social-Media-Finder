import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

let connected = false;

/** Connect to MongoDB. Resolves true on success, false on failure (server still boots). */
export async function connectDatabase(): Promise<boolean> {
  if (connected) return true;
  try {
    await mongoose.connect(env.mongoUri);
    connected = true;
    logger.info('MongoDB connected');
    return true;
  } catch (err) {
    logger.error('MongoDB connection failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
