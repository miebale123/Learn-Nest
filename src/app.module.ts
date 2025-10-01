import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { ThrottlerModule } from '@nestjs/throttler';
import { configuration, typeOrmConfig } from './config';
import { TasksModule } from './tasks';
import { AuthModule } from './auth';
import { AuditModule } from './audit/audit.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit/audit.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

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

    ThrottlerModule.forRoot({
      throttlers: []
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => randomUUID(),
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV === 'production'
            ? undefined
            : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
              },
            },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    })
    ,
    AuditModule,
    AuthModule,
    TasksModule,

  ],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor
    },
  ],
})
export class AppModule { }
