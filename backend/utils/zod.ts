import { z } from 'zod';

export const zodMessages = (error: z.ZodError): string[] =>
  error.issues.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`);
