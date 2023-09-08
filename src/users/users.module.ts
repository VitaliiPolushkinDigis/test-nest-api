import { Profile } from './../utils/typeorm/entities/Profile';
import { ProfileModule } from './../profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { Services } from '../utils/types';
import { UserService } from './user.service';
import { User } from '../utils/typeorm';
import { UsersController } from './users.controller';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), ProfileModule],
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
  ],
})
export class UsersModule {}
