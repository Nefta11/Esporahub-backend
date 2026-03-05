import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class SocialMediaDto {
  @ApiPropertyOptional({ example: '@candidato', description: 'Usuario de Twitter/X' })
  @IsOptional()
  @IsString()
  twitter?: string;

  @ApiPropertyOptional({ example: 'candidato.oficial', description: 'Usuario de Facebook' })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiPropertyOptional({ example: '@candidato.ok', description: 'Usuario de Instagram' })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiPropertyOptional({ example: '@candidatotiktok', description: 'Usuario de TikTok' })
  @IsOptional()
  @IsString()
  tiktok?: string;
}

export class CreateClientDto {
  @ApiProperty({ example: 'María García', description: 'Nombre completo del cliente/candidato' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Intendente Municipal', description: 'Cargo al que se postula o posición actual' })
  @IsString()
  @IsNotEmpty()
  position!: string;

  @ApiProperty({ example: '2025-10-26', description: 'Fecha de la elección (formato YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  electionDate!: string;

  @ApiProperty({ example: '2025-03-01', description: 'Fecha de inicio de campaña (formato YYYY-MM-DD)' })
  @IsString()
  @IsNotEmpty()
  campaignStart!: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../foto.jpg', description: 'URL de la foto del cliente' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Partido Renovación', description: 'Nombre del partido político' })
  @IsOptional()
  @IsString()
  politicalParty?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../logo.png', description: 'URL del logo del partido político' })
  @IsOptional()
  @IsString()
  partyLogoUrl?: string;

  @ApiPropertyOptional({ example: '#1A73E8', description: 'Color principal de campaña en formato hexadecimal' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: SocialMediaDto, description: 'Redes sociales del cliente' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @ApiPropertyOptional({ example: true, default: true, description: 'Si el cliente está activo en el sistema' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateClientDto {
  @ApiPropertyOptional({ example: 'María García', description: 'Nombre completo del cliente/candidato' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Concejal', description: 'Cargo actualizado' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: '2025-10-26', description: 'Fecha de la elección actualizada' })
  @IsOptional()
  @IsString()
  electionDate?: string;

  @ApiPropertyOptional({ example: '2025-04-01', description: 'Fecha de inicio de campaña actualizada' })
  @IsOptional()
  @IsString()
  campaignStart?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../foto.jpg', description: 'Nueva URL de foto' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Partido Renovación', description: 'Partido político actualizado' })
  @IsOptional()
  @IsString()
  politicalParty?: string;

  @ApiPropertyOptional({ example: 'https://res.cloudinary.com/.../logo.png', description: 'Nueva URL del logo del partido' })
  @IsOptional()
  @IsString()
  partyLogoUrl?: string;

  @ApiPropertyOptional({ example: '#E53935', description: 'Nuevo color de campaña en formato hexadecimal' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ type: SocialMediaDto, description: 'Redes sociales actualizadas' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  socialMedia?: SocialMediaDto;

  @ApiPropertyOptional({ example: false, description: 'Actualizar estado activo/inactivo del cliente' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
