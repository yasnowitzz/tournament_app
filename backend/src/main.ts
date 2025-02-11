import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { config } from 'dotenv';
import { Request, Response, NextFunction } from 'express';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:3001', // Adres frontend
    credentials: true, // Pozwala na cookies/tokeny
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe());
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.time(`Request: ${req.method} ${req.url}`);
    res.on('finish', () => console.timeEnd(`Request: ${req.method} ${req.url}`));
    next();
  });
  
  await app.listen(3000);
  console.log(`🚀 Backend running on http://localhost:3000`);
}
bootstrap();
