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
import { ClientsService } from '../services/clients.service';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';
import { JwtAuthGuard } from '../middlewares/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
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
  async search(@Query('q') q: string) {
    const clients = await this.clientsService.search(q || '');
    return { success: true, data: clients };
  }

  @Get('stats')
  async getStats() {
    const stats = await this.clientsService.getStats();
    return { success: true, data: stats };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const client = await this.clientsService.findById(id);
    return { success: true, data: client };
  }

  @Post()
  async create(@Body() createClientDto: CreateClientDto) {
    const client = await this.clientsService.create(createClientDto);
    return { success: true, data: client };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    const client = await this.clientsService.update(id, updateClientDto);
    return { success: true, data: client };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.clientsService.delete(id);
    return { success: true, message: 'Cliente eliminado correctamente' };
  }
}
