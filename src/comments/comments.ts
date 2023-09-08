import { User } from './../utils/typeorm/entities/User';
import { Comment } from 'src/utils/typeorm';
import { CreateCommentParams } from 'src/utils/types';
import { CreateCommentDto } from './dtos/create-comment.dto';

export interface ICommentService {
  createComment(user: User, params: CreateCommentDto): Promise<Comment>;
  getCommentByPostId(id: number): Promise<Comment[]>;
}
