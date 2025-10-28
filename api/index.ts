import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import express from 'express';

const server = express();

export default async function handler(req: Request, res: Response) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  await app.init();
  server(req, res);
}
