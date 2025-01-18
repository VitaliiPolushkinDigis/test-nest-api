import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post, Profile, Comment } from '../utils/typeorm';
import { PostsController } from './posts.controller';

import { Services } from 'src/utils/constants';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Profile, Comment])],
  controllers: [PostsController],
  providers: [
    {
      provide: Services.POST_SERVICE,
      useClass: PostsService,
    },
  ],
})
export class PostsModule {}
