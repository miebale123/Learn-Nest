import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { configuration, typeOrmConfig } from './config';
import { TasksModule } from './tasks';
import { AuthModule } from './auth';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [
        `.env.${process.env.NODE_ENV}.local`, // local overrides (ignored in git)
        `.env.${process.env.NODE_ENV}`, // environment base
        '.env', // shared defaults
      ],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [configuration.KEY],
      useFactory: typeOrmConfig,
    }),
    TasksModule,
    AuthModule,
  ],
  // controllers: [test],
})
export class AppModule {}
