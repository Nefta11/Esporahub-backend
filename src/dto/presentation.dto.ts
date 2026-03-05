import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FilminaItemDto {
  @ApiProperty({ example: 1, description: 'Número de orden de la filmina dentro de la presentación' })
  @IsNumber()
  order!: number;

  @ApiProperty({ example: 'Introducción', description: 'Título de la filmina' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'data:image/png;base64,iVBORw0KGgo...', description: 'Imagen en formato Base64 (data URI)' })
  @IsString()
  @IsNotEmpty()
  imageData!: string;

  @ApiPropertyOptional({ description: 'Metadatos adicionales de la filmina (libre)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PresentationSettingsDto {
  @ApiPropertyOptional({ example: false, description: 'Permitir descarga de la presentación' })
  allowDownload?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Mostrar marca de agua en la presentación' })
  showWatermark?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Reproducción automática de filminas' })
  autoPlay?: boolean;

  @ApiPropertyOptional({ example: 5000, description: 'Intervalo de reproducción automática en milisegundos' })
  autoPlayInterval?: number;
}

export class CreatePresentationDto {
  @ApiProperty({ example: 'Campaña Municipal 2025', description: 'Título de la presentación' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ example: 'Resumen de propuestas para la campaña', description: 'Descripción opcional de la presentación' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [FilminaItemDto], description: 'Lista de filminas que componen la presentación' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilminaItemDto)
  filminas!: FilminaItemDto[];

  @ApiPropertyOptional({ example: true, default: true, description: 'Si la presentación es pública o requiere password' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'miPassword', description: 'Contraseña para proteger el acceso (opcional)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z', description: 'Fecha de expiración de la presentación (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ example: '64f1a2b3c4d5e6f7a8b9c0d1', description: 'ID del cliente asociado a esta presentación' })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({ example: 'Juan Pérez', description: 'Nombre del cliente asociado a la presentación' })
  @IsOptional()
  @IsString()
  clientName?: string;

  @ApiPropertyOptional({ type: PresentationSettingsDto, description: 'Configuración adicional de reproducción' })
  @IsOptional()
  @IsObject()
  settings?: PresentationSettingsDto;
}

export class UpdatePresentationDto {
  @ApiPropertyOptional({ example: 'Nuevo Título', description: 'Nuevo título de la presentación' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Nueva descripción', description: 'Nueva descripción de la presentación' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: true, description: 'Cambiar visibilidad pública' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiPropertyOptional({ example: 'nuevoPass', description: 'Actualizar o quitar contraseña de acceso' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z', description: 'Nueva fecha de expiración (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ type: PresentationSettingsDto, description: 'Configuración de reproducción actualizada' })
  @IsOptional()
  @IsObject()
  settings?: PresentationSettingsDto;
}

export class AddFilminasDto {
  @ApiProperty({ type: [FilminaItemDto], description: 'Filminas a agregar a la presentación existente' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilminaItemDto)
  filminas!: FilminaItemDto[];
}

export class AccessPresentationDto {
  @ApiPropertyOptional({ example: 'miPassword', description: 'Contraseña de acceso si la presentación está protegida' })
  @IsOptional()
  @IsString()
  password?: string;
}
