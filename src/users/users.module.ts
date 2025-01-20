import { Profile } from './../utils/typeorm/entities/Profile';
import { ProfileModule } from './../profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Services } from '../utils/types';
import { UserService } from './user.service';
import { Conversation, User } from '../utils/typeorm';
import { UsersController } from './users.controller';
import { ProfileService } from 'src/profile/profile.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Conversation]),
    ProfileModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
    {
      provide: Services.PROFILES,
      useClass: ProfileService,
    },
  ],
  exports: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
    TypeOrmModule,
  ],
})
export class UsersModule {}
