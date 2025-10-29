import { Controller, Get, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth';
import { AuditModule } from './audit/audit.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './audit/audit.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { configuration } from './config/app.config';
import { typeOrmConfig } from './config/typeorm.config';
import { AdminModule } from './admin/admin.module';
import { HousesModule } from './houses/houses.module';
import { BookmarkModule } from './bookmarks/bookmarks.module';
import { Public } from './common';
@Controller('/')
class AppController {
  @Public()
  @Get()
  root() {
    return { message: 'hello ' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [configuration.KEY],
      useFactory: typeOrmConfig,
    }),

    ThrottlerModule.forRoot({
      throttlers: [],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => randomUUID(),
        level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
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
    }),
    AuditModule,
    AuthModule,
    AdminModule,
    HousesModule,
    BookmarkModule,
  ],
  providers: [
    GlobalExceptionFilter,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
