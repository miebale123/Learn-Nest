import { ConfigType } from '@nestjs/config';
import { configuration } from './app.config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (
  config: ConfigType<typeof configuration>,
): TypeOrmModuleOptions => {
  if (!config) {
    throw new Error('config is missing!');
  }

  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    autoLoadEntities: config.database.autoLoadEntities,
  };
};
