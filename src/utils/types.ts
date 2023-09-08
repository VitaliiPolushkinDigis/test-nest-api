import { User } from './typeorm';
export enum Routes {
  AUTH = 'auth',
  USERS = 'users',
  CONVERSATIONS = 'conversations',
  MESSAGES = 'messages',
  PROFILES = 'profiles',
  COMMENTS = 'comments',
}

export enum Services {
  AUTH = 'AUTH_SERVICES',
  USERS = 'USERS_SERVICES',
  CONVERSATIONS = 'CONVERSATIONS',
  MESSAGES = 'MESSAGES_SERVICE',
  PROFILES = 'PROFILES_SERVICE',
  COMMENTS = 'COMMENTS_SERVICE',
}

export type CreateUserDetails = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  sex?: 'male' | 'female';
};

export type ValidateUserDetails = {
  email: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
}>;

export type UpdateUserDetails = Pick<
  CreateUserDetails,
  'firstName' | 'lastName'
> & { id: number };

export type Filter = {
  label: string;
  value: number | string;
};
export type Sort = {
  label: string;
  value: 'ASC' | 'DESC';
};

export type UserParams = {
  search?: string;
  filters?: Filter[];
  sort?: Sort[];
};

export type CreateConversationParams = {
  recipientId: number;
  message: string;
};

export type ConversationIdentityType = 'author' | 'recipient';

export type FindParticipantParams = Partial<{ id: number }>;

export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateParticipantParams = {
  id: number;
};

export type CreateMessageParams = {
  content: string;
  conversationId: number;
  user: User;
};

export type CreateCommentParams = {
  content: string;
  postId: number;
  commentId?: number;
};
