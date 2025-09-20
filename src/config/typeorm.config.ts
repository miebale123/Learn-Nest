import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { configuration } from './configuration';
import { ConfigType } from '@nestjs/config';

export const typeOrmConfig = (
  config: ConfigType<typeof configuration>,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: config.database.host,
    port: config.database.port,
    username: config.database.user,
    password: config.database.password,
    database: config.database.name,
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
  };
};
