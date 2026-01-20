import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as bodyParser from 'body-parser';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aumentar límite de payload para imágenes base64 (50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Servir archivos estáticos desde la carpeta uploads
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  const configService = app.get(ConfigService);

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  // Configurar CORS
  app.enableCors({
    origin: configService.get<string>('FRONTEND_URL', 'http://localhost:5173'),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades extra
      transform: true, // Transforma tipos automáticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Puerto del servidor
  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 ESPORAHUB BACKEND                                    ║
  ║                                                           ║
  ║   Servidor corriendo en: http://localhost:${port}           ║
  ║   API Base URL: http://localhost:${port}/api                ║
  ║                                                           ║
  ║   Endpoints disponibles:                                  ║
  ║   • POST   /api/auth/login                                ║
  ║   • POST   /api/auth/register                             ║
  ║   • GET    /api/auth/profile                              ║
  ║   • POST   /api/presentations                             ║
  ║   • GET    /api/presentations/my                          ║
  ║   • GET    /api/presentations/access/:shareId             ║
  ║   • POST   /api/presentations/view/:shareId               ║
  ║   • POST   /api/upload/base64                             ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
