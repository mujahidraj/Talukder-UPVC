import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies
  const cookieParser = require('cookie-parser');
  app.use(cookieParser());

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigin = process.env.CORS_ORIGIN || (isProd ? false : 'http://localhost:5173');

  if (isProd && !process.env.CORS_ORIGIN) {
    console.warn('WARNING: CORS_ORIGIN is not set in production! Defaulting to deny all CORS requests.');
  }

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Serve uploads securely
  const express = require('express');
  const { join } = require('path');
  
  // Block access to temp directory
  app.use('/uploads/temp', (req: any, res: any) => res.status(403).send('Forbidden'));
  
  // Serve other uploads without directory listing
  app.use(
    '/uploads',
    express.static(join(process.cwd(), process.env.UPLOAD_LOCAL_PATH || 'uploads'), {
      dotfiles: 'ignore',
      index: false,
    })
  );

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
