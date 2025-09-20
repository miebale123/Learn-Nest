import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { configuration } from './config/configuration';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get<ConfigType<typeof configuration>>(configuration.KEY);
  app.enableShutdownHooks();

  await app.listen(config.port);
  console.log(` Server running on port ${config.port} [${config.nodeEnv}]`);
}

bootstrap().catch((err) => console.error('Error starting server:', err));
