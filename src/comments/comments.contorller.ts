import { AuthenticatedGuard } from './../auth/utils/Guards';
import { Routes } from './../utils/constants';
import { ICommentService } from './comments';
import { Services, CreateCommentParams } from './../utils/types';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';

@ApiTags(Routes.COMMENTS)
@Controller(Routes.COMMENTS)
@UseGuards(AuthenticatedGuard)
export class CommentsController {
  constructor(
    @Inject(Services.COMMENTS)
    private readonly commentsService: ICommentService,
  ) {}

  @Post()
  async createComment(
    @AuthUser() user: User,
    @Body() createCommentParams: CreateCommentDto,
  ) {
    const comment = await this.commentsService.createComment(
      user,
      createCommentParams,
    );
    console.log('poist', comment);

    return comment;
  }

  @Get(':id')
  async getCommentByPostId(@Param('id') id: number) {
    const comments = await this.commentsService.getCommentByPostId(id);

    return comments;
  }
}
