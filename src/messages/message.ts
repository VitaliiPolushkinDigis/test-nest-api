import { CreateMessageParams } from './../utils/types';
import { Message } from '../utils/typeorm';

export interface IMessageService {
  createMessage(params: CreateMessageParams): Promise<Message>;
  getMessagesByConversationId(conversationId: number): Promise<Message[]>;
}
