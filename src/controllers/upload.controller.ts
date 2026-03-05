import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from '../services/upload.service';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('base64')
  @ApiOperation({
    summary: 'Subir imagen en Base64',
    description: 'Sube una imagen codificada en Base64 a Cloudinary. Retorna la URL pública y la URL del thumbnail generado.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image'],
      properties: {
        image: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgo...', description: 'Imagen en formato Base64 (data URI)' },
        folder: { type: 'string', example: 'esporahub/filminas', description: 'Carpeta de destino en Cloudinary (opcional)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imagen subida exitosamente. Retorna imageUrl, thumbnailUrl y publicId.' })
  @ApiResponse({ status: 400, description: 'No se proporcionó imagen o el formato Base64 es inválido.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async uploadBase64(@Body() body: { image: string; folder?: string }) {
    if (!body.image) {
      throw new BadRequestException('Se requiere una imagen en Base64');
    }

    const result = await this.uploadService.uploadBase64(
      body.image,
      body.folder || 'esporahub/filminas',
    );

    return { success: true, data: result };
  }

  @Post('base64/multiple')
  @ApiOperation({
    summary: 'Subir múltiples imágenes en Base64',
    description: 'Sube varias imágenes en Base64 en una sola petición. Las imágenes se procesan en paralelo en Cloudinary.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['images'],
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              base64: { type: 'string', example: 'data:image/png;base64,...', description: 'Imagen en Base64' },
              order: { type: 'number', example: 1, description: 'Orden de la imagen' },
            },
          },
          description: 'Array de imágenes con su orden correspondiente',
        },
        folder: { type: 'string', example: 'esporahub/filminas', description: 'Carpeta de destino en Cloudinary (opcional)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Imágenes subidas exitosamente. Retorna array con imageUrl, thumbnailUrl y publicId de cada una.' })
  @ApiResponse({ status: 400, description: 'No se proporcionaron imágenes.' })
  async uploadMultipleBase64(
    @Body() body: { images: { base64: string; order: number }[]; folder?: string },
  ) {
    if (!body.images || body.images.length === 0) {
      throw new BadRequestException('Se requiere al menos una imagen');
    }

    const results = await this.uploadService.uploadMultipleBase64(
      body.images,
      body.folder || 'esporahub/filminas',
    );

    return { success: true, data: results };
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Subir archivo de imagen',
    description: 'Sube un archivo de imagen usando multipart/form-data a Cloudinary. Retorna la URL pública y el thumbnail.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'Archivo de imagen (PNG, JPG, WebP, etc.)' },
        folder: { type: 'string', example: 'esporahub/filminas', description: 'Carpeta de destino en Cloudinary (opcional)' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo subido exitosamente. Retorna imageUrl, thumbnailUrl y publicId.' })
  @ApiResponse({ status: 400, description: 'No se proporcionó archivo.' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { folder?: string },
  ) {
    if (!file) {
      throw new BadRequestException('Se requiere un archivo');
    }

    const result = await this.uploadService.uploadBuffer(
      file.buffer,
      body.folder || 'esporahub/filminas',
    );

    return { success: true, data: result };
  }
}
