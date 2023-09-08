import { Post } from 'src/utils/typeorm';
import { DeleteResult } from 'typeorm';
import { CreatePostDto } from './dtos/create-post';
import { UpdatePostDto } from './dtos/update-post';
export interface IPostService {
  createPost: (
    profileId: number,
    createPostDto: CreatePostDto,
  ) => Promise<Post>;
  update: (id: number, updatePostDto: UpdatePostDto) => Promise<Post>;
  findOne: (id: number) => Promise<Post>;
  findAll: () => Promise<Post[]>;
  findAllProfilePosts: (id: number) => Promise<any>;
  remove: (id: number) => Promise<DeleteResult>;
}
