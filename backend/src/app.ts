import express, { Application, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { passport } from './config/passport';
import { env } from './config/env';
import reviewRouter from './routes/review.route';
import authRouter from './routes/auth.route';
import { logger } from './utils';
import { ZodError } from 'zod';

export function createApp(): Application {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(cookieParser());

  app.use(
    session({
      secret: env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
      },
    }) as unknown as RequestHandler
  );

  app.use(passport.initialize() as unknown as RequestHandler);
  app.use(passport.session() as unknown as RequestHandler);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', reviewRouter);

  app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error('Error handler caught:', error);

    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.errors.map((err) => ({
          path: err.path.join('.') as string,
          message: err.message,
        })),
      });
      return;
    }

    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
      error: error.message || 'Internal Server Error',
    });
  });

  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}
