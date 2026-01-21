import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PresentationsController } from '../controllers/presentations.controller';
import { PresentationsService } from '../services/presentations.service';
import { Presentation, PresentationSchema } from '../models/presentation.schema';
import { UploadModule } from './upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Presentation.name, schema: PresentationSchema }]),
    UploadModule,
  ],
  controllers: [PresentationsController],
  providers: [PresentationsService],
  exports: [PresentationsService],
})
export class PresentationsModule {}
