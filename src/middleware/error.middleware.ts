import { NextFunction, Request, Response } from 'express';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('[UnhandledError]', error);
  res.status(500).json({
    message: '服务器内部错误',
    detail: error.message
  });
};
