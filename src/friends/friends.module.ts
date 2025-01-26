import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Services } from '../utils/constants';
import { User, Friendship } from '../utils/typeorm';
import { FriendsController } from './controllers/friends.controller';
import { FriendsService } from './services/friends.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Friendship])],
  controllers: [FriendsController],
  providers: [
    {
      provide: Services.FRIENDS_SERVICE,
      useClass: FriendsService,
    },
  ],
  exports: [
    {
      provide: Services.FRIENDS_SERVICE,
      useClass: FriendsService,
    },
  ],
})
export class FriendsModule {}
