import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import type { ConfigType } from '@nestjs/config';
import { configuration } from './config/app.config';
import { AppModule } from './app.module';
import { GlobalZodPipe } from './auth/dto/auth.validation';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);

  app.enableCors({ origin: config.frontEndUrl, credentials: true });
  app.enableShutdownHooks();

  app.use(helmet());
  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new GlobalZodPipe());
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', config.frontEndUrl); // optional but helps
    },
  });

  // RBAC
  const adminEmail = process.env.ADMIN_EMAIL!;
  const adminPass = process.env.ADMIN_PASS!;

  const usersService = app.get(UsersService);
  await usersService.createAdmin(adminEmail, adminPass);

  await app.listen(config.port);
}
bootstrap().catch((err) => console.log(err));
