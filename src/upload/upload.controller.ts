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
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * Subir imagen en Base64
   */
  @Post('base64')
  async uploadBase64(
    @Body() body: { image: string; folder?: string },
  ) {
    if (!body.image) {
      throw new BadRequestException('Se requiere una imagen en Base64');
    }

    const result = await this.uploadService.uploadBase64(
      body.image,
      body.folder || 'esporahub/filminas',
    );

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Subir múltiples imágenes en Base64
   */
  @Post('base64/multiple')
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

    return {
      success: true,
      data: results,
    };
  }

  /**
   * Subir imagen como archivo
   */
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
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

    return {
      success: true,
      data: result,
    };
  }
}
