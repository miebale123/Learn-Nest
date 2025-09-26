import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { configuration } from './config/configuration';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // exceptionFactory: (errors) => {
      //   const formattedErrors = {};
      //   errors.forEach((err) => {
      //     const field = err.property;
      //     const messages = err.constraints
      //       ? Object.values(err.constraints)
      //       : [];
      //     formattedErrors[field] = messages.join(', ');
      //   });

      //   return new BadRequestException({
      //     formattedErrors,
      //   });
      // },
    }),
  );

  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);
  app.enableShutdownHooks();

  await app.listen(config.port);
  console.log(` Server running on port ${config.port} [${config.nodeEnv}]`);
}

bootstrap().catch((err) => console.error('Error starting server:', err));
