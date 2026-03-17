import path from 'node:path';
import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { createAuthRouter } from './routes/auth.js';
import { createComplaintsRouter } from './routes/complaints.js';
import { notFound, errorHandler } from './middleware/error.js';
import { env } from './utils/env.js';

export function createApp({ db }) {
  const app = express();

  app.use(morgan('dev'));
  app.use(express.json({ limit: '1mb' }));

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin) return cb(null, true);
        if (env.corsOrigin.length === 0) return cb(null, true);
        if (env.corsOrigin.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );

  // Make CORS errors readable by the frontend
  app.use((err, req, res, next) => {
    if (err && err.message === 'Not allowed by CORS') {
      return res.status(403).json({ message: err.message });
    }
    return next(err);
  });

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploadDir)));

  app.use('/api/auth', createAuthRouter({ db }));
  app.use('/api/complaints', createComplaintsRouter({ db }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

