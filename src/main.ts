import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // Configuración de Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Esporahub API')
    .setDescription(
      'API REST del backend de Esporahub — plataforma de creación y compartición de presentaciones para campañas políticas. ' +
      'Incluye autenticación JWT, gestión de clientes/candidatos, presentaciones con filminas y subida de imágenes a Cloudinary.\n\n' +
      '**Autenticación:** Los endpoints protegidos requieren un token JWT. ' +
      'Obtené tu token en `POST /api/auth/login` y usalo en el botón "Authorize" con el formato: `Bearer <token>`.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantiene el token entre recargas de página
    },
  });

  // Puerto del servidor
  const port = configService.get<number>('PORT', 3001);

  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   🚀 ESPORAHUB BACKEND                                    ║
  ║                                                           ║
  ║   Servidor corriendo en: http://localhost:${port}           ║
  ║   API Base URL:          http://localhost:${port}/api       ║
  ║   Documentación Swagger: http://localhost:${port}/api/docs  ║
  ║                                                           ║
  ║   Módulos activos:                                        ║
  ║   • Auth         /api/auth                                ║
  ║   • Clientes     /api/clients                             ║
  ║   • Presentac.   /api/presentations                       ║
  ║   • Upload       /api/upload                              ║
  ║                                                           ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
