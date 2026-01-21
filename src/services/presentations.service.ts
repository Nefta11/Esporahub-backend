import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { nanoid } from 'nanoid';
import * as bcrypt from 'bcrypt';
import { Presentation, PresentationDocument } from '../models/presentation.schema';
import { CreatePresentationDto, UpdatePresentationDto, AddFilminasDto } from '../dto/presentation.dto';
import { UploadService } from './upload.service';

@Injectable()
export class PresentationsService {
  constructor(
    @InjectModel(Presentation.name)
    private presentationModel: Model<PresentationDocument>,
    private uploadService: UploadService,
  ) {}

  private generateShareId(): string {
    return nanoid(10);
  }

  async create(
    createDto: CreatePresentationDto,
    userId: string,
    userName: string,
  ): Promise<PresentationDocument> {
    const uploadedFilminas = await Promise.all(
      createDto.filminas.map(async (filmina) => {
        const uploadResult = await this.uploadService.uploadBase64(
          filmina.imageData,
          `esporahub/presentations/${userId}`,
        );

        return {
          order: filmina.order,
          title: filmina.title,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          publicId: uploadResult.publicId,
          metadata: filmina.metadata,
        };
      }),
    );

    uploadedFilminas.sort((a, b) => a.order - b.order);

    let hashedPassword: string | undefined;
    if (createDto.password) {
      hashedPassword = await bcrypt.hash(createDto.password, 10);
    }

    const presentation = new this.presentationModel({
      shareId: this.generateShareId(),
      title: createDto.title,
      description: createDto.description,
      filminas: uploadedFilminas,
      createdBy: new Types.ObjectId(userId),
      createdByName: userName,
      isPublic: createDto.isPublic ?? true,
      password: hashedPassword,
      expiresAt: createDto.expiresAt ? new Date(createDto.expiresAt) : undefined,
      clientId: createDto.clientId,
      clientName: createDto.clientName,
      settings: createDto.settings || {
        allowDownload: false,
        showWatermark: true,
        autoPlay: false,
        autoPlayInterval: 5,
      },
    });

    return presentation.save();
  }

  async findByShareId(shareId: string, password?: string): Promise<PresentationDocument> {
    const presentation = await this.presentationModel.findOne({ shareId });

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.expiresAt && new Date() > presentation.expiresAt) {
      throw new ForbiddenException('Esta presentación ha expirado');
    }

    if (presentation.password) {
      if (!password) {
        throw new ForbiddenException('Esta presentación requiere contraseña');
      }

      const isPasswordValid = await bcrypt.compare(password, presentation.password);
      if (!isPasswordValid) {
        throw new ForbiddenException('Contraseña incorrecta');
      }
    }

    await this.presentationModel.findByIdAndUpdate(presentation._id, {
      $inc: { viewCount: 1 },
      lastViewedAt: new Date(),
    });

    return presentation;
  }

  async checkAccess(shareId: string): Promise<{ requiresPassword: boolean; title: string }> {
    const presentation = await this.presentationModel
      .findOne({ shareId })
      .select('password title expiresAt');

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.expiresAt && new Date() > presentation.expiresAt) {
      throw new ForbiddenException('Esta presentación ha expirado');
    }

    return {
      requiresPassword: !!presentation.password,
      title: presentation.title,
    };
  }

  async findByUser(userId: string): Promise<PresentationDocument[]> {
    return this.presentationModel
      .find({ createdBy: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .select('-password');
  }

  async findById(id: string, userId: string): Promise<PresentationDocument> {
    const presentation = await this.presentationModel.findById(id);

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.createdBy.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para ver esta presentación');
    }

    return presentation;
  }

  async update(id: string, updateDto: UpdatePresentationDto, userId: string): Promise<PresentationDocument> {
    const presentation = await this.presentationModel.findById(id);

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.createdBy.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta presentación');
    }

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    const updated = await this.presentationModel.findByIdAndUpdate(id, { ...updateDto }, { new: true });

    if (!updated) {
      throw new NotFoundException('Error al actualizar la presentación');
    }

    return updated;
  }

  async addFilminas(id: string, addDto: AddFilminasDto, userId: string): Promise<PresentationDocument> {
    const presentation = await this.presentationModel.findById(id);

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.createdBy.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta presentación');
    }

    const uploadedFilminas = await Promise.all(
      addDto.filminas.map(async (filmina) => {
        const uploadResult = await this.uploadService.uploadBase64(
          filmina.imageData,
          `esporahub/presentations/${userId}`,
        );

        return {
          order: filmina.order,
          title: filmina.title,
          imageUrl: uploadResult.url,
          thumbnailUrl: uploadResult.thumbnailUrl,
          publicId: uploadResult.publicId,
          metadata: filmina.metadata,
        };
      }),
    );

    const allFilminas = [...presentation.filminas, ...uploadedFilminas];
    allFilminas.sort((a, b) => a.order - b.order);

    const updated = await this.presentationModel.findByIdAndUpdate(id, { filminas: allFilminas }, { new: true });

    if (!updated) {
      throw new NotFoundException('Error al actualizar la presentación');
    }

    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const presentation = await this.presentationModel.findById(id);

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.createdBy.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta presentación');
    }

    const publicIds = presentation.filminas
      .map((f) => f.publicId)
      .filter((id): id is string => !!id);

    if (publicIds.length > 0) {
      await this.uploadService.deleteMultipleImages(publicIds);
    }

    await this.presentationModel.findByIdAndDelete(id);
  }

  async regenerateShareId(id: string, userId: string): Promise<PresentationDocument> {
    const presentation = await this.presentationModel.findById(id);

    if (!presentation) {
      throw new NotFoundException('Presentación no encontrada');
    }

    if (presentation.createdBy.toString() !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta presentación');
    }

    const updated = await this.presentationModel.findByIdAndUpdate(
      id,
      { shareId: this.generateShareId() },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('Error al regenerar el enlace');
    }

    return updated;
  }
}
