import { NestFactory } from '@nestjs/core';
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
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);

  app.enableCors({ origin: config.frontEndUrl, credentials: true });
  app.enableShutdownHooks();

  app.use(helmet());
  app.use(cookieParser());
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new GlobalZodPipe());
  app.useGlobalFilters(app.get(GlobalExceptionFilter));

  const usersService = app.get(UsersService);
  await usersService.createAdmin(config.admin_email, config.admin_pass);

  await app.listen(config.port ?? 4444, '0.0.0.0');
}
bootstrap().catch((err) => console.log(err));
