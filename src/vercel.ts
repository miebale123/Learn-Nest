import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { Module, Controller, Get } from '@nestjs/common';

const expressApp = express();
let cachedServer: any = null;

@Controller()
class AppController {
  @Get()
  getHello() {
    return { message: 'Hello from NestJS on Vercel!' };
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      { bufferLogs: true },
    );

    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    await app.init();
    cachedServer = serverless(expressApp); // wrap with serverless
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();

  try {
    return server(req, res); // now this is fully compatible
  } catch (error) {
    console.error('❌ Request failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
