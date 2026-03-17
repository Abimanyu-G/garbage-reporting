import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 5000),
  jwtSecret: process.env.JWT_SECRET ?? 'change_me_in_production',
  dbPath: process.env.DB_PATH ?? './data/app.db',
  corsOrigin: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  adminEmail: (process.env.ADMIN_EMAIL ?? '').trim().toLowerCase(),
};

