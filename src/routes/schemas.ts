import { z } from 'zod';

const emailSchema = z
  .string({ required_error: 'email é obrigatório' })
  .trim()
  .min(3, 'email muito curto')
  .max(320, 'email muito longo')
  .email('email em formato inválido');

export const generateRequestSchema = z
  .object({
    email: emailSchema
  })
  .strict();

export const batchRequestSchema = z
  .object({
    emails: z.array(emailSchema).min(1, 'emails deve conter ao menos 1 item'),
    concurrency: z.number().int().positive().optional()
  })
  .strict();

export type GenerateRequest = z.infer<typeof generateRequestSchema>;
export type BatchRequest = z.infer<typeof batchRequestSchema>;
