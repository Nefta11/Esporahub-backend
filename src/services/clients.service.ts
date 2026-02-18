import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from '../models/client.schema';
import { CreateClientDto, UpdateClientDto } from '../dto/client.dto';

export interface ClientResponse {
  id: string;
  name: string;
  position: string;
  electionDate: string;
  campaignStart: string;
  imageUrl?: string;
  politicalParty?: string;
  partyLogoUrl?: string;
  color?: string;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type RawClient = {
  _id: Types.ObjectId;
  name: string;
  position: string;
  electionDate: string;
  campaignStart: string;
  imageUrl?: string;
  politicalParty?: string;
  partyLogoUrl?: string;
  color?: string;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const toClientResponse = (raw: RawClient): ClientResponse => ({
  id: raw._id.toString(),
  name: raw.name,
  position: raw.position,
  electionDate: raw.electionDate,
  campaignStart: raw.campaignStart,
  imageUrl: raw.imageUrl,
  politicalParty: raw.politicalParty,
  partyLogoUrl: raw.partyLogoUrl,
  color: raw.color,
  socialMedia: raw.socialMedia ?? {},
  isActive: raw.isActive,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 10;
    const skip = (page - 1) * limit;
    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const sortBy = params.sortBy ?? 'createdAt';

    const filter: Record<string, unknown> = {};
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { position: { $regex: params.search, $options: 'i' } },
        { politicalParty: { $regex: params.search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.clientModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean<RawClient[]>(),
      this.clientModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data.map(toClientResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string): Promise<ClientResponse> {
    const client = await this.clientModel.findById(id).lean<RawClient>();
    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return toClientResponse(client);
  }

  async search(query: string): Promise<ClientResponse[]> {
    const clients = await this.clientModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { position: { $regex: query, $options: 'i' } },
          { politicalParty: { $regex: query, $options: 'i' } },
        ],
      })
      .limit(20)
      .lean<RawClient[]>();

    return clients.map(toClientResponse);
  }

  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    thisMonth: number;
  }> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, inactive, thisMonth] = await Promise.all([
      this.clientModel.countDocuments(),
      this.clientModel.countDocuments({ isActive: true }),
      this.clientModel.countDocuments({ isActive: false }),
      this.clientModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
    ]);

    return { total, active, inactive, thisMonth };
  }

  async create(createClientDto: CreateClientDto): Promise<ClientResponse> {
    const client = new this.clientModel({
      ...createClientDto,
      socialMedia: createClientDto.socialMedia ?? {},
      isActive: createClientDto.isActive ?? true,
    });
    const saved = await client.save();
    return toClientResponse(saved.toObject() as unknown as RawClient);
  }

  async update(
    id: string,
    updateClientDto: UpdateClientDto,
  ): Promise<ClientResponse> {
    const client = await this.clientModel
      .findByIdAndUpdate(id, { ...updateClientDto }, { new: true })
      .lean<RawClient>();

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return toClientResponse(client);
  }

  async delete(id: string): Promise<void> {
    const result = await this.clientModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Cliente no encontrado');
    }
  }
}
