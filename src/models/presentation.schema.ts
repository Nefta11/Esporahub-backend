import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PresentationDocument = Presentation & Document;

@Schema({ _id: false })
export class FilminaItem {
  @Prop({ required: true })
  order!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  publicId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const FilminaItemSchema = SchemaFactory.createForClass(FilminaItem);

@Schema({ timestamps: true })
export class Presentation {
  @Prop({ required: true, unique: true, index: true })
  shareId!: string;

  @Prop({ required: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: [FilminaItemSchema], default: [] })
  filminas!: FilminaItem[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop()
  createdByName?: string;

  @Prop({ default: true })
  isPublic!: boolean;

  @Prop()
  password?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: 0 })
  viewCount!: number;

  @Prop()
  lastViewedAt?: Date;

  @Prop()
  clientId?: string;

  @Prop()
  clientName?: string;

  @Prop({ type: Object })
  settings?: {
    allowDownload?: boolean;
    showWatermark?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
  };
}

export const PresentationSchema = SchemaFactory.createForClass(Presentation);
PresentationSchema.index({ createdBy: 1 });
PresentationSchema.index({ createdAt: -1 });
PresentationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
