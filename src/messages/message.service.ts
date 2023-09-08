import { CreateMessageParams } from './../utils/types';
import { IMessageService } from './message';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Message, Conversation, User } from '../utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class MessageService implements IMessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async createMessage({
    user,
    content,
    conversationId,
  }: CreateMessageParams): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient'],
    });

    if (!conversation)
      throw new HttpException('Convers not found!!!', HttpStatus.BAD_REQUEST);

    const { creator, recipient } = conversation;
    if (creator.id !== user.id && recipient.id !== user.id)
      throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
    });

    const savedMessage = await this.messageRepository.save(newMessage);
    conversation.lastMessageSent = savedMessage;
    await this.conversationRepository.save(conversation);
    return savedMessage;
  }

  getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['author'],
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' },
    });
  }

  updateMessage(id: number, content: string): Promise<any> {
    return this.messageRepository.save({ id, content });
    /*   .createQueryBuilder()
     .update(Message)
      .set({ content })
      .where('id = :id', { id })
      .execute(); */
  }
}
