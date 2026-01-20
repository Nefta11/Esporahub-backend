import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadResult {
  url: string;
  publicId: string;
  thumbnailUrl: string;
  width: number;
  height: number;
}

@Injectable()
export class UploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    // Directorio de uploads
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3001');

    // Crear directorio si no existe
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists(): void {
    const dirs = [
      this.uploadDir,
      path.join(this.uploadDir, 'filminas'),
      path.join(this.uploadDir, 'thumbnails'),
    ];

    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Sube una imagen desde Base64 al sistema de archivos local
   */
  async uploadBase64(
    base64Data: string,
    folder: string = 'filminas',
  ): Promise<UploadResult> {
    try {
      // Extraer el contenido base64 sin el prefijo data:image/...
      let imageBuffer: Buffer;
      let extension = 'png';

      if (base64Data.startsWith('data:')) {
        const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
        if (matches) {
          extension = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          imageBuffer = Buffer.from(matches[2], 'base64');
        } else {
          throw new BadRequestException('Formato de imagen inválido');
        }
      } else {
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      // Generar nombre único
      const publicId = uuidv4();
      const filename = `${publicId}.${extension}`;
      const thumbnailFilename = `${publicId}_thumb.${extension}`;

      // Rutas de archivos
      const folderPath = path.join(this.uploadDir, folder);
      const thumbnailFolderPath = path.join(this.uploadDir, 'thumbnails');

      // Crear carpetas si no existen
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      if (!fs.existsSync(thumbnailFolderPath)) {
        fs.mkdirSync(thumbnailFolderPath, { recursive: true });
      }

      const filePath = path.join(folderPath, filename);
      const thumbnailPath = path.join(thumbnailFolderPath, thumbnailFilename);

      // Guardar imagen original
      fs.writeFileSync(filePath, imageBuffer);

      // Obtener dimensiones y crear thumbnail con sharp
      let width = 1920;
      let height = 1080;

      try {
        const metadata = await sharp(imageBuffer).metadata();
        width = metadata.width || 1920;
        height = metadata.height || 1080;

        // Crear thumbnail
        await sharp(imageBuffer)
          .resize(300, 169, { fit: 'cover' })
          .toFile(thumbnailPath);
      } catch (sharpError) {
        console.warn('Sharp error, using original image:', sharpError);
        // Si sharp falla, copiar original como thumbnail
        fs.writeFileSync(thumbnailPath, imageBuffer);
      }

      // Generar URLs
      const url = `${this.baseUrl}/uploads/${folder}/${filename}`;
      const thumbnailUrl = `${this.baseUrl}/uploads/thumbnails/${thumbnailFilename}`;

      return {
        url,
        publicId,
        thumbnailUrl,
        width,
        height,
      };
    } catch (error) {
      console.error('Error uploading image locally:', error);
      throw new BadRequestException('Error al subir la imagen');
    }
  }

  /**
   * Sube múltiples imágenes Base64
   */
  async uploadMultipleBase64(
    images: { base64: string; order: number }[],
    folder: string = 'filminas',
  ): Promise<(UploadResult & { order: number })[]> {
    const uploadPromises = images.map(async (img) => {
      const result = await this.uploadBase64(img.base64, folder);
      return { ...result, order: img.order };
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Sube una imagen desde un archivo Buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    folder: string = 'filminas',
  ): Promise<UploadResult> {
    const base64 = buffer.toString('base64');
    return this.uploadBase64(`data:image/png;base64,${base64}`, folder);
  }

  /**
   * Elimina una imagen del sistema de archivos
   */
  async deleteImage(publicId: string): Promise<void> {
    try {
      // Buscar y eliminar el archivo con cualquier extensión
      const extensions = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

      for (const ext of extensions) {
        const filePath = path.join(this.uploadDir, 'filminas', `${publicId}.${ext}`);
        const thumbPath = path.join(this.uploadDir, 'thumbnails', `${publicId}_thumb.${ext}`);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        if (fs.existsSync(thumbPath)) {
          fs.unlinkSync(thumbPath);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  /**
   * Elimina múltiples imágenes
   */
  async deleteMultipleImages(publicIds: string[]): Promise<void> {
    for (const publicId of publicIds) {
      await this.deleteImage(publicId);
    }
  }
}
