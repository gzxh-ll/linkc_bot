import { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { logger } from '../logs/logger';

export const requestLogger = morgan('dev');

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  logger.error('Unhandled error', error.message);
  res.status(500).json({ message: '服务器内部错误', detail: error.message });
};
