import { registerAs } from '@nestjs/config';
import { envSchema } from './env.validation';
import { z } from 'zod';

export const configuration = registerAs('config', () => {
  try {
    const validated = envSchema.parse(process.env);
    return {
      nodeEnv: validated.NODE_ENV,
      port: validated.PORT,

      database: {
        host: validated.DB_HOST,
        port: validated.DB_PORT,
        user: validated.DB_USER,
        password: validated.DB_PASSWORD,
        name: validated.DB_NAME,
        synchronize: validated.DB_SYNCHRONIZE,
        logging: validated.DB_LOGGING,
      },
    };
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      console.error('Validation errors:', err.issues);
    } else {
      console.error('Unexpected error:', err);
    }
    process.exit(1);
  }
});
