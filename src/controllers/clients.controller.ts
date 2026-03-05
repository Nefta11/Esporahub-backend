import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { ClientsService } from '../services/clients.service';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';

@ApiTags('Clientes')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar clientes',
    description: 'Retorna la lista paginada de todos los clientes/candidatos registrados. Soporta búsqueda y ordenamiento.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1, description: 'Número de página (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10, description: 'Resultados por página (default: 10)' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, example: 'name', description: 'Campo por el que ordenar' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'], description: 'Dirección del ordenamiento' })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'María', description: 'Texto para filtrar por nombre o partido' })
  @ApiResponse({ status: 200, description: 'Lista paginada de clientes con metadata de paginación.' })
  @ApiResponse({ status: 401, description: 'No autenticado.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('search') search?: string,
  ) {
    const result = await this.clientsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      sortBy,
      sortOrder,
      search,
    });

    return { success: true, data: result };
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar clientes',
    description: 'Búsqueda rápida de clientes por nombre o partido político. Retorna resultados sin paginar, ideal para autocompletado.',
  })
  @ApiQuery({ name: 'q', required: false, type: String, example: 'García', description: 'Término de búsqueda' })
  @ApiResponse({ status: 200, description: 'Lista de clientes que coinciden con la búsqueda.' })
  async search(@Query('q') q: string) {
    const clients = await this.clientsService.search(q || '');
    return { success: true, data: clients };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de clientes',
    description: 'Retorna estadísticas generales del módulo de clientes: total, activos, inactivos, etc.',
  })
  @ApiResponse({ status: 200, description: 'Objeto con estadísticas del módulo de clientes.' })
  async getStats() {
    const stats = await this.clientsService.getStats();
    return { success: true, data: stats };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID', description: 'Retorna los datos completos de un cliente específico.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB del cliente', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiResponse({ status: 200, description: 'Datos del cliente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);
    return { success: true, data: client };
  }

  @Post()
  @ApiOperation({ summary: 'Crear cliente', description: 'Registra un nuevo cliente/candidato en el sistema.' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Cliente creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return { success: true, data: client };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar cliente', description: 'Actualiza los datos de un cliente/candidato existente.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB del cliente', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Cliente actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(id, updateClientDto);
    return { success: true, data: client };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar cliente', description: 'Elimina permanentemente un cliente del sistema.' })
  @ApiParam({ name: 'id', description: 'ID de MongoDB del cliente', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiResponse({ status: 200, description: 'Cliente eliminado correctamente.' })
  @ApiResponse({ status: 404, description: 'Cliente no encontrado.' })
  async delete(@Param('id') id: string) {
    await this.clientsService.delete(id);
    return { success: true, message: 'Cliente eliminado correctamente' };
  }
}
