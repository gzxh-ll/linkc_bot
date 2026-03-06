import { Response } from 'express';

export const ok = (res: Response, data: unknown): void => {
  res.json(data);
};

export const badRequest = (res: Response, message: string, details?: unknown): void => {
  res.status(400).json({ message, details });
};

export const notFound = (res: Response, message: string): void => {
  res.status(404).json({ message });
};
