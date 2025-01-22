import { User } from 'src/utils/typeorm';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  UseGuards,
} from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { CreatePostDto } from './dtos/create-post';
import { UpdatePostDto } from './dtos/update-post';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from 'src/auth/utils/Guards';

@ApiTags(Routes.POSTS)
@Controller(Routes.POSTS)
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(
    @Inject(Services.POST_SERVICE) private readonly postsService: PostsService,
  ) {}

  @Post()
  create(@AuthUser() user: User, @Body() createPostDto: CreatePostDto) {
    return this.postsService.createPost(user, createPostDto);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Get('/profile/:id')
  findAllProfilePosts(@Param('id') id: string) {
    const req = this.postsService.findAllProfilePosts(+id);
    return req;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
