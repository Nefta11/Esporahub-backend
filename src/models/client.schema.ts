import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClientDocument = Client & Document;

@Schema({ timestamps: true })
export class Client {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  position!: string;

  @Prop({ required: true })
  electionDate!: string;

  @Prop({ required: true })
  campaignStart!: string;

  @Prop()
  imageUrl?: string;

  @Prop()
  politicalParty?: string;

  @Prop()
  partyLogoUrl?: string;

  @Prop()
  color?: string;

  @Prop({
    type: Object,
    default: {},
  })
  socialMedia!: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };

  @Prop({ default: true })
  isActive!: boolean;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
ClientSchema.index({ name: 1 });
ClientSchema.index({ isActive: 1 });
ClientSchema.index({ createdAt: -1 });
