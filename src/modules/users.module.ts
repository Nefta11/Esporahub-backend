import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from '../services/users.service';
import { User, UserSchema } from '../models/user.schema';
import { UsersSeedService } from '../seeds/users.seed';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UsersSeedService],
  exports: [UsersService, MongooseModule],
})
export class UsersModule {}
