import { Services } from './../utils/types';
import { Comment, Post } from './../utils/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentsController } from './comments.contorller';
import { CommentService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [CommentsController],
  providers: [
    {
      provide: Services.COMMENTS,
      useClass: CommentService,
    },
  ],
})
export class CommentsModule {}
