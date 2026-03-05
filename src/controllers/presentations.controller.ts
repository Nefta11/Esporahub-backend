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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { PresentationsService } from '../services/presentations.service';
import { CreatePresentationDto, UpdatePresentationDto, AddFilminasDto, AccessPresentationDto } from '../dto/presentation.dto';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';
import { Public } from '../middlewares/public.decorator';
import { CurrentUser } from '../middlewares/current-user.decorator';

@ApiTags('Presentaciones')
@Controller('presentations')
export class PresentationsController {
  constructor(private readonly presentationsService: PresentationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear presentación',
    description: 'Crea una nueva presentación. Las filminas se envían en Base64 y son subidas automáticamente a Cloudinary.',
  })
  @ApiBody({ type: CreatePresentationDto })
  @ApiResponse({ status: 201, description: 'Presentación creada exitosamente. Retorna el ID y el shareId para compartir.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos en el body.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
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
  @ApiOperation({
    summary: 'Verificar acceso a presentación compartida',
    description: 'Consulta si una presentación existe y si requiere contraseña para ser vista. No requiere autenticación.',
  })
  @ApiParam({ name: 'shareId', description: 'ID único de compartición de la presentación', example: 'abc123xyz' })
  @ApiResponse({ status: 200, description: 'Información de acceso: si existe y si tiene contraseña.' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada o expirada.' })
  async checkAccess(@Param('shareId') shareId: string) {
    const result = await this.presentationsService.checkAccess(shareId);
    return { success: true, data: result };
  }

  @Public()
  @Post('view/:shareId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ver presentación compartida',
    description: 'Obtiene el contenido completo de una presentación usando su shareId. Si tiene contraseña, debe enviarse en el body.',
  })
  @ApiParam({ name: 'shareId', description: 'ID único de compartición', example: 'abc123xyz' })
  @ApiBody({ type: AccessPresentationDto })
  @ApiResponse({ status: 200, description: 'Datos completos de la presentación con sus filminas.' })
  @ApiResponse({ status: 401, description: 'Contraseña incorrecta.' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada o expirada.' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mis presentaciones',
    description: 'Retorna todas las presentaciones creadas por el usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Lista de presentaciones del usuario con datos resumidos.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Detalle de presentación', description: 'Obtiene el detalle completo de una presentación por su ID de MongoDB. Solo el propietario puede acceder.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB de la presentación', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiResponse({ status: 200, description: 'Datos completos de la presentación.' })
  @ApiResponse({ status: 403, description: 'No autorizado (no es el propietario).' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada.' })
  async getPresentation(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    const presentation = await this.presentationsService.findById(id, userId);
    return { success: true, data: presentation };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar presentación', description: 'Actualiza los metadatos de una presentación (título, descripción, contraseña, etc.). Solo el propietario puede modificarla.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB de la presentación', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiBody({ type: UpdatePresentationDto })
  @ApiResponse({ status: 200, description: 'Presentación actualizada exitosamente.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Agregar filminas', description: 'Agrega nuevas filminas a una presentación existente. Las imágenes se suben automáticamente a Cloudinary.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB de la presentación', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiBody({ type: AddFilminasDto })
  @ApiResponse({ status: 201, description: 'Filminas agregadas exitosamente.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada.' })
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
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Regenerar link de compartición',
    description: 'Genera un nuevo shareId para la presentación, invalidando el link anterior. Útil si se quiere revocar el acceso al link previo.',
  })
  @ApiParam({ name: 'id', description: 'ID de MongoDB de la presentación', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiResponse({ status: 200, description: 'Nuevo shareId generado exitosamente.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar presentación', description: 'Elimina una presentación y sus filminas asociadas. Solo el propietario puede eliminarla.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB de la presentación', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiResponse({ status: 200, description: 'Presentación eliminada correctamente.' })
  @ApiResponse({ status: 403, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Presentación no encontrada.' })
  async delete(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    await this.presentationsService.delete(id, userId);
    return { success: true, message: 'Presentación eliminada correctamente' };
  }
}
