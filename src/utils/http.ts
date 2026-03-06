import { Response } from 'express';

export const badRequest = (res: Response, message: string, details?: unknown): Response =>
  res.status(400).json({ message, details });

export const notFound = (res: Response, message: string): Response => res.status(404).json({ message });
