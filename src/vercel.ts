import { Controller, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const expressApp = express();
let cachedServer: express.Express | null = null;

@Controller()
class AppController {}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
      {
        bufferLogs: true,
      },
    );

    // Basic global logging (to Vercel logs)
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

    // Allow CORS if your frontend is on another domain
    app.enableCors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    });

    // Log environment info (shows once per cold start)
    console.log('🟢 NestJS initialized in serverless mode');
    console.log('📦 Environment:', process.env.NODE_ENV);
    console.log(
      '🗄️  Database URL:',
      process.env.DATABASE_URL?.replace(/:(.*?)@/, ':****@'),
    );

    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer;
}

// Main Vercel handler
export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();

  // Request logging
  console.log(`➡️  ${req.method} ${req.url}`);

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return server(req, res);
  } catch (error) {
    console.error('❌ Request failed:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
