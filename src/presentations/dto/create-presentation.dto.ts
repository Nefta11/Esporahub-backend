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

export class FilminaItemDto {
  @IsNumber()
  order: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  imageData: string; // Base64 de la imagen

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CreatePresentationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilminaItemDto)
  filminas: FilminaItemDto[];

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  clientName?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    allowDownload?: boolean;
    showWatermark?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  };
}

export class UpdatePresentationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  settings?: {
    allowDownload?: boolean;
    showWatermark?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  };
}

export class AddFilminasDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilminaItemDto)
  filminas: FilminaItemDto[];
}

export class AccessPresentationDto {
  @IsOptional()
  @IsString()
  password?: string;
}
