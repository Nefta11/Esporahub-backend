import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PresentationsService } from '../services/presentations.service';
import { CreatePresentationDto, UpdatePresentationDto, AddFilminasDto, AccessPresentationDto } from '../dto/presentation.dto';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { Public } from '../middlewares/public.decorator';
import { CurrentUser } from '../middlewares/current-user.decorator';

@Controller('presentations')
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createDto: CreatePresentationDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('name') userName: string,
  ) {
    const presentation = await this.presentationsService.create(createDto, userId, userName);

    return {
      success: true,
      data: {
        id: presentation._id,
        shareId: presentation.shareId,
        title: presentation.title,
        shareUrl: `/p/${presentation.shareId}`,
        filminas: presentation.filminas.length,
        createdAt: presentation['createdAt'],
      },
    };
  }

  @Public()
  @Get('access/:shareId')
  async checkAccess(@Param('shareId') shareId: string) {
    const result = await this.presentationsService.checkAccess(shareId);
    return { success: true, data: result };
  }

  @Public()
  @Post('view/:shareId')
  @HttpCode(HttpStatus.OK)
  async viewPresentation(
    @Param('shareId') shareId: string,
    @Body() accessDto: AccessPresentationDto,
  ) {
    const presentation = await this.presentationsService.findByShareId(shareId, accessDto.password);

    return {
      success: true,
      data: {
        id: presentation._id,
        shareId: presentation.shareId,
        title: presentation.title,
        description: presentation.description,
        filminas: presentation.filminas.map((f) => ({
          order: f.order,
          title: f.title,
          imageUrl: f.imageUrl,
          thumbnailUrl: f.thumbnailUrl,
        })),
        createdByName: presentation.createdByName,
        clientName: presentation.clientName,
        settings: presentation.settings,
        viewCount: presentation.viewCount,
        createdAt: presentation['createdAt'],
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyPresentations(@CurrentUser('userId') userId: string) {
    const presentations = await this.presentationsService.findByUser(userId);

    return {
      success: true,
      data: presentations.map((p) => ({
        id: p._id,
        shareId: p.shareId,
        title: p.title,
        description: p.description,
        filminasCount: p.filminas.length,
        thumbnail: p.filminas[0]?.thumbnailUrl,
        isPublic: p.isPublic,
        hasPassword: !!p.password,
        expiresAt: p.expiresAt,
        viewCount: p.viewCount,
        lastViewedAt: p.lastViewedAt,
        clientName: p.clientName,
        shareUrl: `/p/${p.shareId}`,
        createdAt: p['createdAt'],
        updatedAt: p['updatedAt'],
      })),
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getPresentation(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const presentation = await this.presentationsService.findById(id, userId);
    return { success: true, data: presentation };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePresentationDto,
    @CurrentUser('userId') userId: string,
  ) {
    const presentation = await this.presentationsService.update(id, updateDto, userId);

    return {
      success: true,
      data: {
        id: presentation._id,
        shareId: presentation.shareId,
        title: presentation.title,
        shareUrl: `/p/${presentation.shareId}`,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/filminas')
  async addFilminas(
    @Param('id') id: string,
    @Body() addDto: AddFilminasDto,
    @CurrentUser('userId') userId: string,
  ) {
    const presentation = await this.presentationsService.addFilminas(id, addDto, userId);

    return {
      success: true,
      data: {
        id: presentation._id,
        filminasCount: presentation.filminas.length,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/regenerate-link')
  @HttpCode(HttpStatus.OK)
  async regenerateLink(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const presentation = await this.presentationsService.regenerateShareId(id, userId);

    return {
      success: true,
      data: {
        shareId: presentation.shareId,
        shareUrl: `/p/${presentation.shareId}`,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.presentationsService.delete(id, userId);
    return { success: true, message: 'Presentación eliminada correctamente' };
  }
}
