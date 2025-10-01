import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { formatValidationErrors } from './common/utils/validation.util';
import { configuration } from './config';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);

  app.enableCors({ origin: config.frontEndUrl, credentials: true });
  app.use(helmet());
  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: formatValidationErrors,
    }),
  );

  app.enableShutdownHooks();

  await app.listen(config.port);
  console.log(` Server running on port ${config.port} [${config.nodeEnv}]`);
}

bootstrap().catch((err) => console.error('Error starting server:', err));
