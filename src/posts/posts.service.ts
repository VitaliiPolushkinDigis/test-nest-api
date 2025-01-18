import { Profile } from './../utils/typeorm/entities/Profile';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { IPostService } from './posts';
import { Comment, Post, User } from 'src/utils/typeorm';
import { CreatePostDto } from './dtos/create-post';
import { UpdatePostDto } from './dtos/update-post';

@Injectable()
export class PostsService implements IPostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}
  async createPost(user: User, createPostDto: CreatePostDto): Promise<Post> {
    const profile = await this.profileRepository.findOne(user.profileId);
    if (!profile.id) {
      throw new HttpException(
        'Cant find profile to create new post',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('--------------user', user);

    const defaultComment = this.commentRepository.create({
      content: 'This is the default comment during post creation!',
      author: user,
      parent: null,
    });

    console.log('defaultComment', defaultComment);

    const newPost = this.postRepository.create({
      title: createPostDto.title,
      subtitle: createPostDto.subtitle,
      description: createPostDto.description,
      comments: [defaultComment],
      likes: 0,
      imgUrl: createPostDto.imgUrl,
      views: 1,
      profile,
    });
    return this.postRepository.save(newPost);
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    const post = this.postRepository.findOne(id);
    if (!post) {
      throw new HttpException('', HttpStatus.BAD_REQUEST);
    }

    return this.postRepository.save({ id, ...updatePostDto });
  }

  findOne(id: number) {
    return this.postRepository.findOne(id);
  }

  findAll() {
    return this.postRepository.find();
  }

  async findAllProfilePosts(id: number) {
    return (
      this.postRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.comments', 'comments')
        /*  .leftJoinAndSelect('comments.children', 'children') */
        .leftJoinAndSelect('comments.author', 'author')
        .leftJoinAndSelect('comments.parent', 'parent')
        .leftJoin('post.profile', 'profile')
        .addSelect(['post'])
        /* .leftJoinAndSelect('post.profile', 'profile') */
        .where(`profile.id = ${id}`)
        .getMany()
    );
    /* return await this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.posts', 'post')
      .where('profile.id = :id', { id })
      .getOne(); */
  }

  remove(id: number) {
    const del = this.postRepository.delete({ id });
    console.log('---------------del', del);

    return del;
  }
}
