import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../utils/decorators';
import { User } from '../utils/typeorm';
import { Routes, UpdateUserDetails, UserParams } from '../utils/types';
import { AuthenticatedGuard } from '../auth/utils/Guards';
import { Services } from '../utils/types';
import { IUserService } from './user';
import { instanceToPlain } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(Routes.USERS)
@Controller(Routes.USERS)
@UseGuards(AuthenticatedGuard)
export class UsersController {
  constructor(
    @Inject(Services.USERS)
    private readonly usersService: IUserService,
  ) {}

  // @Post()
  // async createConversation(
  //   @AuthUser() user: User,
  //   @Body() createConversationDto: CreateConversationDto,
  // ) {
  //   return this.conversationsService.createConversation(
  //     user,
  //     createConversationDto,
  //   );
  // }

  @Get()
  async getUsers(
    @AuthUser() { id }: User,
    @Body() { search }: { search?: string },
  ) {
    if (id) {
      return instanceToPlain(await this.usersService.searchUsers(search));
    }
  }

  @Get('search')
  async findUsers(@AuthUser() user: User, @Body() params: UserParams) {
    if (user.id) {
      return instanceToPlain(await this.usersService.findUsers(params));
    }
    return '';
  }

  @Patch()
  async updateUser(
    @AuthUser() user: User,
    @Body() { firstName, lastName }: UpdateUserDetails,
  ) {
    if (!user.id) {
      throw new HttpException(
        "Can't update others profile",
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.usersService.updateUser({ id: user.id, firstName, lastName });
  }
  // @Get()
  // async getConversations(@AuthUser() { id }: User) {
  //   return this.conversationsService.getConversations(id);
  // }

  // @Get(':id')
  // async getConversationById(@Param('id') id: number) {
  //   const conversation = await this.conversationsService.findConversationById(
  //     id,
  //   );
  //   return conversation;
  // }
}
