import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import type { ConfigType } from '@nestjs/config';
import { configuration } from './config/app.config';
// import { AppModule } from './app.module';
import { GlobalZodPipe } from './auth/dto/auth.validation';
import { UsersService } from './users/users.service';
import { Controller, Module } from '@nestjs/common';

@Controller()
class Appcontroller {}

@Module({ controllers: [Appcontroller] })
class AppModule {}
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  // const app = await NestFactory.create(AppModule);

  // const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);

  // app.enableCors({ origin: config.frontEndUrl, credentials: true });
  // app.enableShutdownHooks();

  // app.use(helmet());
  // app.use(cookieParser());
  // app.useLogger(app.get(Logger));

  // app.useGlobalPipes(new GlobalZodPipe());
  // app.useGlobalFilters(app.get(GlobalExceptionFilter));

  // RBAC
  // const adminEmail = process.env.ADMIN_EMAIL!;
  // const adminPass = process.env.ADMIN_PASS!;

  // const usersService = app.get(UsersService);
  // await usersService.createAdmin(adminEmail, adminPass);

  // await app.listen(config.port);
  await app.listen(3000);
}
bootstrap().catch((err) => console.log(err));
