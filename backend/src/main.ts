// Charger dotenv AVANT tous les autres imports
import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {

  // Log MongoDB connection info
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tmf_stock';
  const isAtlas = mongoUri.includes('mongodb+srv://');
  // eslint-disable-next-line no-console
  console.log(`📦 MongoDB: ${isAtlas ? 'Atlas (Cloud) ✅' : 'Local ⚠️'} - ${isAtlas ? mongoUri.split('@')[1]?.split('/')[0] : 'localhost:27017'}`);
  if (!isAtlas) {
    // eslint-disable-next-line no-console
    console.log('⚠️  ATTENTION: Utilisation de MongoDB local!');
    // eslint-disable-next-line no-console
    console.log('   Le fichier .env n\'est peut-être pas chargé. Vérifiez le fichier backend/.env');
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Augmenter la limite de taille du body pour permettre l'upload d'images (10MB)
  const express = require('express');
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`🚀 TMF Stock backend listening on http://localhost:${port}`);
}

bootstrap();


