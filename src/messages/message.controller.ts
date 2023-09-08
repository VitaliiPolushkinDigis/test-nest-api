import { User } from '../utils/typeorm';
import { CreateMessageDto } from './dtos/CreateMessage.dto';
import { MessageService } from './message.service';
import { Routes, Services } from '../utils/types';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser } from '../utils/decorators';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateMessageDto } from './dtos/UpdateMessage.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';

@ApiTags(Routes.MESSAGES)
@Controller(Routes.MESSAGES)
@UseGuards(AuthenticatedGuard)
export class MessageController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: MessageService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const msg = await this.messageService.createMessage({
      ...createMessageDto,
      user,
    });
    this.eventEmitter.emit('message.create', msg);
    return;
  }

  @Patch()
  async updateMessage(
    @AuthUser() user: User,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    const msg = await this.messageService.updateMessage(
      updateMessageDto.messageId,
      updateMessageDto.content,
    );

    return msg;
  }

  @Get(':conversationId')
  async getMessagesFromConversation(
    @AuthUser() user: User,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const messages = await this.messageService.getMessagesByConversationId(
      conversationId,
    );

    return { id: conversationId, messages };
  }
}
