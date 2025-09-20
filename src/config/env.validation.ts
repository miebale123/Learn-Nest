import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']),

  PORT: z.coerce
    .number()
    .int()
    .positive()
    .min(1024)
    .max(65535)
    .default(5000)
    .readonly(),

  BCRYPT_SALT_ROUNDS: z.coerce
    .number()
    .positive()
    .min(10, 'salt at least must be 10')
    .readonly(),

  SECRET: z.string().min(1, 'secret required').readonly(),

  DB_HOST: z.string().trim().min(1, 'DB_HOST is required').readonly(),
  DB_PORT: z.coerce.number().int().positive().min(1).max(65535).readonly(),
  DB_USER: z.string().trim().min(1, 'DB_USER is required').readonly(),
  DB_PASSWORD: z.string().trim().min(1, 'DB_PASSWORD is required').readonly(),
  DB_NAME: z.string().trim().min(1, 'DB_NAME is required').readonly(),
  
  DB_SYNCHRONIZE: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toLowerCase() === 'true' : val),
      z.boolean(),
    )
    .default(false)
    .readonly(),
  
  DB_LOGGING: z
    .preprocess(
      (val) => (typeof val === 'string' ? val.toLowerCase() === 'true' : val),
      z.boolean(),
    )
    .default(false)
    .readonly(),
});
