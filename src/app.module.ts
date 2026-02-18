import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth.module';
import { UsersModule } from './modules/users.module';
import { PresentationsModule } from './modules/presentations.module';
import { UploadModule } from './modules/upload.module';
import { ClientsModule } from './modules/clients.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Conexión a MongoDB
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // Módulos
    AuthModule,
    UsersModule,
    PresentationsModule,
    UploadModule,
    ClientsModule,
  ],
})
export class AppModule {}
