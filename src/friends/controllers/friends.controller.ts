import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Inject,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { Routes, Services } from '../../utils/constants';
import { AuthenticatedGuard } from '../../auth/utils/Guards';
import { CreateFriendDto } from '../dtos/create-friend.dto';
import { FriendsService } from '../services/friends.service';
import { FriendshipStatus } from '../../utils/typeorm/entities/Friendship';

@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS_SERVICE)
    private readonly friendsService: FriendsService,
  ) {}

  @Post('request')
  sendRequest(@Request() req, @Body() createFriendDto: CreateFriendDto) {
    return this.friendsService.sendRequest(req.user.id, createFriendDto);
  }

  @Get('requests')
  getFriendRequests(@Request() req) {
    return this.friendsService.getFriendRequests(req.user.id);
  }

  @Post('requests/:id/accept')
  acceptRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    console.log('---------requests/:id/accept');

    return this.friendsService.respondToRequest(
      req.user.id,
      id,
      FriendshipStatus.ACCEPTED,
    );
  }

  @Post('requests/:id/reject')
  rejectRequest(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.friendsService.respondToRequest(
      req.user.id,
      id,
      FriendshipStatus.REJECTED,
    );
  }

  @Get()
  getFriends(@Request() req) {
    return this.friendsService.getFriends(req.user.id);
  }

  @Delete(':id')
  removeFriend(@Request() req, @Param('id') id: string) {
    return this.friendsService.removeFriend(req.user.id, +id);
  }
}
