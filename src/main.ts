import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { configuration } from './config/app.config';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.use(helmet())
  app.use(cookieParser())
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(err => {
          return {
            field: err.property,
            messages: Object.values(err.constraints || {})
          };
        });
        return new BadRequestException({
          error: 'ValidationError',
          message: formattedErrors
        });
      }
    })
  );


  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);
  app.enableShutdownHooks();

  await app.listen(config.port);
  console.log(` Server running on port ${config.port} [${config.nodeEnv}]`);
}

bootstrap().catch((err) => console.error('Error starting server:', err));
