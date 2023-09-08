import { instanceToPlain } from 'class-transformer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { User } from './../utils/typeorm/entities/User';
import { Comment, Post } from '../utils/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ICommentService } from './comments';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dtos/create-comment.dto';

export class CommentService implements ICommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post) private readonly postRepository: Repository<Post>,
  ) {}

  async createComment(user: User, params: CreateCommentDto): Promise<Comment> {
    const post = await this.postRepository.findOne(params.postId);
    let subComment = null;
    let parentComment: Comment | null = null;
    if (!post) {
      throw new HttpException('No post with given id', HttpStatus.BAD_REQUEST);
    }

    if (params.parentCommentId) {
      parentComment = await this.commentRepository.findOne(
        params.parentCommentId,
        {
          relations: ['children'],
        },
      );

      subComment = this.commentRepository.create({
        author: instanceToPlain(user),
        children: [],
        parent: instanceToPlain(parentComment),
        post,
        content: params.content,
      });

      /*    parentComment.children.push(subComment);

      const savedComment = await this.commentRepository.save(parentComment);
      if (!post.comments) {
        post.comments = [];
      }
      post.comments.push(savedComment);
      const upatedPost = await this.postRepository.save(post);
      console.log('upatedPost', upatedPost); */

      return this.commentRepository.save(subComment);
    } else {
      //new comment
      const comment = this.commentRepository.create({
        content: params.content,
        author: instanceToPlain(user),
        children: [],
        parent: null,
        post,
      });

      /*      const savedComment = await this.commentRepository.save(comment);
      if (!post.comments) {
        console.log('---here');

        post.comments = [];
      }
      post.comments = [...post.comments, savedComment];
      console.log('post', post);

      const upatedPost = await this.postRepository.save(post); */

      return this.commentRepository.save(comment);
    }
  }
  getCommentByPostId(id: number): Promise<Comment[]> {
    return this.commentRepository.find({
      relations: ['parent', 'children'],
    });
    /* return this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.children', 'children')
      .leftJoinAndSelect('comment.parent', 'parent')
      .leftJoin('comment.post', 'post')
      .addSelect(['post', 'comment'])
      .where(`post.id = ${id}`)
      .getMany(); */
  }
}
