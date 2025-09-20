import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/configuration';

// @Controller('test')
// export class test {
//   @Get('testRoute')
//   testFunc() {
//     return 'hello';
//   }
// }

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
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(loggerMiddleware).forRoutes('test/testRoute');
  // }
}

//implements NestModule

// export class loggerMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     console.log('Request..');
//     next();
//   }
// }
